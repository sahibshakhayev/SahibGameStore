import { Navigate } from 'react-router-dom'
import type { JSX } from 'react'

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const accessToken = localStorage.getItem('accessToken')
const userName = localStorage.getItem('userName')
const isAuthenticated = !!accessToken && !!userName
  return isAuthenticated ? children : <Navigate to="/login" />
}

export default ProtectedRoute
