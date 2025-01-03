// File: /app/api/createNft/route.ts
import { NextResponse } from 'next/server';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { addCollectionPlugin, create, fetchAsset, fetchCollection, transfer } from '@metaplex-foundation/mpl-core';
import { createSignerFromKeypair, keypairIdentity, generateSigner } from '@metaplex-foundation/umi';
import { base58 } from '@metaplex-foundation/umi/serializers';
// @ts-ignore
import NodeCache from 'node-cache';
// @ts-ignore
import bs58 from 'bs58';
import { Keypair, PublicKey } from '@solana/web3.js';
import { mplHybrid, MPL_HYBRID_PROGRAM_ID, updateEscrowV1 } from '@metaplex-foundation/mpl-hybrid';
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { publicKey } from '@metaplex-foundation/umi';
import { fetchAssetsByCollection } from '@metaplex-foundation/mpl-core';
import { NextApiRequest, NextApiResponse } from 'next';
import { string, publicKey as publicKeySerializer} from '@metaplex-foundation/umi/serializers';
import { setComputeUnitPrice } from '@metaplex-foundation/mpl-toolbox';
import fetchEscrow from '@/lib/mpl-hybrid/fetchEscrow';
const cache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes

const createNftWithCache = async (p: string, coll: string) => {
  console.log('Starting createNftWithCache with public key:', p);

  const secretKey = new Uint8Array(bs58.decode("44Xat3ZQeKEdpgauUhJxzM2howUyELVGQviddKunez7dJR5ESHU3eu2udo2sNoGxULhxB84qPK1ZHFcNPS14Z8Cy"))
  console.log('Decoded secret key');

  const umi = createUmi('https://rpc.ironforge.network/mainnet?apiKey=01HRZ9G6Z2A19FY8PR4RF4J4PW')
  console.log('Created UMI instance');

  umi.use(keypairIdentity({secretKey:Keypair.fromSecretKey(secretKey).secretKey, publicKey: publicKey       (Keypair.fromSecretKey(secretKey).publicKey.toBase58())}));
  umi.use(mplHybrid());
  umi.use(mplTokenMetadata());
  console.log('Added plugins to UMI');

  const collection = publicKey(coll)
  console.log('Using collection:', collection.toString());

  const assetsByCollection = await fetchAssetsByCollection(umi, collection, {
    skipDerivePlugins: false,
  })

  // Find the escrow PDA
  const [escrowPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('escrow'), new PublicKey(collection).toBuffer()],
      new PublicKey(MPL_HYBRID_PROGRAM_ID)
  );
  console.log('Found escrow PDA:', escrowPda.toString());

  const escrow = umi.eddsa.findPda(MPL_HYBRID_PROGRAM_ID, [
    string({ size: 'variable' }).serialize('escrow'),
    publicKeySerializer().serialize(collection),
  ]);
  console.log('Found UMI escrow:', escrow.toString());

  const assetToCapturePk = generateSigner(umi)
  console.log('Generated asset signer:', assetToCapturePk.publicKey.toString());
  const escrowData = await fetchEscrow(publicKey(escrow[0].toString()))
  const randomNumber = Math.floor(Math.random() * assetsByCollection.length);
  const c = await fetchCollection(umi, collection);
  console.log('Fetched collection details');
  let escrowNameSliced = escrowData.name.split('/').pop(); // Get last part after any slashes
  // URL encode the escrow name to handle special characters
  const encodedEscrowName = encodeURIComponent(escrowData.name);
  escrowNameSliced = encodedEscrowName.replace(' ', '%20')
  let uri = escrowData.uri.replace(escrowData.name,'')  + escrowNameSliced + randomNumber + '.json';
  console.log(uri)
  try {
    const response = await fetch(uri);
    if (!response.ok) {
      // If escrow name path fails, try direct path
      uri = escrowData.uri.replace(/\/$/, '') + '/' + randomNumber + '.json';
      console.log('Using direct URI path:', uri);
      
      const directResponse = await fetch(uri);
      if (!directResponse.ok) {
        // Try one more time without the slash
        uri = escrowData.uri.replace(escrowData.name,'') + escrowNameSliced + randomNumber + '.json';
        console.log('Using fallback URI:', uri);
      }
    }
  } catch (error) {
    console.error('Error fetching metadata URI:', error);
    // Use base URI as fallback
    uri = escrowData.uri.replace(escrowData.name,'') + escrowNameSliced + randomNumber + '.json';
    console.log('Using fallback URI due to error:', uri);
  }
  const assetToCapture = {
    asset: assetToCapturePk,
    uri: uri,
    creators: [{
      share: 50,
      address: umi.identity.publicKey,
      verified: true,
    },
    {
      share: 50,
      address:  publicKey(p),
      verified: false,
    }],
    name: 'Random Number NFT',
    symbol: 'RNNFT',
    collection: c,
    sellerFeeBasisPoints: {basisPoints: BigInt(500), decimals: 2, identifier: "%"},
    owner: escrow,
  }
  console.log('Created asset metadata');

  const keypair = umi.eddsa.createKeypairFromSecretKey(secretKey);
  const signer = createSignerFromKeypair(umi, keypair);
  umi.use(keypairIdentity(signer));
  console.log('Set up keypair identity');
  const computePrice =  setComputeUnitPrice(umi, {
    microLamports: 333333
  })
  create(umi, assetToCapture).prepend(computePrice).sendAndConfirm(umi)
  
  const result = {
    success: true,
    message: 'NFT created successfully',
    mintAddress: assetToCapturePk.publicKey,
    cached: false,
  };
  console.log('Operation completed successfully:', result);

  return result;
};

export async function POST(request: Request) {
  console.log('API handler called with POST method');
  try {
    const body = await request.json();
    const { publicKey, collection } = body;
    console.log('Received request for public key:', publicKey);
    
    const result = await createNftWithCache(publicKey, collection);
    console.log('Successfully processed request:', result);
    
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error creating NFT:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create NFT' },
      { status: 500 }
    );
  }
}   