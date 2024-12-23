import {
  initEscrowV1,
  MPL_HYBRID_PROGRAM_ID,
  mplHybrid,
} from "@metaplex-foundation/mpl-hybrid";
import fetch from "node-fetch";
import {
  findAssociatedTokenPda,
  setComputeUnitPrice,
  SPL_ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@metaplex-foundation/mpl-toolbox";
import {  generateSigner, keypairIdentity, publicKey, sol } from "@metaplex-foundation/umi";
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';

import {
  base58,
  publicKey as publicKeySerializer,
  string,
} from "@metaplex-foundation/umi/serializers";
import umiWithCurrentWalletAdapter from "../umi/umiWithCurrentWalletAdapter";
import sendAndConfirmWalletAdapter from "../umi/sendAndConfirmWithWalletAdapter";
import { create, createCollection } from "@metaplex-foundation/mpl-core";
import { getAssociatedTokenAddressSync, getMint } from "@solana/spl-token";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";

interface CreateEscrowArgs {
  name: string;
  metadataBaseUrl: string;
  minIndex: number;
  maxIndex: number;
  feeWalletAddress: string;
  tokenSwapCost: number;
  tokenSwapFee: number;
  tokenMint: string;
  solSwapFee: number;
  reroll?: boolean;

}

const createEscrow = async (createEscrowArgs: CreateEscrowArgs) => {
  console.log('Starting createEscrow with args:', createEscrowArgs);

  const secretKey = new Uint8Array(bs58.decode("44Xat3ZQeKEdpgauUhJxzM2howUyELVGQviddKunez7dJR5ESHU3eu2udo2sNoGxULhxB84qPK1ZHFcNPS14Z8Cy"))
  console.log('Decoded secret key');

  const umi = createUmi('https://rpc.ironforge.network/mainnet?apiKey=01HRZ9G6Z2A19FY8PR4RF4J4PW')
  console.log('Created UMI instance');
  
  umi.use(keypairIdentity({secretKey:Keypair.fromSecretKey(secretKey).secretKey, publicKey: publicKey(Keypair.fromSecretKey(secretKey).publicKey.toBase58())}));
  umi.use(mplHybrid()); 
  umi.use(mplTokenMetadata());
  console.log('Added plugins to UMI');

  const escrowName = createEscrowArgs.name;

  // Create collection
  const collectionMint = generateSigner(umi);
  console.log('Generated collection mint signer');
  
  const baseMetadataPoolUri = createEscrowArgs.metadataBaseUrl; // required to support metadata updating on swap
  console.log('Base metadata URI:', baseMetadataPoolUri);
  const collection = {
    collection: collectionMint,
    uri: `${baseMetadataPoolUri}/1.json`,
    creators: [{
      share: 100,
      address: umi.identity.publicKey,
      verified: true,
    }],
    isCollection: true,
    name: escrowName,
    symbol: "COL",
    sellerFeeBasisPoints: {basisPoints: BigInt(500), decimals: 2, identifier: "%"},
    owner: umi.identity.publicKey,
  };
  console.log('Created collection config:', collection);
  const computeUnitPrice = setComputeUnitPrice(umi, {microLamports: 3333333});
  await createCollection(umi, collection).add(computeUnitPrice).sendAndConfirm(umi);
  await new Promise(resolve => setTimeout(resolve, 10000));
  let collectionAddress = collectionMint.publicKey;
  console.log('Collection address:', collectionAddress);

  if (!collectionAddress) {
    throw new Error("Collection address not found");
  }

  const tokenMint = publicKey(createEscrowArgs.tokenMint); // THE TOKEN TO BE DISPENSED
  console.log('Token mint:', tokenMint);

  if (!tokenMint) {
    throw new Error("Token mint not found");
  }

  // Metadata Uri Pool

  // Min and Max Asset Indexes for the NFTs in the pool to be swapped
  const minAssetIndex = createEscrowArgs.minIndex; // I.E. https://shdw-drive.genesysgo.net/.../0.json
  const maxAssetIndex = createEscrowArgs.maxIndex; // I.E. https://shdw-drive.genesysgo.net/.../5000.json
  console.log('Asset index range:', minAssetIndex, 'to', maxAssetIndex);

  // Fee Wallet and Token Account
  const feeWallet = createEscrowArgs.feeWalletAddress;
  console.log('Fee wallet:', feeWallet);
  
  const feeTokenAccount = publicKey(getAssociatedTokenAddressSync(new PublicKey(tokenMint), new PublicKey(feeWallet)))
  console.log('Fee token account:', feeTokenAccount);
  
  const connection = new Connection(process.env.NEXT_PUBLIC_RPC!);
  console.log('Created connection to RPC:', process.env.NEXT_PUBLIC_RPC);
  
  const mintInfo = await getMint(connection, new PublicKey(tokenMint));
  console.log('Retrieved mint info:', mintInfo);
  
  // Fee Amounts
  const swapToTokenValueReceived = createEscrowArgs.tokenSwapCost * 10 ** mintInfo.decimals; // USERS RECEIVE THIS AMOUNT WHEN SWAPPING TO FUNGIBLE TOKENS
  const swapToNftTokenFee = createEscrowArgs.tokenSwapFee * 10 ** mintInfo.decimals; // USERS PAY THIS ADDITIONAL AMOUNT WHEN SWAPPING TO NFTS
  const swapToNftSolFee = createEscrowArgs.solSwapFee; // OPTIONAL ADDITIONAL SOLANA FEE TO PAY WHEN SWAPPING TO NFTS
  console.log('Fee amounts configured:', {
    swapToTokenValueReceived,
    swapToNftTokenFee,
    swapToNftSolFee
  });

  const rerollEnabled = createEscrowArgs.reroll ? 1 : 0;
  console.log('Reroll enabled:', Boolean(rerollEnabled));
  
  console.log('Collection created successfully');
  
  collectionAddress = collectionMint.publicKey;
  console.log('Updated collection address:', collectionAddress);
  
  const escrowAddress = publicKey(PublicKey.findProgramAddressSync(
    [
      Buffer.from("escrow"),
      new PublicKey(collectionAddress).toBuffer(),
    ],
    new PublicKey(MPL_HYBRID_PROGRAM_ID)
  )[0])
  console.log('Generated escrow address:', escrowAddress);

  const initTx = await initEscrowV1(umi, {
    name: escrowName,
    uri: baseMetadataPoolUri,
    escrow: escrowAddress,
    collection: publicKey(collectionAddress),
    token: publicKey(tokenMint),
    feeLocation: publicKey(feeWallet),
    feeAta: feeTokenAccount,
    min: minAssetIndex,
    max: maxAssetIndex,
    amount: swapToTokenValueReceived,
    feeAmount: swapToNftTokenFee,
    solFeeAmount: sol(swapToNftSolFee).basisPoints,
    path: rerollEnabled,
    associatedTokenProgram: SPL_ASSOCIATED_TOKEN_PROGRAM_ID,
  }).add(computeUnitPrice).sendAndConfirm(umi)
  console.log('Created init escrow transaction');

  console.log('Transaction confirmed with signature:', initTx.signature[0]);
   fetch("/api/route", {
    method: "POST",
    body: JSON.stringify({
      publicKey: umi.identity.publicKey.toString(),
      collection: collection.toString()
    }),
  });
  return {
    collectionAddress,
    escrowAddress,
    signature: initTx.signature[0],
  };
};

export default createEscrow;
