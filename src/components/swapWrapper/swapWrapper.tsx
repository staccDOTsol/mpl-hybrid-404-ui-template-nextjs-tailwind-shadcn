"use client";

import { toast } from "@/hooks/use-toast";
import Spinner from "@/icons/spinner";
import fetchEscrow from "@/lib/mpl-hybrid/fetchEscrow";
import swap from "@/lib/mpl-hybrid/swap";
import useEscrowStore from "@/store/useEscrowStore";
import { ArrowsUpDownIcon } from "@heroicons/react/24/outline";
import { DasApiAsset } from "@metaplex-foundation/digital-asset-standard-api";
import { useEffect, useState } from "react";
import TokenBalance from "../tokenBalance";
import { Button } from "../ui/button";
import NftCard from "./nftCard";
import TokenCard from "./tokenCard";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import useTokenStore from "@/store/useTokenStore";
import { publicKey } from "@metaplex-foundation/umi";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { EscrowV1 } from "@metaplex-foundation/mpl-hybrid";

export enum TradeState {
  "nft",
  "tokens",
}
type props = {
  escrowAddress: string,
  tokenMint: string,
  escrow: EscrowV1, 
}
const SwapWrapper = ({ escrowAddress,  escrow }: props) => {
  const { token: tokenMint } = escrow;
  const [tradeState, setTradeState] = useState<TradeState>(TradeState.nft);
  const [selectedAsset, setSelectedAsset] = useState<DasApiAsset>();
  const [isTransacting, setIsTransacting] = useState(false);
  const wallet = useAnchorWallet();
  const connection = new Connection(process.env.NEXT_PUBLIC_RPC!);
  const handleSwap = async () => {
    setIsTransacting(true);
    console.log("Swapping", tradeState, selectedAsset);
    if (tradeState === TradeState.nft) {
      if (!selectedAsset) {
        toast({
          title: "No NFT selected",
          description: "Please select an NFT to swap",
          variant: "destructive",
        });
        setIsTransacting(false);
        return;
      }
    } else {
      if (escrow?.path === 0 && !selectedAsset) {
        toast({
          title: "No NFT selected",
          description: "Please select an NFT to receive",
          variant: "destructive",
        });
        return;
      }
    }
    if (!wallet) {
      toast({
        title: "No wallet connected",
        description: "Please connect your wallet",
        variant: "destructive",
      });
      return;
    }
    swap({ swapOption: tradeState, selectedNft: selectedAsset, wallet: wallet, connection: connection })
      .then(() => {
        toast({
          title: "Swap Successful",
          description: "Your swap was successful",
        });
        setIsTransacting(false);
        setSelectedAsset(undefined);
      })
      .catch((error) => {
        toast({
          title: "Swap Error",
          description: error,
          variant: "destructive",
        });
      });
  };

  useEffect(() => {
  if (!wallet) return;  
    // Fetch/Refresh Escrow
    fetchEscrow(escrowAddress)
      .then((escrowData) => {
        useEscrowStore.setState({ escrow: escrowData });
      })
      .catch((error) =>
        toast({ title: "Escrow Error", description: error.message })
      );
  }, []);
  if (!escrow) return;
  return (
    <div className="flex flex-col gap-8 items-center max-w-[600px] w-full">
      <TokenBalance tokenAccount={tokenMint} />
      {/* {tradeState === "tokens" ? <SwapTokens setTradeState={tradeState => setTradeState(tradeState)} /> : <SwapNft setTradeState={tradeState => setTradeState(tradeState)} />} */}

      {tradeState === TradeState.nft ? (
        <NftCard
          escrow={escrow}
          tradeState={tradeState}
          setSelectedAsset={(asset) => setSelectedAsset(asset)}
          selectedAsset={selectedAsset}
        />
      ) : (
        <TokenCard tradeState={tradeState} tokenAccount={tokenMint} escrow={escrow} />
      )}

      <ArrowsUpDownIcon
        className="cursor-pointer w-12 h-12 text-foreground mx-auto block"
        onClick={() => {
          if (tradeState === TradeState.nft) setTradeState(TradeState.tokens);
          else setTradeState(TradeState.nft);
          setSelectedAsset(undefined);
        }}
      />

      {tradeState === TradeState.nft ? (
        <TokenCard tradeState={tradeState} tokenAccount={tokenMint} escrow={escrow} />
      ) : (
        <NftCard
          tradeState={tradeState}
          setSelectedAsset={setSelectedAsset}
          selectedAsset={selectedAsset}
          escrow={escrow}
        />
      )}

      <Button
        onClick={handleSwap}
        disabled={isTransacting}
        className="w-[200px]"
      >
        {isTransacting ? <Spinner className="h-4 w-4" /> : "Swap"}
      </Button>
    </div>
  );
};

export default SwapWrapper;
