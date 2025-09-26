const fs = require('fs');
const path = require('path');

/**
 * Comprehensive Image Validation Script
 * Validates all product images and provides detailed reporting
 */

const PRODUCTS_FILE = './data/products/products.json';

// Simple image existence checker (Node.js version of the validation service)
class SimpleImageValidator {
  constructor() {
    this.basePaths = [
      './sitephoto/Gift Cards',
      './sitephoto/New images',
      './public/images/products',
      './public/images/categories',
      './sitephoto'
    ];
    this.supportedFormats = ['webp', 'avif', 'png', 'jpg', 'jpeg', 'svg'];
  }

  imageExists(imagePath) {
    // Remove leading slash and try different base paths
    const cleanPath = imagePath.replace(/^\/+/, '');
    
    // Try the path as-is first
    if (fs.existsSync(cleanPath)) {
      return true;
    }

    // Try with different base paths
    for (const basePath of this.basePaths) {
      const fullPath = path.join(basePath, path.basename(cleanPath));
      if (fs.existsSync(fullPath)) {
        return true;
      }
    }

    return false;
  }

  findBestMatch(productName, currentPath) {
    const normalizedName = productName.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Try current path first
    if (currentPath && this.imageExists(currentPath)) {
      return currentPath;
    }

    // Try to find by product name
    for (const basePath of this.basePaths) {
      if (!fs.existsSync(basePath)) continue;
      
      const files = fs.readdirSync(basePath);
      
      for (const file of files) {
        const fileNameNormalized = file.toLowerCase()
          .replace(/\.[^/.]+$/, '')
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, ' ')
          .trim();

        if (fileNameNormalized.includes(normalizedName) || 
            normalizedName.includes(fileNameNormalized)) {
          return `/${basePath.replace('./', '')}/${file}`;
        }
      }
    }

    return null;
  }

  generateSuggestions(imagePath, productName) {
    const suggestions = [];
    const filename = path.basename(imagePath);
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');

    for (const basePath of this.basePaths) {
      if (!fs.existsSync(basePath)) continue;
      
      const files = fs.readdirSync(basePath);
      
      // Look for similar filenames
      for (const file of files) {
        const fileNameLower = file.toLowerCase();
        const searchTerms = [
          nameWithoutExt.toLowerCase(),
          productName.toLowerCase(),
          ...productName.toLowerCase().split(' ')
        ];

        for (const term of searchTerms) {
          if (term.length > 3 && fileNameLower.includes(term)) {
            const suggestionPath = `/${basePath.replace('./', '')}/${file}`;
            if (!suggestions.includes(suggestionPath)) {
              suggestions.push(suggestionPath);
            }
          }
        }
      }
    }

    return suggestions.slice(0, 5);
  }
}

async function validateAllImages() {
  console.log('🔍 Starting Comprehensive Image Validation...\n');

  const validator = new SimpleImageValidator();
  const productsData = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
  
  const results = {
    total: 0,
    valid: 0,
    invalid: 0,
    fixed: 0,
    details: []
  };

  console.log(`📊 Analyzing ${productsData.length} products...\n`);

  for (const product of productsData) {
    results.total++;
    
    const imagePath = product.primaryImage || product.image || (product.images && product.images[0]);
    
    if (!imagePath) {
      results.invalid++;
      results.details.push({
        id: product.id,
        name: product.name,
        status: 'NO_IMAGE',
        originalPath: '',
        suggestions: validator.generateSuggestions('', product.name)
      });
      continue;
    }

    const exists = validator.imageExists(imagePath);
    
    if (exists) {
      results.valid++;
      results.details.push({
        id: product.id,
        name: product.name,
        status: 'VALID',
        originalPath: imagePath
      });
    } else {
      // Try to find a better match
      const bestMatch = validator.findBestMatch(product.name, imagePath);
      
      if (bestMatch && bestMatch !== imagePath) {
        results.fixed++;
        results.details.push({
          id: product.id,
          name: product.name,
          status: 'FIXABLE',
          originalPath: imagePath,
          suggestedPath: bestMatch
        });
      } else {
        results.invalid++;
        const suggestions = validator.generateSuggestions(imagePath, product.name);
        results.details.push({
          id: product.id,
          name: product.name,
          status: 'INVALID',
          originalPath: imagePath,
          suggestions
        });
      }
    }
  }

  // Generate report
  console.log('📋 VALIDATION REPORT');
  console.log('='.repeat(50));
  console.log(`Total Products: ${results.total}`);
  console.log(`✅ Valid Images: ${results.valid} (${(results.valid/results.total*100).toFixed(1)}%)`);
  console.log(`🔧 Fixable Images: ${results.fixed} (${(results.fixed/results.total*100).toFixed(1)}%)`);
  console.log(`❌ Invalid Images: ${results.invalid} (${(results.invalid/results.total*100).toFixed(1)}%)`);
  console.log('');

  // Show fixable items
  if (results.fixed > 0) {
    console.log('🔧 FIXABLE IMAGES:');
    console.log('-'.repeat(30));
    results.details
      .filter(item => item.status === 'FIXABLE')
      .forEach(item => {
        console.log(`📦 ${item.name} (${item.id})`);
        console.log(`   Current: ${item.originalPath}`);
        console.log(`   Suggested: ${item.suggestedPath}`);
        console.log('');
      });
  }

  // Show invalid items with suggestions
  const invalidWithSuggestions = results.details.filter(item => 
    (item.status === 'INVALID' || item.status === 'NO_IMAGE') && 
    item.suggestions && item.suggestions.length > 0
  );

  if (invalidWithSuggestions.length > 0) {
    console.log('❌ INVALID IMAGES WITH SUGGESTIONS:');
    console.log('-'.repeat(40));
    invalidWithSuggestions.slice(0, 10).forEach(item => {
      console.log(`📦 ${item.name} (${item.id})`);
      if (item.originalPath) {
        console.log(`   Current: ${item.originalPath}`);
      }
      console.log(`   Suggestions:`);
      item.suggestions.forEach(suggestion => {
        console.log(`     - ${suggestion}`);
      });
      console.log('');
    });
    
    if (invalidWithSuggestions.length > 10) {
      console.log(`   ... and ${invalidWithSuggestions.length - 10} more`);
    }
  }

  // Show items with no images
  const noImageItems = results.details.filter(item => item.status === 'NO_IMAGE');
  if (noImageItems.length > 0) {
    console.log('📷 PRODUCTS WITHOUT IMAGES:');
    console.log('-'.repeat(30));
    noImageItems.slice(0, 5).forEach(item => {
      console.log(`📦 ${item.name} (${item.id})`);
    });
    if (noImageItems.length > 5) {
      console.log(`   ... and ${noImageItems.length - 5} more`);
    }
    console.log('');
  }

  // Save detailed report
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      total: results.total,
      valid: results.valid,
      invalid: results.invalid,
      fixed: results.fixed
    },
    details: results.details
  };

  fs.writeFileSync('image-validation-report.json', JSON.stringify(reportData, null, 2));
  console.log('💾 Detailed report saved to: image-validation-report.json');

  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  console.log('-'.repeat(20));
  
  if (results.fixed > 0) {
    console.log('1. Run the auto-fix script to update fixable image paths');
  }
  
  if (results.invalid > 0) {
    console.log('2. Review invalid images and add missing files to appropriate directories');
    console.log('3. Consider using the ImageValidationService in your React components');
  }
  
  console.log('4. Implement the ImageManager utility for better path resolution');
  console.log('5. Set up automated image validation in your build process');

  return results;
}

// Run validation
validateAllImages().catch(console.error);