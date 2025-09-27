import React, { useState } from 'react';
import { FaLeaf, FaCheese, FaDrumstickBite, FaBreadSlice, FaAppleAlt, FaFish, FaEgg, FaCarrot, FaSearch, FaShoppingCart, FaStar, FaClock, FaMapMarkerAlt, FaShieldAlt } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import type { Product } from '../services/productService';

interface FreshProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  salePrice?: number;
  image: string;
  origin: string;
  rating: number;
  reviewCount: number;
  description: string;
  isOrganic?: boolean;
  isLocal?: boolean;
  expiryDays?: number;
}

const FreshFoods: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'produce' | 'dairy' | 'meat' | 'bakery'>('produce');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart } = useCart();

  // Convert FreshProduct to Product format for cart
  const convertFreshProductToProduct = (freshProduct: FreshProduct): Product => ({
    id: freshProduct.id,
    name: freshProduct.name,
    description: freshProduct.description,
    shortDescription: freshProduct.description,
    price: freshProduct.salePrice || freshProduct.price,
    compareAtPrice: freshProduct.price,
    currency: 'USD',
    images: [freshProduct.image],
    primaryImage: freshProduct.image,
    origin: freshProduct.origin,
    category: freshProduct.category,
    subcategory: freshProduct.category,
    weight: freshProduct.unit,
    dimensions: {
      length: 10,
      width: 10,
      height: 10,
      unit: 'cm'
    },
    sku: `FRESH-${freshProduct.id}`,
    barcode: `123456789${freshProduct.id}`,
    stock: 100,
    lowStockThreshold: 10,
    inStock: true,
    featured: false,
    isActive: true,
    nutritionInfo: undefined,
    ingredients: [],
    allergens: [],
    volumeDiscounts: [],
    variants: [],
    tags: freshProduct.isOrganic ? ['organic'] : [],
    seoTitle: freshProduct.name,
    seoDescription: freshProduct.description,
    metaKeywords: [freshProduct.name, 'fresh', 'food'],
    averageRating: freshProduct.rating,
    reviewCount: freshProduct.reviewCount,
    totalSold: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
    updatedBy: 'system'
  });

  // Handle add to cart
  const handleAddToCart = (freshProduct: FreshProduct) => {
    try {
      console.log('FreshFoods: Adding fresh product to cart:', freshProduct);
      const product = convertFreshProductToProduct(freshProduct);
      console.log('FreshFoods: Converted product:', product);
      addToCart(product);
      console.log('FreshFoods: Successfully added to cart');
    } catch (error) {
      console.error('FreshFoods: Error adding to cart:', error);
    }
  };

  // Mock fresh food products
  const products: FreshProduct[] = [
    // Produce
    {
      id: 'fresh-1',
      name: 'Organic Bananas',
      category: 'Produce',
      price: 1.99,
      unit: 'per lb',
      salePrice: 1.49,
      image: '/images/products/organic-bananas-dole.jpg',
      origin: 'Ecuador',
      rating: 4.5,
      reviewCount: 234,
      description: 'Sweet, ripe organic bananas perfect for snacking',
      isOrganic: true,
      expiryDays: 5
    },
    {
      id: 'fresh-2',
      name: 'Fresh Strawberries',
      category: 'Produce',
      price: 4.99,
      unit: 'per container',
      salePrice: 3.99,
      image: '/images/products/strawberries.jpg',
      origin: 'California',
      rating: 4.7,
      reviewCount: 456,
      description: 'Juicy, sweet strawberries picked at peak ripeness',
      isLocal: true,
      expiryDays: 3
    },
    {
      id: 'fresh-3',
      name: 'Baby Spinach',
      category: 'Produce',
      price: 2.99,
      unit: 'per bag',
      image: '/images/products/spinach.jpg',
      origin: 'Local Farm',
      rating: 4.3,
      reviewCount: 189,
      description: 'Tender baby spinach leaves, perfect for salads',
      isOrganic: true,
      isLocal: true,
      expiryDays: 4
    },
    {
      id: 'fresh-4',
      name: 'Avocados',
      category: 'Produce',
      price: 1.50,
      unit: 'each',
      image: '/images/products/avocados.webp',
      origin: 'Mexico',
      rating: 4.4,
      reviewCount: 312,
      description: 'Creamy, ripe avocados ready to eat',
      expiryDays: 2
    },

    // Dairy
    {
      id: 'fresh-5',
      name: 'Organic Whole Milk',
      category: 'Dairy',
      price: 4.99,
      unit: 'per gallon',
      image: '/images/products/milk.jpg',
      origin: 'Local Dairy',
      rating: 4.6,
      reviewCount: 567,
      description: 'Fresh organic whole milk from grass-fed cows',
      isOrganic: true,
      isLocal: true,
      expiryDays: 7
    },
    {
      id: 'fresh-6',
      name: 'Greek Yogurt',
      category: 'Dairy',
      price: 5.99,
      unit: 'per container',
      salePrice: 4.99,
      image: '/images/products/greek-yogurt.jpg',
      origin: 'Vermont',
      rating: 4.8,
      reviewCount: 423,
      description: 'Thick, creamy Greek yogurt with live cultures',
      expiryDays: 14
    },
    {
      id: 'fresh-7',
      name: 'Farm Fresh Eggs',
      category: 'Dairy',
      price: 3.99,
      unit: 'per dozen',
      image: '/images/products/eggs.jpg',
      origin: 'Local Farm',
      rating: 4.9,
      reviewCount: 678,
      description: 'Free-range eggs from happy hens',
      isLocal: true,
      expiryDays: 21
    },

    // Meat & Seafood
    {
      id: 'fresh-8',
      name: 'Grass-Fed Ground Beef',
      category: 'Meat',
      price: 8.99,
      unit: 'per lb',
      image: '/images/products/ground-beef.jpg',
      origin: 'Local Ranch',
      rating: 4.5,
      reviewCount: 345,
      description: 'Lean ground beef from grass-fed cattle',
      isLocal: true,
      expiryDays: 3
    },
    {
      id: 'fresh-9',
      name: 'Atlantic Salmon Fillet',
      category: 'Meat',
      price: 12.99,
      unit: 'per lb',
      image: '/images/products/salmon.jpg',
      origin: 'Norway',
      rating: 4.6,
      reviewCount: 189,
      description: 'Fresh Atlantic salmon, rich in omega-3',
      expiryDays: 2
    },

    // Bakery
    {
      id: 'fresh-10',
      name: 'Artisan Sourdough Bread',
      category: 'Bakery',
      price: 4.99,
      unit: 'per loaf',
      image: '/images/products/sterns-whole-grain-bread.jpg',
      origin: 'In-Store Bakery',
      rating: 4.8,
      reviewCount: 456,
      description: 'Freshly baked sourdough with crispy crust',
      isLocal: true,
      expiryDays: 3
    },
    {
      id: 'fresh-11',
      name: 'Chocolate Croissants',
      category: 'Bakery',
      price: 2.99,
      unit: 'per piece',
      image: '/images/products/croissant.jpg',
      origin: 'In-Store Bakery',
      rating: 4.7,
      reviewCount: 234,
      description: 'Buttery croissants filled with rich chocolate',
      isLocal: true,
      expiryDays: 2
    }
  ];

  const categories = {
    produce: [
      { name: 'all', label: 'All Produce', icon: FaLeaf },
      { name: 'Fruits', label: 'Fruits', icon: FaAppleAlt },
      { name: 'Vegetables', label: 'Vegetables', icon: FaCarrot },
      { name: 'Organic', label: 'Organic', icon: FaLeaf }
    ],
    dairy: [
      { name: 'all', label: 'All Dairy', icon: FaCheese },
      { name: 'Milk', label: 'Milk & Cream', icon: FaCheese },
      { name: 'Cheese', label: 'Cheese', icon: FaCheese },
      { name: 'Eggs', label: 'Eggs', icon: FaEgg }
    ],
    meat: [
      { name: 'all', label: 'All Meat & Seafood', icon: FaDrumstickBite },
      { name: 'Beef', label: 'Beef', icon: FaDrumstickBite },
      { name: 'Seafood', label: 'Seafood', icon: FaFish }
    ],
    bakery: [
      { name: 'all', label: 'All Bakery', icon: FaBreadSlice },
      { name: 'Bread', label: 'Bread', icon: FaBreadSlice },
      { name: 'Pastries', label: 'Pastries', icon: FaBreadSlice }
    ]
  };

  const getFilteredProducts = () => {
    let filtered = products.filter(product => {
      const matchesTab = product.category.toLowerCase() === activeTab.toLowerCase() || 
                        (activeTab === 'meat' && product.category === 'Meat') ||
                        (activeTab === 'produce' && product.category === 'Produce') ||
                        (activeTab === 'dairy' && product.category === 'Dairy') ||
                        (activeTab === 'bakery' && product.category === 'Bakery');
      
      const matchesCategory = selectedCategory === 'all' || 
                             product.name.toLowerCase().includes(selectedCategory.toLowerCase());
      
      const matchesSearch = searchQuery === '' || 
                           product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesTab && matchesCategory && matchesSearch;
    });
    
    return filtered;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        className={`w-3 h-3 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <FaLeaf className="text-4xl" />
              <h1 className="text-4xl md:text-5xl font-bold">Fresh Foods</h1>
              <FaAppleAlt className="text-4xl text-red-300" />
            </div>
            <p className="text-xl md:text-2xl mb-6">Farm-fresh quality, delivered daily</p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-lg">
              <div className="flex items-center space-x-2">
                <FaShieldAlt className="text-green-300" />
                <span>Quality Guaranteed</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaClock className="text-green-300" />
                <span>Daily Fresh Delivery</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaMapMarkerAlt className="text-green-300" />
                <span>Local & Organic Options</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('produce')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === 'produce'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaLeaf />
                <span>Produce</span>
              </button>
              <button
                onClick={() => setActiveTab('dairy')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === 'dairy'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaCheese />
                <span>Dairy & Eggs</span>
              </button>
              <button
                onClick={() => setActiveTab('meat')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === 'meat'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaDrumstickBite />
                <span>Meat & Seafood</span>
              </button>
              <button
                onClick={() => setActiveTab('bakery')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === 'bakery'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaBreadSlice />
                <span>Bakery</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search fresh foods..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {categories[activeTab].map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center space-x-2 ${
                  selectedCategory === category.name
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <category.icon className="text-sm" />
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {getFilteredProducts().map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <div className="aspect-w-1 aspect-h-1 bg-gray-200">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                </div>

                {/* Product Badges */}
                <div className="absolute top-2 left-2 flex flex-col space-y-1">
                  {product.salePrice && (
                    <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      SALE
                    </div>
                  )}
                  {product.isOrganic && (
                    <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                      <FaLeaf className="text-xs" />
                      <span>ORGANIC</span>
                    </div>
                  )}
                  {product.isLocal && (
                    <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      LOCAL
                    </div>
                  )}
                </div>

                {/* Expiry Info */}
                {product.expiryDays && product.expiryDays <= 3 && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                      <FaClock className="text-xs" />
                      <span>{product.expiryDays}d</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                  {product.origin}
                </p>
                <h3 className="font-medium text-gray-900 line-clamp-2 mb-2 min-h-[2.5rem]">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {product.description}
                </p>

                {/* Rating */}
                <div className="flex items-center space-x-2 mb-3">
                  <div className="flex items-center space-x-1">
                    {renderStars(product.rating)}
                  </div>
                  <span className="text-sm text-gray-500">({product.reviewCount})</span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {product.salePrice ? (
                      <>
                        <span className="text-lg font-bold text-red-600">${product.salePrice}</span>
                        <span className="text-sm text-gray-500 line-through">${product.price}</span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-gray-900">${product.price}</span>
                    )}
                    <span className="text-sm text-gray-500">{product.unit}</span>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button 
                  onClick={() => handleAddToCart(product)}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <FaShoppingCart />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {getFilteredProducts().length === 0 && (
          <div className="text-center py-12">
            <FaSearch className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FreshFoods;