// src/components/ProfileCreator.tsx

'use client';

import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { profileManagerConfig, matchmakerConfig } from '../contracts';

// A helper to make gender enums readable
const GENDER_MAP = ['Male', 'Female', 'Both'];

// --- FIX 1: Define the shape of our profile data ---
// This tells TypeScript what to expect from the smart contract.
type Profile = {
  gender: number;
  preferred: number;
  age: bigint; // Smart contract uint256 comes back as a BigInt
  interestsHash: string;
}

export function ProfileCreator() {
  const { address } = useAccount();
  const { writeContract: mint, isPending: isMinting, data: hash } = useWriteContract();

  const { data: tokenId, isLoading: isLoadingTokenId } = useReadContract({
    ...profileManagerConfig,
    functionName: 'ownerToTokenId',
    args: [address!],
    query: {
      enabled: !!address,
    },
  });

  // --- FIX 2: Tell the hook to use our new 'Profile' type ---
  const { data: profileData, isLoading: isLoadingProfile } = useReadContract({
    ...profileManagerConfig,
    functionName: 'getProfile',
    args: [tokenId!],
    query: {
      enabled: !!tokenId && Number(tokenId) > 0,
    },
  }) as { data: Profile | undefined; isLoading: boolean }; // Type assertion here

  const { data: isInPool, isLoading: isLoadingPoolStatus } = useReadContract({
    ...matchmakerConfig,
    functionName: 'isInPool',
    args: [address!],
    query: {
      enabled: !!address && !!tokenId && Number(tokenId) > 0,
    },
  });

  async function mintProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    mint({
      ...profileManagerConfig,
      functionName: 'mintProfile',
      args: [
        Number(formData.get('gender')),
        Number(formData.get('preferred')),
        Number(formData.get('age')),
        'zkp-hash-placeholder',
      ],
    });
  }

  if (isLoadingTokenId) {
    return <div className="p-4 border rounded-lg text-center">Checking profile status...</div>;
  }

  if (tokenId && Number(tokenId) > 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold">Your Profile</h2>
        <div className="mt-4 p-4 border rounded-lg bg-gray-50 space-y-2">
          {isLoadingProfile ? (
            <p>Loading profile data...</p>
          ) : (
            <>
              <p><strong>Token ID:</strong> {tokenId.toString()}</p>
              {/* --- FIX 3: Add a check to make sure profileData is not undefined --- */}
              {profileData && (
                <>
                  <p><strong>Age:</strong> {profileData.age.toString()}</p>
                  <p><strong>Gender:</strong> {GENDER_MAP[profileData.gender]}</p>
                  <p><strong>Preference:</strong> {GENDER_MAP[profileData.preferred]}</p>
                </>
              )}
            </>
          )}

          <div className="pt-2 border-t">
            <p className="font-semibold">Matchmaking Status:</p>
            {isLoadingPoolStatus ? (
              <p>Loading pool status...</p>
            ) : isInPool ? (
              <p className="text-green-600 font-bold">✅ You are in the matching pool!</p>
            ) : (
              <p className="text-gray-600">❌ You are not currently in the pool.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ... rest of the component (the form) is unchanged ...
  return (
    <div>
      <h2 className="text-xl font-semibold">Step 1: Create Your Profile</h2>
      <p className="text-sm text-gray-600 mb-4">Mint your soulbound NFT to get started.</p>
      <form onSubmit={mintProfile} className="space-y-4">
        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age</label>
          <input name="age" id="age" type="number" placeholder="25" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
        </div>
        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Your Gender</label>
          <select name="gender" id="gender" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
            <option value="0">Male</option>
            <option value="1">Female</option>
          </select>
        </div>
        <div>
          <label htmlFor="preferred" className="block text-sm font-medium text-gray-700">Preferred Partner Gender</label>
          <select name="preferred" id="preferred" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
            <option value="0">Male</option>
            <option value="1">Female</option>
            <option value="2">Both</option>
          </select>
        </div>
        <button type="submit" disabled={isMinting} className="w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400">
          {isMinting ? 'Confirming...' : 'Mint Profile'}
        </button>
      </form>
      {hash && <div className="mt-2 text-sm">Transaction Sent: {hash}</div>}
    </div>
  );
}