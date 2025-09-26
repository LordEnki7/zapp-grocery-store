/**
 * Centralized Image Management Utility
 * Handles image path resolution, validation, and fallbacks
 */

export interface ImagePathConfig {
  basePaths: string[];
  fallbackImage: string;
  supportedFormats: string[];
}

export class ImageManager {
  private static instance: ImageManager;
  private config: ImagePathConfig;
  private imageCache: Map<string, string> = new Map();

  private constructor() {
    this.config = {
      basePaths: [
        '/images/products/',
        '/sitephoto/Gift Cards/',
        '/sitephoto/New images/',
        '/sitephoto/'
      ],
      fallbackImage: '/images/product-placeholder.svg',
      supportedFormats: ['.webp', '.avif', '.jpg', '.jpeg', '.png', '.svg']
    };
  }

  public static getInstance(): ImageManager {
    if (!ImageManager.instance) {
      ImageManager.instance = new ImageManager();
    }
    return ImageManager.instance;
  }

  /**
   * Resolve image path with fallback mechanisms
   */
  public async resolveImagePath(imagePath: string): Promise<string> {
    // Check cache first
    if (this.imageCache.has(imagePath)) {
      return this.imageCache.get(imagePath)!;
    }

    // If path is already absolute and valid, return it
    if (imagePath.startsWith('/') && await this.imageExists(imagePath)) {
      this.imageCache.set(imagePath, imagePath);
      return imagePath;
    }

    // Extract filename from path
    const filename = this.extractFilename(imagePath);
    
    // Try different base paths
    for (const basePath of this.config.basePaths) {
      const fullPath = basePath + filename;
      if (await this.imageExists(fullPath)) {
        this.imageCache.set(imagePath, fullPath);
        return fullPath;
      }

      // Try different formats
      for (const format of this.config.supportedFormats) {
        const pathWithFormat = basePath + this.changeFileExtension(filename, format);
        if (await this.imageExists(pathWithFormat)) {
          this.imageCache.set(imagePath, pathWithFormat);
          return pathWithFormat;
        }
      }
    }

    // Return fallback image
    console.warn(`Image not found: ${imagePath}, using fallback`);
    return this.config.fallbackImage;
  }

  /**
   * Check if image exists
   */
  private async imageExists(path: string): Promise<boolean> {
    try {
      const response = await fetch(path, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Extract filename from path
   */
  private extractFilename(path: string): string {
    return path.split('/').pop() || path;
  }

  /**
   * Change file extension
   */
  private changeFileExtension(filename: string, newExtension: string): string {
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
    return nameWithoutExt + newExtension;
  }

  /**
   * Normalize image name for consistent matching
   */
  public normalizeImageName(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-_.]/g, '')
      .replace(/-+/g, '-');
  }

  /**
   * Get optimized image path based on browser support
   */
  public getOptimizedImagePath(basePath: string): string {
    // Check for WebP support (modern browsers)
    if (this.supportsWebP()) {
      const webpPath = this.changeFileExtension(basePath, '.webp');
      return webpPath;
    }
    
    // Check for AVIF support (newest browsers)
    if (this.supportsAVIF()) {
      const avifPath = this.changeFileExtension(basePath, '.avif');
      return avifPath;
    }

    return basePath;
  }

  /**
   * Check WebP support
   */
  private supportsWebP(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  /**
   * Check AVIF support
   */
  private supportsAVIF(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    try {
      return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
    } catch {
      return false;
    }
  }

  /**
   * Validate all product images
   */
  public async validateProductImages(products: any[]): Promise<{
    valid: string[];
    invalid: string[];
    suggestions: { [key: string]: string };
  }> {
    const valid: string[] = [];
    const invalid: string[] = [];
    const suggestions: { [key: string]: string } = {};

    for (const product of products) {
      const imagePath = product.primaryImage || product.image;
      if (imagePath) {
        const resolvedPath = await this.resolveImagePath(imagePath);
        if (resolvedPath === this.config.fallbackImage) {
          invalid.push(imagePath);
          // Try to find a suggestion
          const suggestion = await this.findImageSuggestion(product.name);
          if (suggestion) {
            suggestions[imagePath] = suggestion;
          }
        } else {
          valid.push(imagePath);
        }
      }
    }

    return { valid, invalid, suggestions };
  }

  /**
   * Find image suggestion based on product name
   */
  private async findImageSuggestion(productName: string): Promise<string | null> {
    const normalizedName = this.normalizeImageName(productName);
    
    for (const basePath of this.config.basePaths) {
      for (const format of this.config.supportedFormats) {
        const suggestedPath = basePath + normalizedName + format;
        if (await this.imageExists(suggestedPath)) {
          return suggestedPath;
        }
      }
    }
    
    return null;
  }

  /**
   * Clear image cache
   */
  public clearCache(): void {
    this.imageCache.clear();
  }
}

// Export singleton instance
export const imageManager = ImageManager.getInstance();

// Utility function for components
export const resolveImagePath = (imagePath: string): Promise<string> => {
  return imageManager.resolveImagePath(imagePath);
};