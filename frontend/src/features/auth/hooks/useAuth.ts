// src/features/auth/hooks/useAuth.ts
import { useDispatch, useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { setTokens, logout as reduxLogout, setUserClaims } from '../authSlice'; // Use setTokens
import type { UserClaims, AuthTokensResponse } from '../authSlice'; // Import from authSlice
import { AxiosError } from 'axios';
import type { RootState } from '../../../store';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { type ChangePasswordDto} from "../../../types/custom";
// import { jwtDecode } from 'jwt-decode'; // <--- REMOVED: No longer relying on client-side JWT decoding for roles

// --- CONFIRMED HOOK NAMES from your endpoints.ts ---
import {
  usePostApiAccountLogin,
  usePostApiAccountRegister,
  useGetApiAccountUserClaims,     // This is the hook for fetching UserClaims
  getGetApiAccountUserClaimsQueryKey, // Helper for query key
  getGetApiAccountUserClaimsQueryOptions, // Helper for query options
  usePostApiAccountLogout,
  // Base functions for Awaited<ReturnType> - Their return types are 'void'
  putApiAccountChangePassword,
  postApiAccountLogin,
  postApiAccountRegister,
  postApiAccountLogout,
  getApiAccountUserClaims, // For Awaited<ReturnType>
} from '../../../lib/api/endpoints';
// ==================================================

export const useAuth = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { isAuthenticated, user, token } = useSelector((state: RootState) => state.auth);

  // --- No longer decoding JWT on client-side for roles ---
  // const decodeAndSetUserClaims = (accessToken: string) => { ... };

  // This query will fetch user claims from the API.
  // We'll enable it when `isAuthenticated` is true and `user` is null.
  const { data: fetchedUserClaims, isLoading: isLoadingClaims, error: claimsError, refetch: refetchUserClaims } = useGetApiAccountUserClaims<
    UserClaims, // This is the expected data type from the /UserClaims API
    AxiosError
  >(
    {
      query: {
        enabled: isAuthenticated && !user && !!token, // Only fetch if authenticated, no user data yet, and token exists
        onSuccess: (data: UserClaims) => { // Data is typed as UserClaims, assumes backend returns it
          dispatch(setUserClaims(data)); // Set user claims in Redux
        },
        onError: (err: AxiosError) => {
          console.error('Failed to fetch user claims:', err.response?.data || err.message);
          dispatch(reduxLogout()); // Logout if user claims cannot be fetched
          navigate('/login');
        },
        retry: false, // Don't retry fetching user claims if it fails (e.g., token invalid)
      } as any // Cast the 'query' options object to 'any' for safety with complex overloads
    }
  );


  // 1. Login Mutation
  const loginMutation = usePostApiAccountLogin<AuthTokensResponse, unknown>({
    mutation: {
      onSuccess: (data: void) => { // Data is typed as 'void' by Orval, but we know it's AuthTokensResponse
        const authResponse = data as unknown as AuthTokensResponse;
        dispatch(setTokens(authResponse));
        // --- FIX: Immediately refetch user claims after successful token acquisition ---
        refetchUserClaims(); // Trigger the useGetApiAccountUserClaims query manually

        queryClient.invalidateQueries({ queryKey: ['cart'] }); // Invalidate cart as it's user-specific
        navigate('/'); // Redirect to home after login and claims initiated
      },
      onError: (err: unknown) => {
        const axiosErr = err as AxiosError;
        console.error('Login failed:', axiosErr.response?.data || axiosErr.message);
      },
    },
  });

  // 2. Register Mutation
  const registerMutation = usePostApiAccountRegister<AuthTokensResponse, unknown>({
    mutation: {
      onSuccess: (data: void) => { // Data is typed as 'void' by Orval, but we know it's AuthTokensResponse
        const authResponse = data as unknown as AuthTokensResponse;
        dispatch(setTokens(authResponse));
        // --- FIX: Immediately refetch user claims after successful token acquisition ---
        refetchUserClaims(); // Trigger the useGetApiAccountUserClaims query manually

        navigate('/');
      },
      onError: (err: unknown) => {
        const axiosErr = err as AxiosError;
        console.error('Registration failed:', axiosErr.response?.data || axiosErr.message);
      },
    },
  });




const changePasswordMutation = useMutation({
  mutationFn: putApiAccountChangePassword,
  onSuccess: () => {
    alert('Password changed successfully!');
  },
  onError: (err: AxiosError) => {
    console.error('Change password failed:', err.response?.data || err.message);
  },
});


  // 4. Logout Mutation (remains unchanged)
  const logoutMutation = usePostApiAccountLogout<void, AxiosError>({
    mutation: {
      onSuccess: () => {
        dispatch(reduxLogout());
        queryClient.clear();
        navigate('/login');
      },
      onError: (error: any) => {
        const err = error as AxiosError;
        console.error('Logout failed:', err.response?.data || err.message);
        dispatch(reduxLogout());
        queryClient.clear();
        navigate('/login');
      },
    },
  });

  // Effect to handle initial session setup after refresh/re-load
  useEffect(() => {
    // If authenticated (means accessToken is in localStorage and redux state)
    // AND user object is not yet populated in Redux state
    // AND we're not currently fetching claims via the query (to avoid redundant fetches)
    if (isAuthenticated && !user && !isLoadingClaims) {
      // The `refetchUserClaims` is auto-enabled by `isAuthenticated && !user && !!token`
      // So, it will naturally run if `token` is present and `user` is null.
      // We don't need a manual `prefetchQuery` here if `refetchUserClaims` is active.
      // `refetchUserClaims` will run if enabled is true.
    }
  }, [isAuthenticated, user, isLoadingClaims, refetchUserClaims]);


  return {
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    changePassword: changePasswordMutation.mutate,
    isChangingPassword: changePasswordMutation.isPending,
    changePasswordError: changePasswordMutation.error,
    isAuthenticated,
    user, // This user object will now come definitively from the API
    isLoadingAuth: loginMutation.isPending || registerMutation.isPending || isLoadingClaims,
    authError: loginMutation.error || registerMutation.error || claimsError,
  };
};