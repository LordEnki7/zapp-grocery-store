#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
  SITEPHOTO_DIR: path.join(__dirname, '..', 'sitephoto'),
  PRODUCTS_DIR: path.join(__dirname, '..', 'public', 'images', 'products'),
  PRODUCTS_JSON: path.join(__dirname, '..', 'data', 'products', 'products.json'),
  CATEGORIES_JSON: path.join(__dirname, '..', 'data', 'categories', 'categories.json'),
  SUPPORTED_FORMATS: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'],
  LOG_FILE: path.join(__dirname, '..', 'logs', 'sitephoto-import.log')
};

class SitephotoImporter {
  constructor() {
    this.processedCount = 0;
    this.errorCount = 0;
    this.newProductsCount = 0;
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

  async scanSitephotoDirectory() {
    await this.log('🔍 Scanning sitephoto directory...');
    
    try {
      const categories = await fs.readdir(CONFIG.SITEPHOTO_DIR);
      const imageMap = new Map();
      
      for (const category of categories) {
        const categoryPath = path.join(CONFIG.SITEPHOTO_DIR, category);
        const stat = await fs.stat(categoryPath);
        
        if (stat.isDirectory()) {
          const files = await fs.readdir(categoryPath);
          const images = files.filter(file => 
            CONFIG.SUPPORTED_FORMATS.includes(path.extname(file).toLowerCase())
          );
          
          if (images.length > 0) {
            imageMap.set(category, images);
            await this.log(`Found ${images.length} images in ${category}`);
          }
        }
      }
      
      return imageMap;
    } catch (error) {
      await this.log(`Error scanning sitephoto directory: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async loadExistingProducts() {
    try {
      const data = await fs.readFile(CONFIG.PRODUCTS_JSON, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      await this.log(`Error loading products.json: ${error.message}`, 'ERROR');
      return [];
    }
  }

  async loadExistingCategories() {
    try {
      const data = await fs.readFile(CONFIG.CATEGORIES_JSON, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      await this.log(`Categories.json not found, will create new one`, 'WARN');
      return [];
    }
  }

  normalizeImageName(filename) {
    return filename
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9.-]/g, '')
      .replace(/-+/g, '-');
  }

  generateProductFromImage(imageName, category, existingProducts) {
    // Remove extension and normalize
    const baseName = path.parse(imageName).name;
    const normalizedName = baseName
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Generate unique ID
    const maxId = Math.max(...existingProducts.map(p => parseInt(p.id.replace('p', '')) || 0), 0);
    const newId = `p${maxId + 1}`;
    
    // Generate price based on category
    const priceMap = {
      'Apple Cider Viniger': { min: 8, max: 15 },
      'Beans': { min: 3, max: 8 },
      'Breakfast Cereal': { min: 5, max: 12 },
      'Candy': { min: 2, max: 6 },
      'Coffee': { min: 8, max: 25 },
      'Fresh Foods': { min: 2, max: 15 },
      'Gift Cards': { min: 10, max: 100 },
      'New African Products': { min: 5, max: 20 },
      'Pharmacy': { min: 5, max: 30 }
    };
    
    const priceRange = priceMap[category] || { min: 5, max: 15 };
    const price = Math.floor(Math.random() * (priceRange.max - priceRange.min + 1)) + priceRange.min;
    
    return {
      id: newId,
      name: normalizedName,
      description: `Premium ${normalizedName.toLowerCase()} from our ${category.toLowerCase()} collection. High quality product sourced with care.`,
      price: price,
      currency: 'USD',
      images: [`/images/products/${this.normalizeImageName(imageName)}`],
      primaryImage: `/images/products/${this.normalizeImageName(imageName)}`,
      origin: this.getCategoryOrigin(category),
      category: this.normalizeCategoryName(category),
      weight: this.generateWeight(category),
      sku: `${category.substring(0, 3).toUpperCase()}${String(maxId + 1).padStart(3, '0')}`,
      stock: Math.floor(Math.random() * 50) + 10,
      lowStockThreshold: 5,
      inStock: true,
      featured: Math.random() < 0.2, // 20% chance of being featured
      isActive: true,
      tags: this.generateTags(normalizedName, category),
      averageRating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 to 5.0
      reviewCount: Math.floor(Math.random() * 100),
      totalSold: Math.floor(Math.random() * 500),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'sitephoto-importer',
      updatedBy: 'sitephoto-importer'
    };
  }

  getCategoryOrigin(category) {
    const originMap = {
      'Apple Cider Viniger': 'USA',
      'Beans': 'Jamaica',
      'Breakfast Cereal': 'USA',
      'Candy': 'Various',
      'Coffee': 'Jamaica',
      'Fresh Foods': 'Local',
      'Gift Cards': 'Digital',
      'New African Products': 'Africa',
      'Pharmacy': 'USA'
    };
    return originMap[category] || 'Various';
  }

  normalizeCategoryName(category) {
    const categoryMap = {
      'Apple Cider Viniger': 'beverages',
      'Beans': 'pantry',
      'Breakfast Cereal': 'breakfast',
      'Candy': 'snacks',
      'Coffee': 'beverages',
      'Fresh Foods': 'fresh',
      'Gift Cards': 'gift-cards',
      'New African Products': 'specialty',
      'Pharmacy': 'health'
    };
    return categoryMap[category] || 'general';
  }

  generateWeight(category) {
    const weightMap = {
      'Apple Cider Viniger': '16 fl oz',
      'Beans': '1 lb',
      'Breakfast Cereal': '12 oz',
      'Candy': '4 oz',
      'Coffee': '12 oz',
      'Fresh Foods': '1 lb',
      'Gift Cards': 'Digital',
      'New African Products': '8 oz',
      'Pharmacy': '1 unit'
    };
    return weightMap[category] || '1 unit';
  }

  generateTags(productName, category) {
    const baseTags = [category.toLowerCase().replace(/\s+/g, '-')];
    const words = productName.toLowerCase().split(' ');
    return [...baseTags, ...words.slice(0, 3)];
  }

  async copyImage(sourcePath, targetName) {
    try {
      const targetPath = path.join(CONFIG.PRODUCTS_DIR, targetName);
      await fs.copyFile(sourcePath, targetPath);
      return true;
    } catch (error) {
      await this.log(`Failed to copy ${sourcePath}: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async processAllImages() {
    await this.log('🚀 Starting comprehensive sitephoto import...');
    
    try {
      // Scan sitephoto directory
      const imageMap = await this.scanSitephotoDirectory();
      
      // Load existing data
      const existingProducts = await this.loadExistingProducts();
      const existingCategories = await this.loadExistingCategories();
      
      const newProducts = [...existingProducts];
      const newCategories = [...existingCategories];
      
      // Process each category
      for (const [category, images] of imageMap) {
        await this.log(`📁 Processing category: ${category} (${images.length} images)`);
        
        // Add category if not exists
        const normalizedCategoryName = this.normalizeCategoryName(category);
        if (!newCategories.find(cat => cat.id === normalizedCategoryName)) {
          newCategories.push({
            id: normalizedCategoryName,
            name: category,
            description: `${category} products collection`,
            image: `/images/categories/${normalizedCategoryName}.jpg`,
            isActive: true,
            sortOrder: newCategories.length + 1
          });
        }
        
        // Process each image
        for (const image of images) {
          try {
            const sourcePath = path.join(CONFIG.SITEPHOTO_DIR, category, image);
            const normalizedImageName = this.normalizeImageName(image);
            
            // Check if product already exists
            const existingProduct = existingProducts.find(p => 
              p.images && p.images.some(img => img.includes(normalizedImageName))
            );
            
            if (existingProduct) {
              await this.log(`⏭️  Skipping ${image} - product already exists`);
              continue;
            }
            
            // Copy image
            const copySuccess = await this.copyImage(sourcePath, normalizedImageName);
            if (!copySuccess) {
              this.errorCount++;
              continue;
            }
            
            // Generate product
            const newProduct = this.generateProductFromImage(image, category, newProducts);
            newProducts.push(newProduct);
            
            this.processedCount++;
            this.newProductsCount++;
            
            await this.log(`✅ Added: ${newProduct.name} (${normalizedImageName})`);
            
          } catch (error) {
            this.errorCount++;
            await this.log(`❌ Failed to process ${image}: ${error.message}`, 'ERROR');
          }
        }
      }
      
      // Save updated data
      await fs.writeFile(CONFIG.PRODUCTS_JSON, JSON.stringify(newProducts, null, 2));
      await fs.writeFile(CONFIG.CATEGORIES_JSON, JSON.stringify(newCategories, null, 2));
      
      await this.printSummary();
      
    } catch (error) {
      await this.log(`Import failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async printSummary() {
    const duration = Math.round((Date.now() - this.startTime) / 1000);
    
    await this.log('\n📊 IMPORT SUMMARY');
    await this.log('═'.repeat(50));
    await this.log(`⏱️  Duration: ${duration}s`);
    await this.log(`✅ Images processed: ${this.processedCount}`);
    await this.log(`🆕 New products created: ${this.newProductsCount}`);
    await this.log(`❌ Errors: ${this.errorCount}`);
    await this.log('═'.repeat(50));
    
    if (this.newProductsCount > 0) {
      await this.log('🎉 Import completed successfully!');
      await this.log('💡 Remember to restart your dev server: npm run dev');
    }
  }
}

// Main execution
async function main() {
  const importer = new SitephotoImporter();
  
  try {
    await importer.processAllImages();
  } catch (error) {
    console.error(`❌ Import failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { SitephotoImporter };