// src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers"; // Import the new provider component

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HeartSync",
  description: "Decentralized Dating Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers> {/* Wrap your app with the provider */}
      </body>
    </html>
  );
}