const fs = require('fs');
const path = require('path');

// Configuration
const PRODUCTS_FILE = path.join(__dirname, 'data', 'products', 'products.json');
const UNUSED_IMAGES_REPORT = path.join(__dirname, 'unused-images-report.json');

// Product categories mapping
const CATEGORY_MAPPING = {
  // Food & Beverages
  'butter-popcorn.png': 'snacks',
  'cola-classic.png': 'beverages',
  'semolina-premium.png': 'pantry',
  'cereal-premium.png': 'breakfast',
  'flour-premium.png': 'pantry',
  'basmati-rice.png': 'pantry',
  'coffee-premium.png': 'beverages',
  'premium-coffee-blend.png': 'beverages',
  'chocolate-candy.png': 'snacks',
  'orange-juice.png': 'beverages',
  'dark-roast-coffee.png': 'beverages',
  'semolina.jpg': 'pantry',
  'premium-wheat-flour.jpg': 'pantry',
  'berries.jpg': 'fresh-produce',
  'beans-premium.png': 'pantry',
  'eggs.jpg': 'fresh-produce',
  'strawberries.jpg': 'fresh-produce',
  'shrimp-real.jpg': 'fresh-produce',
  'pasta-real.jpg': 'pantry',
  'frozen-plantains.webp': 'frozen',
  'frozenplantains.webp': 'frozen',
  'goya-maduros-plantains.webp': 'frozen',
  'bananas.jpg': 'fresh-produce',
  
  // Meat & Seafood
  'farm-shop-boerewors-great-taste.jpg': 'meat-seafood',
  'farm-shop-boerewors.jpg': 'meat-seafood',
  'farmshopboereworsgreattaste.jpg': 'meat-seafood',
  'south-african-boerewors.jpg': 'meat-seafood',
  
  // Health & Wellness
  'omega-3.jpg': 'health-wellness',
  'probiotic.jpg': 'health-wellness',
  'ibuprofen.jpg': 'health-wellness',
  'vitamin-d3.jpg': 'health-wellness',
  'thermometer.jpg': 'health-wellness',
  'allergy-relief.jpg': 'health-wellness',
  'first-aid-kit.jpg': 'health-wellness',
  
  // Gift Cards
  'spa-and-wellness-gift-car.jpg': 'gift-cards',
  'spa-wellness-gift-car.jpg': 'gift-cards',
  
  // International Foods
  'nigerian-jollof-rice-mix.jpg': 'international',
  'ghanaian-jollof-rice-mix.jpg': 'international',
  'jamaican-beef-patties.jpg': 'international',
  'nigerian-suya-spice.jpg': 'international',
  'ginger-beer.jpg': 'beverages',
  'gingerbeer.jpg': 'beverages',
  'trinidad-scorpion-pepper-sauce.jpg': 'international',
  'trinidad-scorpion-pepper-sauce-2.jpg': 'international',
  'nigerian-chin-chin.jpeg': 'international',
  'jamaican-blue-mountain-coffee.jpeg': 'beverages',
  'jamaican-blue-mountain-coffee-2.jpeg': 'beverages',
  'ghanaian-cocoa-powder.jpeg': 'international',
  'kenyan-tea-leaves.jpeg': 'beverages',
  
  // Bread & Bakery
  'sterns-whole-grain-bread.jpg': 'bakery',
  'whole-grain-bread.jpg': 'bakery'
};

// Product name generation based on image filename
function generateProductName(filename) {
  const baseName = path.parse(filename).name;
  
  // Convert filename to readable product name
  return baseName
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .replace(/\s+/g, ' ')
    .trim();
}

// Generate product description based on name and category
function generateDescription(name, category) {
  const descriptions = {
    'snacks': `Delicious ${name.toLowerCase()} perfect for snacking anytime. High quality ingredients for maximum flavor and satisfaction.`,
    'beverages': `Refreshing ${name.toLowerCase()} made with premium ingredients. Perfect for any occasion.`,
    'pantry': `Premium quality ${name.toLowerCase()} for all your cooking and baking needs. Essential pantry staple.`,
    'breakfast': `Nutritious ${name.toLowerCase()} to start your day right. Packed with essential nutrients and great taste.`,
    'fresh-produce': `Fresh, high-quality ${name.toLowerCase()} sourced from trusted suppliers. Perfect for healthy meals.`,
    'frozen': `Convenient frozen ${name.toLowerCase()} that maintains freshness and nutritional value.`,
    'meat-seafood': `Premium ${name.toLowerCase()} sourced from quality suppliers. Perfect for grilling and cooking.`,
    'health-wellness': `Quality ${name.toLowerCase()} to support your health and wellness goals.`,
    'gift-cards': `${name} - the perfect gift for any occasion. Easy to use and widely accepted.`,
    'international': `Authentic ${name.toLowerCase()} bringing international flavors to your kitchen.`,
    'bakery': `Fresh ${name.toLowerCase()} baked to perfection. Great for meals and sandwiches.`
  };
  
  return descriptions[category] || `High-quality ${name.toLowerCase()} for your everyday needs.`;
}

// Generate price based on category
function generatePrice(category) {
  const priceRanges = {
    'snacks': [2.99, 8.99],
    'beverages': [1.99, 6.99],
    'pantry': [3.99, 12.99],
    'breakfast': [4.99, 9.99],
    'fresh-produce': [2.99, 15.99],
    'frozen': [3.99, 11.99],
    'meat-seafood': [8.99, 24.99],
    'health-wellness': [9.99, 29.99],
    'gift-cards': [10.00, 100.00],
    'international': [4.99, 18.99],
    'bakery': [2.99, 7.99]
  };
  
  const range = priceRanges[category] || [3.99, 12.99];
  const price = Math.random() * (range[1] - range[0]) + range[0];
  return Math.round(price * 100) / 100;
}

async function integrateUnusedImages() {
  try {
    console.log('🚀 Starting unused images integration...');
    
    // Load current products
    const productsData = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
    console.log(`📊 Current products count: ${productsData.length}`);
    
    // Load unused images report
    const unusedReport = JSON.parse(fs.readFileSync(UNUSED_IMAGES_REPORT, 'utf8'));
    const unusedImages = unusedReport.unusedImages;
    console.log(`🖼️  Unused images to integrate: ${unusedImages.length}`);
    
    // Get the highest current product ID
    const maxId = Math.max(...productsData.map(p => parseInt(p.id))) || 0;
    console.log(`🔢 Starting new product IDs from: ${maxId + 1}`);
    
    // Create new products for unused images
    const newProducts = [];
    let currentId = maxId + 1;
    
    for (const imageObj of unusedImages) {
      const imageFile = imageObj.filename;
      
      // Skip SVG files and very small images (likely icons)
      if (imageFile.endsWith('.svg') || imageFile.includes('-1.svg') || imageFile.includes('-2.svg')) {
        continue;
      }
      
      // Skip obvious duplicates (files with numbers at the end)
      if (imageFile.match(/-\d+\.(jpg|jpeg|png|webp|avif)$/)) {
        continue;
      }
      
      // Skip variants to avoid duplicates
      if (imageObj.isVariant) {
        continue;
      }
      
      const category = CATEGORY_MAPPING[imageFile] || 'general';
      const name = generateProductName(imageFile);
      const description = generateDescription(name, category);
      const price = generatePrice(category);
      
      const newProduct = {
        id: currentId.toString(),
        name: name,
        description: description,
        price: price,
        originalPrice: Math.round((price * 1.2) * 100) / 100, // 20% markup for original price
        image: imageFile,
        category: category,
        inStock: true,
        stockQuantity: Math.floor(Math.random() * 100) + 20, // Random stock between 20-120
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // Rating between 3.0-5.0
        reviewCount: Math.floor(Math.random() * 50) + 5, // Reviews between 5-55
        tags: [category, 'new-arrival'],
        createdBy: 'unused-images-integrator',
        updatedBy: 'unused-images-integrator',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      newProducts.push(newProduct);
      currentId++;
    }
    
    console.log(`✨ Created ${newProducts.length} new products from unused images`);
    
    // Combine existing and new products
    const updatedProducts = [...productsData, ...newProducts];
    
    // Create backup of original file
    const backupFile = PRODUCTS_FILE.replace('.json', '_backup_before_integration.json');
    fs.writeFileSync(backupFile, JSON.stringify(productsData, null, 2));
    console.log(`💾 Backup created: ${backupFile}`);
    
    // Write updated products file
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(updatedProducts, null, 2));
    console.log(`📝 Updated products file with ${updatedProducts.length} total products`);
    
    // Generate integration report
    const report = {
      timestamp: new Date().toISOString(),
      originalProductCount: productsData.length,
      newProductsAdded: newProducts.length,
      totalProductCount: updatedProducts.length,
      unusedImagesProcessed: unusedImages.length,
      unusedImagesIntegrated: newProducts.length,
      skippedImages: unusedImages.length - newProducts.length,
      categoriesUsed: [...new Set(newProducts.map(p => p.category))],
      newProductIds: newProducts.map(p => p.id),
      backupFile: backupFile
    };
    
    const reportFile = path.join(__dirname, 'integration-report.json');
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`📊 Integration report saved: ${reportFile}`);
    
    console.log('\n🎉 INTEGRATION COMPLETE!');
    console.log(`✅ Original products preserved: ${productsData.length}`);
    console.log(`✅ New products added: ${newProducts.length}`);
    console.log(`✅ Total products now: ${updatedProducts.length}`);
    console.log(`✅ Categories used: ${report.categoriesUsed.join(', ')}`);
    console.log(`✅ Backup created: ${path.basename(backupFile)}`);
    
  } catch (error) {
    console.error('❌ Error during integration:', error);
    process.exit(1);
  }
}

// Run the integration
integrateUnusedImages();