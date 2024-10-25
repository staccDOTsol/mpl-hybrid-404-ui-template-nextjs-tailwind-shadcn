import { EscrowV1 } from "@metaplex-foundation/mpl-hybrid";
import { create } from "zustand";

interface EscrowState {
  escrow: EscrowV1 | undefined;
}

const useEscrowStore = create<EscrowState>()((set) => ({
  escrow: undefined,
}));

export default useEscrowStore;
