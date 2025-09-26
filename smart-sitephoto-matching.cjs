const fs = require('fs');
const path = require('path');

// Load products data
const productsPath = path.join(__dirname, 'data', 'products', 'products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

console.log('🎯 Smart Sitephoto Matching - Applying Reusable Images\n');

// Define the smart matches based on our analysis
const smartMatches = [
    {
        productName: 'Premium Wafers',
        sitephotoPath: '/sitephoto/Cookies/BelVita_Crunchy.png',
        reason: 'Wafers are similar to cookies/biscuits'
    },
    {
        productName: 'Organic Biscuits',
        sitephotoPath: '/sitephoto/Cookies/BelVita_Crunchy.png',
        reason: 'Biscuits are essentially cookies'
    }
];

// Find and update matching products
let updatedCount = 0;
const updateReport = [];

console.log('🔍 Looking for products to update...\n');

smartMatches.forEach(match => {
    const product = products.find(p => 
        p.name === match.productName && 
        p.primaryImage && 
        p.primaryImage.includes('/images/products/G')
    );
    
    if (product) {
        const oldImage = product.primaryImage;
        
        // Verify the sitephoto file exists
        const sitephotoFullPath = path.join(__dirname, match.sitephotoPath.replace('/sitephoto/', 'sitephoto/'));
        if (fs.existsSync(sitephotoFullPath)) {
            // Update the product
            product.images = [match.sitephotoPath];
            product.primaryImage = match.sitephotoPath;
            product.updatedAt = new Date().toISOString();
            product.updatedBy = 'smart-sitephoto-matching';
            
            updateReport.push({
                productId: product.id,
                productName: product.name,
                oldImage: oldImage,
                newImage: match.sitephotoPath,
                reason: match.reason,
                success: true
            });
            
            console.log(`✅ Updated "${product.name}"`);
            console.log(`   From: ${oldImage}`);
            console.log(`   To: ${match.sitephotoPath}`);
            console.log(`   Reason: ${match.reason}\n`);
            
            updatedCount++;
        } else {
            console.log(`❌ Sitephoto file not found: ${sitephotoFullPath}`);
            updateReport.push({
                productId: product.id,
                productName: product.name,
                oldImage: oldImage,
                newImage: match.sitephotoPath,
                reason: match.reason,
                success: false,
                error: 'Sitephoto file not found'
            });
        }
    } else {
        console.log(`⚠️ Product not found or already updated: ${match.productName}`);
        updateReport.push({
            productName: match.productName,
            newImage: match.sitephotoPath,
            reason: match.reason,
            success: false,
            error: 'Product not found or already has sitephoto'
        });
    }
});

if (updatedCount > 0) {
    // Create backup before saving
    const backupPath = path.join(__dirname, 'data', 'products', `products_backup_smart_matching_${Date.now()}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(products, null, 2));
    console.log(`💾 Backup created: ${backupPath}`);
    
    // Save updated products
    fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
    console.log(`💾 Products updated successfully!`);
}

// Count remaining generic placeholders
const remainingGeneric = products.filter(product => 
    product.primaryImage && product.primaryImage.includes('/images/products/G')
).length;

// Create comprehensive report
const report = {
    timestamp: new Date().toISOString(),
    script: 'smart-sitephoto-matching.cjs',
    summary: {
        totalProducts: products.length,
        matchesAttempted: smartMatches.length,
        productsUpdated: updatedCount,
        remainingGenericPlaceholders: remainingGeneric,
        successRate: `${updatedCount}/${smartMatches.length} (${Math.round(updatedCount / smartMatches.length * 100)}%)`
    },
    smartMatches: smartMatches,
    updateReport: updateReport,
    remainingGenericProducts: products
        .filter(p => p.primaryImage && p.primaryImage.includes('/images/products/G'))
        .map(p => ({
            id: p.id,
            name: p.name,
            currentImage: p.primaryImage
        }))
};

const reportPath = path.join(__dirname, `smart-matching-report-${Date.now()}.json`);
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log(`\n📊 Smart Matching Complete!`);
console.log(`✅ Products updated: ${updatedCount}`);
console.log(`📉 Generic placeholders reduced from ${remainingGeneric + updatedCount} to ${remainingGeneric}`);
console.log(`📄 Report saved: ${reportPath}`);

if (remainingGeneric > 0) {
    console.log(`\n⚠️ ${remainingGeneric} generic placeholders still remain`);
    console.log('These products need new sitephoto images to be sourced/created.');
} else {
    console.log('\n🎉 All generic placeholders have been replaced!');
}

console.log('\n✨ Smart matching process complete!');