// src/layouts/AdminLayout.tsx
import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useSelector } from 'react-redux';
import { type RootState } from '../store';

const AdminLayout: React.FC = () => {
  const { logout } = useAuth();
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  // Redirect if not admin or not authenticated (PrivateRoute handles initial check)
  if (!user?.roles.includes('Admin')) {
    navigate('/', { replace: true });
    return null; // Don't render if unauthorized
  }

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col">
      <header className="bg-black-800 text-white p-4 shadow-md">
        <nav className="container mx-auto flex justify-between items-center">
          <Link to="/admin" className="text-2xl font-bold">Admin Panel</Link>
          <ul className="flex space-x-4">
            <li><Link to="/admin/games" className="hover:text-purple-200">Manage Games</Link></li>
            <li><Link to="/admin/genres" className="hover:text-purple-200">Manage Genres</Link></li>
            <li><Link to="/admin/platforms" className="hover:text-purple-200">Manage Platforms</Link></li>
            <li><Link to="/admin/companies" className="hover:text-purple-200">Manage Companies</Link></li>
            <li><Link to="/admin/orders" className="hover:text-purple-200">View Orders</Link></li>
            <li><Link to="/" className="hover:text-purple-200">Back to Customer Site</Link></li>
            <li><button onClick={() => logout()} className="hover:text-purple-200">Logout ({user?.userName})</button></li>
          </ul>
        </nav>
      </header>
      <main className="flex-grow container mx-auto p-4">
        <Outlet /> {/* Renders nested routes */}
      </main>
      <footer className="bg-gray-800 text-white p-4 text-center">
        &copy; 2025 Sahib  Game Store Admin.
      </footer>
    </div>
  );
};

export default AdminLayout;