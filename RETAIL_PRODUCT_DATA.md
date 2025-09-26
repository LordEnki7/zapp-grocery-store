# ZAPP Retail Product Data

This document describes the product data structure used in the ZAPP e-commerce platform and how to work with it.

## Product Data Files

The product data is stored in the following locations:

1. **Source Excel Files**:
   - Original XLSX files are stored in `data/products/`
   - These include the original retail item files from AMMAUSA

2. **Generated JSON Data**:
   - Generated JSON files in `data/products/`
   - Used by the application during development
   - Can be uploaded to Firebase Firestore for production

## Product Data Structure

Each product in the ZAPP system has the following structure:

```json
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
```

## Working with Product Data

### Local Development

During local development, the application uses the JSON files in `data/products/`. These files are generated using the mock data generation script.

1. **Generate Mock Data**:
   ```
   npm run generate-product-data
   ```

2. **Access Products in Code**:
   Use the `productService.ts` to access products:
   ```typescript
   import { getAllProducts, getProductsByCategory } from '../services/productService';
   
   // Get all products
   const products = await getAllProducts();
   
   // Get products by category
   const groceryProducts = await getProductsByCategory('grocery');
   ```

### Production Deployment

For production, the product data should be uploaded to Firebase Firestore.

1. **Set Up Firebase**:
   Create a `.env.local` file with your Firebase credentials:
   ```
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

2. **Upload Products to Firebase**:
   ```
   npm run upload-products
   ```

3. **Switch to Firestore in Code**:
   Update the product service to use Firestore:
   ```typescript
   // In productService.ts
   export async function getAllProducts(): Promise<Product[]> {
     // Comment out the local development implementation
     // const response = await fetch('/data/products/products.json');
     // const products = await response.json();
     
     // Use the Firestore implementation
     return getAllProductsFromFirestore();
   }
   ```

## Adding Real Product Data

To replace the mock data with real product data:

1. **Prepare Excel File**:
   - Use the existing Excel files as templates
   - Ensure all required fields are present
   - Save in the `data/products/` directory

2. **Update Data Generation Script**:
   - Modify `scripts/generate-product-data.js` to parse your Excel files
   - Use a library like `xlsx` or `exceljs` to read Excel data

3. **Generate JSON Files**:
   ```
   npm run generate-product-data
   ```

4. **Upload to Firebase**:
   ```
   npm run upload-products
   ```

## Product Images

Product images should be stored in the `public/images/products/` directory during development and in Firebase Storage for production.

The naming convention for product images is:
- `{category}-{index}.jpg` (e.g., `grocery-1.jpg`, `frozen-5.jpg`)

## Updating Product Data

To update product data:

1. **Update Source Files**:
   - Make changes to the Excel files or directly edit the JSON files

2. **Regenerate Data**:
   ```
   npm run generate-product-data
   ```

3. **Upload Updated Data**:
   ```
   npm run upload-products
   ```

## Data Backup

Product data is automatically backed up when using the backup scripts:

```
npm run backup product-data-update
```

This creates a ZIP archive that includes the product data files. 