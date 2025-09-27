/**
 * Unified Image Path Utility
 * 
 * This utility provides consistent image path handling across all components
 * to prevent inconsistencies between ProductCard and ProductDetail pages.
 * Now integrated with the UnifiedImageResolver for robust image loading.
 */

export interface ImagePathOptions {
  fallbackToPlaceholder?: boolean;
  preferredImageField?: 'images' | 'primaryImage' | 'image';
}

// Known image mappings from the unified resolver
const knownMappings: { [key: string]: string } = {
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
  
  // Products with sitephoto paths
  'Butter Popcorn': '/sitephoto/All Products w_o images/Butter Popcorn.jpg',
  'Basmati Rice': '/sitephoto/All Products w_o images/Basmati Rice.jpg',
  'Berries': '/sitephoto/All Products w_o images/Berries.jpg',
  'Chocolate Candy': '/sitephoto/All Products w_o images/Chocolate Candy.jpg',
  'Beans Premium': '/sitephoto/All Products w_o images/Beans Premium.jpg',
  'Premium Cereal': '/sitephoto/All Products w_o images/Cereal Premium.jpeg',
  'Cereal Premium': '/sitephoto/All Products w_o images/Cereal Premium.jpeg',
  
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

/**
 * Gets the correct image path for a product, handling all possible formats
 * @param product - Product object with image properties
 * @param options - Configuration options for image path resolution
 * @returns Properly formatted image path
 */
export function getProductImagePath(
  product: any, 
  options: ImagePathOptions = {}
): string {
  const { 
    fallbackToPlaceholder = true, 
    preferredImageField = 'images' 
  } = options;

  // First, check if we have a known mapping for this product name
  if (product.name && knownMappings[product.name]) {
    return knownMappings[product.name];
  }

  // Try to get image path from different sources in order of preference
  let imagePath: string | undefined;
  
  switch (preferredImageField) {
    case 'images':
      imagePath = product.images?.[0] || product.primaryImage || product.image;
      break;
    case 'primaryImage':
      imagePath = product.primaryImage || product.images?.[0] || product.image;
      break;
    case 'image':
      imagePath = product.image || product.primaryImage || product.images?.[0];
      break;
  }

  // If no image path found, return placeholder if allowed
  if (!imagePath) {
    return fallbackToPlaceholder ? '/images/product-placeholder.svg' : '';
  }

  // If the path already starts with /sitephoto, return as-is
  if (imagePath.startsWith('/sitephoto/')) {
    return imagePath;
  }

  // Handle different image path formats
  return normalizeImagePath(imagePath);
}

/**
 * Normalizes an image path to ensure it works correctly
 * @param imagePath - Raw image path from product data
 * @returns Normalized image path
 */
export function normalizeImagePath(imagePath: string): string {
  if (!imagePath) {
    return '/images/product-placeholder.svg';
  }

  // If it's already a complete path (starts with /), use it as-is
  if (imagePath.startsWith('/')) {
    return imagePath;
  }

  // If it's a relative path, assume it's in the products directory
  return `/images/products/${imagePath}`;
}

/**
 * Gets multiple image paths for a product (for galleries, thumbnails, etc.)
 * @param product - Product object
 * @param maxImages - Maximum number of images to return
 * @returns Array of normalized image paths
 */
export function getProductImagePaths(product: any, maxImages: number = 4): string[] {
  const images: string[] = [];
  
  // Start with the primary image
  const primaryImage = getProductImagePath(product);
  images.push(primaryImage);
  
  // Add additional images if available
  if (product.images && Array.isArray(product.images)) {
    for (let i = 0; i < product.images.length && images.length < maxImages; i++) {
      const normalizedPath = normalizeImagePath(product.images[i]);
      if (!images.includes(normalizedPath)) {
        images.push(normalizedPath);
      }
    }
  }
  
  // Fill remaining slots with variations of the primary image (for demo purposes)
  while (images.length < maxImages) {
    images.push(primaryImage);
  }
  
  return images;
}

/**
 * Creates an error handler for image loading failures
 * @param fallbackPath - Path to use when image fails to load
 * @returns Error handler function
 */
export function createImageErrorHandler(fallbackPath: string = '/images/product-placeholder.svg') {
  return (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    if (target.src !== fallbackPath) {
      target.src = fallbackPath;
    }
  };
}