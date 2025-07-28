import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser } from './authAPI'
import { useAuth } from './useAuth'

const LoginForm = () => {
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const { loginWithTokens } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { accessToken, refreshToken } = await loginUser({ userName, password })
      await loginWithTokens({accessToken, refreshToken})
      navigate('/')
    } catch {
      alert('Invalid credentials')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4 mt-12">
      <input className="input" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Username" />
      <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      <button type="submit" className="btn">Login</button>
    </form>
  )
}

export default LoginForm
