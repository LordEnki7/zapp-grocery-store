#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

class ProductServiceUpdater {
  constructor() {
    this.productServicePath = path.join(__dirname, '..', 'src', 'services', 'productService.ts');
    this.backupPath = path.join(__dirname, '..', 'backups', 'productService-backup.ts');
  }

  async log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}] ${message}`);
  }

  async createBackup() {
    try {
      await fs.mkdir(path.dirname(this.backupPath), { recursive: true });
      await fs.copyFile(this.productServicePath, this.backupPath);
      await this.log(`Backup created: ${this.backupPath}`);
      return true;
    } catch (error) {
      await this.log(`Failed to create backup: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async readProductService() {
    try {
      const content = await fs.readFile(this.productServicePath, 'utf8');
      return content;
    } catch (error) {
      await this.log(`Failed to read productService.ts: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async writeProductService(content) {
    try {
      await fs.writeFile(this.productServicePath, content, 'utf8');
      await this.log('ProductService.ts updated successfully');
      return true;
    } catch (error) {
      await this.log(`Failed to write productService.ts: ${error.message}`, 'ERROR');
      return false;
    }
  }

  normalizeImageName(fileName) {
    return fileName
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async findImageReferences(content) {
    // Find all image references in the productService
    const imageRegex = /image:\s*['"`]([^'"`]+)['"`]/g;
    const references = [];
    let match;

    while ((match = imageRegex.exec(content)) !== null) {
      references.push({
        fullMatch: match[0],
        imagePath: match[1],
        index: match.index
      });
    }

    return references;
  }

  async updateImageReferences(oldImageName, newImageName) {
    await this.log(`Updating image reference: ${oldImageName} -> ${newImageName}`);
    
    try {
      // Create backup first
      const backupCreated = await this.createBackup();
      if (!backupCreated) {
        throw new Error('Failed to create backup');
      }

      let content = await this.readProductService();
      const references = await this.findImageReferences(content);
      
      let updatedCount = 0;
      
      // Update all references to the old image name
      references.forEach(ref => {
        const currentImageName = path.basename(ref.imagePath);
        if (currentImageName === oldImageName) {
          const newPath = ref.imagePath.replace(oldImageName, newImageName);
          content = content.replace(ref.fullMatch, `image: '${newPath}'`);
          updatedCount++;
        }
      });

      if (updatedCount > 0) {
        await this.writeProductService(content);
        await this.log(`Updated ${updatedCount} image references`);
      } else {
        await this.log(`No references found for ${oldImageName}`, 'WARN');
      }

      return updatedCount;
    } catch (error) {
      await this.log(`Failed to update image references: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async removeImageReferences(imageNames) {
    await this.log(`Removing image references for ${imageNames.length} images`);
    
    try {
      // Create backup first
      const backupCreated = await this.createBackup();
      if (!backupCreated) {
        throw new Error('Failed to create backup');
      }

      let content = await this.readProductService();
      const references = await this.findImageReferences(content);
      
      let removedCount = 0;
      
      // Find products that reference the images to be removed
      imageNames.forEach(imageName => {
        references.forEach(ref => {
          const currentImageName = path.basename(ref.imagePath);
          if (currentImageName === imageName) {
            // Replace with placeholder image
            const newPath = ref.imagePath.replace(imageName, 'product-placeholder.svg');
            content = content.replace(ref.fullMatch, `image: '${newPath}'`);
            removedCount++;
          }
        });
      });

      if (removedCount > 0) {
        await this.writeProductService(content);
        await this.log(`Removed ${removedCount} image references (replaced with placeholder)`);
      } else {
        await this.log('No references found for removed images', 'WARN');
      }

      return removedCount;
    } catch (error) {
      await this.log(`Failed to remove image references: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async addImageReferences(imageMap) {
    await this.log(`Adding image references for ${Object.keys(imageMap).length} products`);
    
    try {
      // Create backup first
      const backupCreated = await this.createBackup();
      if (!backupCreated) {
        throw new Error('Failed to create backup');
      }

      let content = await this.readProductService();
      let updatedCount = 0;

      // For each product-image mapping
      Object.entries(imageMap).forEach(([productName, imageName]) => {
        // Find the product in the service and update its image
        const productRegex = new RegExp(
          `(name:\\s*['"\`]${productName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"\`][^}]*image:\\s*)['"\`][^'"\`]*['"\`]`,
          'gi'
        );
        
        const match = content.match(productRegex);
        if (match) {
          content = content.replace(productRegex, `$1'${imageName}'`);
          updatedCount++;
        }
      });

      if (updatedCount > 0) {
        await this.writeProductService(content);
        await this.log(`Added ${updatedCount} new image references`);
      } else {
        await this.log('No products found to update with new images', 'WARN');
      }

      return updatedCount;
    } catch (error) {
      await this.log(`Failed to add image references: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async validateImageReferences() {
    await this.log('Validating all image references in productService.ts');
    
    try {
      const content = await this.readProductService();
      const references = await this.findImageReferences(content);
      const imagesDir = path.join(__dirname, '..', 'public', 'images', 'products');
      
      const issues = [];
      
      for (const ref of references) {
        const imageName = path.basename(ref.imagePath);
        const fullImagePath = path.join(imagesDir, imageName);
        
        try {
          await fs.access(fullImagePath);
        } catch (error) {
          issues.push({
            imagePath: ref.imagePath,
            issue: 'File not found',
            fullPath: fullImagePath
          });
        }
      }

      if (issues.length > 0) {
        await this.log(`Found ${issues.length} image reference issues:`, 'WARN');
        issues.forEach(issue => {
          console.log(`  ❌ ${issue.imagePath} - ${issue.issue}`);
        });
      } else {
        await this.log('All image references are valid ✅');
      }

      return issues;
    } catch (error) {
      await this.log(`Failed to validate image references: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async listAllImageReferences() {
    try {
      const content = await this.readProductService();
      const references = await this.findImageReferences(content);
      
      console.log(`\n📋 Found ${references.length} image references:`);
      references.forEach((ref, index) => {
        console.log(`  ${index + 1}. ${ref.imagePath}`);
      });

      return references;
    } catch (error) {
      await this.log(`Failed to list image references: ${error.message}`, 'ERROR');
      throw error;
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command) {
    console.log(`
🔧 Product Service Image Updater

Usage:
  node product-service-updater.js update <old-name> <new-name>
  node product-service-updater.js remove <image-name> [image-name...]
  node product-service-updater.js add <product-name> <image-name>
  node product-service-updater.js validate
  node product-service-updater.js list

Commands:
  update     Update image reference from old name to new name
  remove     Remove image references (replace with placeholder)
  add        Add image reference for a product
  validate   Check all image references exist
  list       List all current image references

Examples:
  node product-service-updater.js update "old-image.jpg" "new-image.webp"
  node product-service-updater.js remove "deleted-image.jpg"
  node product-service-updater.js add "Jamaican Ginger Beer" "ginger-beer.webp"
  node product-service-updater.js validate
    `);
    return;
  }

  const updater = new ProductServiceUpdater();
  
  try {
    switch (command) {
      case 'update': {
        const oldName = args[1];
        const newName = args[2];
        if (!oldName || !newName) {
          console.error('❌ Both old and new image names required');
          process.exit(1);
        }
        await updater.updateImageReferences(oldName, newName);
        break;
      }
      
      case 'remove': {
        const imageNames = args.slice(1);
        if (imageNames.length === 0) {
          console.error('❌ At least one image name required');
          process.exit(1);
        }
        await updater.removeImageReferences(imageNames);
        break;
      }
      
      case 'add': {
        const productName = args[1];
        const imageName = args[2];
        if (!productName || !imageName) {
          console.error('❌ Product name and image name required');
          process.exit(1);
        }
        const imageMap = { [productName]: imageName };
        await updater.addImageReferences(imageMap);
        break;
      }
      
      case 'validate': {
        await updater.validateImageReferences();
        break;
      }
      
      case 'list': {
        await updater.listAllImageReferences();
        break;
      }
      
      default:
        console.error(`❌ Unknown command: ${command}`);
        process.exit(1);
    }
  } catch (error) {
    console.error(`❌ Operation failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { ProductServiceUpdater };