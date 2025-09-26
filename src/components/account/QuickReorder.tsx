import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiRefreshCw, FiShoppingCart, FiCheck } from 'react-icons/fi';
import Button from '../ui/Button';
import { useCart } from '../../context/CartContext';
import type { Product } from '../../services/productService';
import { formatCurrency } from '../../services/productService';

// Simulated order history (in a real app, this would come from a database)
interface OrderItem {
  product: Product;
  quantity: number;
  purchaseDate: Date;
}

interface Order {
  id: string;
  items: OrderItem[];
  totalAmount: number;
  orderDate: Date;
  status: 'completed' | 'processing' | 'shipped';
}

// Mock orders (in a real app, this would be fetched from an API)
const mockOrders: Order[] = [];

interface QuickReorderProps {
  onOrderComplete?: () => void;
}

const QuickReorder: React.FC<QuickReorderProps> = ({ onOrderComplete }) => {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const [reorderSuccess, setReorderSuccess] = useState<string | null>(null);
  
  // In a real app, orders would be fetched from a backend service
  const recentOrders = mockOrders.sort(
    (a, b) => b.orderDate.getTime() - a.orderDate.getTime()
  ).slice(0, 3);
  
  // Get frequently ordered products across all orders
  const getFrequentlyOrderedProducts = () => {
    // Map to track frequency of products
    const productFrequency: Record<string, { 
      product: Product, 
      totalQuantity: number,
      lastOrdered: Date 
    }> = {};
    
    // Analyze all orders to find frequently ordered products
    mockOrders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.product.id;
        
        if (productFrequency[productId]) {
          productFrequency[productId].totalQuantity += item.quantity;
          
          // Update last ordered date if more recent
          if (order.orderDate > productFrequency[productId].lastOrdered) {
            productFrequency[productId].lastOrdered = order.orderDate;
          }
        } else {
          productFrequency[productId] = {
            product: item.product,
            totalQuantity: item.quantity,
            lastOrdered: order.orderDate
          };
        }
      });
    });
    
    // Convert to array and sort by total quantity (descending)
    return Object.values(productFrequency)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 5); // Top 5 most ordered products
  };
  
  const frequentlyOrderedProducts = getFrequentlyOrderedProducts();
  
  const handleReorderItems = (orderId: string) => {
    const order = recentOrders.find(o => o.id === orderId);
    
    if (order) {
      // Add all items from the order to the cart
      order.items.forEach(item => {
        addToCart(item.product, item.quantity);
      });
      
      // Set success message
      setReorderSuccess(orderId);
      
      // Reset message after 3 seconds
      setTimeout(() => {
        setReorderSuccess(null);
      }, 3000);
      
      // Call optional callback
      if (onOrderComplete) {
        onOrderComplete();
      }
    }
  };
  
  const handleQuickAddToCart = (product: Product, quantity: number) => {
    addToCart(product, quantity);
    
    // Set success message using product ID
    setReorderSuccess(`product-${product.id}`);
    
    // Reset message after 3 seconds
    setTimeout(() => {
      setReorderSuccess(null);
    }, 3000);
  };
  
  // Only render if there are orders or frequently ordered products
  if (recentOrders.length === 0 && frequentlyOrderedProducts.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-5 mb-8">
      <h2 className="text-xl font-bold mb-5 flex items-center">
        <FiRefreshCw className="mr-2 text-green-600" />
        {t('account.quickReorder')}
      </h2>
      
      {recentOrders.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3">{t('account.recentOrders')}</h3>
          <div className="grid gap-4">
            {recentOrders.map(order => (
              <div key={order.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <span className="text-sm text-gray-500">
                      {t('account.orderNumber')}: {order.id}
                    </span>
                    <p className="font-medium">
                      {order.orderDate.toLocaleDateString()} • {formatCurrency(order.totalAmount)}
                    </p>
                  </div>
                  <div>
                    {reorderSuccess === order.id ? (
                      <span className="flex items-center text-green-600 font-medium">
                        <FiCheck className="mr-1" />
                        {t('account.addedToCart')}
                      </span>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleReorderItems(order.id)}
                        className="border-green-600 text-green-600 hover:bg-green-50"
                      >
                        {t('account.reorder')}
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {order.items.slice(0, 3).map(item => (
                    <div key={item.product.id} className="bg-gray-100 text-sm px-2 py-1 rounded-full">
                      {item.product.name} ({item.quantity})
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="bg-gray-100 text-sm px-2 py-1 rounded-full">
                      +{order.items.length - 3} {t('account.moreItems')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {frequentlyOrderedProducts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">{t('account.frequentlyOrdered')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {frequentlyOrderedProducts.map(item => (
              <div key={item.product.id} className="border rounded-lg p-3 flex items-center">
                <div className="w-14 h-14 bg-gray-100 rounded-md overflow-hidden mr-3">
                  <img 
                    src={`/images/products/${item.product.image}`} 
                    alt={item.product.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/product-placeholder.svg';
                    }}
                  />
                </div>
                <div className="flex-grow">
                  <p className="font-medium">{item.product.name}</p>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      {t('account.typicalOrder')}: {item.totalQuantity} {t('product.units')}
                    </div>
                    <div>
                      {reorderSuccess === `product-${item.product.id}` ? (
                        <span className="flex items-center text-green-600 text-sm font-medium">
                          <FiCheck className="mr-1" />
                          {t('account.added')}
                        </span>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleQuickAddToCart(item.product, item.totalQuantity)}
                          className="text-xs border-green-600 text-green-600 hover:bg-green-50"
                          leftIcon={<FiShoppingCart size={12} />}
                        >
                          {t('account.addToCart')}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickReorder;