/**
 * ZAPP Product Data Generator
 * 
 * This script generates product data in JSON format for the ZAPP e-commerce platform.
 * NOTE: This is a mock implementation as we can't directly parse Excel files.
 * In a real implementation, you would use a library like xlsx or exceljs.
 * 
 * Usage:
 *   node scripts/generate-product-data.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name using ES modules pattern
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock data for product categories
const PRODUCT_CATEGORIES = [
  { id: 'grocery', name: 'Grocery', description: 'Non-perishable food items' },
  { id: 'frozen', name: 'Frozen', description: 'Frozen food products' },
  { id: 'beverages', name: 'Beverages', description: 'Drinks and beverages' },
  { id: 'snacks', name: 'Snacks', description: 'Chips, cookies, and other snack items' },
  { id: 'household', name: 'Household', description: 'Non-food household items' },
  { id: 'personal-care', name: 'Personal Care', description: 'Health and beauty products' }
];

// Mock data for product origins
const PRODUCT_ORIGINS = [
  'Jamaica', 'Trinidad', 'Barbados', 'Guyana', 'Nigeria', 'Ghana', 'Kenya', 'South Africa', 
  'Haiti', 'Dominican Republic', 'Puerto Rico', 'Cuba', 'Panama', 'Colombia'
];

// Mock function to simulate Excel parsing for frozen products
function mockParseFrozenProducts() {
  console.log('Simulating parsing of frozen products Excel file...');
  
  // This would be replaced with actual Excel parsing in a real implementation
  const products = [];
  
  // Generate 50 mock frozen products
  for (let i = 1; i <= 50; i++) {
    const origin = PRODUCT_ORIGINS[Math.floor(Math.random() * PRODUCT_ORIGINS.length)];
    const price = (Math.random() * 15 + 5).toFixed(2);
    const weight = (Math.random() * 24 + 8).toFixed(1);
    
    products.push({
      id: `FRZ-${i.toString().padStart(3, '0')}`,
      name: `${origin} Frozen ${getRandomFrozenItem()}`,
      description: `Authentic ${origin} frozen food. Ready to cook and enjoy.`,
      price: parseFloat(price),
      currency: 'USD',
      weight: parseFloat(weight),
      weightUnit: 'oz',
      category: 'frozen',
      origin: origin,
      image: `frozen-${(i % 10) + 1}.jpg`,
      stock: Math.floor(Math.random() * 100) + 10,
      featured: Math.random() > 0.8,
      nutrition: {
        calories: Math.floor(Math.random() * 400) + 100,
        protein: Math.floor(Math.random() * 20) + 5,
        carbs: Math.floor(Math.random() * 30) + 10,
        fat: Math.floor(Math.random() * 15) + 2
      }
    });
  }
  
  return products;
}

// Mock function to simulate Excel parsing for grocery products
function mockParseGroceryProducts() {
  console.log('Simulating parsing of grocery products Excel file...');
  
  // This would be replaced with actual Excel parsing in a real implementation
  const products = [];
  
  // Generate 100 mock grocery products
  for (let i = 1; i <= 100; i++) {
    const origin = PRODUCT_ORIGINS[Math.floor(Math.random() * PRODUCT_ORIGINS.length)];
    const price = (Math.random() * 10 + 2).toFixed(2);
    const weight = (Math.random() * 32 + 6).toFixed(1);
    const category = getRandomGroceryCategory();
    
    products.push({
      id: `GRO-${i.toString().padStart(3, '0')}`,
      name: `${origin} ${getRandomGroceryItem(category)}`,
      description: `Authentic ${origin} ${category.toLowerCase()} product. Imported directly for the best quality and taste.`,
      price: parseFloat(price),
      currency: 'USD',
      weight: parseFloat(weight),
      weightUnit: 'oz',
      category: category.toLowerCase(),
      origin: origin,
      image: `${category.toLowerCase()}-${(i % 15) + 1}.jpg`,
      stock: Math.floor(Math.random() * 200) + 20,
      featured: Math.random() > 0.85,
      nutrition: category !== 'Household' && category !== 'Personal Care' ? {
        calories: Math.floor(Math.random() * 300) + 50,
        protein: Math.floor(Math.random() * 10) + 1,
        carbs: Math.floor(Math.random() * 50) + 5,
        fat: Math.floor(Math.random() * 10) + 1
      } : null
    });
  }
  
  return products;
}

// Helper functions to generate random product names
function getRandomFrozenItem() {
  const items = [
    'Plantains', 'Fish', 'Oxtail', 'Goat Meat', 'Ackee', 'Callaloo', 'Breadfruit', 
    'Cassava', 'Sweet Potato', 'Yam', 'Meat Patties', 'Mixed Vegetables', 'Dumplings',
    'Curry Mix', 'Jerk Chicken', 'Beef Patties', 'Saltfish', 'Okra', 'Cow Foot', 
    'Pig Tail', 'Red Peas', 'Escovitch Fish'
  ];
  return items[Math.floor(Math.random() * items.length)];
}

function getRandomGroceryCategory() {
  const categories = [
    'Beverages', 'Snacks', 'Grocery', 'Household', 'Personal Care'
  ];
  return categories[Math.floor(Math.random() * categories.length)];
}

function getRandomGroceryItem(category) {
  let items;
  
  switch(category) {
    case 'Beverages':
      items = [
        'Ginger Beer', 'Sorrel Drink', 'Mauby', 'Coconut Water', 'Fruit Punch',
        'Irish Moss Drink', 'Peanut Punch', 'Mango Juice', 'Guava Juice', 'Passion Fruit Juice'
      ];
      break;
    case 'Snacks':
      items = [
        'Plantain Chips', 'Cassava Chips', 'Coconut Cookies', 'Tamarind Balls',
        'Ginger Cookies', 'Peanut Brittle', 'Banana Chips', 'Spiced Nuts',
        'Baked Cassava', 'Sweet Potato Chips'
      ];
      break;
    case 'Grocery':
      items = [
        'Rice', 'Beans', 'Coconut Milk', 'Jerk Seasoning', 'Curry Powder',
        'All-Purpose Seasoning', 'Hot Sauce', 'Canned Ackee', 'Canned Callaloo',
        'Canned Pigeon Peas', 'Cornmeal', 'Ground Provisions Mix', 'Soup Mix'
      ];
      break;
    case 'Household':
      items = [
        'Natural Cleaning Solution', 'Coconut Oil Soap', 'Lemongrass Candle',
        'Handwoven Basket', 'Kitchen Towels', 'Spice Rack', 'Mortar and Pestle',
        'Cooking Utensils', 'Serving Bowls', 'Table Placemats'
      ];
      break;
    case 'Personal Care':
      items = [
        'Coconut Oil', 'Shea Butter', 'Aloe Vera Gel', 'Black Soap',
        'Cocoa Butter Lotion', 'Lemongrass Oil', 'Hair Food', 'Natural Deodorant',
        'Body Scrub', 'Handmade Soap'
      ];
      break;
    default:
      items = ['Generic Item'];
  }
  
  return items[Math.floor(Math.random() * items.length)];
}

// Main function
async function main() {
  console.log('🔍 Generating product data for ZAPP e-commerce platform...');
  
  const dataDir = path.join(__dirname, '..', 'data', 'products');
  
  // Generate mock products
  const frozenProducts = mockParseFrozenProducts();
  const groceryProducts = mockParseGroceryProducts();
  
  // Combine all products
  const allProducts = [...frozenProducts, ...groceryProducts];
  
  // Write product categories to JSON file
  const categoriesFile = path.join(dataDir, 'categories.json');
  fs.writeFileSync(categoriesFile, JSON.stringify(PRODUCT_CATEGORIES, null, 2));
  console.log(`✅ Generated categories data: ${categoriesFile}`);
  
  // Write all products to JSON file
  const productsFile = path.join(dataDir, 'products.json');
  fs.writeFileSync(productsFile, JSON.stringify(allProducts, null, 2));
  console.log(`✅ Generated ${allProducts.length} products: ${productsFile}`);
  
  // Write featured products to JSON file
  const featuredProducts = allProducts.filter(p => p.featured);
  const featuredFile = path.join(dataDir, 'featured-products.json');
  fs.writeFileSync(featuredFile, JSON.stringify(featuredProducts, null, 2));
  console.log(`✅ Generated ${featuredProducts.length} featured products: ${featuredFile}`);
  
  // Generate product files by category
  const productsByCategory = {};
  
  allProducts.forEach(product => {
    if (!productsByCategory[product.category]) {
      productsByCategory[product.category] = [];
    }
    productsByCategory[product.category].push(product);
  });
  
  for (const [category, products] of Object.entries(productsByCategory)) {
    const categoryFile = path.join(dataDir, `products-${category}.json`);
    fs.writeFileSync(categoryFile, JSON.stringify(products, null, 2));
    console.log(`✅ Generated ${products.length} ${category} products: ${categoryFile}`);
  }
  
  // Generate file with instructions
  const readmeFile = path.join(dataDir, 'README.md');
  const readmeContent = `# ZAPP Product Data

This directory contains product data for the ZAPP e-commerce platform.

## Files

- \`products.json\`: Complete product database with all products
- \`categories.json\`: Product categories
- \`featured-products.json\`: Featured products for homepage
- \`products-{category}.json\`: Products filtered by category

## Data Structure

Each product has the following structure:

\`\`\`json
{
  "id": "GRO-001",
  "name": "Jamaica Rice",
  "description": "Authentic Jamaican rice product.",
  "price": 4.99,
  "currency": "USD",
  "weight": 16,
  "weightUnit": "oz",
  "category": "grocery",
  "origin": "Jamaica",
  "image": "grocery-1.jpg",
  "stock": 100,
  "featured": true,
  "nutrition": {
    "calories": 150,
    "protein": 3,
    "carbs": 30,
    "fat": 0
  }
}
\`\`\`

## Usage

To regenerate this data from the Excel files, run:

\`\`\`
npm run generate-product-data
\`\`\`

Note: In the current implementation, this generates mock data since direct Excel parsing is not implemented.
`;

  fs.writeFileSync(readmeFile, readmeContent);
  console.log(`✅ Generated README: ${readmeFile}`);
  
  console.log('\n🎉 Product data generation complete!');
  console.log('\nNext steps:');
  console.log('1. Place actual product images in the public/images/products directory');
  console.log('2. Update the Firebase data import script to upload products to Firestore');
  console.log('3. Implement product filtering and search functionality in the UI');
}

// Run the main function
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
}); 