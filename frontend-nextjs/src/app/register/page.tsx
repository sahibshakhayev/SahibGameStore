'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Lock, Mail, User, GamepadIcon, Check } from 'lucide-react'
import { registerUser, loginUser, loginWithGoogle } from '../../features/account/authAPI'
import { useAuth } from '../../features/account/useAuth'
import type { AuthResponse } from '../../types/auth'

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

// UI Components (you'll need to add these to your components/ui folder)
const Button = ({ children, className = '', disabled = false, variant = 'default', ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50'
  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-input hover:bg-accent hover:text-accent-foreground'
  }
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`} 
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

const Input = ({ className = '', ...props }) => {
  return (
    <input
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  )
}

const Card = ({ children, className = '' }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>
    {children}
  </div>
)

const CardHeader = ({ children, className = '' }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
    {children}
  </div>
)

const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
)

const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
)

const Label = ({ children, className = '', ...props }) => (
  <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`} {...props}>
    {children}
  </label>
)

// Custom toast hook (simplified version)
const useToast = () => {
  return {
    toast: ({ title, description, variant }) => {
      // In a real app, you'd use a proper toast library
      if (variant === 'destructive') {
        alert(`${title}: ${description}`)
      } else {
        alert(`${title}: ${description}`)
      }
    }
  }
}

const RegisterPage = () => {
  const [form, setForm] = useState({
    userName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { loginWithTokens } = useAuth()
  const { toast } = useToast()

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
      
      // Send the credential token to your backend for Google signup
      const authResponse = await loginWithGoogle(response.credential)
      await loginWithTokens(authResponse)
      
      toast({
        title: "Registration Successful!",
        description: "Welcome to Sahib Game Store! Your Google account has been linked.",
      })
      
      // Handle redirect after successful registration
      const returnUrl = searchParams.get('from')
      router.push(returnUrl ? decodeURIComponent(returnUrl) : '/')
    } catch (err: any) {
      setError(err.message || 'Google authentication failed')
      toast({
        title: "Google Sign-up Failed",
        description: err.message || 'Please try again or use email registration',
        variant: "destructive"
      })
    } finally {
      setGoogleLoading(false)
    }
  }

  // Listen for Google auth success (fallback)
  useEffect(() => {
    const handleGoogleAuthSuccess = (event: CustomEvent) => {
      const authResponse = event.detail as AuthResponse
      loginWithTokens(authResponse)
      
      toast({
        title: "Registration Successful!",
        description: "Welcome to Sahib Game Store! Your Google account has been linked.",
      })
      
      // Handle redirect after successful registration
      const returnUrl = searchParams.get('from')
      router.push(returnUrl ? decodeURIComponent(returnUrl) : '/')
    }

    window.addEventListener('googleAuthSuccess', handleGoogleAuthSuccess as EventListener)
    
    return () => {
      window.removeEventListener('googleAuthSuccess', handleGoogleAuthSuccess as EventListener)
    }
  }, [loginWithTokens, router, searchParams, toast])

  // Get URL parameters for messages
  useEffect(() => {
    const urlMessage = searchParams.get('message')
    const urlError = searchParams.get('error')
    
    if (urlMessage) {
      setMessage(decodeURIComponent(urlMessage))
    }
    
    if (urlError) {
      setError(decodeURIComponent(urlError))
    }
  }, [searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (form.password !== form.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive"
      })
      return
    }

    if (!acceptTerms) {
      toast({
        title: "Terms Required",
        description: "Please accept the terms and conditions",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    
    try {
      await registerUser(form)

      // Use login flow after successful registration (same as LoginPage)
      const tokens = await loginUser({ userName: form.userName, password: form.password })
      await loginWithTokens(tokens)

      toast({
        title: "Registration Successful!",
        description: "Welcome to Sahib Game Store! Please check your email to verify your account.",
      })

      router.push('/')
    } catch (err) {
      setError('Registration failed. Try again.')
      toast({
        title: "Registration Failed",
        description: "Please try again with different credentials",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
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
            toast({
              title: "Google Sign-up Failed",
              description: err.message || 'Please try again or use email registration',
              variant: "destructive"
            })
          })
        }
      })
    } catch (err: any) {
      setError(err.message || 'Google authentication failed')
      setGoogleLoading(false)
      toast({
        title: "Google Sign-up Failed",
        description: err.message || 'Please try again or use email registration',
        variant: "destructive"
      })
    }
  }

  const getPasswordStrength = () => {
    const password = form.password
    let strength = 0
    let checks: string[] = []

    if (password.length >= 8) {
      strength++
      checks.push('At least 8 characters')
    }
    if (/[A-Z]/.test(password)) {
      strength++
      checks.push('Uppercase letter')
    }
    if (/[a-z]/.test(password)) {
      strength++
      checks.push('Lowercase letter')
    }
    if (/\d/.test(password)) {
      strength++
      checks.push('Number')
    }
    if (/[^A-Za-z0-9]/.test(password)) {
      strength++
      checks.push('Special character')
    }

    return { strength, checks }
  }

  const passwordStrength = getPasswordStrength()

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gray-900">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-cyan-600/20 rounded-full border border-cyan-400/30">
              <GamepadIcon className="h-12 w-12 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">Join the Game</h1>
          <p className="text-gray-400 mt-2">
            Create your Sahib Game Store account and start your gaming journey
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

        {/* Registration Form */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-center">Create Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 transition-colors"
                    required
                    disabled={loading || googleLoading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="userName" className="text-gray-300">Username</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="userName"
                    name="userName"
                    type="text"
                    value={form.userName}
                    onChange={handleChange}
                    placeholder="Choose a username"
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
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Create a password"
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
                
                {/* Password Strength Indicator */}
                {form.password && (
                  <div className="mt-2">
                    <div className="flex space-x-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded ${
                            i < passwordStrength.strength
                              ? passwordStrength.strength <= 2 ? 'bg-red-500'
                              : passwordStrength.strength <= 3 ? 'bg-yellow-500'
                              : 'bg-green-500'
                              : 'bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="space-y-1">
                      {passwordStrength.checks.map((check, i) => (
                        <div key={i} className="flex items-center text-xs text-green-400">
                          <Check className="h-3 w-3 mr-1" />
                          {check}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className="pl-10 pr-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 transition-colors"
                    required
                    disabled={loading || googleLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
                    disabled={loading || googleLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  id="acceptTerms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="rounded border-gray-600 text-cyan-600 focus:ring-cyan-500"
                  disabled={loading || googleLoading}
                />
                <label htmlFor="acceptTerms" className="ml-2 text-sm text-gray-300">
                  I agree to the{' '}
                  <Link href="/terms" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <Button
                type="submit"
                disabled={loading || googleLoading || !acceptTerms}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 transition-colors disabled:bg-cyan-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </span>
                ) : 'Create Account'}
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
              onClick={handleGoogleSignup}
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
                  Signing up with Google...
                </span>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign up with Google
                </>
              )}
            </Button>

            <p className="text-center text-sm text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default RegisterPage