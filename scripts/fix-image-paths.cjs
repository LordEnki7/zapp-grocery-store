#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
  PRODUCTS_JSON: path.join(__dirname, '..', 'data', 'products', 'products.json'),
  PUBLIC_IMAGES_DIR: path.join(__dirname, '..', 'public', 'images', 'products')
};

class ImagePathFixer {
  constructor() {
    this.fixedCount = 0;
    this.errorCount = 0;
  }

  async log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;
    console.log(logMessage);
  }

  async getActualImageFiles() {
    const imageFiles = new Map();
    
    try {
      const files = await fs.readdir(CONFIG.PUBLIC_IMAGES_DIR);
      
      for (const file of files) {
        const lowerFile = file.toLowerCase();
        const normalizedFile = lowerFile.replace(/\s+/g, '-');
        
        // Map both lowercase and normalized versions to the actual filename
        imageFiles.set(lowerFile, file);
        imageFiles.set(normalizedFile, file);
        imageFiles.set(file, file); // Also map exact match
      }
      
      await this.log(`Found ${files.length} image files in public directory`);
      return imageFiles;
    } catch (error) {
      await this.log(`Error reading image directory: ${error.message}`, 'ERROR');
      return new Map();
    }
  }

  async fixImagePaths() {
    await this.log('🚀 Starting image path fix process...');
    
    try {
      // Get actual image files
      const actualFiles = await this.getActualImageFiles();
      
      // Load products.json
      const data = await fs.readFile(CONFIG.PRODUCTS_JSON, 'utf8');
      const products = JSON.parse(data);
      
      // Fix each product's image paths
      for (const product of products) {
        if (product.images && product.images.length > 0) {
          let hasChanges = false;
          
          // Fix images array
          for (let i = 0; i < product.images.length; i++) {
            const imagePath = product.images[i];
            if (imagePath.startsWith('/images/products/')) {
              const filename = path.basename(imagePath);
              const actualFilename = actualFiles.get(filename);
              
              if (actualFilename && actualFilename !== filename) {
                const newPath = `/images/products/${actualFilename}`;
                product.images[i] = newPath;
                hasChanges = true;
                await this.log(`Fixed image: ${imagePath} → ${newPath}`);
              }
            }
          }
          
          // Fix primaryImage
          if (product.primaryImage && product.primaryImage.startsWith('/images/products/')) {
            const filename = path.basename(product.primaryImage);
            const actualFilename = actualFiles.get(filename);
            
            if (actualFilename && actualFilename !== filename) {
              const newPath = `/images/products/${actualFilename}`;
              product.primaryImage = newPath;
              hasChanges = true;
              await this.log(`Fixed primary image: ${product.primaryImage} → ${newPath}`);
            }
          }
          
          if (hasChanges) {
            this.fixedCount++;
          }
        }
      }
      
      // Save updated products.json
      await fs.writeFile(CONFIG.PRODUCTS_JSON, JSON.stringify(products, null, 2));
      
      await this.log(`✅ Process completed! Fixed ${this.fixedCount} products`);
      
    } catch (error) {
      await this.log(`Error during fix process: ${error.message}`, 'ERROR');
      this.errorCount++;
    }
  }
}

// Run the fixer
async function main() {
  const fixer = new ImagePathFixer();
  await fixer.fixImagePaths();
  
  if (fixer.errorCount > 0) {
    process.exit(1);
  }
}

main().catch(console.error);