import React from 'react';
// Embed featured products data directly to avoid import issues on Vercel
const featuredProductsData = [
  {
    id: 'FRU-001',
    name: 'Fresh Plantains',
    price: 2.99,
    image: '/sitephoto/featured Products/Fresh Plantains.jpg',
    category: 'Fresh Fruits'
  },
  {
    id: 'SPI-001', 
    name: 'Scotch Bonnet Peppers',
    price: 4.99,
    image: '/sitephoto/featured Products/Scotch Bonnet Peppers.jpeg',
    category: 'Spices & Seasonings'
  },
  {
    id: 'GRA-001',
    name: 'Rice & Peas Mix',
    price: 3.49,
    image: '/sitephoto/featured Products/Rice & Peas Mix.jpg',
    category: 'Grains & Rice'
  },
  {
    id: 'BEV-001',
    name: 'Sorrel Drink',
    price: 5.99,
    image: '/sitephoto/featured Products/Sorrel Drink.webp',
    category: 'Beverages'
  },
  {
    id: 'SNK-001',
    name: 'Plantain Chips',
    price: 3.99,
    image: '/sitephoto/featured Products/Plantain Chips.jpg',
    category: 'Snacks'
  },
  {
    id: 'CON-001',
    name: 'Curry Powder',
    price: 6.49,
    image: '/sitephoto/featured Products/Curry Powder.webp',
    category: 'Condiments'
  }
];

const SimpleFeaturedProducts: React.FC = () => {
  // Use the image paths directly from the data without additional processing
  const featuredProducts = featuredProductsData;

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
          Featured Products
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {featuredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/product-placeholder.svg';
                  }}
                />
              </div>
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  {product.name}
                </h3>
                <p className="text-lg font-bold text-green-600">
                  {product.price}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SimpleFeaturedProducts;