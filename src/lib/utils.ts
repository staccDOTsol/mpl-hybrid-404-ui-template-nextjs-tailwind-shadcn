import { publicKey } from "@metaplex-foundation/umi";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const shortenAddress = (address: string, chars = 4) => {
  return address.slice(0, chars) + "..." + address.slice(-chars);
};

export const isValidPublicKey = (key: string) => {
  console.log("validating key", key);
  try {
    publicKey(key);
  } catch (error) {
    return false;
  }
  return true;
};
