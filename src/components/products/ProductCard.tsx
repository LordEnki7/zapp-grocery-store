import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiShoppingCart, 
  FiHeart, 
  FiStar, 
  FiEye, 
  FiCheck,
  FiPlus,
  FiMinus,
  FiTruck,
  FiClock,
  FiTag,
  FiZap
} from 'react-icons/fi';
import { formatCurrency } from '../../services/productService';
import type { Product } from '../../services/productService';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import ProductImage from './ProductImage';
import { getProductImagePath, createImageErrorHandler } from '../../utils/imageUtils';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list' | 'comparison';
  onQuickView?: (product: Product) => void;
  onCompare?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  showComparison?: boolean;
  isSelected?: boolean;
  onSelect?: (productId: string, selected: boolean) => void;
  enableBulkActions?: boolean;
  onMiniCartOpen?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  viewMode = 'grid',
  onQuickView,
  onCompare,
  onAddToCart,
  showComparison = false,
  isSelected = false,
  onSelect,
  enableBulkActions = false,
  onMiniCartOpen
}) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showQuickView, setShowQuickView] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const isFavorite = isInWishlist(product.id);
  
  const handleAddToCart = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!product.inStock) return;
    
    setIsAddingToCart(true);
    addToCart(product, quantity);
    
    // Trigger mini cart opening after a short delay
    setTimeout(() => {
      onMiniCartOpen?.();
    }, 500);
    
    // Reset the adding state
    setTimeout(() => {
      setIsAddingToCart(false);
    }, 1500);
  };
  
  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickView(true);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isFavorite) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleQuantityChange = (delta: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newQuantity = Math.max(1, quantity + delta);
    setQuantity(newQuantity);
  };
  
  // Determine if this product has volume discounts
  const hasDiscount = product.volumeDiscounts && product.volumeDiscounts.length > 0;
  
  // Calculate maximum discount percentage
  const maxDiscountPercentage = hasDiscount 
    ? Math.max(...product.volumeDiscounts!.map(d => d.discountPercentage))
    : 0;

  // Calculate savings
  const originalPrice = product.price;
  const currentPrice = hasDiscount ? originalPrice * (1 - maxDiscountPercentage / 100) : originalPrice;
  const savings = originalPrice - currentPrice;

  // Rating display
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        className={`w-3 h-3 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : i < rating 
            ? 'text-yellow-400 fill-current opacity-50' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  // Availability status
  const getAvailabilityStatus = () => {
    if (product.inStock && product.stock > 10) {
      return { text: 'In Stock', color: 'text-green-600', icon: FiCheck };
    } else if (product.inStock && product.stock <= 10) {
      return { text: `Only ${product.stock} left`, color: 'text-orange-600', icon: FiClock };
    } else {
      return { text: 'Out of Stock', color: 'text-red-600', icon: FiClock };
    }
  };

  const availability = getAvailabilityStatus();

  if (viewMode === 'list') {
    return (
      <div className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-300 p-4">
        <div className="flex gap-4">
          {/* Product Image */}
          <div className="flex-shrink-0 w-32 h-32 relative group">
            <img
              src={getProductImagePath(product)}
              alt={product.name}
              className="w-full h-full object-cover rounded-lg"
              onError={createImageErrorHandler()}
            />
            {hasDiscount && (
              <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                {maxDiscountPercentage}% OFF
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <Link to={`/product/${product.id}`} className="block">
                  <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
              </div>
              
              <button
                onClick={handleToggleFavorite}
                className={`ml-4 p-2 rounded-full transition-colors ${
                  isFavorite ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                }`}
              >
                <FiHeart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Rating and Reviews */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center">
                {renderStars(product.rating)}
              </div>
              <span className="text-sm text-gray-600">({product.reviewCount || 0})</span>
            </div>

            {/* Availability */}
            <div className="flex items-center gap-1 mb-3">
              <availability.icon className={`w-4 h-4 ${availability.color}`} />
              <span className={`text-sm font-medium ${availability.color}`}>
                {availability.text}
              </span>
            </div>

            {/* Price and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-900">
                  {formatCurrency(currentPrice)}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatCurrency(originalPrice)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {showQuickAdd && (
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={(e) => handleQuantityChange(-1, e)}
                      className="p-2 hover:bg-gray-50 transition-colors"
                      disabled={quantity <= 1}
                    >
                      <FiMinus className="w-4 h-4" />
                    </button>
                    <span className="px-3 py-2 text-sm font-medium">{quantity}</span>
                    <button
                      onClick={(e) => handleQuantityChange(1, e)}
                      className="p-2 hover:bg-gray-50 transition-colors"
                    >
                      <FiPlus className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock || isAddingToCart}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    isAddingToCart
                      ? 'bg-green-500 text-white'
                      : product.inStock
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isAddingToCart ? (
                    <div className="flex items-center gap-2">
                      <FiCheck className="w-4 h-4" />
                      Added!
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <FiShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view (enhanced)
  return (
    <div
      ref={cardRef}
      className="bg-white border border-gray-200 rounded-xl hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Container */}
      <div className="relative aspect-square overflow-hidden">
        <Link 
          to={`/product/${product.id}`}
          onClick={() => console.log('Product image clicked, navigating to:', `/product/${product.id}`)}
        >
          {(() => {
            return (
              <img
                src={getProductImagePath(product)}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={createImageErrorHandler()}
              />
            );
          })()}
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {hasDiscount && (
            <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <FiTag className="w-3 h-3" />
              {maxDiscountPercentage}% OFF
            </div>
          )}
          {product.featured && (
            <div className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <FiZap className="w-3 h-3" />
              Featured
            </div>
          )}
        </div>

        {/* Quick Actions Overlay */}
        <div className={`absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center pointer-events-none ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="flex gap-2 pointer-events-auto">
            <Link
              to={`/product/${product.id}`}
              className="bg-white text-gray-700 p-3 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
              title="Quick View"
              onClick={(e) => e.stopPropagation()}
            >
              <FiEye className="w-5 h-5" />
            </Link>
            <button
              onClick={handleToggleFavorite}
              className={`p-3 rounded-full shadow-lg transition-colors ${
                isFavorite 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-500'
              }`}
              title="Add to Wishlist"
            >
              <FiHeart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Wishlist Button (Always Visible) - Mobile Optimized */}
        <button
          onClick={handleToggleFavorite}
          className={`absolute top-3 right-3 p-3 md:p-2 rounded-full transition-all duration-300 touch-manipulation min-w-[44px] min-h-[44px] md:min-w-auto md:min-h-auto flex items-center justify-center ${
            isFavorite 
              ? 'bg-red-500 text-white shadow-lg' 
              : 'bg-white bg-opacity-80 text-gray-600 hover:bg-red-50 hover:text-red-500 active:bg-red-100'
          }`}
        >
          <FiHeart className={`w-5 h-5 md:w-4 md:h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Brand */}
        {product.brand && (
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
            {product.brand}
          </p>
        )}

        {/* Product Name */}
        <Link 
          to={`/product/${product.id}`}
          onClick={() => console.log('Product name clicked, navigating to:', `/product/${product.id}`)}
        >
          <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 mb-2 min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center">
            {renderStars(product.rating)}
          </div>
          <span className="text-sm text-gray-600">({product.reviewCount || 0})</span>
        </div>

        {/* Availability */}
        <div className="flex items-center gap-1 mb-3">
          <availability.icon className={`w-4 h-4 ${availability.color}`} />
          <span className={`text-sm font-medium ${availability.color}`}>
            {availability.text}
          </span>
          {product.inStock && (
            <div className="flex items-center gap-1 ml-2 text-xs text-gray-500">
              <FiTruck className="w-3 h-3" />
              <span>Free delivery</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl font-bold text-gray-900">
              {formatCurrency(currentPrice)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                {formatCurrency(originalPrice)}
              </span>
            )}
          </div>
          {savings > 0 && (
            <p className="text-sm text-green-600 font-medium">
              Save {formatCurrency(savings)}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Quantity Selector - Mobile Optimized */}
          <div className="flex items-center border border-gray-300 rounded-lg bg-white touch-manipulation">
            <button
              onClick={(e) => handleQuantityChange(-1, e)}
              className="p-3 md:p-2 hover:bg-gray-50 active:bg-gray-100 transition-colors rounded-l-lg touch-manipulation min-w-[44px] min-h-[44px] md:min-w-auto md:min-h-auto flex items-center justify-center"
              disabled={quantity <= 1}
            >
              <FiMinus className="w-4 h-4 md:w-3 md:h-3" />
            </button>
            <span className="px-4 py-3 md:px-3 md:py-2 text-sm font-medium min-w-[3rem] md:min-w-[2.5rem] text-center border-x border-gray-300">
              {quantity}
            </span>
            <button
              onClick={(e) => handleQuantityChange(1, e)}
              className="p-3 md:p-2 hover:bg-gray-50 active:bg-gray-100 transition-colors rounded-r-lg touch-manipulation min-w-[44px] min-h-[44px] md:min-w-auto md:min-h-auto flex items-center justify-center"
            >
              <FiPlus className="w-4 h-4 md:w-3 md:h-3" />
            </button>
          </div>

          {/* Add to Cart Button - Mobile Optimized */}
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock || isAddingToCart}
            className={`flex-1 py-3 md:py-2 px-4 rounded-lg font-medium transition-all duration-300 touch-manipulation min-h-[44px] md:min-h-auto ${
              isAddingToCart
                ? 'bg-green-500 text-white transform scale-95'
                : product.inStock
                ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 hover:shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isAddingToCart ? (
              <div className="flex items-center justify-center gap-2">
                <FiCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Added!</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <FiShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">Add to Cart</span>
                <span className="sm:hidden">Add</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // Render star rating for list view
  const renderStarsForList = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({product.reviewCount || 0})</span>
      </div>
    );
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <div className="flex p-4">
          {/* Product Image */}
          <div className="w-32 h-32 flex-shrink-0 mr-4">
            {(() => {
              return (
                <img
                  src={getProductImagePath(product)}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                  onError={createImageErrorHandler()}
                />
              );
            })()}
          </div>

          {/* Product Info */}
          <div className="flex-grow">
            <div className="flex justify-between items-start mb-2">
              <Link 
                to={`/product/${product.id}`}
                className="text-lg font-semibold text-gray-800 hover:text-green-600 line-clamp-2"
              >
                {product.name}
              </Link>
              <button
                onClick={handleToggleFavorite}
                className={`p-2 rounded-full ${
                  isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                }`}
              >
                <FiHeart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>

            <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{product.category}</span>
              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{product.origin}</span>
              {product.stock <= 10 && product.stock > 0 && (
                <span className="text-xs px-2 py-1 bg-orange-100 text-orange-800 rounded-full">
                  Only {product.stock} left
                </span>
              )}
            </div>

            {product.rating && renderStarsForList(product.rating)}

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-900">
                  {formatCurrency(product.price, product.currency)}
                </span>
                {hasDiscount && (
                  <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded-full">
                    Up to {maxDiscountPercentage}% OFF
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleQuickView}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                  title="Quick View"
                >
                  <FiEye className="w-5 h-5" />
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || product.stock === 0}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    product.stock === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : isAddingToCart
                      ? 'bg-green-600 text-white'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {product.stock === 0 ? (
                    'Out of Stock'
                  ) : isAddingToCart ? (
                    'Added!'
                  ) : (
                    <>
                      <FiShoppingCart className="w-4 h-4 mr-1 inline" />
                      Add to Cart
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col group">
      {/* Product Image with Hover Effects */}
      <div className="relative overflow-hidden">
        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-2 left-2 z-10">
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Up to {maxDiscountPercentage}% OFF
            </span>
          </div>
        )}

        {/* Stock Badge */}
        {product.stock <= 10 && product.stock > 0 && (
          <div className="absolute top-2 right-2 z-10">
            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Only {product.stock} left
            </span>
          </div>
        )}

        {/* Out of Stock Badge */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <span className="bg-red-600 text-white px-3 py-1 rounded-full font-medium">
              Out of Stock
            </span>
          </div>
        )}

        <Link to={`/product/${product.id}`}>
          {(() => {
            return (
              <img
                src={getProductImagePath(product)}
                alt={product.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                onError={createImageErrorHandler()}
              />
            );
          })()}
        </Link>

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-2">
            <button
              onClick={handleQuickView}
              className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
              title="Quick View"
            >
              <FiEye className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={handleToggleFavorite}
              className={`p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors ${
                isFavorite ? 'text-red-500' : 'text-gray-700'
              }`}
              title="Add to Favorites"
            >
              <FiHeart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 flex-grow flex flex-col">
        <div className="flex items-start justify-between mb-2">
          <Link 
            to={`/product/${product.id}`}
            className="text-lg font-semibold text-gray-800 hover:text-green-600 line-clamp-2 flex-grow"
          >
            {product.name}
          </Link>
        </div>

        <div className="flex flex-wrap gap-1 mb-2">
          <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{product.category}</span>
          <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{product.origin}</span>
        </div>

        {product.rating && (
          <div className="mb-2">
            {renderStars(product.rating)}
          </div>
        )}

        <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-grow">{product.description}</p>

        {/* Price and Add to Cart */}
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xl font-bold text-gray-900">
                {formatCurrency(product.price, product.currency)}
              </span>
              {hasDiscount && (
                <div className="text-xs text-green-600 font-medium">
                  Volume discounts available
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart || product.stock === 0}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              product.stock === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isAddingToCart
                ? 'bg-green-600 text-white'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {product.stock === 0 ? (
              'Out of Stock'
            ) : isAddingToCart ? (
              'Added to Cart!'
            ) : (
              <>
                <FiShoppingCart className="w-4 h-4 mr-2 inline" />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;