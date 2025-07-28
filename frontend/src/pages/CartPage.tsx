import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  fetchCart,
  updateCart,
  removeFromCart,
  checkoutCart,
} from '../features/cart/cartAPI'
import { fetchPaymentMethods } from '../features/account/accountAPI'
import { type Cart, type CartItem } from '../features/cart/types'
import { type PaymentMethod } from '../features/account/types'

const CartPage = () => {
  const [cart, setCart] = useState<Cart | null>(null)
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [cartLoading, setCartLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | undefined>()
  const [address, setAddress] = useState('')
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({})
  const [isRemoving, setIsRemoving] = useState<Record<string, boolean>>({})
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const intervalRef = useRef<number | null>(null)
  const isVisibleRef = useRef(true)

  // Fetch cart function
  const fetchCartData = useCallback(async (silent = false) => {
    try {
      if (!silent) setCartLoading(true)
      setError(null)
      
      const [cartData, paymentMethods] = await Promise.all([
        fetchCart(),
        fetchPaymentMethods()
      ])
      
      setCart(cartData)
      setMethods(paymentMethods)
      setLastRefresh(new Date())
    } catch (err) {
      setError('Error loading cart')
      console.error('Error fetching cart:', err)
    } finally {
      if (!silent) setCartLoading(false)
    }
  }, [])

  // Handle cart update
  const handleUpdateCart = async (gameId: string, quantity: number) => {
    try {
      setIsUpdating(prev => ({ ...prev, [gameId]: true }))
      await updateCart({ gameId, quantity })
      await fetchCartData(true) // Refresh cart after update
    } catch (err) {
      console.error('Error updating cart:', err)
    } finally {
      setIsUpdating(prev => ({ ...prev, [gameId]: false }))
    }
  }

  // Handle remove from cart
  const handleRemoveFromCart = async (gameId: string) => {
    try {
      setIsRemoving(prev => ({ ...prev, [gameId]: true }))
      await removeFromCart(gameId)
      await fetchCartData(true) // Refresh cart after removal
    } catch (err) {
      console.error('Error removing from cart:', err)
    } finally {
      setIsRemoving(prev => ({ ...prev, [gameId]: false }))
    }
  }

  // Handle checkout
  const handleCheckout = async () => {
    if (!selectedPaymentId || !address.trim()) return
    
    try {
      setIsCheckingOut(true)
      await checkoutCart({ paymentMethodId: selectedPaymentId, address })
      await fetchCartData(true) // Refresh cart after checkout
      alert('Order placed successfully!')
    } catch (err) {
      alert('Checkout failed.')
      console.error('Checkout error:', err)
    } finally {
      setIsCheckingOut(false)
    }
  }

  // Manual refresh
  const handleManualRefresh = useCallback(() => {
    fetchCartData(true)
  }, [fetchCartData])

  // Set up auto-refresh interval
  const startAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    
    intervalRef.current = setInterval(() => {
      if (isVisibleRef.current) {
        fetchCartData(true) // Silent refresh
      }
    }, 30000) // Refresh every 30 seconds
  }, [fetchCartData])

  // Stop auto-refresh
  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden
      
      if (isVisibleRef.current) {
        // Page became visible, refresh data and restart interval
        fetchCartData(true)
        startAutoRefresh()
      } else {
        // Page became hidden, stop interval to save resources
        stopAutoRefresh()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [fetchCartData, startAutoRefresh, stopAutoRefresh])

  // Initial load
  useEffect(() => {
    fetchCartData()
  }, [fetchCartData])

  // Start auto-refresh on mount
  useEffect(() => {
    startAutoRefresh()
    
    return () => {
      stopAutoRefresh()
    }
  }, [startAutoRefresh, stopAutoRefresh])

  // Set default payment method
  useEffect(() => {
    if (methods.length > 0 && !selectedPaymentId) {
      setSelectedPaymentId(methods[0].id)
    }
  }, [methods, selectedPaymentId])

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium text-lg">Loading your cart...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button 
            onClick={() => fetchCartData()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-12 rounded-2xl shadow-lg max-w-md mx-4">
          <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m4.5-5h6" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Discover amazing games and start building your collection!</p>
          <div className="space-y-4">
            <Link 
              to="/games" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Browse Games
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <button 
              onClick={handleManualRefresh}
              className="block mx-auto px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="mb-6">
            <Link 
              to="/games" 
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center group"
            >
              <svg className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Continue Shopping
            </Link>
          </nav>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-4xl font-bold text-gray-900">Shopping Cart</h1>
                <button
                  onClick={handleManualRefresh}
                  className="inline-flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
              <p className="text-gray-600 text-lg">
                {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'} in your cart • Last updated: {lastRefresh.toLocaleTimeString()}
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white rounded-xl p-4 shadow-sm border">
                <p className="text-sm text-gray-600 mb-1">Cart Total</p>
                <p className="text-2xl font-bold text-blue-600">${cart.total.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Cart Items */}
          <div className="xl:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Cart Items
                  </h2>
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                    {cart.items.length}
                  </span>
                </div>
              </div>
              
              <div className="divide-y divide-gray-100">
                {cart.items.map((item: CartItem) => (
                  <div key={item.gameId} className="p-8 hover:bg-gray-50/50 transition-all duration-200 group">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1 mb-6 lg:mb-0">
                        <div className="flex items-start space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                            <img className="" src={import.meta.env.VITE_API_BASE_URL + item.gameImage} />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                              {item.gameName}
                            </h3>
                            <div className="flex items-center space-x-3">
                              <p className="text-2xl font-bold text-blue-600">${item.price.toFixed(2)}</p>
                              <span className="text-sm text-gray-500">per item</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-8">
                        <div className="flex items-center space-x-4 mb-6 sm:mb-0">
                          <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Quantity:</label>
                          <div className="relative">
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => handleUpdateCart(item.gameId, Number(e.target.value))}
                              className="w-20 px-3 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center font-semibold bg-white disabled:bg-gray-50"
                              disabled={isUpdating[item.gameId]}
                            />
                            {isUpdating[item.gameId] && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between sm:block sm:text-right">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Subtotal</p>
                            <p className="text-2xl font-bold text-gray-900 mb-3">${item.subtotal.toFixed(2)}</p>
                            <button
                              onClick={() => handleRemoveFromCart(item.gameId)}
                              disabled={isRemoving[item.gameId]}
                              className="inline-flex items-center text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50 transition-colors group/remove"
                            >
                              {isRemoving[item.gameId] ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent mr-2"></div>
                              ) : (
                                <svg className="w-4 h-4 mr-2 group-hover/remove:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              )}
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary & Checkout */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden sticky top-8">
              {/* Order Summary */}
              <div className="p-6 border-b bg-gradient-to-r from-green-50 to-emerald-50">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Order Summary
                </h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center text-lg">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold text-gray-900">${cart.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-lg">
                  <span className="text-gray-600">Shipping:</span>
                  <div className="text-right">
                    <span className="font-semibold text-green-600">Free</span>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-xl">
                    <span className="font-bold text-gray-900">Total:</span>
                    <span className="font-bold text-green-600 text-2xl">${cart.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Section */}
              <div className="border-t p-6 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Checkout Details
                </h3>

                {methods.length === 0 ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <div>
                        <p className="text-amber-800 font-semibold text-sm mb-1">No payment methods found</p>
                        <p className="text-amber-700 text-sm">
                          Please add a payment method on your{' '}
                          <Link to="/account" className="underline hover:no-underline font-semibold">
                            Account Page
                          </Link>
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Payment Method</label>
                      <select
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
                        value={selectedPaymentId || ''}
                        onChange={(e) => setSelectedPaymentId(e.target.value)}
                      >
                        {methods.map((m: PaymentMethod) => (
                          <option key={m.id} value={m.id}>
                            {m.cardHolderName} - •••• {String(m.cardNumber).slice(-4)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Shipping Address</label>
                      <textarea
                        className="w-full px-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        rows={4}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter your complete shipping address..."
                      />
                    </div>
                  </div>
                )}

                <button
                  disabled={!methods.length || isCheckingOut || !selectedPaymentId || !address.trim()}
                  onClick={handleCheckout}
                  className="w-full mt-8 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {isCheckingOut ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing Order...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Complete Order - ${cart.total.toFixed(2)}
                    </span>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  🔒 Your payment information is secure and encrypted
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage