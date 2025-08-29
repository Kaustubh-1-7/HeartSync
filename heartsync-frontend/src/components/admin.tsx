// src/components/Admin.tsx (Simplified Version)

'use client';

import { useWriteContract } from 'wagmi';
import { matchmakerConfig } from '../contracts';
import { toast } from 'react-hot-toast';

export function Admin() {
  // We no longer need to read the pool size.
  // The smart contract will handle the check.

  const { writeContract: requestMatches, isPending } = useWriteContract({
    mutation: {
      onSuccess: (hash) => {
        toast.success(`Matchmaking requested! See transaction: ${hash}`);
      },
      // Wagmi automatically handles and displays contract revert errors,
      // so the user will be notified if the pool size is too small.
      onError: (error) => {
        toast.error(`Transaction failed: ${error.message}`);
      }
    }
  });

  const handleRequestMatches = () => {
    // We simply call the function directly.
    // If the require(matchingPool.length >= 2, ...) statement in the contract fails,
    // MetaMask will show an error and the transaction will not be sent.
    requestMatches({
      ...matchmakerConfig,
      functionName: 'requestMatchmaking',
    });
  };

  return (
    <div className="mt-8 p-4 border-2 border-red-500 rounded-lg bg-red-50">
      <h2 className="text-xl font-bold text-red-700">Admin Panel</h2>
      <p className="my-4 text-sm text-gray-700">
        Click the button below to trigger a new round of matchmaking for all users currently in the pool. The smart contract will only proceed if there are 2 or more users available.
      </p>
      <button
        onClick={handleRequestMatches}
        disabled={isPending}
        className="w-full justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 disabled:bg-gray-400"
      >
        {isPending ? 'Requesting...' : 'Trigger Matchmaking Round'}
      </button>
    </div>
  );
}