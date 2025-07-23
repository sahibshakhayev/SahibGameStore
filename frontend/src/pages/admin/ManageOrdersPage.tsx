// src/pages/admin/ManageOrdersPage.tsx
import React from 'react';
import { AxiosError } from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import {
  useGetApiOrders,
  usePutApiOrdersId,
  useDeleteApiOrdersId,
  getGetApiOrdersQueryKey,
  getApiOrders,
  putApiOrdersId,
  deleteApiOrdersId,
} from '../../lib/api/endpoints';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';
import type { UpdateOrderDto } from '../../types/api.ts';
// --- FIX: Change 'import type' to 'import' for OrderStatus ---
import type { OrderViewModel, OrderItemViewModel, PagedResultOfOrderViewModel } from '../../types/custom';
import { OrderStatus } from '../../types/custom'; // <--- KEY FIX: Regular import for OrderStatus
// --- END FIX ---

const ManageOrdersPage: React.FC = () => {
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

  const { data: ordersResult, isLoading, isError, error } = useGetApiOrders<PagedResultOfOrderViewModel, AxiosError>(
    { page: 1, pageSize: 10 },
    { query: {} }
  );

  const orders = ordersResult?.items || [];

  const updateOrderMutation = usePutApiOrdersId<AxiosError, unknown>({
    mutation: {
      onSuccess: (data: Awaited<ReturnType<typeof putApiOrdersId>>) => {
        queryClient.invalidateQueries({ queryKey: getGetApiOrdersQueryKey() });
        alert('Order updated successfully!');
      },
      onError: (err: AxiosError) => {
        console.error('Update order failed:', err);
        alert(`Failed to update order: ${getErrorMessage(err)}`);
      },
    },
  });

  const deleteOrderMutation = useDeleteApiOrdersId<AxiosError, unknown>({
    mutation: {
      onSuccess: (data: Awaited<ReturnType<typeof deleteApiOrdersId>>) => {
        queryClient.invalidateQueries({ queryKey: getGetApiOrdersQueryKey() });
        alert('Order deleted successfully!');
      },
      onError: (err: AxiosError) => {
        console.error('Delete order failed:', err);
        alert(`Failed to delete order: ${getErrorMessage(err)}`);
      },
    },
  });

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderMutation.mutate({ id: orderId, data: { status: newStatus, address: null } });
  };

  const handleDelete = (orderId: string) => {
    if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      deleteOrderMutation.mutate({ id: orderId });
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <AlertMessage type="error" message={`Error loading orders: ${getErrorMessage(error as AxiosError | Error | null)}`} />;

  return (
    <div className="p-4 bg-white shadow-md rounded-lg text-gray-800">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Manage Orders</h1>

      {orders.length === 0 ? (
        <p className="text-center text-gray-600">No orders found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Price</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
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
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id!, parseInt(e.target.value) as OrderStatus)}
                      className="p-1 border rounded-md"
                    >
                      {Object.values(OrderStatus)
                        .filter(value => typeof value === 'number')
                        .map(value => (
                        <option key={value} value={value}>
                          {OrderStatus[value as number]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(order.id!)}
                      className="text-red-600 hover:text-red-900"
                      disabled={false} // Disable based on deleteOrderMutation.isPending if implemented
                    >
                      Delete
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

export default ManageOrdersPage;