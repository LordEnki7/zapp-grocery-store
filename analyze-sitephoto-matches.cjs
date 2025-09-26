const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, 'data', 'products', 'products.json');
const SITEPHOTO_DIR = path.join(__dirname, 'sitephoto');

function normalizeProductName(name) {
  return name.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getAllSitephotoImages(dir) {
  const images = [];
  
  function scanDirectory(currentDir, relativePath = '') {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath, path.join(relativePath, item));
      } else if (stat.isFile() && /\.(png|jpg|jpeg|webp|avif)$/i.test(item)) {
        images.push({
          filename: item,
          category: path.basename(path.dirname(fullPath)),
          fullPath: fullPath,
          relativePath: path.join(relativePath, item).replace(/\\/g, '/'),
          sitephotoPath: `/sitephoto/${path.join(relativePath, item).replace(/\\/g, '/')}`
        });
      }
    }
  }
  
  scanDirectory(dir);
  return images;
}

async function analyzeSitephotoMatches() {
  try {
    console.log('🔍 ANALYZING SITEPHOTO MATCHES');
    console.log('==============================');
    
    // Load current products
    const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
    console.log(`📊 Total products: ${products.length}`);
    
    // Get all sitephoto images
    const sitephotoImages = getAllSitephotoImages(SITEPHOTO_DIR);
    console.log(`📸 Total sitephoto images: ${sitephotoImages.length}`);
    
    // Find products using generic images
    const genericImagePatterns = [
      /^\/images\/products\/g\d+\.png$/,
      /product-placeholder/,
      /placeholder/,
      /generic/
    ];
    
    const productsWithGenericImages = products.filter(product => {
      const primaryImage = product.primaryImage || product.image || '';
      return genericImagePatterns.some(pattern => pattern.test(primaryImage));
    });
    
    console.log(`🔍 Products with generic images: ${productsWithGenericImages.length}`);
    
    // Find potential matches
    const matches = [];
    const unmatchedProducts = [];
    
    for (const product of productsWithGenericImages) {
      const normalizedProductName = normalizeProductName(product.name);
      let bestMatch = null;
      let bestScore = 0;
      
      for (const image of sitephotoImages) {
        const normalizedImageName = normalizeProductName(image.filename.replace(/\.(png|jpg|jpeg|webp|avif)$/i, ''));
        const normalizedCategory = normalizeProductName(image.category);
        
        // Calculate match score
        let score = 0;
        
        // Exact name match
        if (normalizedProductName === normalizedImageName) {
          score = 100;
        }
        // Product name contains image name or vice versa
        else if (normalizedProductName.includes(normalizedImageName) || normalizedImageName.includes(normalizedProductName)) {
          score = 80;
        }
        // Check for key words match
        else {
          const productWords = normalizedProductName.split(' ');
          const imageWords = normalizedImageName.split(' ');
          const matchingWords = productWords.filter(word => 
            word.length > 2 && imageWords.some(imgWord => imgWord.includes(word) || word.includes(imgWord))
          );
          score = (matchingWords.length / Math.max(productWords.length, imageWords.length)) * 60;
        }
        
        // Category bonus
        if (product.category && normalizedCategory.includes(normalizeProductName(product.category))) {
          score += 10;
        }
        
        if (score > bestScore && score >= 50) {
          bestScore = score;
          bestMatch = {
            image: image,
            score: score
          };
        }
      }
      
      if (bestMatch) {
        matches.push({
          product: {
            id: product.id,
            name: product.name,
            category: product.category,
            currentImage: product.primaryImage || product.image || product.images?.[0] || 'none'
          },
          suggestedImage: bestMatch.image,
          matchScore: bestMatch.score,
          confidence: bestMatch.score >= 80 ? 'high' : bestMatch.score >= 65 ? 'medium' : 'low'
        });
      } else {
        unmatchedProducts.push({
          id: product.id,
          name: product.name,
          category: product.category,
          currentImage: product.primaryImage || product.image || product.images?.[0] || 'none'
        });
      }
    }
    
    // Generate report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalProducts: products.length,
        productsWithGenericImages: productsWithGenericImages.length,
        totalSitephotoImages: sitephotoImages.length,
        potentialMatches: matches.length,
        unmatchedProducts: unmatchedProducts.length
      },
      matches: matches.sort((a, b) => b.matchScore - a.matchScore),
      unmatchedProducts: unmatchedProducts,
      sitephotoCategories: [...new Set(sitephotoImages.map(img => img.category))].sort()
    };
    
    // Save report
    const reportFile = path.join(__dirname, 'sitephoto-matches-report.json');
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    console.log('\n📋 ANALYSIS RESULTS:');
    console.log(`✅ Found ${matches.length} potential matches`);
    console.log(`⚠️  ${unmatchedProducts.length} products remain unmatched`);
    
    console.log('\n🎯 HIGH CONFIDENCE MATCHES:');
    const highConfidenceMatches = matches.filter(m => m.confidence === 'high');
    highConfidenceMatches.slice(0, 10).forEach((match, index) => {
      console.log(`${index + 1}. "${match.product.name}" → "${match.suggestedImage.filename}"`);
      console.log(`   Score: ${match.matchScore}% | Category: ${match.suggestedImage.category}`);
    });
    
    if (highConfidenceMatches.length > 10) {
      console.log(`   ... and ${highConfidenceMatches.length - 10} more high confidence matches`);
    }
    
    console.log('\n📊 SITEPHOTO CATEGORIES AVAILABLE:');
    report.sitephotoCategories.forEach(category => {
      const count = sitephotoImages.filter(img => img.category === category).length;
      console.log(`   ${category}: ${count} images`);
    });
    
    console.log(`\n📄 Report saved: ${reportFile}`);
    
    return report;
    
  } catch (error) {
    console.error('❌ Error analyzing sitephoto matches:', error);
    process.exit(1);
  }
}

analyzeSitephotoMatches();