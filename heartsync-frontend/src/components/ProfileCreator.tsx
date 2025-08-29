// src/components/ProfileCreator.tsx

'use client';

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { profileManagerConfig } from '../contracts';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

const GENDER_MAP = ['Male', 'Female', 'Both'];

type Profile = {
  gender: number;
  preferred: number;
  age: bigint;
  interestsHash: string;
}

export function ProfileCreator() {
  const { address } = useAccount();
  const queryClient = useQueryClient(); // Hook to manage data fetching

  const { writeContract: mint, data: hash, isPending: isMinting, error } = useWriteContract();

  // This hook waits for the minting transaction to be confirmed
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  // When the transaction is confirmed, automatically refetch all blockchain data
  useEffect(() => {
    if (isConfirmed) {
      toast.success('Profile minted successfully!');
      queryClient.invalidateQueries(); // This tells all useReadContract hooks to refetch
    }
    if (error) {
        toast.error(error.message);
    }
  }, [isConfirmed, error, queryClient]);

  const { data: tokenId, isLoading: isLoadingTokenId } = useReadContract({
    ...profileManagerConfig,
    functionName: 'ownerToTokenId',
    args: [address!],
    query: { enabled: !!address },
  });

  const { data: profileData, isLoading: isLoadingProfile } = useReadContract({
    ...profileManagerConfig,
    functionName: 'getProfile',
    args: [tokenId!],
    query: { enabled: !!tokenId && Number(tokenId) > 0 },
  }) as { data: Profile | undefined; isLoading: boolean };

  const { data: isInPool, isLoading: isLoadingPoolStatus } = useReadContract({
    // ... same as before
  });

  // --- Minting Function (Unchanged) ---
  async function mintProfile(event: React.FormEvent<HTMLFormElement>) {
    // ... same as before
  }

  if (isLoadingTokenId) {
    return <div className="p-4 border rounded-lg text-center animate-pulse">Checking profile status...</div>;
  }
  
  if (tokenId && Number(tokenId) > 0) {
    return (
      <section>
        <h2 className="text-2xl font-bold text-gray-800">Your Profile</h2>
        <div className="mt-4 p-6 border rounded-xl bg-white shadow-sm space-y-3">
          {isLoadingProfile ? <p>Loading profile data...</p> : (
            <>
              <p><strong>Token ID:</strong> <span className="font-mono">{tokenId.toString()}</span></p>
              {profileData && (
                <>
                  <p><strong>Age:</strong> {profileData.age.toString()}</p>
                  <p><strong>Gender:</strong> {GENDER_MAP[profileData.gender]}</p>
                  <p><strong>Preference:</strong> {GENDER_MAP[profileData.preferred]}</p>
                </>
              )}
            </>
          )}
          <div className="pt-3 border-t">
            <p className="font-semibold">Matchmaking Status:</p>
            {isLoadingPoolStatus ? <p>Loading...</p> : isInPool ? (
              <p className="text-green-600 font-bold">✅ You are in the matching pool!</p>
            ) : (
              <p className="text-gray-600">❌ You are not currently in the pool.</p>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-800">Step 1: Create Your Profile</h2>
      <p className="text-sm text-gray-600 mb-4">Mint your soulbound NFT to get started.</p>
      <form onSubmit={mintProfile} className="space-y-4">
        {/* ... form elements are the same ... */}
        <button type="submit" disabled={isMinting || isConfirming} className="w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400">
          {isMinting ? 'Confirming in wallet...' : isConfirming ? 'Minting on-chain...' : 'Mint Profile'}
        </button>
      </form>
    </section>
  );
}