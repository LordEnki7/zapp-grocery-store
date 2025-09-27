import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { safeTranslate, logMissingTranslations, validateComponentTranslations } from '../utils/translationValidator';

/**
 * Custom hook for safe translation with validation
 * @param requiredKeys - Array of required translation keys for the component
 * @param componentName - Name of the component for logging purposes
 * @returns Object with safe translation function and validation utilities
 */
export function useTranslationValidation(requiredKeys?: string[], componentName?: string) {
  const { t, i18n } = useTranslation();

  // Log missing translations in development
  useEffect(() => {
    if (requiredKeys && componentName) {
      logMissingTranslations(componentName, t, requiredKeys);
    }
  }, [t, requiredKeys, componentName, i18n.language]);

  /**
   * Safe translation function that always returns a string
   * @param key - Translation key
   * @param fallback - Optional fallback text
   * @param params - Optional parameters for interpolation
   * @returns Translated text or fallback
   */
  const st = (key: string, fallback?: string, params?: Record<string, any>) => {
    return safeTranslate(t, key, fallback, params);
  };

  /**
   * Validate all required keys for the component
   * @returns Validation summary
   */
  const validateKeys = () => {
    if (!requiredKeys) return null;
    return validateComponentTranslations(t, requiredKeys);
  };

  return {
    t: st, // Safe translation function
    originalT: t, // Original translation function
    i18n,
    validateKeys,
    currentLanguage: i18n.language
  };
}

/**
 * Hook specifically for ProductDetail component with predefined keys
 */
export function useProductDetailTranslation() {
  const requiredKeys = [
    'product.inStock',
    'product.outOfStock',
    'product.resellerItem',
    'product.unitPrice',
    'product.unit',
    'product.totalPrice',
    'product.quantity',
    'product.saving',
    'product.similarProducts',
    'product.priorityShipping.title',
    'product.priorityShipping.description',
    'product.priorityShipping.features.expedited',
    'product.priorityShipping.features.tracking',
    'product.priorityShipping.features.insurance',
    'product.priorityShipping.features.support',
    'buttons.addToCart',
    'buttons.addMoreToCart',
    'buttons.viewCart',
    'buttons.backToProducts',
    'cart.decrease',
    'cart.increase',
    'errors.productNotFound',
    'errors.unavailable'
  ];

  return useTranslationValidation(requiredKeys, 'ProductDetail');
}