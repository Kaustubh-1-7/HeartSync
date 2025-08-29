// src/components/Dashboard.tsx (with Debugging Logs)

'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useAccount, useReadContract, useWatchContractEvent } from 'wagmi';
import { useState, useEffect } from 'react';
import { ProfileCreator } from './ProfileCreator';
import { Matchmaking } from './MatchMaking';
import MatchView from './MatchView';
import { Admin } from './admin';
import { matchmakerConfig, profileManagerConfig } from '../contracts';
import type { Log } from 'viem';

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

  const [activeMatchId, setActiveMatchId] = useState<bigint | null>(null);
  const [partnerTokenId, setPartnerTokenId] = useState<bigint | null>(null);

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

  // --- DEBUGGING STARTS HERE ---
  // We are adding console logs to every important step.
  useEffect(() => {
    if (isTokenIdLoaded) {
      console.log(`[DEBUG] User's Token ID has loaded:`, myTokenId?.toString());
    }
  }, [isTokenIdLoaded, myTokenId]);

  useWatchContractEvent({
    ...matchmakerConfig,
    eventName: 'MatchCreated',
    onLogs(logs) {
      // LOG 1: See if the event listener is firing at all.
      console.log('[DEBUG] MatchCreated event detected!', logs);

      if (!isTokenIdLoaded || !myTokenId || Number(myTokenId) === 0) {
        console.log('[DEBUG] Event processing skipped: myTokenId not ready yet.');
        return;
      }

      (logs as MatchCreatedLog[]).forEach(log => {
        const { matchId, userA_TokenId, userB_TokenId } = log.args;

        // LOG 2: See the values we are about to compare.
        console.log(`[DEBUG] Processing log. MyTokenId: ${myTokenId}, Event Tokens: [${userA_TokenId}, ${userB_TokenId}]`);

        if (myTokenId === userA_TokenId) {
          // LOG 3: See if the condition was met.
          console.log('[DEBUG] Match found for User A! Setting state.');
          setActiveMatchId(matchId!);
          setPartnerTokenId(userB_TokenId!);
        }
        if (myTokenId === userB_TokenId) {
          // LOG 3: See if the condition was met.
          console.log('[DEBUG] Match found for User B! Setting state.');
          setActiveMatchId(matchId!);
          setPartnerTokenId(userA_TokenId!);
        }
      });
    },
  });

  return (
    <div>
      <header /* ... */ >
        <div>
          <h1 className="text-2xl font-bold">HeartSync ❤️</h1>
          <p className="text-sm text-gray-500">
            Wallet: {user?.wallet?.address}
          </p>
        </div>
        <button
          onClick={() => {
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