import { DasApiAsset } from "@metaplex-foundation/digital-asset-standard-api";
import useUmiStore from "@/store/useUmiStore";
import { publicKey } from "@metaplex-foundation/umi";

const fetchAsset = async (assetId: string): Promise<DasApiAsset> => {
  const umi = useUmiStore.getState().umi;

  //@ts-ignore
  return await umi.rpc.getAsset(publicKey(assetId));
};

export default fetchAsset;
