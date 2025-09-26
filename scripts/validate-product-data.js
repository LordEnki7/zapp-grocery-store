#!/usr/bin/env node

/**
 * Product Data Validation Script
 * 
 * This script validates product data to ensure compliance with the IMAGE_DISPLAY_FIX_POLICY.md
 * Specifically checks for G-codes in product names and enforces descriptive naming.
 * 
 * Usage:
 *   node scripts/validate-product-data.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function validateProductData() {
  const productsPath = path.join(__dirname, '..', 'data', 'products', 'products.json');
  
  if (!fs.existsSync(productsPath)) {
    log('❌ ERROR: products.json not found at expected location', 'red');
    process.exit(1);
  }

  let productsData;
  try {
    const rawData = fs.readFileSync(productsPath, 'utf8');
    productsData = JSON.parse(rawData);
  } catch (error) {
    log('❌ ERROR: Failed to parse products.json', 'red');
    log(error.message, 'red');
    process.exit(1);
  }

  // Handle both array format and object format
  const products = Array.isArray(productsData) ? productsData : (productsData.products || []);
  const violations = [];
  const gCodePattern = /^G\d+$/i;

  log('🔍 Validating product data...', 'blue');
  log(`📊 Total products to check: ${products.length}`, 'blue');

  products.forEach((product, index) => {
    if (!product.name) {
      violations.push({
        index,
        id: product.id,
        issue: 'Missing product name',
        name: 'N/A'
      });
      return;
    }

    // Check for G-code pattern
    if (gCodePattern.test(product.name.trim())) {
      violations.push({
        index,
        id: product.id,
        issue: 'G-code used as product name (PROHIBITED)',
        name: product.name
      });
    }

    // Check for very short names (likely codes)
    if (product.name.trim().length < 3) {
      violations.push({
        index,
        id: product.id,
        issue: 'Product name too short (likely a code)',
        name: product.name
      });
    }
  });

  // Report results
  console.log('\n' + '='.repeat(60));
  
  if (violations.length === 0) {
    log('✅ VALIDATION PASSED: All products have valid descriptive names!', 'green');
    log('🎉 No G-codes or invalid names found.', 'green');
  } else {
    log(`❌ VALIDATION FAILED: Found ${violations.length} violations`, 'red');
    log('\n📋 VIOLATIONS FOUND:', 'yellow');
    
    violations.forEach((violation, i) => {
      log(`\n${i + 1}. Product ID: ${violation.id}`, 'red');
      log(`   Name: "${violation.name}"`, 'red');
      log(`   Issue: ${violation.issue}`, 'red');
      log(`   Array Index: ${violation.index}`, 'red');
    });

    log('\n🔧 REQUIRED ACTIONS:', 'yellow');
    log('1. Replace all G-codes with descriptive product names', 'yellow');
    log('2. Ensure all product names are human-readable', 'yellow');
    log('3. Re-run this validation script until it passes', 'yellow');
    log('4. Update IMAGE_DISPLAY_FIX_POLICY.md compliance', 'yellow');

    process.exit(1);
  }

  console.log('='.repeat(60));
}

// Run validation
validateProductData();