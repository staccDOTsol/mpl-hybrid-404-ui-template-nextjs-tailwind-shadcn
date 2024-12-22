import EscrowWrapper from "@/components/escrowWrapper/escrowWrapper";
interface props {
  escrowAddress: string;
}
export default function Escrow({ escrowAddress }: props) {
  return (
    <main className="flex flex-col flex-1 items-center gap-4 w-full">
      <div className="flex flex-1 justify-center w-full pb-8">
        <EscrowWrapper  escrowAddress={escrowAddress}/>
      </div>
    </main>
  );
}
