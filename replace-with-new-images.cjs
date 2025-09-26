const fs = require('fs');
const path = require('path');

// Paths
const productsPath = path.join(__dirname, 'data', 'products', 'products.json');
const matchingReportPath = 'image-matching-report-1758756852398.json';
const newImagesPath = 'C:\\Users\\proje\\OneDrive - JAS Receivership Group\\Documents\\Website Projects\\zapp-ecommerce\\sitephoto\\New images';

// Read the matching report
const matchingReport = JSON.parse(fs.readFileSync(matchingReportPath, 'utf8'));
const matches = matchingReport.matches;

// Read products data
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// Create backup
const backupPath = `products_backup_new_images_${Date.now()}.json`;
fs.writeFileSync(path.join('data', 'products', backupPath), JSON.stringify(products, null, 2));
console.log(`Backup created: ${backupPath}`);

// Apply the replacements
let updatedCount = 0;
const updateLog = [];

matches.forEach(match => {
    const productIndex = products.findIndex(p => p.id === match.product.id);
    
    if (productIndex !== -1) {
        const product = products[productIndex];
        const oldImage = product.image || product.primaryImage;
        const newImagePath = `/sitephoto/New images/${match.newImage}`;
        
        // Update the image path
        if (product.image) {
            product.image = newImagePath;
        }
        if (product.primaryImage) {
            product.primaryImage = newImagePath;
        }
        
        updatedCount++;
        updateLog.push({
            productId: product.id,
            productName: product.name,
            oldImage: oldImage,
            newImage: newImagePath,
            matchScore: match.score
        });
        
        console.log(`✓ Updated ${product.name} (${product.id})`);
        console.log(`  From: ${oldImage}`);
        console.log(`  To: ${newImagePath}`);
        console.log(`  Match Score: ${match.score.toFixed(3)}`);
        console.log('');
    } else {
        console.log(`⚠ Product ${match.product.id} not found in products array`);
    }
});

// Save updated products
fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));

// Create update report
const updateReport = {
    timestamp: new Date().toISOString(),
    backupFile: backupPath,
    totalMatches: matches.length,
    successfulUpdates: updatedCount,
    updates: updateLog,
    summary: {
        beforeGenericPlaceholders: matchingReport.totalGenericPlaceholders,
        afterGenericPlaceholders: matchingReport.totalGenericPlaceholders - updatedCount,
        reductionCount: updatedCount,
        reductionPercentage: ((updatedCount / matchingReport.totalGenericPlaceholders) * 100).toFixed(1)
    }
};

const updateReportPath = `new-images-update-report-${Date.now()}.json`;
fs.writeFileSync(updateReportPath, JSON.stringify(updateReport, null, 2));

console.log('='.repeat(50));
console.log('UPDATE SUMMARY');
console.log('='.repeat(50));
console.log(`Successfully updated ${updatedCount} products`);
console.log(`Generic placeholders reduced from ${matchingReport.totalGenericPlaceholders} to ${matchingReport.totalGenericPlaceholders - updatedCount}`);
console.log(`Reduction: ${updatedCount} products (${updateReport.summary.reductionPercentage}%)`);
console.log(`Backup saved as: ${backupPath}`);
console.log(`Update report saved as: ${updateReportPath}`);