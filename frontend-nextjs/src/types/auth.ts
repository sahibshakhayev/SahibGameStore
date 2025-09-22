export interface LoginDto {
  userName: string
  password: string
}

export interface RegisterDto {
  userName: string
  password: string
  email: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
}

export interface UserClaims {
  userName: string
  roles: string[]
}

export interface RefreshDto {
  expiredAccessToken: string
  refreshToken: string
}
