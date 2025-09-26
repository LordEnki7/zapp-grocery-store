const fs = require('fs');
const path = require('path');

// Paths
const productsPath = path.join(__dirname, 'data', 'products', 'products.json');
const newImagesPath = 'C:\\Users\\proje\\OneDrive - JAS Receivership Group\\Documents\\Website Projects\\zapp-ecommerce\\sitephoto\\New images';

// Read products data
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// Get products with generic placeholders
const genericPlaceholders = products.filter(product => {
    const image = product.image || product.primaryImage || '';
    return image.match(/\/images\/products\/[Gg]\d+[a-z]*\.png$/);
});

// Get available new images
let newImages = [];
try {
    newImages = fs.readdirSync(newImagesPath).filter(file => 
        file.toLowerCase().match(/\.(jpg|jpeg|png|webp)$/i)
    );
} catch (error) {
    console.error('Error reading new images directory:', error.message);
    process.exit(1);
}

console.log(`Found ${genericPlaceholders.length} products with generic placeholders`);
console.log(`Found ${newImages.length} new images available`);
console.log('');

// Function to calculate similarity between product name and image filename
function calculateSimilarity(productName, imageName) {
    const cleanProductName = productName.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 2); // Filter out short words
    
    const cleanImageName = imageName.toLowerCase()
        .replace(/\.(jpg|jpeg|png|webp)$/i, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2);
    
    let matches = 0;
    let totalWords = Math.max(cleanProductName.length, cleanImageName.length);
    
    cleanProductName.forEach(productWord => {
        cleanImageName.forEach(imageWord => {
            if (productWord.includes(imageWord) || imageWord.includes(productWord)) {
                matches++;
            }
        });
    });
    
    return totalWords > 0 ? matches / totalWords : 0;
}

// Create matches
const matches = [];
const usedImages = new Set();

genericPlaceholders.forEach(product => {
    let bestMatch = null;
    let bestScore = 0;
    
    newImages.forEach(imageName => {
        if (usedImages.has(imageName)) return;
        
        const score = calculateSimilarity(product.name, imageName);
        if (score > bestScore && score > 0.1) { // Minimum threshold
            bestScore = score;
            bestMatch = imageName;
        }
    });
    
    if (bestMatch) {
        matches.push({
            product: {
                id: product.id,
                name: product.name,
                currentImage: product.image || product.primaryImage
            },
            newImage: bestMatch,
            score: bestScore
        });
        usedImages.add(bestMatch);
    }
});

// Sort matches by score (highest first)
matches.sort((a, b) => b.score - a.score);

console.log('PROPOSED MATCHES:');
console.log('=================');
matches.forEach((match, index) => {
    console.log(`${index + 1}. ${match.product.name} (${match.product.id})`);
    console.log(`   Current: ${match.product.currentImage}`);
    console.log(`   New: ${match.newImage}`);
    console.log(`   Score: ${match.score.toFixed(3)}`);
    console.log('');
});

console.log(`Successfully matched ${matches.length} out of ${genericPlaceholders.length} products`);
console.log(`${newImages.length - matches.length} images remain unused`);

// Save the matches for the replacement script
const matchReport = {
    timestamp: new Date().toISOString(),
    totalGenericPlaceholders: genericPlaceholders.length,
    totalNewImages: newImages.length,
    successfulMatches: matches.length,
    matches: matches,
    unusedImages: newImages.filter(img => !usedImages.has(img)),
    unmatchedProducts: genericPlaceholders.filter(product => 
        !matches.some(match => match.product.id === product.id)
    ).map(product => ({
        id: product.id,
        name: product.name,
        currentImage: product.image || product.primaryImage
    }))
};

const reportPath = `image-matching-report-${Date.now()}.json`;
fs.writeFileSync(reportPath, JSON.stringify(matchReport, null, 2));

console.log(`\nDetailed matching report saved to: ${reportPath}`);