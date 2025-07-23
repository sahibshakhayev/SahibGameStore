// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice'; // Will create this
import cartReducer from '../features/cart/cartSlice'; // Will create this

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    // Add other slice reducers here if needed
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable for now to avoid issues with non-serializable values (e.g., AxiosError)
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;