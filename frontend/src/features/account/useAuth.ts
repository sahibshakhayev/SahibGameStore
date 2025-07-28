import { useDispatch } from 'react-redux'
import { useAppSelector } from '../../hooks/useAppSelector'
import { setCredentials, logout } from './authSlice'
import { getUserClaims, logoutUser as LogoutUserApi } from './authAPI'
import { type AuthResponse, type UserClaims } from '../../types/auth'
import { saveAuthToStorage, clearAuthFromStorage } from '../../utils/tokenStorage'
import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addToCart } from '../cart/cartAPI'

export const useAuth = () => {
  const dispatch = useDispatch()
  const auth = useAppSelector((state) => state.auth)
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()

  // Add to cart mutation for pending actions
  const addToCartMutation = useMutation({
    mutationFn: addToCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  // Listen for auth events from axios interceptor
  useEffect(() => {
    const handleLogout = () => {
      clearAuthFromStorage()
      dispatch(logout())
    }

    const handleRedirectToLogin = (event: CustomEvent) => {
      const returnUrl = event.detail?.returnUrl || location.pathname
      navigate('/login', { 
        replace: true,
        state: { 
          from: returnUrl,
          message: 'Your session has expired. Please log in again.' 
        }
      })
    }

    window.addEventListener('auth:logout', handleLogout)
    window.addEventListener('auth:redirectToLogin', handleRedirectToLogin as EventListener)
    
    return () => {
      window.removeEventListener('auth:logout', handleLogout)
      window.removeEventListener('auth:redirectToLogin', handleRedirectToLogin as EventListener)
    }
  }, [dispatch, navigate, location.pathname])

  const loginWithTokens = async ({ accessToken, refreshToken }: AuthResponse) => {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)

    const userInfo: UserClaims = await getUserClaims()

    saveAuthToStorage({
      accessToken,
      refreshToken,
      userName: userInfo.userName,
      roles: userInfo.roles,
    })

    dispatch(
      setCredentials({
        userName: userInfo.userName,
        roles: userInfo.roles,
        accessToken,
        refreshToken,
      })
    )

    // Handle pending cart action after successful login
    const pendingAction = sessionStorage.getItem('pendingCartAction')
    if (pendingAction) {
      try {
        const { gameId, quantity, returnUrl } = JSON.parse(pendingAction)
        
        // Add item to cart
        await addToCartMutation.mutateAsync({ gameId, quantity })
        
        // Clear pending action
        sessionStorage.removeItem('pendingCartAction')
        
        // Navigate back to the game page
        if (returnUrl) {
          navigate(returnUrl, { replace: true })
        }
      } catch (error) {
        console.error('Failed to process pending cart action:', error)
        sessionStorage.removeItem('pendingCartAction')
      }
    }
  }

  const logoutUser = async () => {
    try {
      await LogoutUserApi()
    } catch (err) {
      console.error('Logout failed, proceeding with client logout anyway', err)
    } finally {
      clearAuthFromStorage()
      dispatch(logout())
      
      // Clear any pending actions
      sessionStorage.removeItem('pendingCartAction')
      
      // If user manually logs out from a protected route, redirect to login
      const protectedRoutes = ['/account', '/orders', '/cart', '/checkout']
      const currentPath = window.location.pathname
      const isOnProtectedRoute = protectedRoutes.some(route => currentPath.startsWith(route))
      
      if (isOnProtectedRoute) {
        navigate('/', { replace: true })
      }
    }
  }

  return {
    ...auth,
    loginWithTokens,
    logoutUser,
  }
}