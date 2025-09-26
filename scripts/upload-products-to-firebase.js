/**
 * ZAPP Product Upload Script
 * 
 * This script uploads product data to Firebase Firestore.
 * 
 * Usage:
 *   node scripts/upload-products-to-firebase.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import { getStorage, ref, uploadBytes } from 'firebase/storage';

// Get the directory name using ES modules pattern
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Firebase configuration from .env.local
// Note: For this script to work, you need to create a .env.local file with your Firebase credentials
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Main function
async function main() {
  console.log('🔍 Uploading product data to Firebase...');
  
  // Check if .env.local file exists and Firebase config is valid
  if (!process.env.VITE_FIREBASE_API_KEY) {
    console.error('❌ Firebase configuration not found. Please create a .env.local file with your Firebase credentials.');
    console.log('Example .env.local file:');
    console.log(`
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
    `);
    process.exit(1);
  }
  
  const dataDir = path.join(__dirname, '..', 'data', 'products');
  
  // Upload product categories
  try {
    console.log('📝 Uploading product categories...');
    
    const categoriesFile = path.join(dataDir, 'categories.json');
    const categories = JSON.parse(fs.readFileSync(categoriesFile, 'utf8'));
    
    // Use a batch for better performance
    const batch = writeBatch(db);
    
    for (const category of categories) {
      const docRef = doc(db, 'categories', category.id);
      batch.set(docRef, category);
    }
    
    await batch.commit();
    console.log(`✅ Uploaded ${categories.length} categories to Firestore`);
  } catch (error) {
    console.error('❌ Error uploading categories:', error);
  }
  
  // Upload products (using batches of 500 max as per Firestore limits)
  try {
    console.log('📝 Uploading products...');
    
    const productsFile = path.join(dataDir, 'products.json');
    const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
    
    // Split products into batches of 500
    const batchSize = 500;
    const batches = [];
    
    for (let i = 0; i < products.length; i += batchSize) {
      batches.push(products.slice(i, i + batchSize));
    }
    
    console.log(`📦 Uploading ${products.length} products in ${batches.length} batches...`);
    
    let totalUploaded = 0;
    
    for (let i = 0; i < batches.length; i++) {
      const batch = writeBatch(db);
      const batchProducts = batches[i];
      
      for (const product of batchProducts) {
        const docRef = doc(db, 'products', product.id);
        batch.set(docRef, product);
      }
      
      await batch.commit();
      totalUploaded += batchProducts.length;
      console.log(`✅ Batch ${i + 1}/${batches.length} uploaded (${totalUploaded}/${products.length} products)`);
    }
    
    console.log(`✅ Uploaded ${totalUploaded} products to Firestore`);
  } catch (error) {
    console.error('❌ Error uploading products:', error);
  }
  
  console.log('\n🎉 Product data upload complete!');
  console.log('\nNext steps:');
  console.log('1. Upload product images to Firebase Storage');
  console.log('2. Update the product service to fetch data from Firestore');
  console.log('3. Test the product listing and detail pages');
}

// Run the main function
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
}); 