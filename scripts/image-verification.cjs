const fs = require('fs');
const path = require('path');

/**
 * Automated Image Path Verification Script
 * Can be integrated into build process or run as a pre-commit hook
 */

class ImagePathVerifier {
  constructor(options = {}) {
    this.options = {
      productsFile: './data/products/products.json',
      basePaths: [
        './sitephoto/Gift Cards',
        './sitephoto/New images', 
        './public/images/products',
        './public/images/categories',
        './sitephoto'
      ],
      exitOnError: options.exitOnError || false,
      verbose: options.verbose || false,
      autoFix: options.autoFix || false,
      ...options
    };
    
    this.stats = {
      total: 0,
      valid: 0,
      invalid: 0,
      fixed: 0,
      errors: []
    };
  }

  log(message, level = 'info') {
    if (level === 'error' || this.options.verbose) {
      const prefix = {
        info: '📋',
        success: '✅',
        warning: '⚠️',
        error: '❌',
        fix: '🔧'
      }[level] || '📋';
      
      console.log(`${prefix} ${message}`);
    }
  }

  imageExists(imagePath) {
    if (!imagePath) return false;
    
    // Clean the path
    const cleanPath = imagePath.replace(/^\/+/, '');
    
    // Try direct path first
    if (fs.existsSync(cleanPath)) {
      return cleanPath;
    }

    // Try with base paths
    for (const basePath of this.options.basePaths) {
      const fullPath = path.join(basePath, path.basename(cleanPath));
      if (fs.existsSync(fullPath)) {
        return fullPath.replace(/\\/g, '/').replace(/^\.\//, '/');
      }
    }

    return false;
  }

  findAlternativePath(productName, currentPath) {
    const normalizedName = productName.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    for (const basePath of this.options.basePaths) {
      if (!fs.existsSync(basePath)) continue;
      
      try {
        const files = fs.readdirSync(basePath);
        
        for (const file of files) {
          const fileNameNormalized = file.toLowerCase()
            .replace(/\.[^/.]+$/, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, ' ')
            .trim();

          // Check for exact or partial matches
          if (fileNameNormalized === normalizedName ||
              fileNameNormalized.includes(normalizedName) || 
              normalizedName.includes(fileNameNormalized)) {
            return `/${basePath.replace('./', '')}/${file}`;
          }
        }
      } catch (error) {
        this.log(`Error reading directory ${basePath}: ${error.message}`, 'warning');
      }
    }

    return null;
  }

  async verifyProduct(product) {
    this.stats.total++;
    
    const imagePath = product.primaryImage || product.image || (product.images && product.images[0]);
    
    if (!imagePath) {
      const error = {
        productId: product.id,
        productName: product.name,
        issue: 'NO_IMAGE_PATH',
        severity: 'warning'
      };
      
      this.stats.errors.push(error);
      this.log(`Product "${product.name}" (${product.id}) has no image path`, 'warning');
      return { valid: false, error };
    }

    const existsResult = this.imageExists(imagePath);
    
    if (existsResult) {
      this.stats.valid++;
      this.log(`✓ ${product.name}: ${imagePath}`, 'success');
      return { valid: true, path: existsResult };
    }

    // Image doesn't exist, try to find alternative
    const alternativePath = this.findAlternativePath(product.name, imagePath);
    
    if (alternativePath && this.imageExists(alternativePath)) {
      const error = {
        productId: product.id,
        productName: product.name,
        issue: 'WRONG_PATH',
        currentPath: imagePath,
        suggestedPath: alternativePath,
        severity: 'fixable'
      };
      
      this.stats.errors.push(error);
      this.log(`Product "${product.name}" has wrong path. Current: ${imagePath}, Suggested: ${alternativePath}`, 'fix');
      
      if (this.options.autoFix) {
        return { valid: false, error, fix: alternativePath };
      }
      
      return { valid: false, error };
    }

    // No alternative found
    const error = {
      productId: product.id,
      productName: product.name,
      issue: 'IMAGE_NOT_FOUND',
      currentPath: imagePath,
      severity: 'error'
    };
    
    this.stats.invalid++;
    this.stats.errors.push(error);
    this.log(`Product "${product.name}" image not found: ${imagePath}`, 'error');
    
    return { valid: false, error };
  }

  async verifyAllProducts() {
    this.log('Starting automated image path verification...', 'info');
    
    if (!fs.existsSync(this.options.productsFile)) {
      throw new Error(`Products file not found: ${this.options.productsFile}`);
    }

    const productsData = JSON.parse(fs.readFileSync(this.options.productsFile, 'utf8'));
    const results = [];
    const fixes = [];

    this.log(`Verifying ${productsData.length} products...`, 'info');

    for (const product of productsData) {
      const result = await this.verifyProduct(product);
      results.push(result);
      
      if (result.fix) {
        fixes.push({
          productId: product.id,
          oldPath: result.error.currentPath,
          newPath: result.fix
        });
      }
    }

    // Apply fixes if auto-fix is enabled
    if (this.options.autoFix && fixes.length > 0) {
      this.log(`Applying ${fixes.length} automatic fixes...`, 'fix');
      
      for (const fix of fixes) {
        // Find and update the product
        const productIndex = productsData.findIndex(p => p.id === fix.productId);
        if (productIndex !== -1) {
          const product = productsData[productIndex];
          
          // Update all image fields
          if (product.primaryImage === fix.oldPath) {
            product.primaryImage = fix.newPath;
          }
          if (product.image === fix.oldPath) {
            product.image = fix.newPath;
          }
          if (product.images && product.images.includes(fix.oldPath)) {
            const imageIndex = product.images.indexOf(fix.oldPath);
            product.images[imageIndex] = fix.newPath;
          }
          
          this.stats.fixed++;
          this.log(`Fixed ${product.name}: ${fix.oldPath} → ${fix.newPath}`, 'fix');
        }
      }
      
      // Save updated products file
      fs.writeFileSync(this.options.productsFile, JSON.stringify(productsData, null, 2));
      this.log(`Saved ${fixes.length} fixes to products file`, 'success');
    }

    return this.generateReport();
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.stats.total,
        valid: this.stats.valid,
        invalid: this.stats.invalid,
        fixed: this.stats.fixed,
        errorCount: this.stats.errors.length
      },
      errors: this.stats.errors,
      success: this.stats.invalid === 0
    };

    // Console summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 IMAGE VERIFICATION REPORT');
    console.log('='.repeat(50));
    console.log(`Total Products: ${this.stats.total}`);
    console.log(`✅ Valid Images: ${this.stats.valid}`);
    console.log(`❌ Invalid Images: ${this.stats.invalid}`);
    console.log(`🔧 Fixed Images: ${this.stats.fixed}`);
    console.log(`⚠️  Total Issues: ${this.stats.errors.length}`);
    
    const successRate = ((this.stats.valid + this.stats.fixed) / this.stats.total * 100).toFixed(1);
    console.log(`📈 Success Rate: ${successRate}%`);

    // Show critical errors
    const criticalErrors = this.stats.errors.filter(e => e.severity === 'error');
    if (criticalErrors.length > 0) {
      console.log('\n❌ CRITICAL ERRORS:');
      criticalErrors.slice(0, 5).forEach(error => {
        console.log(`   • ${error.productName} (${error.productId}): ${error.issue}`);
      });
      if (criticalErrors.length > 5) {
        console.log(`   ... and ${criticalErrors.length - 5} more`);
      }
    }

    // Show fixable issues
    const fixableErrors = this.stats.errors.filter(e => e.severity === 'fixable');
    if (fixableErrors.length > 0 && !this.options.autoFix) {
      console.log('\n🔧 FIXABLE ISSUES:');
      console.log('   Run with --auto-fix to automatically resolve these:');
      fixableErrors.slice(0, 3).forEach(error => {
        console.log(`   • ${error.productName}: ${error.currentPath} → ${error.suggestedPath}`);
      });
      if (fixableErrors.length > 3) {
        console.log(`   ... and ${fixableErrors.length - 3} more`);
      }
    }

    console.log('='.repeat(50));

    return report;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options = {
    verbose: args.includes('--verbose') || args.includes('-v'),
    autoFix: args.includes('--auto-fix') || args.includes('--fix'),
    exitOnError: args.includes('--exit-on-error'),
  };

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Image Path Verification Tool

Usage: node image-verification.cjs [options]

Options:
  --verbose, -v         Show detailed output
  --auto-fix, --fix     Automatically fix resolvable issues
  --exit-on-error       Exit with error code if issues found
  --help, -h            Show this help message

Examples:
  node image-verification.cjs                    # Basic verification
  node image-verification.cjs --verbose          # Detailed output
  node image-verification.cjs --auto-fix         # Fix issues automatically
  node image-verification.cjs --exit-on-error    # For CI/CD integration
`);
    process.exit(0);
  }

  try {
    const verifier = new ImagePathVerifier(options);
    const report = await verifier.verifyAllProducts();
    
    // Save report
    fs.writeFileSync('image-verification-report.json', JSON.stringify(report, null, 2));
    console.log('\n💾 Report saved to: image-verification-report.json');
    
    // Exit with appropriate code
    if (options.exitOnError && !report.success) {
      console.log('\n❌ Verification failed - exiting with error code 1');
      process.exit(1);
    }
    
    if (report.success) {
      console.log('\n🎉 All image paths verified successfully!');
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { ImagePathVerifier };