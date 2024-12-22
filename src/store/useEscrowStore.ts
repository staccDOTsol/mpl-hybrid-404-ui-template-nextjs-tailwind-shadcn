import { EscrowV1 } from "@metaplex-foundation/mpl-hybrid";
import { create } from "zustand";

interface EscrowState {
  escrow: EscrowV1 | undefined;
  setEscrow: (escrow: EscrowV1) => void;
}

const useEscrowStore = create<EscrowState>()((set) => ({
  escrow: undefined,
  setEscrow: (escrow) => set({ escrow }),
}));

export default useEscrowStore;
