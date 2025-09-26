#!/usr/bin/env node

/**
 * VALIDATE IMAGE MAPPINGS
 * 
 * This script validates that all products have proper image mappings
 * and identifies any missing or broken mappings.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const PRODUCT_SERVICE_PATH = './src/services/productService.ts';
const PRODUCTS_JSON_PATH = './data/products/products.json';
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

// Get all products from products.json
function getAllProducts() {
  if (!fs.existsSync(PRODUCTS_JSON_PATH)) {
    console.error('❌ products.json not found');
    return [];
  }
  
  const productsData = JSON.parse(fs.readFileSync(PRODUCTS_JSON_PATH, 'utf8'));
  return productsData;
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

// Check if image file exists
function imageFileExists(imagePath) {
  const fullPath = path.join('./public', imagePath);
  return fs.existsSync(fullPath);
}

// Get all available image files
function getAllAvailableImages() {
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

// Main validation function
function validateImageMappings() {
  console.log('🔍 Validating Image Mappings...\n');
  
  const products = getAllProducts();
  const mappings = getExistingMappings();
  const availableImages = getAllAvailableImages();
  
  console.log(`📦 Total products: ${products.length}`);
  console.log(`🗺️  Total mappings: ${Object.keys(mappings).length}`);
  console.log(`📁 Available images: ${availableImages.length}\n`);
  
  const results = {
    productsWithMappings: [],
    productsWithoutMappings: [],
    productsWithBrokenMappings: [],
    productsWithGenericImages: [],
    unmappedImages: [],
    summary: {}
  };
  
  // Check each product
  products.forEach(product => {
    const productName = product.name;
    const currentImage = product.primaryImage || product.image;
    
    // Check if product has a mapping
    if (mappings[productName]) {
      const mappedPath = mappings[productName];
      
      // Check if mapped image file exists
      if (imageFileExists(mappedPath)) {
        results.productsWithMappings.push({
          name: productName,
          mappedPath,
          currentImage
        });
      } else {
        results.productsWithBrokenMappings.push({
          name: productName,
          mappedPath,
          currentImage,
          issue: 'Mapped file does not exist'
        });
      }
    } else {
      // Check if product has generic/placeholder image
      const isGeneric = currentImage && (
        currentImage.includes('placeholder') ||
        currentImage.includes('generic') ||
        currentImage.includes('default')
      );
      
      if (isGeneric) {
        results.productsWithGenericImages.push({
          name: productName,
          currentImage,
          availableMatch: availableImages.find(img => 
            img.productName === productName || 
            img.productName.toLowerCase() === productName.toLowerCase()
          )
        });
      } else {
        results.productsWithoutMappings.push({
          name: productName,
          currentImage,
          availableMatch: availableImages.find(img => 
            img.productName === productName || 
            img.productName.toLowerCase() === productName.toLowerCase()
          )
        });
      }
    }
  });
  
  // Find unmapped images
  const mappedImagePaths = Object.values(mappings);
  results.unmappedImages = availableImages.filter(img => 
    !mappedImagePaths.includes(img.imagePath) &&
    !products.some(product => 
      product.name === img.productName || 
      product.name.toLowerCase() === img.productName.toLowerCase()
    )
  );
  
  // Generate summary
  results.summary = {
    totalProducts: products.length,
    productsWithMappings: results.productsWithMappings.length,
    productsWithoutMappings: results.productsWithoutMappings.length,
    productsWithBrokenMappings: results.productsWithBrokenMappings.length,
    productsWithGenericImages: results.productsWithGenericImages.length,
    unmappedImages: results.unmappedImages.length,
    mappingCoverage: ((results.productsWithMappings.length / products.length) * 100).toFixed(1)
  };
  
  return results;
}

// Display results
function displayResults(results) {
  console.log('📊 VALIDATION RESULTS\n');
  
  // Summary
  console.log('📈 SUMMARY:');
  console.log(`   ✅ Products with valid mappings: ${results.summary.productsWithMappings}`);
  console.log(`   ❌ Products without mappings: ${results.summary.productsWithoutMappings}`);
  console.log(`   🔗 Products with broken mappings: ${results.summary.productsWithBrokenMappings}`);
  console.log(`   🖼️  Products with generic images: ${results.summary.productsWithGenericImages}`);
  console.log(`   📁 Unmapped images: ${results.summary.unmappedImages}`);
  console.log(`   📊 Mapping coverage: ${results.summary.mappingCoverage}%\n`);
  
  // Products without mappings
  if (results.productsWithoutMappings.length > 0) {
    console.log('❌ PRODUCTS WITHOUT MAPPINGS:');
    results.productsWithoutMappings.forEach(product => {
      console.log(`   • ${product.name}`);
      if (product.availableMatch) {
        console.log(`     → Available match: ${product.availableMatch.imagePath}`);
      }
    });
    console.log();
  }
  
  // Products with broken mappings
  if (results.productsWithBrokenMappings.length > 0) {
    console.log('🔗 PRODUCTS WITH BROKEN MAPPINGS:');
    results.productsWithBrokenMappings.forEach(product => {
      console.log(`   • ${product.name} → ${product.mappedPath} (${product.issue})`);
    });
    console.log();
  }
  
  // Products with generic images that could be improved
  if (results.productsWithGenericImages.length > 0) {
    console.log('🖼️  PRODUCTS WITH GENERIC IMAGES:');
    results.productsWithGenericImages.forEach(product => {
      console.log(`   • ${product.name} (${product.currentImage})`);
      if (product.availableMatch) {
        console.log(`     → Available upgrade: ${product.availableMatch.imagePath}`);
      }
    });
    console.log();
  }
  
  // Unmapped images
  if (results.unmappedImages.length > 0) {
    console.log('📁 UNMAPPED IMAGES (no matching products):');
    results.unmappedImages.forEach(image => {
      console.log(`   • ${image.productName} (${image.imagePath})`);
    });
    console.log();
  }
  
  // Recommendations
  console.log('💡 RECOMMENDATIONS:');
  if (results.summary.productsWithoutMappings > 0) {
    console.log('   • Run auto-image-mapper.cjs to add missing mappings');
  }
  if (results.summary.productsWithBrokenMappings > 0) {
    console.log('   • Fix broken image paths in productService.ts');
  }
  if (results.summary.productsWithGenericImages > 0) {
    console.log('   • Replace generic images with specific product images');
  }
  if (results.summary.unmappedImages > 0) {
    console.log('   • Review unmapped images - create products or remove unused files');
  }
  
  if (results.summary.mappingCoverage == 100 && results.summary.productsWithBrokenMappings === 0) {
    console.log('   🎉 All mappings are valid! Great job!');
  }
}

// Main execution
function main() {
  const results = validateImageMappings();
  displayResults(results);
  
  // Save detailed report
  const reportPath = `validation-report-${Date.now()}.json`;
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Detailed report saved to ${reportPath}`);
  
  // Exit with appropriate code
  const hasIssues = results.summary.productsWithoutMappings > 0 || 
                   results.summary.productsWithBrokenMappings > 0;
  
  if (hasIssues) {
    console.log('\n⚠️  Issues found - please address the recommendations above');
    process.exit(1);
  } else {
    console.log('\n✅ All image mappings are valid!');
    process.exit(0);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { validateImageMappings, getAllProducts, getExistingMappings };