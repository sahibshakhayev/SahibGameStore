import api from '../../api/axios'
import type { AuthResponse, LoginDto, RegisterDto, RefreshDto, UserClaims } from '../../types/auth'

export const loginUser = async (credentials: LoginDto): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>('/api/Account/Login', credentials)
  return res.data
}

export const registerUser = async (data: RegisterDto): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>('/api/Account/Register', data)
  return res.data
}

export const getUserClaims = async (): Promise<UserClaims> => {
  const res = await api.get<UserClaims>('/api/Account/UserClaims')
  return res.data
}

export const refreshToken = async (tokens: RefreshDto): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>('/api/Account/Refresh', tokens)
  return res.data
}

export const logoutUser = async (): Promise<void> => {
  await api.post('/api/Account/Logout')
}
