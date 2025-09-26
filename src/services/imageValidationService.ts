import { ImageManager } from '../utils/imageManager';

export interface ImageValidationResult {
  isValid: boolean;
  originalPath: string;
  resolvedPath?: string;
  suggestions: string[];
  error?: string;
}

export interface ImageMappingRule {
  pattern: RegExp;
  replacement: string;
  priority: number;
}

export interface ImageValidationConfig {
  basePaths: string[];
  supportedFormats: string[];
  fallbackImage: string;
  mappingRules: ImageMappingRule[];
}

export class ImageValidationService {
  private imageManager: ImageManager;
  private config: ImageValidationConfig;

  constructor(config?: Partial<ImageValidationConfig>) {
    this.imageManager = new ImageManager();
    this.config = {
      basePaths: [
        '/sitephoto/Gift Cards',
        '/sitephoto/New images',
        '/images/products',
        '/images/categories',
        '/sitephoto'
      ],
      supportedFormats: ['webp', 'avif', 'png', 'jpg', 'jpeg', 'svg'],
      fallbackImage: '/images/placeholder.png',
      mappingRules: [
        // Gift card specific mappings
        {
          pattern: /^\/images\/products\/(.*Gift Card.*)\.(webp|png|jpg|jpeg)$/i,
          replacement: '/sitephoto/Gift Cards/$1.$2',
          priority: 10
        },
        // General product image mappings
        {
          pattern: /^\/images\/products\/(.*)$/,
          replacement: '/sitephoto/New images/$1',
          priority: 5
        },
        // Legacy path corrections
        {
          pattern: /^\/sitephoto\/New images\/(.*Gift Card.*)$/i,
          replacement: '/sitephoto/Gift Cards/$1',
          priority: 8
        }
      ],
      ...config
    };
  }

  /**
   * Validate a single image path and provide suggestions
   */
  async validateImagePath(imagePath: string): Promise<ImageValidationResult> {
    if (!imagePath) {
      return {
        isValid: false,
        originalPath: imagePath,
        suggestions: [],
        error: 'Empty image path'
      };
    }

    // First, try the original path
    const exists = await this.imageManager.imageExists(imagePath);
    if (exists) {
      return {
        isValid: true,
        originalPath: imagePath,
        resolvedPath: imagePath,
        suggestions: []
      };
    }

    // Apply mapping rules to find alternative paths
    const mappedPaths = this.applyMappingRules(imagePath);
    
    // Check each mapped path
    for (const mappedPath of mappedPaths) {
      const mappedExists = await this.imageManager.imageExists(mappedPath);
      if (mappedExists) {
        return {
          isValid: true,
          originalPath: imagePath,
          resolvedPath: mappedPath,
          suggestions: []
        };
      }
    }

    // Generate suggestions based on filename
    const suggestions = await this.generateSuggestions(imagePath);

    return {
      isValid: false,
      originalPath: imagePath,
      suggestions,
      error: 'Image not found'
    };
  }

  /**
   * Validate multiple image paths in batch
   */
  async validateImagePaths(imagePaths: string[]): Promise<ImageValidationResult[]> {
    const results = await Promise.all(
      imagePaths.map(path => this.validateImagePath(path))
    );
    return results;
  }

  /**
   * Apply mapping rules to transform image paths
   */
  private applyMappingRules(imagePath: string): string[] {
    const mappedPaths: Array<{ path: string; priority: number }> = [];

    for (const rule of this.config.mappingRules) {
      if (rule.pattern.test(imagePath)) {
        const mappedPath = imagePath.replace(rule.pattern, rule.replacement);
        mappedPaths.push({ path: mappedPath, priority: rule.priority });
      }
    }

    // Sort by priority (higher first) and return paths
    return mappedPaths
      .sort((a, b) => b.priority - a.priority)
      .map(item => item.path);
  }

  /**
   * Generate suggestions for missing images
   */
  private async generateSuggestions(imagePath: string): Promise<string[]> {
    const suggestions: string[] = [];
    const filename = imagePath.split('/').pop() || '';
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');

    // Try different base paths
    for (const basePath of this.config.basePaths) {
      // Try with original extension
      suggestions.push(`${basePath}/${filename}`);
      
      // Try with different extensions
      for (const ext of this.config.supportedFormats) {
        suggestions.push(`${basePath}/${nameWithoutExt}.${ext}`);
      }
    }

    // Filter to only existing suggestions
    const validSuggestions: string[] = [];
    for (const suggestion of suggestions) {
      const exists = await this.imageManager.imageExists(suggestion);
      if (exists) {
        validSuggestions.push(suggestion);
      }
    }

    return validSuggestions.slice(0, 5); // Limit to 5 suggestions
  }

  /**
   * Get the best image path for a product
   */
  async getBestImagePath(productName: string, currentPath?: string): Promise<string> {
    // If current path is valid, use it
    if (currentPath) {
      const validation = await this.validateImagePath(currentPath);
      if (validation.isValid && validation.resolvedPath) {
        return validation.resolvedPath;
      }
    }

    // Try to find image based on product name
    const normalizedName = this.imageManager.normalizeImageName(productName);
    
    for (const basePath of this.config.basePaths) {
      for (const ext of this.config.supportedFormats) {
        const testPath = `${basePath}/${normalizedName}.${ext}`;
        const exists = await this.imageManager.imageExists(testPath);
        if (exists) {
          return testPath;
        }
      }
    }

    // Return fallback image
    return this.config.fallbackImage;
  }

  /**
   * Validate all product images in the products data
   */
  async validateProductImages(products: any[]): Promise<{
    valid: number;
    invalid: number;
    fixed: number;
    results: Array<{
      productId: string;
      productName: string;
      originalPath: string;
      status: 'valid' | 'fixed' | 'invalid';
      newPath?: string;
      suggestions: string[];
    }>;
  }> {
    const results = [];
    let valid = 0;
    let invalid = 0;
    let fixed = 0;

    for (const product of products) {
      const imagePath = product.primaryImage || product.image || product.images?.[0];
      
      if (!imagePath) {
        results.push({
          productId: product.id,
          productName: product.name,
          originalPath: '',
          status: 'invalid' as const,
          suggestions: []
        });
        invalid++;
        continue;
      }

      const validation = await this.validateImagePath(imagePath);
      
      if (validation.isValid) {
        results.push({
          productId: product.id,
          productName: product.name,
          originalPath: imagePath,
          status: 'valid' as const,
          newPath: validation.resolvedPath,
          suggestions: []
        });
        
        if (validation.resolvedPath !== imagePath) {
          fixed++;
        } else {
          valid++;
        }
      } else {
        results.push({
          productId: product.id,
          productName: product.name,
          originalPath: imagePath,
          status: 'invalid' as const,
          suggestions: validation.suggestions
        });
        invalid++;
      }
    }

    return { valid, invalid, fixed, results };
  }

  /**
   * Add a new mapping rule
   */
  addMappingRule(rule: ImageMappingRule): void {
    this.config.mappingRules.push(rule);
    // Sort by priority
    this.config.mappingRules.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get current configuration
   */
  getConfig(): ImageValidationConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ImageValidationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}