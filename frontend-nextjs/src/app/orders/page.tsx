'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Package, Calendar, CreditCard, Eye, Download, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { fetchMyOrders, cancelOrder } from '../../features/orders/ordersAPI'
// UI Components (assuming these exist in your project)
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

// Types
interface OrderItem {
  gameId: string;
  gameName: string;
  gameImage: string;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: string;
  status: number;
  createdDate: string;
  address: string;
  total: number;
  items: OrderItem[];
}

interface OrdersResponse {
  items: Order[];
  totalCount: number;
  pageSize: number;
}

// API functions (you'll need to implement these)


// Order status mapping
const ORDER_STATUS = {
  0: 'Created',
  1: 'Pending',
  2: 'Preparing',
  3: 'Delivering',
  4: 'Delivered',
  5: 'Cancelled'
} as const;

// Status colors (gaming theme from template)
const getStatusColor = (statusCode: number) => {
  switch (statusCode) {
    case 0: // Created
      return 'bg-blue-600 hover:bg-blue-600';
    case 1: // Pending
      return 'bg-yellow-600 hover:bg-yellow-600';
    case 2: // Preparing
      return 'bg-orange-600 hover:bg-orange-600';
    case 3: // Delivering
      return 'bg-purple-600 hover:bg-purple-600';
    case 4: // Delivered
      return 'bg-green-600 hover:bg-green-600';
    case 5: // Cancelled
      return 'bg-red-600 hover:bg-red-600';
    default:
      return 'bg-gray-600 hover:bg-gray-600';
  }
};

// Can cancel if status is Created (0) or Pending (1)
const canCancel = (statusCode: number) => statusCode === 0 || statusCode === 1;

const OrdersPage = () => {
  const [orders, setOrders] = useState<OrdersResponse | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCanceling, setCanceling] = useState<Record<string, boolean>>({});
  const [statusFilter, setStatusFilter] = useState('all');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isVisibleRef = useRef(true);

  // Fetch orders function
  const fetchOrders = useCallback(async (currentPage: number, showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      setError(null);
      
      const data = await fetchMyOrders(currentPage, 10);
      setOrders(data);
      setLastRefresh(new Date());
    } catch (err) {
      setError('Error loading orders');
      console.error('Error fetching orders:', err);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  // Handle cancel order
  const handleCancelOrder = async (orderId: string) => {
    try {
      setCanceling(prev => ({ ...prev, [orderId]: true }));
      await cancelOrder(orderId);
      await fetchOrders(page, false);
    } catch (err) {
      console.error('Error canceling order:', err);
    } finally {
      setCanceling(prev => ({ ...prev, [orderId]: false }));
    }
  };

  // Manual refresh
  const handleManualRefresh = useCallback(() => {
    fetchOrders(page, false);
  }, [fetchOrders, page]);

  // Auto-refresh functionality
  const startAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      if (isVisibleRef.current) {
        fetchOrders(page, false);
      }
    }, 30000);
  }, [fetchOrders, page]);

  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Filter orders based on status
  const filteredOrders = orders?.items ? (statusFilter === 'all' 
    ? orders.items 
    : orders.items.filter(order => ORDER_STATUS[order.status as keyof typeof ORDER_STATUS].toLowerCase() === statusFilter)
  ) : [];

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
      
      if (isVisibleRef.current) {
        fetchOrders(page, false);
        startAutoRefresh();
      } else {
        stopAutoRefresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchOrders, page, startAutoRefresh, stopAutoRefresh]);

  // Initial load and page changes
  useEffect(() => {
    fetchOrders(page);
  }, [fetchOrders, page]);

  // Auto-refresh setup
  useEffect(() => {
    startAutoRefresh();
    
    return () => {
      stopAutoRefresh();
    };
  }, [startAutoRefresh, stopAutoRefresh]);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="mb-8">
            <Skeleton className="h-8 w-48 bg-gray-700 mb-2" />
            <Skeleton className="h-4 w-32 bg-gray-700" />
          </div>
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-32 bg-gray-700" />
                  <Skeleton className="h-4 w-48 bg-gray-700" />
                  <Skeleton className="h-20 w-full bg-gray-700" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-8">
              <p className="text-red-400 text-lg mb-4">{error}</p>
              <Button onClick={() => fetchOrders(page)} className="bg-cyan-600 hover:bg-cyan-700">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const totalPages = orders ? Math.ceil(orders.totalCount / orders.pageSize) : 1;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Your Orders</h1>
              <p className="text-gray-400">
                Track and manage your game orders • Last updated: {format(lastRefresh, 'HH:mm:ss')}
              </p>
            </div>
            <Button
              onClick={handleManualRefresh}
              variant="outline"
              className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-gray-900"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 bg-gray-700 border-gray-600 text-white focus:border-cyan-400">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              <SelectItem value="all" className="text-white hover:bg-gray-600">All Orders</SelectItem>
              <SelectItem value="created" className="text-white hover:bg-gray-600">Created</SelectItem>
              <SelectItem value="pending" className="text-white hover:bg-gray-600">Pending</SelectItem>
              <SelectItem value="preparing" className="text-white hover:bg-gray-600">Preparing</SelectItem>
              <SelectItem value="delivering" className="text-white hover:bg-gray-600">Delivering</SelectItem>
              <SelectItem value="delivered" className="text-white hover:bg-gray-600">Delivered</SelectItem>
              <SelectItem value="cancelled" className="text-white hover:bg-gray-600">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-8 text-center">
                <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Orders Found</h3>
                <p className="text-gray-400">
                  {statusFilter === 'all' 
                    ? "You haven't placed any orders yet." 
                    : `No ${statusFilter} orders found.`
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center space-x-2">
                        <Package className="h-5 w-5" />
                        <span>Order #{order.id}</span>
                      </CardTitle>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(order.createdDate)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`${getStatusColor(order.status)} text-white mb-2`}>
                        {ORDER_STATUS[order.status as keyof typeof ORDER_STATUS]}
                      </Badge>
                      <div className="text-2xl font-bold text-cyan-400">
                        ${order.total.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Order Items */}
                  <div className="space-y-3 mb-6">
                    <h4 className="text-gray-300 font-medium">Items Ordered:</h4>
                    {order.items.map((item) => (
                      <div key={item.gameId} className="flex items-center space-x-4 p-3 bg-gray-700 rounded-lg">
                        <img
                          src={process.env.NEXT_PUBLIC_API_URL + item.gameImage}
                          alt={item.gameName}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h5 className="text-white font-medium">{item.gameName}</h5>
                          <p className="text-gray-400 text-sm">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-cyan-400 font-medium">
                          ${item.subtotal.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shipping Address */}
                  <div className="mb-6 p-3 bg-gray-700 rounded-lg">
                    <h4 className="text-gray-300 font-medium mb-2">Delivery Address:</h4>
                    <p className="text-gray-400 text-sm">{order.address || 'No address specified'}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-gray-900"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    
                    {order.status === 4 ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-green-400 text-green-400 hover:bg-green-400 hover:text-gray-900"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    ) : canCancel(order.status) ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={isCanceling[order.id]}
                        className="border-red-400 text-red-400 hover:bg-red-400 hover:text-gray-900"
                      >
                        {isCanceling[order.id] ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Canceling...
                          </>
                        ) : (
                          'Cancel Order'
                        )}
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {filteredOrders.length > 0 && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center">
            <nav className="flex items-center space-x-2">
              <Button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Previous
              </Button>
              
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    variant={page === i + 1 ? "default" : "outline"}
                    className={page === i + 1 
                      ? "bg-cyan-600 hover:bg-cyan-700" 
                      : "border-gray-600 text-gray-300 hover:bg-gray-700"
                    }
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              
              <Button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Next
              </Button>
            </nav>
          </div>
        )}

        {filteredOrders.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Showing {filteredOrders.length} of {orders?.totalCount || 0} orders
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;