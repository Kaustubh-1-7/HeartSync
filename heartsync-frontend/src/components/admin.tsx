// src/components/Admin.tsx

'use client';

import { useReadContract, useWriteContract } from 'wagmi';
import { matchmakerConfig } from '../contracts';
import { toast } from 'react-hot-toast'; // We'll add this for notifications

export function Admin() {
  // Hook to read the current number of users in the pool
  const { data: poolSize } = useReadContract({
    ...matchmakerConfig,
    functionName: 'getMatchingPoolSize',
    // watch: true, // Auto-updates the pool size
  });

  // Hook to call the requestMatchmaking function
  const { writeContract: requestMatches, isPending } = useWriteContract({
    mutation: {
      onSuccess: (hash) => {
        toast.success(`Matchmaking requested! Tx: ${hash}`);
      },
      onError: (error) => {
        toast.error(`Error: ${error.message}`);
      }
    }
  });

  const handleRequestMatches = () => {
    const poolSizeNumber = typeof poolSize === 'number' ? poolSize : Number(poolSize);
    if (poolSize === undefined || poolSize === null || isNaN(poolSizeNumber) || poolSizeNumber < 2) {
      toast.error('Not enough users in the pool to match.');
      return;
    }
    requestMatches({
      ...matchmakerConfig,
      functionName: 'requestMatchmaking',
    });
  };

  return (
    <div className="mt-8 p-4 border-2 border-red-500 rounded-lg bg-red-50">
      <h2 className="text-xl font-bold text-red-700">Admin Panel</h2>
      <div className="my-4">
        <p className="text-lg">
          Users currently in matching pool: 
          <span className="font-bold ml-2">{poolSize?.toString() ?? '...'}</span>
        </p>
      </div>
      <button
        onClick={handleRequestMatches}
        disabled={
          isPending ||
          poolSize === undefined ||
          poolSize === null ||
          (typeof poolSize === 'number' ? poolSize < 2 : Number(poolSize) < 2)
        }
        className="w-full justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 disabled:bg-gray-400"
      >
        {isPending ? 'Requesting...' : 'Trigger Matchmaking Round'}
      </button>
    </div>
  );
}