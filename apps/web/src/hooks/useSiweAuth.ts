// apps/web/src/hooks/useSiweAuth.ts
'use client';

import { useCallback, useState } from 'react';
import { SiweMessage } from 'siwe';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/authStore';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on?: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}

function normalizeAddress(address: string): string {
  return address.toLowerCase();
}

function parseChainId(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    return value.startsWith('0x') ? Number(value) : Number.parseInt(value, 10);
  }
  return 1;
}

export function useSiweAuth() {
  const { setAuth, logout, walletAddress } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error('No Ethereum wallet found in browser');
    }

    const accounts = (await window.ethereum.request({ method: 'eth_requestAccounts' })) as string[];
    if (!accounts?.[0]) {
      throw new Error('No wallet account available');
    }

    return normalizeAddress(accounts[0]);
  }, []);

  const signIn = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const address = await connectWallet();
      const chainIdValue = await window.ethereum?.request({ method: 'eth_chainId' });
      const chainId = parseChainId(chainIdValue);

      const { nonce } = await authApi.nonce(address);
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign in to Normies Alpha',
        uri: window.location.origin,
        version: '1',
        chainId,
        nonce,
      }).prepareMessage();

      const signature = (await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address],
      })) as string;

      const { token, user } = await authApi.verify(address, signature, message);
      setAuth(token, user.id, user.primaryWallet ?? address);
      return address;
    } catch (err: any) {
      setError(err?.message ?? 'Sign-in failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [connectWallet, setAuth]);

  return {
    signIn,
    logout,
    isLoading,
    error,
    walletAddress,
  };
}
