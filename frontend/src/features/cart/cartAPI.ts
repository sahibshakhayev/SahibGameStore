import api from '../../api/axios'
import { type CartItem, type Cart } from './types'

export const fetchCart = async (): Promise<Cart> => {
  const res = await api.get<Cart>('/api/Cart')
  return res.data
}

export const addToCart = async (payload: { gameId: string; quantity: number }) => {
  await api.post('/api/Cart/add', payload)
}

export const updateCart = async (payload: { gameId: string; quantity: number }) => {
  await api.put('/api/Cart/update', payload)
}

export const removeFromCart = async (gameId: string) => {
  await api.delete(`/api/Cart/remove/${gameId}`)
}

export const checkoutCart = async (payload: { paymentMethodId: string; address: string }) => {
  await api.post('/api/Orders', payload)
}
