import { Stack } from 'expo-router';
import { AuthProvider } from '../services/auth';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen 
          name="game/[id]" 
          options={{ 
            headerShown: true, 
            title: 'Game Details',
            presentation: 'modal'
          }} 
        />
      </Stack>
    </AuthProvider>
  );
}