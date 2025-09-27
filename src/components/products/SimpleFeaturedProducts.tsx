import React, { useState, useEffect } from 'react';
import { getFeaturedProducts, type Product } from '../../services/productService';

const SimpleFeaturedProducts: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        setLoading(true);
        // Use the productService which handles the import correctly
        const products = await getFeaturedProducts(6);
        setFeaturedProducts(products);
      } catch (err) {
        console.error('Error loading featured products:', err);
        setError('Failed to load featured products');
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedProducts();
  }, []);

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
          Featured Products
        </h2>
        
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading featured products...</p>
          </div>
        )}
        
        {error && (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        {!loading && !error && featuredProducts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">No featured products available.</p>
          </div>
        )}
        
        {!loading && !error && featuredProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {featuredProducts.map((product) => {
              // Use the direct image path from the data file, just like working pages
              const imagePath = product.image || '/images/product-placeholder.svg';
              
              return (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square">
                    <img
                      src={imagePath}
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
                      ${product.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default SimpleFeaturedProducts;