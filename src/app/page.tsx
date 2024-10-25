import Header from "@/components/header";
import SwapWrapper from "@/components/swapWrapper/swapWrapper";

export default function Home() {
  return (
    <main className="flex flex-col flex-1 items-center p-8 gap-4 w-full">
      <div className="flex flex-1 h-full items-center justify-center w-full">
        <SwapWrapper />
      </div>
    </main>
  );
}
