import { DasApiAsset } from "@metaplex-foundation/digital-asset-standard-api";
import { Token } from "@metaplex-foundation/mpl-toolbox";
import { create } from "zustand";

interface TokenState {
  tokenAccount: Token | undefined | null;
  updateTokenAccount: (tokenAccount: Token | null) => void;
  tokenAsset: DasApiAsset | undefined | null;
  updateTokenAsset: (tokenAsset: DasApiAsset) => void;
}

const useTokenStore = create<TokenState>()((set) => ({
  tokenAccount: undefined,
  updateTokenAccount: (tokenAccount: Token | null) => set({ tokenAccount }),
  tokenAsset: undefined,
  updateTokenAsset: (tokenAsset: DasApiAsset) => set({ tokenAsset }),
}));

export default useTokenStore;
