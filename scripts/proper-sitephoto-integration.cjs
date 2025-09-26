#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
  SITEPHOTO_DIR: path.join(__dirname, '..', 'sitephoto'),
  PRODUCTS_JSON: path.join(__dirname, '..', 'data', 'products', 'products.json'),
  PUBLIC_IMAGES_DIR: path.join(__dirname, '..', 'public', 'images', 'products'),
  SUPPORTED_FORMATS: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'],
  LOG_FILE: path.join(__dirname, '..', 'logs', 'proper-sitephoto-integration.log')
};

class ProperSitephotoIntegrator {
  constructor() {
    this.updatedCount = 0;
    this.copiedCount = 0;
    this.errorCount = 0;
    this.startTime = Date.now();
    this.sitephotoMapping = new Map();
  }

  async log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;
    console.log(logMessage);
    
    try {
      await fs.mkdir(path.dirname(CONFIG.LOG_FILE), { recursive: true });
      await fs.appendFile(CONFIG.LOG_FILE, logMessage + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error.message);
    }
  }

  async buildSitephotoMapping() {
    await this.log('🔍 Building sitephoto mapping with ORIGINAL names preserved...');
    
    try {
      const categories = await fs.readdir(CONFIG.SITEPHOTO_DIR);
      
      for (const category of categories) {
        const categoryPath = path.join(CONFIG.SITEPHOTO_DIR, category);
        const stat = await fs.stat(categoryPath);
        
        if (stat.isDirectory()) {
          const files = await fs.readdir(categoryPath);
          const images = files.filter(file => 
            CONFIG.SUPPORTED_FORMATS.includes(path.extname(file).toLowerCase())
          );
          
          for (const image of images) {
            const originalFilename = image;
            const properName = this.extractProperProductName(path.parse(image).name);
            
            // Store mapping with original filename preserved
            const mappingData = {
              originalPath: path.join(categoryPath, image),
              category: category,
              originalFilename: originalFilename, // Keep exact original name
              properName: properName,
              imagePath: `/images/products/${originalFilename}` // Use original filename in path
            };
            
            // Map by product name variations for matching
            this.sitephotoMapping.set(properName.toLowerCase(), mappingData);
            this.sitephotoMapping.set(this.normalizeForMatching(properName), mappingData);
            
            // Also map by original filename without extension
            const nameWithoutExt = path.parse(image).name;
            this.sitephotoMapping.set(nameWithoutExt.toLowerCase(), mappingData);
            this.sitephotoMapping.set(this.normalizeForMatching(nameWithoutExt), mappingData);
          }
          
          await this.log(`Mapped ${images.length} images from ${category}`);
        }
      }
      
      await this.log(`Total sitephoto mappings created: ${this.sitephotoMapping.size}`);
      return this.sitephotoMapping;
    } catch (error) {
      await this.log(`Error building sitephoto mapping: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  extractProperProductName(filename) {
    return filename
      .replace(/_/g, ' ')           // Convert underscores to spaces
      .replace(/\./g, ' ')          // Convert dots to spaces
      .replace(/&/g, 'and')         // Convert & to and
      .replace(/'/g, "'")           // Fix apostrophes
      .replace(/\s+/g, ' ')         // Normalize multiple spaces
      .trim()
      .split(' ')
      .map(word => {
        // Keep common words lowercase
        if (['and', 'of', 'the', 'in', 'on', 'at', 'to', 'for', 'with'].includes(word.toLowerCase())) {
          return word.toLowerCase();
        }
        // Capitalize first letter of other words
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  }

  normalizeForMatching(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')    // Remove all non-alphanumeric
      .trim();
  }

  async copyOriginalImageToPublic(originalPath, originalFilename) {
    try {
      const targetPath = path.join(CONFIG.PUBLIC_IMAGES_DIR, originalFilename);
      
      // Check if file already exists and is identical
      try {
        const existingStats = await fs.stat(targetPath);
        const originalStats = await fs.stat(originalPath);
        
        if (existingStats.size === originalStats.size) {
          await this.log(`Image already exists: ${originalFilename}`);
          return true;
        }
      } catch (error) {
        // File doesn't exist, proceed with copy
      }
      
      await fs.copyFile(originalPath, targetPath);
      this.copiedCount++;
      await this.log(`✅ Copied: ${originalFilename}`);
      return true;
    } catch (error) {
      await this.log(`Error copying image ${originalFilename}: ${error.message}`, 'ERROR');
      this.errorCount++;
      return false;
    }
  }

  findBestSitephotoMatch(productName, currentImagePath) {
    // Try exact product name match first
    let match = this.sitephotoMapping.get(productName.toLowerCase());
    if (match) return match;

    // Try normalized product name
    match = this.sitephotoMapping.get(this.normalizeForMatching(productName));
    if (match) return match;

    // Try to extract name from current image path
    if (currentImagePath) {
      const currentFilename = path.basename(currentImagePath, path.extname(currentImagePath));
      match = this.sitephotoMapping.get(currentFilename.toLowerCase());
      if (match) return match;
      
      match = this.sitephotoMapping.get(this.normalizeForMatching(currentFilename));
      if (match) return match;
    }

    return null;
  }

  generateDescription(productName, category) {
    const categoryDescriptions = {
      'Apple Cider Viniger': 'Premium organic apple cider vinegar with natural health benefits',
      'Beans': 'High-quality beans perfect for cooking and meal preparation',
      'Breakfast Cereal': 'Nutritious breakfast cereal for a great start to your day',
      'Candy': 'Delicious candy and sweet treats for every occasion',
      'Cheeze Snack': 'Tasty cheese snacks perfect for any time of day',
      'Chewing gum': 'Fresh chewing gum for long-lasting flavor',
      'Chick Peas': 'Premium chickpeas rich in protein and fiber',
      'Chicken of The Sea Tuna': 'High-quality tuna packed with protein',
      'Coffee': 'Premium coffee blends for the perfect cup every time',
      'Condiments': 'Essential condiments to enhance your meals',
      'Cookies': 'Delicious cookies and baked treats',
      'Crackers': 'Crispy crackers perfect for snacking',
      'Deal of the day': 'Special daily deals on premium products',
      'Energy Drink': 'Energizing drinks to fuel your active lifestyle',
      'Flour': 'High-quality flour for all your baking needs',
      'Frappuccino': 'Refreshing coffee beverages',
      'Fresh Foods': 'Fresh, high-quality produce and perishables',
      'Fruit Snacks': 'Healthy fruit snacks packed with natural goodness',
      'Garlic': 'Fresh garlic for cooking and seasoning',
      'GatorAid': 'Sports drinks for hydration and performance',
      'Gift Cards': 'Convenient gift cards for any occasion',
      'Hospitality': 'Premium products for entertaining and hospitality. High quality product sourced with care for your satisfaction.',
      'Juices': 'Fresh and natural fruit juices',
      'Lemon Juice': 'Pure lemon juice for cooking and beverages',
      'Mayo': 'Creamy mayonnaise for sandwiches and cooking',
      'Milk Tea Varity Pack': 'Variety pack of delicious milk tea flavors',
      'Milk': 'Fresh milk and dairy alternatives',
      'Motor Oil': 'High-quality motor oil for vehicle maintenance',
      'Nesquick': 'Chocolate milk mix for delicious drinks',
      'New African Products': 'Authentic African products and specialties',
      'Nuts': 'Premium nuts and healthy snacking options',
      'Oats': 'Nutritious oats for breakfast and baking',
      'Pancakes mix': 'Easy pancake mix for perfect breakfast',
      'Peanut Butter': 'Creamy peanut butter rich in protein',
      'Peanuts': 'Fresh peanuts for snacking',
      'Pharmacy': 'Health and wellness products for your wellbeing',
      'Popcorn': 'Delicious popcorn for movie nights and snacking',
      'Potato Chips': 'Crispy potato chips for snacking',
      'Protien Bars': 'Protein-rich bars for energy and nutrition',
      'Rice Crispy Treats': 'Sweet rice crispy treats',
      'Rice': 'Premium rice varieties for cooking',
      'Seaweed Snack': 'Healthy seaweed snacks',
      'Snack Packs': 'Convenient snack packs for on-the-go',
      'Sodas': 'Refreshing sodas and soft drinks',
      'Sparkle Water': 'Sparkling water for refreshment',
      'Splenda': 'Sugar substitute for healthier sweetening',
      'Sports Drink': 'Sports drinks for hydration and performance',
      'Sunflower oil': 'Pure sunflower oil for cooking',
      'Sweatner': 'Natural sweeteners for beverages and cooking',
      'Tomatoe Paste': 'Rich tomato paste for cooking',
      'Tomatoes': 'Fresh tomatoes for cooking and salads',
      'Towels': 'Absorbent towels for household use',
      'Vanilla Abstract': 'Pure vanilla extract for baking',
      'Veggie Snacks': 'Healthy vegetable snacks',
      'Vitimin Water': 'Vitamin-enhanced water for health',
      'coconut water': 'Natural coconut water for hydration',
      'pretzels': 'Crunchy pretzels for snacking',
      'tomato Souce': 'Rich tomato sauce for cooking'
    };

    return categoryDescriptions[category] || `High-quality ${productName.toLowerCase()} for your needs. Premium product sourced with care for your satisfaction.`;
  }

  async updateProductsWithProperSitephoto() {
    await this.log('🚀 Starting proper sitephoto integration...');
    
    try {
      // Build sitephoto mapping first
      await this.buildSitephotoMapping();
      
      // Load products
      const productsData = await fs.readFile(CONFIG.PRODUCTS_JSON, 'utf8');
      const products = JSON.parse(productsData);
      
      await this.log(`Processing ${products.length} products...`);
      
      for (const product of products) {
        // Only process products that were created by sitephoto importers
        if (product.createdBy === 'sitephoto-importer' || product.updatedBy === 'complete-sitephoto-updater') {
          const currentImagePath = product.images && product.images[0];
          const matchData = this.findBestSitephotoMatch(product.name, currentImagePath);
          
          if (matchData) {
            const oldName = product.name;
            const oldImage = currentImagePath;
            
            // Copy original sitephoto image with its EXACT original name
            const success = await this.copyOriginalImageToPublic(matchData.originalPath, matchData.originalFilename);
            
            if (success) {
              // Update product with proper name and ORIGINAL image path
              product.name = matchData.properName;
              product.description = this.generateDescription(matchData.properName, matchData.category);
              product.images = [matchData.imagePath]; // Uses original filename
              product.primaryImage = matchData.imagePath; // Uses original filename
              product.updatedAt = new Date().toISOString();
              product.updatedBy = 'proper-sitephoto-integrator';
              
              this.updatedCount++;
              await this.log(`✅ Updated: "${oldName}" → "${matchData.properName}"`);
              await this.log(`   Image: "${oldImage}" → "${matchData.imagePath}"`);
              await this.log(`   Original file: ${matchData.originalFilename}`);
            }
          } else {
            await this.log(`⚠️  No sitephoto match found for: ${product.name}`, 'WARN');
          }
        }
      }
      
      // Save updated products
      await fs.writeFile(CONFIG.PRODUCTS_JSON, JSON.stringify(products, null, 2));
      
      await this.printSummary();
      
    } catch (error) {
      await this.log(`Integration failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async printSummary() {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    
    await this.log('\n📊 PROPER SITEPHOTO INTEGRATION SUMMARY');
    await this.log('═'.repeat(60));
    await this.log(`✅ Products Updated: ${this.updatedCount}`);
    await this.log(`📁 Images Copied: ${this.copiedCount}`);
    await this.log(`❌ Errors: ${this.errorCount}`);
    await this.log(`🗺️  Total Sitephoto Mappings: ${this.sitephotoMapping.size}`);
    await this.log(`⏱️  Duration: ${duration} seconds`);
    await this.log('═'.repeat(60));
    
    if (this.updatedCount > 0) {
      await this.log('🎉 Proper sitephoto integration completed successfully!');
      await this.log('💡 All products now use ORIGINAL sitephoto names and images');
      await this.log('🔧 Image paths preserve original formatting and capitalization');
    } else {
      await this.log('⚠️  No products were updated');
    }
  }
}

// Main execution
async function main() {
  const integrator = new ProperSitephotoIntegrator();
  
  try {
    await integrator.updateProductsWithProperSitephoto();
  } catch (error) {
    console.error(`❌ Integration failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { ProperSitephotoIntegrator };