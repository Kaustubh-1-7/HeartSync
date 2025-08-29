// src/components/Dashboard.tsx

'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { ProfileCreator } from './ProfileCreator';
import { Matchmaking } from './MatchMaking';
import MatchView from './MatchView';
import { Admin } from './admin';
import { matchmakerConfig, profileManagerConfig } from '../contracts';
import type { Log } from 'viem';
import usePersistentState from '../hooks/usePersistentState';
import { toast } from 'react-hot-toast';

// --- Type Definitions ---
type MatchCreatedArgs = { matchId?: bigint; userA_TokenId?: bigint; userB_TokenId?: bigint; }
type MatchCreatedLog = Log & { args: MatchCreatedArgs; }
type Profile = { gender: number; preferred: number; age: bigint; interestsHash: string; }

export default function Dashboard() {
  const { user, logout } = usePrivy();
  const { address } = useAccount();
  const queryClient = useQueryClient();

  const [activeMatchId, setActiveMatchId] = usePersistentState<bigint | null>('activeMatchId', null);
  const [partnerTokenId, setPartnerTokenId] = usePersistentState<bigint | null>('partnerTokenId', null);

  const { data: contractOwner } = useReadContract({ ...matchmakerConfig, functionName: 'owner' }) as { data: `0x${string}` | undefined };
  const { data: myTokenId, isLoading: isLoadingTokenId } = useReadContract({ ...profileManagerConfig, functionName: 'ownerToTokenId', args: [address!], query: { enabled: !!address } });
  const { data: profileData, isLoading: isLoadingProfile } = useReadContract({ ...profileManagerConfig, functionName: 'getProfile', args: [myTokenId!], query: { enabled: !!myTokenId && Number(myTokenId) > 0 } }) as { data: Profile | undefined; isLoading: boolean };
  const { data: isInPool, isLoading: isLoadingPoolStatus } = useReadContract({ ...matchmakerConfig, functionName: 'isInPool', args: [address!], query: { enabled: !!address && !!myTokenId && Number(myTokenId) > 0 } });

  const { writeContract: mint, data: mintHash, isPending: isMinting, error: mintError } = useWriteContract();
  const { writeContract: enterPool, data: enterPoolHash, isPending: isEnteringPool, error: enterPoolError } = useWriteContract();

  const { isLoading: isMintConfirming, isSuccess: isMintConfirmed } = useWaitForTransactionReceipt({ hash: mintHash });
  const { isLoading: isEnterPoolConfirming, isSuccess: isEnterPoolConfirmed } = useWaitForTransactionReceipt({ hash: enterPoolHash });

  useWatchContractEvent({
    ...matchmakerConfig, eventName: 'MatchCreated',
    onLogs(logs) {
      if (!myTokenId || Number(myTokenId) === 0) return;
      (logs as MatchCreatedLog[]).forEach(log => {
        const { matchId, userA_TokenId, userB_TokenId } = log.args;
        if (myTokenId === userA_TokenId) { setActiveMatchId(matchId!); setPartnerTokenId(userB_TokenId!); }
        if (myTokenId === userB_TokenId) { setActiveMatchId(matchId!); setPartnerTokenId(userA_TokenId!); }
      });
    },
  });

  useEffect(() => {
    if (isMintConfirmed || isEnterPoolConfirmed) {
      toast.success('Success! Your status has been updated.');
      queryClient.invalidateQueries();
    }
    if (mintError) toast.error(mintError.message);
    if (enterPoolError) toast.error(enterPoolError.message);
  }, [isMintConfirmed, isEnterPoolConfirmed, mintError, enterPoolError, queryClient]);

  const isOwner = address && contractOwner && address === contractOwner;

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">HeartSync ❤️</h1>
          <p className="text-sm text-gray-500 font-mono break-all">{user?.wallet?.address}</p>
        </div>
        <button
          onClick={() => { setActiveMatchId(null); setPartnerTokenId(null); logout(); }}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow"
        >
          Log Out
        </button>
      </header>
      <main className="space-y-12">
        {activeMatchId && partnerTokenId ? (
          <MatchView matchId={activeMatchId} partnerTokenId={partnerTokenId} />
        ) : (
          <>
            <ProfileCreator
              onMint={mint}
              isMinting={isMinting}
              isConfirming={isMintConfirming}
              tokenId={myTokenId as bigint | undefined}
              profileData={profileData}
              isInPool={isInPool === true}
              isLoading={isLoadingTokenId || isLoadingProfile || isLoadingPoolStatus}
            />
            <Matchmaking
              onEnterPool={enterPool}
              isEnteringPool={isEnteringPool}
              isConfirming={isEnterPoolConfirming}
            />
          </>
        )}
        {isOwner && <Admin />}
      </main>
    </div>
  );
}