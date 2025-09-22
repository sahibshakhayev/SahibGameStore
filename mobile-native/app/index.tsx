import { Redirect } from 'expo-router';
import { useAuth } from '../services/auth';
import { LoadingSpinner } from '../components/LoadingSpinner';

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner text="Loading..." />;
  }

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}