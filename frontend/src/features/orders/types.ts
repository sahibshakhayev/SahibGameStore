export interface OrderItem {
  gameId: string
  gameName: string
  gameImage: string
  price: number
  quantity: number
  subtotal: number
}

export type OrderStatus = 'Created' | 'Pending' | 'Preparing' | 'Delivering' | 'Delivered' | 'Canceled'

export interface Order {
  id: string
  userId: string
  createdDate: string
  status: OrderStatus
  address: string
  items: OrderItem[]
  total: number
}

export interface PagedOrders {
  items: Order[]
  totalCount: number
  pageNumber: number
  pageSize: number
}
