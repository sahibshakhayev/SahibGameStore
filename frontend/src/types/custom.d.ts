// src/types/custom.d.ts
// This file contains manually defined types or extensions to generated types.

import type { GameListViewModel, GameViewModel } from './api'; // Import necessary types from generated api.ts

// --- User related types ---
export interface UserClaims {
  id: string;
  username: string;
  email: string;
  roles: string[]; // e.g., ['Customer', 'Admin']
  // Add any other properties your actual API /Account/UserClaims returns
}

// --- Game related types (Extended/Detailed) ---
// Use this for detailed game view if GameViewModel from API spec is incomplete
export interface DetailedGameViewModel extends GameViewModel {
  // Add properties present in your actual API response but potentially missing from GameViewModel
  totalQuantity?: number;    // Added based on backend data for full Game
  availableQuantity: number; // Ensure this is also on GameViewModel if it's there
  // Your GameViewModel already has:
  // id: string;
  // name: string | null;
  // releaseDate: string;
  // userScore: number;
  // price: number;
  // description: string | null;
  // shortDescription: string | null;
  // imageRelativePath: string | null;
  // coverImageRelativePath: string | null;
  // developers?: any[]; // Or more specific types if available
  // genres?: any[];
  // publishers?: any[];
  // platforms?: any[];
}


// --- Pagination types ---
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface PagedResultOfGameListViewModel extends PagedResult<GameListViewModel> {}

// --- Order related types ---
export interface OrderItemViewModel {
  gameId: string;
  gameName: string;
  price: number;
  quantity: number;
  subtotal: number;
  // If your API returns an actual ID for an OrderItem, add it here:
  id?: string;
}

// Corresponds to your OpenAPI OrderStatus enum (0-5)
export enum OrderStatus {
    Pending = 0,
    Processing = 1,
    Shipped = 2,
    Delivered = 3,
    Cancelled = 4,
    Refunded = 5
}


export interface PaymentMethodViewModel {
  id: string;
  payer?: string | null;
  email?: string | null;
  type: number; // Corresponds to EPaymentType enum (0: Credit Card, 1: PayPal)
  cardHolderName?: string | null;
  cardNumber?: number | null; // Last 4 digits or masked
  // Add other properties as your actual API returns
}

export interface OrderViewModel {
  id: string;
  userId: string;
  status: OrderStatus;
  address?: string | null;
  items: OrderItemViewModel[]; // Changed from 'orderItems' to 'items'
  total: number; // Changed from 'totalPrice'
  // Add 'createdDate' if it's actually returned by the API (it wasn't in your sample JSON)
  createdDate?: string; // date-time
}

export interface PagedResultOfOrderViewModel extends PagedResult<OrderViewModel> {}