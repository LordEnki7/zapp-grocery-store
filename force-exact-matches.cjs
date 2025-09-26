const fs = require('fs');
const path = require('path');

// Configuration
const PRODUCTS_FILE = './data/products/products.json';
const NEW_IMAGES_DIR = './sitephoto/New images';
const BACKUP_DIR = './data/products';

function createBackup(originalFile) {
    const timestamp = Date.now();
    const backupPath = path.join(BACKUP_DIR, `products_backup_force_exact_${timestamp}.json`);
    fs.copyFileSync(originalFile, backupPath);
    console.log(`✅ Backup created: ${backupPath}`);
    return backupPath;
}

function loadProducts() {
    const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
    return JSON.parse(data);
}

function getNewImages() {
    if (!fs.existsSync(NEW_IMAGES_DIR)) {
        console.error(`❌ Directory not found: ${NEW_IMAGES_DIR}`);
        return [];
    }
    
    return fs.readdirSync(NEW_IMAGES_DIR)
        .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
        .map(file => ({
            filename: file,
            nameWithoutExt: path.parse(file).name,
            fullPath: `/sitephoto/New images/${file}`
        }));
}

function findExactMatches(products, images) {
    const exactMatches = [];
    const usedImages = new Set();
    
    console.log(`\n🎯 FORCE EXACT MATCHING - Prioritizing exact name matches...`);
    console.log(`📦 Products to check: ${products.length}`);
    console.log(`🖼️  Available images: ${images.length}`);
    
    // List all available images for reference
    console.log(`\n📋 Available images:`);
    images.forEach(img => console.log(`   - ${img.nameWithoutExt} (${img.filename})`));
    
    // Find exact matches for ALL products (not just generic placeholders)
    for (const product of products) {
        for (const image of images) {
            if (usedImages.has(image.filename)) continue;
            
            // Check for exact match (case-insensitive)
            if (product.name.toLowerCase() === image.nameWithoutExt.toLowerCase()) {
                exactMatches.push({
                    product: {
                        id: product.id,
                        name: product.name,
                        currentImage: product.image
                    },
                    newImage: image.filename,
                    newImagePath: image.fullPath,
                    matchType: 'exact',
                    score: 1.0,
                    wasGeneric: product.image && (
                        product.image.includes('/images/products/G') || 
                        product.image.includes('/images/products/g')
                    )
                });
                
                usedImages.add(image.filename);
                console.log(`🎯 EXACT MATCH FOUND: "${product.name}" → "${image.filename}"`);
                console.log(`   Current image: ${product.image}`);
                console.log(`   New image: ${image.fullPath}`);
                console.log(`   Was generic: ${product.image && (product.image.includes('/images/products/G') || product.image.includes('/images/products/g')) ? 'YES' : 'NO'}`);
                break;
            }
        }
    }
    
    return {
        matches: exactMatches,
        unusedImages: images.filter(img => !usedImages.has(img.filename))
    };
}

function applyMatches(products, matches) {
    let updateCount = 0;
    const updates = [];
    
    console.log(`\n🔄 Applying ${matches.length} exact matches...`);
    
    for (const match of matches) {
        const productIndex = products.findIndex(p => p.id === match.product.id);
        if (productIndex !== -1) {
            const oldImage = products[productIndex].image;
            products[productIndex].image = match.newImagePath;
            
            updates.push({
                productId: match.product.id,
                productName: match.product.name,
                oldImage: oldImage,
                newImage: match.newImagePath,
                matchType: match.matchType,
                score: match.score,
                wasGeneric: match.wasGeneric
            });
            
            updateCount++;
            console.log(`✅ FORCED UPDATE: "${match.product.name}"`);
            console.log(`   FROM: ${oldImage}`);
            console.log(`   TO: ${match.newImagePath}`);
        }
    }
    
    return { updateCount, updates };
}

function saveReport(matches, updates, unusedImages) {
    const timestamp = Date.now();
    const report = {
        timestamp: new Date().toISOString(),
        policy: "EXACT_IMAGE_MATCHING_POLICY - Force exact matches over similarity",
        totalExactMatches: matches.length,
        successfulUpdates: updates.length,
        genericReplacements: updates.filter(u => u.wasGeneric).length,
        nonGenericReplacements: updates.filter(u => !u.wasGeneric).length,
        matches: matches,
        updates: updates,
        unusedImages: unusedImages.map(img => ({
            filename: img.filename,
            nameWithoutExt: img.nameWithoutExt,
            reason: "No exact product name match found"
        })),
        summary: {
            totalAvailableImages: matches.length + unusedImages.length,
            exactMatchRate: `${((matches.length / (matches.length + unusedImages.length)) * 100).toFixed(1)}%`,
            policyCompliance: "100% - All exact matches were prioritized"
        }
    };
    
    const reportPath = `force-exact-matches-report-${timestamp}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📊 Report saved: ${reportPath}`);
    return reportPath;
}

function main() {
    console.log('🚀 FORCE EXACT MATCHES - Following EXACT_IMAGE_MATCHING_POLICY\n');
    
    try {
        // Create backup
        const backupPath = createBackup(PRODUCTS_FILE);
        
        // Load data
        const products = loadProducts();
        const images = getNewImages();
        
        if (images.length === 0) {
            console.log('❌ No images found in the specified directory!');
            return;
        }
        
        // Find exact matches
        const { matches, unusedImages } = findExactMatches(products, images);
        
        if (matches.length === 0) {
            console.log('\n❌ No exact matches found!');
            console.log('\n🔍 Available images:');
            images.forEach(img => console.log(`   - ${img.nameWithoutExt}`));
            console.log('\n💡 Make sure product names exactly match image filenames (without extension)');
            return;
        }
        
        console.log(`\n🎯 Found ${matches.length} EXACT matches to apply`);
        
        // Apply updates
        const { updateCount, updates } = applyMatches(products, matches);
        
        // Save updated products
        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
        console.log(`\n✅ Updated ${updateCount} products in ${PRODUCTS_FILE}`);
        
        // Save report
        const reportPath = saveReport(matches, updates, unusedImages);
        
        // Summary
        console.log('\n📈 EXACT MATCH SUMMARY:');
        console.log(`   🎯 Exact matches applied: ${matches.length}`);
        console.log(`   🔄 Generic placeholders replaced: ${updates.filter(u => u.wasGeneric).length}`);
        console.log(`   🔄 Non-generic images replaced: ${updates.filter(u => !u.wasGeneric).length}`);
        console.log(`   📸 Unused images: ${unusedImages.length}`);
        console.log(`   💾 Backup: ${path.basename(backupPath)}`);
        console.log(`   📊 Report: ${path.basename(reportPath)}`);
        
        if (unusedImages.length > 0) {
            console.log('\n📸 Images without exact product name matches:');
            unusedImages.forEach(img => console.log(`   - ${img.nameWithoutExt} (${img.filename})`));
            console.log('\n💡 To use these images, ensure product names exactly match the image filenames');
        }
        
        console.log('\n✅ POLICY COMPLIANCE: 100% - All exact matches were prioritized over similarity matching');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

main();