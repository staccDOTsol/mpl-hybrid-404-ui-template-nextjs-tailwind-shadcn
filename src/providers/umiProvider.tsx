"use client";

import useUmiStore from "@/store/useUmiStore";
import { WalletAdapter } from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react";

import { useEffect } from "react";

function UmiProvider({ children }: { children: any }) {
  const wallet = useWallet();
  const { updateSigner } = useUmiStore();

  useEffect(() => {
    if (!wallet.publicKey) return;
    // When wallet.publicKey changes, update the signer in umiStore with the new wallet adapter.
    updateSigner(wallet as unknown as WalletAdapter);
  }, [wallet, updateSigner]);

  return <>{children}</>;
}

export { UmiProvider };
