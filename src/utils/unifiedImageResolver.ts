/**
 * Unified Image Resolver - Single source of truth for all image path resolution
 * 
 * This replaces all the competing image systems with one intelligent resolver
 * that automatically handles naming variations, case differences, and fallbacks.
 */

interface ImageResolverOptions {
  enableLogging?: boolean;
  enableCaching?: boolean;
}

interface ResolvedImage {
  path: string;
  exists: boolean;
  source: 'direct' | 'normalized' | 'fallback' | 'placeholder';
  originalQuery: string;
}

class UnifiedImageResolver {
  private cache = new Map<string, ResolvedImage>();
  private options: ImageResolverOptions;
  
  // Base directories in priority order
  private readonly basePaths = [
    '/sitephoto/Gift Cards',
    '/sitephoto/New images', 
    '/images/products',
    '/sitephoto'
  ];
  
  // Common file extensions to try
  private readonly extensions = ['.webp', '.jpg', '.jpeg', '.png', '.avif', '.svg'];
  
  // Known image mappings from the existing system
  private readonly knownMappings: { [key: string]: string } = {
    // Gift Cards
    'Airbnb Gift Card': '/sitephoto/Gift Cards/Airbnb Gift Card.jpg',
    'Home Depot Gift Card': '/sitephoto/Gift Cards/Home Depot Gift Card.png',
    'iTunes Gift Card': '/sitephoto/Gift Cards/iTunes Gift Card.webp',
    'Itunes Gift Card': '/images/products/itunes-gift-card.webp',
    'Netflix Gift Card': '/sitephoto/Gift Cards/Netflix Gift Card.webp',
    'PlayStation Store Gift Card': '/sitephoto/Gift Cards/PlayStation Store Gift Card.avif',
    'Sephora Gift Card': '/sitephoto/Gift Cards/Sephora Gift Card.jpg',
    'Spa & Wellness Gift Card': '/sitephoto/Gift Cards/Spa & Wellness Gift Car.jpg',
    'Starbucks Gift Card': '/sitephoto/Gift Cards/Starbucks Gift Card.jpg',
    'Target Gift Card': '/sitephoto/Gift Cards/Target Gift Card.webp',
    'Uber Eats Gift Card': '/sitephoto/Gift Cards/Uber Eats Gift Card.webp',
    'Zapp General Gift Card': '/sitephoto/Gift Cards/Zapp General Gift Card.webp',
    'Amazon Gift Card': '/sitephoto/Gift Cards/amazon-us-50-us-de.png',
    
    // Fresh Foods
    'Baby Spinach': '/images/products/Baby Spinach.webp',
    'Bananas': '/images/products/Bananas.webp',
    'Organic Bananas': '/images/products/organic-bananas-dole.jpg',
    'Fresh Avocados': '/images/products/avocados.jpg',
    'Avocados': '/sitephoto/New images/Avocados.jpg',
    'Premium Cheese': '/images/products/cheese.jpg',
    'Farm Fresh Eggs': '/images/products/eggs-real.jpg',
    
    // Beverages
    'Ginger Beer': '/images/products/Ginger beer.jpg',
    'Premium Ground Coffee': '/images/products/premium-ground-coffee.jpg',
    'Gourmet Coffee': '/sitephoto/New images/Gourmet Coffee.jpg',
    'Dark Roast Coffee': '/sitephoto/New images/Dark Roast Coffee.jpg',
    'Black Tea': '/sitephoto/New images/Black Tea.webp',
    'Premium Green Tea': '/sitephoto/New images/Premium Green Tea.webp',
    'Organic Herbal Tea': '/sitephoto/New images/Organic Herbal Tea.webp',
    'Premium Kombucha': '/sitephoto/New images/Premium Kombucha.jpg',
    'Premium Mineral Water': '/sitephoto/New images/Premium Mineral Water.jpg',
    'Organic Coconut Water': '/sitephoto/New images/Organic Coconut Water.jpg',
    'Gourmet Soda': '/sitephoto/New images/Gourmet Soda.jpg',
    
    // International Products
    'Ghanaian Cocoa Powder': '/images/products/Ghanaian Cocoa Powder.jpeg',
    'Ghanaian Jollof Rice Mix': '/images/products/Ghanaian Jollof Rice Mix.jpg',
    'Jamaican Blue Mountain Coffee': '/images/products/Jamaican Blue Mountain Coffee.jpeg',
    'Kenyan Tea Leaves': '/images/products/Kenyan Tea Leaves.jpeg',
    'Nigerian Chin Chin': '/images/products/Nigerian Chin Chin.jpeg',
    'Nigerian Jollof Rice Mix': '/images/products/Nigerian Jollof Rice Mix.jpg',
    'Nigerian Suya Spice': '/images/products/Nigerian Suya Spice.jpg',
    'Trinidad Scorpion Pepper Sauce': '/images/products/Trinidad Scorpion Pepper Sauce.jpg',
    'Jamaican Beef Patties': '/images/products/Jamaican beef patties.jpg',
    
    // Health Products
    'Allergy Relief 24hr - 30 Tablets': '/sitephoto/New images/Allergy Relief 24hr - 30 Tablets.webp',
    'Apple Cider Vinegar': '/sitephoto/New images/Apple Cider Vinegar.jpg',
    'Premium Protein Shake': '/sitephoto/New images/Premium Protein Shake.avif',
    'Omega-3 Fish Oil - 120 Softgels': '/images/products/Omega-3 Fish Oil - 120 Softgels.jpg',
    'Probiotic Complex - 60 Capsules': '/images/products/Probiotic Complex - 60 Capsules.jpg',
    'Vitamin D3 2000 IU - 90 Softgels': '/images/products/Vitamin D3 2000 IU - 90 Softgels.avif',
    
    // Artisan Products
    'Artisan Ice Cream': '/sitephoto/New images/Artisan Ice Cream.avif',
    'Artisan Bread': '/sitephoto/New images/Artisan Bread.jpg',
    'Artisan Chocolate': '/sitephoto/New images/Artisan Chocolate.webp',
    'Artisan Hot Chocolate': '/sitephoto/New images/Artisan Hot Chocolate.jpeg'
  };
  
  constructor(options: ImageResolverOptions = {}) {
    this.options = {
      enableLogging: false,
      enableCaching: true,
      ...options
    };
  }

  /**
   * Main resolver method - handles any product name or image path
   */
  async resolveImage(query: string, productName?: string): Promise<ResolvedImage> {
    const cacheKey = `${query}|${productName || ''}`;
    
    if (this.options.enableCaching && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Check known mappings first
    const searchKey = productName || query;
    if (this.knownMappings[searchKey]) {
      const result: ResolvedImage = {
        path: this.knownMappings[searchKey],
        exists: true,
        source: 'direct',
        originalQuery: query
      };
      if (this.options.enableCaching) {
        this.cache.set(cacheKey, result);
      }
      return result;
    }

    const result = await this._resolveImageInternal(query, productName);
    
    if (this.options.enableCaching) {
      this.cache.set(cacheKey, result);
    }
    
    if (this.options.enableLogging) {
      console.log(`[UnifiedImageResolver] ${query} -> ${result.path} (${result.source})`);
    }
    
    return result;
  }

  private async _resolveImageInternal(query: string, productName?: string): Promise<ResolvedImage> {
    // Step 1: Try direct path if it looks like a full path
    if (query.startsWith('/')) {
      const exists = await this.checkImageExists(query);
      if (exists) {
        return { path: query, exists: true, source: 'direct', originalQuery: query };
      }
    }

    // Step 2: Generate all possible variations of the query
    const variations = this.generateNameVariations(productName || query);
    
    // Step 3: Try each variation across all base paths and extensions
    for (const variation of variations) {
      for (const basePath of this.basePaths) {
        for (const ext of this.extensions) {
          const fullPath = `${basePath}/${variation}${ext}`;
          const exists = await this.checkImageExists(fullPath);
          
          if (exists) {
            return { 
              path: fullPath, 
              exists: true, 
              source: 'normalized', 
              originalQuery: query 
            };
          }
        }
      }
    }

    // Step 4: Try fallback patterns
    const fallbackPath = await this.tryFallbackPatterns(query, productName);
    if (fallbackPath) {
      return fallbackPath;
    }

    // Step 5: Return placeholder
    return {
      path: '/images/placeholder.jpg',
      exists: false,
      source: 'placeholder',
      originalQuery: query
    };
  }

  /**
   * Generate all possible naming variations for a product
   */
  private generateNameVariations(name: string): string[] {
    const variations = new Set<string>();
    
    // Original name
    variations.add(name);
    
    // Case variations
    variations.add(name.toLowerCase());
    variations.add(name.toUpperCase());
    variations.add(this.toTitleCase(name));
    
    // Remove common words and try again
    const cleanName = name
      .replace(/\b(gift card|card|gift)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (cleanName !== name) {
      variations.add(cleanName);
      variations.add(cleanName.toLowerCase());
      variations.add(this.toTitleCase(cleanName));
    }
    
    // Filename-safe versions
    variations.add(this.toFilename(name));
    variations.add(this.toFilename(cleanName));
    
    // Handle special cases
    if (name.toLowerCase().includes('itunes')) {
      variations.add(name.replace(/itunes/gi, 'iTunes'));
      variations.add(name.replace(/itunes/gi, 'iTunes'));
    }
    
    return Array.from(variations).filter(v => v.length > 0);
  }

  /**
   * Try common fallback patterns
   */
  private async tryFallbackPatterns(query: string, productName?: string): Promise<ResolvedImage | null> {
    const patterns = [
      `/images/products/${this.toFilename(query)}.webp`,
      `/images/products/${this.toFilename(query)}.jpg`,
      `/sitephoto/${this.toFilename(query)}.webp`,
      `/sitephoto/${this.toFilename(query)}.jpg`
    ];

    for (const pattern of patterns) {
      const exists = await this.checkImageExists(pattern);
      if (exists) {
        return {
          path: pattern,
          exists: true,
          source: 'fallback',
          originalQuery: query
        };
      }
    }

    return null;
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
   * Utility methods
   */
  private toTitleCase(str: string): string {
    return str.replace(/\w\S*/g, txt => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  private toFilename(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Clear cache (useful for development)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0 // Would track this in a real implementation
    };
  }
}

// Export singleton instance
export const imageResolver = new UnifiedImageResolver({
  enableLogging: process.env.NODE_ENV === 'development',
  enableCaching: true
});

export { UnifiedImageResolver, type ResolvedImage, type ImageResolverOptions };