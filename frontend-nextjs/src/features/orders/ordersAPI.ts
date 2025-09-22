import api from '../../api/axios'
import { type PagedOrders } from './types'

export const fetchMyOrders = async (pageNumber = 1, pageSize = 10): Promise<PagedOrders> => {
  const res = await api.get<PagedOrders>('/api/Orders/my', { params: { pageNumber, pageSize } })
  return res.data
}

export const cancelOrder = async (orderId: string): Promise<void> => {
  await api.delete(`/api/Orders/${orderId}`)
}
