import { TradeState } from './../../components/swapWrapper/swapWrapper';
import useEscrowStore from "@/store/useEscrowStore";
import { DasApiAsset } from "@metaplex-foundation/digital-asset-standard-api";
import { captureV1, releaseV1 } from "@metaplex-foundation/mpl-hybrid";
import fetchEscrowAssets from "../fetchEscrowAssets";
import sendAndConfirmWalletAdapter from "../umi/sendAndConfirmWithWalletAdapter";
import umiWithCurrentWalletAdapter from "../umi/umiWithCurrentWalletAdapter";
import { createIdempotentAssociatedToken, setComputeUnitPrice } from '@metaplex-foundation/mpl-toolbox';
import { Connection, PublicKey, Transaction, VersionedMessage, VersionedTransaction } from '@solana/web3.js';
import { publicKey, TransactionBuilder } from '@metaplex-foundation/umi';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import { AnchorWallet, Wallet } from '@solana/wallet-adapter-react';
import { AnchorProvider } from '@coral-xyz/anchor';
const swap = async ({
  swapOption,
  selectedNft,
  wallet,
  connection
}: {
  swapOption: TradeState;
  selectedNft?: DasApiAsset;
  wallet: AnchorWallet;
  connection: Connection;
}) => {
  console.log({ swapOption, selectedNft });

  const umi = umiWithCurrentWalletAdapter();

  const escrow = useEscrowStore.getState().escrow;

  if (!escrow) {
    console.error("No escrow found");
    return;
  }
  let signed: any;
  let signedTx: VersionedMessage;
  let signedVersionedTx: VersionedTransaction;
  let signedBy: VersionedTransaction;
  switch (swapOption) {
    case TradeState.nft:
      console.log("Swapping NFT");

      if (!selectedNft) {
        throw new Error("No NFT selected");
      }
      const createAtaIdentity = await createIdempotentAssociatedToken(umi, {
        owner: umi.identity.publicKey ,
        mint: escrow.token,
        ata: publicKey(getAssociatedTokenAddressSync(new PublicKey(escrow.token.toString()), new PublicKey(umi.identity.publicKey.toString()) )    )
      });
      const computePrice = await setComputeUnitPrice(umi, {
        microLamports: 333333
      })
      const releaseTx = await (releaseV1(umi, {
        owner: umi.identity,
        escrow: escrow.publicKey,
        authority: {...umi.identity, publicKey: escrow.authority},

        asset: selectedNft.id,
        collection: escrow.collection,
        token: escrow.token,
        feeProjectAccount: escrow.feeLocation,
      }).prepend(computePrice).prepend(createAtaIdentity)).buildWithLatestBlockhash(umi);
       signed =await (await fetch("/api/sign", {
        method: "POST",
        body: JSON.stringify({
          collectionAddress: escrow.collection.toString(),
          tx: Buffer.from(releaseTx.serializedMessage).toString('base64')
        }),
      })).json()
      try {
        signedVersionedTx = VersionedTransaction.deserialize(Buffer.from(signed.message, "base64"));
       console.log(signedVersionedTx)
       // @ts-ignore
       const provider2 = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
       // @ts-ignore
      return await provider2.sendAndConfirm(signedVersionedTx, [], {skipPreflight: true});
      } catch (error) {
        console.error(error);
        throw error;
      }
    case TradeState.tokens:
      console.log("Swapping Tokens");


      const collection = publicKey(escrow.collection.toString());
     const answer =  await fetch("/api/route", {
        method: "POST",
        body: JSON.stringify({
          publicKey: umi.identity.publicKey.toString(),
          collection: collection.toString()
        }),
      });
      const answerJson = await answer.json();
      console.log(answerJson);
      
      const computePrice2 = await setComputeUnitPrice(umi, {
        microLamports: 333333
      })
      const ata = getAssociatedTokenAddressSync(new PublicKey(escrow.token.toString()), new PublicKey(escrow.publicKey.toString()), true) 
      const ataAccountMaybe = await connection.getAccountInfo(ata)
      console.log(ataAccountMaybe)
     
      
      let captureTx = await captureV1(umi, {
        owner: umi.identity,
        escrow: escrow.publicKey,
        authority: {...umi.identity, publicKey: escrow.authority},

        asset: publicKey(answerJson.mintAddress),
        collection: escrow.collection,
        token: escrow.token,
        feeProjectAccount: escrow.feeLocation,
      }).prepend(computePrice2)
      if (!ataAccountMaybe) {
        const createAtaEscrow = await createIdempotentAssociatedToken(umi, {
          owner: publicKey(escrow.publicKey.toString()),
          mint: publicKey(escrow.token.toString()),
          ata: publicKey(getAssociatedTokenAddressSync(new PublicKey(escrow.token.toString()), new PublicKey(escrow.publicKey.toString()), true)    )
        });
        captureTx = captureTx.prepend(createAtaEscrow)
      }
     const captureTx2 = await captureTx.buildWithLatestBlockhash(umi);
       signed =await (await fetch("/api/sign", { 
        method: "POST",
        body: JSON.stringify({
          collectionAddress: escrow.collection.toString(),
          tx: Buffer.from(captureTx2.serializedMessage).toString('base64')
        }),
      })).json()

      signedVersionedTx = VersionedTransaction.deserialize(Buffer.from(signed.message, "base64"));
      // @ts-ignore
        const provider3 = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
      // @ts-ignore
     return await provider3.sendAndConfirm(signedVersionedTx, [], {skipPreflight: true});
    default:
      throw new Error("Invalid swap option");
  }
};

export default swap;
