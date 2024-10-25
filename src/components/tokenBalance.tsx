"use client";

import fetchUserTokenAccount from "@/lib/fetchUserTokenAccount";
import useTokenStore from "@/store/useTokenStore";
import useUmiStore from "@/store/useUmiStore";
import { useEffect } from "react";
import { Skeleton } from "./ui/skeleton";
import TokenImage from "@/assets/images/token.png";

const TokenBalance = () => {
  const umiSigner = useUmiStore().signer;
  const tokenStore = useTokenStore();

  useEffect(() => {
    console.log(umiSigner);
    if (!umiSigner) {
      return;
    }
    console.log("fetching token account of user " + umiSigner.publicKey);
    fetchUserTokenAccount()
      .then((account) => {
        tokenStore.updateTokenAccount(account);
      })
      .catch((e) => {
        if (
          e.message.includes(
            "The account of type [Token] was not found at the provided address"
          )
        ) {
          tokenStore.updateTokenAccount(null);
        }
      });
  }, [umiSigner]);

  return (
    <div className="flex gap-4 items-center">
      <img
        src={TokenImage.src}
        className="aspect-square w-8 h-8 rounded-full"
        alt="token image"
      />
      {tokenStore.tokenAccount || tokenStore.tokenAccount === null ? (
        <div className="w-full text-center">
          {tokenStore.tokenAccount === null
            ? "0"
            : Number(tokenStore.tokenAccount.amount).toLocaleString()}
        </div>
      ) : (
        <Skeleton className="w-full min-w-[150px] h-8" />
      )}
    </div>
  );
};

export default TokenBalance;
