"use client";

import {
  ArrowsRightLeftIcon,
  ArrowsUpDownIcon,
} from "@heroicons/react/24/outline";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import CollectionImg from "@/assets/images/collectionImage.jpg";
import TokenImg from "@/assets/images/token.png";
import { useEffect, useState } from "react";
import { DasApiAsset } from "@metaplex-foundation/digital-asset-standard-api";
import NftPicker from "../nftPicker";
import useEscrowStore from "@/store/useEscrowStore";
import { Skeleton } from "../ui/skeleton";
import swap, { SwapOptions } from "@/lib/mpl-hybrid/swap";
import { toast } from "@/hooks/use-toast";

const SwapNft = () => {
  const [selectedAsset, setSelectedAsset] = useState<DasApiAsset>();

  const escrow = useEscrowStore().escrow;

  const handleSwap = () => {
    if (!selectedAsset) {
      toast({
        title: "No NFT selected",
        description: "Please select an NFT to swap",
        variant: "destructive",
      });
      return;
    }
    swap({ swapOption: SwapOptions.NFT, selectedNft: selectedAsset }).catch(
      (e) => {
        toast({
          title: "Swap Error",
          description: e.message,
          variant: "destructive",
        });
      }
    );
  };

  useEffect(() => {
    console.log({ selectedAsset });
  }, [selectedAsset]);

  return (
    <div
      className="flex flex-col lg:flex-row gap-8 w-full max-w-[300px] lg:max-w-[900px] 
    "
    >
      <Card className="flex flex-col aspect-square w-full border border-foreground-muted rounded-xl shadow-lg p-4 gap-4">
        <div className="w-full aspect-square">
          <NftPicker
            wallet={"user"}
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
        </div>
        <div className="text-center">
          {selectedAsset ? selectedAsset.content.metadata.name : "Select NFT"}
        </div>
        <Button onClick={handleSwap}>Swap</Button>
      </Card>
      <div className="flex items-center justify-center w-full lg:w-1/2">
        <ArrowsRightLeftIcon className="w-12 h-12 text-foreground mx-auto my-8 hidden lg:block" />
        <ArrowsUpDownIcon className="w-12 h-12 text-foreground mx-auto my-8 block lg:hidden" />
      </div>
      <Card className="flex flex-col aspect-square w-full border border-foreground-muted rounded-xl shadow-lg p-4 gap-4">
        <div className="w-full aspect-square">
          <img
            src={TokenImg.src}
            className="rounded-xl w-full aspect-square"
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
      </Card>
    </div>
  );
};

export default SwapNft;
