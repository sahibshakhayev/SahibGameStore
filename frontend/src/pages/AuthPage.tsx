// src/pages/AuthPage.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import type { LoginDto, RegisterDto } from '../types/api.ts';
import { AxiosError } from 'axios';

interface AuthPageProps {
  isRegister?: boolean;
}

const AuthPage: React.FC<AuthPageProps> = ({ isRegister = false }) => {
  const { login, register, isLoadingAuth, authError } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister) {
      const registerData: RegisterDto = { email, userName: username, password };
      login({ data: registerData });
    } else {
      const loginData: LoginDto = { userName: username, password };
      login({ data: loginData });
    }
  };

  const getErrorMessage = (error: AxiosError | Error | null | undefined): string => {
    if (!error) return 'An unknown error occurred.';
    if (error instanceof AxiosError) {
      if (error.response?.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
        return (error.response.data as { message: string }).message;
      }
      return error.message;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-cover bg-center"
         style={{ backgroundImage: 'url("/images/your-background-image.jpg")' }}>
      <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-3xl font-bold mb-6 text-center text-indigo-400">
            {isRegister ? 'Register' : 'Login'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-gray-300 text-sm font-bold mb-2">
                Username:
              </label>
              <input
                type="text"
                id="username"
                className="shadow appearance-none border border-gray-700 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-white"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            {isRegister && (
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-300 text-sm font-bold mb-2">
                  Email:
                </label>
                <input
                  type="email"
                  id="email"
                  className="shadow appearance-none border border-gray-700 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-300 text-sm font-bold mb-2">
                Password:
              </label>
              <input
                type="password"
                id="password"
                className="shadow appearance-none border border-gray-700 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {authError && (
              <p className="text-red-500 text-xs italic mb-4">
                {/* --- FIX: Explicitly cast authError to expected error types here --- */}
                {getErrorMessage(authError as AxiosError | Error | null | undefined)}
              </p>
            )}
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                disabled={isLoadingAuth}
              >
                {isLoadingAuth ? 'Loading...' : (isRegister ? 'Register' : 'Sign In')}
              </button>
              <Link to={isRegister ? '/login' : '/register'} className="inline-block align-baseline font-bold text-sm text-indigo-400 hover:text-indigo-200">
                {isRegister ? 'Already have an account? Login' : 'Need an account? Register'}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;