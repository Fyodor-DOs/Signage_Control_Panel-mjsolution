'use client';

import { useState, useEffect, useCallback } from 'react';
import { login as apiLogin } from '@/lib/api';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('signage_token');
    setToken(stored);
    setLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const result = await apiLogin(username, password);
    localStorage.setItem('signage_token', result.token);
    setToken(result.token);
    router.push('/dashboard/devices');
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem('signage_token');
    setToken(null);
    router.push('/login');
  }, [router]);

  return {
    token,
    isAuthenticated: !!token,
    loading,
    login,
    logout,
  };
}
