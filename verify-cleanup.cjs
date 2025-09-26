const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, 'data', 'products', 'products.json');

function normalizeProductName(name) {
  return name.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function verifyCleanup() {
  try {
    console.log('🔍 VERIFYING CATALOG CLEANUP');
    console.log('============================');
    
    // Load current products
    const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
    console.log(`📊 Total products in catalog: ${products.length}`);
    
    // Check for duplicate names
    const nameMap = new Map();
    const duplicateNames = [];
    
    products.forEach(product => {
      const normalizedName = normalizeProductName(product.name);
      if (nameMap.has(normalizedName)) {
        duplicateNames.push({
          name: product.name,
          normalizedName,
          products: [nameMap.get(normalizedName), product]
        });
      } else {
        nameMap.set(normalizedName, product);
      }
    });
    
    // Check for duplicate images
    const imageMap = new Map();
    const duplicateImages = [];
    
    products.forEach(product => {
      if (product.image) {
        if (imageMap.has(product.image)) {
          duplicateImages.push({
            image: product.image,
            products: [imageMap.get(product.image), product]
          });
        } else {
          imageMap.set(product.image, product);
        }
      }
    });
    
    // Generate verification report
    const verificationReport = {
      timestamp: new Date().toISOString(),
      totalProducts: products.length,
      duplicateNames: duplicateNames.length,
      duplicateImages: duplicateImages.length,
      isClean: duplicateNames.length === 0 && duplicateImages.length === 0,
      duplicateNameDetails: duplicateNames,
      duplicateImageDetails: duplicateImages,
      productsByCategory: {}
    };
    
    // Count products by category
    products.forEach(product => {
      const category = product.category || 'Uncategorized';
      verificationReport.productsByCategory[category] = 
        (verificationReport.productsByCategory[category] || 0) + 1;
    });
    
    // Save verification report
    const reportFile = path.join(__dirname, 'cleanup-verification-report.json');
    fs.writeFileSync(reportFile, JSON.stringify(verificationReport, null, 2));
    
    console.log('\n📋 VERIFICATION RESULTS:');
    console.log(`✅ Total products: ${products.length}`);
    console.log(`🔍 Duplicate names found: ${duplicateNames.length}`);
    console.log(`🔍 Duplicate images found: ${duplicateImages.length}`);
    
    if (verificationReport.isClean) {
      console.log('\n🎉 CATALOG IS CLEAN!');
      console.log('✅ No duplicate products found');
      console.log('✅ No duplicate policy violations');
      console.log('✅ All products are unique');
    } else {
      console.log('\n⚠️  DUPLICATES STILL EXIST:');
      
      if (duplicateNames.length > 0) {
        console.log(`\n🔍 DUPLICATE NAMES (${duplicateNames.length}):`);
        duplicateNames.forEach((dup, index) => {
          console.log(`${index + 1}. "${dup.name}"`);
          dup.products.forEach(p => {
            console.log(`   - ID: ${p.id}, Category: ${p.category}`);
          });
        });
      }
      
      if (duplicateImages.length > 0) {
        console.log(`\n🔍 DUPLICATE IMAGES (${duplicateImages.length}):`);
        duplicateImages.forEach((dup, index) => {
          console.log(`${index + 1}. "${dup.image}"`);
          dup.products.forEach(p => {
            console.log(`   - ID: ${p.id}, Name: ${p.name}`);
          });
        });
      }
    }
    
    console.log('\n📊 PRODUCTS BY CATEGORY:');
    Object.entries(verificationReport.productsByCategory)
      .sort(([,a], [,b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`   ${category}: ${count} products`);
      });
    
    console.log(`\n📄 Verification report saved: ${reportFile}`);
    
    return verificationReport.isClean;
    
  } catch (error) {
    console.error('❌ Error verifying cleanup:', error);
    process.exit(1);
  }
}

verifyCleanup();