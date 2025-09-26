#!/usr/bin/env node

/**
 * Simple Image Manager - One-Stop Solution for All Image Operations
 * 
 * Usage:
 *   npm run image add "Product Name" path/to/image.jpg
 *   npm run image update "Product Name" path/to/new-image.jpg
 *   npm run image remove "Product Name"
 *   npm run image placeholder "Product Name"
 *   npm run image validate
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SimpleImageManager {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.productsPath = path.join(this.projectRoot, 'data', 'products', 'products.json');
    this.imagesDir = path.join(this.projectRoot, 'public', 'images', 'products');
    this.sitephotoDir = path.join(this.projectRoot, 'sitephoto');
  }

  // Load products data
  loadProducts() {
    try {
      const data = fs.readFileSync(this.productsPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('❌ Error loading products.json:', error.message);
      process.exit(1);
    }
  }

  // Save products data
  saveProducts(products) {
    try {
      fs.writeFileSync(this.productsPath, JSON.stringify(products, null, 2));
      console.log('✅ Products data saved successfully');
    } catch (error) {
      console.error('❌ Error saving products.json:', error.message);
      process.exit(1);
    }
  }

  // Find product by name (case-insensitive, partial match)
  findProduct(products, productName) {
    const searchName = productName.toLowerCase();
    return products.find(product => 
      product.name.toLowerCase().includes(searchName) ||
      product.name.toLowerCase() === searchName
    );
  }

  // Generate clean filename from product name
  generateFilename(productName, extension = 'svg') {
    return productName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() + '.' + extension;
  }

  // Create placeholder SVG
  createPlaceholder(productName, filename) {
    const placeholderPath = path.join(this.imagesDir, filename);
    
    // Ensure directory exists
    fs.mkdirSync(this.imagesDir, { recursive: true });

    const svgContent = `<svg width="300" height="300" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e5e7eb;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="300" height="300" fill="url(#grad)" stroke="#d1d5db" stroke-width="2"/>
  <circle cx="150" cy="120" r="30" fill="#9ca3af"/>
  <rect x="100" y="160" width="100" height="8" rx="4" fill="#9ca3af"/>
  <rect x="120" y="180" width="60" height="6" rx="3" fill="#d1d5db"/>
  <text x="150" y="220" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#6b7280">
    ${productName.length > 20 ? productName.substring(0, 20) + '...' : productName}
  </text>
  <text x="150" y="240" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#9ca3af">
    Placeholder Image
  </text>
</svg>`;

    fs.writeFileSync(placeholderPath, svgContent);
    return `/images/products/${filename}`;
  }

  // Copy image to products directory
  copyImage(sourcePath, filename) {
    const destPath = path.join(this.imagesDir, filename);
    
    // Ensure directory exists
    fs.mkdirSync(this.imagesDir, { recursive: true });

    try {
      fs.copyFileSync(sourcePath, destPath);
      return `/images/products/${filename}`;
    } catch (error) {
      console.error('❌ Error copying image:', error.message);
      return null;
    }
  }

  // Update product image paths
  updateProductImage(product, imagePath) {
    product.primaryImage = imagePath;
    product.images = [imagePath];
    if (product.image) {
      product.image = imagePath; // Legacy field
    }
  }

  // Add or update product image
  addImage(productName, imagePath) {
    console.log(`🔄 Processing image for: ${productName}`);
    
    const products = this.loadProducts();
    const product = this.findProduct(products, productName);
    
    if (!product) {
      console.error(`❌ Product not found: ${productName}`);
      console.log('💡 Available products:');
      products.slice(0, 10).forEach(p => console.log(`   - ${p.name}`));
      return;
    }

    let finalImagePath;
    
    if (imagePath && fs.existsSync(imagePath)) {
      // Copy real image
      const extension = path.extname(imagePath).substring(1);
      const filename = this.generateFilename(product.name, extension);
      finalImagePath = this.copyImage(imagePath, filename);
      
      if (!finalImagePath) {
        console.error('❌ Failed to copy image, creating placeholder instead');
        finalImagePath = this.createPlaceholder(product.name, this.generateFilename(product.name));
      } else {
        console.log(`✅ Image copied successfully: ${filename}`);
      }
    } else {
      // Create placeholder
      const filename = this.generateFilename(product.name);
      finalImagePath = this.createPlaceholder(product.name, filename);
      console.log(`✅ Placeholder created: ${filename}`);
    }

    // Update product
    this.updateProductImage(product, finalImagePath);
    this.saveProducts(products);
    
    console.log(`🎉 Successfully updated image for: ${product.name}`);
    console.log(`📍 Image path: ${finalImagePath}`);
  }

  // Remove product image (set to placeholder)
  removeImage(productName) {
    console.log(`🔄 Removing image for: ${productName}`);
    
    const products = this.loadProducts();
    const product = this.findProduct(products, productName);
    
    if (!product) {
      console.error(`❌ Product not found: ${productName}`);
      return;
    }

    // Create placeholder
    const filename = this.generateFilename(product.name);
    const placeholderPath = this.createPlaceholder(product.name, filename);
    
    // Update product
    this.updateProductImage(product, placeholderPath);
    this.saveProducts(products);
    
    console.log(`✅ Image removed and placeholder created for: ${product.name}`);
  }

  // Validate all images
  validateImages() {
    console.log('🔍 Validating all product images...');
    
    const products = this.loadProducts();
    let validCount = 0;
    let invalidCount = 0;
    const issues = [];

    products.forEach(product => {
      const imagePath = product.primaryImage || product.images?.[0] || product.image;
      
      if (!imagePath) {
        issues.push(`❌ ${product.name}: No image path defined`);
        invalidCount++;
        return;
      }

      // Check if it's a web URL or local path
      if (imagePath.startsWith('http')) {
        validCount++; // Assume web URLs are valid
        return;
      }

      // Check local file
      const fullPath = path.join(this.projectRoot, 'public', imagePath.replace(/^\//, ''));
      
      if (fs.existsSync(fullPath)) {
        validCount++;
      } else {
        issues.push(`❌ ${product.name}: Image not found - ${imagePath}`);
        invalidCount++;
      }
    });

    console.log(`\n📊 Validation Results:`);
    console.log(`✅ Valid images: ${validCount}`);
    console.log(`❌ Invalid images: ${invalidCount}`);
    console.log(`📈 Success rate: ${((validCount / (validCount + invalidCount)) * 100).toFixed(1)}%`);

    if (issues.length > 0) {
      console.log(`\n🔍 Issues found:`);
      issues.forEach(issue => console.log(issue));
    }
  }

  // Main command handler
  run() {
    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
      case 'add':
      case 'update':
        if (args.length < 2) {
          console.error('❌ Usage: npm run image add "Product Name" [path/to/image.jpg]');
          process.exit(1);
        }
        this.addImage(args[1], args[2]);
        break;

      case 'remove':
        if (args.length < 2) {
          console.error('❌ Usage: npm run image remove "Product Name"');
          process.exit(1);
        }
        this.removeImage(args[1]);
        break;

      case 'placeholder':
        if (args.length < 2) {
          console.error('❌ Usage: npm run image placeholder "Product Name"');
          process.exit(1);
        }
        this.addImage(args[1]); // No image path = placeholder
        break;

      case 'validate':
        this.validateImages();
        break;

      default:
        console.log(`
🖼️  Simple Image Manager

Usage:
  npm run image add "Product Name" path/to/image.jpg    # Add/update with real image
  npm run image placeholder "Product Name"             # Add/update with placeholder
  npm run image remove "Product Name"                  # Remove image (creates placeholder)
  npm run image validate                               # Validate all images

Examples:
  npm run image add "iTunes Gift Card"
  npm run image add "Amazon Gift Card" ./sitephoto/amazon.jpg
  npm run image placeholder "New Product"
  npm run image validate
        `);
        break;
    }
  }
}

// Run the manager
const manager = new SimpleImageManager();
manager.run();