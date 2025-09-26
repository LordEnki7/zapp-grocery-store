#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

// Configuration
const CONFIG = {
  BATCH_SIZE: 100,
  SUPPORTED_FORMATS: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
  IMAGES_DIR: path.join(__dirname, '..', 'public', 'images', 'products'),
  PRODUCT_SERVICE_PATH: path.join(__dirname, '..', 'src', 'services', 'productService.ts'),
  BACKUP_DIR: path.join(__dirname, '..', 'backups', 'images'),
  LOG_FILE: path.join(__dirname, '..', 'logs', 'bulk-images.log')
};

// Utility functions
class BulkImageManager {
  constructor() {
    this.processedCount = 0;
    this.errorCount = 0;
    this.skippedCount = 0;
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

  async createBackup(imagePath) {
    try {
      const fileName = path.basename(imagePath);
      const backupPath = path.join(CONFIG.BACKUP_DIR, fileName);
      await fs.mkdir(CONFIG.BACKUP_DIR, { recursive: true });
      await fs.copyFile(imagePath, backupPath);
      return backupPath;
    } catch (error) {
      await this.log(`Failed to create backup for ${imagePath}: ${error.message}`, 'ERROR');
      return null;
    }
  }

  normalizeImageName(fileName) {
    return fileName
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async validateImage(imagePath) {
    try {
      const stats = await fs.stat(imagePath);
      const ext = path.extname(imagePath).toLowerCase();
      
      if (!CONFIG.SUPPORTED_FORMATS.includes(ext)) {
        return { valid: false, reason: `Unsupported format: ${ext}` };
      }
      
      if (stats.size === 0) {
        return { valid: false, reason: 'Empty file' };
      }
      
      if (stats.size > 10 * 1024 * 1024) { // 10MB limit
        return { valid: false, reason: 'File too large (>10MB)' };
      }
      
      return { valid: true };
    } catch (error) {
      return { valid: false, reason: error.message };
    }
  }

  async getImageFiles(directory) {
    try {
      const files = await fs.readdir(directory);
      return files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return CONFIG.SUPPORTED_FORMATS.includes(ext);
      });
    } catch (error) {
      await this.log(`Failed to read directory ${directory}: ${error.message}`, 'ERROR');
      return [];
    }
  }

  async processBatch(items, processor, batchSize = CONFIG.BATCH_SIZE) {
    const results = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(items.length / batchSize);
      
      await this.log(`Processing batch ${batchNumber}/${totalBatches} (${batch.length} items)`);
      
      const batchResults = await Promise.allSettled(
        batch.map(item => processor(item))
      );
      
      results.push(...batchResults);
      
      // Progress update
      const processed = Math.min(i + batchSize, items.length);
      const percentage = ((processed / items.length) * 100).toFixed(1);
      await this.log(`Progress: ${processed}/${items.length} (${percentage}%)`);
    }
    
    return results;
  }

  async confirmAction(message) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question(`${message} (y/N): `, (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
      });
    });
  }

  async bulkUpload(sourceDirectory, options = {}) {
    await this.log(`Starting bulk upload from: ${sourceDirectory}`);
    
    try {
      const sourceFiles = await this.getImageFiles(sourceDirectory);
      
      if (sourceFiles.length === 0) {
        await this.log('No image files found in source directory', 'WARN');
        return;
      }

      await this.log(`Found ${sourceFiles.length} image files to process`);

      if (!options.skipConfirmation) {
        const confirmed = await this.confirmAction(
          `Upload ${sourceFiles.length} images to ${CONFIG.IMAGES_DIR}?`
        );
        if (!confirmed) {
          await this.log('Upload cancelled by user');
          return;
        }
      }

      await fs.mkdir(CONFIG.IMAGES_DIR, { recursive: true });

      const processor = async (fileName) => {
        const sourcePath = path.join(sourceDirectory, fileName);
        const normalizedName = options.normalize !== false ? 
          this.normalizeImageName(fileName) : fileName;
        const targetPath = path.join(CONFIG.IMAGES_DIR, normalizedName);

        try {
          // Validate source image
          const validation = await this.validateImage(sourcePath);
          if (!validation.valid) {
            this.skippedCount++;
            await this.log(`Skipped ${fileName}: ${validation.reason}`, 'WARN');
            return { status: 'skipped', file: fileName, reason: validation.reason };
          }

          // Check if target exists
          const targetExists = await fs.access(targetPath).then(() => true).catch(() => false);
          if (targetExists && !options.overwrite) {
            this.skippedCount++;
            await this.log(`Skipped ${fileName}: Target already exists`, 'WARN');
            return { status: 'skipped', file: fileName, reason: 'Target exists' };
          }

          // Create backup if overwriting
          if (targetExists && options.createBackup) {
            await this.createBackup(targetPath);
          }

          // Copy file
          await fs.copyFile(sourcePath, targetPath);
          this.processedCount++;
          
          return { status: 'success', file: fileName, target: normalizedName };
        } catch (error) {
          this.errorCount++;
          await this.log(`Failed to process ${fileName}: ${error.message}`, 'ERROR');
          return { status: 'error', file: fileName, error: error.message };
        }
      };

      const results = await this.processBatch(sourceFiles, processor);
      await this.printSummary('Upload');
      
      return results;
    } catch (error) {
      await this.log(`Bulk upload failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async bulkRemove(pattern, options = {}) {
    await this.log(`Starting bulk removal with pattern: ${pattern}`);
    
    try {
      const allFiles = await this.getImageFiles(CONFIG.IMAGES_DIR);
      const matchingFiles = allFiles.filter(file => {
        if (pattern === '*') return true;
        if (pattern.includes('*')) {
          const regex = new RegExp(pattern.replace(/\*/g, '.*'), 'i');
          return regex.test(file);
        }
        return file.toLowerCase().includes(pattern.toLowerCase());
      });

      if (matchingFiles.length === 0) {
        await this.log('No files match the removal pattern', 'WARN');
        return;
      }

      await this.log(`Found ${matchingFiles.length} files matching pattern`);

      if (!options.skipConfirmation) {
        console.log('\nFiles to be removed:');
        matchingFiles.slice(0, 10).forEach(file => console.log(`  - ${file}`));
        if (matchingFiles.length > 10) {
          console.log(`  ... and ${matchingFiles.length - 10} more files`);
        }

        const confirmed = await this.confirmAction(
          `⚠️  DELETE ${matchingFiles.length} image files? This cannot be undone!`
        );
        if (!confirmed) {
          await this.log('Removal cancelled by user');
          return;
        }
      }

      const processor = async (fileName) => {
        const filePath = path.join(CONFIG.IMAGES_DIR, fileName);
        
        try {
          // Create backup if requested
          if (options.createBackup) {
            await this.createBackup(filePath);
          }

          await fs.unlink(filePath);
          this.processedCount++;
          
          return { status: 'success', file: fileName };
        } catch (error) {
          this.errorCount++;
          await this.log(`Failed to remove ${fileName}: ${error.message}`, 'ERROR');
          return { status: 'error', file: fileName, error: error.message };
        }
      };

      const results = await this.processBatch(matchingFiles, processor);
      await this.printSummary('Removal');
      
      return results;
    } catch (error) {
      await this.log(`Bulk removal failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async listImages(options = {}) {
    try {
      const files = await this.getImageFiles(CONFIG.IMAGES_DIR);
      
      if (options.pattern) {
        const filtered = files.filter(file => {
          if (options.pattern.includes('*')) {
            const regex = new RegExp(options.pattern.replace(/\*/g, '.*'), 'i');
            return regex.test(file);
          }
          return file.toLowerCase().includes(options.pattern.toLowerCase());
        });
        
        console.log(`\nFound ${filtered.length} images matching "${options.pattern}":`);
        filtered.forEach(file => console.log(`  ${file}`));
      } else {
        console.log(`\nFound ${files.length} total images:`);
        files.slice(0, 20).forEach(file => console.log(`  ${file}`));
        if (files.length > 20) {
          console.log(`  ... and ${files.length - 20} more files`);
        }
      }
      
      return files;
    } catch (error) {
      await this.log(`Failed to list images: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async printSummary(operation) {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    const total = this.processedCount + this.errorCount + this.skippedCount;
    
    console.log(`\n📊 ${operation} Summary:`);
    console.log(`  ✅ Processed: ${this.processedCount}`);
    console.log(`  ❌ Errors: ${this.errorCount}`);
    console.log(`  ⏭️  Skipped: ${this.skippedCount}`);
    console.log(`  📁 Total: ${total}`);
    console.log(`  ⏱️  Duration: ${duration}s`);
    
    await this.log(`${operation} completed: ${this.processedCount} processed, ${this.errorCount} errors, ${this.skippedCount} skipped in ${duration}s`);
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command) {
    console.log(`
🖼️  Bulk Image Management System

Usage:
  node bulk-images.js upload <source-directory> [options]
  node bulk-images.js remove <pattern> [options]
  node bulk-images.js list [pattern]
  node bulk-images.js status

Commands:
  upload    Upload images from a directory
  remove    Remove images matching a pattern
  list      List images (optionally filtered)
  status    Show system status

Options:
  --overwrite     Overwrite existing files
  --backup        Create backups before operations
  --normalize     Normalize file names (default: true)
  --skip-confirm  Skip confirmation prompts
  --batch-size    Set batch size (default: 100)

Examples:
  node bulk-images.js upload ./new-images --overwrite --backup
  node bulk-images.js remove "ginger*" --backup
  node bulk-images.js list "*.webp"
  node bulk-images.js remove "*" --skip-confirm  # Remove all (dangerous!)
    `);
    return;
  }

  const manager = new BulkImageManager();
  
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
          skipConfirmation: args.includes('--skip-confirm')
        };
        
        await manager.bulkUpload(sourceDir, options);
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
          skipConfirmation: args.includes('--skip-confirm')
        };
        
        await manager.bulkRemove(pattern, options);
        break;
      }
      
      case 'list': {
        const pattern = args[1];
        await manager.listImages({ pattern });
        break;
      }
      
      case 'status': {
        const files = await manager.getImageFiles(CONFIG.IMAGES_DIR);
        console.log(`\n📊 System Status:`);
        console.log(`  📁 Images Directory: ${CONFIG.IMAGES_DIR}`);
        console.log(`  🖼️  Total Images: ${files.length}`);
        console.log(`  📝 Log File: ${CONFIG.LOG_FILE}`);
        console.log(`  💾 Backup Directory: ${CONFIG.BACKUP_DIR}`);
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

module.exports = { BulkImageManager, CONFIG };