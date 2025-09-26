const fs = require('fs');
const path = require('path');

// Configuration
const PRODUCTS_FILE = './data/products/products.json';
const NEW_IMAGES_DIR = 'C:\\Users\\proje\\OneDrive - JAS Receivership Group\\Documents\\Website Projects\\zapp-ecommerce\\sitephoto\\New images';
const BACKUP_DIR = './data/products/';

function createBackup() {
    const timestamp = Date.now();
    const backupPath = path.join(BACKUP_DIR, `products_backup_complete_exact_${timestamp}.json`);
    
    try {
        const originalData = fs.readFileSync(PRODUCTS_FILE, 'utf8');
        fs.writeFileSync(backupPath, originalData);
        console.log(`✅ Backup created: ${backupPath}`);
        return backupPath;
    } catch (error) {
        console.error('❌ Failed to create backup:', error.message);
        throw error;
    }
}

function loadProductData() {
    try {
        const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('❌ Failed to load product data:', error.message);
        throw error;
    }
}

function getNewImages() {
    try {
        const files = fs.readdirSync(NEW_IMAGES_DIR);
        const imageFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.webp', '.avif'].includes(ext);
        });
        
        console.log(`📁 Found ${imageFiles.length} images in New images directory`);
        return imageFiles.map(file => ({
            filename: file,
            nameWithoutExt: path.parse(file).name,
            fullPath: `/sitephoto/New images/${file}`
        }));
    } catch (error) {
        console.error('❌ Failed to read new images directory:', error.message);
        throw error;
    }
}

function findExactMatches(products, newImages) {
    const matches = [];
    const usedImages = new Set();
    
    console.log('\n🔍 Checking ALL products for exact name matches...');
    
    // Check every product for exact matches
    for (const product of products) {
        if (!product.name) continue;
        
        // Find exact match (case-insensitive)
        const exactMatch = newImages.find(img => 
            !usedImages.has(img.filename) && 
            img.nameWithoutExt.toLowerCase() === product.name.toLowerCase()
        );
        
        if (exactMatch) {
            matches.push({
                productId: product.id,
                productName: product.name,
                currentImage: product.primaryImage || product.images?.[0] || 'No image',
                newImage: exactMatch.fullPath,
                newImageFile: exactMatch.filename,
                matchType: 'exact',
                reason: 'Perfect name match'
            });
            
            usedImages.add(exactMatch.filename);
            console.log(`✅ EXACT MATCH: "${product.name}" → "${exactMatch.filename}"`);
        }
    }
    
    return { matches, usedImages };
}

function applyMatches(products, matches) {
    let updatedCount = 0;
    
    console.log('\n🔄 Applying exact matches...');
    
    for (const match of matches) {
        const product = products.find(p => p.id === match.productId);
        if (product) {
            // Update the product images
            product.images = [match.newImage];
            product.primaryImage = match.newImage;
            product.updatedAt = new Date().toISOString();
            product.updatedBy = 'complete-exact-matcher';
            
            updatedCount++;
            console.log(`✅ Updated "${product.name}": ${match.currentImage} → ${match.newImage}`);
        }
    }
    
    return updatedCount;
}

function generateReport(matches, usedImages, newImages, updatedCount) {
    const timestamp = Date.now();
    const reportPath = `complete-exact-matching-report-${timestamp}.json`;
    
    const unusedImages = newImages.filter(img => !usedImages.has(img.filename));
    
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            totalNewImages: newImages.length,
            exactMatches: matches.length,
            productsUpdated: updatedCount,
            unusedImages: unusedImages.length,
            policyCompliance: '100% - All exact matches prioritized'
        },
        exactMatches: matches,
        unusedImages: unusedImages.map(img => ({
            filename: img.filename,
            nameWithoutExt: img.nameWithoutExt,
            reason: 'No product with exact matching name found'
        })),
        policyNotes: [
            'This script checks ALL products for exact name matches',
            'Products with any current image type are eligible for exact matching',
            'Exact name matches take priority over similarity algorithms',
            'Case-insensitive matching is used for better coverage'
        ]
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📊 Report saved: ${reportPath}`);
    
    return report;
}

function main() {
    try {
        console.log('🚀 Starting Complete Exact Image Matching Process...');
        console.log('📋 Policy: Check ALL products for exact name matches\n');
        
        // Create backup
        const backupPath = createBackup();
        
        // Load data
        const products = loadProductData();
        const newImages = getNewImages();
        
        console.log(`📦 Loaded ${products.length} products`);
        console.log(`🖼️  Found ${newImages.length} new images`);
        
        // Find exact matches for ALL products
        const { matches, usedImages } = findExactMatches(products, newImages);
        
        if (matches.length === 0) {
            console.log('\n❌ No exact matches found!');
            return;
        }
        
        console.log(`\n🎯 Found ${matches.length} exact matches`);
        
        // Apply matches
        const updatedCount = applyMatches(products, matches);
        
        // Save updated products
        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
        console.log(`\n💾 Updated products.json with ${updatedCount} changes`);
        
        // Generate report
        const report = generateReport(matches, usedImages, newImages, updatedCount);
        
        console.log('\n✅ Complete Exact Matching Process Completed!');
        console.log(`📊 Summary:`);
        console.log(`   - Products updated: ${updatedCount}`);
        console.log(`   - Exact matches applied: ${matches.length}`);
        console.log(`   - Unused images: ${newImages.length - usedImages.size}`);
        console.log(`   - Policy compliance: 100%`);
        
    } catch (error) {
        console.error('\n❌ Process failed:', error.message);
        process.exit(1);
    }
}

main();