'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../features/account/authSlice';
import { getAuthFromStorage } from '@/utils/tokenStorage';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const storedAuth = getAuthFromStorage();
    if (storedAuth) {
      dispatch(
        setCredentials({
          userName: storedAuth.userName,
          roles: storedAuth.roles,
          accessToken: storedAuth.accessToken,
          refreshToken: storedAuth.refreshToken,
        })
      );
    }
  }, [dispatch]);

  return <>{children}</>;
}
