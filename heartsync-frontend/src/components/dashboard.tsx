// src/components/Dashboard.tsx

'use client';

import { usePrivy } from '@privy-io/react-auth';
import { ProfileCreator } from './ProfileCreator';
import { Matchmaking } from './MatchMaking';

export default function Dashboard() {
  const { user, logout } = usePrivy();

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
          onClick={logout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Log Out
        </button>
      </header>

      <div className="mt-8">
        <ProfileCreator />
        <hr className="my-8" />
        <Matchmaking />
      </div>
    </div>
  );
}