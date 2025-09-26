import React from 'react';
import { FiTruck, FiPackage, FiDollarSign, FiTrendingUp, FiUser, FiCreditCard } from 'react-icons/fi';
import type { Product } from '../../services/productService';
import { formatCurrency } from '../../services/productService';
import { useTranslation } from 'react-i18next';

interface BulkPurchaseOptionsProps {
  product: Product;
  quantity: number;
  onQuantityChange: (newQuantity: number) => void;
}

const BulkPurchaseOptions: React.FC<BulkPurchaseOptionsProps> = ({
  product,
  quantity,
  onQuantityChange
}) => {
  const { t } = useTranslation();
  
  // Define recommended bulk quantities based on product type
  const recommendedQuantities = [1, 5, 10, 25, 50, 100].filter(q => q > 0);
  
  // Calculate prices for different quantities
  const calculatePriceForQuantity = (qty: number) => {
    const totalPrice = product.price * qty;
    
    if (!product.volumeDiscounts || product.volumeDiscounts.length === 0) {
      return {
        price: totalPrice,
        discountedPrice: totalPrice,
        savings: 0,
        discountPercentage: 0
      };
    }
    
    // Find the best applicable discount
    const sortedDiscounts = [...product.volumeDiscounts]
      .sort((a, b) => b.quantity - a.quantity)
      .filter(discount => qty >= discount.quantity);
    
    if (sortedDiscounts.length === 0) {
      return {
        price: totalPrice,
        discountedPrice: totalPrice,
        savings: 0,
        discountPercentage: 0
      };
    }
    
    const bestDiscount = sortedDiscounts[0];
    const savings = totalPrice * (bestDiscount.discountPercentage / 100);
    
    return {
      price: totalPrice,
      discountedPrice: totalPrice - savings,
      savings,
      discountPercentage: bestDiscount.discountPercentage
    };
  };

  // Calculate unit price at different quantities
  const getUnitPrice = (qty: number) => {
    const priceInfo = calculatePriceForQuantity(qty);
    return priceInfo.discountedPrice / qty;
  };
  
  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      <h3 className="font-semibold text-lg mb-3 flex items-center">
        <FiPackage className="mr-2 text-green-600" />
        {t('product.bulkOptions')}
      </h3>
      
      {/* Quick quantity selector buttons */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">{t('product.selectBulkQuantity')}:</p>
        <div className="flex flex-wrap gap-2">
          {recommendedQuantities.map(qty => (
            <button
              key={qty}
              onClick={() => onQuantityChange(qty)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                quantity === qty 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white border border-gray-300 hover:border-green-500'
              }`}
            >
              {qty} {qty === 1 ? t('product.unit') : t('product.units')}
            </button>
          ))}
        </div>
      </div>
      
      {/* Bulk pricing comparison */}
      <div className="bg-white rounded border border-gray-200 divide-y">
        <div className="grid grid-cols-3 text-sm font-medium bg-gray-50 p-2">
          <div>{t('product.quantity')}</div>
          <div>{t('product.totalPrice')}</div>
          <div>{t('product.unitPrice')}</div>
        </div>
        
        {recommendedQuantities.slice(0, 4).map(qty => {
          const priceInfo = calculatePriceForQuantity(qty);
          const unitPrice = priceInfo.discountedPrice / qty;
          const isSelected = qty === quantity;
          
          return (
            <div 
              key={qty} 
              className={`grid grid-cols-3 text-sm p-2 ${
                isSelected ? 'bg-green-50' : ''
              }`}
              onClick={() => onQuantityChange(qty)}
            >
              <div className="font-medium">
                {qty} {qty === 1 ? t('product.unit') : t('product.units')}
                {isSelected && (
                  <span className="ml-2 text-xs text-green-600">✓</span>
                )}
              </div>
              <div>
                {priceInfo.discountPercentage > 0 ? (
                  <div>
                    <span className="font-medium">{formatCurrency(priceInfo.discountedPrice, product.currency)}</span>
                    <span className="text-xs text-green-600 ml-1">
                      -{priceInfo.discountPercentage}%
                    </span>
                  </div>
                ) : (
                  <span>{formatCurrency(priceInfo.price, product.currency)}</span>
                )}
              </div>
              <div className="flex items-center">
                {formatCurrency(unitPrice, product.currency)}
                <span className="text-xs text-gray-500 ml-1">/unit</span>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Shipping info for bulk orders */}
      <div className="mt-4 text-sm text-gray-700 flex items-center">
        <FiTruck className="mr-2 text-green-600" />
        {quantity >= 25 ? (
          <span className="text-green-600 font-medium">{t('product.freeShipping')}</span>
        ) : (
          <span>{t('product.bulkShippingInfo')}</span>
        )}
      </div>
      
      {/* Reseller benefits */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <h4 className="font-medium text-blue-800 flex items-center">
          <FiTrendingUp className="mr-2" />
          {t('product.resellerBenefits.title')}
        </h4>
        <ul className="mt-2 text-sm text-blue-700 space-y-1">
          <li className="flex items-center">
            <FiDollarSign className="mr-1 flex-shrink-0" />
            {t('product.resellerBenefits.volumeDiscounts')}
          </li>
          <li className="flex items-center">
            <FiTruck className="mr-1 flex-shrink-0" />
            {t('product.resellerBenefits.priorityShipping')}
          </li>
          <li className="flex items-center">
            <FiUser className="mr-1 flex-shrink-0" />
            {t('product.resellerBenefits.dedicatedSupport')}
          </li>
          <li className="flex items-center">
            <FiCreditCard className="mr-1 flex-shrink-0" />
            {t('product.resellerBenefits.extendedPaymentTerms')}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default BulkPurchaseOptions;