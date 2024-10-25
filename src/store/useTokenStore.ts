import { Token } from "@metaplex-foundation/mpl-toolbox";
import { create } from "zustand";

interface TokenState {
  tokenAccount: Token | undefined | null;
  updateTokenAccount: (tokenAccount: Token | null) => void;
}

const useTokenStore = create<TokenState>()((set) => ({
  tokenAccount: undefined,
  updateTokenAccount: (tokenAccount: Token | null) => set({ tokenAccount }),
}));

export default useTokenStore;
