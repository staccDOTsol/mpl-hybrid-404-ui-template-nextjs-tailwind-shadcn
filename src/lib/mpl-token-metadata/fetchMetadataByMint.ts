import useUmiStore from "@/store/useUmiStore";
import {
  fetchJsonMetadata,
  fetchMetadataFromSeeds,
  Metadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { publicKey } from "@metaplex-foundation/umi";

const fetchMetadataByMint = async (mint: string) => {
  const umi = useUmiStore.getState().umi;

  const metadata = await fetchMetadataFromSeeds(umi, { mint: publicKey(mint) });

  const JsonMetadata = await fetchJsonMetadata(umi, metadata.uri);

  return {
    ...metadata,
    ...JsonMetadata,
  };
};

export default fetchMetadataByMint;
