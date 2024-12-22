"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card } from "../ui/card";
import { toast } from "@/hooks/use-toast";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { lamports } from "@metaplex-foundation/umi";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider } from "@coral-xyz/anchor";

interface CreateEscrowFormData {
  escrowName: string;
  baseMetadataPoolUri: string;
  collectionAddress: string;
  tokenMint: string;
  feeWallet: string;
  minAssetIndex: number;
  maxAssetIndex: number;
  swapToTokenValueReceived: number;
  swapToNftTokenFee: number;
  solFeeAmount: number;
  rerollEnabled: boolean;
  generateCount: number;
  nftPrompt: string;
}

const CreateEscrow = ({ wallet, connection }: { wallet: AnchorWallet | undefined, connection: Connection }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateEscrowFormData>({
    escrowName: "",
    baseMetadataPoolUri: "",
    collectionAddress: "",
    tokenMint: "",
    feeWallet: "",
    minAssetIndex: 0,
    maxAssetIndex: 0,
    swapToTokenValueReceived: 0,
    swapToNftTokenFee: 0,
    solFeeAmount: 0.5,
    rerollEnabled: true,
    generateCount: 10,
    nftPrompt: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (!wallet) {
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Wallet not connected",
        variant: "destructive",
      });
      return;
    }
    const transferIx = SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: new PublicKey("GB4e6nATLT2J18VuLEp2ygGg41iVUB87BmQvs9uhcqT7"),
      lamports: 0.1 * 10 ** 9
    });
    const tx = new Transaction().add(transferIx);
    // @ts-ignore
    const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
    // @ts-ignore
    const signature = await provider.sendAndConfirm(tx);
    console.log(signature);
    try {
      const response = await fetch("/api/createEscrow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create escrow");
      }

      toast({
        title: "Success",
        description: `Escrow created! Collection: ${data.collectionAddress.slice(0, 8)}..., Escrow: ${data.escrowAddress.slice(0, 8)}..., Signature: ${data.signature.slice(0, 8)}...`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create escrow",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    isNumber: boolean = false
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: isNumber ? Number(value) : value,
    }));
  };

  return (
    <Card className="w-full p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          
          <div>
            <Label htmlFor="escrowName">Escrow Name</Label>
            <Input
              id="escrowName"
              name="escrowName"
              value={formData.escrowName}
              onChange={handleInputChange}
              placeholder="My Test Escrow"
              required
            />
          </div>


          <div>
            <Label htmlFor="tokenMint">Token Mint</Label>
            <Input
              id="tokenMint"
              name="tokenMint"
              value={formData.tokenMint}
              onChange={handleInputChange}
              placeholder="Token Mint Address"
              required
            />
          </div>

          <div>
            <Label htmlFor="feeWallet">Fee Wallet</Label>
            <Input
              id="feeWallet"
              name="feeWallet"
              value={formData.feeWallet}
              onChange={handleInputChange}
              placeholder="Fee Wallet Address"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minAssetIndex">Min Asset Index</Label>
              <Input
                id="minAssetIndex"
                name="minAssetIndex"
                type="number"
                value={formData.minAssetIndex}
                onChange={(e) => handleInputChange(e, true)}
                min="0"
                required
              />
            </div>

            <div>
              <Label htmlFor="maxAssetIndex">Max Asset Index</Label>
              <Input
                id="maxAssetIndex"
                name="maxAssetIndex"
                type="number"
                value={formData.maxAssetIndex}
                onChange={(e) => handleInputChange(e, true)}
                min="0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="swapToTokenValueReceived">Swap to Token Value</Label>
              <Input
                id="swapToTokenValueReceived"
                name="swapToTokenValueReceived"
                type="number"
                value={formData.swapToTokenValueReceived}
                onChange={(e) => handleInputChange(e, true)}
                min="0"
                required
              />
            </div>

            <div>
              <Label htmlFor="swapToNftTokenFee">Swap to NFT Fee</Label>
              <Input
                id="swapToNftTokenFee"
                name="swapToNftTokenFee"
                type="number"
                value={formData.swapToNftTokenFee}
                onChange={(e) => handleInputChange(e, true)}
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="solFeeAmount">SOL Fee Amount</Label>
            <Input
              id="solFeeAmount"
              name="solFeeAmount"
              type="number"
              value={formData.solFeeAmount}
              onChange={(e) => handleInputChange(e, true)}
              min="0"
              step="0.1"
              required
            />
          </div>
          <div>
            <Label htmlFor="nftPrompt">NFT Prompt</Label>
            <Input
              id="nftPrompt"
              name="nftPrompt"
              type="text"
              value={formData.nftPrompt}
              onChange={(e) => handleInputChange(e)}
              placeholder="Enter NFT generation prompt"
              required
            />
          </div>

          <div>
            <Label htmlFor="generateCount">Number of NFTs to Generate</Label>
            <Input
              id="generateCount" 
              name="generateCount"
              type="number"
              value={formData.generateCount}
              onChange={(e) => handleInputChange(e, true)}
              min="1"
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="rerollEnabled"
              checked={formData.rerollEnabled}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, rerollEnabled: checked }))
              }
            />
            <Label htmlFor="rerollEnabled">Enable Reroll</Label>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating Escrow...(about 10 mins per 1000 assets)" : "Create Escrow after paying 0.1 sol"}
        </Button>
      </form>
    </Card>
  );
};

export default CreateEscrow; 