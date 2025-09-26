#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
  PRODUCTS_JSON: path.join(__dirname, 'data', 'products', 'products.json'),
  IMAGES_DIR: path.join(__dirname, 'public', 'images', 'products'),
  SUPPORTED_FORMATS: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.svg'],
  LOG_FILE: path.join(__dirname, 'unused-images-analysis.log')
};

class UnusedImageAnalyzer {
  constructor() {
    this.usedImages = new Set();
    this.availableImages = new Set();
    this.unusedImages = [];
    this.duplicateImages = new Map();
  }

  async log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${level}: ${message}`;
    console.log(logMessage);
    
    try {
      await fs.appendFile(CONFIG.LOG_FILE, logMessage + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error.message);
    }
  }

  async loadProductImages() {
    await this.log('📖 Loading product images from database...');
    
    try {
      const data = await fs.readFile(CONFIG.PRODUCTS_JSON, 'utf8');
      const products = JSON.parse(data);
      
      for (const product of products) {
        // Check images array
        if (product.images && Array.isArray(product.images)) {
          product.images.forEach(imagePath => {
            if (imagePath) {
              const filename = path.basename(imagePath);
              this.usedImages.add(filename.toLowerCase());
            }
          });
        }
        
        // Check primaryImage
        if (product.primaryImage) {
          const filename = path.basename(product.primaryImage);
          this.usedImages.add(filename.toLowerCase());
        }
        
        // Check legacy image field
        if (product.image) {
          const filename = path.basename(product.image);
          this.usedImages.add(filename.toLowerCase());
        }
      }
      
      await this.log(`Found ${this.usedImages.size} unique images referenced in products`);
      return this.usedImages;
    } catch (error) {
      await this.log(`Error loading products: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async scanAvailableImages() {
    await this.log('🔍 Scanning available images in products directory...');
    
    try {
      const files = await fs.readdir(CONFIG.IMAGES_DIR);
      const imageFiles = files.filter(file => 
        CONFIG.SUPPORTED_FORMATS.includes(path.extname(file).toLowerCase())
      );
      
      // Track duplicates (different cases, spaces, etc.)
      const normalizedMap = new Map();
      
      for (const file of imageFiles) {
        this.availableImages.add(file);
        
        // Check for potential duplicates
        const normalized = file.toLowerCase().replace(/\s+/g, '-');
        if (normalizedMap.has(normalized)) {
          if (!this.duplicateImages.has(normalized)) {
            this.duplicateImages.set(normalized, []);
          }
          this.duplicateImages.get(normalized).push(file);
        } else {
          normalizedMap.set(normalized, file);
        }
      }
      
      await this.log(`Found ${this.availableImages.size} image files in directory`);
      return this.availableImages;
    } catch (error) {
      await this.log(`Error scanning images: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async findUnusedImages() {
    await this.log('🔍 Analyzing unused images...');
    
    for (const imageFile of this.availableImages) {
      const lowerFile = imageFile.toLowerCase();
      
      if (!this.usedImages.has(lowerFile)) {
        // Check if it might be a variant of a used image
        let isVariant = false;
        for (const usedImage of this.usedImages) {
          const usedBase = path.parse(usedImage).name;
          const currentBase = path.parse(lowerFile).name;
          
          // Check if it's a close match (might be a duplicate with different naming)
          if (usedBase.replace(/[-\s]/g, '') === currentBase.replace(/[-\s]/g, '')) {
            isVariant = true;
            break;
          }
        }
        
        this.unusedImages.push({
          filename: imageFile,
          isVariant: isVariant,
          size: await this.getFileSize(path.join(CONFIG.IMAGES_DIR, imageFile))
        });
      }
    }
    
    await this.log(`Found ${this.unusedImages.length} unused images`);
    return this.unusedImages;
  }

  async getFileSize(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return Math.round(stats.size / 1024); // Size in KB
    } catch (error) {
      return 0;
    }
  }

  async generateReport() {
    await this.log('📊 Generating comprehensive analysis report...');
    
    const report = {
      summary: {
        totalAvailableImages: this.availableImages.size,
        totalUsedImages: this.usedImages.size,
        totalUnusedImages: this.unusedImages.length,
        potentialDuplicates: this.duplicateImages.size
      },
      unusedImages: this.unusedImages.sort((a, b) => b.size - a.size),
      duplicates: Object.fromEntries(this.duplicateImages),
      recommendations: []
    };
    
    // Generate recommendations
    if (this.unusedImages.length > 0) {
      report.recommendations.push(`Consider integrating ${this.unusedImages.length} unused images into your product catalog`);
    }
    
    if (this.duplicateImages.size > 0) {
      report.recommendations.push(`Review ${this.duplicateImages.size} potential duplicate image sets for cleanup`);
    }
    
    const largeUnusedImages = this.unusedImages.filter(img => img.size > 100);
    if (largeUnusedImages.length > 0) {
      report.recommendations.push(`${largeUnusedImages.length} unused images are larger than 100KB - consider for priority integration`);
    }
    
    return report;
  }

  async saveReport(report) {
    const reportPath = path.join(__dirname, 'unused-images-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    await this.log(`📄 Report saved to: ${reportPath}`);
    
    // Also create a readable text report
    const textReportPath = path.join(__dirname, 'unused-images-report.txt');
    let textReport = `UNUSED IMAGES ANALYSIS REPORT\n`;
    textReport += `Generated: ${new Date().toISOString()}\n\n`;
    
    textReport += `SUMMARY:\n`;
    textReport += `- Total Available Images: ${report.summary.totalAvailableImages}\n`;
    textReport += `- Total Used Images: ${report.summary.totalUsedImages}\n`;
    textReport += `- Total Unused Images: ${report.summary.totalUnusedImages}\n`;
    textReport += `- Potential Duplicates: ${report.summary.potentialDuplicates}\n\n`;
    
    if (report.unusedImages.length > 0) {
      textReport += `UNUSED IMAGES (sorted by size):\n`;
      report.unusedImages.forEach((img, index) => {
        textReport += `${index + 1}. ${img.filename} (${img.size}KB)${img.isVariant ? ' [VARIANT]' : ''}\n`;
      });
      textReport += `\n`;
    }
    
    if (Object.keys(report.duplicates).length > 0) {
      textReport += `POTENTIAL DUPLICATES:\n`;
      Object.entries(report.duplicates).forEach(([normalized, files]) => {
        textReport += `- ${normalized}: ${files.join(', ')}\n`;
      });
      textReport += `\n`;
    }
    
    if (report.recommendations.length > 0) {
      textReport += `RECOMMENDATIONS:\n`;
      report.recommendations.forEach((rec, index) => {
        textReport += `${index + 1}. ${rec}\n`;
      });
    }
    
    await fs.writeFile(textReportPath, textReport);
    await this.log(`📄 Text report saved to: ${textReportPath}`);
  }

  async analyze() {
    await this.log('🚀 Starting unused images analysis...');
    
    try {
      // Load used images from products
      await this.loadProductImages();
      
      // Scan available images
      await this.scanAvailableImages();
      
      // Find unused images
      await this.findUnusedImages();
      
      // Generate and save report
      const report = await this.generateReport();
      await this.saveReport(report);
      
      // Display summary
      await this.log('\n📊 ANALYSIS COMPLETE');
      await this.log(`✅ Total Available Images: ${report.summary.totalAvailableImages}`);
      await this.log(`✅ Currently Used Images: ${report.summary.totalUsedImages}`);
      await this.log(`🔍 Unused Images Found: ${report.summary.totalUnusedImages}`);
      await this.log(`⚠️  Potential Duplicates: ${report.summary.potentialDuplicates}`);
      
      if (report.unusedImages.length > 0) {
        await this.log('\n🎯 TOP 10 UNUSED IMAGES:');
        report.unusedImages.slice(0, 10).forEach((img, index) => {
          this.log(`${index + 1}. ${img.filename} (${img.size}KB)${img.isVariant ? ' [VARIANT]' : ''}`);
        });
      }
      
      await this.log('\n💡 Check unused-images-report.txt for full details');
      
    } catch (error) {
      await this.log(`❌ Analysis failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }
}

// Run the analysis
async function main() {
  const analyzer = new UnusedImageAnalyzer();
  
  try {
    await analyzer.analyze();
    process.exit(0);
  } catch (error) {
    console.error('Analysis failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { UnusedImageAnalyzer };