import { TFunction } from 'react-i18next';

/**
 * Translation Key Validator
 * 
 * This utility helps prevent missing translation keys by providing:
 * 1. Runtime validation of translation keys
 * 2. Development-time warnings for missing keys
 * 3. Fallback handling for missing translations
 */

interface TranslationValidationResult {
  isValid: boolean;
  key: string;
  value: string;
  isFallback: boolean;
}

/**
 * Validates if a translation key exists and returns proper value
 * @param t - Translation function from react-i18next
 * @param key - Translation key to validate
 * @param fallback - Optional fallback text
 * @param params - Optional parameters for interpolation
 * @returns Validation result with translated value
 */
export function validateTranslation(
  t: TFunction,
  key: string,
  fallback?: string,
  params?: Record<string, any>
): TranslationValidationResult {
  const translatedValue = t(key, params);
  
  // Check if translation key exists (i.e., doesn't return the key itself)
  const isValid = translatedValue !== key;
  
  if (!isValid) {
    // Log warning in development
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Missing translation key: "${key}"`);
    }
    
    // Return fallback or formatted key
    const fallbackValue = fallback || formatKeyAsFallback(key);
    return {
      isValid: false,
      key,
      value: fallbackValue,
      isFallback: true
    };
  }
  
  return {
    isValid: true,
    key,
    value: translatedValue,
    isFallback: false
  };
}

/**
 * Formats a translation key as a readable fallback
 * @param key - Translation key
 * @returns Formatted fallback text
 */
function formatKeyAsFallback(key: string): string {
  // Extract the last part of the key and format it
  const parts = key.split('.');
  const lastPart = parts[parts.length - 1];
  
  // Convert camelCase to readable text
  return lastPart
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * Safe translation function that always returns a string
 * @param t - Translation function from react-i18next
 * @param key - Translation key
 * @param fallback - Optional fallback text
 * @param params - Optional parameters for interpolation
 * @returns Translated text or fallback
 */
export function safeTranslate(
  t: TFunction,
  key: string,
  fallback?: string,
  params?: Record<string, any>
): string {
  const result = validateTranslation(t, key, fallback, params);
  return result.value;
}

/**
 * Batch validation for multiple translation keys
 * @param t - Translation function from react-i18next
 * @param keys - Array of translation keys to validate
 * @returns Array of validation results
 */
export function validateTranslationKeys(
  t: TFunction,
  keys: string[]
): TranslationValidationResult[] {
  return keys.map(key => validateTranslation(t, key));
}

/**
 * Check if all required translation keys exist for a component
 * @param t - Translation function from react-i18next
 * @param requiredKeys - Array of required translation keys
 * @returns Object with validation summary
 */
export function validateComponentTranslations(
  t: TFunction,
  requiredKeys: string[]
): {
  allValid: boolean;
  missingKeys: string[];
  validKeys: string[];
  results: TranslationValidationResult[];
} {
  const results = validateTranslationKeys(t, requiredKeys);
  const missingKeys = results.filter(r => !r.isValid).map(r => r.key);
  const validKeys = results.filter(r => r.isValid).map(r => r.key);
  
  return {
    allValid: missingKeys.length === 0,
    missingKeys,
    validKeys,
    results
  };
}

/**
 * Development helper to log missing translations for a component
 * @param componentName - Name of the component
 * @param t - Translation function from react-i18next
 * @param requiredKeys - Array of required translation keys
 */
export function logMissingTranslations(
  componentName: string,
  t: TFunction,
  requiredKeys: string[]
): void {
  if (process.env.NODE_ENV !== 'development') return;
  
  const validation = validateComponentTranslations(t, requiredKeys);
  
  if (!validation.allValid) {
    console.group(`🌐 Missing translations in ${componentName}`);
    validation.missingKeys.forEach(key => {
      console.warn(`❌ Missing: ${key}`);
    });
    console.groupEnd();
  }
}

// Required translation keys for ProductDetail component
export const PRODUCT_DETAIL_REQUIRED_KEYS = [
  'product.inStock',
  'product.outOfStock',
  'product.resellerItem',
  'product.unitPrice',
  'product.unit',
  'product.units',
  'product.totalPrice',
  'product.quantity',
  'product.saving',
  'product.similarProducts',
  'product.bulkOptions',
  'product.selectBulkQuantity',
  'product.freeShipping',
  'product.bulkShippingInfo',
  'product.resellerBenefits.title',
  'product.resellerBenefits.volumeDiscounts',
  'product.resellerBenefits.priorityShipping',
  'product.resellerBenefits.dedicatedSupport',
  'product.resellerBenefits.extendedPaymentTerms',
  'product.frequentlyBoughtTogether',
  'product.priceDetails',
  'product.itemsPrice',
  'product.bundleSavings',
  'product.addAllToCart',
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