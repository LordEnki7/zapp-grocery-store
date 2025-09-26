#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
  SITEPHOTO_DIR: path.join(__dirname, '..', 'sitephoto'),
  PRODUCTS_JSON: path.join(__dirname, '..', 'data', 'products', 'products.json'),
  SUPPORTED_FORMATS: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'],
  LOG_FILE: path.join(__dirname, '..', 'logs', 'sitephoto-name-update.log')
};

class SitephotoNameUpdater {
  constructor() {
    this.updatedCount = 0;
    this.errorCount = 0;
    this.startTime = Date.now();
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

  async scanSitephotoForNames() {
    await this.log('🔍 Scanning sitephoto directory for proper product names...');
    
    try {
      const categories = await fs.readdir(CONFIG.SITEPHOTO_DIR);
      const nameMap = new Map();
      
      for (const category of categories) {
        const categoryPath = path.join(CONFIG.SITEPHOTO_DIR, category);
        const stat = await fs.stat(categoryPath);
        
        if (stat.isDirectory()) {
          const files = await fs.readdir(categoryPath);
          const images = files.filter(file => 
            CONFIG.SUPPORTED_FORMATS.includes(path.extname(file).toLowerCase())
          );
          
          for (const image of images) {
            // Extract proper name from filename
            const baseName = path.parse(image).name;
            const properName = this.extractProperName(baseName);
            const normalizedImageName = this.normalizeImageName(image);
            
            nameMap.set(normalizedImageName, {
              properName: properName,
              category: category,
              originalFilename: image
            });
          }
          
          await this.log(`Processed ${images.length} images in ${category}`);
        }
      }
      
      return nameMap;
    } catch (error) {
      await this.log(`Error scanning sitephoto directory: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  extractProperName(filename) {
    // Convert filename to proper product name
    return filename
      .replace(/_/g, ' ')           // Replace underscores with spaces
      .replace(/\./g, ' ')          // Replace dots with spaces
      .replace(/&/g, 'and')         // Replace & with 'and'
      .replace(/'/g, "'")           // Fix apostrophes
      .replace(/\s+/g, ' ')         // Normalize multiple spaces
      .trim()                       // Remove leading/trailing spaces
      .split(' ')                   // Split into words
      .map(word => {                // Capitalize each word
        if (word.toLowerCase() === 'and' || word.toLowerCase() === 'of' || word.toLowerCase() === 'the') {
          return word.toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  }

  normalizeImageName(filename) {
    return filename
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9.-]/g, '')
      .replace(/-+/g, '-');
  }

  async loadProducts() {
    try {
      const data = await fs.readFile(CONFIG.PRODUCTS_JSON, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      await this.log(`Error loading products: ${error.message}`, 'ERROR');
      throw error;
    }
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
      'Hospitality': 'Premium products for entertaining and hospitality',
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
      'Potato Chips': 'Crispy potato chips in various flavors',
      'Protien Bars': 'Protein-rich bars for nutrition on the go',
      'Rice Crispy Treats': 'Sweet rice crispy treats',
      'Rice': 'Premium rice varieties for cooking',
      'Seasons': 'Seasonal products and specialties',
      'Seaweed Snack': 'Healthy seaweed snacks',
      'Snack Packs': 'Convenient snack packs for on-the-go',
      'Sodas': 'Refreshing sodas and carbonated beverages',
      'Sparkle Water': 'Sparkling water for refreshment',
      'Splenda': 'Sugar substitute for healthier sweetening',
      'Sports Drink': 'Performance drinks for athletes',
      'Sunflower oil': 'Pure sunflower oil for cooking',
      'Sweatner': 'Natural and artificial sweeteners',
      'Tomatoe Paste': 'Rich tomato paste for cooking',
      'Tomatoes': 'Fresh tomatoes for cooking and salads',
      'Towels': 'Absorbent towels for household use',
      'Vanilla Abstract': 'Pure vanilla extract for baking',
      'Veggie Snacks': 'Healthy vegetable-based snacks',
      'Vitimin Water': 'Vitamin-enhanced water for health',
      'coconut water': 'Natural coconut water for hydration',
      'pretzels': 'Crunchy pretzels for snacking',
      'tomato Souce': 'Rich tomato sauce for cooking'
    };

    const baseDescription = categoryDescriptions[category] || `Premium ${productName.toLowerCase()} from our ${category.toLowerCase()} collection`;
    return `${baseDescription}. High quality product sourced with care for your satisfaction.`;
  }

  async updateProductNames() {
    await this.log('🚀 Starting sitephoto name update process...');
    
    try {
      // Get name mapping from sitephoto directory
      const nameMap = await this.scanSitephotoForNames();
      
      // Load existing products
      const products = await this.loadProducts();
      
      // Update products with proper names
      for (const product of products) {
        if (product.createdBy === 'sitephoto-importer' && product.images && product.images.length > 0) {
          const imagePath = product.images[0];
          const imageName = path.basename(imagePath);
          
          if (nameMap.has(imageName)) {
            const nameInfo = nameMap.get(imageName);
            const oldName = product.name;
            
            // Update product with proper name
            product.name = nameInfo.properName;
            product.description = this.generateDescription(nameInfo.properName, nameInfo.category);
            product.updatedAt = new Date().toISOString();
            product.updatedBy = 'sitephoto-name-updater';
            
            this.updatedCount++;
            await this.log(`✅ Updated: "${oldName}" → "${nameInfo.properName}"`);
          }
        }
      }
      
      // Save updated products
      await fs.writeFile(CONFIG.PRODUCTS_JSON, JSON.stringify(products, null, 2));
      
      await this.printSummary();
      
    } catch (error) {
      await this.log(`Update failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async printSummary() {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    
    await this.log('\n📊 SITEPHOTO NAME UPDATE SUMMARY');
    await this.log('═'.repeat(50));
    await this.log(`✅ Products Updated: ${this.updatedCount}`);
    await this.log(`❌ Errors: ${this.errorCount}`);
    await this.log(`⏱️  Duration: ${duration} seconds`);
    await this.log('═'.repeat(50));
    
    if (this.updatedCount > 0) {
      await this.log('🎉 Name update completed successfully!');
      await this.log('💡 All sitephoto products now have proper names');
    } else {
      await this.log('⚠️  No products were updated');
    }
  }
}

// Main execution
async function main() {
  const updater = new SitephotoNameUpdater();
  
  try {
    await updater.updateProductNames();
  } catch (error) {
    console.error(`❌ Update failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { SitephotoNameUpdater };