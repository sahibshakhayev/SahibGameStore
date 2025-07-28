import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../features/account/authAPI'
import { useAuth } from '../features/account/useAuth'

const LoginPage = () => {
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { loginWithTokens } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const tokens = await loginUser({ userName, password })
      await loginWithTokens(tokens)
      navigate('/')
    } catch {
      setError('Invalid username or password')
    }
  }

  return (
    <div className="min-h-screen bg-white w-full">
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center text-black">Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Username"
              className="w-full border text-black rounded px-4 py-2"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full border text-black rounded px-4 py-2"
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Log In
            </button>
            <p className="text-sm text-center text-gray-600">
              Don't have an account?{' '}
              <a href="/register" className="text-blue-600 hover:underline">
                Register
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage