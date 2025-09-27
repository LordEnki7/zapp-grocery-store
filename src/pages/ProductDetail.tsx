import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMinus, FiPlus, FiShoppingCart, FiTag } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import Button from '../components/ui/Button';
import { getProductById, formatCurrency, getSimilarProducts } from '../services/productService';
import { useCart } from '../context/CartContext';
import type { Product } from '../services/productService';
import VolumeDiscountInfo from '../components/cart/VolumeDiscountInfo';
import ProductCard from '../components/products/ProductCard';
import BulkPurchaseOptions from '../components/products/BulkPurchaseOptions';
import FrequentlyBoughtTogether from '../components/products/FrequentlyBoughtTogether';
import ProductImage from '../components/products/ProductImage';
import { safeTranslate, logMissingTranslations, PRODUCT_DETAIL_REQUIRED_KEYS } from '../utils/translationValidator';
import { getProductImagePaths, createImageErrorHandler } from '../utils/imageUtils';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(5); // Default to 5 for bulk
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Generate product images using the unified utility

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        if (!id) {
          throw new Error('Product ID is missing');
        }
        
        const productData = await getProductById(id);
        if (!productData) {
          throw new Error('Product not found');
        }
        
        setProduct(productData);
        
        // Fetch similar products
        const relatedProducts = await getSimilarProducts(id, 4);
        setSimilarProducts(relatedProducts);
        
      } catch (err) {
        setError((err as Error).message);
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);

  // Validate translations in development
  useEffect(() => {
    logMissingTranslations('ProductDetail', t, PRODUCT_DETAIL_REQUIRED_KEYS);
  }, [t]);

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      // Show success message
      setAddedToCart(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setAddedToCart(false);
      }, 3000);
    }
  };
  
  const handleGoToCart = () => {
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 p-4 rounded-md">
          <h2 className="text-xl font-semibold text-red-700 mb-2">{safeTranslate(t, 'errors.productNotFound')}</h2>
          <p className="text-red-600 mb-4">{error || safeTranslate(t, 'errors.unavailable')}</p>
          <Link to="/products">
            <Button variant="secondary">{safeTranslate(t, 'buttons.backToProducts')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate potential discount based on current quantity
  const getDiscountInfo = () => {
    if (!product.volumeDiscounts || product.volumeDiscounts.length === 0) {
      return null;
    }
    
    // Sort by highest quantity first to get the best discount
    const sortedDiscounts = [...product.volumeDiscounts]
      .sort((a, b) => b.quantity - a.quantity)
      .filter(discount => quantity >= discount.quantity);
    
    if (sortedDiscounts.length === 0) {
      return null;
    }
    
    const discount = sortedDiscounts[0];
    const originalPrice = product.price * quantity;
    const savings = originalPrice * (discount.discountPercentage / 100);
    const discountedPrice = originalPrice - savings;
    
    return {
      originalPrice,
      discountedPrice,
      savings,
      percentage: discount.discountPercentage
    };
  };
  
  const discountInfo = getDiscountInfo();
  const productImages = getProductImagePaths(product, 4);

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/products" className="inline-flex items-center text-green-600 hover:text-green-700 mb-6">
        <FiArrowLeft className="mr-2" />
        {safeTranslate(t, 'buttons.backToProducts')}
      </Link>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          {/* Product Image Gallery */}
          <div>
            {/* Main product image */}
            <div className="rounded-lg overflow-hidden mb-4">
              <img
                src={productImages[currentImageIndex]}
                alt={product.name}
                className="w-full h-80 object-cover rounded-lg"
                onError={createImageErrorHandler()}
              />
            </div>
            
            {/* Thumbnail gallery */}
            <div className="grid grid-cols-4 gap-2">
              {productImages.map((img, index) => (
                <div 
                  key={index}
                  className={`rounded-md overflow-hidden cursor-pointer ${
                    currentImageIndex === index ? 'ring-2 ring-green-500' : ''
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-16 object-cover rounded-md"
                    onError={createImageErrorHandler()}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-gray-100 text-sm px-3 py-1 rounded-full">
                {product.category}
              </span>
              <span className="bg-gray-100 text-sm px-3 py-1 rounded-full">
                {product.origin}
              </span>
              <span className="bg-gray-100 text-sm px-3 py-1 rounded-full">
                {product.weight}
              </span>
              {product.inStock ? (
                <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                  {safeTranslate(t, 'product.inStock')}
                </span>
              ) : (
                <span className="bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full">
                  {safeTranslate(t, 'product.outOfStock')}
                </span>
              )}
              
              {/* Reseller Tag */}
              <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full flex items-center">
                <FiTag className="mr-1" />
                {safeTranslate(t, 'product.resellerItem')}
              </span>
            </div>
            
            {/* Price section with volume discount */}
            <div className="mb-6">
              {discountInfo ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(discountInfo.discountedPrice, product.currency)}
                    </span>
                    <span className="text-lg line-through text-gray-500">
                      {formatCurrency(discountInfo.originalPrice, product.currency)}
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-sm">
                      {discountInfo.percentage}% OFF
                    </span>
                  </div>
                  <div className="text-green-600 text-sm flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {safeTranslate(t, 'product.saving', 'You save', { 
                      amount: formatCurrency(discountInfo.savings, product.currency),
                      percentage: discountInfo.percentage
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-2xl font-bold text-gray-800">
                  {formatCurrency(product.price * quantity, product.currency)}
                </div>
              )}
              
              <div className="text-sm text-gray-600 mt-1">
                {safeTranslate(t, 'product.unitPrice')}: {formatCurrency(product.price, product.currency)} / {safeTranslate(t, 'product.unit')}
              </div>
              
              {/* Total price display */}
              <div className="text-sm text-gray-600 mt-1">
                {safeTranslate(t, 'product.totalPrice')}: {formatCurrency(discountInfo ? discountInfo.discountedPrice : product.price * quantity, product.currency)}
              </div>
              
              <VolumeDiscountInfo product={product} currentQuantity={quantity} />
            </div>
            
            <p className="text-gray-700 mb-6">
              {product.description}
            </p>
            
            {/* Quantity selector */}
            <div className="flex items-center mb-6">
              <span className="mr-4 text-gray-700">{safeTranslate(t, 'product.quantity')}:</span>
              <div className="flex items-center border rounded-md">
                <button 
                  className="px-4 py-2 border-r text-gray-600 hover:bg-gray-100"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  aria-label={safeTranslate(t, 'cart.decrease')}
                >
                  <FiMinus />
                </button>
                <span className="px-4 py-2 text-center w-12">{quantity}</span>
                <button 
                  className="px-4 py-2 border-l text-gray-600 hover:bg-gray-100"
                  onClick={incrementQuantity}
                  aria-label={safeTranslate(t, 'cart.increase')}
                >
                  <FiPlus />
                </button>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-3 mb-6">
              {addedToCart ? (
                <>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    fullWidth 
                    className="border-green-600 text-green-600 hover:bg-green-50"
                    onClick={handleAddToCart}
                  >
                    {safeTranslate(t, 'buttons.addMoreToCart')}
                  </Button>
                  <Button 
                    variant="primary" 
                    size="lg" 
                    fullWidth 
                    onClick={handleGoToCart}
                    className="bg-green-600 hover:bg-green-700"
                    leftIcon={<FiShoppingCart />}
                  >
                    {safeTranslate(t, 'buttons.viewCart')}
                  </Button>
                </>
              ) : (
                <Button 
                  variant="primary" 
                  size="lg" 
                  fullWidth 
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="bg-green-600 hover:bg-green-700"
                  leftIcon={<FiShoppingCart />}
                >
                  {safeTranslate(t, 'buttons.addToCart')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Bulk Purchase Options */}
      <div className="mt-8">
        <BulkPurchaseOptions 
          product={product} 
          quantity={quantity} 
          onQuantityChange={setQuantity} 
        />
      </div>
      
      {/* Priority Shipping Info */}
      {quantity >= 10 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 flex items-center mb-2">
            <FiTag className="mr-2" />
            {safeTranslate(t, 'product.priorityShipping.title')}
          </h3>
          <p className="text-sm text-blue-700 mb-3">
            {safeTranslate(t, 'product.priorityShipping.description')}
          </p>
          <ul className="text-sm text-blue-700 space-y-1">
            <li className="flex items-center">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
              {safeTranslate(t, 'product.priorityShipping.features.expedited')}
            </li>
            <li className="flex items-center">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
              {safeTranslate(t, 'product.priorityShipping.features.tracking')}
            </li>
            <li className="flex items-center">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
              {safeTranslate(t, 'product.priorityShipping.features.insurance')}
            </li>
            <li className="flex items-center">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
              {safeTranslate(t, 'product.priorityShipping.features.support')}
            </li>
          </ul>
        </div>
      )}
      
      {/* Frequently Bought Together */}
      <div className="mt-8">
        <FrequentlyBoughtTogether 
          product={product} 
          onAddAllToCart={() => navigate('/cart')} 
        />
      </div>
      
      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">{safeTranslate(t, 'product.similarProducts')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;