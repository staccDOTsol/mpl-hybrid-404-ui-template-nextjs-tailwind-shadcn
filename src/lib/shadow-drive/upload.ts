import { Wallet } from "@coral-xyz/anchor";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { ShdwDrive } from "@shadow-drive/sdk";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
// @ts-ignore
import bs58 from "bs58";

export async function uploadToShadowDrive(imageUrls: string[], folder: string): Promise<string[]> {
  const connection = new Connection("https://rpc.ironforge.network/mainnet?apiKey=01HRZ9G6Z2A19FY8PR4RF4J4PW");
  const secretKey = new Uint8Array(bs58.decode(process.env.SHADOW_DRIVE_KEY!));
  // @ts-ignore
  const keypair = new NodeWallet(Keypair.fromSecretKey(secretKey));
  // @ts-ignore
  const drive = await new ShdwDrive(connection, keypair).init();
  const uploadedUrls: string[] = [];
  const buffers: {name: string, file: Buffer}[] = [];
  for(let i = 0; i < imageUrls.length; i++) {
    const imageResponse = await fetch(imageUrls[i]);
    const imageBuffer = await imageResponse.arrayBuffer();
    buffers.push({name: `${folder}${i+1}.png`, file: Buffer.from(imageBuffer)});
  } 

    // Upload files in batches of 10
    for (let i = 0; i < buffers.length; i += 10) {
      const batchBuffers = buffers.slice(i, i + 10);
      const upload = await drive.uploadMultipleFiles(
        new PublicKey("E3eKxVWovF4rq2def4Hdaxcckj7jeRP7xQATuvN6X9qv"),
        batchBuffers
      );
      uploadedUrls.push(...upload.map((upload) => upload.location));
      console.log(`Uploaded batch ${Math.floor(i/10) + 1} of ${Math.ceil(buffers.length/10)}`);
    }
  return uploadedUrls;
}

export async function generateAndUploadMetadata(imageUrls: string[], folder: string): Promise<string[]> {
  const connection = new Connection("https://rpc.ironforge.network/mainnet?apiKey=01HRZ9G6Z2A19FY8PR4RF4J4PW");
  const secretKey = new Uint8Array(bs58.decode(process.env.SHADOW_DRIVE_KEY!));
  // @ts-ignore
  const keypair = new NodeWallet(Keypair.fromSecretKey(secretKey));
  // @ts-ignore
  const drive = await new ShdwDrive(connection, keypair).init();

  const metadataUrls: string[] = [];
  const buffers: {name: string, file: Buffer}[] = [];

  for(let i = 0; i < imageUrls.length; i++) {
    const metadata = {
      name: `AIRT #${i+1}`,
      description: "AIRT generated for the Solana Blockchain", 
      symbol: "AIRT",
      image: imageUrls[i],
      properties: {
        files: [{
          uri: imageUrls[i],
          type: "image/png"
        }],
        category: "image"
      }
    };

    buffers.push({
      name: `${folder}${i+1}.json`,
      file: Buffer.from(JSON.stringify(metadata, null, 2))
    });
  }

  // Upload files in batches of 10
  for (let i = 0; i < buffers.length; i += 10) {
    const batchBuffers = buffers.slice(i, i + 10);
    const upload = await drive.uploadMultipleFiles(
      new PublicKey("E3eKxVWovF4rq2def4Hdaxcckj7jeRP7xQATuvN6X9qv"),
      batchBuffers
    );
    metadataUrls.push(...upload.map((upload) => upload.location));
    console.log(`Uploaded batch ${Math.floor(i/10) + 1} of ${Math.ceil(buffers.length/10)}`);
  }

  return metadataUrls;
}