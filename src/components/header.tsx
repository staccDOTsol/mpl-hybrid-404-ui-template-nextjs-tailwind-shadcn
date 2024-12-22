"use client";

import dynamic from "next/dynamic";
import ThemeSwitcher from "./themeSwitcher";
import MetaplexLogo from "@/assets/logos/metaplex-logo.png";
import Link from "next/link";

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

const Header = () => {
  return (
    <div className="z-10 flex flex-col lg:flex-row w-full max-w-5xl items-center justify-center lg:justify-between font-mono text-sm lg:flex">
      <div className="max-h-14 max-w-[300px] flex w-full items-center justify-center border-b bg-background pb-6 pt-8 backdrop-blur-2xl lg:static lg:w-auto  lg:rounded-xl lg:border lg:p-4">
        <div
          className="relative z-[-1] flex place-items-center h-8"
          style={{ filter: "invert(var(--invert-value))" }}
        >
          <img className="h-8" src={MetaplexLogo.src} alt="<Metaplex Logo" />
          <div className="text-muted-foreground">Hybrid 404</div>
        </div>
      </div>
      <div className="flex pt-4 lg:pt-0 w-full items-end justify-center gap-4 lg:static lg:size-auto lg:bg-none"> 
        <Link href="/">Home</Link>
        <Link href="/create">Create</Link>
      </div>
      <div className="flex pt-4 lg:pt-0 w-full items-end justify-center gap-4 lg:static lg:size-auto lg:bg-none">
        <WalletMultiButtonDynamic />
        <ThemeSwitcher />
      </div>
    </div>
  );
};

export default Header;
