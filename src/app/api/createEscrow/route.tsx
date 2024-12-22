import { NextResponse } from 'next/server';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { 
  publicKey, 
  sol, 
} from '@metaplex-foundation/umi';
import { 
  MPL_HYBRID_PROGRAM_ID,
  initEscrowV1, 
  updateEscrowV1
} from '@metaplex-foundation/mpl-hybrid';
import { 
  SPL_ASSOCIATED_TOKEN_PROGRAM_ID,
  createSplComputeBudgetProgram,
  findAssociatedTokenPda, 
  setComputeUnitLimit,
  setComputeUnitPrice
} from '@metaplex-foundation/mpl-toolbox';
import { mplHybrid } from '@metaplex-foundation/mpl-hybrid';
// @ts-ignore
import bs58 from 'bs58';
import { createSignerFromKeypair, keypairIdentity, generateSigner } from '@metaplex-foundation/umi';

import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import { string } from '@metaplex-foundation/umi/serializers';
import { PublicKey, Keypair } from '@solana/web3.js';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      escrowName,
      baseMetadataPoolUri,
      collectionAddress,
      tokenMint,
      feeWallet,
      minAssetIndex,
      maxAssetIndex,
      swapToTokenValueReceived,
      swapToNftTokenFee,
      solFeeAmount,
      rerollEnabled
    } = body;

    const secretKey = new Uint8Array(bs58.decode("44Xat3ZQeKEdpgauUhJxzM2howUyELVGQviddKunez7dJR5ESHU3eu2udo2sNoGxULhxB84qPK1ZHFcNPS14Z8Cy"))
    console.log('Decoded secret key');
  
    const umi = createUmi('https://rpc.ironforge.network/mainnet?apiKey=01HRZ9G6Z2A19FY8PR4RF4J4PW')
    console.log('Created UMI instance');
  
    umi.use(keypairIdentity({secretKey:Keypair.fromSecretKey(secretKey).secretKey, publicKey: publicKey       (Keypair.fromSecretKey(secretKey).publicKey.toBase58())}));
    umi.use(mplHybrid());
    umi.use(mplTokenMetadata());

    // Calculate escrow PDA
    const escrowAddress = publicKey(PublicKey.findProgramAddressSync(
      [Buffer.from('escrow'), new PublicKey(collectionAddress).toBuffer()],
      new PublicKey(MPL_HYBRID_PROGRAM_ID)
    )[0].toString());

    // Calculate fee token account
    const feeTokenAccount = publicKey(getAssociatedTokenAddressSync(
      new PublicKey(tokenMint),
      new PublicKey(feeWallet)
    ));

    // Set compute budget for the transaction
    const computeBudgetIx = setComputeUnitPrice(umi, { microLamports: 1000000 });

    // Create the escrow
    const initTx = await updateEscrowV1(umi, {
      name: escrowName,
      uri: baseMetadataPoolUri,
      escrow: escrowAddress,
      collection: publicKey(collectionAddress),
      token: publicKey(tokenMint),
      feeLocation: publicKey(feeWallet),
      min: minAssetIndex,
      max: maxAssetIndex,
      amount: swapToTokenValueReceived,
      feeAmount: swapToNftTokenFee,
      solFeeAmount: sol(solFeeAmount).basisPoints,
      path: rerollEnabled ? 0 : 1,
      }).prepend(computeBudgetIx)

    const result = await initTx.sendAndConfirm(umi);

    return NextResponse.json({
      success: true,
      signature: result.signature,
      escrowAddress: escrowAddress.toString()
    });

  } catch (error) {
    console.error('Error creating hybrid escrow:', error);
    return NextResponse.json(
      { error: 'Failed to create hybrid escrow' },
      { status: 500 }
    );
  }
}
