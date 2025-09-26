import React from 'react';

interface CardIconProps {
  type: string;
  className?: string;
}

export const CardIcon: React.FC<CardIconProps> = ({ type, className = "w-8 h-5" }) => {
  const getCardIcon = () => {
    switch (type) {
      case 'visa':
        return (
          <svg viewBox="0 0 40 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="24" rx="4" fill="#1A1F71"/>
            <path d="M16.1 7.2h-2.8l-1.7 9.6h2.8l1.7-9.6zm7.6 6.2c0-2.5-3.4-2.6-3.4-3.7 0-.3.3-.7 1-.7.6 0 1.1.1 1.6.3l.3-1.9c-.4-.1-1-.3-1.7-.3-1.8 0-3.1 1-3.1 2.3 0 1 .9 1.5 1.6 1.9.7.4 1 .6 1 1 0 .6-.7.9-1.4.9-.9 0-1.4-.2-2.2-.5l-.3 2c.5.2 1.4.4 2.4.4 1.9 0 3.2-.9 3.2-2.3zm5.2 3.4h2.4l-2.1-9.6h-2.2c-.5 0-.9.3-1.1.7l-3.9 8.9h2.8l.6-1.6h3.5l.3 1.6zm-3-3.7l1.4-3.9.8 3.9h-2.2zm-9.8-5.9l-2.6 6.5-.3-1.5c-.5-1.7-2.1-3.5-3.9-4.2l2.5 9.1h2.8l4.3-9.9h-2.8z" fill="white"/>
          </svg>
        );
      case 'mastercard':
        return (
          <svg viewBox="0 0 40 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="24" rx="4" fill="#000"/>
            <circle cx="15" cy="12" r="7" fill="#EB001B"/>
            <circle cx="25" cy="12" r="7" fill="#F79E1B"/>
            <path d="M20 6.5c1.3 1.2 2.1 2.9 2.1 4.8s-.8 3.6-2.1 4.8c-1.3-1.2-2.1-2.9-2.1-4.8s.8-3.6 2.1-4.8z" fill="#FF5F00"/>
          </svg>
        );
      case 'amex':
        return (
          <svg viewBox="0 0 40 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="24" rx="4" fill="#006FCF"/>
            <path d="M8.5 7.5h3.2l.7 1.6.7-1.6h3.2v9h-2.4v-5.4l-.8 1.9h-1.4l-.8-1.9v5.4h-2.4v-9zm8.8 0h6.4v1.8h-4v1.2h3.8v1.7h-3.8v1.4h4v1.9h-6.4v-9zm8.2 0h2.4l1.4 3.2 1.4-3.2h2.4l-2.4 4.5v4.5h-2.4v-4.5l-2.4-4.5z" fill="white"/>
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 40 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="24" rx="4" fill="#6B7280" stroke="#D1D5DB"/>
            <rect x="4" y="8" width="32" height="2" fill="#9CA3AF"/>
            <rect x="4" y="12" width="8" height="1" fill="#9CA3AF"/>
          </svg>
        );
    }
  };

  return getCardIcon();
};

export default CardIcon;