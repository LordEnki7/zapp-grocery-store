const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, 'data', 'products', 'products.json');
const DUPLICATE_REPORT = path.join(__dirname, 'duplicate-analysis-report.json');

async function removeDuplicates() {
  try {
    console.log('🧹 REMOVING DUPLICATE PRODUCTS');
    console.log('==============================');
    
    // Load current products
    const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
    console.log(`📊 Current products count: ${products.length}`);
    
    // Load duplicate analysis report
    const duplicateReport = JSON.parse(fs.readFileSync(DUPLICATE_REPORT, 'utf8'));
    const duplicatesToRemove = duplicateReport.duplicates;
    console.log(`🗑️  Products to remove: ${duplicatesToRemove.length}`);
    
    // Create set of IDs to remove
    const idsToRemove = new Set(duplicatesToRemove.map(d => d.removeId));
    
    // Filter out duplicate products
    const cleanedProducts = products.filter(product => !idsToRemove.has(product.id));
    
    console.log(`✨ Products after cleanup: ${cleanedProducts.length}`);
    console.log(`🗑️  Products removed: ${products.length - cleanedProducts.length}`);
    
    // Create backup before cleanup
    const backupFile = PRODUCTS_FILE.replace('.json', '_backup_before_deduplication.json');
    fs.writeFileSync(backupFile, JSON.stringify(products, null, 2));
    console.log(`💾 Backup created: ${backupFile}`);
    
    // Write cleaned products
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(cleanedProducts, null, 2));
    console.log(`📝 Updated products file with ${cleanedProducts.length} products`);
    
    // Generate cleanup report
    const cleanupReport = {
      timestamp: new Date().toISOString(),
      originalProductCount: products.length,
      duplicatesRemoved: products.length - cleanedProducts.length,
      finalProductCount: cleanedProducts.length,
      removedProducts: duplicatesToRemove.map(d => ({
        id: d.removeId,
        name: d.removeName,
        reason: d.reason,
        keptProduct: {
          id: d.keepId,
          name: d.keepName
        }
      })),
      backupFile: backupFile
    };
    
    const reportFile = path.join(__dirname, 'deduplication-report.json');
    fs.writeFileSync(reportFile, JSON.stringify(cleanupReport, null, 2));
    console.log(`📊 Cleanup report saved: ${reportFile}`);
    
    console.log('\n🎉 DEDUPLICATION COMPLETE!');
    console.log(`✅ Removed ${products.length - cleanedProducts.length} duplicate products`);
    console.log(`✅ Preserved ${cleanedProducts.length} unique products`);
    console.log(`✅ No duplicates policy restored`);
    console.log(`✅ Backup created: ${path.basename(backupFile)}`);
    
    // Show some examples of what was removed
    console.log('\n📋 EXAMPLES OF REMOVED DUPLICATES:');
    duplicatesToRemove.slice(0, 10).forEach((dup, index) => {
      console.log(`${index + 1}. Removed: "${dup.removeName}" (ID: ${dup.removeId})`);
      console.log(`   Kept: "${dup.keepName}" (ID: ${dup.keepId})`);
    });
    
    if (duplicatesToRemove.length > 10) {
      console.log(`   ... and ${duplicatesToRemove.length - 10} more duplicates`);
    }
    
  } catch (error) {
    console.error('❌ Error removing duplicates:', error);
    process.exit(1);
  }
}

removeDuplicates();