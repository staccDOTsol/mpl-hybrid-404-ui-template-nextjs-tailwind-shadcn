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
const   formatAmount = (amount: number, decimals: number) => {
  return (amount / 10 ** decimals).toFixed(decimals);
};
interface TokenCardProps {
  tradeState: TradeState;
}

const TokenCard = (props: TokenCardProps) => {
  const { escrow } = useEscrowStore();
  const { tokenAsset, updateTokenAsset } = useTokenStore();
  const [loading, setLoading] = useState(true);
  const [decimals, setDecimals] = useState<any>(null);
  
  useEffect(() => {
    if (!tokenAsset && escrow?.token) {
      setLoading(true);
      fetchAsset(escrow.token).then((asset) => {
        updateTokenAsset(asset);
        console.log(asset)
        // @ts-ignore
        setDecimals(asset.token_info?.decimals);
      });
    } else {
      setLoading(false);
    }
  }, [escrow, tokenAsset, updateTokenAsset]);

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
            {formatAmount(Number(escrow.amount), decimals)}{" "}
          {tokenAsset?.content.metadata.name}
        </div>
      ) : (
        <Skeleton className=" w-[250px] h-8" />
      )}
    </Card>
  );
};

export default TokenCard;
