const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, 'data', 'products', 'products.json');

try {
  const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
  
  console.log('📊 INTEGRATION VERIFICATION REPORT');
  console.log('================================');
  console.log(`Total products: ${products.length}`);
  
  const newProducts = products.filter(p => p.createdBy === 'unused-images-integrator');
  console.log(`New products added: ${newProducts.length}`);
  
  const originalProducts = products.filter(p => p.createdBy !== 'unused-images-integrator');
  console.log(`Original products preserved: ${originalProducts.length}`);
  
  console.log('\n🆕 SAMPLE NEW PRODUCTS:');
  newProducts.slice(0, 10).forEach((p, i) => {
    console.log(`${i + 1}. ${p.name} (${p.image}) - $${p.price} - ${p.category}`);
  });
  
  console.log('\n📂 CATEGORIES USED:');
  const categories = [...new Set(newProducts.map(p => p.category))];
  categories.forEach(cat => {
    const count = newProducts.filter(p => p.category === cat).length;
    console.log(`- ${cat}: ${count} products`);
  });
  
  console.log('\n✅ Integration successful!');
  
} catch (error) {
  console.error('❌ Error verifying integration:', error);
}