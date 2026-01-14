import { BrowserProvider, Eip1193Provider, JsonRpcSigner } from 'ethers';
import { NETWORK_CONFIG, SEPOLIA_CHAIN_ID } from './contracts';

/**
 * Wallet connection and management utilities
 */

export interface WalletState {
  address: string | null;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  isConnected: boolean;
  chainId: number | null;
}

/**
 * Check if MetaMask is installed
 */
export function isMetaMaskInstalled(): boolean {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
}

/**
 * Request account access from MetaMask
 */
export async function connectWallet(): Promise<WalletState> {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
  }

  const provider = new BrowserProvider(window.ethereum as Eip1193Provider);

  // Request account access
  await provider.send('eth_requestAccounts', []);

  // Get signer
  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  // Get network
  const network = await provider.getNetwork();
  const chainId = Number(network.chainId);

  return {
    address,
    provider,
    signer,
    isConnected: true,
    chainId,
  };
}

/**
 * Switch to Sepolia testnet
 */
export async function switchToSepolia(): Promise<void> {
  if (!isMetaMaskInstalled() || !window.ethereum) {
    throw new Error('MetaMask is not installed.');
  }

  const ethereum = window.ethereum;

  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: NETWORK_CONFIG.chainId }],
    });
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [NETWORK_CONFIG],
        });
      } catch (addError) {
        throw new Error('Failed to add Sepolia network to MetaMask.');
      }
    } else {
      throw switchError;
    }
  }
}

/**
 * Check if connected to Sepolia
 */
export async function checkNetwork(provider: BrowserProvider): Promise<boolean> {
  const network = await provider.getNetwork();
  return Number(network.chainId) === SEPOLIA_CHAIN_ID;
}

/**
 * Get current wallet state
 */
export async function getWalletState(): Promise<WalletState | null> {
  if (!isMetaMaskInstalled() || !window.ethereum) {
    return null;
  }

  try {
    const provider = new BrowserProvider(window.ethereum as Eip1193Provider);
    const accounts = await provider.listAccounts();

    if (accounts.length === 0) {
      return {
        address: null,
        provider: null,
        signer: null,
        isConnected: false,
        chainId: null,
      };
    }

    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);

    return {
      address,
      provider,
      signer,
      isConnected: true,
      chainId,
    };
  } catch (error) {
    console.error('Error getting wallet state:', error);
    return null;
  }
}

/**
 * Listen for account changes
 */
export function onAccountsChanged(callback: (accounts: string[]) => void): () => void {
  if (!isMetaMaskInstalled() || !window.ethereum) {
    return () => { };
  }

  const ethereum = window.ethereum;
  ethereum.on('accountsChanged', callback);

  return () => {
    ethereum.removeListener('accountsChanged', callback);
  };
}

/**
 * Listen for chain changes
 */
export function onChainChanged(callback: (chainId: string) => void): () => void {
  if (!isMetaMaskInstalled() || !window.ethereum) {
    return () => { };
  }

  const ethereum = window.ethereum;
  ethereum.on('chainChanged', callback);

  return () => {
    ethereum.removeListener('chainChanged', callback);
  };
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

