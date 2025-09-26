const fs = require('fs');
const path = require('path');

// Configuration
const PRODUCTS_FILE = './data/products/products.json';
const NEW_IMAGES_DIR = './sitephoto/New images';
const BACKUP_DIR = './data/products';

function createBackup(originalFile) {
    const timestamp = Date.now();
    const backupPath = path.join(BACKUP_DIR, `products_backup_exact_match_${timestamp}.json`);
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
    const usedProducts = new Set();
    
    // Find products with generic placeholders
    const genericProducts = products.filter(product => 
        product.image && (
            product.image.includes('/images/products/G') || 
            product.image.includes('/images/products/g')
        )
    );
    
    console.log(`\n🔍 Looking for exact matches among ${genericProducts.length} products with generic placeholders...`);
    
    // First pass: Exact name matches
    for (const product of genericProducts) {
        if (usedProducts.has(product.id)) continue;
        
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
                    score: 1.0
                });
                
                usedImages.add(image.filename);
                usedProducts.add(product.id);
                console.log(`✅ EXACT MATCH: "${product.name}" → "${image.filename}"`);
                break;
            }
        }
    }
    
    // Second pass: Partial matches for remaining items
    for (const product of genericProducts) {
        if (usedProducts.has(product.id)) continue;
        
        for (const image of images) {
            if (usedImages.has(image.filename)) continue;
            
            const productWords = product.name.toLowerCase().split(' ');
            const imageWords = image.nameWithoutExt.toLowerCase().split(' ');
            
            // Check if all product words are in image name or vice versa
            const productInImage = productWords.every(word => 
                imageWords.some(imgWord => imgWord.includes(word) || word.includes(imgWord))
            );
            
            const imageInProduct = imageWords.every(word => 
                productWords.some(prodWord => prodWord.includes(word) || word.includes(prodWord))
            );
            
            if (productInImage || imageInProduct) {
                const score = Math.max(
                    productWords.filter(word => imageWords.some(imgWord => imgWord.includes(word))).length / productWords.length,
                    imageWords.filter(word => productWords.some(prodWord => prodWord.includes(word))).length / imageWords.length
                );
                
                if (score >= 0.7) { // High confidence partial match
                    exactMatches.push({
                        product: {
                            id: product.id,
                            name: product.name,
                            currentImage: product.image
                        },
                        newImage: image.filename,
                        newImagePath: image.fullPath,
                        matchType: 'partial',
                        score: score
                    });
                    
                    usedImages.add(image.filename);
                    usedProducts.add(product.id);
                    console.log(`✅ PARTIAL MATCH: "${product.name}" → "${image.filename}" (score: ${score.toFixed(2)})`);
                    break;
                }
            }
        }
    }
    
    return {
        matches: exactMatches,
        unusedImages: images.filter(img => !usedImages.has(img.filename)),
        unmatchedProducts: genericProducts.filter(prod => !usedProducts.has(prod.id))
    };
}

function applyMatches(products, matches) {
    let updateCount = 0;
    const updates = [];
    
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
                score: match.score
            });
            
            updateCount++;
            console.log(`✅ Updated "${match.product.name}": ${oldImage} → ${match.newImagePath}`);
        }
    }
    
    return { updateCount, updates };
}

function saveReport(matches, updates, unusedImages, unmatchedProducts) {
    const timestamp = Date.now();
    const report = {
        timestamp: new Date().toISOString(),
        totalMatches: matches.length,
        exactMatches: matches.filter(m => m.matchType === 'exact').length,
        partialMatches: matches.filter(m => m.matchType === 'partial').length,
        successfulUpdates: updates.length,
        matches: matches,
        updates: updates,
        unusedImages: unusedImages.map(img => img.filename),
        unmatchedProducts: unmatchedProducts.map(p => ({
            id: p.id,
            name: p.name,
            currentImage: p.image
        })),
        summary: {
            totalAvailableImages: matches.length + unusedImages.length,
            totalGenericProducts: matches.length + unmatchedProducts.length,
            matchRate: `${((matches.length / (matches.length + unmatchedProducts.length)) * 100).toFixed(1)}%`
        }
    };
    
    const reportPath = `exact-match-report-${timestamp}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📊 Report saved: ${reportPath}`);
    return reportPath;
}

function main() {
    console.log('🚀 Starting Exact Match Image Replacement...\n');
    
    try {
        // Create backup
        const backupPath = createBackup(PRODUCTS_FILE);
        
        // Load data
        const products = loadProducts();
        const images = getNewImages();
        
        console.log(`📦 Loaded ${products.length} products`);
        console.log(`🖼️  Found ${images.length} new images`);
        
        // Find matches
        const { matches, unusedImages, unmatchedProducts } = findExactMatches(products, images);
        
        if (matches.length === 0) {
            console.log('\n❌ No matches found!');
            return;
        }
        
        console.log(`\n🎯 Found ${matches.length} matches:`);
        console.log(`   - ${matches.filter(m => m.matchType === 'exact').length} exact matches`);
        console.log(`   - ${matches.filter(m => m.matchType === 'partial').length} partial matches`);
        
        // Apply updates
        const { updateCount, updates } = applyMatches(products, matches);
        
        // Save updated products
        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
        console.log(`\n✅ Updated ${updateCount} products in ${PRODUCTS_FILE}`);
        
        // Save report
        const reportPath = saveReport(matches, updates, unusedImages, unmatchedProducts);
        
        // Summary
        console.log('\n📈 SUMMARY:');
        console.log(`   ✅ Successfully matched: ${matches.length} products`);
        console.log(`   📸 Unused images: ${unusedImages.length}`);
        console.log(`   🔍 Unmatched products: ${unmatchedProducts.length}`);
        console.log(`   💾 Backup: ${path.basename(backupPath)}`);
        console.log(`   📊 Report: ${path.basename(reportPath)}`);
        
        if (unusedImages.length > 0) {
            console.log('\n📸 Unused images:');
            unusedImages.forEach(img => console.log(`   - ${img.filename}`));
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

main();