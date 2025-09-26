const fs = require('fs');
const path = require('path');

// Load products data
const productsPath = path.join(__dirname, 'data', 'products', 'products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// Get all sitephoto directories
const sitephotoPath = path.join(__dirname, 'sitephoto');
const sitephotoCategories = fs.readdirSync(sitephotoPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

console.log('🔍 Analyzing existing sitephoto categories and potential matches...\n');

// Find products with generic placeholders
const genericProducts = products.filter(product => 
    product.primaryImage && product.primaryImage.includes('/images/products/G')
);

console.log(`📊 Found ${genericProducts.length} products with generic placeholders`);
console.log(`📁 Found ${sitephotoCategories.length} sitephoto categories\n`);

// Create matching rules based on product names and sitephoto categories
const matchingRules = [
    // Beverages & Drinks
    { sitephoto: 'Apple Cider Viniger', keywords: ['vinegar', 'cider'], category: 'Condiments & Sauces' },
    { sitephoto: 'Coffee', keywords: ['coffee', 'espresso', 'cappuccino', 'latte'], category: 'Beverages' },
    { sitephoto: 'Juices', keywords: ['juice', 'smoothie', 'drink', 'beverage'], category: 'Beverages' },
    { sitephoto: 'Milk', keywords: ['milk', 'dairy', 'cream'], category: 'Dairy' },
    
    // Snacks & Treats
    { sitephoto: 'Candy', keywords: ['candy', 'sweet', 'chocolate', 'gummy'], category: 'Snacks' },
    { sitephoto: 'Cookies', keywords: ['cookie', 'biscuit', 'wafer'], category: 'Snacks' },
    { sitephoto: 'Crackers', keywords: ['cracker', 'crisp'], category: 'Snacks' },
    { sitephoto: 'Nuts', keywords: ['nuts', 'almond', 'peanut', 'walnut', 'cashew'], category: 'Snacks' },
    { sitephoto: 'Popcorn', keywords: ['popcorn', 'corn'], category: 'Snacks' },
    { sitephoto: 'Potato Chips', keywords: ['chips', 'potato', 'crisp'], category: 'Snacks' },
    { sitephoto: 'Protein Bars', keywords: ['protein', 'bar', 'energy'], category: 'Health' },
    
    // Breakfast & Cereals
    { sitephoto: 'Breakfast Cereal', keywords: ['cereal', 'breakfast', 'granola'], category: 'Breakfast' },
    { sitephoto: 'Oats', keywords: ['oats', 'oatmeal', 'porridge'], category: 'Breakfast' },
    
    // Pantry Staples
    { sitephoto: 'Beans', keywords: ['beans', 'legume', 'lentil'], category: 'Pantry' },
    { sitephoto: 'Rice', keywords: ['rice', 'grain'], category: 'Pantry' },
    
    // Fresh & Perishables
    { sitephoto: 'Fresh Foods', keywords: ['fresh', 'produce', 'vegetable', 'fruit'], category: 'Fresh' },
    
    // Health & Pharmacy
    { sitephoto: 'Pharmacy', keywords: ['vitamin', 'supplement', 'medicine', 'health', 'tablet', 'capsule'], category: 'Health' }
];

// Analyze potential matches
const potentialMatches = [];

genericProducts.forEach(product => {
    const productName = product.name.toLowerCase();
    
    matchingRules.forEach(rule => {
        const hasKeyword = rule.keywords.some(keyword => 
            productName.includes(keyword.toLowerCase())
        );
        
        if (hasKeyword) {
            // Check if this sitephoto category actually exists and has images
            const categoryPath = path.join(sitephotoPath, rule.sitephoto);
            if (fs.existsSync(categoryPath)) {
                const images = fs.readdirSync(categoryPath).filter(file => 
                    file.toLowerCase().endsWith('.png') || 
                    file.toLowerCase().endsWith('.jpg') || 
                    file.toLowerCase().endsWith('.jpeg')
                );
                
                if (images.length > 0) {
                    potentialMatches.push({
                        product: {
                            id: product.id,
                            name: product.name,
                            currentImage: product.primaryImage
                        },
                        sitephoto: {
                            category: rule.sitephoto,
                            matchedKeywords: rule.keywords.filter(k => productName.includes(k.toLowerCase())),
                            availableImages: images,
                            suggestedImage: `/sitephoto/${rule.sitephoto}/${images[0]}`
                        },
                        confidence: rule.keywords.filter(k => productName.includes(k.toLowerCase())).length
                    });
                }
            }
        }
    });
});

// Sort by confidence (number of matching keywords)
potentialMatches.sort((a, b) => b.confidence - a.confidence);

console.log(`🎯 Found ${potentialMatches.length} potential matches:\n`);

// Group by sitephoto category
const groupedMatches = {};
potentialMatches.forEach(match => {
    const category = match.sitephoto.category;
    if (!groupedMatches[category]) {
        groupedMatches[category] = [];
    }
    groupedMatches[category].push(match);
});

// Display results
Object.keys(groupedMatches).forEach(category => {
    const matches = groupedMatches[category];
    console.log(`📁 ${category} (${matches.length} matches):`);
    matches.forEach(match => {
        console.log(`  ✅ ${match.product.name} → ${match.sitephoto.category}`);
        console.log(`     Keywords: ${match.sitephoto.matchedKeywords.join(', ')}`);
        console.log(`     Current: ${match.product.currentImage}`);
        console.log(`     Suggested: ${match.sitephoto.suggestedImage}`);
        console.log('');
    });
});

// Create detailed report
const report = {
    timestamp: new Date().toISOString(),
    script: 'analyze-reusable-sitephotos.cjs',
    summary: {
        totalProducts: products.length,
        genericProducts: genericProducts.length,
        sitephotoCategories: sitephotoCategories.length,
        potentialMatches: potentialMatches.length,
        potentialReduction: `${potentialMatches.length} out of ${genericProducts.length} (${Math.round(potentialMatches.length / genericProducts.length * 100)}%)`
    },
    matchingRules: matchingRules,
    potentialMatches: potentialMatches,
    groupedByCategory: groupedMatches
};

const reportPath = path.join(__dirname, `reusable-sitephotos-analysis-${Date.now()}.json`);
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log(`\n📊 Analysis complete!`);
console.log(`📈 Potential reduction: ${potentialMatches.length} out of ${genericProducts.length} generic placeholders`);
console.log(`📄 Detailed report saved: ${reportPath}`);

// Show top categories with most matches
const categoryStats = Object.keys(groupedMatches).map(category => ({
    category,
    count: groupedMatches[category].length
})).sort((a, b) => b.count - a.count);

console.log(`\n🏆 Top categories for reuse:`);
categoryStats.slice(0, 5).forEach((stat, index) => {
    console.log(`${index + 1}. ${stat.category}: ${stat.count} matches`);
});

console.log('\n✨ Ready to create smart matching script!');