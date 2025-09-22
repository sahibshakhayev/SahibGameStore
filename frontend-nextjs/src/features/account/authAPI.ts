// Add these functions to your existing features/account/authAPI.ts

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

// Google OAuth login - using Google Identity Services
export const loginWithGoogle = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if Google Identity Services is loaded
    if (!window.google) {
      reject(new Error('Google Identity Services not loaded'))
      return
    }

    // Initialize Google Identity Services
    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      callback: async (response: any) => {
        try {
          // Send the ID token to your backend

          console.log(response)
          const authResponse = await googleAuth(response.credential)
          
          // Store tokens and redirect will be handled by the component
          if (typeof window !== 'undefined') {
            localStorage.setItem('googleAuthResponse', JSON.stringify(authResponse))
            window.dispatchEvent(new CustomEvent('googleAuthSuccess', { detail: authResponse }))
          }
          
          resolve()
        } catch (error) {
          reject(error)
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    })

    // Show the Google Sign-In prompt
    window.google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed()) {
        reject(new Error('Google Sign-In prompt was not displayed'))
      } else if (notification.isSkippedMoment()) {
        reject(new Error('Google Sign-In was skipped'))
      } else if (notification.isDismissedMoment()) {
        reject(new Error('Google Sign-In was dismissed'))
      }
    })
  })
}

// Send Google ID token to your backend
export const googleAuth = async (idToken: string): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>('/api/Account/GoogleAuth', {
    idToken: idToken
  })
  return res.data
}

// Forgot password
export const forgotPassword = async (email: string) => {
  const res = await api.post('/api/Account/ForgotPassword', { email })
  return res.data
}

// Reset password
export const resetPassword = async (resetData: {
  token: string
  email: string
  newPassword: string
  confirmPassword: string
}) => {
  const res = await api.post('/api/Account/ResetPassword', resetData)
  return res.data
}