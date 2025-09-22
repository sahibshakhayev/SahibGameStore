export interface Game {
  id: string;
  name: string;
  releaseDate: string;
  usersScore?: number;
  userScore?:number;
  price?: number;
  availableQuantity: number;
  shortDescription?: string;
  description?: string;
  imageRelativePath?: string;
  coverImageRelativePath?: string;
  developers?: Company[];
  genres?: Genre[];
  publishers?: Company[];
  platforms?: Platform[];
}

export interface Genre {
  id: string;
  name: string;
  description?: string;
}

export interface Platform {
  id: string;
  name: string;
}

export interface Company {
  id: string;
  name: string;
  founded: string;
  logoPath?: string;
}

export interface CartItem {
  gameId: string;
  quantity: number;
  game?: Game;
}

export interface PaymentMethod {
  id: string;
  payer: string;
  email: string;
  type: 0 | 1; // 0: Credit Card, 1: PayPal
  cardHolderName?: string;
  cardNumber?: number;
}

export interface Order {
  id: string;
  status: 0 | 1 | 2 | 3 | 4 | 5;
  address: string;
  createdAt: string;
  items: CartItem[];
  total: number;
}

export interface User {
  id: string;
  email: string;
  userName: string;
  isGoogleUser?: boolean;
}