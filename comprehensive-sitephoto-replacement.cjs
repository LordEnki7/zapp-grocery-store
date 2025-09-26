const fs = require('fs');
const path = require('path');

const CONFIG = {
  PRODUCTS_JSON: path.join(__dirname, 'data', 'products', 'products.json'),
  SITEPHOTO_DIR: path.join(__dirname, 'sitephoto'),
  SUPPORTED_FORMATS: ['.png', '.jpg', '.jpeg', '.webp', '.avif'],
  BACKUP_DIR: path.join(__dirname, 'backups'),
  REPORT_DIR: __dirname
};

class ComprehensiveSitephotoReplacer {
  constructor() {
    this.sitephotoImages = new Map();
    this.categoryKeywords = new Map();
    this.replacements = [];
    this.skipped = [];
    this.errors = [];
  }

  async log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${level}: ${message}`);
  }

  // Scan all sitephoto images and build comprehensive mapping
  async scanAllSitephotoImages() {
    await this.log('🔍 Scanning all sitephoto images...');
    
    try {
      const categories = fs.readdirSync(CONFIG.SITEPHOTO_DIR);
      
      for (const category of categories) {
        const categoryPath = path.join(CONFIG.SITEPHOTO_DIR, category);
        const stat = fs.statSync(categoryPath);
        
        if (stat.isDirectory()) {
          const files = fs.readdirSync(categoryPath);
          const images = files.filter(file => 
            CONFIG.SUPPORTED_FORMATS.includes(path.extname(file).toLowerCase())
          );
          
          for (const image of images) {
            const imageData = {
              filename: image,
              category: category,
              fullPath: path.join(categoryPath, image),
              sitephotoPath: `/sitephoto/${category}/${image}`,
              normalizedName: this.normalizeForMatching(image),
              keywords: this.extractKeywords(image, category)
            };
            
            // Store by multiple keys for flexible matching
            this.sitephotoImages.set(imageData.normalizedName, imageData);
            this.sitephotoImages.set(image.toLowerCase(), imageData);
            
            // Store by category for category-based matching
            if (!this.categoryKeywords.has(category.toLowerCase())) {
              this.categoryKeywords.set(category.toLowerCase(), []);
            }
            this.categoryKeywords.get(category.toLowerCase()).push(imageData);
          }
          
          await this.log(`Found ${images.length} images in ${category}`);
        }
      }
      
      await this.log(`Total sitephoto images indexed: ${this.sitephotoImages.size}`);
      return this.sitephotoImages;
    } catch (error) {
      await this.log(`Error scanning sitephoto directory: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  // Normalize text for matching
  normalizeForMatching(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Extract keywords from filename and category
  extractKeywords(filename, category) {
    const baseName = path.parse(filename).name;
    const words = this.normalizeForMatching(`${baseName} ${category}`).split(' ');
    return words.filter(word => word.length > 2);
  }

  // Calculate similarity score between two strings
  calculateSimilarity(str1, str2) {
    const words1 = str1.toLowerCase().split(' ');
    const words2 = str2.toLowerCase().split(' ');
    
    let matches = 0;
    for (const word1 of words1) {
      for (const word2 of words2) {
        if (word1.includes(word2) || word2.includes(word1)) {
          matches++;
          break;
        }
      }
    }
    
    return (matches / Math.max(words1.length, words2.length)) * 100;
  }

  // Find best match for a product
  findBestMatch(product) {
    const productName = this.normalizeForMatching(product.name);
    const productWords = productName.split(' ');
    
    let bestMatch = null;
    let bestScore = 0;
    
    // Direct name matching
    for (const [key, imageData] of this.sitephotoImages) {
      const score = this.calculateSimilarity(productName, imageData.normalizedName);
      if (score > bestScore && score >= 70) {
        bestScore = score;
        bestMatch = { ...imageData, matchScore: score, matchType: 'direct' };
      }
    }
    
    // Keyword-based matching if no direct match
    if (!bestMatch || bestScore < 80) {
      for (const [key, imageData] of this.sitephotoImages) {
        let keywordScore = 0;
        for (const keyword of imageData.keywords) {
          for (const productWord of productWords) {
            if (keyword.includes(productWord) || productWord.includes(keyword)) {
              keywordScore += 20;
            }
          }
        }
        
        if (keywordScore > bestScore && keywordScore >= 40) {
          bestScore = keywordScore;
          bestMatch = { ...imageData, matchScore: keywordScore, matchType: 'keyword' };
        }
      }
    }
    
    // Category-based fuzzy matching
    if (!bestMatch || bestScore < 60) {
      const categoryMatches = this.findCategoryMatches(product);
      if (categoryMatches.length > 0) {
        const topCategoryMatch = categoryMatches[0];
        if (topCategoryMatch.matchScore > bestScore) {
          bestMatch = topCategoryMatch;
          bestScore = topCategoryMatch.matchScore;
        }
      }
    }
    
    return bestMatch;
  }

  // Find matches within similar categories
  findCategoryMatches(product) {
    const productName = this.normalizeForMatching(product.name);
    const matches = [];
    
    // Define category mappings for better matching
    const categoryMappings = {
      'gift': ['gift cards'],
      'card': ['gift cards'],
      'pharmacy': ['pharmacy'],
      'health': ['pharmacy'],
      'medicine': ['pharmacy'],
      'vitamin': ['pharmacy'],
      'food': ['fresh foods', 'deal of the day'],
      'snack': ['fruit snacks', 'veggie snacks', 'snack packs'],
      'drink': ['sodas', 'juices', 'energy drink', 'sports drink'],
      'coffee': ['coffee'],
      'tea': ['milk tea varity pack'],
      'candy': ['candy'],
      'chocolate': ['candy'],
      'cereal': ['breakfast cereal'],
      'breakfast': ['breakfast cereal', 'pancakes mix'],
      'nuts': ['nuts', 'peanuts'],
      'chips': ['potato chips'],
      'popcorn': ['popcorn'],
      'crackers': ['crackers'],
      'cookies': ['cookies'],
      'protein': ['protien bars'],
      'bar': ['protien bars'],
      'oil': ['motor oil', 'sunflower oil'],
      'milk': ['milk'],
      'cheese': ['cheeze snack']
    };
    
    for (const [keyword, categories] of Object.entries(categoryMappings)) {
      if (productName.includes(keyword)) {
        for (const category of categories) {
          const categoryImages = this.categoryKeywords.get(category.toLowerCase());
          if (categoryImages) {
            for (const imageData of categoryImages) {
              const score = this.calculateSimilarity(productName, imageData.normalizedName);
              if (score >= 30) {
                matches.push({
                  ...imageData,
                  matchScore: score,
                  matchType: 'category'
                });
              }
            }
          }
        }
      }
    }
    
    return matches.sort((a, b) => b.matchScore - a.matchScore);
  }

  // Create backup of products.json
  async createBackup() {
    const timestamp = Date.now();
    const backupPath = path.join(CONFIG.BACKUP_DIR, `products_backup_comprehensive_${timestamp}.json`);
    
    // Ensure backup directory exists
    if (!fs.existsSync(CONFIG.BACKUP_DIR)) {
      fs.mkdirSync(CONFIG.BACKUP_DIR, { recursive: true });
    }
    
    fs.copyFileSync(CONFIG.PRODUCTS_JSON, backupPath);
    await this.log(`✅ Backup created: ${backupPath}`);
    return backupPath;
  }

  // Process all products and replace generic images
  async processAllProducts() {
    await this.log('🚀 Starting comprehensive sitephoto replacement...');
    
    try {
      // Scan all sitephoto images
      await this.scanAllSitephotoImages();
      
      // Create backup
      const backupPath = await this.createBackup();
      
      // Load products
      const data = fs.readFileSync(CONFIG.PRODUCTS_JSON, 'utf8');
      const products = JSON.parse(data);
      
      let processedCount = 0;
      let replacedCount = 0;
      
      for (const product of products) {
        // Only process products with generic placeholder images
        if (product.primaryImage && /\/images\/products\/[gG][0-9]+\.png$/.test(product.primaryImage)) {
          processedCount++;
          
          const match = this.findBestMatch(product);
          
          if (match && match.matchScore >= 30) {
            const oldImage = product.primaryImage;
            product.primaryImage = match.sitephotoPath;
            
            // Update images array if it exists
            if (product.images && product.images.length > 0) {
              product.images[0] = match.sitephotoPath;
            }
            
            this.replacements.push({
              productId: product.id,
              productName: product.name,
              oldImage: oldImage,
              newImage: match.sitephotoPath,
              matchScore: match.matchScore,
              matchType: match.matchType,
              sitephotoCategory: match.category,
              confidence: match.matchScore >= 70 ? 'high' : match.matchScore >= 50 ? 'medium' : 'low'
            });
            
            replacedCount++;
            await this.log(`✅ Replaced ${product.name}: ${path.basename(oldImage)} → ${path.basename(match.sitephotoPath)} (${match.matchScore}%)`);
          } else {
            this.skipped.push({
              productId: product.id,
              productName: product.name,
              currentImage: product.primaryImage,
              reason: 'No suitable match found'
            });
            await this.log(`⏭️  Skipped ${product.name}: No suitable match found`);
          }
        }
      }
      
      // Save updated products
      fs.writeFileSync(CONFIG.PRODUCTS_JSON, JSON.stringify(products, null, 2));
      
      await this.log(`🎉 Comprehensive replacement completed!`);
      await this.log(`📊 Processed: ${processedCount} products`);
      await this.log(`✅ Replaced: ${replacedCount} images`);
      await this.log(`⏭️  Skipped: ${this.skipped.length} products`);
      
      // Generate report
      await this.generateReport();
      
    } catch (error) {
      await this.log(`❌ Error during processing: ${error.message}`, 'ERROR');
      this.errors.push({
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  // Generate detailed report
  async generateReport() {
    const timestamp = Date.now();
    const reportPath = path.join(CONFIG.REPORT_DIR, `comprehensive-replacement-report-${timestamp}.json`);
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalProcessed: this.replacements.length + this.skipped.length,
        totalReplaced: this.replacements.length,
        totalSkipped: this.skipped.length,
        totalErrors: this.errors.length
      },
      replacements: this.replacements,
      skipped: this.skipped,
      errors: this.errors,
      sitephotoCategories: Array.from(this.categoryKeywords.keys())
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    await this.log(`📋 Report generated: ${reportPath}`);
    
    return reportPath;
  }
}

// Main execution
async function main() {
  const replacer = new ComprehensiveSitephotoReplacer();
  
  try {
    await replacer.processAllProducts();
    console.log('\n🎉 Comprehensive sitephoto replacement completed successfully!');
  } catch (error) {
    console.error('\n❌ Comprehensive replacement failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = ComprehensiveSitephotoReplacer;