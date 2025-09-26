# IMAGE MAPPING POLICY

## Overview
This document establishes the systematic approach for mapping product names to their corresponding images in the Zapp E-commerce application. This policy ensures that all product images display correctly and prevents recurring image display issues.

## The Problem
When new images are added to the `sitephoto` directories, they don't automatically appear on the website because the `ProductImage` component relies on the `getSitephotoImagePath` function in `productService.ts` to map product names to image paths.

## The Solution: Automatic Image Mapping

### 1. Core Mapping Function
The `getSitephotoImagePath` function in `src/services/productService.ts` contains a mapping object that associates product names with their image paths:

```typescript
function getSitephotoImagePath(productName: string): string | null {
  const sitephotoMapping: { [key: string]: string } = {
    'Apple Cider Vinegar': '/sitephoto/New images/Apple Cider Vinegar.jpg',
    'Premium Protein Shake': '/sitephoto/New images/Premium Protein Shake.avif',
    'Artisan Ice Cream': '/sitephoto/New images/Artisan Ice Cream.avif',
    // ... more mappings
  };
  
  return sitephotoMapping[productName] || null;
}
```

### 2. Automated Mapping Process

#### Use the Auto Image Mapper Script
Run the automated script to scan for new images and add mappings:

```bash
node auto-image-mapper.cjs
```

This script:
- Scans all `sitephoto` directories for image files
- Compares with existing product names in `products.json`
- Finds exact and fuzzy matches
- Automatically adds missing mappings to `productService.ts`
- Generates a detailed report

#### Manual Mapping (Fallback)
If manual mapping is needed, add entries to the `sitephotoMapping` object:

```typescript
// Add new mappings in the appropriate category section
'Product Name': '/sitephoto/directory/Product Name.extension',
```

### 3. Directory Structure
Images should be organized in these directories:
- `/sitephoto/New images/` - Primary location for new product images
- `/sitephoto/Juices/` - Juice products
- `/sitephoto/Snacks/` - Snack products
- `/sitephoto/Coffee/` - Coffee products
- `/sitephoto/Breakfast Cereal/` - Cereal products
- `/sitephoto/Beans/` - Bean products
- `/sitephoto/Candy/` - Candy products
- `/sitephoto/Beverages/` - Beverage products

### 4. Naming Conventions
- Image files should be named exactly as the product name appears in `products.json`
- Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`, `.gif`
- Example: `Apple Cider Vinegar.jpg` maps to product "Apple Cider Vinegar"

### 5. Validation Process

#### Check for Missing Mappings
Run the validation script to identify products without proper image mappings:

```bash
node validate-image-mappings.cjs
```

#### Verify Images Display
1. Run the development server: `npm run dev`
2. Navigate to the "All Products" page
3. Check that product images display correctly
4. Look for placeholder images (indicates missing mappings)

### 6. Troubleshooting

#### Images Not Displaying
1. **Check the mapping exists**: Verify the product name has an entry in `getSitephotoImagePath`
2. **Verify file path**: Ensure the image file exists at the specified path
3. **Check file name**: Ensure exact match between product name and image filename
4. **Run auto-mapper**: Use `node auto-image-mapper.cjs` to add missing mappings

#### Common Issues
- **Case sensitivity**: Product names and file names must match exactly
- **Special characters**: Handle apostrophes, spaces, and special characters correctly
- **File extensions**: Ensure the correct extension is specified in the mapping

### 7. Workflow for New Images

#### When Adding New Product Images:
1. **Place images** in appropriate `sitephoto` directory (preferably `/sitephoto/New images/`)
2. **Name files** exactly as the product names appear in `products.json`
3. **Run auto-mapper**: Execute `node auto-image-mapper.cjs`
4. **Verify results**: Check the generated report and test the website
5. **Commit changes**: Include both the images and updated `productService.ts`

#### When Adding New Products:
1. **Add product** to `products.json` with appropriate details
2. **Add corresponding image** to sitephoto directory
3. **Run auto-mapper** to create the mapping
4. **Test display** on the website

### 8. Maintenance

#### Regular Tasks
- Run auto-mapper weekly to catch any missed mappings
- Review validation reports for orphaned images
- Clean up unused image files periodically
- Update this policy when new directories or processes are added

#### Monitoring
- Check for placeholder images on the website
- Monitor console errors related to image loading
- Review auto-mapper reports for mapping success rates

### 9. Scripts and Tools

#### Available Scripts
- `auto-image-mapper.cjs` - Automatically adds missing mappings
- `validate-image-mappings.cjs` - Checks for missing or broken mappings
- `analyze-unused-images.cjs` - Identifies unused image files

#### Integration with Build Process
Consider adding the auto-mapper to the build process to ensure mappings are always up-to-date:

```json
{
  "scripts": {
    "prebuild": "node auto-image-mapper.cjs",
    "dev": "node auto-image-mapper.cjs && vite",
    "build": "node auto-image-mapper.cjs && vite build"
  }
}
```

## Key Principles

1. **Automation First**: Use automated scripts to prevent human error
2. **Exact Matching**: Product names and image file names must match exactly
3. **Consistent Structure**: Maintain organized directory structure
4. **Regular Validation**: Continuously check for missing mappings
5. **Documentation**: Keep this policy updated with any changes

## Success Metrics

- **Zero placeholder images** on production website
- **100% mapping coverage** for products with available images
- **Automated detection** of new images within 24 hours
- **Clear error reporting** for missing or broken mappings

---

**Remember**: The `getSitephotoImagePath` function is the single source of truth for image mappings. All product images must be registered here to display correctly on the website.