// src/App.tsx
import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { store } from './store';
import queryClient from './lib/queryClient';
import AuthPage from './pages/AuthPage';
import CustomerLayout from './layouts/CustomerLayout';
import AdminLayout from './layouts/AdminLayout';
import PrivateRoute from './components/common/PrivateRoute'; // For role-based protection
import LoadingSpinner from './components/common/LoadingSpinner'; // Generic loading component (create this if you haven't)
import NotFoundPage from './pages/NotFoundPage'; // Create a simple 404 page

// Customer Pages - Lazy loaded for code splitting
const HomePage = lazy(() => import('./pages/customer/HomePage'));
const GameListPage = lazy(() => import('./pages/customer/GameListPage'));
const GameDetailPage = lazy(() => import('./pages/customer/GameDetailPage'));
const CartPage = lazy(() => import('./pages/customer/CartPage'));
const OrderHistoryPage = lazy(() => import('./pages/customer/OrderHistoryPage'));

// Admin Pages - Lazy loaded for code splitting
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const ManageGamesPage = lazy(() => import('./pages/admin/ManageGamesPage'));
const ManageGenresPage = lazy(() => import('./pages/admin/ManageGenresPage'));
const ManagePlatformsPage = lazy(() => import('./pages/admin/ManagePlatformsPage'));
const ManageCompaniesPage = lazy(() => import('./pages/admin/ManageCompaniesPage'));
const ManageOrdersPage = lazy(() => import('./pages/admin/ManageOrdersPage'));


function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<AuthPage />} />
              <Route path="/register" element={<AuthPage isRegister />} />

              {/* Customer Routes with CustomerLayout */}
              <Route path="/" element={<CustomerLayout />}>
                <Route index element={<HomePage />} />
                <Route path="games" element={<GameListPage />} />
                <Route path="games/:id" element={<GameDetailPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="orders" element={<PrivateRoute allowedRoles={['Customer', 'Admin']}><OrderHistoryPage /></PrivateRoute>} />
              </Route>

              {/* Admin Routes with AdminLayout (protected by PrivateRoute inside) */}
              <Route path="/admin" element={<PrivateRoute allowedRoles={['Admin']}><AdminLayout /></PrivateRoute>}>
                <Route index element={<DashboardPage />} /> {/* Admin Dashboard */}
                <Route path="games" element={<ManageGamesPage />} />
                <Route path="genres" element={<ManageGenresPage />} />
                <Route path="platforms" element={<ManagePlatformsPage />} />
                <Route path="companies" element={<ManageCompaniesPage />} />
                <Route path="orders" element={<ManageOrdersPage />} />
              </Route>

              {/* Fallback for unmatched routes */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </Router>
        {/* React Query Devtools for easy debugging */}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Provider>
  );
}

export default App;