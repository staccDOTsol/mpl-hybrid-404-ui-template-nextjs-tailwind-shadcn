"use client";

import CollectionImg from "@/assets/images/collectionImage.jpg";
import TokenImg from "@/assets/images/token.png";
import useEscrowStore from "@/store/useEscrowStore";
import {
  ArrowsRightLeftIcon,
  ArrowsUpDownIcon,
} from "@heroicons/react/24/outline";
import { DasApiAsset } from "@metaplex-foundation/digital-asset-standard-api";
import { useEffect, useState } from "react";
import NftPicker from "../nftPicker";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { toast } from "@/hooks/use-toast";
import swap, { SwapOptions } from "@/lib/mpl-hybrid/swap";

const SwapTokens = () => {
  const [selectedAsset, setSelectedAsset] = useState<DasApiAsset>();

  const escrow = useEscrowStore().escrow;

  const handleSwap = () => {
    if (escrow?.path === 0 && !selectedAsset) {
      toast({
        title: "No NFT selected",
        description: "Please select an NFT to receive",
        variant: "destructive",
      });
      return;
    }

    swap({ swapOption: SwapOptions.Token, selectedNft: selectedAsset }).catch(
      (e) => {
        toast({
          title: "Swap Error",
          description: e.message,
          variant: "destructive",
        });
      }
    );
  };

  return (
    <div
      className="flex flex-col lg:flex-row gap-8 w-full max-w-[300px] lg:max-w-[900px] 
    "
    >
      <Card className="flex flex-col aspect-square w-full border border-foreground-muted rounded-xl shadow-lg p-4 gap-4">
        <div className="w-full aspect-square">
          <img
            src={TokenImg.src}
            className="rounded-xl w-full"
            alt="token image"
          />
        </div>
        {escrow ? (
          <div className="w-full text-center">
            {Number(escrow.amount).toLocaleString()} AIRT Coin
          </div>
        ) : (
          <Skeleton className="w-full h-8" />
        )}
        <Button onClick={handleSwap}>Swap</Button>
      </Card>
      <div className="flex items-center justify-center w-full lg:w-1/2">
        <ArrowsRightLeftIcon className="w-12 h-12 text-foreground mx-auto my-8 hidden lg:block" />
        <ArrowsUpDownIcon className="w-12 h-12 text-foreground mx-auto my-8 block lg:hidden" />
      </div>
      <Card className="flex flex-col aspect-square w-full border border-foreground-muted rounded-xl shadow-lg p-4 gap-4">
        <div className="w-full aspect-square">
          {escrow && escrow.path === 0 ? (
            <NftPicker
              wallet={"escrow"}
              selectedNft={(selectedNft) => {
                setSelectedAsset(selectedNft);
                console.log(selectedNft);
              }}
            >
              <img
                src={
                  selectedAsset && selectedAsset.content.links
                    ? (
                        selectedAsset.content.links as unknown as {
                          image: string;
                        }
                      ).image
                    : CollectionImg.src
                }
                className="rounded-xl w-full"
                alt="nft collection image"
              />
            </NftPicker>
          ) : (
            <img
              src={CollectionImg.src}
              className="rounded-xl w-full"
              alt="token image"
            />
          )}
        </div>
        <div className="text-center">
          {selectedAsset
            ? selectedAsset.content.metadata.name
            : escrow && escrow.path === 0
            ? "Pick NFT From Escrow"
            : "Receive Random NFT"}
        </div>
      </Card>
    </div>
  );
};

export default SwapTokens;
