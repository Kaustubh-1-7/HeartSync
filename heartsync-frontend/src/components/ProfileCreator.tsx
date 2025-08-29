// src/components/ProfileCreator.tsx

'use client';

import { useReadContract, useWriteContract } from 'wagmi';
import { profileManagerConfig } from '../contracts'; // Imports our contract config
import { useAccount } from 'wagmi';

export function ProfileCreator() {
  const { address } = useAccount();
  const { writeContract, isPending, data: hash } = useWriteContract();

  // Check if the user already has a profile
  const { data: tokenId, isLoading } = useReadContract({
    ...profileManagerConfig,
    functionName: 'ownerToTokenId',
    args: [address!], // Use the connected wallet address
    query: {
      enabled: !!address, // Only run the query if the user is connected
    },
  });

  async function mintProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    writeContract({
      ...profileManagerConfig,
      functionName: 'mintProfile',
      args: [
        Number(formData.get('gender')),
        Number(formData.get('preferred')),
        Number(formData.get('age')),
        'zkp-hash-placeholder', // This is where the real ZKP hash would go
      ],
    });
  }

  if (isLoading) return <div>Checking profile status...</div>;
  
  if (tokenId && Number(tokenId) > 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold">Your Profile is Ready!</h2>
        <p>Your HeartSync Profile Token ID is: {tokenId.toString()}</p>
      </div>
    );
  }

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
        <button type="submit" disabled={isPending} className="w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400">
          {isPending ? 'Confirming...' : 'Mint Profile'}
        </button>
      </form>
      {hash && <div className="mt-2 text-sm">Transaction Sent: {hash}</div>}
    </div>
  );
}