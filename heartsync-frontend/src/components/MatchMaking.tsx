// src/components/Matchmaking.tsx

'use client';

import { useReadContract, useWriteContract } from 'wagmi';
import { matchmakerConfig } from '../contracts';

export function Matchmaking() {
  // Hook to read the match counter
  const { data: matchCounter, isLoading } = useReadContract({
    ...matchmakerConfig,
    functionName: 'matchCounter',
    // The 'watch: true' property has been removed to fix the error.
  });

  // Hook to write to the enterMatchingPool function
  const { writeContract: enterPool, isPending } = useWriteContract();

  return (
    <div>
      <h2 className="text-xl font-semibold">Step 2: Join the Matchmaking Pool</h2>
      <div className="my-4 p-4 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-medium">Total Matches Made on HeartSync: 
          <span className="font-bold text-indigo-600 ml-2">
            {isLoading ? '...' : matchCounter?.toString()}
          </span>
        </h3>
      </div>
      <button 
        disabled={isPending} 
        onClick={() => enterPool({ ...matchmakerConfig, functionName: 'enterMatchingPool' })}
        className="w-full justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400"
      >
        {isPending ? 'Entering Pool...' : 'Enter Matching Pool'}
      </button>
    </div>
  );
}