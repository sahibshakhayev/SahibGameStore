import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerUser, loginUser } from '../features/account/authAPI'
import { useAuth } from '../features/account/useAuth'

const RegisterPage = () => {
  const [form, setForm] = useState({
    userName: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { loginWithTokens } = useAuth()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await registerUser(form)

      // 🔁 Use login flow after successful registration (same as LoginPage)
      const tokens = await loginUser({ userName: form.userName, password: form.password })
      await loginWithTokens(tokens)

      navigate('/')
    } catch (err) {
      setError('Registration failed. Try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white p-8 shadow-lg w-full min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-black text-center">Register</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="userName"
              value={form.userName}
              onChange={handleChange}
              placeholder="Username"
              className="w-full border text-black rounded px-4 py-2"
            />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full border text-black rounded px-4 py-2"
            />
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full border text-black rounded px-4 py-2"
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              Register
            </button>

            <p className="text-sm text-center text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="text-blue-600 hover:underline">
                Log in
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage