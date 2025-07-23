// src/pages/admin/DashboardPage.tsx
import React from 'react';

const DashboardPage: React.FC = () => {
  return (
    <div className="p-4 bg-white shadow-md rounded-lg text-gray-800">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>
      <p className="text-lg">Welcome to the administration panel. Use the navigation above to manage store entities.</p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-blue-100 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-blue-800 mb-2">Games Overview</h2>
          <p className="text-blue-700">Manage game listings, details, and images.</p>
          <p className="text-sm text-blue-600 mt-2">Go to <a href="/admin/games" className="underline">Manage Games</a></p>
        </div>
        <div className="bg-green-100 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-green-800 mb-2">Order Management</h2>
          <p className="text-green-700">View and update customer order statuses.</p>
          <p className="text-sm text-green-600 mt-2">Go to <a href="/admin/orders" className="underline">View Orders</a></p>
        </div>
        <div className="bg-yellow-100 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">Category Management</h2>
          <p className="text-yellow-700">Manage game genres, platforms, and companies.</p>
          <p className="text-sm text-yellow-600 mt-2">Go to <a href="/admin/genres" className="underline">Manage Genres</a></p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;