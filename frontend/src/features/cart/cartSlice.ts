// src/features/cart/cartSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { GameListViewModel } from '../../types/api.ts'; // Make sure this is imported as a type

// Ensure CartItem has all properties necessary for display and calculation
// It extends GameListViewModel, which has id, name, price, availableQuantity.
interface CartItem extends GameListViewModel {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  totalPrice: number;
}

const initialState: CartState = {
  items: [],
  totalPrice: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Add item to cart or increase quantity if exists
    addToCart: (state, action: PayloadAction<GameListViewModel>) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        // Ensure all necessary properties from GameListViewModel are present when adding
        state.items.push({ ...action.payload, quantity: 1 });
      }
      state.totalPrice += action.payload.price || 0; // Use nullish coalescing for price
    },
    // Update quantity of an item in cart
    updateCartItemQuantity: (state, action: PayloadAction<{ gameId: string; quantity: number }>) => {
      const item = state.items.find(i => i.id === action.payload.gameId);
      if (item) {
        state.totalPrice -= (item.price || 0) * item.quantity; // Subtract old price
        item.quantity = action.payload.quantity;
        state.totalPrice += (item.price || 0) * item.quantity; // Add new price
      }
    },
    // Remove item from cart
    removeFromCart: (state, action: PayloadAction<string>) => { // action.payload is gameId
      const removedItem = state.items.find(item => item.id === action.payload);
      if (removedItem) {
        state.items = state.items.filter(item => item.id !== action.payload);
        state.totalPrice -= (removedItem.price || 0) * removedItem.quantity;
      }
    },
    // Clear the entire cart
    clearCart: (state) => {
      state.items = [];
      state.totalPrice = 0;
    },
  },
});

export const { addToCart, updateCartItemQuantity, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;