// src/pages/customer/CartPage.tsx
import React, { useState, useEffect } from 'react'; // Import useEffect
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';

import { type RootState } from '../../store';
import { updateCartItemQuantity, removeFromCart, clearCart, type CartItem } from '../../features/cart/cartSlice';
import {
  usePostApiOrders,
  postApiOrders,
  useGetApiAccountPaymentMethods,
  getGetApiAccountPaymentMethodsQueryKey, // Used for queryKey
  getApiAccountPaymentMethods, // Used for Awaited<ReturnType>
} from '../../lib/api/endpoints';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';
import { useAuth } from '../../features/auth/hooks/useAuth';
import type { CreateOrderDto } from '../../types/api.ts';
import type { PaymentMethodViewModel } from '../../types/custom'; // Assuming PaymentMethodViewModel is in custom.d.ts

// Helper to safely extract error message
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

const CartPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalPrice } = useSelector((state: RootState) => state.cart);
  const { isAuthenticated, user, token} = useAuth(); // Also get `user` and `token`

  const [address, setAddress] = useState('');
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>('');
  const [checkoutMessage, setCheckoutMessage] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // --- FIX: Fetch payment methods with explicit types and careful enabling ---
  const {
    data: paymentMethods,
    isLoading: loadingPaymentMethods,
    isError: paymentMethodsError,
    error: paymentMethodsApiError,
    refetch: refetchPaymentMethods // Get refetch function
  } = useGetApiAccountPaymentMethods<PaymentMethodViewModel[], AxiosError>({
    query: {
      // The query should only run if authenticated and the token is present.
      // If paymentMethods is null (initial state) or there's an error, try fetching again.
      enabled: isAuthenticated, // Only fetch if isAuthenticated is true
      queryKey: getGetApiAccountPaymentMethodsQueryKey(),
      staleTime: 5 * 60 * 1000, // Cache payment methods for 5 minutes
      // onMount: true, // Attempt to refetch on mount if stale
    } as any // Cast to any for `query` object to bypass complex overloads
  });

  // Effect to refetch payment methods if user logs in on this page or auth state changes
  useEffect(() => {
    if (isAuthenticated && !paymentMethods && !loadingPaymentMethods && !paymentMethodsError) {
      // If authenticated but payment methods not loaded, and no error, force a refetch
      refetchPaymentMethods();
    }
  }, [isAuthenticated, paymentMethods, loadingPaymentMethods, paymentMethodsError, refetchPaymentMethods]);


  const submitOrderMutation = usePostApiOrders<void, AxiosError>({
    mutation: {
      onSuccess: () => {
        dispatch(clearCart());
        setCheckoutMessage({ type: 'success', message: 'Order submitted successfully! 🎉' });
        setTimeout(() => {
          navigate('/orders');
        }, 1500);
      },
      onError: (error: any) => {
        const err = error as AxiosError;
        console.error('Order submission failed:', err);
        setCheckoutMessage({ type: 'error', message: `Order failed: ${getErrorMessage(err)}. Please try again.` });
      },
    },
  });

  const handleUpdateQuantity = (gameId: string, quantity: number) => {
    if (quantity > 0) {
      dispatch(updateCartItemQuantity({ gameId, quantity }));
    }
  };

  const handleRemoveItem = (gameId: string) => {
    dispatch(removeFromCart(gameId));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('You must be logged in to proceed to checkout.');
      navigate('/login?redirect=/cart');
      return;
    }
    if (items.length === 0) {
      setCheckoutMessage({ type: 'info', message: 'Your cart is empty. Add some games first!' });
      return;
    }

    if (!address.trim()) {
      setCheckoutMessage({ type: 'error', message: 'Please enter a shipping address.' });
      return;
    }
    
    if (!selectedPaymentMethodId) {
        setCheckoutMessage({ type: 'error', message: 'Please select a payment method.' });
        return;
    }

    const orderPayload: CreateOrderDto = {
      paymentMethodId: selectedPaymentMethodId,
      address: address,
    };

    try {
      await submitOrderMutation.mutateAsync({ data: orderPayload });
    } catch (err) {
      // Error handled by onError callback
    }
  };

  // Display loading for payment methods or order submission
  if (loadingPaymentMethods || submitOrderMutation.isPending) {
      return <LoadingSpinner />;
  }

  // Display error if payment methods could not be fetched
  if (paymentMethodsError) {
      return <AlertMessage type="error" message={`Error loading payment methods: ${getErrorMessage(paymentMethodsApiError as AxiosError | Error | null)}`} />;
  }


  return (
    <div className="p-4 bg-white shadow-md rounded-lg text-gray-800">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Your Shopping Cart</h1>

      {checkoutMessage && (
        <AlertMessage type={checkoutMessage.type} message={checkoutMessage.message} />
      )}

      {items.length === 0 ? (
        <p className="text-center text-gray-600">Your cart is currently empty. Go <Link to="/games" className="text-blue-500 hover:underline">browse games</Link>!</p>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items List */}
          <div className="lg:w-2/3">
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Game</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item: CartItem) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {item.imageRelativePath && <img className="h-10 w-10 rounded-full" src={item.imageRelativePath} alt={item.name || 'Game Image'} />}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.price?.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <input
                          type="number"
                          min="1"
                          max={item.availableQuantity ?? 9999}
                          value={item.quantity}
                          onChange={(e) => handleUpdateQuantity(item.id!, parseInt(e.target.value))}
                          className="w-20 p-1 border rounded-md"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${((item.price || 0) * item.quantity).toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleRemoveItem(item.id!)}
                          className="text-red-600 hover:text-red-900 ml-4"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={() => dispatch(clearCart())}
              className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            >
              Clear Cart
            </button>
          </div>

          {/* Order Summary & Checkout Form */}
          <div className="lg:w-1/3 bg-gray-50 p-6 rounded-md shadow-md">
            <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
            <div className="flex justify-between items-center mb-4 text-lg">
              <span>Subtotal:</span>
              <span className="font-semibold">${totalPrice.toFixed(2)}</span>
            </div>
            <p className="text-sm text-gray-600 mb-6">Shipping calculated at checkout.</p>

            <form onSubmit={handleCheckout}>
              <div className="mb-4">
                <label htmlFor="address" className="block text-gray-700 text-sm font-bold mb-2">
                  Shipping Address:
                </label>
                <textarea
                  id="address"
                  rows={3}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, City, Zip Code, Country"
                  required
                ></textarea>
              </div>

              {/* Payment Method Selection */}
              <div className="mb-4">
                <label htmlFor="paymentMethod" className="block text-gray-700 text-sm font-bold mb-2">
                  Payment Method:
                </label>
                <select
                  id="paymentMethod"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={selectedPaymentMethodId}
                  onChange={(e) => setSelectedPaymentMethodId(e.target.value)}
                  required
                >
                  <option value="">Select a payment method</option>
                  {paymentMethods?.length === 0 ? (
                    // Display a disabled option if no methods are loaded
                    <option value="" disabled>No payment methods found</option>
                  ) : (
                    // Map through loaded payment methods
                    paymentMethods?.map((method: PaymentMethodViewModel) => (
                      <option key={method.id} value={method.id}>
                        {method.payer || 'Unknown Payer'} ({method.type === 0 ? 'Credit Card' : 'PayPal'})
                      </option>
                    ))
                  )}
                </select>
                {paymentMethodsError && (
                    // Display error message from API if fetching payment methods failed
                    <p className="text-red-500 text-xs italic mt-2">Error: {getErrorMessage(paymentMethodsApiError as AxiosError | Error | null)}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md disabled:opacity-50"
                disabled={items.length === 0 || submitOrderMutation.isPending || !selectedPaymentMethodId || !address.trim()}
              >
                {submitOrderMutation.isPending ? 'Processing...' : 'Proceed to Checkout'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;