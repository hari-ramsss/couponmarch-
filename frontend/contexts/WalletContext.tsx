'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { BrowserProvider, JsonRpcSigner } from 'ethers';
import {
  connectWallet,
  getWalletState,
  switchToSepolia,
  checkNetwork,
  onAccountsChanged,
  onChainChanged,
  isMetaMaskInstalled,
  WalletState,
} from '@/lib/wallet';

interface WalletContextType {
  wallet: WalletState;
  connect: () => Promise<void>;
  disconnect: () => void;
  ensureSepolia: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    provider: null,
    signer: null,
    isConnected: false,
    chainId: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize wallet state on mount
  useEffect(() => {
    async function init() {
      if (!isMetaMaskInstalled()) {
        setIsLoading(false);
        return;
      }

      try {
        const state = await getWalletState();
        if (state) {
          setWallet(state);
        }
      } catch (err) {
        console.error('Error initializing wallet:', err);
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (!isMetaMaskInstalled()) {
      return;
    }

    const unsubscribeAccounts = onAccountsChanged(async (accounts) => {
      if (accounts.length === 0) {
        setWallet({
          address: null,
          provider: null,
          signer: null,
          isConnected: false,
          chainId: null,
        });
      } else {
        const state = await getWalletState();
        if (state) {
          setWallet(state);
        }
      }
    });

    const unsubscribeChain = onChainChanged(async (chainId) => {
      const state = await getWalletState();
      if (state) {
        setWallet(state);
      }
    });

    return () => {
      unsubscribeAccounts();
      unsubscribeChain();
    };
  }, []);

  const connect = useCallback(async () => {
    try {
      setError(null);
      // No loading state for testing
      // setIsLoading(true);

      if (!isMetaMaskInstalled()) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      const state = await connectWallet();
      setWallet(state);

      // Check if on Sepolia, if not, prompt to switch
      if (state.provider) {
        const isSepolia = await checkNetwork(state.provider);
        if (!isSepolia) {
          await ensureSepolia();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      console.error('Wallet connection error:', err);
    } finally {
      // setIsLoading(false);
    }
  }, []);

  const ensureSepolia = useCallback(async () => {
    try {
      setError(null);
      await switchToSepolia();
      // Refresh wallet state after network switch
      const state = await getWalletState();
      if (state) {
        setWallet(state);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to switch to Sepolia network');
      throw err;
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet({
      address: null,
      provider: null,
      signer: null,
      isConnected: false,
      chainId: null,
    });
    setError(null);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        connect,
        disconnect,
        ensureSepolia,
        isLoading,
        error,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

