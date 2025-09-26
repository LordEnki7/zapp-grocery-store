#!/usr/bin/env node

const { BulkImageManager } = require('./bulk-images.js');
const { ProductServiceUpdater } = require('./product-service-updater.js');
const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

class IntegratedBulkImageManager extends BulkImageManager {
  constructor() {
    super();
    this.productUpdater = new ProductServiceUpdater();
  }

  async bulkUploadWithProductUpdate(sourceDirectory, options = {}) {
    await this.log('🚀 Starting integrated bulk upload with product service updates');
    
    try {
      // First, perform the bulk upload
      const uploadResults = await this.bulkUpload(sourceDirectory, options);
      
      if (!uploadResults || uploadResults.length === 0) {
        await this.log('No files were uploaded, skipping product service updates');
        return uploadResults;
      }

      // Extract successful uploads
      const successfulUploads = uploadResults
        .filter(result => result.value && result.value.status === 'success')
        .map(result => result.value);

      if (successfulUploads.length === 0) {
        await this.log('No successful uploads, skipping product service updates');
        return uploadResults;
      }

      await this.log(`Updating product service for ${successfulUploads.length} uploaded images`);

      // Update product service references
      let productUpdateCount = 0;
      for (const upload of successfulUploads) {
        try {
          if (upload.file !== upload.target) {
            // File was renamed, update references
            const count = await this.productUpdater.updateImageReferences(
              upload.file, 
              upload.target
            );
            productUpdateCount += count;
          }
        } catch (error) {
          await this.log(`Failed to update product reference for ${upload.file}: ${error.message}`, 'ERROR');
        }
      }

      await this.log(`✅ Updated ${productUpdateCount} product service references`);
      
      // Validate all references
      if (options.validate !== false) {
        await this.log('🔍 Validating all image references...');
        await this.productUpdater.validateImageReferences();
      }

      return uploadResults;
    } catch (error) {
      await this.log(`Integrated bulk upload failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async bulkRemoveWithProductUpdate(pattern, options = {}) {
    await this.log('🗑️ Starting integrated bulk removal with product service updates');
    
    try {
      // First, identify files that will be removed
      const allFiles = await this.getImageFiles(this.constructor.CONFIG?.IMAGES_DIR || 
        path.join(__dirname, '..', 'public', 'images', 'products'));
      
      const matchingFiles = allFiles.filter(file => {
        if (pattern === '*') return true;
        if (pattern.includes('*')) {
          const regex = new RegExp(pattern.replace(/\*/g, '.*'), 'i');
          return regex.test(file);
        }
        return file.toLowerCase().includes(pattern.toLowerCase());
      });

      if (matchingFiles.length === 0) {
        await this.log('No files match the removal pattern');
        return [];
      }

      // Update product service first (replace with placeholders)
      await this.log(`Updating product service to remove references for ${matchingFiles.length} images`);
      const productUpdateCount = await this.productUpdater.removeImageReferences(matchingFiles);
      await this.log(`✅ Updated ${productUpdateCount} product service references`);

      // Then perform the bulk removal
      const removalResults = await this.bulkRemove(pattern, options);

      // Validate all references
      if (options.validate !== false) {
        await this.log('🔍 Validating all image references...');
        await this.productUpdater.validateImageReferences();
      }

      return removalResults;
    } catch (error) {
      await this.log(`Integrated bulk removal failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async smartImageMapping(sourceDirectory, options = {}) {
    await this.log('🧠 Starting smart image mapping based on filenames');
    
    try {
      const sourceFiles = await this.getImageFiles(sourceDirectory);
      const productContent = await this.productUpdater.readProductService();
      
      // Extract product names from productService.ts
      const productNameRegex = /name:\s*['"`]([^'"`]+)['"`]/g;
      const productNames = [];
      let match;
      
      while ((match = productNameRegex.exec(productContent)) !== null) {
        productNames.push(match[1]);
      }

      await this.log(`Found ${productNames.length} products in service`);
      await this.log(`Found ${sourceFiles.length} source images`);

      // Smart mapping logic
      const mappings = [];
      const unmappedImages = [];
      const unmappedProducts = [];

      sourceFiles.forEach(imageFile => {
        const imageName = path.parse(imageFile).name.toLowerCase();
        
        // Try to find matching product
        const matchingProduct = productNames.find(productName => {
          const productNameNormalized = productName.toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .replace(/\s+/g, '');
          const imageNameNormalized = imageName
            .replace(/[^a-z0-9]/g, '')
            .replace(/\s+/g, '');
          
          // Exact match
          if (productNameNormalized === imageNameNormalized) return true;
          
          // Partial match (image name contains product name or vice versa)
          if (productNameNormalized.includes(imageNameNormalized) || 
              imageNameNormalized.includes(productNameNormalized)) return true;
          
          // Fuzzy match for common variations
          const productWords = productName.toLowerCase().split(/\s+/);
          const imageWords = imageName.toLowerCase().split(/[-_\s]+/);
          
          const commonWords = productWords.filter(word => 
            imageWords.some(imgWord => imgWord.includes(word) || word.includes(imgWord))
          );
          
          return commonWords.length >= Math.min(2, productWords.length);
        });

        if (matchingProduct) {
          mappings.push({
            imageFile,
            productName: matchingProduct,
            confidence: 'high'
          });
        } else {
          unmappedImages.push(imageFile);
        }
      });

      // Find products without images
      productNames.forEach(productName => {
        const hasMapping = mappings.some(m => m.productName === productName);
        if (!hasMapping) {
          unmappedProducts.push(productName);
        }
      });

      // Display results
      console.log(`\n📊 Smart Mapping Results:`);
      console.log(`  ✅ Mapped: ${mappings.length}`);
      console.log(`  ❓ Unmapped Images: ${unmappedImages.length}`);
      console.log(`  🔍 Products without Images: ${unmappedProducts.length}`);

      if (mappings.length > 0) {
        console.log(`\n📋 Proposed Mappings:`);
        mappings.forEach((mapping, index) => {
          console.log(`  ${index + 1}. ${mapping.imageFile} → ${mapping.productName}`);
        });
      }

      if (unmappedImages.length > 0) {
        console.log(`\n❓ Unmapped Images:`);
        unmappedImages.forEach(img => console.log(`  - ${img}`));
      }

      if (unmappedProducts.length > 0 && unmappedProducts.length <= 10) {
        console.log(`\n🔍 Products without Images:`);
        unmappedProducts.forEach(product => console.log(`  - ${product}`));
      }

      // Ask for confirmation
      if (mappings.length > 0 && !options.skipConfirmation) {
        const confirmed = await this.confirmAction(
          `Apply ${mappings.length} smart mappings and upload images?`
        );
        
        if (confirmed) {
          // Upload images with smart naming
          const uploadOptions = {
            ...options,
            normalize: true,
            overwrite: true,
            createBackup: true
          };

          // Create custom processor for smart uploads
          await fs.mkdir(path.join(__dirname, '..', 'public', 'images', 'products'), { recursive: true });

          for (const mapping of mappings) {
            try {
              const sourcePath = path.join(sourceDirectory, mapping.imageFile);
              const normalizedName = this.normalizeImageName(mapping.imageFile);
              const targetPath = path.join(__dirname, '..', 'public', 'images', 'products', normalizedName);

              // Copy file
              await fs.copyFile(sourcePath, targetPath);
              
              // Update product service
              const imageMap = { [mapping.productName]: normalizedName };
              await this.productUpdater.addImageReferences(imageMap);
              
              this.processedCount++;
              await this.log(`✅ Mapped and uploaded: ${mapping.imageFile} → ${mapping.productName}`);
            } catch (error) {
              this.errorCount++;
              await this.log(`❌ Failed to process mapping ${mapping.imageFile}: ${error.message}`, 'ERROR');
            }
          }

          await this.printSummary('Smart Mapping');
          
          // Validate
          if (options.validate !== false) {
            await this.productUpdater.validateImageReferences();
          }
        }
      }

      return { mappings, unmappedImages, unmappedProducts };
    } catch (error) {
      await this.log(`Smart image mapping failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async systemHealthCheck() {
    await this.log('🏥 Running system health check');
    
    try {
      console.log(`\n🏥 Bulk Image Management System Health Check\n`);
      
      // Check directories
      const imagesDir = path.join(__dirname, '..', 'public', 'images', 'products');
      const backupDir = path.join(__dirname, '..', 'backups');
      const logsDir = path.join(__dirname, '..', 'logs');
      
      console.log(`📁 Directory Status:`);
      
      try {
        await fs.access(imagesDir);
        const imageFiles = await this.getImageFiles(imagesDir);
        console.log(`  ✅ Images Directory: ${imageFiles.length} files`);
      } catch (error) {
        console.log(`  ❌ Images Directory: Not accessible`);
      }
      
      try {
        await fs.access(backupDir);
        console.log(`  ✅ Backup Directory: Accessible`);
      } catch (error) {
        console.log(`  ❌ Backup Directory: Not accessible`);
      }
      
      try {
        await fs.access(logsDir);
        console.log(`  ✅ Logs Directory: Accessible`);
      } catch (error) {
        console.log(`  ❌ Logs Directory: Not accessible`);
      }

      // Check product service
      console.log(`\n🔧 Product Service Status:`);
      try {
        const issues = await this.productUpdater.validateImageReferences();
        if (issues.length === 0) {
          console.log(`  ✅ All image references valid`);
        } else {
          console.log(`  ⚠️  ${issues.length} image reference issues found`);
        }
      } catch (error) {
        console.log(`  ❌ Product service validation failed: ${error.message}`);
      }

      // System recommendations
      console.log(`\n💡 Recommendations:`);
      console.log(`  • Run 'node bulk-images.js status' for detailed stats`);
      console.log(`  • Use 'node product-service-updater.js validate' to check references`);
      console.log(`  • Create backups before bulk operations with --backup flag`);
      console.log(`  • Use smart mapping for efficient bulk uploads`);
      
    } catch (error) {
      await this.log(`Health check failed: ${error.message}`, 'ERROR');
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
🖼️ Integrated Bulk Image Management System

Usage:
  node bulk-image-manager.js upload <source-directory> [options]
  node bulk-image-manager.js remove <pattern> [options]
  node bulk-image-manager.js smart-map <source-directory> [options]
  node bulk-image-manager.js health-check
  node bulk-image-manager.js validate

Commands:
  upload       Upload images with automatic product service updates
  remove       Remove images with automatic product service updates
  smart-map    Intelligently map images to products based on names
  health-check Run system health diagnostics
  validate     Validate all image references

Options:
  --overwrite      Overwrite existing files
  --backup         Create backups before operations
  --normalize      Normalize file names (default: true)
  --skip-confirm   Skip confirmation prompts
  --no-validate    Skip validation after operations

Examples:
  node bulk-image-manager.js upload ./new-images --backup
  node bulk-image-manager.js smart-map ./product-photos
  node bulk-image-manager.js remove "old-*" --backup
  node bulk-image-manager.js health-check
    `);
    return;
  }

  const manager = new IntegratedBulkImageManager();
  
  try {
    switch (command) {
      case 'upload': {
        const sourceDir = args[1];
        if (!sourceDir) {
          console.error('❌ Source directory required');
          process.exit(1);
        }
        
        const options = {
          overwrite: args.includes('--overwrite'),
          createBackup: args.includes('--backup'),
          normalize: !args.includes('--no-normalize'),
          skipConfirmation: args.includes('--skip-confirm'),
          validate: !args.includes('--no-validate')
        };
        
        await manager.bulkUploadWithProductUpdate(sourceDir, options);
        break;
      }
      
      case 'remove': {
        const pattern = args[1];
        if (!pattern) {
          console.error('❌ Pattern required');
          process.exit(1);
        }
        
        const options = {
          createBackup: args.includes('--backup'),
          skipConfirmation: args.includes('--skip-confirm'),
          validate: !args.includes('--no-validate')
        };
        
        await manager.bulkRemoveWithProductUpdate(pattern, options);
        break;
      }
      
      case 'smart-map': {
        const sourceDir = args[1];
        if (!sourceDir) {
          console.error('❌ Source directory required');
          process.exit(1);
        }
        
        const options = {
          skipConfirmation: args.includes('--skip-confirm'),
          validate: !args.includes('--no-validate')
        };
        
        await manager.smartImageMapping(sourceDir, options);
        break;
      }
      
      case 'health-check': {
        await manager.systemHealthCheck();
        break;
      }
      
      case 'validate': {
        await manager.productUpdater.validateImageReferences();
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

module.exports = { IntegratedBulkImageManager };