import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/account/authSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // Add cart, orders, etc.
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
