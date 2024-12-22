import {
    DasApiAsset
} from "@metaplex-foundation/digital-asset-standard-api";
import { Card } from "../ui/card";

const NftGrid = ({ assets }: { assets: DasApiAsset[] }) => {

  const assetList = assets
    .sort((a, b) =>
      a.content.metadata.name.localeCompare(
        b.content.metadata.name,
        undefined,
        { numeric: true }
      )
    )
    .map((asset) => {
      console.log(asset)
      // @ts-ignore
      const image = asset.content.files?.[0]?.uri || 
        // @ts-ignore
                   asset.content.json?.image ||
                   asset.content.metadata?.image ||
                   // @ts-ignore
                   asset.content.links?.image ||
                   "fallback.png";

      return (
        <Card key={asset.id} className="p-2 flex flex-col gap-4">
          <img
            src={image}
            alt={asset.content.metadata.name}
            className="rounded-lg w-full aspect-square"
          />
          <div className="col-span-3">
            <p className="">{asset.content.metadata.name}</p>
          </div>
        </Card>
      );
    });

  return (
    <div className="grid grid-cols-5 gap-4 overflow-auto p-2">{assetList}</div>
  );
};

export default NftGrid;
