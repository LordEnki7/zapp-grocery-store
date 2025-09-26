import React from 'react';
import { AuthProvider } from './AuthContext';
import { CartProvider } from './CartContext';
import { WishlistProvider } from './WishlistContext';
import { LanguageProvider } from './LanguageContext';

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
};