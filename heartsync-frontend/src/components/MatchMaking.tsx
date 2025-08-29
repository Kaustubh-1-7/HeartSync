// src/components/Matchmaking.tsx

'use client';

import { useReadContract } from 'wagmi';
import { matchmakerConfig } from '../contracts';
// --- FIX: Import the official types from wagmi ---
import type { Config } from 'wagmi';
import type { WriteContractMutate } from 'wagmi/query';

// --- FIX: Use the official wagmi types for the component's props ---
type MatchmakingProps = {
  onEnterPool: WriteContractMutate<Config>;
  isEnteringPool: boolean;
  isConfirming: boolean;
};

export function Matchmaking({ onEnterPool, isEnteringPool, isConfirming }: MatchmakingProps) {
  const { data: matchCounter, isLoading } = useReadContract({
    ...matchmakerConfig,
    functionName: 'matchCounter',
  }) as { data: bigint | undefined, isLoading: boolean };

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
        disabled={isEnteringPool || isConfirming} 
        onClick={() => onEnterPool({ ...matchmakerConfig, functionName: 'enterMatchingPool' })}
        className="w-full justify-center rounded-md border border-transparent bg-green-600 py-3 px-4 text-base font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isEnteringPool ? 'Confirming...' : isConfirming ? 'Processing...' : 'Enter Matching Pool'}
      </button>
    </section>
  );
}