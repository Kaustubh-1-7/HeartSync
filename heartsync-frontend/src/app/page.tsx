// src/app/page.tsx

'use client';

import { usePrivy } from '@privy-io/react-auth';
import React from 'react';
import Dashboard from '@/components/dashboard'; // Using the '@' alias for a clean import

export default function Home() {
  const { login, ready, authenticated } = usePrivy();

  // Show a loading state until Privy is ready
  if (!ready) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
      {authenticated ? (
        // If the user is authenticated, show the main dashboard
        <Dashboard />
      ) : (
        // If the user is not authenticated, show a centered login page
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to HeartSync ❤️</h1>
          <p className="text-lg text-gray-600 mb-8">The decentralized dating platform of the future.</p>
          <button
            onClick={login}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg text-lg"
          >
            Log In to Get Started
          </button>
        </div>
      )}
    </main>
  );
}