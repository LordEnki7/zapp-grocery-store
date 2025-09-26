const fs = require('fs');
const path = require('path');

// Load products data
const productsPath = path.join(__dirname, 'data', 'products', 'products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// Scan sitephoto directory
const sitephotoDir = path.join(__dirname, 'public', 'sitephoto');

function scanSitephotoDirectory(dir) {
    const images = [];
    
    function scanRecursive(currentDir) {
        const items = fs.readdirSync(currentDir);
        
        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                scanRecursive(fullPath);
            } else if (item.match(/\.(jpg|jpeg|png|webp)$/i)) {
                const relativePath = path.relative(path.join(__dirname, 'public'), fullPath).replace(/\\/g, '/');
                images.push({
                    path: '/' + relativePath,
                    filename: item,
                    category: path.basename(path.dirname(fullPath))
                });
            }
        }
    }
    
    if (fs.existsSync(dir)) {
        scanRecursive(dir);
    }
    
    return images;
}

// Enhanced matching function with more aggressive strategies
function findBestMatch(productName, productCategory, availableImages) {
    const normalizedName = productName.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    const nameWords = normalizedName.split(/\s+/).filter(word => word.length > 2);
    
    let bestMatch = null;
    let bestScore = 0;
    
    for (const image of availableImages) {
        const imageName = image.filename.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\.(jpg|jpeg|png|webp)$/i, '');
        const imageCategory = image.category.toLowerCase();
        let score = 0;
        
        // Strategy 1: Exact name match
        if (imageName === normalizedName) {
            score = 100;
        }
        
        // Strategy 2: Category + partial name match
        if (imageCategory.includes(normalizedName) || normalizedName.includes(imageCategory)) {
            score = Math.max(score, 80);
        }
        
        // Strategy 3: Word matching with higher threshold
        let wordMatches = 0;
        for (const word of nameWords) {
            if (imageName.includes(word) || imageCategory.includes(word)) {
                wordMatches++;
            }
        }
        if (wordMatches > 0) {
            score = Math.max(score, (wordMatches / nameWords.length) * 70);
        }
        
        // Strategy 4: Fuzzy matching for common product types
        const productTypes = {
            'gift card': ['gift', 'card'],
            'protein': ['protein', 'whey'],
            'vitamin': ['vitamin', 'supplement'],
            'oil': ['oil'],
            'sauce': ['sauce'],
            'cereal': ['cereal', 'breakfast'],
            'candy': ['candy', 'sweet'],
            'cheese': ['cheese'],
            'beans': ['beans', 'bean'],
            'first aid': ['first', 'aid', 'medical'],
            'blood pressure': ['blood', 'pressure', 'monitor'],
            'thermometer': ['thermometer', 'temperature']
        };
        
        for (const [type, keywords] of Object.entries(productTypes)) {
            if (normalizedName.includes(type.replace(' ', ''))) {
                const keywordMatches = keywords.filter(keyword => 
                    imageName.includes(keyword) || imageCategory.includes(keyword)
                ).length;
                if (keywordMatches > 0) {
                    score = Math.max(score, 60 + (keywordMatches * 10));
                }
            }
        }
        
        // Strategy 5: Brand matching
        const commonBrands = ['organic', 'premium', 'natural', 'fresh', 'pure', 'artisan'];
        for (const brand of commonBrands) {
            if (normalizedName.includes(brand) && (imageName.includes(brand) || imageCategory.includes(brand))) {
                score = Math.max(score, 50);
            }
        }
        
        if (score > bestScore && score >= 40) { // Lower threshold for final cleanup
            bestScore = score;
            bestMatch = image;
        }
    }
    
    return { match: bestMatch, confidence: bestScore };
}

// Main processing
console.log('🔍 Starting final generic placeholder cleanup...');

const availableImages = scanSitephotoDirectory(sitephotoDir);
console.log(`📸 Found ${availableImages.length} available sitephoto images`);

// Find products with generic placeholders
const genericProducts = products.filter(product => 
    product.primaryImage && product.primaryImage.match(/\/images\/products\/[gG][0-9]+\.png$/)
);

console.log(`🎯 Found ${genericProducts.length} products with generic placeholders`);

const updates = [];
const skipped = [];

for (const product of genericProducts) {
    const result = findBestMatch(product.name, product.category, availableImages);
    
    if (result.match && result.confidence >= 40) {
        const oldImage = product.primaryImage;
        product.primaryImage = result.match.path;
        
        updates.push({
            productId: product.id,
            productName: product.name,
            oldImage,
            newImage: result.match.path,
            confidence: result.confidence,
            matchedCategory: result.match.category
        });
        
        console.log(`✅ Updated "${product.name}" (${result.confidence.toFixed(1)}% confidence)`);
    } else {
        skipped.push({
            productId: product.id,
            productName: product.name,
            currentImage: product.primaryImage,
            reason: result.confidence > 0 ? `Low confidence (${result.confidence.toFixed(1)}%)` : 'No suitable match found'
        });
        
        console.log(`⏭️  Skipped "${product.name}" - ${result.confidence > 0 ? `Low confidence (${result.confidence.toFixed(1)}%)` : 'No match'}`);
    }
}

// Create backup
const backupPath = path.join(__dirname, 'data', 'products', `products_backup_final_cleanup_${Date.now()}.json`);
fs.writeFileSync(backupPath, JSON.stringify(products, null, 2));

// Save updated products
fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));

// Generate report
const report = {
    timestamp: new Date().toISOString(),
    summary: {
        totalProcessed: genericProducts.length,
        updated: updates.length,
        skipped: skipped.length,
        remainingGenerics: skipped.length
    },
    updates,
    skipped,
    backupFile: path.basename(backupPath)
};

const reportPath = path.join(__dirname, `final-cleanup-report-${Date.now()}.json`);
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log('\n📊 Final Cleanup Summary:');
console.log(`   • Processed: ${genericProducts.length} products`);
console.log(`   • Updated: ${updates.length} products`);
console.log(`   • Skipped: ${skipped.length} products`);
console.log(`   • Remaining generics: ${skipped.length}`);
console.log(`\n💾 Backup created: ${path.basename(backupPath)}`);
console.log(`📋 Report saved: ${path.basename(reportPath)}`);

if (updates.length > 0) {
    console.log('\n🎉 Final cleanup completed successfully!');
} else {
    console.log('\n⚠️  No additional matches found with current criteria.');
}