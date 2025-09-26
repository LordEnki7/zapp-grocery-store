#!/usr/bin/env node

/**
 * Ultra-Simple Gift Card Image Placer
 * 
 * Usage: Just give me the image path and product name, I'll handle everything else!
 * 
 * Examples:
 *   npm run gift-image "iTunes Gift Card" ./sitephoto/itunes.jpg
 *   npm run gift-image "Amazon Gift Card" C:/path/to/amazon.png
 *   npm run gift-image "Google Play" ./images/google-play.webp
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class GiftCardImagePlacer {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.productsPath = path.join(this.projectRoot, 'data', 'products', 'products.json');
    this.targetDir = path.join(this.projectRoot, 'public', 'images', 'products');
    
    // Ensure target directory exists
    fs.mkdirSync(this.targetDir, { recursive: true });
  }

  // Load and save products
  loadProducts() {
    const data = fs.readFileSync(this.productsPath, 'utf8');
    return JSON.parse(data);
  }

  saveProducts(products) {
    fs.writeFileSync(this.productsPath, JSON.stringify(products, null, 2));
  }

  // Find gift card product (smart search)
  findGiftCard(products, name) {
    const searchName = name.toLowerCase();
    return products.find(product => 
      product.isGiftCard === true && (
        product.name.toLowerCase().includes(searchName) ||
        product.name.toLowerCase() === searchName
      )
    );
  }

  // Generate clean filename
  generateFilename(productName, originalPath) {
    const extension = path.extname(originalPath);
    return productName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() + extension;
  }

  // Copy image to correct location
  placeImage(sourcePath, productName) {
    console.log(`🎯 Placing image for Gift Card: ${productName}`);
    console.log(`📂 Source: ${sourcePath}`);

    // Validate source exists
    if (!fs.existsSync(sourcePath)) {
      console.error(`❌ Source image not found: ${sourcePath}`);
      console.log('💡 Make sure the path is correct and the file exists');
      return null;
    }

    // Load products
    const products = this.loadProducts();
    const giftCard = this.findGiftCard(products, productName);

    if (!giftCard) {
      console.error(`❌ Gift Card not found: ${productName}`);
      console.log('💡 Available Gift Cards:');
      products
        .filter(p => p.isGiftCard === true)
        .slice(0, 10)
        .forEach(p => console.log(`   - ${p.name}`));
      return null;
    }

    // Generate target filename and path
    const filename = this.generateFilename(giftCard.name, sourcePath);
    const targetPath = path.join(this.targetDir, filename);
    const webPath = `/images/products/${filename}`;

    try {
      // Copy the image
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`✅ Image copied to: ${targetPath}`);

      // Update all image fields in the product
      giftCard.primaryImage = webPath;
      giftCard.images = [webPath];
      if (giftCard.image) {
        giftCard.image = webPath; // Legacy field
      }

      // Save products
      this.saveProducts(products);
      console.log(`✅ Product data updated successfully`);

      console.log(`🎉 SUCCESS! Gift Card image placed successfully`);
      console.log(`📍 Product: ${giftCard.name}`);
      console.log(`📍 Image URL: ${webPath}`);
      console.log(`📍 File: ${filename}`);

      return webPath;

    } catch (error) {
      console.error(`❌ Error copying image: ${error.message}`);
      return null;
    }
  }

  // Main runner
  run() {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
      console.log(`
🎯 Ultra-Simple Gift Card Image Placer

Usage:
  npm run gift-image "Gift Card Name" path/to/image.jpg

Examples:
  npm run gift-image "iTunes Gift Card" ./sitephoto/itunes.jpg
  npm run gift-image "Amazon Gift Card" C:/Users/me/Desktop/amazon.png
  npm run gift-image "Google Play" ./images/google-play.webp

What this does:
  1. Takes your image from anywhere
  2. Copies it to the right place (/public/images/products/)
  3. Updates the Gift Card product automatically
  4. Done! ✨

No more complexity - just give me the image path and I'll handle everything!
      `);
      return;
    }

    const [productName, imagePath] = args;
    this.placeImage(imagePath, productName);
  }
}

// Run it
const placer = new GiftCardImagePlacer();
placer.run();