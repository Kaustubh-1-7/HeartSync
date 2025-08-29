// src/components/Dashboard.tsx (Corrected Version)

'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useAccount, useReadContract, useWatchContractEvent } from 'wagmi';
import { useState } from 'react';
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

  const { data: myTokenId, isSuccess: isTokenIdLoaded } = useReadContract({ // <-- 1. Get the loading status
    ...profileManagerConfig,
    functionName: 'ownerToTokenId',
    args: [address!],
    query: { enabled: !!address },
  });

  useWatchContractEvent({
    ...matchmakerConfig,
    eventName: 'MatchCreated',
    onLogs(logs) {
      // --- FIX IS HERE ---
      // 2. Only process the logs if we have successfully loaded the user's token ID.
      if (!isTokenIdLoaded || !myTokenId || Number(myTokenId) === 0) {
        return; // Don't do anything if we don't know who the user is yet.
      }

      (logs as MatchCreatedLog[]).forEach(log => {
        const { matchId, userA_TokenId, userB_TokenId } = log.args;

        // Check if the current user is part of this match
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