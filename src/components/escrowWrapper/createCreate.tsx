"use client";

import { toast } from "@/hooks/use-toast";
import fetchEscrow from "@/lib/mpl-hybrid/fetchEscrow";
import useEscrowStore from "@/store/useEscrowStore";
import { useEffect } from "react";
import { Card } from "../ui/card";
import EscrowSettings from "./escowSettings";
import NftEscrow from "./nftEscrowSummary";
import TokenEscrowSummary from "./tokenEscrowSummary";
import CreateEscrow from "./createEscrow";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";

const CreateCreate = () => {
    const wallet  = useAnchorWallet();
    const connection = new Connection("https://rpc.ironforge.network/mainnet?apiKey=01HRZ9G6Z2A19FY8PR4RF4J4PW" , "confirmed");



  return (
    <div className="flex flex-col gap-8 items-center w-full max-w-[1024px] justify-center flex-1 p-8 lg:p-0">
     
      <CreateEscrow  wallet={wallet} connection={connection}/>
    </div>
  );
};

export default CreateCreate;
