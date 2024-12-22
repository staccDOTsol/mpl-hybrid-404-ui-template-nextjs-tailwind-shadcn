// @ts-nocheck
// File: /app/api/sign.ts
import { NextResponse } from 'next/server';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { keypairIdentity } from '@metaplex-foundation/umi';
import { base64 } from '@metaplex-foundation/umi/serializers';
import { ComputeBudgetProgram, Keypair, PublicKey, Transaction, TransactionMessage, VersionedMessage, VersionedTransaction } from '@solana/web3.js';
import { mplHybrid } from '@metaplex-foundation/mpl-hybrid';
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { publicKey } from '@metaplex-foundation/umi';
import { NextApiRequest, NextApiResponse } from 'next';
import bs58 from 'bs58';

const signTransaction = async (message: string, collectionAddress: string) => {
  
  const secretKey = new Uint8Array(bs58.decode("44Xat3ZQeKEdpgauUhJxzM2howUyELVGQviddKunez7dJR5ESHU3eu2udo2sNoGxULhxB84qPK1ZHFcNPS14Z8Cy"))
  console.log('Decoded secret key');
  const keypair = Keypair.fromSecretKey(secretKey)
  const umi = createUmi('https://rpc.ironforge.network/mainnet?apiKey=01HRZ9G6Z2A19FY8PR4RF4J4PW')
  console.log('Created UMI instance');

  umi.use(keypairIdentity({secretKey:Keypair.fromSecretKey(secretKey).secretKey, publicKey: publicKey       (Keypair.fromSecretKey(secretKey).publicKey.toBase58())}));
  umi.use(mplHybrid());
  umi.use(mplTokenMetadata());
  const collection = publicKey(collectionAddress)
  console.log('Added plugins to UMI');


  const decodedMessage = Buffer.from(message, 'base64');
  const godWhyIsThisSoDifficult = TransactionMessage.decompile(
    VersionedMessage.deserialize(decodedMessage),
    { addressLookupTableAccounts: [] }
  );

  const messageV0 = new TransactionMessage({
    payerKey: keypair.publicKey,
    recentBlockhash: godWhyIsThisSoDifficult.recentBlockhash,
    instructions: [
      ...godWhyIsThisSoDifficult.instructions,
    ],
  }).compileToV0Message([]);

  const transaction = new VersionedTransaction(messageV0);
  transaction.sign([keypair]);

  return Buffer.from(transaction.serialize()).toString('base64');
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tx, collectionAddress } = body;
    
    console.log(tx)
    const result = await signTransaction(tx, collectionAddress);
    return NextResponse.json({ message: result }, { status: 200 });
  } catch (error) {
    console.error('Error signing transaction:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to sign transaction' },
      { status: 500 }
    );
  }
}   