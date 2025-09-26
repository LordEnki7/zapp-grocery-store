# Image Management System

This document describes the comprehensive image management system implemented for the Zapp E-commerce application.

## Overview

The image management system provides:
- ✅ Centralized image path resolution
- ✅ Automated validation and verification
- ✅ Path mapping and correction
- ✅ Build-time verification
- ✅ Development tools and scripts

## Components

### 1. ImageManager (`src/utils/imageManager.ts`)
Core utility class for image path resolution and validation.

**Features:**
- Path resolution with fallbacks
- Image existence checking
- Format optimization (WebP, AVIF)
- Path normalization
- Caching for performance

**Usage:**
```typescript
import { ImageManager } from '../utils/imageManager';

const imageManager = new ImageManager();
const resolvedPath = await imageManager.resolveImagePath('/images/product.jpg');
```

### 2. ImageValidationService (`src/services/imageValidationService.ts`)
Advanced validation service with mapping rules and batch processing.

**Features:**
- Configurable validation rules
- Path mapping and transformation
- Batch validation
- Suggestion generation
- Product-specific validation

**Usage:**
```typescript
import { ImageValidationService } from '../services/imageValidationService';

const validator = new ImageValidationService();
const result = await validator.validateImagePath('/images/product.jpg');
```

### 3. Automated Scripts

#### Image Verification (`scripts/image-verification.cjs`)
Comprehensive verification script for all product images.

**Commands:**
```bash
# Basic verification
npm run verify-images

# Detailed output
npm run verify-images:verbose

# Auto-fix issues
npm run verify-images:fix
```

#### Gift Card Fix (`fix-gift-card-images.cjs`)
Specialized script for gift card image path corrections.

```bash
npm run fix-gift-cards
```

#### Complete Validation (`validate-all-images.cjs`)
Full validation with detailed reporting.

```bash
npm run validate-all-images
```

## Directory Structure

```
public/
├── images/
│   ├── products/          # Legacy product images
│   └── categories/        # Category images
└── sitephoto/
    ├── Gift Cards/        # Gift card images (primary)
    ├── New images/        # General product images (primary)
    └── [other categories] # Various product categories
```

## Image Path Resolution Priority

1. **Direct Path**: Check if the provided path exists
2. **Mapping Rules**: Apply configured transformation rules
3. **Base Path Search**: Search across configured base directories
4. **Format Optimization**: Try WebP/AVIF alternatives
5. **Fallback**: Return placeholder image

## Configuration

### Base Paths (in priority order)
1. `/sitephoto/Gift Cards` - Gift card images
2. `/sitephoto/New images` - General product images  
3. `/public/images/products` - Legacy product images
4. `/public/images/categories` - Category images
5. `/sitephoto` - Root sitephoto directory

### Supported Formats
- WebP (preferred)
- AVIF (preferred)
- PNG
- JPG/JPEG
- SVG

## Build Integration

The system includes pre-build verification:

```json
{
  "scripts": {
    "prebuild": "node scripts/image-verification.cjs --exit-on-error"
  }
}
```

This ensures all images are valid before building for production.

## Development Workflow

### 1. Adding New Images
1. Place images in appropriate directory (`/sitephoto/Gift Cards` for gift cards, `/sitephoto/New images` for products)
2. Update product data with correct path
3. Run verification: `npm run verify-images`

### 2. Fixing Image Issues
1. Run verification: `npm run verify-images:verbose`
2. Review issues in the report
3. Auto-fix when possible: `npm run verify-images:fix`
4. Manually resolve remaining issues

### 3. Regular Maintenance
- Run `npm run verify-images` regularly
- Check reports in `image-verification-report.json`
- Update mapping rules as needed

## Mapping Rules

The system uses configurable mapping rules to transform paths:

```typescript
{
  pattern: /^\/images\/products\/(.*Gift Card.*)\.(webp|png|jpg|jpeg)$/i,
  replacement: '/sitephoto/Gift Cards/$1.$2',
  priority: 10
}
```

### Current Rules
1. **Gift Card Mapping**: `/images/products/*Gift Card*` → `/sitephoto/Gift Cards/*`
2. **General Product Mapping**: `/images/products/*` → `/sitephoto/New images/*`
3. **Legacy Correction**: `/sitephoto/New images/*Gift Card*` → `/sitephoto/Gift Cards/*`

## Error Handling

### Error Types
- `NO_IMAGE_PATH`: Product has no image path defined
- `WRONG_PATH`: Image exists but path is incorrect
- `IMAGE_NOT_FOUND`: Image file doesn't exist anywhere

### Severity Levels
- **Error**: Critical issues requiring manual intervention
- **Fixable**: Issues that can be automatically resolved
- **Warning**: Non-critical issues (e.g., missing optional images)

## Performance Considerations

- **Caching**: ImageManager caches existence checks
- **Batch Processing**: Validation service supports batch operations
- **Lazy Loading**: Images are validated on-demand in production
- **Build-time Verification**: Catches issues before deployment

## Troubleshooting

### Common Issues

1. **Gift Card Images Not Showing**
   - Check if image is in `/sitephoto/Gift Cards/`
   - Run: `npm run fix-gift-cards`

2. **Product Images Missing**
   - Verify image exists in `/sitephoto/New images/`
   - Run: `npm run verify-images:fix`

3. **Build Failing on Image Verification**
   - Run: `npm run verify-images:verbose`
   - Fix reported issues
   - Re-run build

### Debug Commands

```bash
# Check specific product images
npm run verify-images:verbose | grep "ProductName"

# Generate detailed report
npm run validate-all-images

# Test auto-fix without applying
node scripts/image-verification.cjs --verbose
```

## Future Enhancements

- [ ] Image optimization pipeline
- [ ] Automatic WebP conversion
- [ ] CDN integration
- [ ] Image lazy loading optimization
- [ ] Responsive image generation
- [ ] Image compression analysis

## Support

For issues with the image management system:
1. Check this documentation
2. Run diagnostic scripts
3. Review generated reports
4. Check console for detailed error messages

---

*Last updated: January 2025*