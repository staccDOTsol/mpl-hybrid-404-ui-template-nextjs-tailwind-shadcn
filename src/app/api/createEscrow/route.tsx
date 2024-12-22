import { NextResponse } from 'next/server';
import { generateImages } from '@/lib/mpl-gpt/generateImages';
import { generateAndUploadMetadata, uploadToShadowDrive } from '@/lib/shadow-drive/upload';
import createEscrow from '@/lib/mpl-hybrid/createEscrow';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      escrowName,
      tokenMint,
      feeWallet,
      minAssetIndex,
      maxAssetIndex,
      swapToTokenValueReceived,
      swapToNftTokenFee,
      solFeeAmount,
      rerollEnabled,
      generateCount,
      nftPrompt 
    } = body;

    // Generate images first
    const images = await generateImages(
      nftPrompt || "pixel art character of strategic and tactical RPG totally SFW", 
      generateCount || 10
    );
    console.log('Generated images:', images);

    // Upload to Shadow Drive and get URLs
    const uploadedUrls = await uploadToShadowDrive(images, escrowName);
    console.log('Uploaded to Shadow Drive:', uploadedUrls);

    // Create metadata files and upload
    const metadataUrls = await generateAndUploadMetadata(uploadedUrls, escrowName);
    console.log('Uploaded metadata:', metadataUrls);

    // Use the existing createEscrow function
    const result = await createEscrow({
      name: escrowName,
      tokenMint: tokenMint,
      metadataBaseUrl: "https://shdw-drive.genesysgo.net/E3eKxVWovF4rq2def4Hdaxcckj7jeRP7xQATuvN6X9qv/"+escrowName, // Get base URL from first metadata URL
      minIndex: minAssetIndex,
      maxIndex: maxAssetIndex,
      feeWalletAddress: feeWallet,
      tokenSwapCost: swapToTokenValueReceived,
      tokenSwapFee: swapToNftTokenFee,
      solSwapFee: solFeeAmount,
      reroll: rerollEnabled
    });

    return NextResponse.json({
      success: true,
      signature: result.signature,
      escrowAddress: result.escrowAddress
    });

  } catch (error) {
    console.error('Error creating hybrid escrow:', error);
    return NextResponse.json(
      { error: 'Failed to create hybrid escrow' },
      { status: 500 }
    );
  }
}
