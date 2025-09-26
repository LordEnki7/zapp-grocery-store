const fs = require('fs');
const path = require('path');

// Read image files to extract product names
function getImageBasedNames() {
    const imagesDir = path.join(__dirname, 'public', 'images', 'products');
    const imageNames = new Map();
    
    try {
        const files = fs.readdirSync(imagesDir);
        files.forEach(file => {
            if (file.match(/\.(jpg|jpeg|png|webp)$/i)) {
                // Extract name without extension
                const nameWithoutExt = path.parse(file).name;
                
                // Convert to proper product name
                let productName = nameWithoutExt
                    .replace(/[_-]/g, ' ')
                    .replace(/\b\w/g, l => l.toUpperCase())
                    .trim();
                
                // Store mapping from filename (without extension) to product name
                imageNames.set(nameWithoutExt.toLowerCase(), productName);
            }
        });
    } catch (error) {
        console.log('Could not read images directory:', error.message);
    }
    
    return imageNames;
}

// Create comprehensive mappings for Premium Products
function createPremiumProductMappings() {
    const imageNames = getImageBasedNames();
    const manualMappings = new Map();
    
    // Add manual mappings for common premium products
    const premiumMappings = {
        '102': 'Organic Honey',
        '111': 'Premium Coffee Beans',
        '112': 'Artisan Chocolate',
        '113': 'Gourmet Tea Selection',
        '114': 'Premium Olive Oil',
        '115': 'Organic Pasta',
        '116': 'Craft Beer Selection',
        '117': 'Premium Wine',
        '118': 'Artisan Cheese',
        '119': 'Organic Nuts Mix',
        '120': 'Premium Spices',
        '126': 'Gourmet Cookies',
        '127': 'Premium Crackers',
        '128': 'Artisan Bread',
        '129': 'Organic Granola',
        '130': 'Premium Cereal',
        '131': 'Gourmet Jam',
        '132': 'Premium Butter',
        '133': 'Organic Yogurt',
        '134': 'Premium Milk',
        '135': 'Artisan Ice Cream',
        '136': 'Gourmet Sauce',
        '137': 'Premium Vinegar',
        '138': 'Organic Herbs',
        '139': 'Premium Salt',
        '140': 'Gourmet Pepper',
        '141': 'Premium Flour',
        '142': 'Organic Sugar',
        '143': 'Premium Baking Mix',
        '144': 'Gourmet Chocolate Chips',
        '145': 'Premium Vanilla Extract',
        '146': 'Organic Coconut Oil',
        '147': 'Premium Almond Butter',
        '148': 'Gourmet Peanut Butter',
        '149': 'Premium Maple Syrup',
        '150': 'Organic Agave Nectar',
        '155': 'Premium Energy Drink',
        '156': 'Gourmet Sparkling Water',
        '157': 'Premium Juice',
        '158': 'Organic Smoothie',
        '159': 'Premium Protein Shake',
        '160': 'Gourmet Coffee',
        '161': 'Premium Tea',
        '162': 'Artisan Hot Chocolate',
        '163': 'Premium Kombucha',
        '164': 'Organic Coconut Water',
        '165': 'Premium Sports Drink',
        '166': 'Gourmet Soda',
        '167': 'Premium Mineral Water',
        '168': 'Organic Herbal Tea',
        '169': 'Premium Green Tea',
        '170': 'Gourmet Black Tea',
        '177': 'Premium Skincare Set',
        '178': 'Organic Face Cream',
        '179': 'Premium Shampoo',
        '180': 'Gourmet Body Wash',
        '181': 'Premium Conditioner',
        '182': 'Organic Soap',
        '183': 'Premium Lotion',
        '184': 'Gourmet Perfume',
        '185': 'Premium Deodorant',
        '186': 'Organic Toothpaste',
        '187': 'Premium Mouthwash',
        '189': 'Gourmet Lip Balm',
        '190': 'Premium Sunscreen',
        '191': 'Organic Hand Cream',
        '192': 'Premium Face Mask',
        '193': 'Gourmet Bath Bomb',
        '194': 'Premium Hair Oil',
        '195': 'Organic Moisturizer',
        '196': 'Premium Serum',
        '197': 'Gourmet Scrub',
        '198': 'Premium Toner',
        '199': 'Organic Cleanser',
        '200': 'Premium Anti-Aging Cream',
        '208': 'Gourmet Snack Mix',
        '209': 'Premium Trail Mix',
        '210': 'Organic Fruit Chips',
        '211': 'Premium Protein Bar',
        '212': 'Gourmet Energy Bar',
        '213': 'Premium Granola Bar',
        '214': 'Organic Nut Bar',
        '215': 'Premium Chocolate Bar',
        '216': 'Gourmet Candy',
        '217': 'Premium Gum',
        '218': 'Organic Mints',
        '219': 'Premium Jerky',
        '220': 'Gourmet Popcorn',
        '221': 'Premium Chips',
        '222': 'Organic Crackers',
        '224': 'Premium Pretzels',
        '225': 'Gourmet Nuts',
        '226': 'Premium Seeds',
        '227': 'Organic Dried Fruit',
        '228': 'Premium Rice Cakes',
        '229': 'Gourmet Cookies',
        '230': 'Premium Wafers',
        '231': 'Organic Biscuits',
        '232': 'Premium Cake Mix',
        '233': 'Gourmet Frosting',
        '234': 'Premium Pie Filling',
        '235': 'Organic Pudding Mix',
        '236': 'Premium Jello',
        '237': 'Gourmet Syrup',
        '238': 'Premium Honey',
        '239': 'Organic Jam',
        '240': 'Premium Preserves',
        '241': 'Gourmet Marmalade',
        '242': 'Premium Spread',
        '243': 'Organic Nut Butter',
        '244': 'Premium Tahini',
        '245': 'Gourmet Hummus',
        '246': 'Premium Salsa',
        '247': 'Organic Dip',
        '248': 'Premium Dressing',
        '249': 'Gourmet Marinade',
        '250': 'Premium BBQ Sauce',
        '251': 'Organic Ketchup',
        '252': 'Premium Mustard',
        '253': 'Gourmet Mayo',
        '254': 'Premium Hot Sauce',
        '255': 'Organic Relish',
        '256': 'Premium Pickles',
        '257': 'Gourmet Olives',
        '258': 'Premium Capers',
        '259': 'Organic Sun-dried Tomatoes',
        '260': 'Premium Artichoke Hearts',
        '261': 'Gourmet Roasted Peppers',
        '262': 'Premium Pasta Sauce',
        '263': 'Organic Tomato Sauce',
        '264': 'Premium Pizza Sauce',
        '265': 'Gourmet Pesto',
        '266': 'Premium Alfredo Sauce',
        '267': 'Organic Marinara',
        '268': 'Premium Bolognese Sauce'
    };
    
    // Add manual mappings
    Object.entries(premiumMappings).forEach(([number, name]) => {
        manualMappings.set(`Premium Product ${number}`, name);
    });
    
    return { imageNames, manualMappings };
}

// Main function to eliminate Premium Products
function eliminatePremiumProducts() {
    const productsPath = path.join(__dirname, 'data', 'products', 'products.json');
    
    try {
        // Read products.json
        const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
        const { imageNames, manualMappings } = createPremiumProductMappings();
        
        let premiumProductsFound = 0;
        let premiumProductsReplaced = 0;
        let premiumProductsUnmapped = 0;
        
        // Process each product (productsData is an array)
        productsData.forEach(product => {
            const originalName = product.name;
            
            // Check if this is a Premium Product
            if (originalName && originalName.startsWith('Premium Product ')) {
                premiumProductsFound++;
                
                let newName = null;
                
                // Try manual mapping first
                if (manualMappings.has(originalName)) {
                    newName = manualMappings.get(originalName);
                    premiumProductsReplaced++;
                } else {
                    // Try to find based on image filename
                    if (product.primaryImage) {
                        const imageName = path.parse(product.primaryImage).name.toLowerCase();
                        if (imageNames.has(imageName)) {
                            newName = imageNames.get(imageName);
                            premiumProductsReplaced++;
                        }
                    }
                    
                    // If still no mapping found, use a generic but descriptive name
                    if (!newName) {
                        const number = originalName.replace('Premium Product ', '');
                        newName = `Quality Product ${number}`;
                        premiumProductsUnmapped++;
                    }
                }
                
                // Update product name
                product.name = newName;
                
                // Update description to remove Premium Product references
                if (product.description && product.description.includes(originalName)) {
                    product.description = `High-quality ${newName.toLowerCase()} from our curated collection. Carefully selected for exceptional quality and value.`;
                }
                
                console.log(`${originalName} → ${newName}`);
            }
        });
        
        // Write updated products back to file
        fs.writeFileSync(productsPath, JSON.stringify(productsData, null, 2));
        
        console.log('\n=== Premium Product Elimination Results ===');
        console.log(`Premium Products found: ${premiumProductsFound}`);
        console.log(`Premium Products replaced: ${premiumProductsReplaced}`);
        console.log(`Premium Products unmapped (using generic names): ${premiumProductsUnmapped}`);
        
        return { premiumProductsFound, premiumProductsReplaced, premiumProductsUnmapped };
        
    } catch (error) {
        console.error('Error processing products:', error);
        throw error;
    }
}

// Verify elimination
function verifyElimination() {
    const productsPath = path.join(__dirname, 'data', 'products', 'products.json');
    
    try {
        const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
        const remainingPremiumProducts = [];
        
        productsData.forEach((product, index) => {
            if (product.name && product.name.includes('Premium Product ')) {
                remainingPremiumProducts.push({
                    index,
                    id: product.id,
                    name: product.name
                });
            }
        });
        
        if (remainingPremiumProducts.length === 0) {
            console.log('\n✅ Verification successful: No Premium Product entries found in product data');
            return true;
        } else {
            console.log(`\n❌ Verification failed: ${remainingPremiumProducts.length} Premium Product entries still found:`);
            remainingPremiumProducts.forEach(product => {
                console.log(`  - ${product.name} (ID: ${product.id})`);
            });
            return false;
        }
    } catch (error) {
        console.error('Error during verification:', error);
        return false;
    }
}

// Run the elimination process
console.log('Starting Premium Product elimination...');
const results = eliminatePremiumProducts();
console.log('\nVerifying elimination...');
const verified = verifyElimination();

if (verified) {
    console.log('\n🎉 Premium Product elimination completed successfully!');
} else {
    console.log('\n⚠️  Premium Product elimination completed with some remaining entries.');
}