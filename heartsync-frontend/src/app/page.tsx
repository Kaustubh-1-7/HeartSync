// src/app/page.tsx

'use client'; // This is essential! It tells Next.js that this is an interactive component.

import { usePrivy } from '@privy-io/react-auth';
import React from 'react';

export default function Home() {
  // Get the login function and user's authentication state from Privy's hook
  const { login, ready, authenticated, user } = usePrivy();

  // Show a loading state until Privy is ready
  if (!ready) {
    return <p>Loading...</p>;
  }

  return (
    <main style={{ padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="text-2xl font-bold">HeartSync ❤️</h1>
        {/* We will add a logout button here later */}
      </header>

      <div style={{ marginTop: '2rem' }}>
        {authenticated ? (
          // If the user is authenticated, show their wallet info
          <div>
            <h2>Welcome!</h2>
            <p>Your wallet address is:</p>
            {/* The user's embedded wallet is the first in the wallets array */}
            <pre>{user?.wallet?.address}</pre>
          </div>
        ) : (
          // If the user is not authenticated, show a login button
          <button
            onClick={login}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              cursor: 'pointer',
              backgroundColor: '#676FFF',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
            }}
          >
            Log In
          </button>
        )}
      </div>
    </main>
  );
}