import useUmiStore from "@/store/useUmiStore";
import {
  fetchToken,
  findAssociatedTokenPda,
} from "@metaplex-foundation/mpl-toolbox";
import { publicKey } from "@metaplex-foundation/umi";

const fetchEscrowTokenBalance = async (
  escrowAddress: string,
  tokenMint: string
) => {
  
  const umi = useUmiStore.getState().umi;

  const escrowTokenAccountPda = findAssociatedTokenPda(umi, {
    mint: publicKey(tokenMint),
    owner: publicKey(escrowAddress),
  });

  return await fetchToken(umi, escrowTokenAccountPda);
};

export default fetchEscrowTokenBalance;
