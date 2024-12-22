import { NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { MPL_HYBRID_PROGRAM_ID } from '@metaplex-foundation/mpl-hybrid';
import { createUmi, lamports, publicKey } from '@metaplex-foundation/umi';
import { mplHybrid } from '@metaplex-foundation/mpl-hybrid';
import { deserializeEscrowV1 } from '@metaplex-foundation/mpl-hybrid/dist/src/generated/accounts/escrowV1';
import { web3JsRpc } from '@metaplex-foundation/umi-rpc-web3js';
import { fetchMetadata } from '@metaplex-foundation/mpl-token-metadata';
import fetchAsset from '@/lib/das/fetchAsset';

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  try {
    const connection = new Connection('https://rpc.ironforge.network/mainnet?apiKey=01HRZ9G6Z2A19FY8PR4RF4J4PW');
    
    const accounts = await connection.getProgramAccounts(
      new PublicKey(MPL_HYBRID_PROGRAM_ID),
      {
        filters: [{ dataSize: 284 }]
      }
    );

    const escrowsWithData = await Promise.all(accounts.map(async account => {
      const escrowData = deserializeEscrowV1({
        ...account.account,
        lamports: lamports(account.account.lamports),
        rentEpoch: BigInt(account.account.rentEpoch ? account.account.rentEpoch : 0),   
        publicKey: publicKey(account.pubkey.toString()),
        owner: publicKey(account.pubkey.toString()),
      });

      // Fetch metadata if URI exists
      let metadata = null;
      if (escrowData.authority.toString() !== "GB4e6nATLT2J18VuLEp2ygGg41iVUB87BmQvs9uhcqT7") {
     //   return null;
      }
      if (escrowData.uri) {
        try {
          // Construct the full metadata URI by combining base URI with index
          const metadataUri = escrowData.uri.replace(/\/$/, '') + '/' + escrowData.count + '.json';
          const response = await fetch(metadataUri);
          metadata = await response.json();
        } catch (e) {
          console.error(`Failed to fetch metadata for ${escrowData.uri}:`, e);
        }
      }
      const token = await fetchAsset(escrowData.token);
      console.log(token)    
      return {
        pubkey: account.pubkey.toString(),
        collection: escrowData.collection.toString(),
        authority: escrowData.authority.toString(),
        token: escrowData.token.toString(),
        feeLocation: escrowData.feeLocation.toString(),
        name: escrowData.name,
        uri: escrowData.uri,
        max: escrowData.max.toString(),
        min: escrowData.min.toString(),
        amount: escrowData.amount.toString(),
        feeAmount: escrowData.feeAmount.toString(),
        solFeeAmount: escrowData.solFeeAmount.toString(),
        count: escrowData.count.toString(),
        path: escrowData.path,
        bump: escrowData.bump,
        metadata,
        imagePath: escrowData.uri.replace(/\/$/, '') + '/' + escrowData.count + '.png',
        // Add additional formatted data
        // @ts-ignore
        formattedAmount: `${(Number(escrowData.feeAmount) / 10 ** token.token_info.decimals).toFixed(2)} TOKENS`,
        formattedFeeAmount: `${(Number(escrowData.solFeeAmount) / 10 ** 9).toFixed(2)} SOL`,
        createdAt: new Date().toISOString(), // You might want to get this from somewhere else
        status: 'active', // You might want to determine this based on other factors
        // Add display properties
        displayProperties: {
          progress: ((Number(escrowData.count) / Number(escrowData.max)) * 100).toFixed(1),
          totalAmount: (Number(escrowData.max) / 10 ** 9).toFixed(2),
          currentAmount: (Number(escrowData.count) / 10 ** 9).toFixed(2),
        }
      };
    }));

    return NextResponse.json({
      success: true,
      escrows: escrowsWithData.filter(escrow => escrow !== null),
      totalEscrows: escrowsWithData.length,
      timestamp: new Date().toISOString(),
    }); 

  } catch (error) {
    console.error('Error fetching escrows:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch escrows',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
} 