'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Lock, Mail, GamepadIcon } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Label } from '../../components/ui/label'
import { loginUser, loginWithGoogle, forgotPassword } from '../../features/account/authAPI'
import { useAuth } from '../../features/account/useAuth'
import type { LoginDto, AuthResponse } from '../../types/auth'

// Declare Google Identity Services types
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: any) => void
            auto_select?: boolean
            cancel_on_tap_outside?: boolean
            use_fedcm_for_prompt?: boolean
          }) => void
          prompt: (callback?: (notification: any) => void) => void
          cancel: () => void
          disableFedCM?: () => void
        }
      }
    }
  }
}

const LoginPage = () => {
  const [formData, setFormData] = useState<LoginDto>({
    userName: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const router = useRouter()
  const searchParams = useSearchParams()
  const { loginWithTokens } = useAuth()

  // Load Google Identity Services script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    
    script.onload = () => {
      // Initialize Google Sign-In after script loads
      if (window.google) {
        // Disable FedCM to avoid the GSI_LOGGER error
        if (window.google.accounts.id.disableFedCM) {
          window.google.accounts.id.disableFedCM()
        }
        
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: false, // Disable FedCM
        })
      }
    }
    
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  // Handle Google Sign-In response
  const handleGoogleResponse = async (response: any) => {
    try {
      setGoogleLoading(true)
      setError('')
      
      // Send the credential token to your backend
      const authResponse = await loginWithGoogle(response.credential)
      await loginWithTokens(authResponse)
      
      // Handle redirect after successful login
      const returnUrl = searchParams.get('from')
      router.push(returnUrl ? decodeURIComponent(returnUrl) : '/')
    } catch (err: any) {
      setError(err.message || 'Google authentication failed')
    } finally {
      setGoogleLoading(false)
    }
  }

  // Listen for Google auth success (fallback)
  useEffect(() => {
    const handleGoogleAuthSuccess = (event: CustomEvent) => {
      const authResponse = event.detail as AuthResponse
      loginWithTokens(authResponse)
      
      // Handle redirect after successful login
      const returnUrl = searchParams.get('from')
      router.push(returnUrl ? decodeURIComponent(returnUrl) : '/')
    }

    window.addEventListener('googleAuthSuccess', handleGoogleAuthSuccess as EventListener)
    
    return () => {
      window.removeEventListener('googleAuthSuccess', handleGoogleAuthSuccess as EventListener)
    }
  }, [loginWithTokens, router, searchParams])

  // Get URL parameters for redirects and messages
  useEffect(() => {
    const urlMessage = searchParams.get('message')
    const pendingAction = searchParams.get('pendingAction')
    const urlError = searchParams.get('error')
    
    if (urlMessage) {
      setMessage(decodeURIComponent(urlMessage))
    }
    
    if (urlError) {
      setError(decodeURIComponent(urlError))
    }
    
    // Handle pending actions after login (like adding to cart/favorites)
    if (pendingAction) {
      setMessage(pendingAction === 'addToCart' 
        ? 'Please log in to add items to your cart.'
        : 'Please log in to manage your favorites.'
      )
    }
  }, [searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const authResponse = await loginUser(formData)
      await loginWithTokens(authResponse)
      
      // Handle redirect after successful login
      const returnUrl = searchParams.get('from')
      const pendingAction = searchParams.get('pendingAction')
      
      if (pendingAction && typeof window !== 'undefined') {
        // Handle pending cart/favorite actions
        const pendingData = sessionStorage.getItem('pendingCartAction')
        if (pendingData) {
          // Redirect back to the game page where the action was initiated
          router.push(returnUrl || '/')
          return
        }
      }
      
      router.push(returnUrl ? decodeURIComponent(returnUrl) : '/')
    } catch (err: any) {
      setError(err.message || 'Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true)
      setError('')
      
      // Check if Google is loaded
      if (!window.google) {
        throw new Error('Google Sign-In not loaded')
      }
      
      // Trigger Google Sign-In prompt
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback: try the existing loginWithGoogle function
          loginWithGoogle().catch((err: any) => {
            setError(err.message || 'Google authentication failed')
            setGoogleLoading(false)
          })
        }
      })
    } catch (err: any) {
      setError(err.message || 'Google authentication failed')
      setGoogleLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      await forgotPassword(resetEmail)
      
      setMessage('Password reset instructions have been sent to your email.')
      setShowForgotPassword(false)
      setResetEmail('')
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-cyan-600/20 rounded-full border border-cyan-400/30">
              <GamepadIcon className="h-12 w-12 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">
            {showForgotPassword ? 'Reset Password' : 'Welcome Back'}
          </h1>
          <p className="text-gray-400 mt-2">
            {showForgotPassword 
              ? 'Enter your email to receive reset instructions'
              : 'Sign in to your Sahib Game Store account'
            }
          </p>
        </div>

        {/* Display messages */}
        {message && (
          <div className="bg-cyan-900/30 border border-cyan-700 rounded-lg p-4">
            <p className="text-cyan-400 text-sm font-medium text-center">{message}</p>
          </div>
        )}

        {/* Display errors */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
            <p className="text-red-400 text-sm font-medium text-center">{error}</p>
          </div>
        )}

        {/* Login Form */}
        {!showForgotPassword ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-center">Sign In</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="userName" className="text-gray-300">Username or Email</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="userName"
                      name="userName"
                      type="text"
                      value={formData.userName}
                      onChange={handleChange}
                      placeholder="Enter username or email"
                      className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 transition-colors"
                      required
                      disabled={loading || googleLoading}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="text-gray-300">Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter password"
                      className="pl-10 pr-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 transition-colors"
                      required
                      disabled={loading || googleLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
                      disabled={loading || googleLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-600 text-cyan-600 focus:ring-cyan-500 bg-gray-700"
                      disabled={loading || googleLoading}
                    />
                    <span className="ml-2 text-sm text-gray-300">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                    disabled={loading || googleLoading}
                  >
                    Forgot password?
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 transition-colors disabled:bg-cyan-400 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing In...
                    </span>
                  ) : 'Sign In'}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
                </div>
              </div>

              <Button
                onClick={handleGoogleLogin}
                disabled={loading || googleLoading}
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {googleLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in with Google...
                  </span>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign in with Google
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-gray-400">
                Don't have an account?{' '}
                <Link href="/register" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                  Sign up
                </Link>
              </p>
            </CardContent>
          </Card>
        ) : (
          /* Forgot Password Form */
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-center">Reset Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <Label htmlFor="resetEmail" className="text-gray-300">Email Address</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="resetEmail"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 transition-colors"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 transition-colors disabled:bg-cyan-400 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : 'Send Reset Email'}
                </Button>
              </form>

              <div className="text-center">
                <button
                  onClick={() => {
                    setShowForgotPassword(false)
                    setError('')
                    setMessage('')
                  }}
                  className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                  disabled={loading}
                >
                  ← Back to Sign In
                </button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default LoginPage