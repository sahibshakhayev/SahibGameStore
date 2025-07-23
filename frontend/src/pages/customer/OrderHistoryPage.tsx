// src/pages/customer/OrderHistoryPage.tsx
import React from 'react';
import { AxiosError } from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import {
  useGetApiOrdersMy,
  getApiOrdersMy,
} from '../../lib/api/endpoints';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';


// --- Type Definitions (Consolidated for this file) ---

// Generic Paged Result interface, matching backend's paginated response structure
interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

// Order item structure as per your API output
interface OrderItemViewModel {
  gameId: string;
  gameName: string;
  price: number;
  quantity: number;
  subtotal: number;
  id?: string;
}

// Order Status enum as per your API output (as a const object)
const OrderStatus = {
    Pending: 0,
    Processing: 1,
    Shipped: 2,
    Delivered: 3,
    Cancelled: 4,
    Refunded: 5
} as const;

// Define a type for OrderStatus based on the const object's values
type OrderStatusType = typeof OrderStatus[keyof typeof OrderStatus];

// --- NEW: Helper for mapping numeric status to display string ---
// This map allows looking up status names by their numeric value.
const orderStatusDisplayMap: Record<OrderStatusType, string> = {
    [OrderStatus.Pending]: 'Pending',
    [OrderStatus.Processing]: 'Processing',
    [OrderStatus.Shipped]: 'Shipped',
    [OrderStatus.Delivered]: 'Delivered',
    [OrderStatus.Cancelled]: 'Cancelled',
    [OrderStatus.Refunded]: 'Refunded',
};
// --- END NEW Helper ---


// Order View Model structure as per your API output
interface OrderViewModel {
  id: string;
  userId: string;
  status: OrderStatusType; // Use the type alias for OrderStatus
  address?: string | null;
  items: OrderItemViewModel[];
  total: number;
  createdDate?: string;
}

// Specific Paged Result type for OrderViewModel, combining pagination with order data
interface PagedResultOfOrderViewModel extends PagedResult<OrderViewModel> {}

// --- END Type Definitions ---


const OrderHistoryPage: React.FC = () => {
  const queryClient = useQueryClient();

  const getErrorMessage = (error: AxiosError | Error | null | undefined): string => {
    if (!error) return 'An unknown error occurred.';
    if (error instanceof AxiosError) {
      if (error.response?.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
        return (error.response.data as { message: string }).message;
      }
      return error.message;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  };

  const { data: ordersResult, isLoading, isError, error } = useGetApiOrdersMy<PagedResultOfOrderViewModel, AxiosError>(
    { page: 1, pageSize: 10 },
    { query: {} }
  );

  const orders = ordersResult?.items || [];

  // Placeholder functions for order actions (typically handled by Admin Panel or more detailed customer features)
  const handleStatusChange = (orderId: string, newStatus: OrderStatusType) => { // Use OrderStatusType here
    console.log(`Action: Change order ${orderId} status to ${orderStatusDisplayMap[newStatus]}`); // Use the map
    alert('Order status update functionality is intended for the admin panel.');
  };

  const handleDelete = (orderId: string) => {
    console.log(`Action: Delete order ${orderId}`);
    alert('Order deletion functionality is intended for the admin panel.');
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return <AlertMessage type="error" message={`Error loading your orders: ${getErrorMessage(error as AxiosError | Error | null)}`} />;
  }

  return (
    <div className="p-4 bg-white shadow-md rounded-lg text-gray-800">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">My Order History</h1>

      {orders.length === 0 ? (
        <p className="text-center text-gray-600">You haven't placed any orders yet.</p>
      ) : (
        <div className="space-y-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order: OrderViewModel) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.userId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.total?.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === OrderStatus.Pending ? 'bg-yellow-100 text-yellow-800' :
                      order.status === OrderStatus.Processing ? 'bg-blue-100 text-blue-800' :
                      order.status === OrderStatus.Shipped ? 'bg-green-100 text-green-800' :
                      order.status === OrderStatus.Delivered ? 'bg-purple-100 text-purple-800' :
                      order.status === OrderStatus.Cancelled ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      Status: {orderStatusDisplayMap[order.status]} {/* <--- FIX: Use the map for display */}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.address || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => alert(`View details for Order ${order.id}`)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="text-lg font-semibold mt-4 mb-2">Order Items:</h3>
          {orders.map((order: OrderViewModel) => (
             <div key={order.id + "-items"} className="bg-gray-50 p-3 mt-2 rounded-md">
                <h4 className="font-semibold text-md mb-2">Items for Order {order.id}:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  {order.items?.length === 0 ? (
                    <li className="text-gray-600">No items in this order.</li>
                  ) : (
                    order.items?.map((item: OrderItemViewModel) => (
                      <li key={item.gameId} className="text-gray-700">
                        {item.gameName} (x{item.quantity}) - ${item.price?.toFixed(2)} each (Subtotal: ${item.subtotal?.toFixed(2)})
                      </li>
                    ))
                  )}
                </ul>
             </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;