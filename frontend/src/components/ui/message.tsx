'use client'; // If the onClose prop is used, this component might involve client-side interaction

import React from 'react';
import { XIcon, CheckCircleIcon, XCircleIcon, InfoIcon } from 'lucide-react'; // Using lucide-react for icons

interface MessageProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string | null; // Allow null to easily hide component
  title?: string; // Optional title for the message
  onClose?: () => void;
  className?: string; // Allow passing additional Tailwind classes
}

const Message: React.FC<MessageProps> = ({ type, title, message, onClose, className = '' }) => {
  if (!message) return null; // Don't render if message is null or empty

  const baseStyle = "p-4 mb-4 text-sm rounded-lg relative border flex items-start";
  const typeStyles = {
    success: {
      bg: "bg-green-50 dark:bg-gray-800",
      text: "text-green-700 dark:text-green-400",
      border: "border-green-300 dark:border-green-800",
      icon: <CheckCircleIcon className="h-5 w-5 mr-3 flex-shrink-0" />,
      titleText: "text-green-800 dark:text-green-300"
    },
    error: {
      bg: "bg-red-50 dark:bg-gray-800",
      text: "text-red-700 dark:text-red-400",
      border: "border-red-300 dark:border-red-800",
      icon: <XCircleIcon className="h-5 w-5 mr-3 flex-shrink-0" />,
      titleText: "text-red-800 dark:text-red-300"
    },
    info: {
      bg: "bg-blue-50 dark:bg-gray-800",
      text: "text-blue-700 dark:text-blue-400",
      border: "border-blue-300 dark:border-blue-800",
      icon: <InfoIcon className="h-5 w-5 mr-3 flex-shrink-0" />,
      titleText: "text-blue-800 dark:text-blue-300"
    },
    warning: {
      bg: "bg-yellow-50 dark:bg-gray-800",
      text: "text-yellow-700 dark:text-yellow-400",
      border: "border-yellow-300 dark:border-yellow-800",
      icon: <InfoIcon className="h-5 w-5 mr-3 flex-shrink-0" />, // Or a specific warning icon
      titleText: "text-yellow-800 dark:text-yellow-300"
    },
  };

  const currentStyle = typeStyles[type];

  return (
    <div
      className={`${baseStyle} ${currentStyle.bg} ${currentStyle.text} ${currentStyle.border} ${className}`}
      role="alert"
    >
      {currentStyle.icon}
      <div className="flex-grow">
        {title && <h3 className={`text-lg font-semibold mb-1 ${currentStyle.titleText}`}>{title}</h3>}
        <span className={title ? 'font-normal' : 'font-medium'}>{message}</span>
      </div>
      {onClose && (
        <button
          type="button"
          className={`ml-auto -mx-1.5 -my-1.5 p-1.5 inline-flex items-center justify-center h-8 w-8 rounded-lg focus:ring-2 
                     ${currentStyle.text} hover:opacity-75 focus:ring-offset-1 ${currentStyle.bg} 
                     focus:ring-${type === 'success' ? 'green' : type === 'error' ? 'red' : type === 'info' ? 'blue' : 'yellow'}-400`}
          onClick={onClose}
          aria-label="Close message"
        >
          <span className="sr-only">Close</span>
          <XIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default Message;