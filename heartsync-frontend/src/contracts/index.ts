// src/contracts/index.ts

import profileManagerABI from './profileManagerABI.json';
import matchmakerABI from './matchmakerVRF_ABI.json';
import escrowChatABI from './escrowChatABI.json';

// 1. ProfileManager Contract
export const profileManagerAddress = '0x82a258D30E1E50182Ec9A938b1A81253F213E6E5' as const; 
export const profileManagerConfig = {
  address: profileManagerAddress,
  abi: profileManagerABI,
} as const;

// 2. MatchmakerVRF Contract
export const matchmakerAddress = '0xAb50fF3A58506Fd064768d213841CD08c62594da' as const; 
export const matchmakerConfig = {
  address: matchmakerAddress,
  abi: matchmakerABI,
} as const;

// 3. EscrowChat Contract
export const escrowChatAddress = '0x02bD6eCF3E593EBFBf1a121103944884976A5d5a' as const; 
export const escrowChatConfig = {
  address: escrowChatAddress,
  abi: escrowChatABI,
} as const;