import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchMyOrders, cancelOrder } from '../features/orders/ordersAPI'
import { type Order } from '../features/orders/types'
import { format } from 'date-fns'

// Order status enum mapping (0-5)
const ORDER_STATUS = {
  0: 'Created',
  1: 'Pending',
  2: 'Preparing',
  3: 'Delivering',
  4: 'Delivered',
  5: 'Canceled'
} as const

// Status colors for visual feedback
const getStatusColor = (statusCode: number) => {
  switch (statusCode) {
    case 0: // Created
      return 'text-blue-600 bg-blue-50'
    case 1: // Pending
      return 'text-yellow-600 bg-yellow-50'
    case 2: // Preparing
      return 'text-orange-600 bg-orange-50'
    case 3: // Delivering
      return 'text-purple-600 bg-purple-50'
    case 4: // Delivered
      return 'text-green-600 bg-green-50'
    case 5: // Canceled
      return 'text-red-600 bg-red-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

// Can cancel if status is Created (0) or Pending (1)
const canCancel = (statusCode: number) => statusCode === 0 || statusCode === 1

interface OrdersResponse {
  items: Order[]
  totalCount: number
  pageSize: number
}

const MyOrdersPage = () => {
  const [orders, setOrders] = useState<OrdersResponse | null>(null)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCanceling, setCanceling] = useState<Record<string, boolean>>({})
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  
  const intervalRef = useRef<number | null>(null)
  const isVisibleRef = useRef(true)

  // Fetch orders function
  const fetchOrders = useCallback(async (currentPage: number, showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true)
      setError(null)
      
      const data = await fetchMyOrders(currentPage, 10)
      setOrders(data)
      setLastRefresh(new Date())
    } catch (err) {
      setError('Error loading orders')
      console.error('Error fetching orders:', err)
    } finally {
      if (showLoading) setIsLoading(false)
    }
  }, [])

  // Handle cancel order
  const handleCancelOrder = async (orderId: string) => {
    try {
      setCanceling(prev => ({ ...prev, [orderId]: true }))
      await cancelOrder(orderId)
      // Refresh orders after successful cancellation
      await fetchOrders(page, false)
    } catch (err) {
      console.error('Error canceling order:', err)
      // You might want to show a toast notification here
    } finally {
      setCanceling(prev => ({ ...prev, [orderId]: false }))
    }
  }

  // Manual refresh
  const handleManualRefresh = useCallback(() => {
    fetchOrders(page, false)
  }, [fetchOrders, page])

  // Set up auto-refresh interval
  const startAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    
    intervalRef.current = setInterval(() => {
      if (isVisibleRef.current) {
        fetchOrders(page, false) // Silent refresh
      }
    }, 30000) // Refresh every 30 seconds
  }, [fetchOrders, page])

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
        fetchOrders(page, false)
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
  }, [fetchOrders, page, startAutoRefresh, stopAutoRefresh])

  // Initial load and page changes
  useEffect(() => {
    fetchOrders(page)
  }, [fetchOrders, page])

  // Start auto-refresh on mount
  useEffect(() => {
    startAutoRefresh()
    
    return () => {
      stopAutoRefresh()
    }
  }, [startAutoRefresh, stopAutoRefresh])

  // Update interval when page changes
  useEffect(() => {
    if (isVisibleRef.current) {
      startAutoRefresh()
    }
  }, [page, startAutoRefresh])

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center w-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg">Loading orders…</p>
      </div>
    </div>
  )
  
  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center w-screen">
      <div className="text-center">
        <p className="text-red-600 text-lg mb-4">{error}</p>
        <button 
          onClick={() => fetchOrders(page)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  )
  
  if (!orders || orders.items.length === 0) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center w-screen">
      <div className="text-center">
        <p className="text-xl text-gray-600 mb-4">You have no orders yet.</p>
        <p className="text-gray-500 mb-4">Start shopping to see your orders here!</p>
        <button 
          onClick={handleManualRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>
    </div>
  )

  const totalPages = Math.ceil(orders.totalCount / orders.pageSize)

  return (
    <div className="min-h-screen bg-gray-50 w-screen">
      <div className="w-full px-4 py-8">
        <div className="w-full">
          <div className="px-6 py-8 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Track and manage your orders • Last updated: {format(lastRefresh, 'HH:mm:ss')}
                </p>
              </div>
              <button
                onClick={handleManualRefresh}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>

          <div className="p-6 bg-white">
            <div className="space-y-6">
              {orders.items.map((order: Order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow">
                  {/* Order Header */}
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.id}
                        </h3>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(Number(order.status))}`}>
                          {ORDER_STATUS[Number(order.status) as keyof typeof ORDER_STATUS]}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {format(new Date(order.createdDate), 'PPP p')}
                      </div>
                    </div>
                  </div>

                  {/* Order Content */}
                  <div className="p-6">
                    {/* Delivery Address */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Delivery Address</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                        {order.address || 'No address specified'}
                      </p>
                    </div>

                    {/* Order Items */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-900 mb-4">Items</h4>
                      <div className="space-y-4">
                        {order.items.map((item) => (
                          <div key={item.gameId} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                            <img
                              src={import.meta.env.VITE_API_BASE_URL + item.gameImage}
                              alt={item.gameName}
                              className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                            />
                            <div className="flex-grow min-w-0">
                              <h5 className="font-medium text-gray-900 truncate">
                                {item.gameName}
                              </h5>
                              <p className="text-sm text-gray-600">
                                Quantity: {item.quantity}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-semibold text-gray-900">
                                ${item.subtotal.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-200">
                      <div className="text-xl font-bold text-gray-900">
                        Total: ${order.total.toFixed(2)}
                      </div>
                      
                      {canCancel(Number(order.status)) && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={isCanceling[order.id]}
                          className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isCanceling[order.id] ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Canceling...
                            </>
                          ) : (
                            'Cancel Order'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  <div className="flex space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setPage(i + 1)}
                        className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          page === i + 1
                            ? 'bg-blue-600 text-white border border-blue-600'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyOrdersPage