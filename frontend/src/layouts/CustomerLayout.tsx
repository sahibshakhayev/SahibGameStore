// src/layouts/CustomerLayout.tsx
import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';

const CustomerLayout: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-black-600 text-white p-4 shadow-md">
        <nav className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">Game Store</Link>
          <ul className="flex space-x-4">
            <li><Link to="/games" className="hover:text-blue-200">Browse Games</Link></li>
            <li><Link to="/cart" className="hover:text-blue-200">Cart</Link></li>
            {isAuthenticated ? (
              <>
                <li><Link to="/orders" className="hover:text-blue-200">My Orders</Link></li>
                {user?.roles.includes('Admin') && (
                  <li><Link to="/admin" className="hover:text-blue-200">Admin Panel</Link></li>
                )}
                <li><button onClick={() => logout()} className="hover:text-blue-200">Logout ({user?.userName})</button></li>
              </>
            ) : (
              <>
                <li><Link to="/login" className="hover:text-blue-200">Login</Link></li>
                <li><Link to="/register" className="hover:text-blue-200">Register</Link></li>
              </>
            )}
          </ul>
        </nav>
      </header>
      <main className="flex-grow container mx-auto p-4">
        <Outlet /> {/* Renders nested routes */}
      </main>
      <footer className="bg-gray-800 text-white p-4 text-center">
        &copy; 2025 Sahib Game Store. All rights reserved.
      </footer>
    </div>
  );
};

export default CustomerLayout;