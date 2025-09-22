export interface CartItem {
  gameId: string
  gameName: string
  gameImage:string
  price: number
  quantity: number
  subtotal: number
}

export interface Cart {
  items: CartItem[]
  total: number
}
