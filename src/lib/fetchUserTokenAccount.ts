import useUmiStore from "@/store/useUmiStore";
import fetchTokenBalance from "./fetchTokenBalance";
import { Token } from "@metaplex-foundation/mpl-toolbox";
import { PublicKey } from "@solana/web3.js";

const fetchUserTokenAccount = async (tokenAccount: string | undefined | null) => {
  if (!tokenAccount) {
    return null;
  }
  const tokenAddress = new PublicKey(tokenAccount);

  if (!tokenAddress) {
    throw new Error("Token address is not provided");
  }

  const user = useUmiStore.getState().signer;

  if (!user) {
    throw new Error("User is not signed in");
  }

  return await fetchTokenBalance(tokenAddress.toString(), user?.publicKey);
};

export default fetchUserTokenAccount;
