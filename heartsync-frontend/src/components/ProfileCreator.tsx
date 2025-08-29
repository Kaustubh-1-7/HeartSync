// src/components/ProfileCreator.tsx

'use client';

import { profileManagerConfig } from '../contracts';
// --- FIX: Import the official types from wagmi ---
import type { Config } from 'wagmi';
import type { WriteContractMutate } from 'wagmi/query';

const GENDER_MAP = ['Male', 'Female', 'Both'];

// --- FIX: Use the official wagmi types for the component's props ---
type ProfileCreatorProps = {
  onMint: WriteContractMutate<Config, unknown>;
  isMinting: boolean;
  isConfirming: boolean;
  tokenId?: bigint;
  profileData?: { age: bigint; gender: number; preferred: number; };
  isInPool: boolean;
  isLoading: boolean;
};

export function ProfileCreator({ onMint, isMinting, isConfirming, tokenId, profileData, isInPool, isLoading }: ProfileCreatorProps) {
  
  function handleMint(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    onMint({
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

  if (isLoading) {
    return <div className="p-6 border rounded-xl bg-white shadow-sm text-center animate-pulse">Checking profile status...</div>;
  }
  
  if (tokenId && Number(tokenId) > 0) {
    return (
      <section>
        <h2 className="text-2xl font-bold text-gray-800">Your Profile</h2>
        <div className="mt-4 p-6 border rounded-xl bg-white shadow-sm space-y-3">
          <p><strong>Token ID:</strong> <span className="font-mono">{tokenId.toString()}</span></p>
          {profileData && (
            <>
              <p><strong>Age:</strong> {profileData.age.toString()}</p>
              <p><strong>Gender:</strong> {GENDER_MAP[profileData.gender]}</p>
              <p><strong>Preference:</strong> {GENDER_MAP[profileData.preferred]}</p>
            </>
          )}
          <div className="pt-3 border-t">
            <p className="font-semibold">Matchmaking Status:</p>
            {isInPool ? (
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
      <form onSubmit={handleMint} className="space-y-4 p-6 border rounded-xl bg-white shadow-sm">
        {/* Form inputs are unchanged */}
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
        <button type="submit" disabled={isMinting || isConfirming} className="w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed">
          {isMinting ? 'Confirming in wallet...' : isConfirming ? 'Minting on-chain...' : 'Mint Profile'}
        </button>
      </form>
    </section>
  );
}