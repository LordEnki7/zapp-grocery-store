#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
  SITEPHOTO_DIR: path.join(__dirname, '..', 'sitephoto'),
  PRODUCTS_JSON: path.join(__dirname, '..', 'data', 'products', 'products.json'),
  PUBLIC_IMAGES_DIR: path.join(__dirname, '..', 'public', 'images', 'products'),
  SUPPORTED_FORMATS: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'],
  LOG_FILE: path.join(__dirname, '..', 'logs', 'sitephoto-image-update.log')
};

class SitephotoImageUpdater {
  constructor() {
    this.updatedCount = 0;
    this.copiedCount = 0;
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

  async scanSitephotoImages() {
    await this.log('🔍 Scanning sitephoto directory for original images...');
    
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
          
          for (const image of images) {
            const normalizedName = this.normalizeImageName(image);
            const properName = this.extractProperName(path.parse(image).name);
            
            imageMap.set(normalizedName, {
              originalPath: path.join(categoryPath, image),
              category: category,
              originalFilename: image,
              properName: properName
            });
          }
          
          await this.log(`Found ${images.length} images in ${category}`);
        }
      }
      
      return imageMap;
    } catch (error) {
      await this.log(`Error scanning sitephoto directory: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  normalizeImageName(filename) {
    return filename
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9.-]/g, '')
      .replace(/-+/g, '-');
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

  async copyImageToPublic(originalPath, targetFilename) {
    try {
      const targetPath = path.join(CONFIG.PUBLIC_IMAGES_DIR, targetFilename);
      await fs.copyFile(originalPath, targetPath);
      this.copiedCount++;
      return true;
    } catch (error) {
      await this.log(`Error copying image: ${error.message}`, 'ERROR');
      this.errorCount++;
      return false;
    }
  }

  async updateProductImages() {
    await this.log('🚀 Starting sitephoto image update process...');
    
    try {
      // Get image mapping from sitephoto directory
      const imageMap = await this.scanSitephotoImages();
      
      // Load existing products
      const data = await fs.readFile(CONFIG.PRODUCTS_JSON, 'utf8');
      const products = JSON.parse(data);
      
      // Update products with proper images
      for (const product of products) {
        if (product.createdBy === 'sitephoto-importer' && product.images && product.images.length > 0) {
          const currentImagePath = product.images[0];
          const currentImageName = path.basename(currentImagePath);
          
          if (imageMap.has(currentImageName)) {
            const imageInfo = imageMap.get(currentImageName);
            
            // Copy original image to public directory with proper name
            const newImageName = `${imageInfo.properName.replace(/\s+/g, '-').toLowerCase()}${path.extname(imageInfo.originalFilename)}`;
            const success = await this.copyImageToPublic(imageInfo.originalPath, newImageName);
            
            if (success) {
              // Update product with new image path and name
              const newImagePath = `/images/products/${newImageName}`;
              product.images = [newImagePath];
              product.primaryImage = newImagePath;
              product.name = imageInfo.properName;
              product.updatedAt = new Date().toISOString();
              product.updatedBy = 'sitephoto-image-updater';
              
              this.updatedCount++;
              await this.log(`✅ Updated: "${product.id}" → "${imageInfo.properName}" (${newImageName})`);
            }
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
    
    await this.log('\n📊 SITEPHOTO IMAGE UPDATE SUMMARY');
    await this.log('═'.repeat(50));
    await this.log(`✅ Products Updated: ${this.updatedCount}`);
    await this.log(`📁 Images Copied: ${this.copiedCount}`);
    await this.log(`❌ Errors: ${this.errorCount}`);
    await this.log(`⏱️  Duration: ${duration} seconds`);
    await this.log('═'.repeat(50));
    
    if (this.updatedCount > 0) {
      await this.log('🎉 Image update completed successfully!');
      await this.log('💡 All sitephoto products now use original images');
    } else {
      await this.log('⚠️  No products were updated');
    }
  }
}

// Main execution
async function main() {
  const updater = new SitephotoImageUpdater();
  
  try {
    await updater.updateProductImages();
  } catch (error) {
    console.error(`❌ Update failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { SitephotoImageUpdater };