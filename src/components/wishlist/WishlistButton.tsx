import React, { useState } from 'react';
import { FiHeart } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import type { Product } from '../../services/productService';

interface WishlistButtonProps {
  product: Product;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  variant?: 'default' | 'minimal' | 'floating';
}

const WishlistButton: React.FC<WishlistButtonProps> = ({
  product,
  size = 'md',
  showText = false,
  className = '',
  variant = 'default'
}) => {
  const { user } = useAuth();
  const { wishlistItems, addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isAnimating, setIsAnimating] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const isWishlisted = isInWishlist(product.id);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      // Show login prompt or redirect to login
      alert('Please log in to add items to your wishlist');
      return;
    }

    setIsAnimating(true);

    try {
      if (isWishlisted) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist(product);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    } finally {
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-6 h-6 text-sm';
      case 'lg':
        return 'w-10 h-10 text-lg';
      default:
        return 'w-8 h-8 text-base';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'minimal':
        return 'bg-transparent hover:bg-gray-100 border-none shadow-none';
      case 'floating':
        return 'bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg border border-gray-200';
      default:
        return 'bg-white hover:bg-gray-50 border border-gray-200 shadow-sm';
    }
  };

  const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';

  return (
    <div className="relative">
      <button
        onClick={handleToggleWishlist}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`
          ${getSizeClasses()}
          ${getVariantClasses()}
          ${className}
          flex items-center justify-center rounded-full transition-all duration-200
          ${isAnimating ? 'scale-110' : 'scale-100'}
          ${isWishlisted ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}
          focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        disabled={isAnimating}
        title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        {isWishlisted ? (
          <FaHeart className={`${iconSize} ${isAnimating ? 'animate-pulse' : ''}`} />
        ) : (
          <FiHeart className={`${iconSize} ${isAnimating ? 'animate-pulse' : ''}`} />
        )}
        
        {showText && (
          <span className={`ml-2 ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'}`}>
            {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
          </span>
        )}
      </button>

      {/* Tooltip */}
      {showTooltip && !showText && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-10">
          {isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
        </div>
      )}

      {/* Animation overlay */}
      {isAnimating && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default WishlistButton;