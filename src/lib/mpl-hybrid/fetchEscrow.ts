import useUmiStore from "@/store/useUmiStore";
import { fetchEscrowV1 } from "@metaplex-foundation/mpl-hybrid";
import { publicKey } from "@metaplex-foundation/umi";

const fetchEscrow = (escrowAddress: string) => {
  const umi = useUmiStore.getState().umi;


  return fetchEscrowV1(umi, publicKey(escrowAddress));
};

export default fetchEscrow;
