// src/components/Dashboard.tsx

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

  // --- FIX IS HERE ---
  // Explicitly type the data from the hook. An address is a string.
  const { data: contractOwner } = useReadContract({
    ...matchmakerConfig,
    functionName: 'owner',
  }) as { data: `0x${string}` | undefined }; // The type for an Ethereum address

  // Now, `isOwner` will be a well-defined boolean, not an 'unknown' type.
  const isOwner = address && contractOwner && address === contractOwner;

  const { data: myTokenId } = useReadContract({
    ...profileManagerConfig,
    functionName: 'ownerToTokenId',
    args: [address!],
    query: { enabled: !!address },
  });

  useWatchContractEvent({
    ...matchmakerConfig,
    eventName: 'MatchCreated',
    onLogs(logs) {
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
          <h1 className="text-2x1 font-bold">HeartSync ❤️</h1>
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

        {/* This line will now work correctly */}
        {isOwner && (
          <Admin />
        )}
      </div>
    </div>
  );
}