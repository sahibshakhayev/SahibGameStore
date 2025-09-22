import { Tabs, Redirect } from 'expo-router';
import { Text } from 'react-native';
import { useAuth } from '../../services/auth';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Colors } from '../../constants/Colors';

// Simple icon components
const HomeIcon = ({ color }: { color: string }) => (
  <Text style={{ color, fontSize: 24 }}>🏠</Text>
);

const CartIcon = ({ color }: { color: string }) => (
  <Text style={{ color, fontSize: 24 }}>🛒</Text>
);

const FavoritesIcon = ({ color }: { color: string }) => (
  <Text style={{ color, fontSize: 24 }}>❤️</Text>
);

const OrdersIcon = ({ color }: { color: string }) => (
  <Text style={{ color, fontSize: 24 }}>📦</Text>
);

const ProfileIcon = ({ color }: { color: string }) => (
  <Text style={{ color, fontSize: 24 }}>👤</Text>
);

export default function TabLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner text="Loading..." />;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: Colors.surface,
        },
        headerTintColor: Colors.text,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: HomeIcon,
          headerTitle: 'Sahib Game Store',
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: CartIcon,
          headerTitle: 'Shopping Cart',
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: FavoritesIcon,
          headerTitle: 'My Favorites',
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: OrdersIcon,
          headerTitle: 'Order History',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ProfileIcon,
          headerTitle: 'My Profile',
        }}
      />
    </Tabs>
  );
}