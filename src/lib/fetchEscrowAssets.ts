import searchAssets from "./das/searchAssets";
import { EscrowV1 } from "@metaplex-foundation/mpl-hybrid";

const fetchEscrowAssets = async (escrow: EscrowV1) => {
 

  return await searchAssets({
    owner: escrow.publicKey,
    collection: escrow.collection,
    burnt: false,
  }, escrow.collection.toString());
};

export default fetchEscrowAssets;
