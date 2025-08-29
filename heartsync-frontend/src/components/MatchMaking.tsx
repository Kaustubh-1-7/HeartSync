// src/components/Matchmaking.tsx (Corrected Version)

'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { matchmakerConfig, profileManagerConfig } from '../contracts'; // Import profileManagerConfig
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

export function Matchmaking() {
  const queryClient = useQueryClient();
  const { address } = useAccount(); // Get the user's address

  const { data: matchCounter, isLoading } = useReadContract({
    ...matchmakerConfig,
    functionName: 'matchCounter',
  }) as { data: bigint | undefined, isLoading: boolean };

  const { writeContract: enterPool, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isConfirmed) {
      toast.success('Successfully entered the pool!');
      // --- THE FIX IS HERE ---
      // We are now explicitly telling wagmi which queries to refetch.
      // This will force the `isInPool` hook in the ProfileCreator component to get the new status.
      queryClient.invalidateQueries({ queryKey: [matchmakerConfig.address, 'isInPool', address] });
      queryClient.invalidateQueries({ queryKey: [matchmakerConfig.address, 'getMatchingPoolSize'] });
    }
    if(error){
        toast.error(error.message)
    }
  }, [isConfirmed, error, queryClient, address]); // Add address to dependency array

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-800">Step 2: Join the Matchmaking Pool</h2>
      <div className="my-4 p-6 border rounded-xl bg-white shadow-sm text-center">
        <h3 className="text-lg font-medium text-gray-700">Total Matches Made on HeartSync</h3>
        <p className="text-5xl font-bold text-indigo-600 mt-2">
          {isLoading ? '...' : matchCounter?.toString()}
        </p>
      </div>
      <button 
        disabled={isPending || isConfirming} 
        onClick={() => enterPool({ ...matchmakerConfig, functionName: 'enterMatchingPool' })}
        className="w-full justify-center rounded-md border border-transparent bg-green-600 py-3 px-4 text-base font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400"
      >
        {isPending ? 'Confirming in wallet...' : isConfirming ? 'Processing on-chain...' : 'Enter Matching Pool'}
      </button>
    </section>
  );
}