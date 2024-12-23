"use client";
import TokenImg from "@/assets/images/token.jpg";

import fetchAsset from "@/lib/das/fetchAsset";
import useEscrowStore from "@/store/useEscrowStore";
import useTokenStore from "@/store/useTokenStore";
import { useEffect, useState } from "react";
import { Card } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { TradeState } from "./swapWrapper";
import { set } from "@metaplex-foundation/umi/serializers";
import fetchUserTokenAccount from "@/lib/fetchUserTokenAccount";
import useUmiStore from "@/store/useUmiStore";
import { EscrowV1 } from "@metaplex-foundation/mpl-hybrid";
import { DasApiAsset } from "@metaplex-foundation/digital-asset-standard-api";
const   formatAmount = (amount: number, decimals: number) => {
  return (amount / 10 ** decimals).toFixed(decimals);
};
interface TokenCardProps {
  tradeState: TradeState;
  tokenAccount: string | undefined | null;
  escrow: EscrowV1;
  
}

const TokenCard = (props: TokenCardProps) => {
  const  escrow = props.escrow;

  const [tokenAsset, setTokenAsset] = useState<DasApiAsset | undefined>(undefined);
  useEffect(() => {
    fetchAsset(escrow.token).then((asset) => {
      setTokenAsset(asset);
    });
  }, [escrow]);
  const [loading, setLoading] = useState(true);
  const [decimals, setDecimals] = useState<any>(null);
  const { updateTokenAccount,  tokenAccount} = useTokenStore();
  const umiSigner = useUmiStore().signer;

  useEffect(() => {
    console.log(umiSigner);
    if (!umiSigner) {
      return;
    }
    console.log("fetching token account of user " + umiSigner.publicKey);
    fetchUserTokenAccount(props.tokenAccount)
      .then((account) => {
        updateTokenAccount(account);
      })
      .catch((e) => {
        if (
          e.message.includes(
            "The account of type [Token] was not found at the provided address"
          )
        ) {
          updateTokenAccount(null);
        }
      });
  }, [umiSigner, updateTokenAccount]);


  useEffect(() => {
    if (!tokenAsset && escrow?.token) {
      setLoading(true);
      fetchAsset(escrow.token).then((asset) => {
        console.log(asset)
        // @ts-ignore
        setDecimals(asset.token_info?.decimals);
      });
    } else {
      setLoading(false);
    }
  }, [escrow, tokenAsset]);

  return (
    <Card className="flex items-center w-full border border-foreground-muted rounded-xl shadow-lg p-4 gap-4">
      {tokenAsset ? (
        <img
          src={TokenImg.src}
          className="rounded-xl w-24 aspect-square"
          alt="nft collection image"
        />
      ) : (
        <Skeleton className="w-24 h-24 rounded-xl" />
      )}
      {escrow && !loading ? (
        <div className="flex flex-col">
          <div className="text-lg font-medium">
            {(Number(escrow.amount) / 10 ** (decimals || 9)).toFixed(decimals ||9 )}{" "}
            {tokenAsset?.content.metadata.name}
          </div>
        </div>
      ) : (
        <Skeleton className=" w-[250px] h-8" />
      )}
    </Card>
  );
};

export default TokenCard;
