// src/pages/NotFoundPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
      <p className="text-2xl mb-8">Page Not Found</p>
      <Link to="/" className="text-blue-400 hover:underline text-lg">Go to Home Page</Link>
    </div>
  );
};

export default NotFoundPage;