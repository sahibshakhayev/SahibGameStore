import axios from 'axios'
import { refreshToken } from '../features/account/authAPI'
import type { RefreshDto } from '../types/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
})

// Flag to prevent multiple refresh attempts
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: any) => void
  reject: (error?: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })
  
  failedQueue = []
}


const protectedRoutes = ['/account', '/orders', '/cart', '/checkout']

const isProtectedRoute = (path: string): boolean => {
  return protectedRoutes.some(route => path.startsWith(route))
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(() => {
          const token = localStorage.getItem('accessToken')
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`
          }
          return api(originalRequest)
        }).catch(err => {
          return Promise.reject(err)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const storedAccessToken = localStorage.getItem('accessToken')
        const storedRefreshToken = localStorage.getItem('refreshToken')

        if (!storedAccessToken || !storedRefreshToken) {
          throw new Error('No refresh token available')
        }

        const refreshData: RefreshDto = {
          expiredAccessToken: storedAccessToken,
          refreshToken: storedRefreshToken
        }

        const response = await refreshToken(refreshData)
        
        // Update stored tokens
        localStorage.setItem('accessToken', response.accessToken)
        localStorage.setItem('refreshToken', response.refreshToken)

        // Update the authorization header for the original request
        originalRequest.headers.Authorization = `Bearer ${response.accessToken}`

        processQueue(null, response.accessToken)
        
        return api(originalRequest)

      } catch (refreshError) {
        processQueue(refreshError, null)
        
        // Clear tokens
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('authState')
        localStorage.removeItem('userName')
        localStorage.removeItem('roles')
        
        // Check if current page is a protected route
        const currentPath = window.location.pathname
        const shouldRedirectToLogin = isProtectedRoute(currentPath)
        
        // Dispatch logout event
        window.dispatchEvent(new CustomEvent('auth:logout'))
        
        // If on protected route, redirect to login
        if (shouldRedirectToLogin) {
          window.dispatchEvent(new CustomEvent('auth:redirectToLogin', {
            detail: { returnUrl: currentPath }
          }))
        }
        
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api