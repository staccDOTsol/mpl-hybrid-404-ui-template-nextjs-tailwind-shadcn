"use client";

import { toast } from "@/hooks/use-toast";
import fetchEscrow from "@/lib/mpl-hybrid/fetchEscrow";
import useEscrowStore from "@/store/useEscrowStore";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import SwapNft from "./swapNft";
import SwapTokens from "./swapTokens";
import TokenBalance from "../tokenBalance";

const SwapWrapper = () => {
  const [swapping, setSwapping] = useState<"nft" | "tokens">();

  useEffect(() => {
    // Fetch/Refresh Escrow
    fetchEscrow()
      .then((escrowData) => {
        useEscrowStore.setState({ escrow: escrowData });
      })
      .catch((error) =>
        toast({ title: "Escrow Error", description: error.message })
      );

      // Fetch/Refresh User Balance
      
  }, []);

  return (
    <div className="flex flex-col gap-8 items-center w-full">
      <TokenBalance />
      {swapping === "tokens" ? <SwapTokens /> : <SwapNft />}
      <Button
        onClick={() =>
          swapping === "tokens" ? setSwapping("nft") : setSwapping("tokens")
        }
        className="max-w-[200px] w-full"
      >
        Switch Trade
      </Button>
      
    </div>
  );
};

export default SwapWrapper;
