// src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

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
      {/* Add a background color to the body */}
      <body className={`${inter.className} bg-gray-50`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}