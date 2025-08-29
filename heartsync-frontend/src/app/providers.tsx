// src/app/providers.tsx

'use client';

import React from 'react';
import { PrivyProvider } from '@privy-io/react-auth';

// --- NEW IMPORTS FOR WAGMI ---
import { WagmiProvider, createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// --- NEW WAGMI CONFIGURATION ---
// This creates a client for React Query, which Wagmi uses for caching.
const queryClient = new QueryClient();

// This creates the configuration object for Wagmi.
export const config = createConfig({
  chains: [sepolia], // We are targeting the Sepolia testnet
  transports: {
    [sepolia.id]: http(), // Use a default public RPC for the chain
  },
});


export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      config={{
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
          logo: 'https://your-logo-url.com/logo.png',
        },
        loginMethods: ['email', 'wallet'],
        defaultChain: sepolia,
        supportedChains: [sepolia],
      }}
    >
      {/* 
        The QueryClientProvider and WagmiProvider are now wrapping your app, 
        inside the PrivyProvider. This makes all wagmi hooks work correctly.
      */}
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}