#!/usr/bin/env node

/**
 * AUTO IMAGE MAPPER
 * 
 * This script automatically scans for new images in the sitephoto directories
 * and adds missing mappings to the getSitephotoImagePath function in productService.ts
 * 
 * This ensures that new images are automatically mapped without manual intervention.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SITEPHOTO_DIRS = [
  './public/sitephoto/New images',
  './public/sitephoto',
  './public/sitephoto/Juices',
  './public/sitephoto/Snacks',
  './public/sitephoto/Coffee',
  './public/sitephoto/Breakfast Cereal',
  './public/sitephoto/Beans',
  './public/sitephoto/Candy',
  './public/sitephoto/Beverages'
];

const PRODUCT_SERVICE_PATH = './src/services/productService.ts';
const PRODUCTS_JSON_PATH = './data/products/products.json';

// Get all image files from sitephoto directories
function getAllImageFiles() {
  const imageFiles = [];
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif'];
  
  SITEPHOTO_DIRS.forEach(dir => {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const ext = path.extname(file).toLowerCase();
        if (imageExtensions.includes(ext)) {
          const productName = path.basename(file, ext);
          const relativePath = path.join(dir, file).replace('./public', '').replace(/\\/g, '/');
          imageFiles.push({
            productName,
            imagePath: relativePath,
            fullPath: path.join(dir, file)
          });
        }
      });
    }
  });
  
  return imageFiles;
}

// Get all product names from products.json
function getAllProductNames() {
  if (!fs.existsSync(PRODUCTS_JSON_PATH)) {
    console.error('❌ products.json not found');
    return [];
  }
  
  const productsData = JSON.parse(fs.readFileSync(PRODUCTS_JSON_PATH, 'utf8'));
  return productsData.map(product => product.name);
}

// Extract existing mappings from productService.ts
function getExistingMappings() {
  if (!fs.existsSync(PRODUCT_SERVICE_PATH)) {
    console.error('❌ productService.ts not found');
    return {};
  }
  
  const content = fs.readFileSync(PRODUCT_SERVICE_PATH, 'utf8');
  const mappings = {};
  
  // Extract mappings using regex
  const mappingRegex = /'([^']+)':\s*'([^']+)'/g;
  let match;
  
  while ((match = mappingRegex.exec(content)) !== null) {
    mappings[match[1]] = match[2];
  }
  
  return mappings;
}

// Add new mappings to productService.ts
function addMappingsToProductService(newMappings) {
  if (Object.keys(newMappings).length === 0) {
    console.log('✅ No new mappings needed');
    return;
  }
  
  let content = fs.readFileSync(PRODUCT_SERVICE_PATH, 'utf8');
  
  // Find the end of the sitephotoMapping object
  const mappingEndRegex = /(\s+)};(\s+return sitephotoMapping\[productName\] \|\| null;)/;
  const match = content.match(mappingEndRegex);
  
  if (!match) {
    console.error('❌ Could not find mapping insertion point in productService.ts');
    return;
  }
  
  // Generate new mapping entries
  const newMappingEntries = Object.entries(newMappings)
    .map(([productName, imagePath]) => `    '${productName}': '${imagePath}',`)
    .join('\n');
  
  // Insert new mappings before the closing brace
  const replacement = `${newMappingEntries}\n${match[1]}}${match[2]}`;
  content = content.replace(mappingEndRegex, replacement);
  
  // Write back to file
  fs.writeFileSync(PRODUCT_SERVICE_PATH, content, 'utf8');
  
  console.log(`✅ Added ${Object.keys(newMappings).length} new mappings to productService.ts`);
  Object.entries(newMappings).forEach(([name, path]) => {
    console.log(`   • ${name} → ${path}`);
  });
}

// Main execution
function main() {
  console.log('🔍 Auto Image Mapper - Scanning for new images...\n');
  
  // Get all available images
  const imageFiles = getAllImageFiles();
  console.log(`📁 Found ${imageFiles.length} image files in sitephoto directories`);
  
  // Get all product names
  const productNames = getAllProductNames();
  console.log(`📦 Found ${productNames.length} products in products.json`);
  
  // Get existing mappings
  const existingMappings = getExistingMappings();
  console.log(`🗺️  Found ${Object.keys(existingMappings).length} existing mappings\n`);
  
  // Find new mappings needed
  const newMappings = {};
  
  // Strategy 1: Exact product name matches
  productNames.forEach(productName => {
    if (!existingMappings[productName]) {
      const matchingImage = imageFiles.find(img => 
        img.productName === productName || 
        img.productName.toLowerCase() === productName.toLowerCase()
      );
      
      if (matchingImage) {
        newMappings[productName] = matchingImage.imagePath;
      }
    }
  });
  
  // Strategy 2: Fuzzy matching for common variations
  productNames.forEach(productName => {
    if (!existingMappings[productName] && !newMappings[productName]) {
      const normalizedProductName = productName.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      const matchingImage = imageFiles.find(img => {
        const normalizedImageName = img.productName.toLowerCase().replace(/[^a-z0-9]/g, '');
        return normalizedImageName === normalizedProductName;
      });
      
      if (matchingImage) {
        newMappings[productName] = matchingImage.imagePath;
      }
    }
  });
  
  console.log(`🆕 Found ${Object.keys(newMappings).length} new mappings to add:`);
  Object.entries(newMappings).forEach(([name, path]) => {
    console.log(`   • ${name} → ${path}`);
  });
  
  // Add new mappings to productService.ts
  if (Object.keys(newMappings).length > 0) {
    addMappingsToProductService(newMappings);
    
    // Create a report
    const report = {
      timestamp: new Date().toISOString(),
      newMappingsAdded: Object.keys(newMappings).length,
      mappings: newMappings,
      totalImagesScanned: imageFiles.length,
      totalProductsChecked: productNames.length,
      existingMappingsCount: Object.keys(existingMappings).length
    };
    
    const reportPath = `auto-mapping-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📊 Report saved to ${reportPath}`);
  }
  
  console.log('\n✅ Auto Image Mapper completed successfully!');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { main, getAllImageFiles, getAllProductNames, getExistingMappings };