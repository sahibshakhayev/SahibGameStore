// src/features/auth/authSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface UserClaims {
  userName: string;
  roles: string[];
  id?: string;
  email?: string;
}

export interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  token: string | null; // This will store the accessToken
  refreshToken: string | null;
  isAuthenticated: boolean;
  user: UserClaims | null;
}

const initialState: AuthState = {
  token: localStorage.getItem('accessToken') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTokens: (state, action: PayloadAction<AuthTokensResponse>) => {
      state.token = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
    },
    setUserClaims: (state, action: PayloadAction<UserClaims>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.user = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
  },
});

export const { setTokens, setUserClaims, logout } = authSlice.actions;
export default authSlice.reducer;