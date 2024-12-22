'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { CheckBadgeIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid';
import SwapWrapper from '@/components/swapWrapper/swapWrapper';
import useEscrowStore from '@/store/useEscrowStore';
import { EscrowV1, fetchEscrowV1 } from "@metaplex-foundation/mpl-hybrid";
import { publicKey } from "@metaplex-foundation/umi";
import umiWithCurrentWalletAdapter from '@/lib/umi/umiWithCurrentWalletAdapter';

export default function Home() {
  const [escrows, setEscrows] = useState<EscrowV1[]>([]);

  useEffect(() => {
    fetch('/api/getEscrows')
      .then(res => res.json())
      .then(data => setEscrows(data.escrows));
  }, []);

  const handleEscrowSelect = async (escrowPubkey: string) => {
    const umi = umiWithCurrentWalletAdapter();
    const escrowData = await fetchEscrowV1(umi, publicKey(escrowPubkey));
    useEscrowStore.setState({ escrow: escrowData });
  };
  if (escrows.length === 0) return;
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {escrows.map((escrow: any) => (
          <div 
            key={escrow.pubkey} 
            className="bg-slate-800 rounded-lg p-6 shadow-xl hover:shadow-2xl transition-all cursor-pointer"
            onClick={() => handleEscrowSelect(escrow.pubkey)}
          >
            {/* Image Section */}
            <div className="relative aspect-square mb-4">
              <Image
                src={escrow.imagePath}
                alt={escrow.name}
                fill
                className="rounded-lg object-cover"
              />
            </div>

            {/* Header Info */}
            <div className="mb-4">
              <h2 className="text-xl font-bold text-white mb-2">{escrow.name}</h2>
              <p className="text-gray-300 text-sm line-clamp-2">{escrow.description}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-700 p-3 rounded-lg">
                <p className="text-gray-400 text-xs">Price</p>
                <p className="text-white font-bold">{escrow.formattedAmount}</p>
              </div>
              <div className="bg-slate-700 p-3 rounded-lg">
                <p className="text-gray-400 text-xs">Fee</p>
                <p className="text-white font-bold">{escrow.formattedFeeAmount}</p>
              </div>
              <div className="bg-slate-700 p-3 rounded-lg">
                <p className="text-gray-400 text-xs">Min</p>
                <p className="text-white font-bold">{escrow.formattedMin}</p>
              </div>
              <div className="bg-slate-700 p-3 rounded-lg">
                <p className="text-gray-400 text-xs">Max</p>
                <p className="text-white font-bold">{escrow.formattedMax}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Progress</span>
                <span className="text-white">{escrow.displayProperties.progress}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: escrow.displayProperties.progress }}
                />
              </div>
            </div>

            {/* Status and Details */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${
                  escrow.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                }`} />
                <span className="text-gray-300 text-sm capitalize">{escrow.status}</span>
              </div>
              {escrow.isVerified && (
                <span className="text-blue-500">
                  <CheckBadgeIcon className="w-5 h-5" />
                </span>
              )}
            </div>

            {/* Metadata Attributes */}
            {escrow.metadata?.attributes && escrow.metadata.attributes.length > 0 && (
              <div className="border-t border-slate-700 pt-4 mt-4">
                <p className="text-gray-400 text-sm mb-2">Attributes</p>
                <div className="grid grid-cols-2 gap-2">
                  {escrow.metadata.attributes.slice(0, 4).map((attr: any, idx: any) => (
                    <div key={idx} className="bg-slate-700 p-2 rounded text-xs">
                      <p className="text-gray-400">{attr.trait_type}</p>
                      <p className="text-white">{attr.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <Button 
                className="flex-1"
                disabled={escrow.displayProperties.isSoldOut}
              >
                {escrow.displayProperties.isSoldOut ? 'Sold Out' : 'Mint'}
              </Button>
              <SwapWrapper escrowAddress={escrow.pubkey.toString()} tokenMint={escrow.token.toString()} escrow={escrow} />
              <Button variant="outline" className="px-3">
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
