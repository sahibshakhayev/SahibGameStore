// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Optional: customize refetch behavior
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1, // Number of retries on failed queries
    },
    mutations: {
      onError: (error) => {
        // Global mutation error handling
        console.error("Mutation failed:", error);
        // You could dispatch a global error notification here
      },
    },
  },
});

export default queryClient;