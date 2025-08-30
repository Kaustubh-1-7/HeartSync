// src/app/providers.tsx (Final Type-Safe Version)

'use client';

import React from 'react';
// --- FIX: Import the 'User' type from Privy ---
import { PrivyProvider, User } from '@privy-io/react-auth';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient();

export const config = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL),
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  // --- FIX: Use the official 'User' type instead of 'any' ---
  // const handleLogin = (user: User) => {
  //   console.log(`User logged in: ${user.id}`);
  // };

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      config={{
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
        },
        loginMethods: ['email', 'wallet'],
        defaultChain: sepolia,
        supportedChains: [sepolia],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          {children}
          <Toaster />
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}