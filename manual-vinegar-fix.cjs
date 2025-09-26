const fs = require('fs');
const path = require('path');

// Load products data
const productsPath = path.join(__dirname, 'data', 'products', 'products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

console.log('🔍 Looking for vinegar products...');

// Find products that could use the Apple Cider Vinegar image
const vinegar_candidates = products.filter(product => {
    const hasGenericImage = product.primaryImage && product.primaryImage.includes('/images/products/G');
    const isVinegarRelated = product.name.toLowerCase().includes('vinegar');
    return hasGenericImage && isVinegarRelated;
});

console.log(`Found ${vinegar_candidates.length} vinegar products with generic images:`);
vinegar_candidates.forEach(product => {
    console.log(`- ${product.name} (ID: ${product.id}) - Current: ${product.primaryImage}`);
});

if (vinegar_candidates.length > 0) {
    // Create backup
    const backupPath = path.join(__dirname, 'data', 'products', `products_backup_vinegar_fix_${Date.now()}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(products, null, 2));
    console.log(`✅ Backup created: ${backupPath}`);

    // Update vinegar products to use the Apple Cider Vinegar image
    const appleVinegarImage = '/sitephoto/Apple Cider Viniger/North_Coast_Organic Raw_ Apple_Cider_Vinegar.png';
    
    let updatedCount = 0;
    vinegar_candidates.forEach(product => {
        // Update the product
        product.images = [appleVinegarImage];
        product.primaryImage = appleVinegarImage;
        product.updatedAt = new Date().toISOString();
        product.updatedBy = 'manual-vinegar-fix';
        
        console.log(`✅ Updated ${product.name} to use Apple Cider Vinegar image`);
        updatedCount++;
    });

    // Save updated products
    fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
    console.log(`\n🎉 Successfully updated ${updatedCount} vinegar products!`);
    
    // Create report
    const report = {
        timestamp: new Date().toISOString(),
        script: 'manual-vinegar-fix.cjs',
        totalProductsProcessed: products.length,
        vinegarProductsFound: vinegar_candidates.length,
        productsUpdated: updatedCount,
        imageUsed: appleVinegarImage,
        updatedProducts: vinegar_candidates.map(p => ({
            id: p.id,
            name: p.name,
            previousImage: '/images/products/G137.png', // assuming this was the generic
            newImage: appleVinegarImage
        }))
    };
    
    const reportPath = path.join(__dirname, `vinegar-fix-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📊 Report saved: ${reportPath}`);
    
} else {
    console.log('ℹ️ No vinegar products with generic images found.');
}

console.log('\n✨ Vinegar fix complete!');