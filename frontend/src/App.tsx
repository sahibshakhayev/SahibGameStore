import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import GameListPage from './pages/GameListPage'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import GameDetailsPage from './pages/GameDetailsPage'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setCredentials } from './features/account/authSlice'
import ProtectedRoute from './features/account/ProtectedRoute'
import AccountPage from './pages/AccountPage'
import CartPage from './pages/CartPage'
import MyOrdersPage from './pages/MyOrders'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, 
      gcTime: 1000 * 60 * 10, 
    },
  },
})









function App() {

const dispatch = useDispatch()


useEffect(() => {
  const accessToken = localStorage.getItem('accessToken')
  const refreshToken = localStorage.getItem('refreshToken')
  const userName = localStorage.getItem('userName')
  const roles = JSON.parse(localStorage.getItem('roles') || '[]')

  if (accessToken && refreshToken && userName) {
    dispatch(
      setCredentials({
        userName,
        roles,
        accessToken,
        refreshToken,
      })
    )
  }
}, [])


  return (
 <QueryClientProvider client={queryClient}>
  <Header/>
 <Routes>

  
    <Route index element={<HomePage />} />
    <Route path="games" element={<GameListPage />} />
    <Route path="games/:id" element={<GameDetailsPage />} />
    <Route path="login" element={<LoginPage />} />
    <Route path="register" element={<RegisterPage />} />
    <Route path="cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
    <Route path="account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
    <Route path="orders" element={<ProtectedRoute><MyOrdersPage /></ProtectedRoute>} />

  
</Routes>
</QueryClientProvider>
  )
}

export default App
