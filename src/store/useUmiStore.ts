import { dasApi } from "@metaplex-foundation/digital-asset-standard-api";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import {
  Signer,
  Umi,
  createNoopSigner,
  publicKey,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { createSignerFromWalletAdapter } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { WalletAdapter } from "@solana/wallet-adapter-base";
import { create } from "zustand";

interface UmiState {
  umi: Umi;
  signer: Signer | undefined;
  updateSigner: (signer: WalletAdapter) => void;
}

const useUmiStore = create<UmiState>()((set) => ({
  umi: createUmi(process.env.NEXT_PUBLIC_RPC!)
    .use(
      signerIdentity(
        createNoopSigner(publicKey("11111111111111111111111111111111"))
      )
    )
    .use(dasApi())
    .use(mplTokenMetadata()),
  signer: undefined,
  updateSigner: (signer) => {
    set(() => ({ signer: createSignerFromWalletAdapter(signer) }));
  },
}));

export default useUmiStore;
