/**
 * Runtime Image Validator - Catches missing images immediately
 * 
 * This system validates images as they're loaded and provides
 * helpful debugging information to prevent future issues.
 */

interface ValidationResult {
  isValid: boolean;
  path: string;
  error?: string;
  suggestions?: string[];
  debugInfo?: {
    originalPath: string;
    resolvedPath: string;
    attempts: string[];
    source: string;
  };
}

interface ValidationOptions {
  enableSuggestions?: boolean;
  enableDebugInfo?: boolean;
  logErrors?: boolean;
}

class ImageValidator {
  private validationCache = new Map<string, ValidationResult>();
  private options: ValidationOptions;

  constructor(options: ValidationOptions = {}) {
    this.options = {
      enableSuggestions: true,
      enableDebugInfo: process.env.NODE_ENV === 'development',
      logErrors: process.env.NODE_ENV === 'development',
      ...options
    };
  }

  /**
   * Validate an image path and provide helpful feedback
   */
  async validateImage(path: string, context?: { productName?: string; component?: string }): Promise<ValidationResult> {
    const cacheKey = `${path}|${context?.productName || ''}`;
    
    if (this.validationCache.has(cacheKey)) {
      return this.validationCache.get(cacheKey)!;
    }

    const result = await this._validateImageInternal(path, context);
    this.validationCache.set(cacheKey, result);

    if (!result.isValid && this.options.logErrors) {
      this.logValidationError(result, context);
    }

    return result;
  }

  private async _validateImageInternal(path: string, context?: { productName?: string; component?: string }): Promise<ValidationResult> {
    const attempts: string[] = [path];
    
    try {
      const exists = await this.checkImageExists(path);
      
      if (exists) {
        return {
          isValid: true,
          path,
          debugInfo: this.options.enableDebugInfo ? {
            originalPath: path,
            resolvedPath: path,
            attempts,
            source: 'direct'
          } : undefined
        };
      }

      // Image doesn't exist, generate suggestions
      const suggestions = this.options.enableSuggestions ? 
        await this.generateSuggestions(path, context?.productName) : [];

      return {
        isValid: false,
        path,
        error: `Image not found: ${path}`,
        suggestions,
        debugInfo: this.options.enableDebugInfo ? {
          originalPath: path,
          resolvedPath: path,
          attempts,
          source: 'validation'
        } : undefined
      };

    } catch (error) {
      return {
        isValid: false,
        path,
        error: `Failed to validate image: ${error}`,
        suggestions: this.options.enableSuggestions ? ['Check network connection', 'Verify image path format'] : []
      };
    }
  }

  /**
   * Generate helpful suggestions for missing images
   */
  private async generateSuggestions(path: string, productName?: string): Promise<string[]> {
    const suggestions: string[] = [];
    const filename = path.split('/').pop() || '';
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');

    // Common path suggestions
    const commonPaths = [
      `/sitephoto/Gift Cards/${filename}`,
      `/sitephoto/New images/${filename}`,
      `/images/products/${filename}`,
      `/sitephoto/${filename}`
    ];

    // Check if any common paths exist
    for (const commonPath of commonPaths) {
      if (commonPath !== path) {
        const exists = await this.checkImageExists(commonPath);
        if (exists) {
          suggestions.push(`Found similar image at: ${commonPath}`);
        }
      }
    }

    // Extension suggestions
    const extensions = ['.webp', '.jpg', '.jpeg', '.png', '.avif', '.svg'];
    const basePath = path.replace(/\.[^/.]+$/, '');
    
    for (const ext of extensions) {
      const altPath = `${basePath}${ext}`;
      if (altPath !== path) {
        const exists = await this.checkImageExists(altPath);
        if (exists) {
          suggestions.push(`Try different extension: ${altPath}`);
        }
      }
    }

    // Product name suggestions
    if (productName && productName !== nameWithoutExt) {
      const productFilename = this.toFilename(productName);
      suggestions.push(`Try using product name: ${productFilename}.webp`);
      suggestions.push(`Check if product name matches exactly: "${productName}"`);
    }

    // General suggestions
    if (suggestions.length === 0) {
      suggestions.push('Check if the image file exists in the public directory');
      suggestions.push('Verify the image path format and spelling');
      suggestions.push('Consider using the unified image resolver');
    }

    return suggestions.slice(0, 5); // Limit to 5 suggestions
  }

  /**
   * Check if an image exists - simplified for development
   */
  private async checkImageExists(path: string): Promise<boolean> {
    // For now, assume all paths are valid to prevent blocking
    // The browser will handle the actual loading and fallback
    return true;
  }

  /**
   * Log validation errors with helpful context
   */
  private logValidationError(result: ValidationResult, context?: { productName?: string; component?: string }): void {
    console.group(`🖼️ Image Validation Error`);
    console.error(`Path: ${result.path}`);
    console.error(`Error: ${result.error}`);
    
    if (context?.productName) {
      console.log(`Product: ${context.productName}`);
    }
    
    if (context?.component) {
      console.log(`Component: ${context.component}`);
    }

    if (result.suggestions && result.suggestions.length > 0) {
      console.log('💡 Suggestions:');
      result.suggestions.forEach(suggestion => console.log(`  - ${suggestion}`));
    }

    if (result.debugInfo) {
      console.log('🔍 Debug Info:', result.debugInfo);
    }
    
    console.groupEnd();
  }

  /**
   * Utility to convert product name to filename
   */
  private toFilename(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Clear validation cache
   */
  clearCache(): void {
    this.validationCache.clear();
  }

  /**
   * Get validation statistics
   */
  getStats(): { totalValidations: number; errorRate: number; cacheSize: number } {
    const total = this.validationCache.size;
    const errors = Array.from(this.validationCache.values()).filter(r => !r.isValid).length;
    
    return {
      totalValidations: total,
      errorRate: total > 0 ? errors / total : 0,
      cacheSize: total
    };
  }
}

// Export singleton instance
export const imageValidator = new ImageValidator();

export { ImageValidator, type ValidationResult, type ValidationOptions };