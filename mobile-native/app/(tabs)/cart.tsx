import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Colors } from '../../constants/Colors';

interface CartItem {
  gameId: string;
  gameImage: string;
  gameName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface CartResponse {
  items: CartItem[];
  total: number;
}

interface PaymentMethod {
  id: string;
  payer: string;
  email: {
    address: string;
  };
  paymentType: 0 | 1;
  cardHolderName?: string;
  cardNumber?: number;
  active: boolean;
  isValid: boolean;
}

export default function CartScreen() {
  const [cartData, setCartData] = useState<CartResponse>({ items: [], total: 0 });
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadCartData();
    }, [])
  );

  const loadCartData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadCart(),
        loadPaymentMethods(),
      ]);
    } catch (error) {
      console.error('Failed to load cart data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCart = async () => {
    try {
      const response = await api.getCart();
      console.log('Cart data:', response);
      
      if (response && response.items) {
        setCartData({
          items: response.items || [],
          total: response.total || 0
        });
      } else {
        setCartData({ items: [], total: 0 });
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
      setCartData({ items: [], total: 0 });
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const methods = await api.getPaymentMethods();
      const validMethods = (methods || []).filter((method: PaymentMethod) => 
        method && method.id && method.active && method.isValid
      );
      setPaymentMethods(validMethods);
      
      if (validMethods.length > 0 && !selectedPaymentMethod) {
        setSelectedPaymentMethod(validMethods[0].id);
      }
    } catch (error) {
      console.error('Failed to load payment methods:', error);
      setPaymentMethods([]);
    }
  };

  const updateQuantity = async (gameId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(gameId);
      return;
    }

    setIsUpdating(true);
    try {
      await api.updateCart(gameId, quantity);
      await loadCart(); // Reload cart to get updated data
    } catch (error) {
      console.error('Failed to update cart:', error);
      Alert.alert('Error', 'Failed to update cart');
    } finally {
      setIsUpdating(false);
    }
  };

  const removeItem = async (gameId: string) => {
    setIsUpdating(true);
    try {
      await api.removeFromCart(gameId);
      await loadCart(); // Reload cart to get updated data
    } catch (error) {
      console.error('Failed to remove item:', error);
      Alert.alert('Error', 'Failed to remove item');
    } finally {
      setIsUpdating(false);
    }
  };

  const checkout = async () => {
    if (!selectedPaymentMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    if (cartData.items.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    setIsCheckingOut(true);
    try {
      await api.createOrder(selectedPaymentMethod, 'Default Address');
      Alert.alert('Success', 'Order placed successfully!', [
        { text: 'OK', onPress: () => {
          router.push('/(tabs)/orders');
          loadCart(); // Reload cart (should be empty now)
        }},
      ]);
    } catch (error) {
      console.error('Failed to checkout:', error);
      Alert.alert('Error', 'Failed to place order');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const getCardType = (cardNumber?: number): string => {
    if (!cardNumber) return 'Card';
    const cardStr = cardNumber.toString();
    const firstDigit = cardStr.charAt(0);
    
    if (firstDigit === '4') return 'Visa';
    if (firstDigit === '5') return 'Mastercard';
    return 'Card';
  };

  const getImageUrl = (imagePath: string): string => {
    // Handle relative paths from your API
    if (imagePath.startsWith('/')) {
      return `http://172.21.143.216:5159${imagePath}`; // Replace with your actual base URL
    }
    return imagePath;
  };

  const renderCartItem = ({ item }: { item: CartItem }) => {
    if (!item || !item.gameId) {
      return null;
    }

    return (
      <View style={styles.cartItem}>
        <Image
          source={{ uri: getImageUrl(item.gameImage) }}
          style={styles.gameImage}
          defaultSource={{ uri: 'https://via.placeholder.com/80' }}
        />
        <View style={styles.gameInfo}>
          <Text style={styles.gameName}>{item.gameName}</Text>
          <Text style={styles.gamePrice}>${item.price.toFixed(2)}</Text>
          <Text style={styles.subtotal}>Subtotal: ${item.subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.gameId, item.quantity - 1)}
            disabled={isUpdating}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantity}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.gameId, item.quantity + 1)}
            disabled={isUpdating}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeItem(item.gameId)}
          disabled={isUpdating}
        >
          <Text style={styles.removeButtonText}>×</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderPaymentMethod = ({ item }: { item: PaymentMethod }) => {
    if (!item || !item.id) {
      return null;
    }

    return (
      <TouchableOpacity
        style={[
          styles.paymentMethod,
          selectedPaymentMethod === item.id && styles.selectedPaymentMethod,
        ]}
        onPress={() => setSelectedPaymentMethod(item.id)}
      >
        <Text style={styles.paymentMethodText}>
          {item.paymentType === 0 ? '💳' : '🅿️'} {item.payer || 'Unknown'}
        </Text>
        {item.paymentType === 0 && item.cardNumber && (
          <Text style={styles.cardNumber}>
            {getCardType(item.cardNumber)} **** {item.cardNumber.toString().slice(-4)}
          </Text>
        )}
        {item.paymentType === 1 && (
          <Text style={styles.cardNumber}>{item.email?.address}</Text>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading cart..." />;
  }

  if (cartData.items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <Text style={styles.emptySubtext}>Add some games to get started!</Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => router.push('/(tabs)')}
        >
          <Text style={styles.shopButtonText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cartData.items}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.gameId}
        style={styles.cartList}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadCartData} />
        }
        ListHeaderComponent={
          <View style={styles.cartHeader}>
            <Text style={styles.cartHeaderText}>
              {cartData.items.length} item{cartData.items.length !== 1 ? 's' : ''} in your cart
            </Text>
            <Text style={styles.cartTotal}>Total: ${cartData.total.toFixed(2)}</Text>
          </View>
        }
      />

      <View style={styles.checkoutSection}>
        {paymentMethods.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <FlatList
              data={paymentMethods}
              renderItem={renderPaymentMethod}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.paymentMethodsList}
            />
          </>
        ) : (
          <View style={styles.noPaymentMethods}>
            <Text style={styles.noPaymentMethodsText}>No payment methods found</Text>
            <TouchableOpacity
              style={styles.addPaymentButton}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <Text style={styles.addPaymentButtonText}>Add Payment Method</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.finalTotalSection}>
          <Text style={styles.finalTotalText}>Final Total: ${cartData.total.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.checkoutButton, 
            (isCheckingOut || paymentMethods.length === 0) && styles.disabledButton
          ]}
          onPress={checkout}
          disabled={isCheckingOut || paymentMethods.length === 0}
        >
          <Text style={styles.checkoutButtonText}>
            {isCheckingOut ? 'Processing...' : 'Checkout'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  shopButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  cartList: {
    flex: 1,
    padding: 16,
  },
  cartHeader: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cartHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  cartTotal: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  gameImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  gameInfo: {
    flex: 1,
    marginLeft: 12,
  },
  gameName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  gamePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  subtotal: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  quantityButton: {
    backgroundColor: Colors.border,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  quantity: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    backgroundColor: Colors.error,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.surface,
  },
    checkoutSection: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  paymentMethodsList: {
    marginBottom: 16,
  },
  paymentMethod: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    minWidth: 140,
  },
  selectedPaymentMethod: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10', // Light primary color background
  },
  paymentMethodText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  cardNumber: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  noPaymentMethods: {
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
    backgroundColor: Colors.background,
    borderRadius: 8,
  },
  noPaymentMethodsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  addPaymentButton: {
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addPaymentButtonText: {
    color: Colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
  finalTotalSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 16,
    marginBottom: 16,
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 16,
  },
  finalTotalText: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  checkoutButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  checkoutButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});