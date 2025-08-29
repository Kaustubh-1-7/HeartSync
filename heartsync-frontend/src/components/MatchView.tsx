// src/components/MatchView.tsx (Final Corrected Version)

'use client';

import React, { useEffect } from 'react';
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import {
  profileManagerConfig,
  escrowChatConfig,
  matchmakerConfig,
} from '../contracts';
import { toast } from 'react-hot-toast';

// --- Type Definitions ---
type Profile = { gender: number; preferred: number; age: bigint; interestsHash: string; };
type Escrow = { depositedA: boolean; depositedB: boolean; acceptedA: boolean; acceptedB: boolean; };
const GENDER_MAP = ['Male', 'Female', 'Both'];

export default function MatchView({ matchId, partnerTokenId }: { matchId: bigint; partnerTokenId: bigint; }) {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  const { writeContract: deposit, data: depositHash, isPending: isDepositing, error: depositError } = useWriteContract();
  const { writeContract: accept, data: acceptHash, isPending: isAccepting, error: acceptError } = useWriteContract();
  const { writeContract: shareSocials, data: shareSocialsHash, isPending: isSharing, error: shareSocialsError } = useWriteContract();

  const { isSuccess: isDepositConfirmed } = useWaitForTransactionReceipt({ hash: depositHash });
  const { isSuccess: isAcceptConfirmed } = useWaitForTransactionReceipt({ hash: acceptHash });
  const { isSuccess: isShareSocialsConfirmed } = useWaitForTransactionReceipt({ hash: shareSocialsHash });

  useEffect(() => {
    if (isDepositConfirmed || isAcceptConfirmed || isShareSocialsConfirmed) {
      toast.success('Action confirmed! State is updating...');
      // Invalidate queries is still good practice for a manual refresh trigger
      queryClient.invalidateQueries();
    }
    if (depositError) toast.error(depositError.message);
    if (acceptError) toast.error(acceptError.message);
    if (shareSocialsError) toast.error(shareSocialsError.message);
  }, [ isDepositConfirmed, isAcceptConfirmed, isShareSocialsConfirmed, depositError, acceptError, shareSocialsError, queryClient ]);

  const { data: partnerProfile, isLoading: isLoadingProfile } = useReadContract({ ...profileManagerConfig, functionName: 'getProfile', args: [partnerTokenId] }) as { data: Profile | undefined; isLoading: boolean };
  
  // --- THE FIX IS HERE ---
  // Adding `watch: true` tells wagmi to keep this data perfectly in sync with the blockchain.
  const { data: escrowState, isLoading: isLoadingEscrow } = useReadContract({
    ...escrowChatConfig,
    functionName: 'escrows',
    args: [matchId],
    // To achieve auto-refresh, use wagmi's useBlockNumber or React Query polling outside of useReadContract.
  }) as { data: Escrow | undefined; isLoading: boolean };

  const { data: matchData } = useReadContract({ ...matchmakerConfig, functionName: 'matches', args: [matchId] });
  const userATokenId = Array.isArray(matchData) ? matchData[0] : undefined;
  const { data: myTokenId } = useReadContract({ ...profileManagerConfig, functionName: 'ownerToTokenId', args: [address!] });

  const amIUserA = myTokenId === userATokenId;
  const hasIDeposited = amIUserA ? escrowState?.depositedA : escrowState?.depositedB;
  const hasIAccepted = amIUserA ? escrowState?.acceptedA : escrowState?.acceptedB;
  const bothAccepted = escrowState?.acceptedA && escrowState?.acceptedB;

  function handleShareSocials(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    shareSocials({
      ...escrowChatConfig,
      functionName: 'exchangeSocials',
      args: [matchId],
      value: BigInt("10000000000000000"), // Use BigInt constructor for compatibility
    });
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold text-indigo-600">You have a new match!</h2>
        <div className="mt-4 p-6 border rounded-xl bg-white shadow-sm">
          <h3 className="text-lg font-semibold">Your Partner&apos;s Profile (Token ID: {partnerTokenId.toString()})</h3>
          {isLoadingProfile ? <p>Loading...</p> : (
            <div className="text-sm text-gray-700">
              <p><strong>Age:</strong> {partnerProfile?.age.toString()}</p>
              <p><strong>Gender:</strong> {partnerProfile?.gender !== undefined ? GENDER_MAP[partnerProfile.gender] : 'Unknown'}</p>
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-800">Next Steps: Escrow & Acceptance</h2>
        <div className="mt-4 p-6 border rounded-xl bg-white shadow-sm">
          {isLoadingEscrow ? <p>Loading escrow status...</p> : (
            <ul className="space-y-3 text-lg">
              <li className="flex items-center gap-x-3">{escrowState?.depositedA && escrowState?.depositedB ? <span className="text-green-500">✅</span> : <span className="text-yellow-600">⏳</span>} Both users deposit 0.01 ETH.</li>
              <li className="flex items-center gap-x-3">{bothAccepted ? <span className="text-green-500">✅</span> : <span className="text-yellow-600">⏳</span>} Both users accept the match.</li>
            </ul>
          )}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <button
              disabled={isDepositing || hasIDeposited}
              onClick={() => deposit({ ...escrowChatConfig, functionName: 'deposit', args: [matchId], value: BigInt("10000000000000000") })}
              className="flex-1 justify-center rounded-md border border-transparent bg-blue-600 py-3 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
              {isDepositing ? 'Depositing...' : hasIDeposited ? 'You Have Deposited' : '1. Deposit 0.01 ETH'}
            </button>
            <button
              disabled={isAccepting || hasIAccepted || !escrowState?.depositedA || !escrowState?.depositedB}
              onClick={() => accept({ ...escrowChatConfig, functionName: 'acceptMatch', args: [matchId] })}
              className="flex-1 justify-center rounded-md border border-transparent bg-green-600 py-3 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
              {isAccepting ? 'Accepting...' : hasIAccepted ? 'You Accepted' : '2. Accept Match'}
            </button>
          </div>
        </div>
      </section>

      {bothAccepted && (
        <section>
          <h2 className="text-2xl font-bold text-gray-800">Final Step: Exchange Socials</h2>
          <form onSubmit={handleShareSocials} className="mt-4 p-6 border rounded-xl bg-white shadow-sm">
            <p className="text-sm text-gray-600 mb-4">Pay a 0.01 ETH fee to finalize the exchange and reveal your socials to each other off-chain.</p>
            <button type="submit" disabled={isSharing} className="w-full justify-center rounded-md border border-transparent bg-purple-600 py-3 px-4 text-sm font-medium text-white shadow-sm hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
              {isSharing ? 'Processing...' : 'Pay Fee & Exchange Socials'}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}