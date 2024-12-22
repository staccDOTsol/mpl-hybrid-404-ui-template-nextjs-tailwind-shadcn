"use client";

import { useEffect, useState } from "react";
import { Card } from "../ui/card";
import { DasApiAssetList } from "@metaplex-foundation/digital-asset-standard-api";
import fetchEscrowAssets from "@/lib/fetchEscrowAssets";
import NftGrid from "./nftGrid";
import CreateEscrow from "./createEscrow";
import { EscrowV1 } from "@metaplex-foundation/mpl-hybrid";
type props = {
  escrowAddress: string
  escrow: EscrowV1
}

const NftEscrow = (props: props) => {
  const [escrowAssets, setEscrowAssets] = useState<DasApiAssetList>();
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    console.log("Fetching Escrow Assets");
    fetchEscrowAssets(props.escrow)
      .then((escrowAssets) => {
        console.log({ escrowAssets });
        setEscrowAssets(escrowAssets);
        setIsFetching(false);
      })
      .catch((error) => {
        console.error(error);
        setIsFetching(false);
      });
  }, []);

  return (
    <Card className="flex flex-col flex-1 w-full p-8">
      <div className="text-xl">
        NFT Escrow <span className="font-light">({escrowAssets?.total})</span>
      </div>
      <div className="flex flex-1 flex-col justify-center w-full items-center">
        {escrowAssets?.items.length == 0 && (
          <div className="flex flex-1 flex-col justify-center w-full items-center">
            <div className="text-red-500">No NFTs found in escrow.</div>
          </div>
        )}
        {escrowAssets && <NftGrid assets={escrowAssets.items} />}
      </div>
    </Card>
  );
};

export default NftEscrow;
