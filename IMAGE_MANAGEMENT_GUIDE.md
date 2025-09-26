# Image Management System - Zapp E-commerce

## 🎯 Quick Reference

### Adding a New Product Image
1. **Add image file** to `public/images/products/`
2. **Use lowercase, hyphenated naming**: `product-name.webp` or `product-name.jpg`
3. **Update productService.ts** with the new image path
4. **Restart dev server** to clear cache

### Removing a Product Image
1. **Delete image file** from `public/images/products/`
2. **Update productService.ts** to remove/change the image path
3. **Restart dev server** to clear cache

---

## 📁 Image Structure

```
public/
├── images/
    ├── products/          ← All product images go here
    ├── categories/        ← Category images
    └── product-placeholder.svg  ← Default placeholder
```

## 🔧 Step-by-Step Procedures

### ✅ Adding a Product Image

**Step 1: Prepare the Image**
- Format: `.webp` (preferred) or `.jpg`
- Naming: Use lowercase with hyphens (e.g., `frozen-plantains.webp`)
- ❌ Avoid spaces: `Frozen Plantains.webp` 
- ✅ Use hyphens: `frozen-plantains.webp`

**Step 2: Add to File System**
- Place in: `public/images/products/your-image-name.webp`

**Step 3: Update Product Configuration**
- Open: `src/services/productService.ts`
- Find your product in the `mockProducts` array
- Update the `images` and `primaryImage` fields:
```javascript
{
  id: 'p5',
  name: 'Frozen Plantains',
  // ... other fields
  images: ['/images/products/frozen-plantains.webp'],
  primaryImage: '/images/products/frozen-plantains.webp',
  // ... rest of product
}
```

**Step 4: Clear Cache**
- Stop dev server (Ctrl+C in terminal)
- Restart: `npm run dev`

### ❌ Removing a Product Image

**Step 1: Remove from File System**
- Delete file from: `public/images/products/`

**Step 2: Update Product Configuration**
- Open: `src/services/productService.ts`
- Find your product and either:
  - Remove the image path entirely (will show placeholder)
  - Replace with a different image path

**Step 3: Clear Cache**
- Restart dev server: `npm run dev`

---

## 🚨 Common Issues & Solutions

### Issue: Image not showing after adding
**Solution:**
1. Check filename has no spaces
2. Verify path in productService.ts matches actual filename
3. Restart dev server to clear cache

### Issue: Old image still showing after removal
**Solution:**
1. Hard refresh browser (Ctrl+F5)
2. Restart dev server
3. Check browser dev tools for cached resources

### Issue: Placeholder showing instead of image
**Causes:**
- File doesn't exist at specified path
- Filename mismatch (spaces, case sensitivity)
- Path in productService.ts is incorrect

---

## 📋 Image Naming Conventions

### ✅ Good Examples
- `frozen-plantains.webp`
- `jamaican-ginger-beer.jpg`
- `beef-patties.webp`

### ❌ Bad Examples
- `Frozen Plantains.webp` (spaces, capitals)
- `jamaican_ginger_beer.jpg` (underscores)
- `BeefPatties.WEBP` (camelCase, caps extension)

---

## 🔍 Troubleshooting Checklist

When an image isn't working:

- [ ] File exists in `public/images/products/`
- [ ] Filename uses lowercase and hyphens (no spaces)
- [ ] Path in `productService.ts` matches actual filename exactly
- [ ] Dev server has been restarted
- [ ] Browser cache cleared (Ctrl+F5)
- [ ] No console errors in browser dev tools

---

## 🛠️ Quick Commands

```bash
# Restart dev server
npm run dev

# Use image management script
node scripts/manage-images.cjs list
node scripts/manage-images.cjs check "Product Name"

# Check if image exists (Windows)
dir public\images\products\your-image-name.webp
```

---

## 📞 Emergency Reset

If images are completely broken:
1. Stop dev server
2. Clear browser cache completely
3. Restart dev server: `npm run dev`
4. Hard refresh browser: Ctrl+F5

---

*Last updated: January 2025*
*This guide ensures you never have to debug image issues again!*