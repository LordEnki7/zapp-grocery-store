#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
  SITEPHOTO_DIR: path.join(__dirname, '..', 'sitephoto'),
  PRODUCTS_JSON: path.join(__dirname, '..', 'data', 'products', 'products.json'),
  PUBLIC_IMAGES_DIR: path.join(__dirname, '..', 'public', 'images', 'products'),
  SUPPORTED_FORMATS: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'],
  LOG_FILE: path.join(__dirname, '..', 'logs', 'complete-sitephoto-update.log')
};

class CompleteSitephotoUpdater {
  constructor() {
    this.updatedCount = 0;
    this.copiedCount = 0;
    this.errorCount = 0;
    this.startTime = Date.now();
    this.imageMapping = new Map();
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

  async buildImageMapping() {
    await this.log('🔍 Building comprehensive image mapping from sitephoto directory...');
    
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
            const properName = this.extractProperName(path.parse(image).name);
            const normalizedName = this.normalizeForMatching(image);
            const cleanImageName = this.cleanImageName(image);
            
            // Store multiple mapping keys for better matching
            const mappingData = {
              originalPath: path.join(categoryPath, image),
              category: category,
              originalFilename: image,
              properName: properName,
              cleanImageName: cleanImageName
            };
            
            // Map by various keys for flexible matching
            this.imageMapping.set(normalizedName, mappingData);
            this.imageMapping.set(cleanImageName, mappingData);
            this.imageMapping.set(image.toLowerCase(), mappingData);
            
            // Also map by the processed filename that might be in products.json
            const processedName = this.getProcessedImageName(image);
            this.imageMapping.set(processedName, mappingData);
          }
          
          await this.log(`Mapped ${images.length} images from ${category}`);
        }
      }
      
      await this.log(`Total image mappings created: ${this.imageMapping.size}`);
      return this.imageMapping;
    } catch (error) {
      await this.log(`Error building image mapping: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  extractProperName(filename) {
    return filename
      .replace(/_/g, ' ')
      .replace(/\./g, ' ')
      .replace(/&/g, 'and')
      .replace(/'/g, "'")
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .map(word => {
        if (word.toLowerCase() === 'and' || word.toLowerCase() === 'of' || word.toLowerCase() === 'the') {
          return word.toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  }

  normalizeForMatching(filename) {
    return filename
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9.-]/g, '')
      .replace(/-+/g, '-');
  }

  cleanImageName(filename) {
    return path.parse(filename).name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
  }

  getProcessedImageName(filename) {
    // This mimics how the original sitephoto-bulk-import might have processed names
    return path.parse(filename).name
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9]/g, '') + path.extname(filename).toLowerCase();
  }

  async copyImageToPublic(originalPath, targetFilename) {
    try {
      const targetPath = path.join(CONFIG.PUBLIC_IMAGES_DIR, targetFilename);
      await fs.copyFile(originalPath, targetPath);
      this.copiedCount++;
      return true;
    } catch (error) {
      await this.log(`Error copying image ${targetFilename}: ${error.message}`, 'ERROR');
      this.errorCount++;
      return false;
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

  findBestMatch(product) {
    if (!product.images || product.images.length === 0) return null;
    
    const currentImagePath = product.images[0];
    const currentImageName = path.basename(currentImagePath);
    
    // Try various matching strategies
    const matchingKeys = [
      currentImageName,
      currentImageName.toLowerCase(),
      this.cleanImageName(currentImageName),
      this.normalizeForMatching(currentImageName),
      this.getProcessedImageName(currentImageName)
    ];
    
    for (const key of matchingKeys) {
      if (this.imageMapping.has(key)) {
        return this.imageMapping.get(key);
      }
    }
    
    return null;
  }

  async updateAllSitephotoProducts() {
    await this.log('🚀 Starting complete sitephoto update process...');
    
    try {
      // Build comprehensive image mapping
      await this.buildImageMapping();
      
      // Load existing products
      const data = await fs.readFile(CONFIG.PRODUCTS_JSON, 'utf8');
      const products = JSON.parse(data);
      
      // Update sitephoto products
      for (const product of products) {
        if (product.createdBy === 'sitephoto-importer') {
          const matchData = this.findBestMatch(product);
          
          if (matchData) {
            const oldName = product.name;
            const oldImage = product.images[0];
            
            // Create new image filename
            const newImageName = `${matchData.properName.replace(/\s+/g, '-').toLowerCase()}${path.extname(matchData.originalFilename)}`;
            
            // Copy original image to public directory
            const success = await this.copyImageToPublic(matchData.originalPath, newImageName);
            
            if (success) {
              // Update product with proper name and image
              const newImagePath = `/images/products/${newImageName}`;
              product.name = matchData.properName;
              product.description = this.generateDescription(matchData.properName, matchData.category);
              product.images = [newImagePath];
              product.primaryImage = newImagePath;
              product.updatedAt = new Date().toISOString();
              product.updatedBy = 'complete-sitephoto-updater';
              
              this.updatedCount++;
              await this.log(`✅ Updated: "${oldName}" → "${matchData.properName}"`);
              await this.log(`   Image: "${oldImage}" → "${newImagePath}"`);
            }
          } else {
            await this.log(`⚠️  No match found for product: ${product.name} (${product.images[0]})`, 'WARN');
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
    
    await this.log('\n📊 COMPLETE SITEPHOTO UPDATE SUMMARY');
    await this.log('═'.repeat(50));
    await this.log(`✅ Products Updated: ${this.updatedCount}`);
    await this.log(`📁 Images Copied: ${this.copiedCount}`);
    await this.log(`❌ Errors: ${this.errorCount}`);
    await this.log(`🗺️  Total Mappings: ${this.imageMapping.size}`);
    await this.log(`⏱️  Duration: ${duration} seconds`);
    await this.log('═'.repeat(50));
    
    if (this.updatedCount > 0) {
      await this.log('🎉 Complete update finished successfully!');
      await this.log('💡 All sitephoto products now use proper names and original images');
    } else {
      await this.log('⚠️  No products were updated');
    }
  }
}

// Main execution
async function main() {
  const updater = new CompleteSitephotoUpdater();
  
  try {
    await updater.updateAllSitephotoProducts();
  } catch (error) {
    console.error(`❌ Update failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { CompleteSitephotoUpdater };