#!/usr/bin/env node

/**
 * Image Management Utility for Zapp E-commerce
 * 
 * Usage:
 *   node scripts/manage-images.js add "Product Name" path/to/image.webp
 *   node scripts/manage-images.js remove "Product Name"
 *   node scripts/manage-images.js list
 *   node scripts/manage-images.js check "Product Name"
 */

const fs = require('fs');
const path = require('path');

const PRODUCT_SERVICE_PATH = path.join(__dirname, '../src/services/productService.ts');
const IMAGES_DIR = path.join(__dirname, '../public/images/products');

// Utility functions
function normalizeImageName(productName) {
  return productName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .trim();
}

function findProductInService(productName) {
  const content = fs.readFileSync(PRODUCT_SERVICE_PATH, 'utf8');
  const lines = content.split('\n');
  
  let productStart = -1;
  let productEnd = -1;
  let braceCount = 0;
  let inProduct = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Look for product name
    if (line.includes(`name: '${productName}'`) || line.includes(`name: "${productName}"`)) {
      // Find the start of this product object
      for (let j = i; j >= 0; j--) {
        if (lines[j].trim().startsWith('{')) {
          productStart = j;
          break;
        }
      }
      inProduct = true;
      braceCount = 1;
      continue;
    }
    
    if (inProduct) {
      // Count braces to find end of product object
      const openBraces = (line.match(/{/g) || []).length;
      const closeBraces = (line.match(/}/g) || []).length;
      braceCount += openBraces - closeBraces;
      
      if (braceCount === 0) {
        productEnd = i;
        break;
      }
    }
  }
  
  return { productStart, productEnd, lines };
}

function updateProductImage(productName, imagePath) {
  const { productStart, productEnd, lines } = findProductInService(productName);
  
  if (productStart === -1) {
    console.error(`❌ Product "${productName}" not found in productService.ts`);
    return false;
  }
  
  console.log(`✅ Found product "${productName}" at lines ${productStart + 1}-${productEnd + 1}`);
  
  // Update image paths
  for (let i = productStart; i <= productEnd; i++) {
    if (lines[i].includes('images:')) {
      lines[i] = `    images: ['${imagePath}'],`;
    }
    if (lines[i].includes('primaryImage:')) {
      lines[i] = `    primaryImage: '${imagePath}',`;
    }
  }
  
  // Write back to file
  fs.writeFileSync(PRODUCT_SERVICE_PATH, lines.join('\n'));
  console.log(`✅ Updated product service file`);
  return true;
}

function removeProductImage(productName) {
  const { productStart, productEnd, lines } = findProductInService(productName);
  
  if (productStart === -1) {
    console.error(`❌ Product "${productName}" not found in productService.ts`);
    return false;
  }
  
  // Remove image paths (will show placeholder)
  for (let i = productStart; i <= productEnd; i++) {
    if (lines[i].includes('images:')) {
      lines[i] = `    images: [],`;
    }
    if (lines[i].includes('primaryImage:')) {
      lines[i] = `    primaryImage: '',`;
    }
  }
  
  // Write back to file
  fs.writeFileSync(PRODUCT_SERVICE_PATH, lines.join('\n'));
  console.log(`✅ Removed image from product service file`);
  return true;
}

function listProducts() {
  const content = fs.readFileSync(PRODUCT_SERVICE_PATH, 'utf8');
  const productMatches = content.match(/name: ['"]([^'"]+)['"]/g);
  
  if (!productMatches) {
    console.log('No products found');
    return;
  }
  
  console.log('\n📦 Products in system:');
  productMatches.forEach((match, index) => {
    const name = match.match(/name: ['"]([^'"]+)['"]/)[1];
    console.log(`${index + 1}. ${name}`);
  });
  console.log('');
}

function checkProduct(productName) {
  const { productStart, productEnd, lines } = findProductInService(productName);
  
  if (productStart === -1) {
    console.error(`❌ Product "${productName}" not found`);
    return;
  }
  
  console.log(`\n🔍 Product: ${productName}`);
  console.log(`📍 Location: lines ${productStart + 1}-${productEnd + 1}`);
  
  // Find image info
  for (let i = productStart; i <= productEnd; i++) {
    if (lines[i].includes('images:')) {
      console.log(`🖼️  Images: ${lines[i].trim()}`);
    }
    if (lines[i].includes('primaryImage:')) {
      console.log(`🎯 Primary: ${lines[i].trim()}`);
      
      // Check if file exists
      const imagePath = lines[i].match(/['"]([^'"]+)['"]/);
      if (imagePath && imagePath[1]) {
        const fullPath = path.join(__dirname, '../public', imagePath[1]);
        const exists = fs.existsSync(fullPath);
        console.log(`📁 File exists: ${exists ? '✅ Yes' : '❌ No'}`);
        if (!exists) {
          console.log(`   Expected at: ${fullPath}`);
        }
      }
    }
  }
  console.log('');
}

// Main command handler
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command) {
    console.log(`
🖼️  Image Management Utility

Usage:
  node scripts/manage-images.js add "Product Name" path/to/image.webp
  node scripts/manage-images.js remove "Product Name"  
  node scripts/manage-images.js list
  node scripts/manage-images.js check "Product Name"

Examples:
  node scripts/manage-images.js add "Frozen Plantains" frozen-plantains.webp
  node scripts/manage-images.js remove "Frozen Plantains"
  node scripts/manage-images.js check "Frozen Plantains"
    `);
    return;
  }
  
  switch (command) {
    case 'add':
      const productName = args[1];
      const imageFile = args[2];
      
      if (!productName || !imageFile) {
        console.error('❌ Usage: add "Product Name" image-file.webp');
        return;
      }
      
      // Normalize image name if needed
      const normalizedName = normalizeImageName(productName);
      const imagePath = `/images/products/${imageFile}`;
      
      console.log(`🔄 Adding image for "${productName}"`);
      console.log(`📁 Image path: ${imagePath}`);
      
      if (updateProductImage(productName, imagePath)) {
        console.log(`✅ Success! Remember to:`);
        console.log(`   1. Place ${imageFile} in public/images/products/`);
        console.log(`   2. Restart dev server: npm run dev`);
      }
      break;
      
    case 'remove':
      const removeProductName = args[1];
      
      if (!removeProductName) {
        console.error('❌ Usage: remove "Product Name"');
        return;
      }
      
      console.log(`🗑️  Removing image for "${removeProductName}"`);
      
      if (removeProductImage(removeProductName)) {
        console.log(`✅ Success! Remember to restart dev server: npm run dev`);
      }
      break;
      
    case 'list':
      listProducts();
      break;
      
    case 'check':
      const checkProductName = args[1];
      
      if (!checkProductName) {
        console.error('❌ Usage: check "Product Name"');
        return;
      }
      
      checkProduct(checkProductName);
      break;
      
    default:
      console.error(`❌ Unknown command: ${command}`);
      console.log('Available commands: add, remove, list, check');
  }
}

main();