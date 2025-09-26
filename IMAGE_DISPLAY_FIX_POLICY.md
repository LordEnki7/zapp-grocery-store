# Image Display Fix Policy - Permanent Solution

## Problem Statement
Product images were not displaying on the "All Products" page despite having extensive image mappings in the `getSitephotoImagePath` function in `productService.ts`. This issue occurred because the `ProductImage` component was not utilizing the mapping function.

## Root Cause Analysis
1. **ProductImage Component Issue**: The `ProductImage.tsx` component was directly constructing image paths from the `imagePath` prop without using the `getSitephotoImagePath` function.
2. **Missing Integration**: The extensive image mapping work done in `productService.ts` was not being applied because components weren't calling the mapping function.
3. **Path Construction Logic**: The component was using a simple fallback to `/images/products/${imagePath}` instead of leveraging the comprehensive mapping system.

## Permanent Solution Applied

### 1. Modified ProductImage Component
**File**: `src/components/products/ProductImage.tsx`

**Changes Made**:
- Added import for `getSitephotoImagePath` from `productService.ts`
- Updated image path construction logic to:
  1. First try to get mapped path using product name (from alt text)
  2. Then try using image filename without extension
  3. Fall back to default path construction if no mapping found

### 2. Exported getSitephotoImagePath Function
**File**: `src/services/productService.ts`

**Changes Made**:
- Added export statement: `export { getSitephotoImagePath };`
- Made the function available for import in components

## Implementation Details

### ProductImage.tsx Changes
```typescript
// Import the mapping function
import { getSitephotoImagePath } from '../../services/productService';

// Updated path construction logic
const fullImagePath = (() => {
  if (!imagePath) return null;
  
  // If it's already a full path, use it
  if (imagePath.startsWith('/sitephoto/') || imagePath.startsWith('/images/')) {
    return imagePath;
  }
  
  // First, try to get the mapped image path using getSitephotoImagePath
  const productName = alt || imagePath;
  const mappedPath = getSitephotoImagePath(productName);
  
  if (mappedPath) {
    return mappedPath;
  }
  
  // If no mapping found, try using the imagePath as filename without extension
  const imageNameWithoutExt = imagePath.replace(/\.[^/.]+$/, "");
  const mappedPathByFilename = getSitephotoImagePath(imageNameWithoutExt);
  
  if (mappedPathByFilename) {
    return mappedPathByFilename;
  }
  
  // Otherwise, assume it's a product image
  return `/images/products/${imagePath}`;
})();
```

## Prevention Measures

### 1. Component Integration Checklist
When creating or modifying image-related components:
- [ ] Always check if `getSitephotoImagePath` function should be used
- [ ] Import and utilize the mapping function for product images
- [ ] Test with actual product data, not just placeholder images
- [ ] Verify that all product categories display images correctly

### 2. Product Data Quality Requirements
**CRITICAL**: Products must have descriptive names, not G-codes
- [ ] All products in `products.json` must have human-readable names
- [ ] G-codes (G101, G223, etc.) are PROHIBITED as product names
- [ ] Product names must be descriptive (e.g., "Premium Coffee", "Organic Avocados")
- [ ] Any G-codes found in product names must be replaced immediately

### 3. Code Review Requirements
- Any changes to image path construction must be reviewed for mapping function usage
- New image-related components must integrate with the existing mapping system
- Changes to `productService.ts` image mappings must be tested across all components
- **NEW**: All product data changes must be reviewed for G-code usage

### 4. Testing Protocol
- Test image display on "All Products" page after any image-related changes
- Verify specific categories: Gift Cards, Pharmacy items, Food/Candy products
- Check both mapped and unmapped products for proper fallback behavior
- **NEW**: Verify no G-codes are displayed as product names on any page

### 5. Automated Checks (Required)
- Run regex search for G-codes in product names: `"name":\s*"G\d+"`
- Any matches found must be fixed before deployment
- Create validation script to prevent G-codes in product data

## Quick Fix Command
If this issue occurs again, apply this fix:

1. **Modify ProductImage.tsx**:
   - Add import: `import { getSitephotoImagePath } from '../../services/productService';`
   - Update image path construction to use the mapping function first

2. **Export the function** (if not already exported):
   - Add to end of `productService.ts`: `export { getSitephotoImagePath };`

3. **Test the fix**:
   - Open preview and check "All Products" page
   - Verify images display for all categories

## Status
✅ **RESOLVED** - Product images are now displaying correctly using the comprehensive mapping system.

**Date**: January 24, 2025  
**Fixed by**: Assistant  
**Policy Created**: January 24, 2025

## Future Considerations
- Consider creating a centralized image service that all components must use
- Implement automated tests for image display functionality
- Add linting rules to enforce proper image path construction patterns