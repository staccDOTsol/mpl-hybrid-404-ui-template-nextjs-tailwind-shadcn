"use client";

import fetchUserTokenAccount from "@/lib/fetchUserTokenAccount";
import useTokenStore from "@/store/useTokenStore";
import useUmiStore from "@/store/useUmiStore";
import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";
  import TokenImage from "@/assets/images/token.jpg";
import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
type props = {  
  tokenAccount: string | undefined | null
}
const TokenBalance = (props: props) => {
  const{tokenAccount} = props;
  const umiSigner = useUmiStore().signer;
const anchorWallet = useAnchorWallet(); 
const [amount, setAmount] = useState(0);
  useEffect(() => {
    console.log(umiSigner);
    if (!umiSigner) {
      return;
    }
    try {
   const connection = new Connection(process.env.NEXT_PUBLIC_RPC!);
   connection.getTokenAccountBalance(
getAssociatedTokenAddressSync(new PublicKey(props.tokenAccount!), anchorWallet!.publicKey)

   ).then((balance) => {
    setAmount(Number(balance.value.uiAmount ?? 0));
    })
  } catch (e) {
    setAmount(0)
    console.log(e);
  }
  }, [umiSigner]);

  return (
    <div className="flex gap-4 items-center">
      <img
        src={TokenImage.src}
        className="aspect-square w-8 h-8 rounded-full"
        alt="token image"
      />
        <div className="w-full text-center">
          {tokenAccount === null
            ? "0"
            : "Balance: " + Number(amount).toLocaleString()}
        </div>
    </div>
  );
};

export default TokenBalance;
