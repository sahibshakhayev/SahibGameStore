import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useSegments } from 'expo-router';
import { api } from './api';
import { googleAuthService } from './googleAuth';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (userName: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, userName: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const segments = useSegments();

  useEffect(() => {
    checkAuthState();
  }, []);

  // Handle navigation based on auth state
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Redirect to main app if authenticated
      router.replace('/(tabs)');
    }
  }, [user, segments, isLoading]);

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        const userData = await api.getUserClaims();
        
        // Check if user was signed in with Google
        const isGoogleUser = await AsyncStorage.getItem('isGoogleUser');
        
        setUser({ ...userData, isGoogleUser: isGoogleUser === 'true' });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear invalid token
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'isGoogleUser']);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userName: string, password: string) => {
    const response = await api.login(userName, password);
    await AsyncStorage.setItem('accessToken', response.accessToken);
    await AsyncStorage.setItem('refreshToken', response.refreshToken);
    await AsyncStorage.setItem('isGoogleUser', 'false');
    const userData = await api.getUserClaims();
    setUser({ ...userData, isGoogleUser: false });
  };

  const loginWithGoogle = async () => {
    try {
      console.log('Starting Google login...');
      const googleResult = await googleAuthService.signIn();
      
      if (!googleResult.idToken) {
        throw new Error('No ID token received from Google');
      }

      console.log('Sending ID token to backend...');
      const response = await api.googleAuth(googleResult.idToken);
      
      await AsyncStorage.setItem('accessToken', response.accessToken);
      await AsyncStorage.setItem('refreshToken', response.refreshToken);
      await AsyncStorage.setItem('isGoogleUser', 'true');
      
      const userData = await api.getUserClaims();
      setUser({ ...userData, isGoogleUser: true });
      
      console.log('Google login successful');
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    }
  };

  const register = async (email: string, userName: string, password: string) => {
    await api.register(email, userName, password);
  };

  const logout = async () => {
    try {
      await api.logout();
      
      // Sign out from Google if user was signed in with Google
      if (user?.isGoogleUser) {
        await googleAuthService.signOut();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'isGoogleUser']);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, loginWithGoogle, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};