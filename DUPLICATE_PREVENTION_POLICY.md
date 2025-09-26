# Duplicate Prevention Policy

## Overview
This policy ensures that no duplicate products appear in any section of the Zapp E-commerce application.

## Rules

### 1. Product ID Uniqueness
- Every product MUST have a unique `id` field
- Product IDs should follow the pattern: `p{number}` (e.g., p1, p2, p3...)
- Before adding a new product, verify that the ID doesn't already exist

### 2. Product Name Uniqueness
- No two products should have identical names
- If similar products exist (e.g., different sizes), differentiate them clearly:
  - "Trinidad Scorpion Pepper Sauce - 150ml"
  - "Trinidad Scorpion Pepper Sauce - 300ml"

### 3. SKU Uniqueness
- Every product MUST have a unique SKU (Stock Keeping Unit)
- SKUs should be descriptive and follow a consistent pattern
- Example: `TSPS-150ML` for Trinidad Scorpion Pepper Sauce 150ml

### 4. Data Source Management
- The application currently uses `mockProducts` array in `src/services/productService.ts`
- All product data should be managed through this single source
- JSON files in `data/products/` are for backup/reference only

### 5. Before Adding New Products
1. Search existing products by name: `grep -r "Product Name" src/services/productService.ts`
2. Check for duplicate IDs: Ensure the new ID doesn't exist
3. Verify SKU uniqueness
4. Test the application after adding products

### 6. Image Path Standards
- All product images should use absolute paths: `/images/products/filename.ext`
- Verify image files exist in `public/images/products/` directory
- Use consistent naming: lowercase, hyphens instead of spaces

### 7. Regular Audits
- Perform monthly audits to check for duplicates
- Use search tools to identify potential duplicates by name or SKU
- Remove any duplicates immediately when found

### 8. Development Workflow
- Always restart the development server after making product changes
- Test the "Browse All Products" section after any modifications
- Verify images display correctly

## Implementation Checklist
- [ ] Unique product ID
- [ ] Unique product name (or clearly differentiated)
- [ ] Unique SKU
- [ ] Correct image path format
- [ ] Image file exists in public/images/products/
- [ ] No existing duplicates
- [ ] Application tested after changes

## Contact
For questions about this policy, contact the development team.