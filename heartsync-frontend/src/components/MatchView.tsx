// src/components/MatchView.tsx

'use client';

import React from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { profileManagerConfig, escrowChatConfig, matchmakerConfig } from '../contracts';

// Define the shape of our data types for TypeScript
type Profile = {
  gender: number;
  preferred: number;
  age: bigint;
  interestsHash: string;
}
type Escrow = {
  depositedA: boolean;
  depositedB: boolean;
  acceptedA: boolean;
  acceptedB: boolean;
}
const GENDER_MAP = ['Male', 'Female', 'Both'];

// The component receives the matchId and partner's tokenId as props
export default function MatchView({ matchId, partnerTokenId }: { matchId: bigint, partnerTokenId: bigint }) {
  const { address } = useAccount();
  const { writeContract: deposit, isPending: isDepositing } = useWriteContract();
  const { writeContract: accept, isPending: isAccepting } = useWriteContract();

  // Hook 1: Get the profile data for the matched partner
  const { data: partnerProfile, isLoading: isLoadingProfile } = useReadContract({
    ...profileManagerConfig,
    functionName: 'getProfile',
    args: [partnerTokenId],
  }) as { data: Profile | undefined; isLoading: boolean };

  // Hook 2: Get the current state of the escrow for this match
  const { data: escrowState, isLoading: isLoadingEscrow } = useReadContract({
    ...escrowChatConfig,
    functionName: 'escrows',
    args: [matchId],
  }) as { data: Escrow | undefined; isLoading: boolean };

  // Hook 3: Get the original match data to know who is UserA and UserB
  const { data: matchData } = useReadContract({
    ...matchmakerConfig,
    functionName: 'matches',
    args: [matchId],
  });
  const userATokenId = Array.isArray(matchData) ? matchData[0] : undefined;

  const myTokenId = useReadContract({
    ...profileManagerConfig,
    functionName: 'ownerToTokenId',
    args: [address!],
  }).data;

  const amIUserA = myTokenId === userATokenId;
  const hasIDeposited = amIUserA ? escrowState?.depositedA : escrowState?.depositedB;

  return (
    <div>
      <h2 className="text-2xl font-bold text-indigo-600">You have a new match!</h2>
      <div className="mt-4 p-4 border rounded-lg bg-white shadow">
    <h3 className="text-lg font-semibold">Your Partner&apos;s Profile (Token ID: {partnerTokenId.toString()})</h3>
        {isLoadingProfile ? <p>Loading partner info...</p> : (
          <div className="text-sm text-gray-700">
            <p><strong>Age:</strong> {partnerProfile?.age.toString()}</p>
            <p><strong>Gender:</strong> {partnerProfile?.gender !== undefined ? GENDER_MAP[partnerProfile.gender] : 'Unknown'}</p>
          </div>
        )}
      </div>

      <div className="mt-8 p-4 border rounded-lg bg-white shadow">
        <h3 className="text-lg font-semibold">Next Steps: Unlock Chat</h3>
        {isLoadingEscrow ? <p>Loading escrow status...</p> : (
          <ul className="space-y-2 mt-2">
            <li className="flex items-center">
              {escrowState?.depositedA && escrowState?.depositedB
                ? <span className="text-green-500">✅ Both users have deposited 0.01 ETH.</span>
                : <span className="text-yellow-600">⏳ Waiting for both users to deposit...</span>
              }
            </li>
            <li className="flex items-center">
              {escrowState?.acceptedA && escrowState?.acceptedB
                ? <span className="text-green-500">✅ Match accepted by both! Funds refunded.</span>
                : <span className="text-yellow-600">⏳ Waiting for both users to accept...</span>
              }
            </li>
          </ul>
        )}

        <div className="mt-4 flex space-x-4">
          <button
            disabled={isDepositing || hasIDeposited}
            onClick={() => deposit({
              ...escrowChatConfig,
              functionName: 'deposit',
              args: [matchId],
              value: BigInt("10000000000000000"), // 0.01 ETH in wei
            })}
            className="flex-1 justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isDepositing ? 'Depositing...' : hasIDeposited ? 'You Have Deposited' : 'Deposit 0.01 ETH'}
          </button>
          <button
            disabled={isAccepting || !(escrowState?.depositedA && escrowState?.depositedB)}
            onClick={() => accept({
              ...escrowChatConfig,
              functionName: 'acceptMatch',
              args: [matchId],
            })}
            className="flex-1 justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 disabled:bg-gray-400"
          >
            {isAccepting ? 'Accepting...' : 'Accept Match'}
          </button>
        </div>
      </div>
    </div>
  );
}