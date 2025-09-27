import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiPackage, FiPlus, FiCheck } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { safeTranslate } from '../../utils/translationValidator';
import type { Product } from '../../services/productService';
import { getSimilarProducts, formatCurrency } from '../../services/productService';
import Button from '../ui/Button';
import { useCart } from '../../context/CartContext';
import ProductImage from './ProductImage';

interface FrequentlyBoughtTogetherProps {
  product: Product;
  onAddAllToCart: () => void;
}

const FrequentlyBoughtTogether: React.FC<FrequentlyBoughtTogetherProps> = ({
  product,
  onAddAllToCart
}) => {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<{ [id: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        const products = await getSimilarProducts(product.id, 3);
        setRelatedProducts(products);
        
        // By default, select all products
        const initialSelection = products.reduce((acc, prod) => {
          acc[prod.id] = true;
          return acc;
        }, {} as { [id: string]: boolean });
        
        // Also include the main product
        initialSelection[product.id] = true;
        
        setSelectedProducts(initialSelection);
      } catch (error) {
        console.error('Error fetching related products:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRelatedProducts();
  }, [product.id]);
  
  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };
  
  const handleAddAllToCart = () => {
    // Add the main product if selected
    if (selectedProducts[product.id]) {
      addToCart(product, 1);
    }
    
    // Add all selected related products
    relatedProducts.forEach(prod => {
      if (selectedProducts[prod.id]) {
        addToCart(prod, 1);
      }
    });
    
    // Call the parent callback
    onAddAllToCart();
  };
  
  // Calculate total price for selected products
  const calculateTotalPrice = () => {
    let total = 0;
    
    if (selectedProducts[product.id]) {
      total += product.price;
    }
    
    relatedProducts.forEach(prod => {
      if (selectedProducts[prod.id]) {
        total += prod.price;
      }
    });
    
    return total;
  };
  
  const calculateSavings = () => {
    // Typically a bundle discount would be applied here
    // For this example, apply a 10% discount for buying together
    const totalPrice = calculateTotalPrice();
    const selectedCount = Object.values(selectedProducts).filter(Boolean).length;
    
    // Only apply bundle discount if selecting more than one product
    return selectedCount > 1 ? totalPrice * 0.1 : 0;
  };
  
  if (loading || relatedProducts.length === 0) {
    return null;
  }
  
  const totalPrice = calculateTotalPrice();
  const savings = calculateSavings();
  const finalPrice = totalPrice - savings;
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <h3 className="text-xl font-semibold mb-6 flex items-center">
        <FiPackage className="mr-2 text-green-600" />
        {safeTranslate(t, 'product.frequentlyBoughtTogether')}
      </h3>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Products Section */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap">
            {/* Main product */}
            <div className="flex flex-col items-center min-w-[120px]">
              <div className="relative">
                <div className="w-24 h-24 rounded-md overflow-hidden">
                  <ProductImage
                    imagePath={product.images?.[0] || product.primaryImage || product.image}
                    alt={product.name}
                    aspectRatio="square"
                    enableHover={false}
                  />
                </div>
                <div className="absolute -top-2 -right-2">
                  <label className="cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={selectedProducts[product.id] || false}
                      onChange={() => toggleProductSelection(product.id)}
                    />
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      selectedProducts[product.id] 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {selectedProducts[product.id] && <FiCheck size={14} />}
                    </div>
                  </label>
                </div>
              </div>
              <span className="text-sm mt-2 font-medium text-center max-w-[100px] truncate">{product.name}</span>
              <span className="text-sm font-semibold">{formatCurrency(product.price, product.currency)}</span>
            </div>
            
            {/* Related products with plus signs */}
            {relatedProducts.map((relatedProduct, index) => (
              <React.Fragment key={relatedProduct.id}>
                <div className="text-gray-400 flex items-center">
                  <FiPlus size={20} />
                </div>
                
                <div className="flex flex-col items-center min-w-[120px]">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-md overflow-hidden">
                      <ProductImage
                        imagePath={relatedProduct.images?.[0] || relatedProduct.primaryImage || relatedProduct.image}
                        alt={relatedProduct.name}
                        aspectRatio="square"
                        enableHover={false}
                      />
                    </div>
                    <div className="absolute -top-2 -right-2">
                      <label className="cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="hidden" 
                          checked={selectedProducts[relatedProduct.id] || false}
                          onChange={() => toggleProductSelection(relatedProduct.id)}
                        />
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          selectedProducts[relatedProduct.id] 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                          {selectedProducts[relatedProduct.id] && <FiCheck size={14} />}
                        </div>
                      </label>
                    </div>
                  </div>
                  <Link to={`/product/${relatedProduct.id}`} className="text-sm mt-2 font-medium text-center hover:text-green-600 max-w-[100px] truncate">
                    {relatedProduct.name}
                  </Link>
                  <span className="text-sm font-semibold">{formatCurrency(relatedProduct.price, relatedProduct.currency)}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
        
        {/* Price Details Section */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="bg-gray-50 p-4 rounded-lg h-full flex flex-col">
            <h4 className="font-medium mb-3">{safeTranslate(t, 'product.priceDetails')}</h4>
            
            <div className="space-y-2 mb-4 flex-grow">
              <div className="flex justify-between text-sm">
                <span>{safeTranslate(t, 'product.itemsPrice')}:</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
              
              {savings > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>{safeTranslate(t, 'product.bundleSavings')}:</span>
                  <span>-{formatCurrency(savings)}</span>
                </div>
              )}
              
              <div className="flex justify-between font-bold pt-2 border-t">
                <span>{safeTranslate(t, 'product.totalPrice')}:</span>
                <span>{formatCurrency(finalPrice)}</span>
              </div>
            </div>
            
            <Button 
              variant="primary" 
              fullWidth 
              onClick={handleAddAllToCart}
              className="bg-green-600 hover:bg-green-700 mt-auto"
            >
              {safeTranslate(t, 'product.addAllToCart')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrequentlyBoughtTogether;