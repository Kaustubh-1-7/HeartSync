// src/components/Dashboard.tsx (Corrected with Persistent State)

'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useAccount, useReadContract, useWatchContractEvent } from 'wagmi';
import { ProfileCreator } from './ProfileCreator';
import { Matchmaking } from './MatchMaking';
import MatchView from './MatchView';
import { Admin } from './admin';
import { matchmakerConfig, profileManagerConfig } from '../contracts';
import type { Log } from 'viem';
import usePersistentState from '../hooks/usePersistentState'; // 👈 1. IMPORT THE NEW HOOK

type MatchCreatedArgs = {
    matchId?: bigint;
    userA_TokenId?: bigint;
    userB_TokenId?: bigint;
}

type MatchCreatedLog = Log & {
  args: MatchCreatedArgs;
}

export default function Dashboard() {
  const { user, logout } = usePrivy();
  const { address } = useAccount();

  // --- FIX IS HERE: Swap useState for our new persistent hook ---
  const [activeMatchId, setActiveMatchId] = usePersistentState<bigint | null>('activeMatchId', null);
  const [partnerTokenId, setPartnerTokenId] = usePersistentState<bigint | null>('partnerTokenId', null);

  const { data: contractOwner } = useReadContract({
    ...matchmakerConfig,
    functionName: 'owner',
  }) as { data: `0x${string}` | undefined };

  const isOwner = address && contractOwner && address === contractOwner;

  const { data: myTokenId, isSuccess: isTokenIdLoaded } = useReadContract({
    ...profileManagerConfig,
    functionName: 'ownerToTokenId',
    args: [address!],
    query: { enabled: !!address },
  });

  useWatchContractEvent({
    ...matchmakerConfig,
    eventName: 'MatchCreated',
    onLogs(logs) {
      if (!isTokenIdLoaded || !myTokenId || Number(myTokenId) === 0) {
        return;
      }

      (logs as MatchCreatedLog[]).forEach(log => {
        const { matchId, userA_TokenId, userB_TokenId } = log.args;

        if (myTokenId === userA_TokenId) {
          setActiveMatchId(matchId!);
          setPartnerTokenId(userB_TokenId!);
        }
        if (myTokenId === userB_TokenId) {
          setActiveMatchId(matchId!);
          setPartnerTokenId(userA_TokenId!);
        }
      });
    },
  });

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="text-2xl font-bold">HeartSync ❤️</h1>
          <p className="text-sm text-gray-500">
            Wallet: {user?.wallet?.address}
          </p>
        </div>
        <button
          onClick={() => {
            // 3. Ensure we clear the persistent state on logout
            setActiveMatchId(null);
            setPartnerTokenId(null);
            logout();
          }}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Log Out
        </button>
      </header>

      <div className="mt-8">
        {activeMatchId && partnerTokenId ? (
          <MatchView matchId={activeMatchId} partnerTokenId={partnerTokenId} />
        ) : (
          <>
            <ProfileCreator />
            <hr className="my-8" />
            <Matchmaking />
          </>
        )}

        {isOwner && (
          <Admin />
        )}
      </div>
    </div>
  );
}