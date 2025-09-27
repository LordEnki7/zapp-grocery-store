import React, { useState, useEffect } from 'react';
import { FaClock, FaFire, FaTag, FaShoppingCart, FaHeart, FaStar, FaArrowRight, FaPercent, FaBolt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import type { Product } from '../services/productService';

interface Deal {
  id: string;
  name: string;
  brand: string;
  originalPrice: number;
  salePrice: number;
  discount: number;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
  timeLeft?: string;
  isFlashSale?: boolean;
  isFeatured?: boolean;
  stockLeft?: number;
  description: string;
}

const TodaysDeals: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'flash' | 'featured' | 'categories'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [timeLeft, setTimeLeft] = useState<{ [key: string]: string }>({});
  const { addToCart } = useCart();

  // Debug: Log when component mounts
  useEffect(() => {
    console.log('TodaysDeals component mounted');
  }, []);

  // Mock deals data
  const deals: Deal[] = [
    {
      id: 'deal-1',
      name: 'Organic Bananas - 3 lbs',
      brand: 'Dole',
      originalPrice: 4.99,
      salePrice: 2.99,
      discount: 40,
      image: '/images/products/organic-bananas-dole.jpg',
      category: 'Fresh Produce',
      rating: 4.5,
      reviewCount: 234,
      timeLeft: '2h 15m',
      isFlashSale: true,
      stockLeft: 23,
      description: 'Premium organic bananas, perfect for smoothies and snacking'
    },
    {
      id: 'deal-2',
      name: 'Premium Ground Coffee - 12oz',
      brand: 'Coffee Brand Coffee',
      originalPrice: 12.99,
      salePrice: 7.99,
      discount: 38,
      image: '/images/products/premium-ground-coffee.jpg',
      category: 'Beverages',
      rating: 4.8,
      reviewCount: 567,
      isFeatured: true,
      description: 'Rich, full-bodied coffee with notes of chocolate and caramel'
    },
    {
      id: 'deal-3',
      name: 'Whole Grain Bread - 2 Pack',
      brand: 'Stern\'s',
      originalPrice: 6.98,
      salePrice: 4.49,
      discount: 36,
      image: '/images/products/sterns-whole-grain-bread.jpg',
      category: 'Bakery',
      rating: 4.3,
      reviewCount: 189,
      description: 'Freshly baked whole grain bread, perfect for sandwiches'
    },
    {
      id: 'deal-4',
      name: 'Fresh Eggs - Dozen',
      brand: 'Farm Fresh',
      originalPrice: 5.99,
      salePrice: 3.99,
      discount: 33,
      image: '/images/products/eggs-real.jpg',
      category: 'Dairy',
      rating: 4.6,
      reviewCount: 445,
      timeLeft: '5h 42m',
      isFlashSale: true,
      stockLeft: 67,
      description: 'Farm fresh eggs from free-range chickens'
    },
    {
      id: 'deal-5',
      name: 'Fresh Shrimp - 1 lb',
      brand: 'Ocean Fresh',
      originalPrice: 18.99,
      salePrice: 12.99,
      discount: 32,
      image: '/images/products/shrimp-real.jpg',
      category: 'Meat & Seafood',
      rating: 4.7,
      reviewCount: 123,
      isFeatured: true,
      description: 'Fresh premium shrimp, perfect for cooking and grilling'
    },
    {
      id: 'deal-6',
      name: 'Premium Pasta - 4 Pack',
      brand: 'Bella Italia',
      originalPrice: 8.99,
      salePrice: 5.99,
      discount: 33,
      image: '/images/products/pasta-real.jpg',
      category: 'Pantry',
      rating: 4.4,
      reviewCount: 298,
      description: 'Premium organic pasta made from durum wheat'
    },
    {
      id: 'deal-7',
      name: 'Mixed Berry Smoothie Pack',
      brand: 'Frozen Fresh',
      originalPrice: 7.99,
      salePrice: 4.99,
      discount: 38,
      image: '/images/products/berries.jpg',
      category: 'Frozen',
      rating: 4.5,
      reviewCount: 156,
      timeLeft: '1h 33m',
      isFlashSale: true,
      stockLeft: 15,
      description: 'Frozen mixed berries perfect for smoothies and desserts'
    },
    {
      id: 'deal-8',
      name: 'Artisan Cheese Selection',
      brand: 'Gourmet Choice',
      originalPrice: 15.99,
      salePrice: 9.99,
      discount: 38,
      image: '/images/products/cheese.jpg',
      category: 'Dairy',
      rating: 4.8,
      reviewCount: 89,
      isFeatured: true,
      description: 'Curated selection of premium artisan cheeses'
    }
  ];

  const categories = [
    { name: 'all', label: 'All Deals', count: deals.length },
    { name: 'Fresh Produce', label: 'Fresh Produce', count: deals.filter(d => d.category === 'Fresh Produce').length },
    { name: 'Beverages', label: 'Beverages', count: deals.filter(d => d.category === 'Beverages').length },
    { name: 'Dairy', label: 'Dairy', count: deals.filter(d => d.category === 'Dairy').length },
    { name: 'Meat & Seafood', label: 'Meat & Seafood', count: deals.filter(d => d.category === 'Meat & Seafood').length },
    { name: 'Pantry', label: 'Pantry', count: deals.filter(d => d.category === 'Pantry').length },
    { name: 'Frozen', label: 'Frozen', count: deals.filter(d => d.category === 'Frozen').length }
  ];

  // Convert Deal to Product format for cart
  const convertDealToProduct = (deal: Deal): Product => {
    return {
      id: deal.id,
      name: deal.name,
      description: deal.description,
      shortDescription: deal.description,
      price: deal.salePrice,
      compareAtPrice: deal.originalPrice,
      currency: 'USD',
      images: [deal.image],
      primaryImage: deal.image,
      origin: 'USA',
      category: deal.category,
      subcategory: deal.category,
      weight: '1 unit',
      dimensions: {
        length: 10,
        width: 10,
        height: 10,
        unit: 'cm'
      },
      sku: `DEAL-${deal.id}`,
      barcode: `123456789${deal.id}`,
      stock: deal.stockLeft || 100,
      lowStockThreshold: 10,
      inStock: true,
      featured: deal.isFeatured || false,
      isActive: true,
      nutritionInfo: undefined,
      ingredients: [],
      allergens: [],
      volumeDiscounts: [],
      variants: [],
      tags: ['deal', 'sale'],
      seoTitle: deal.name,
      seoDescription: deal.description,
      metaKeywords: [deal.name, deal.brand],
      averageRating: deal.rating,
      reviewCount: deal.reviewCount,
      totalSold: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system',
      updatedBy: 'system'
    };
  };

  // Handle add to cart
  const handleAddToCart = (deal: Deal) => {
    try {
      console.log('TodaysDeals: Adding deal to cart:', deal);
      const product = convertDealToProduct(deal);
      console.log('TodaysDeals: Converted product:', product);
      addToCart(product, 1);
      console.log('TodaysDeals: Successfully added to cart');
    } catch (error) {
      console.error('TodaysDeals: Error adding to cart:', error);
    }
  };
  const getFilteredDeals = () => {
    let filtered = deals;

    switch (activeTab) {
      case 'flash':
        filtered = deals.filter(deal => deal.isFlashSale);
        break;
      case 'featured':
        filtered = deals.filter(deal => deal.isFeatured);
        break;
      case 'categories':
        if (selectedCategory !== 'all') {
          filtered = deals.filter(deal => deal.category === selectedCategory);
        }
        break;
      default:
        break;
    }

    return filtered;
  };

  // Mock countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeLeft: { [key: string]: string } = {};
      deals.forEach(deal => {
        if (deal.timeLeft) {
          // Mock countdown logic - in real app, this would be calculated from actual end time
          const randomHours = Math.floor(Math.random() * 12) + 1;
          const randomMinutes = Math.floor(Math.random() * 60);
          newTimeLeft[deal.id] = `${randomHours}h ${randomMinutes}m`;
        }
      });
      setTimeLeft(newTimeLeft);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

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
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <FaFire className="text-3xl text-yellow-300 animate-pulse" />
              <h1 className="text-4xl md:text-5xl font-bold animate-pulse">Today's Deals</h1>
              <FaFire className="text-3xl text-yellow-300 animate-pulse" />
            </div>
            <p className="text-xl md:text-2xl mb-6">Incredible savings on your favorite products</p>
            <div className="flex items-center justify-center space-x-4 text-lg">
              <div className="flex items-center space-x-2">
                <FaPercent className="text-yellow-300" />
                <span>Up to 50% Off</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaBolt className="text-yellow-300" />
                <span>Limited Time</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaClock className="text-yellow-300" />
                <span>Ends Soon</span>
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
                onClick={() => setActiveTab('all')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'all'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Deals ({deals.length})
              </button>
              <button
                onClick={() => setActiveTab('flash')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === 'flash'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaBolt />
                <span>Flash Sales ({deals.filter(d => d.isFlashSale).length})</span>
              </button>
              <button
                onClick={() => setActiveTab('featured')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === 'featured'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaStar />
                <span>Featured ({deals.filter(d => d.isFeatured).length})</span>
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'categories'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Categories
              </button>
            </nav>
          </div>

          {/* Category Filter (shown when Categories tab is active) */}
          {activeTab === 'categories' && (
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category.name
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.label} ({category.count})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Flash Sale Banner (shown when flash sales are active) */}
        {activeTab === 'flash' && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <FaBolt className="text-3xl" />
                <div>
                  <h2 className="text-2xl font-bold">Flash Sale Alert!</h2>
                  <p className="text-lg">Limited time offers - grab them before they're gone!</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Hurry! Sale ends in:</p>
                <p className="text-2xl font-bold">2h 15m</p>
              </div>
            </div>
          </div>
        )}



        {/* Deals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {getFilteredDeals().map((deal) => (
            <div key={deal.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              {/* Deal Badge */}
              <div className="relative">
                <div className="bg-gray-200 h-48 flex items-center justify-center">
                  {/* Debug: Show the exact path being used */}
                  <div className="absolute top-0 left-0 bg-black text-white text-xs p-1 z-10">
                    {deal.image}
                  </div>
                  <img
                    src={deal.image}
                    alt={deal.name}
                    className="w-full h-48 object-cover"
                    onLoad={() => console.log(`Image loaded successfully: ${deal.image}`)}
                    onError={(e) => {
                      console.error(`Image failed to load: ${deal.image}`);
                      console.error('Error details:', e);
                    }}
                  />
                </div>
                
                {/* Discount Badge */}
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  {deal.discount}% OFF
                </div>

                {/* Flash Sale Badge */}
                {deal.isFlashSale && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                    <FaBolt className="text-xs" />
                    <span>FLASH</span>
                  </div>
                )}

                {/* Featured Badge */}
                {deal.isFeatured && !deal.isFlashSale && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                    <FaStar className="text-xs" />
                    <span>FEATURED</span>
                  </div>
                )}

                {/* Wishlist Button */}
                <button className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors">
                  <FaHeart className="text-gray-400 hover:text-red-500" />
                </button>
              </div>

              {/* Product Info */}
              <div className="p-4">
                {/* Brand */}
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                  {deal.brand}
                </p>

                {/* Product Name */}
                <h3 className="font-medium text-gray-900 line-clamp-2 mb-2 min-h-[2.5rem]">
                  {deal.name}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {deal.description}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                  <div className="flex items-center">
                    {renderStars(deal.rating)}
                  </div>
                  <span className="text-xs text-gray-600">({deal.reviewCount})</span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-lg font-bold text-red-600">${deal.salePrice}</span>
                    <span className="text-sm text-gray-500 line-through ml-2">${deal.originalPrice}</span>
                  </div>
                  <span className="text-sm font-medium text-green-600">
                    Save ${(deal.originalPrice - deal.salePrice).toFixed(2)}
                  </span>
                </div>

                {/* Timer and Stock (for flash sales) */}
                {deal.isFlashSale && (
                  <div className="mb-3">
                    {deal.timeLeft && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-1 text-red-600">
                          <FaClock />
                          <span>Ends in: {timeLeft[deal.id] || deal.timeLeft}</span>
                        </div>
                        {deal.stockLeft && (
                          <span className="text-orange-600 font-medium">
                            Only {deal.stockLeft} left!
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Add to Cart Button */}
                <button 
                  onClick={() => handleAddToCart(deal)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <FaShoppingCart />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {getFilteredDeals().length === 0 && (
          <div className="text-center py-12">
            <FaTag className="mx-auto text-4xl text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No deals found</h3>
            <p className="text-gray-500">Try selecting a different category or check back later for new deals.</p>
          </div>
        )}

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8 mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Don't Miss Out on Tomorrow's Deals!</h2>
          <p className="text-lg mb-6">Sign up for deal alerts and be the first to know about our best offers.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <input
              type="email"
              placeholder="Enter your email address"
              className="px-4 py-2 rounded-lg text-gray-900 w-full sm:w-auto min-w-[300px]"
            />
            <button className="bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors flex items-center space-x-2">
              <span>Subscribe</span>
              <FaArrowRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodaysDeals;