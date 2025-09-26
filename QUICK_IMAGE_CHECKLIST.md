# 🚀 Quick Image Checklist

## ➕ Adding an Image (2 minutes)

### Method 1: Manual (Traditional)
- [ ] 1. Add image to `public/images/products/` (use lowercase-with-hyphens.webp)
- [ ] 2. Open `src/services/productService.ts`
- [ ] 3. Find your product and update `images` and `primaryImage` paths
- [ ] 4. Restart dev server: `npm run dev`

### Method 2: Script (Automated) ⭐ RECOMMENDED
```bash
# Step 1: Use the script to update the code
node scripts/manage-images.cjs add "Product Name" your-image.webp

# Step 2: Add the actual image file to public/images/products/

# Step 3: Restart server
npm run dev
```

---

## ➖ Removing an Image (1 minute)

### Method 1: Manual
- [ ] 1. Delete image from `public/images/products/`
- [ ] 2. Update `productService.ts` (set images to `[]` and primaryImage to `''`)
- [ ] 3. Restart dev server

### Method 2: Script ⭐ RECOMMENDED
```bash
# Step 1: Use script
node scripts/manage-images.cjs remove "Product Name"

# Step 2: Delete physical file from public/images/products/

# Step 3: Restart server
npm run dev
```

---

## 🔍 Troubleshooting (30 seconds)

### Image not showing?
```bash
# Check if product exists and image path is correct
node scripts/manage-images.cjs check "Product Name"
```

### Quick fixes:
- [ ] Hard refresh browser (Ctrl+F5)
- [ ] Restart dev server
- [ ] Check filename has no spaces
- [ ] Verify image exists in `public/images/products/`

---

## 📋 Useful Commands

```bash
# List all products
node scripts/manage-images.cjs list

# Check specific product
node scripts/manage-images.cjs check "Product Name"

# See all available commands
node scripts/manage-images.cjs
```

---

**💡 Pro Tip:** Always use the script method - it's faster and prevents errors!