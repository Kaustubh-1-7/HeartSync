# HeartSync ❤️

**HeartSync is a decentralized dating platform prototype built on the Ethereum blockchain, designed to address the critical privacy and fairness issues of modern dating apps by leveraging Web3 technologies.**

---

## Live Demo 

**🔗 Live Application URL:** **[heart-sync-eight.vercel.app]([YOUR_VERCEL_URL])**

---

## Table of Contents

- [About The Project](#about-the-project)
- [Core Features](#core-features)
- [Technical Implementation](#technical-implementation)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation & Setup](#installation--setup)
- [Future Improvements](#future-improvements)
- [License](#license)

## About The Project

HeartSync was built to demonstrate a practical, real-world use case for blockchain technology beyond finance. It serves as a proof-of-concept for a dating application that prioritizes user data sovereignty and verifiable fairness over the opaque, data-driven algorithms of traditional Web2 platforms.

The project combines on-chain smart contracts for core logic with a modern, reactive frontend to create a seamless and secure user experience.

### Unique Value Proposition

*   **Verifiable Fairness:** Matchmaking is driven by Chainlink's Verifiable Random Function (VRF), ensuring pairings are genuinely random and cannot be manipulated by the platform.
*   **Privacy-Preserving Identity:** User identity is a soulbound (non-transferable) NFT. The project architecture is designed for a future where Zero-Knowledge Proofs (ZKPs) can verify user attributes (like age) without revealing sensitive data.
*   **Sybil Resistance:** An on-chain escrow system requires a small, refundable ETH deposit to unlock interaction, disincentivizing spam and ensuring both parties are serious about the connection.

## Core Features

- ✅ **Soulbound NFT Profiles:** Users mint a unique, non-transferable ERC721 token as their on-chain identity.
- 🎲 **Verifiably Random Matchmaking:** An admin-controlled function uses Chainlink VRF to create provably random and fair matches between users in a pool.
- 🔐 **On-Chain Escrow:** Matched users deposit a small amount of ETH to an escrow. Funds are automatically refunded to both parties upon mutual acceptance.
- 🔄 **Real-Time UI Updates:** The frontend is fully reactive, automatically updating a user's profile and match status as transactions are confirmed on the blockchain.
- 🔒 **Admin Panel:** A secure, owner-only UI panel allows for the controlled triggering of matchmaking rounds.
- 🏠 **Persistent State:** The application state (like your active match) is saved in the browser, providing a smooth user experience that survives page refreshes.

## Technical Implementation

HeartSync is a full-stack dApp combining on-chain smart contracts with a modern off-chain frontend.

### Smart Contracts (Solidity)
*   **`ProfileManager.sol`**: An ERC721 contract for minting and managing soulbound NFT profiles.
*   **`MatchmakerVRF.sol`**: Manages the matchmaking pool and integrates with **Chainlink VRF v2.5 (Plus)** to create random pairings.
*   **`EscrowChat.sol`**: Manages the post-match deposit, acceptance, and fee logic.
*   **Blockchain:** Deployed on the **Sepolia Testnet**.

### Frontend (Next.js / React)
*   **Framework:** **Next.js** with TypeScript and the App Router.
*   **Authentication:** **Privy** for a seamless Web3 onboarding experience with both external wallets (MetaMask) and embedded wallets (email/social).
*   **Blockchain Interaction:** **Wagmi** and **Viem** for reading from, writing to, and listening for events from the smart contracts.
*   **Styling:** **Tailwind CSS** for a clean, modern, and responsive UI.
*   **Notifications:** **React Hot Toast** for user-friendly transaction status updates.

### Infrastructure
*   **Deployment:** The frontend is deployed globally via **Vercel**, with a CI/CD pipeline linked to this GitHub repository.
*   **RPC Provider:** A dedicated **Alchemy** RPC endpoint ensures stable and reliable communication with the Sepolia blockchain.

## Getting Started

To run a local copy of this project, follow these simple steps.

### Prerequisites

*   **Node.js** (v18 or later)
*   **npm** or **yarn**
*   A Web3 wallet like **MetaMask** connected to the Sepolia testnet.
*   Sepolia ETH and LINK for testing (available from public faucets).

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/heartsync-frontend.git
    cd heartsync-frontend
    ```

2.  **Install NPM packages:**
    ```bash
    npm install
    ```

3.  **Set up your Environment Variables:**
    *   Create a file named `.env.local` in the root of the project.
    *   You will need to get API keys from the following services:
        *   **Privy:** Create a project at [console.privy.io](https://console.privy.io/).
        *   **Alchemy:** Create a Sepolia App at [alchemy.com](https://alchemy.com).
    *   Add the following to your `.env.local` file:
        ```env
        NEXT_PUBLIC_PRIVY_APP_ID=YOUR_PRIVY_APP_ID
        NEXT_PUBLIC_ALCHEMY_RPC_URL=YOUR_ALCHEMY_HTTPS_RPC_URL
        ```

4.  **Deploy the Smart Contracts:**
    *   The contracts are in the `/contracts` directory (if you include them). You will need to deploy `ProfileManager.sol`, `MatchmakerVRF.sol`, and `EscrowChat.sol` to the Sepolia testnet using a tool like Remix or Hardhat.
    *   After deploying, go to `src/contracts/index.ts` and replace the placeholder addresses with your newly deployed contract addresses.

5.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Future Improvements

-   **Full ZKP Integration:** Implement on-chain verifier contracts for the ZKP circuits to enable truly private profile verification.
-   **Chainlink Automation:** Replace the owner-triggered matchmaking with Chainlink Automation (Keepers) for a fully decentralized and automated system.
-   **DAO Governance:** Transition control of the treasury and key platform parameters to a DAO governed by token holders.
-   **Off-Chain Communication:** Integrate a decentralized messaging protocol (e.g., XMTP) to allow for private, encrypted chat between matched users.


