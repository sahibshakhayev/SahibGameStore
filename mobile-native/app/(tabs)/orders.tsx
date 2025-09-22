import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Colors } from '../../constants/Colors';

interface OrderItem {
  gameId: string;
  gameName?: string;
  gameImage?: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: string;
  address: string;
  createdDate: string;
  items: OrderItem[];
  status: 0 | 1 | 2 | 3 | 4 | 5;
  total: number;
  userId: string;
}

interface OrdersResponse {
  items: Order[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
}

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadOrders(1, true);
    }, [])
  );

  const loadOrders = async (page = 1, reset = false) => {
    if (reset) {
      setIsLoading(true);
      setCurrentPage(1);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const response: OrdersResponse = await api.getMyOrders(page, 10);
      console.log('Orders response:', response);
      
      if (response && response.items) {
        if (reset) {
          setOrders(response.items);
        } else {
          setOrders(prevOrders => [...prevOrders, ...response.items]);
        }
        setTotalCount(response.totalCount || 0);
        setCurrentPage(page);
      } else {
        if (reset) {
          setOrders([]);
        }
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
      if (reset) {
        setOrders([]);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  };

  const loadMoreOrders = () => {
    if (!isLoadingMore && orders.length < totalCount) {
      loadOrders(currentPage + 1, false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.cancelOrder(orderId);
              loadOrders(1, true); // Reload orders
              Alert.alert('Success', 'Order cancelled successfully');
            } catch (error) {
              console.error('Failed to cancel order:', error);
              Alert.alert('Error', 'Failed to cancel order');
            }
          },
        },
      ]
    );
  };

  const getStatusText = (status: number): string => {
    const statusMap = {
      0: 'Pending',
      1: 'Processing',
      2: 'Shipped',
      3: 'Delivered',
      4: 'Cancelled',
      5: 'Refunded',
    };
    return statusMap[status as keyof typeof statusMap] || 'Unknown';
  };

  const getStatusColor = (status: number): string => {
    const colorMap = {
      0: Colors.warning,      // Pending - Orange
      1: Colors.primary,      // Processing - Blue
      2: Colors.secondary,    // Shipped - Purple
      3: Colors.success,      // Delivered - Green
      4: Colors.error,        // Cancelled - Red
      5: Colors.textSecondary, // Refunded - Gray
    };
    return colorMap[status as keyof typeof colorMap] || Colors.textSecondary;
  };

  const getStatusIcon = (status: number): string => {
    const iconMap = {
      0: '⏳', // Pending
      1: '⚙️', // Processing
      2: '🚚', // Shipped
      3: '✅', // Delivered
      4: '❌', // Cancelled
      5: '💰', // Refunded
    };
    return iconMap[status as keyof typeof iconMap] || '❓';
  };

  const canCancelOrder = (status: number): boolean => {
    return status === 0 || status === 1; // Pending or Processing
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    if (!item || !item.id) {
      return null;
    }

    return (
      <View style={styles.orderItem}>
        <View style={styles.orderHeader}>
          <View style={styles.orderHeaderLeft}>
            <Text style={styles.orderId}>Order #{item.id.slice(-8).toUpperCase()}</Text>
            <Text style={styles.orderDate}>{formatDate(item.createdDate)}</Text>
          </View>
          <View style={styles.statusContainer}>
            <Text style={styles.statusIcon}>{getStatusIcon(item.status)}</Text>
            <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>

        <View style={styles.orderDetails}>
          <Text style={styles.orderAddress}>📍 {item.address}</Text>
          
          <View style={styles.orderItemsSection}>
            <Text style={styles.itemsHeader}>
              Items ({item.items?.length || 0}):
            </Text>
            {item.items && item.items.length > 0 ? (
              item.items.map((orderItem, index) => (
                <View key={`${item.id}-item-${index}`} style={styles.orderItemRow}>
                  <Text style={styles.itemName}>
                    {orderItem.gameName || `Game ${orderItem.gameId.slice(-4)}`}
                  </Text>
                  <Text style={styles.itemQuantity}>x{orderItem.quantity}</Text>
                  <Text style={styles.itemPrice}>
                    ${orderItem.subtotal?.toFixed(2) || (orderItem.price * orderItem.quantity).toFixed(2)}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.noItems}>No items found</Text>
            )}
          </View>
        </View>

        <View style={styles.orderFooter}>
          <View style={styles.totalSection}>
            <Text style={styles.orderTotal}>Total: ${item.total.toFixed(2)}</Text>
          </View>
          
          {canCancelOrder(item.status) && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => cancelOrder(item.id)}
            >
              <Text style={styles.cancelButtonText}>Cancel Order</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.loadingFooter}>
        <LoadingSpinner text="Loading more orders..." />
      </View>
    );
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading orders..." />;
  }

  if (orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📦</Text>
        <Text style={styles.emptyText}>No orders yet</Text>
        <Text style={styles.emptySubtext}>
          Your order history will appear here after you make your first purchase
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl 
            refreshing={isRefreshing} 
            onRefresh={() => {
              setIsRefreshing(true);
              loadOrders(1, true);
            }} 
          />
        }
        onEndReached={loadMoreOrders}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerText}>
              {totalCount} order{totalCount !== 1 ? 's' : ''} found
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
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
  },
  list: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  orderItem: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderHeaderLeft: {
    flex: 1,
  },
  orderId: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
  },
  orderDetails: {
    marginBottom: 16,
  },
  orderAddress: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  orderItemsSection: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
  },
  itemsHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  orderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  itemQuantity: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginHorizontal: 8,
    minWidth: 30,
    textAlign: 'center',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    minWidth: 60,
    textAlign: 'right',
  },
  noItems: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  totalSection: {
    flex: 1,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  cancelButton: {
    backgroundColor: Colors.error,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cancelButtonText: {
    color: Colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
  loadingFooter: {
    paddingVertical: 20,
  },
});