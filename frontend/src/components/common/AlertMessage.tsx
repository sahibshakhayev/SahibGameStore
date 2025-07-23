// src/components/common/AlertMessage.tsx
import React from 'react';

interface AlertMessageProps {
  type: 'success' | 'error' | 'info';
  message: string;
}

const AlertMessage: React.FC<AlertMessageProps> = ({ type, message }) => {
  let bgColor = '';
  let textColor = '';

  switch (type) {
    case 'success':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      break;
    case 'error':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      break;
    case 'info':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      break;
    default:
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
  }

  return (
    <div className={`${bgColor} ${textColor} p-3 rounded-md mb-4`}>
      {message}
    </div>
  );
};

export default AlertMessage;