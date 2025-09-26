const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, 'data', 'products', 'products.json');

function normalizeProductName(name) {
  return name.toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ')    // Normalize spaces
    .trim();
}

function findDuplicates() {
  try {
    const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
    
    console.log('🔍 ANALYZING PRODUCT CATALOG FOR DUPLICATES');
    console.log('==========================================');
    console.log(`Total products: ${products.length}`);
    
    // Group products by normalized name
    const nameGroups = {};
    const imageGroups = {};
    const duplicates = [];
    
    products.forEach(product => {
      const normalizedName = normalizeProductName(product.name);
      
      // Group by name
      if (!nameGroups[normalizedName]) {
        nameGroups[normalizedName] = [];
      }
      nameGroups[normalizedName].push(product);
      
      // Group by image
      if (product.image) {
        if (!imageGroups[product.image]) {
          imageGroups[product.image] = [];
        }
        imageGroups[product.image].push(product);
      }
    });
    
    console.log('\n📝 DUPLICATE NAMES FOUND:');
    let namesDuplicateCount = 0;
    Object.entries(nameGroups).forEach(([normalizedName, products]) => {
      if (products.length > 1) {
        namesDuplicateCount++;
        console.log(`\n${namesDuplicateCount}. "${normalizedName}" (${products.length} products):`);
        products.forEach(p => {
          console.log(`   - ID: ${p.id}, Name: "${p.name}", Image: ${p.image}, Created: ${p.createdBy || 'unknown'}`);
        });
        
        // Mark for deduplication (keep the original, remove newer ones)
        const sortedProducts = products.sort((a, b) => {
          // Prioritize products NOT created by integrator
          if (a.createdBy === 'unused-images-integrator' && b.createdBy !== 'unused-images-integrator') return 1;
          if (b.createdBy === 'unused-images-integrator' && a.createdBy !== 'unused-images-integrator') return -1;
          // Then by ID (lower ID = older)
          return parseInt(a.id) - parseInt(b.id);
        });
        
        // Keep first, mark others for removal
        for (let i = 1; i < sortedProducts.length; i++) {
          duplicates.push({
            type: 'name_duplicate',
            product: sortedProducts[i],
            reason: `Duplicate name of product ID ${sortedProducts[0].id}`,
            keepProduct: sortedProducts[0]
          });
        }
      }
    });
    
    console.log('\n🖼️  DUPLICATE IMAGES FOUND:');
    let imagesDuplicateCount = 0;
    Object.entries(imageGroups).forEach(([image, products]) => {
      if (products.length > 1) {
        imagesDuplicateCount++;
        console.log(`\n${imagesDuplicateCount}. "${image}" (${products.length} products):`);
        products.forEach(p => {
          console.log(`   - ID: ${p.id}, Name: "${p.name}", Created: ${p.createdBy || 'unknown'}`);
        });
        
        // Mark for deduplication (keep the original, remove newer ones)
        const sortedProducts = products.sort((a, b) => {
          // Prioritize products NOT created by integrator
          if (a.createdBy === 'unused-images-integrator' && b.createdBy !== 'unused-images-integrator') return 1;
          if (b.createdBy === 'unused-images-integrator' && a.createdBy !== 'unused-images-integrator') return -1;
          // Then by ID (lower ID = older)
          return parseInt(a.id) - parseInt(b.id);
        });
        
        // Keep first, mark others for removal
        for (let i = 1; i < sortedProducts.length; i++) {
          // Only add if not already marked for name duplicate
          const alreadyMarked = duplicates.some(d => d.product.id === sortedProducts[i].id);
          if (!alreadyMarked) {
            duplicates.push({
              type: 'image_duplicate',
              product: sortedProducts[i],
              reason: `Duplicate image of product ID ${sortedProducts[0].id}`,
              keepProduct: sortedProducts[0]
            });
          }
        }
      }
    });
    
    console.log('\n📊 SUMMARY:');
    console.log(`Name duplicates found: ${namesDuplicateCount}`);
    console.log(`Image duplicates found: ${imagesDuplicateCount}`);
    console.log(`Total products to remove: ${duplicates.length}`);
    
    if (duplicates.length > 0) {
      console.log('\n🗑️  PRODUCTS MARKED FOR REMOVAL:');
      duplicates.forEach((dup, index) => {
        console.log(`${index + 1}. ID: ${dup.product.id}, Name: "${dup.product.name}"`);
        console.log(`   Reason: ${dup.reason}`);
        console.log(`   Keep: ID ${dup.keepProduct.id} - "${dup.keepProduct.name}"`);
      });
    }
    
    // Save duplicate analysis report
    const report = {
      timestamp: new Date().toISOString(),
      totalProducts: products.length,
      namesDuplicateCount,
      imagesDuplicateCount,
      totalDuplicatesToRemove: duplicates.length,
      duplicates: duplicates.map(d => ({
        removeId: d.product.id,
        removeName: d.product.name,
        removeImage: d.product.image,
        removeCreatedBy: d.product.createdBy,
        keepId: d.keepProduct.id,
        keepName: d.keepProduct.name,
        reason: d.reason,
        type: d.type
      }))
    };
    
    const reportFile = path.join(__dirname, 'duplicate-analysis-report.json');
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`\n📄 Report saved: ${reportFile}`);
    
    if (duplicates.length === 0) {
      console.log('\n✅ No duplicates found! Catalog is clean.');
    } else {
      console.log(`\n⚠️  Found ${duplicates.length} duplicate products that should be removed.`);
    }
    
  } catch (error) {
    console.error('❌ Error analyzing duplicates:', error);
    process.exit(1);
  }
}

findDuplicates();