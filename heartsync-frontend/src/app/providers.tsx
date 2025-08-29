// src/app/providers.tsx

'use client'; // This is very important! It marks the component as a Client Component.

import React from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import { sepolia } from 'viem/chains';

export default function Providers({ children }: { children: React.ReactNode }) {
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
      {children}
    </PrivyProvider>
  );
}