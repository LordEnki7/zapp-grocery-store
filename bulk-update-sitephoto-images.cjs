const fs = require('fs');
const path = require('path');

// Load the products and matches data
const productsPath = path.join(__dirname, 'data', 'products', 'products.json');
const matchesPath = path.join(__dirname, 'sitephoto-matches-report.json');

console.log('🔄 Loading product catalog and sitephoto matches...');

let products, matchesData;
try {
    products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    matchesData = JSON.parse(fs.readFileSync(matchesPath, 'utf8'));
} catch (error) {
    console.error('❌ Error loading data files:', error.message);
    process.exit(1);
}

console.log(`📊 Loaded ${products.length} products and ${matchesData.matches.length} potential matches`);

// Create backup before making changes
const backupPath = path.join(__dirname, `products_backup_before_sitephoto_update_${Date.now()}.json`);
fs.writeFileSync(backupPath, JSON.stringify(products, null, 2));
console.log(`💾 Created backup: ${path.basename(backupPath)}`);

// Track updates
const updateReport = {
    timestamp: new Date().toISOString(),
    totalProducts: products.length,
    totalMatches: matchesData.matches.length,
    updates: [],
    skipped: [],
    errors: []
};

// Process matches by confidence level
const highConfidenceMatches = matchesData.matches.filter(match => match.confidence === 'high');
const lowConfidenceMatches = matchesData.matches.filter(match => match.confidence === 'low');

console.log(`\n🎯 Processing ${highConfidenceMatches.length} high-confidence matches...`);

// Update high-confidence matches
highConfidenceMatches.forEach(match => {
    const productIndex = products.findIndex(p => p.id === match.product.id);
    
    if (productIndex === -1) {
        updateReport.errors.push({
            productId: match.product.id,
            error: 'Product not found in catalog'
        });
        return;
    }

    const product = products[productIndex];
    const oldImage = product.image;
    const newImage = match.suggestedImage.sitephotoPath;

    // Verify the sitephoto file exists
    const fullImagePath = path.join(__dirname, 'sitephoto', match.suggestedImage.relativePath);
    if (!fs.existsSync(fullImagePath)) {
        updateReport.errors.push({
            productId: match.product.id,
            productName: product.name,
            error: `Sitephoto file not found: ${fullImagePath}`
        });
        return;
    }

    // Update the product
    products[productIndex].image = newImage;
    
    updateReport.updates.push({
        productId: product.id,
        productName: product.name,
        category: product.category,
        oldImage: oldImage,
        newImage: newImage,
        matchScore: match.matchScore,
        confidence: match.confidence,
        sitephotoCategory: match.suggestedImage.category
    });

    console.log(`✅ Updated "${product.name}" (${product.id}): ${oldImage ? path.basename(oldImage) : 'no-image'} → ${path.basename(newImage)}`);
});

console.log(`\n🔍 Processing ${lowConfidenceMatches.length} low-confidence matches (manual review recommended)...`);

// For low-confidence matches, we'll be more selective
lowConfidenceMatches.forEach(match => {
    const productIndex = products.findIndex(p => p.id === match.product.id);
    
    if (productIndex === -1) {
        updateReport.errors.push({
            productId: match.product.id,
            error: 'Product not found in catalog'
        });
        return;
    }

    const product = products[productIndex];
    
    // Only update low-confidence matches with score >= 80 or exact name matches
    const shouldUpdate = match.matchScore >= 80 || 
                        product.name.toLowerCase().includes(match.suggestedImage.filename.toLowerCase().replace(/\.[^/.]+$/, ""));

    if (shouldUpdate) {
        const oldImage = product.image;
        const newImage = match.suggestedImage.sitephotoPath;

        // Verify the sitephoto file exists
        const fullImagePath = path.join(__dirname, 'sitephoto', match.suggestedImage.relativePath);
        if (!fs.existsSync(fullImagePath)) {
            updateReport.errors.push({
                productId: match.product.id,
                productName: product.name,
                error: `Sitephoto file not found: ${fullImagePath}`
            });
            return;
        }

        // Update the product
        products[productIndex].image = newImage;
        
        updateReport.updates.push({
            productId: product.id,
            productName: product.name,
            category: product.category,
            oldImage: oldImage,
            newImage: newImage,
            matchScore: match.matchScore,
            confidence: match.confidence,
            sitephotoCategory: match.suggestedImage.category
        });

        console.log(`✅ Updated "${product.name}" (${product.id}): ${oldImage ? path.basename(oldImage) : 'no-image'} → ${path.basename(newImage)}`);
    } else {
        updateReport.skipped.push({
            productId: product.id,
            productName: product.name,
            reason: `Low confidence match (score: ${match.matchScore})`,
            suggestedImage: match.suggestedImage.filename
        });
        console.log(`⏭️  Skipped "${product.name}" (low confidence: ${match.matchScore})`);
    }
});

// Save updated products
fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));

// Generate and save report
const reportPath = path.join(__dirname, `sitephoto-update-report-${Date.now()}.json`);
fs.writeFileSync(reportPath, JSON.stringify(updateReport, null, 2));

// Summary
console.log('\n📋 BULK UPDATE SUMMARY');
console.log('═'.repeat(50));
console.log(`✅ Successfully updated: ${updateReport.updates.length} products`);
console.log(`⏭️  Skipped: ${updateReport.skipped.length} products`);
console.log(`❌ Errors: ${updateReport.errors.length} products`);
console.log(`💾 Backup created: ${path.basename(backupPath)}`);
console.log(`📊 Report saved: ${path.basename(reportPath)}`);

if (updateReport.updates.length > 0) {
    console.log('\n🎯 UPDATED PRODUCTS:');
    updateReport.updates.forEach(update => {
        console.log(`  • ${update.productName} (${update.productId})`);
        console.log(`    ${update.oldImage} → ${update.newImage}`);
        console.log(`    Confidence: ${update.confidence}, Score: ${update.matchScore}`);
    });
}

if (updateReport.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    updateReport.errors.forEach(error => {
        console.log(`  • ${error.productName || error.productId}: ${error.error}`);
    });
}

console.log('\n🎉 Bulk sitephoto image update completed!');
console.log(`📈 Image quality improved for ${updateReport.updates.length} products`);