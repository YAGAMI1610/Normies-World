// apps/web/src/hooks/useSiweAuth.ts
'use client';

import { useAccount, useSignMessage } from 'wagmi';
import { SiweMessage } from 'siwe';
import { useCallback, useState } from 'react';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/authStore';

export function useSiweAuth() {
  const { address, chainId } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { setAuth, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = useCallback(async () => {
    if (!address || !chainId) return;
    setIsLoading(true);
    setError(null);
    try {
      const { nonce } = await authApi.nonce(address);
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign in to Normies Alpha',
        uri: window.location.origin,
        version: '1',
        chainId,
        nonce,
      });
      const preparedMessage = message.prepareMessage();
      const signature = await signMessageAsync({ message: preparedMessage });
      const { token, user } = await authApi.verify(address, signature, preparedMessage);
      setAuth(token, user.id, user.primaryWallet);
    } catch (err: any) {
      setError(err?.message ?? 'Sign-in failed');
    } finally {
      setIsLoading(false);
    }
  }, [address, chainId, signMessageAsync, setAuth]);

  return { signIn, logout, isLoading, error };
}
