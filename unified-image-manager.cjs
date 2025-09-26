#!/usr/bin/env node

/**
 * Unified Image Manager
 * 
 * This is the ONLY script needed for image management.
 * It uses getSitephotoImagePath from productService.ts as the single source of truth.
 * 
 * Usage: node unified-image-manager.cjs [--fix-products] [--validate]
 */

const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = './data/products/products.json';
const PRODUCT_SERVICE_FILE = './src/services/productService.ts';

/**
 * Extract getSitephotoImagePath mappings from productService.ts
 */
function getImageMappings() {
  const content = fs.readFileSync(PRODUCT_SERVICE_FILE, 'utf8');
  const mappings = {};
  
  // Extract the sitephotoMapping object
  const mappingRegex = /'([^']+)':\s*'([^']+)'/g;
  let match;
  
  while ((match = mappingRegex.exec(content)) !== null) {
    mappings[match[1]] = match[2];
  }
  
  return mappings;
}

/**
 * Fix product image paths to match getSitephotoImagePath mappings
 */
function fixProductImages() {
  console.log('🔧 Fixing product images using getSitephotoImagePath mappings...\n');
  
  const mappings = getImageMappings();
  const productsData = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
  
  let fixedCount = 0;
  let totalProducts = 0;
  
  for (let i = 0; i < productsData.length; i++) {
    const product = productsData[i];
    totalProducts++;
    
    console.log(`📦 ${product.name}`);
    
    // Check if we have a mapping for this product
    const correctPath = mappings[product.name];
    
    if (correctPath) {
      const currentPath = product.primaryImage || product.images?.[0] || product.image;
      
      if (currentPath !== correctPath) {
        console.log(`   ✅ Fixed: ${correctPath}`);
        
        // Update all image fields
        productsData[i].primaryImage = correctPath;
        productsData[i].images = [correctPath];
        if (productsData[i].image) {
          productsData[i].image = correctPath;
        }
        
        fixedCount++;
      } else {
        console.log(`   ✓ Already correct`);
      }
    } else {
      console.log(`   ⚠️  No mapping found - using fallback system`);
    }
    
    console.log('');
  }
  
  // Save updated products file
  if (fixedCount > 0) {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(productsData, null, 2));
    console.log(`✅ Fixed ${fixedCount} products out of ${totalProducts} total`);
    console.log(`📁 Updated: ${PRODUCTS_FILE}`);
  } else {
    console.log(`✅ All ${totalProducts} products already have correct image paths`);
  }
}

/**
 * Validate that all products have correct image mappings
 */
function validateImages() {
  console.log('🔍 Validating image mappings...\n');
  
  const mappings = getImageMappings();
  const productsData = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
  
  let validCount = 0;
  let invalidCount = 0;
  let unmappedCount = 0;
  
  for (const product of productsData) {
    const correctPath = mappings[product.name];
    const currentPath = product.primaryImage || product.images?.[0] || product.image;
    
    if (correctPath) {
      if (currentPath === correctPath) {
        validCount++;
      } else {
        console.log(`❌ ${product.name}: Expected "${correctPath}", got "${currentPath}"`);
        invalidCount++;
      }
    } else {
      console.log(`⚠️  ${product.name}: No mapping found`);
      unmappedCount++;
    }
  }
  
  console.log(`\n📊 Validation Results:`);
  console.log(`✅ Valid: ${validCount}`);
  console.log(`❌ Invalid: ${invalidCount}`);
  console.log(`⚠️  Unmapped: ${unmappedCount}`);
  console.log(`📦 Total: ${productsData.length}`);
}

// Main execution
const args = process.argv.slice(2);

if (args.includes('--fix-products')) {
  fixProductImages();
} else if (args.includes('--validate')) {
  validateImages();
} else {
  console.log(`
🎯 Unified Image Manager

This script manages all product images using getSitephotoImagePath as the single source of truth.

Usage:
  node unified-image-manager.cjs --fix-products    Fix product.json to match mappings
  node unified-image-manager.cjs --validate        Validate current image paths

The getSitephotoImagePath function in productService.ts is the ONLY place where 
image mappings should be defined. All other scripts have been consolidated into this one.
`);
}