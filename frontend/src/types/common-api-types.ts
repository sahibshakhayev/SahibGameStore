// src/types/common-api-types.ts

// --- Generic Pagination Type (If not already present) ---
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

// --- Common Data Transfer Objects (DTOs) ---

export interface LoginDto {
  userName: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  userName: string;
  password: string;
}

export interface RefreshDto {
  expiredAccessToken: string;
  refreshToken: string;
}

export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
  repeatPassword: string;
}

export interface AddorUpdatePaymentMethodDto {
  id?: string; // Optional for creation, typically sent for update
  payer?: string | null;
  email?: string | null;
  type: EPaymentType; // Using the EPaymentType enum
  cardHolderName?: string | null;
  cardNumber?: number | null; // Use number if API stores it as such, be aware of JS precision for large numbers
}

export interface CreateOrderDto {
  paymentMethodId: string; // UUID string
  address: string;
}

export interface UpdateOrderDto {
  address?: string | null;
  status: OrderStatus; // Using OrderStatus enum
}

export interface AddOrUpdateGameDTO {
  id?: string;
  name: string;
  releaseDate?: string;
  description: string;
  shortDescription?: string;
  gameDevelopers: { developerId: string }[];
  gamePlatforms: { platformId: string }[];
  gameGenres: { genreId: string }[];
  gamePublishers?: { publisherId: string }[];
}


// --- Common View Models ---

export interface GameListViewModel {
  id: string;
  name?: string | null;
  releaseDate?: string;
  usersScore?: number | null;
  price?: number | null;
  availableQuantity?: number;
  totalQuantity?: number; // Add this if your API returns it in list view
  shortDescription?: string | null;
  imageRelativePath?: string | null;
  coverImageRelativePath?: string | null;
}

export interface CompanyViewModel {
  id: string;
  name?: string | null;
  founded?: string;
  logoPath?: string | null;
}

export interface GenreViewModel {
  id: string;
  name?: string | null;
  description?: string | null;
}

export interface PlatformViewModel {
  id: string;
  name?: string | null;
}

export interface ReviewListViewModel {
  userId: string;
  productId: string;
  rating: number;
  considerations?: string | null;
}

export interface PaymentMethodViewModel {
  id: string;
  payer?: string | null;
  email?: string | null;
  type: EPaymentType;
  cardHolderName?: string | null;
  cardNumber?: number | null;
}

export interface OrderItemViewModel {
  gameId: string;
  gameName: string;
  price: number;
  quantity: number;
  subtotal: number;
  id?: string;
}

export interface OrderViewModel {
  id: string;
  userId: string;
  status: OrderStatus;
  address?: string | null;
  items: OrderItemViewModel[];
  total: number;
  createdDate?: string;
}


// --- Enums as const objects ---

export const OrderStatus = {
    Pending: 0,
    Processing: 1,
    Shipped: 2,
    Delivered: 3,
    Cancelled: 4,
    Refunded: 5
} as const;
export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

export const EDepartment = {
    Electronics: 0,
    Games: 1,
    Books: 2,
    Movies: 3
} as const;
export type EDepartment = typeof EDepartment[keyof typeof EDepartment];

export const EPaymentType = {
    CreditCard: 0,
    PayPal: 1
} as const;
export type EPaymentType = typeof EPaymentType[keyof typeof EPaymentType];