const fs = require('fs');
const path = require('path');

// Read the current products.json file
const productsPath = path.join(__dirname, 'data', 'products', 'products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// Find products with generic placeholder images
const genericPlaceholders = products.filter(product => {
    const image = product.image || product.primaryImage || '';
    return image.match(/\/images\/products\/[Gg]\d+[a-z]*\.png$/);
});

console.log(`Found ${genericPlaceholders.length} products with generic placeholder images:`);
console.log('');

genericPlaceholders.forEach((product, index) => {
    console.log(`${index + 1}. ${product.name} (ID: ${product.id})`);
    console.log(`   Image: ${product.image || product.primaryImage}`);
    console.log(`   Category: ${product.category || 'N/A'}`);
    console.log('');
});

// Save detailed report
const report = {
    timestamp: new Date().toISOString(),
    totalProducts: products.length,
    genericPlaceholders: genericPlaceholders.length,
    products: genericPlaceholders.map(product => ({
        id: product.id,
        name: product.name,
        category: product.category,
        image: product.image || product.primaryImage,
        price: product.price
    }))
};

const reportPath = `remaining-placeholders-report-${Date.now()}.json`;
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log(`Detailed report saved to: ${reportPath}`);