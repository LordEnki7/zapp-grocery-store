import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Product } from '../../services/productService';

interface VolumeDiscountInfoProps {
  product: Product;
  currentQuantity: number;
}

const VolumeDiscountInfo: React.FC<VolumeDiscountInfoProps> = ({ product, currentQuantity }) => {
  const { t } = useTranslation();
  
  if (!product.volumeDiscounts || product.volumeDiscounts.length === 0) {
    return null;
  }

  // Sort discounts by quantity
  const sortedDiscounts = [...product.volumeDiscounts].sort((a, b) => a.quantity - b.quantity);
  
  // Find the current discount tier (highest discount that applies)
  const currentDiscount = [...sortedDiscounts]
    .filter(discount => currentQuantity >= discount.quantity)
    .sort((a, b) => b.quantity - a.quantity)[0];
  
  // Find the next discount tier
  const nextDiscount = sortedDiscounts.find(discount => currentQuantity < discount.quantity);

  return (
    <div className="mt-2 text-sm">
      {/* Current discount */}
      {currentDiscount ? (
        <div className="text-green-600 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>{t('product.volumeDiscount.current', { percentage: currentDiscount.discountPercentage })}</span>
        </div>
      ) : null}
      
      {/* Next discount tier */}
      {nextDiscount ? (
        <div className="text-gray-600 mt-1">
          <span>
            {t('product.volumeDiscount.next', { 
              quantity: nextDiscount.quantity - currentQuantity, 
              percentage: nextDiscount.discountPercentage 
            })}
            {currentDiscount ? ` (currently ${currentDiscount.discountPercentage}%)` : ''}
          </span>
        </div>
      ) : null}
      
      {/* All available tiers */}
      <div className="mt-2 flex flex-wrap gap-2">
        <span className="text-xs text-gray-500 mr-2">{t('product.volumeDiscount.tiers')}:</span>
        {sortedDiscounts.map((discount, index) => (
          <div 
            key={index}
            className={`px-2 py-1 rounded-full text-xs border ${
              currentQuantity >= discount.quantity 
                ? 'bg-green-100 border-green-300 text-green-800' 
                : 'bg-gray-100 border-gray-300 text-gray-600'
            }`}
          >
            {discount.quantity}+ {discount.quantity === 1 ? t('product.unit') : t('product.units')}: {discount.discountPercentage}% off
          </div>
        ))}
      </div>
    </div>
  );
};

export default VolumeDiscountInfo;