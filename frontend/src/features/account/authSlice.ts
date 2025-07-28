import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { type UserClaims, type AuthResponse } from '../../types/auth'

interface AuthState extends Partial<UserClaims>, Partial<AuthResponse> {}

const initialState: AuthState = {
  userName: undefined,
  roles: [],
  accessToken: "",
  refreshToken: "",
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<UserClaims & AuthResponse>) => {
      state.userName = action.payload.userName
      state.roles = action.payload.roles
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
    },
    logout: (state) => {
      state.userName = ""
      state.roles = []
      state.accessToken = ""
      state.refreshToken = ""
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer
