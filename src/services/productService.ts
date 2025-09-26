// Firebase imports for production
import { db, storage } from '../config/firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  query, 
  where, 
  limit, 
  orderBy, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  writeBatch,
  startAfter,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { InputSanitizer } from '../utils/security';
import productsData from '../../data/products/products.json';

// Enhanced Product types
export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  image?: string;
  parentCategory?: string;
  isActive: boolean;
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
}

export interface ProductNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  servingSize?: string;
}

export interface VolumeDiscount {
  quantity: number;
  discountPercentage: number;
  label?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  weight: string;
  sku: string;
  stock: number;
  image?: string;
}

export interface ProductReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
  verified: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  images: string[];
  primaryImage: string;
  origin: string;
  category: string;
  subcategory?: string;
  weight: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  sku: string;
  barcode?: string;
  stock: number;
  lowStockThreshold: number;
  inStock: boolean;
  featured?: boolean;
  isActive: boolean;
  nutritionInfo?: ProductNutrition;
  tags: string[];
  averageRating: number;
  reviewCount: number;
  totalSold: number;
  volumeDiscounts?: VolumeDiscount[];
  variants?: ProductVariant[];
  relatedProducts?: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  // Gift card specific fields
  isGiftCard?: boolean;
  brand?: string;
  denominations?: number[];
  customAmount?: { min: number; max: number };
  discount?: number;
  isPopular?: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

// Helper function to map product names to sitephoto paths
/**
 * Maps product names to their corresponding sitephoto image paths
 * Organized by category for better maintainability
 */
function getSitephotoImagePath(productName: string): string | null {
  const sitephotoMapping: { [key: string]: string } = {
    // ===== GIFT CARDS =====
    'Airbnb Gift Card': '/sitephoto/Gift Cards/Airbnb Gift Card.jpg',
    'Home Depot Gift Card': '/sitephoto/Gift Cards/Home Depot Gift Card.png',
    'iTunes Gift Card': '/sitephoto/Gift Cards/iTunes Gift Card.webp',
    'Itunes Gift Card': '/images/products/itunes-gift-card.webp', // Lowercase variant for product data consistency
    'Netflix Gift Card': '/sitephoto/Gift Cards/Netflix Gift Card.webp',
    'PlayStation Store Gift Card': '/sitephoto/Gift Cards/PlayStation Store Gift Card.avif',
    'Sephora Gift Card': '/sitephoto/Gift Cards/Sephora Gift Card.jpg',
    'Spa & Wellness Gift Card': '/sitephoto/Gift Cards/Spa & Wellness Gift Card.jpg',
    'Starbucks Gift Card': '/sitephoto/Gift Cards/Starbucks Gift Card.jpg',
    'Target Gift Card': '/sitephoto/Gift Cards/Target Gift Card.webp',
    'Uber Eats Gift Card': '/sitephoto/Gift Cards/Uber Eats Gift Card.webp',
    'Zapp General Gift Card': '/sitephoto/Gift Cards/Zapp General Gift Card.webp',

    // ===== FRESH FOODS =====

    'Baby Spinach': '/images/products/Baby Spinach.webp',
    'Bananas': '/images/products/Bananas.webp',
    'Fresh Bananas': '/images/products/Bananas.webp',
    'Fresh Strawberries': '/images/products/Fresh Strawberries.jpg',
    'Organic Bananas': '/images/products/Bananas.webp',

    // ===== HOSPITALITY =====

    'Jamaican Beef Patties': '/images/products/Jamaican-Beef-Patties-.jpg',

    // ===== NEW AFRICAN PRODUCTS =====
    'Ghanaian Cocoa Powder': '/images/products/Ghanaian Cocoa Powder.jpeg',
    'Ghanaian Jollof Rice Mix': '/images/products/Ghanaian Jollof Rice Mix.jpg',
    'Jamaican Blue Mountain Coffee': '/images/products/Jamaican Blue Mountain Coffee.jpeg',
    'Jamaican Blue Mountain Coffee 2': '/images/products/Jamaican Blue Mountain Coffee 2.jpeg',
    'Kenyan Tea Leaves': '/images/products/Kenyan Tea Leaves.jpeg',
    'Nigerian Chin Chin': '/images/products/Nigerian Chin Chin.jpeg',
    'Nigerian Jollof Rice Mix': '/images/products/Nigerian Jollof Rice Mix.jpg',
    'Nigerian Suya Spice': '/images/products/Nigerian Suya Spice.jpg',
    'Trinidad Scorpion Pepper Sauce': '/images/products/Trinidad Scorpion Pepper Sauce.jpg',
    'Trinidad Scorpion Pepper Sauce 2': '/images/products/Trinidad Scorpion Pepper Sauce 2.jpg',

    // ===== DEAL OF THE DAY =====
    'Artisan Cheese Selection': '/images/products/Artisan Cheese Selection.jpeg',
    'Artisan Cheese': '/images/products/Artisan Cheese.webp',
    'Fresh Eggs - Dozen': '/images/products/Fresh Eggs - Dozen.webp',
    'Fresh Shrimp - 1 lb': '/images/products/Fresh Shrimp - 1 lb.jpg',
    'Mix Berry Pack': '/images/products/mix berry pack.webp',
    'Premium Pasta - 4 Pack': '/images/products/Premium Pasta - 4 Pack.jpeg',
    'Whole Grain Bread': '/images/products/whole Grain bread.jpg',

    // ===== SITEPHOTO DIRECTORY MAPPINGS =====
    'Apple Cider Vinegar': '/sitephoto/New images/Apple Cider Vinegar.jpg',
    'Premium Protein Shake': '/sitephoto/New images/Premium Protein Shake.avif',
    'Artisan Ice Cream': '/sitephoto/New images/Artisan Ice Cream.avif',
    'Artisan Bread': '/sitephoto/New images/Artisan Bread.jpg',
    'Artisan Chocolate': '/sitephoto/New images/Artisan Chocolate.webp',
    'Artisan Hot Chocolate': '/sitephoto/New images/Artisan Hot Chocolate.jpeg',
    'Avocados': '/sitephoto/New images/Avocados.jpg',
    'Black Tea': '/sitephoto/New images/Black Tea.webp',
  'Gourmet Black Tea': '/sitephoto/New images/Black Tea.webp',
  'Gourmet Coffee': '/sitephoto/New images/Gourmet Coffee.jpg',
    'Gourmet Soda': '/sitephoto/New images/Gourmet Soda.jpg',
    'Organic Coconut Water': '/sitephoto/New images/Organic Coconut Water.jpg',
    'Organic Herbal Tea': '/sitephoto/New images/Organic Herbal Tea.webp',
    'Premium Green Tea': '/sitephoto/New images/Premium Green Tea.webp',
    'Premium Kombucha': '/sitephoto/New images/Premium Kombucha.jpg',
    'Premium Mineral Water': '/sitephoto/New images/Premium Mineral Water.jpg',
    'Allergy Relief 24hr - 30 Tablets': '/sitephoto/New images/Allergy Relief 24hr - 30 Tablets.webp',
    'Amazon-us-50-us-de': '/images/products/gift-cards/amazon-us-50-us-de.png',
    'Dark Roast Coffee': '/sitephoto/New images/Dark Roast Coffee.jpg',
    'Ginger Beer': '/sitephoto/New images/Ginger Beer.webp',
    'Coffee Premium': '/sitephoto/New images/Coffee Premium.jpg',
    'Cola Classic': '/sitephoto/New images/Cola Classic.jpg',

    // ===== PHARMACY =====
    'Blood Pressure Monitor': '/images/products/Blood Pressure Monitor.jpg',
    'Digital Thermometer': '/images/products/Digital Thermometer.avif',
    'Equate Ibuprofen Tablets 200 mg': '/images/products/Equate-Ibuprofen-Tablets-200-mg.avif',
    'First Aid Kit - Complete': '/images/products/First Aid Kit - Complete.jpg',
    'Omega-3 Fish Oil - 120 Softgels': '/images/products/Omega-3 Fish Oil - 120 Softgels.jpg',
    'Probiotic Complex - 60 Capsules': '/images/products/Probiotic Complex - 60 Capsules.jpg',
    'Vitamin D3 2000 IU - 90 Softgels': '/images/products/Vitamin D3 2000 IU - 90 Softgels.avif',

    // ===== COFFEE =====
    'Copper Cow Coffee Vietnamese Coffee & Real Cinnamon Churro': '/images/products/Copper_Cow_Coffee_Vietnamese_Coffee&Real Cinnamon_Churro.png',
    'Dunkin Original Blend': '/images/products/Dunkin_Original_Blend.png',
    'Kirkland Columbian Coffee': '/images/products/Kirkland_Columbian_Coffee.png',
    'Kirkland Decaffeinated Coffee': '/images/products/Kirkland_Decaffeinated_Coffee.png',
    'Kirkland Espresso Blend': '/images/products/Kirkland_Espresso_Blend.png',
    'Kirkland Ground Coffee': '/images/products/Kirkland_Ground_Coffee.png',
    'Kirkland House Blend': '/images/products/Kirkland_House_Blend.png',
    'Mayorga Coffee Organic Cafe Cubano': '/images/products/Mayorga_Coffee_Organic_Cafe\'_Cubano.png',
    'Nescafe Tester\'s Choice': '/images/products/Nescafe\'_Tester\'s_Choice.png',
    'Peet\'s Coffee Dark Roast Organic': '/images/products/Peet\'s_Coffee_Dark_Roast_Organic.png',

    // ===== BREAKFAST CEREAL =====
    'BlueBerry Almond Crunch': '/images/products/BlueBerry_Almond_Crunch.png',
    'Honey Bunch of Oats Granola Honey Roasted': '/images/products/Honey_Bunch_of_Oats_Granola_Honey_Roasted.png',
    'Honey Nut Cheerios': '/images/products/Honey_Nut_Cheerios.png',
    'Kellogg\'s Froot Loops': '/images/products/Kelloggs\'s Froot_Loops.png',
    'Kellogg\'s Frosted Flakes': '/images/products/Kellogg\'s Frosted Flakes_Pack.png',
    'Kellogg\'s Raisin Bran': '/images/products/Kellogg\'s_Raisin_Bran.png',
    'Kellogg\'s Special K Red Berries': '/images/products/Kellogg\'s_Special_K_Red_Berries.png',

    // ===== BEANS =====
    'Goya Black Beans': '/images/products/Goya_Black Beans.png',
    'Goya Chick Peas Garbanzos': '/images/products/Goya_Chick_Peas_Garbanzos.png',
    'Goya Red Kidney Beans': '/images/products/Goya_Red_Kidney_Beans.png',

    // ===== CANDY =====
    '28 Full Size Candy Bars': '/images/products/28_Full_Size_Candy_Bars.png',
    'Kinder Bueno': '/images/products/Kinder_Bueno.png',
    'Kit Kat': '/images/products/Kit_Kat.png',
    'Milk Chocolate M&M\'s': '/images/products/Milk_Chocaolate_M&M\'s.png',
    'Peanut M&M\'s': '/images/products/Peanut_M&M\'s.png',
    'Reese\'s': '/images/products/Reese\'s.png',
    'Variety Pack Candy': '/images/products/Variety_Pack_Candy.png',

    // ===== SNACKS =====
    // Potato Chips
    'Dill Pickle Route 11 Chips': '/images/products/Dill_Pickle_Route_11_Chips.png',
    'Doritos': '/images/products/Doritos.png',
    'Gutz': '/images/products/Gutz.png',
    'Jackson\'s Sweet Potato Chips': '/images/products/Jackson\'s_Sweet_Potato_Chips.png',
    'Kirkland Quinoa': '/images/products/Kirkland_Quinoa.png',
    'Lays': '/images/products/Lays.png',
    'Pringles Snack Stacks': '/images/products/Pringles_Snack_Stacks.png',
    'Sun Chips Garden Salsa': '/images/products/Sun_Chips_Garden_Salsa.png',
    'Tostitos': '/images/products/Tostitos.png',

    // Popcorn
    'Kirkland Popcorn': '/images/products/Kirkland_Popcorn.png',
    'Lesser Evil Popcorn': '/images/products/Lesser_Evil_Popcorn.png',
    'Pop Corners': '/images/products/Pop_Corners.png',
    'Skinny Pop Popcorn': '/images/products/Skinny_Pop_Popcorn.png',

    // Crackers
    'Cheez It': '/images/products/Cheez_It.png',
    'Club': '/images/products/Club.png',
    'GoldFish Cheddar': '/images/products/GoldFish_Cheddar.png',
    'Lance Toast Chee': '/images/products/Lance_Toast_Chee.png',

    // Cookies
    'BelVita Crunchy': '/images/products/BelVita_Crunchy.png',
    'Oreo': '/images/products/Oreo.png',
    'Oreo Space Dunk': '/images/products/Oreo_Space_Dunk.png',

    // Protein Bars
    'Chewy Protein Bars': '/images/products/Chewy_Protein_Bars.png',
    'Genius Crispy Protein Treat': '/images/products/Genius_Crispy_Protein_Treat.png',
    'Kind Minis': '/images/products/Kind_Minis.png',
    'Kirkland Soft & Chewy Granola Bars': '/images/products/Kirkland_Soft & Chewy_Granola_Bars.png',
    'Nature Valley Crunchy': '/images/products/Nature_Valley_Crunchy.png',
    'Nature Valley Protein': '/images/products/Nature_valley_Protein.png',
    'Nut Bars': '/images/products/Nut_Bars.png',
    'Protein Bar': '/images/products/Protein_Bar.png',
    'Pure Protein': '/images/products/Pure_Protein.png',
    'Simply Protein': '/images/products/Simply_Protein.png',

    // Fruit Snacks
    'Black Forest Organic Gummy Bears': '/images/products/Black_Forest_Organic_Gummy_Bears.png',
    'ClifKid ZBar': '/images/products/ClifKid_ZBar.png',
    'Fruit By The Foot': '/images/products/Fruit_By_The_Foot.png',
    'Mott\'s': '/images/products/Mott\'s.png',
    'Nutella B-Ready': '/images/products/Nutella_B-Ready.png',
    'NutriGrain Breakfast Bars': '/images/products/NutriGrain_Breakfast_Bars.png',
    'Welch\'s Fruit Snacks': '/images/products/Welch\'s_Fruit_Snacks.png',

    // Cheese Snacks
    'Pirate\'s Booty White Cheddar': '/images/products/Pirate\'s_Booty_White_Cheddar.png',

    // Chewing Gum
    'Orbit': '/images/products/Orbit.png',
    'Trident': '/images/products/Trident.png',
    'Trident Fruit Variety': '/images/products/Trident_Fruit_Variety.png',

    // ===== BEVERAGES =====
    // Juices
    'Bai': '/images/products/Bai.png',
    'Honest Kids Organic Juice Drink': '/images/products/Honest_Kids_Organic_Juice_Drink.png',
    'Kirkland Organic Fruit & Vegetables Pouches': '/images/products/Kirkland_Organic_Fruit & Vegetables_Puches.png',
    'Sanpellegrino': '/images/products/Sanpellecrino.png',
    'Snapple': '/images/products/Snapple.png',
    'Snapple Tea': '/images/products/Snapple_Tea.png',
    'SunBerry Organic Guava Nectar': '/images/products/SunBerry_Organic_Guava_Nectar.png',

    // Energy Drinks
    'BodyArmor Lyte Sports Drink': '/images/products/BodyArmor_Lyte_Sports_Drink.png',
    'Red Bull': '/images/products/Red_Bull.png',

    // Gatorade
    'Gatorade G Zero': '/images/products/Gatorade_G_Zero.png',
    'Gatorade Pack': '/images/products/Gatorade_Pack.png',

    // Milk
    'Epoca Cool Banana Milk': '/images/products/Epoca_Cool_Banana_Milk.png',
    'Kirkland Evaporated Milk': '/images/products/Kirkland_Evaporated_Milk.png',
    'Kirkland Organic Almond Vanilla': '/images/products/Kirkland_Organic_Almond_Vanilla.jpg',
    'Nestle LaLechera': '/images/products/Nestle_LaLechera.png',
    'RealCoco Milk': '/images/products/RealCoco_Milk.png',

    // Nesquik
    'Nesquik': '/images/products/Nesquik.png',
    'Nesquik Nestle': '/images/products/Nesquik_Nestle.png',

    // Frappuccino
    'Frappuccino': '/images/products/Frappuccino.png',

    // Milk Tea
    'A Sha': '/images/products/A_Sha.png',

    // ===== PANTRY ITEMS =====
    // Peanut Butter
    'JiF Gluten Free': '/images/products/JiF_Gluten_Free.png',
    'JiF Peanut Butter': '/images/products/JiF_Peanut_Butter.png',

    // Rice
    'Adolphus Rice': '/images/products/Adolphus_Rice.png',
    'Mahatma': '/images/products/Mahatma.png',

    // Oats
    'Kirkland Oat': '/images/products/Kirkland_Oat.png',
    'Kirkland Rolled Oats': '/images/products/Kirkland_Rolled_Oats.png',
    'Quaker Oats': '/images/products/Quaker_Oats.png',

    // Condiments
    'A.1.': '/images/products/A._1..png',
    'French\'s Yellow Mustard Spread': '/images/products/French\'s_Yellow_Mustard_Spread.png',
    'Ray\'s Barbecue Sauce': '/images/products/Ray\'s_Barbecue_Sauce.png',

    // Mayo
    'Chosen Foods Avocado Oil Mayo': '/images/products/Chosen_Foods_Avocado_Oil_Mayo.png',

    // Lemon Juice
    'ReaLemon': '/images/products/ReaLemon.png',

    // Garlic
    'Kirkland Minced Garlic': '/images/products/Kirkland_Minced_Garlic.png',

    // Flour
    'Kirkland Almond Flour': '/images/products/Kirkland_Almond_Flour.png',

    // Pancake Mix
    'Krusteaz Buttermilk': '/images/products/Krusteaz_Buttermilk.png',

    // Nuts
    'Kirkland Pistachios': '/images/products/Kirkland_Pistachios.png',

    // Chick Peas
    'Hanover Chick Peas': '/images/products/Hanover_Chick_Peas.png',

    // Tuna
    'Chicken of the Sea Light Tuna': '/images/products/Chicken_of_the_Sea_Light_Tuna.png',

    // Apple Cider Vinegar
    'North Coast Organic Raw Apple Cider Vinegar': '/images/products/North_Coast_Organic Raw_ Apple_Cider_Vinegar.png',

    // Rice Crispy Treats
    'Rice Krispies Treats': '/images/products/Rice_Krispies_Treats.png',

    // ===== HOUSEHOLD ITEMS =====
    'Towels': '/images/products/towels.webp',
    'Towels 2': '/images/products/towels 2.webp',

    // ===== AUTOMOTIVE =====
    'Motor Oil': '/images/products/motor Oil.webp',
    'Motor Oil 2': '/images/products/motor oil 2.webp',

    // ===== MISCELLANEOUS =====
    'Premium Cheese': '/images/products/cheese.jpg',
    's blob v1 IMAGE Gtdpi0mG9og': '/images/products/s-blob-v1-image-gtdpi0mg9og.png'
  };
  
  return sitephotoMapping[productName] || null;
}

// Transform products from JSON to match Product interface
const transformProductData = (productData: any): Product => {
  // Use product name directly - ProductImage component will handle path resolution
  const imagePath = productData.name;

  return {
    id: productData.id,
    name: productData.name,
    description: productData.description,
    shortDescription: productData.description,
    price: productData.price,
    currency: productData.currency || 'USD',
    images: [imagePath],
    primaryImage: imagePath,
    origin: productData.origin || 'USA',
    category: productData.category,
    weight: productData.weight ? `${productData.weight} ${productData.weightUnit}` : '1 unit',
    sku: productData.id,
    stock: productData.stock || 100,
    lowStockThreshold: 10,
    inStock: (productData.stock || 100) > 0,
    featured: productData.featured || false,
    isActive: true,
    nutritionInfo: productData.nutrition ? {
      calories: productData.nutrition.calories,
      protein: productData.nutrition.protein,
      carbs: productData.nutrition.carbs,
      fat: productData.nutrition.fat
    } : undefined,
    tags: [productData.category, (productData.origin || 'USA').toLowerCase()],
    averageRating: productData.rating || 4.5,
    reviewCount: productData.reviewCount || Math.floor(Math.random() * 50) + 5,
    totalSold: Math.floor(Math.random() * 200) + 10,
    // Gift card specific fields
    isGiftCard: productData.isGiftCard || false,
    brand: productData.brand,
    denominations: productData.denominations,
    customAmount: productData.customAmount,
    discount: productData.discount,
    isPopular: productData.isPopular || false,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
    updatedBy: 'system'
  };
};

// Cache for transformed products
let transformedProductsCache: Product[] | null = null;

// Get all transformed products
const getAllTransformedProducts = (): Product[] => {
  if (!transformedProductsCache) {
    transformedProductsCache = (productsData as any[]).map(transformProductData);
  }
  return transformedProductsCache;
};

/**
 * Fetch all products
 */
export async function getAllProducts(): Promise<Product[]> {
  try {
    return getAllTransformedProducts();
  } catch (error) {
    console.error('Error fetching all products:', error);
    return [];
  }
}

/**
 * Fetch products by category
 */
export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  try {
    const allProducts = getAllTransformedProducts();
    
    if (categoryId === 'all') {
      return allProducts;
    }
    
    // Handle gift cards category
    if (categoryId === 'gift-cards') {
      return allProducts.filter(product => product.isGiftCard === true);
    }
    
    return allProducts.filter(product => 
      product.category.toLowerCase() === categoryId.toLowerCase()
    );
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
}

/**
 * Search products by query
 */
export async function searchProducts(
  searchQuery: string,
  filters?: {
    categories?: string[];
    origins?: string[];
    priceRange?: { min: number; max: number };
    inStockOnly?: boolean;
  },
  sortBy?: string,
  sortOrder?: 'asc' | 'desc',
  page?: number,
  pageSize?: number
): Promise<{ products: Product[]; total: number; hasMore: boolean }> {
  try {
    let allProducts = getAllTransformedProducts();
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      allProducts = allProducts.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.origin.toLowerCase().includes(query) ||
        product.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply filters
    if (filters) {
      if (filters.categories && filters.categories.length > 0) {
        allProducts = allProducts.filter(product =>
          filters.categories!.includes(product.category)
        );
      }
      
      if (filters.origins && filters.origins.length > 0) {
        allProducts = allProducts.filter(product =>
          filters.origins!.includes(product.origin)
        );
      }
      
      if (filters.priceRange) {
        allProducts = allProducts.filter(product =>
          product.price >= filters.priceRange!.min &&
          product.price <= filters.priceRange!.max
        );
      }
      
      if (filters.inStockOnly) {
        allProducts = allProducts.filter(product => product.inStock);
      }
    }
    
    // Apply sorting
    if (sortBy) {
      allProducts.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (sortBy) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'price':
            aValue = a.price;
            bValue = b.price;
            break;
          case 'rating':
            aValue = a.averageRating;
            bValue = b.averageRating;
            break;
          case 'popularity':
            aValue = a.totalSold;
            bValue = b.totalSold;
            break;
          default:
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
        }
        
        if (sortOrder === 'desc') {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        } else {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        }
      });
    }
    
    // Apply pagination
    const total = allProducts.length;
    const currentPage = page || 1;
    const size = pageSize || 20;
    const startIndex = (currentPage - 1) * size;
    const endIndex = startIndex + size;
    const paginatedProducts = allProducts.slice(startIndex, endIndex);
    const hasMore = endIndex < total;
    
    return {
      products: paginatedProducts,
      total,
      hasMore
    };
  } catch (error) {
    console.error('Error searching products:', error);
    return { products: [], total: 0, hasMore: false };
  }
}

/**
 * Get featured products
 */
export const getFeaturedProducts = async (count: number = 8): Promise<Product[]> => {
  try {
    // Import featured products data
    const featuredProductsData = await import('../../data/products/featured-products.json');
    const featuredProducts = featuredProductsData.default || featuredProductsData;
    
    // Transform featured products data
    const transformedFeaturedProducts = featuredProducts
      .slice(0, count)
      .map(transformProductData);
    
    return transformedFeaturedProducts;
  } catch (error) {
    console.error('Error fetching featured products:', error);
    // Fallback to products with featured flag from main products
    const allProducts = getAllTransformedProducts();
    return allProducts
      .filter(p => p.featured)
      .slice(0, count);
  }
};

/**
 * Get a single product by ID
 */
export const getProductById = async (productId: string): Promise<Product | null> => {
  try {
    const allProducts = getAllTransformedProducts();
    const product = allProducts.find(p => p.id === productId);
    return product || null;
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    return null;
  }
};

/**
 * Get similar products based on category and origin
 */
export const getSimilarProducts = async (productId: string, count: number = 4): Promise<Product[]> => {
  try {
    const allProducts = getAllTransformedProducts();
    const product = allProducts.find(p => p.id === productId);
    
    if (!product) return [];
    
    const similarProducts = allProducts.filter(p =>
      p.id !== productId &&
      (p.category === product.category || p.origin === product.origin)
    );
    
    return similarProducts.slice(0, count);
  } catch (error) {
    console.error('Error fetching similar products:', error);
    return [];
  }
};

/**
 * Get all unique origins
 */
export const getAllOrigins = async (): Promise<string[]> => {
  try {
    const allProducts = getAllTransformedProducts();
    const origins = [...new Set(allProducts.map(p => p.origin))];
    return origins.sort();
  } catch (error) {
    console.error('Error fetching origins:', error);
    return [];
  }
};

/**
 * Get all unique categories
 */
export const getAllCategories = async (): Promise<string[]> => {
  try {
    const allProducts = getAllTransformedProducts();
    const categories = [...new Set(allProducts.map(p => p.category))];
    return categories.sort();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

/**
 * Get all product categories
 */
export const getCategories = async (): Promise<ProductCategory[]> => {
  try {
    // Import categories data
    const categoriesData = await import('../../data/products/categories.json');
    const categories = categoriesData.default || categoriesData;
    
    // Get available categories from products to filter only active ones
    const allProducts = getAllTransformedProducts();
    const availableCategories = [...new Set(allProducts.map(p => p.category))];
    
    // Filter categories to only include those that have products
    const activeCategories = categories.filter((category: any) => 
      availableCategories.includes(category.id)
    );
    
    return activeCategories.map((category: any, index: number) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      image: category.image || `categories/${category.id}.png`,
      isActive: true,
      sortOrder: index
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Fallback to dynamic generation if categories.json fails to load
    const allProducts = getAllTransformedProducts();
    const categories = [...new Set(allProducts.map(p => p.category))];
    
    return categories.map((category, index) => ({
      id: category,
      name: category.charAt(0).toUpperCase() + category.slice(1),
      description: `${category.charAt(0).toUpperCase() + category.slice(1)} products`,
      image: `categories/${category}.png`,
      isActive: true,
      sortOrder: index
    }));
  }
};

/**
 * Get products for a specific page (with pagination)
 */
export const getProductsPage = async (
  page: number = 1,
  pageSize: number = 20,
  category?: string
): Promise<{ products: Product[]; total: number; hasMore: boolean }> => {
  try {
    let allProducts = getAllTransformedProducts();
    
    if (category) {
      allProducts = allProducts.filter(product => product.category === category);
    }
    
    const total = allProducts.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedProducts = allProducts.slice(startIndex, endIndex);
    const hasMore = endIndex < total;
    
    return {
      products: paginatedProducts,
      total,
      hasMore
    };
  } catch (error) {
    console.error('Error fetching products page:', error);
    return { products: [], total: 0, hasMore: false };
  }
};

// Legacy functions for backward compatibility
export async function getAllProductsFromFirestore(): Promise<Product[]> {
  return getAllProducts();
}

export async function getProductsByOrigin(origin: string): Promise<Product[]> {
  try {
    const allProducts = getAllTransformedProducts();
    return allProducts.filter(product => product.origin === origin);
  } catch (error) {
    console.error('Error fetching products by origin:', error);
    return [];
  }
}

export async function getProductsByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]> {
  try {
    const allProducts = getAllTransformedProducts();
    return allProducts.filter(product => 
      product.price >= minPrice && product.price <= maxPrice
    );
  } catch (error) {
    console.error('Error fetching products by price range:', error);
    return [];
  }
}

export async function getInStockProducts(): Promise<Product[]> {
  try {
    const allProducts = getAllTransformedProducts();
    return allProducts.filter(product => product.inStock);
  } catch (error) {
    console.error('Error fetching in-stock products:', error);
    return [];
  }
}

export async function getOutOfStockProducts(): Promise<Product[]> {
  try {
    const allProducts = getAllTransformedProducts();
    return allProducts.filter(product => !product.inStock);
  } catch (error) {
    console.error('Error fetching out-of-stock products:', error);
    return [];
  }
}

export async function getLowStockProducts(): Promise<Product[]> {
  try {
    const allProducts = getAllTransformedProducts();
    return allProducts.filter(product => 
      product.stock <= product.lowStockThreshold && product.inStock
    );
  } catch (error) {
    console.error('Error fetching low-stock products:', error);
    return [];
  }
}

// Search and filter utilities
export const getSearchSuggestions = async (query: string): Promise<string[]> => {
  try {
    const allProducts = getAllTransformedProducts();
    const suggestions = new Set<string>();
    
    const lowerQuery = query.toLowerCase();
    
    allProducts.forEach(product => {
      if (product.name.toLowerCase().includes(lowerQuery)) {
        suggestions.add(product.name);
      }
      if (product.category.toLowerCase().includes(lowerQuery)) {
        suggestions.add(product.category);
      }
      if (product.origin.toLowerCase().includes(lowerQuery)) {
        suggestions.add(product.origin);
      }
    });
    
    return Array.from(suggestions).slice(0, 10);
  } catch (error) {
    console.error('Error getting search suggestions:', error);
    return [];
  }
};

export const getFilterOptions = async () => {
  try {
    const allProducts = getAllTransformedProducts();
    
    const categories = [...new Set(allProducts.map(p => p.category))].sort();
    const origins = [...new Set(allProducts.map(p => p.origin))].sort();
    const priceRange = {
      min: Math.min(...allProducts.map(p => p.price)),
      max: Math.max(...allProducts.map(p => p.price))
    };
    
    return {
      categories,
      origins,
      priceRange
    };
  } catch (error) {
    console.error('Error getting filter options:', error);
    return {
      categories: [],
      origins: [],
      priceRange: { min: 0, max: 100 }
    };
  }
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Enhanced product management functions
export class ProductManager {
  // Image upload functionality
  static async uploadProductImage(file: File, productId: string): Promise<string> {
    try {
      const timestamp = Date.now();
      const fileName = `products/${productId}/${timestamp}_${file.name}`;
      const imageRef = ref(storage, fileName);
      
      const snapshot = await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  }

  // Delete product image
  static async deleteProductImage(imageUrl: string): Promise<void> {
    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
    } catch (error) {
      console.error('Error deleting image:', error);
      // Don't throw error as image might already be deleted
    }
  }

  // Create new product
  static async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<string> {
    try {
      const sanitizedData = InputSanitizer.sanitizeProductData(productData);
      
      const product: Omit<Product, 'id'> = {
        ...sanitizedData,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userId,
        updatedBy: userId,
        averageRating: 0,
        reviewCount: 0,
        totalSold: 0,
        isActive: true
      };

      const docRef = await addDoc(collection(db, 'products'), product);
      return docRef.id;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  // Update existing product
  static async updateProduct(productId: string, updates: Partial<Product>, userId: string): Promise<void> {
    try {
      const sanitizedUpdates = InputSanitizer.sanitizeProductData(updates);
      
      await updateDoc(doc(db, 'products', productId), {
        ...sanitizedUpdates,
        updatedAt: new Date(),
        updatedBy: userId
      });
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  // Delete product
  static async deleteProduct(productId: string): Promise<void> {
    try {
      // Get product to delete associated images
      const product = await getProductById(productId);
      if (product && product.images) {
        // Delete all product images
        await Promise.all(
          product.images.map(imageUrl => this.deleteProductImage(imageUrl))
        );
      }

      await deleteDoc(doc(db, 'products', productId));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // Bulk operations
  static async bulkUpdateProducts(updates: Array<{id: string, data: Partial<Product>}>, userId: string): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      updates.forEach(({ id, data }) => {
        const sanitizedData = InputSanitizer.sanitizeProductData(data);
        const productRef = doc(db, 'products', id);
        batch.update(productRef, {
          ...sanitizedData,
          updatedAt: new Date(),
          updatedBy: userId
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error bulk updating products:', error);
      throw error;
    }
  }

  // Update inventory
  static async updateInventory(productId: string, newStock: number, userId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'products', productId), {
        stock: newStock,
        inStock: newStock > 0,
        updatedAt: new Date(),
        updatedBy: userId
      });
    } catch (error) {
      console.error('Error updating inventory:', error);
      throw error;
    }
  }

  // Get low stock products
  static async getLowStockProducts(threshold?: number): Promise<Product[]> {
    try {
      const allProducts = getAllTransformedProducts();
      return allProducts.filter(product => 
        product.stock <= (threshold || 10) && product.inStock
      );
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      return [];
    }
  }
}

// Enhanced search functionality
export class ProductSearch {
  private searchIndex: Map<string, Product[]> = new Map();
  private initialized = false;

  constructor() {
    this.initializeSearchIndex();
  }

  private initializeSearchIndex(): void {
    if (this.initialized) return;
    
    const products = getAllTransformedProducts();
    
    // Create search index for faster lookups
    products.forEach(product => {
      const searchTerms = [
        product.name.toLowerCase(),
        product.description.toLowerCase(),
        product.category.toLowerCase(),
        product.origin?.toLowerCase() || '',
        ...(product.tags || []).map(tag => tag.toLowerCase()),
        product.brand?.toLowerCase() || ''
      ];

      searchTerms.forEach(term => {
        if (term) {
          const words = term.split(/\s+/);
          words.forEach(word => {
            if (word.length > 2) {
              if (!this.searchIndex.has(word)) {
                this.searchIndex.set(word, []);
              }
              this.searchIndex.get(word)!.push(product);
            }
          });
        }
      });
    });

    this.initialized = true;
  }

  async searchProducts(query: string, filters?: SearchFilters): Promise<Product[]> {
    this.initializeSearchIndex();
    
    if (!query.trim()) {
      return this.applyFilters(getAllTransformedProducts(), filters);
    }

    const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
    let results: Product[] = [];

    if (searchTerms.length === 0) {
      // If no valid search terms, return all products with filters applied
      results = getAllTransformedProducts();
    } else {
      // Find products that match any search term
      const matchedProducts = new Set<Product>();
      
      searchTerms.forEach(term => {
        // Exact matches
        if (this.searchIndex.has(term)) {
          this.searchIndex.get(term)!.forEach(product => matchedProducts.add(product));
        }
        
        // Partial matches
        for (const [indexTerm, products] of this.searchIndex.entries()) {
          if (indexTerm.includes(term) || term.includes(indexTerm)) {
            products.forEach(product => matchedProducts.add(product));
          }
        }
      });

      results = Array.from(matchedProducts);
    }

    return this.applyFilters(results, filters);
  }

  private applyFilters(products: Product[], filters?: SearchFilters): Product[] {
    if (!filters) return products;

    return products.filter(product => {
      // Category filter
      if (filters.category && product.category !== filters.category) {
        return false;
      }

      // Price range filter
      if (filters.minPrice !== undefined && product.price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice !== undefined && product.price > filters.maxPrice) {
        return false;
      }

      // Origin filter
      if (filters.origin && product.origin !== filters.origin) {
        return false;
      }

      // In stock filter
      if (filters.inStock && !product.inStock) {
        return false;
      }

      // Rating filter
      if (filters.minRating !== undefined && (product.averageRating || 0) < filters.minRating) {
        return false;
      }

      // Brand filter
      if (filters.brand && product.brand !== filters.brand) {
        return false;
      }

      return true;
    });
  }

  static async getAutocompleteSuggestions(query: string, limit: number = 5): Promise<string[]> {
    if (!query || query.length < 2) return [];

    const products = getAllTransformedProducts();
    const suggestions = new Set<string>();

    const searchTerm = query.toLowerCase();

    products.forEach(product => {
      // Check product name
      if (product.name.toLowerCase().includes(searchTerm)) {
        suggestions.add(product.name);
      }

      // Check category
      if (product.category.toLowerCase().includes(searchTerm)) {
        suggestions.add(product.category);
      }

      // Check brand
      if (product.brand && product.brand.toLowerCase().includes(searchTerm)) {
        suggestions.add(product.brand);
      }

      // Check tags
      if (product.tags) {
        product.tags.forEach(tag => {
          if (tag.toLowerCase().includes(searchTerm)) {
            suggestions.add(tag);
          }
        });
      }
    });

    return Array.from(suggestions).slice(0, limit);
  }

  async getSearchSuggestions(query: string): Promise<string[]> {
    return ProductSearch.getAutocompleteSuggestions(query);
  }

  async getPopularSearches(): Promise<string[]> {
    // Return popular categories and products
    const products = getAllTransformedProducts();
    const categories = [...new Set(products.map(p => p.category))];
    const popularProducts = products
      .sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0))
      .slice(0, 5)
      .map(p => p.name);

    return [...categories, ...popularProducts];
  }
}

// Export the getSitephotoImagePath function for use in components
export { getSitephotoImagePath };