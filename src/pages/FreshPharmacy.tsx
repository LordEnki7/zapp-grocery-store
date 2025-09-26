import React, { useState } from 'react';
import { FaPills, FaHeartbeat, FaBaby, FaEye, FaShieldAlt, FaSearch, FaShoppingCart, FaStar, FaClock, FaMapMarkerAlt, FaUserMd, FaStethoscope, FaPhone, FaBandAid, FaLeaf, FaThermometerHalf, FaWeight, FaCalendarAlt, FaRunning } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import type { Product as CartProduct } from '../services/productService';
import { Link } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  salePrice?: number;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
  description: string;
  isOTC?: boolean;
  isPrescription?: boolean;
  isNatural?: boolean;
}

interface Service {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType;
  price?: string;
  duration?: string;
  available: boolean;
}

const FreshPharmacy: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'services' | 'prescriptions' | 'wellness'>('products');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart } = useCart();

  // Convert Product to CartProduct format for cart
  const convertProductToCartProduct = (product: Product): CartProduct => ({
    id: product.id,
    name: product.name,
    description: product.description,
    shortDescription: product.description,
    price: product.salePrice || product.price,
    compareAtPrice: product.price,
    currency: 'USD',
    images: [product.image],
    primaryImage: product.image,
    origin: 'USA',
    category: product.category,
    subcategory: product.category,
    weight: '1 unit',
    dimensions: {
      length: 10,
      width: 10,
      height: 10,
      unit: 'cm'
    },
    sku: `PHARM-${product.id}`,
    barcode: `123456789${product.id}`,
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
    tags: product.isNatural ? ['natural'] : [],
    seoTitle: product.name,
    seoDescription: product.description,
    metaKeywords: [product.name, product.brand],
    averageRating: product.rating,
    reviewCount: product.reviewCount,
    totalSold: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
    updatedBy: 'system'
  });

  // Handle add to cart
  const handleAddToCart = (product: Product) => {
    const cartProduct = convertProductToCartProduct(product);
    addToCart(cartProduct);
  };

  // Mock pharmacy products
  const products: Product[] = [
    {
      id: 'pharm-1',
      name: 'Ibuprofen 200mg - 100 Tablets',
      brand: 'HealthPlus',
      price: 8.99,
      salePrice: 6.99,
      image: '/images/products/ibuprofen.jpg',
      category: 'Pain Relief',
      rating: 4.5,
      reviewCount: 234,
      description: 'Fast-acting pain relief for headaches, muscle aches, and fever',
      isOTC: true
    },
    {
      id: 'pharm-2',
      name: 'Vitamin D3 2000 IU - 90 Softgels',
      brand: 'Nature\'s Best',
      price: 15.99,
      salePrice: 12.99,
      image: '/images/products/vitamin-d3.jpg',
      category: 'Vitamins',
      rating: 4.7,
      reviewCount: 456,
      description: 'Supports bone health and immune system function',
      isNatural: true
    },
    {
      id: 'pharm-3',
      name: 'Digital Thermometer',
      brand: 'MedTech',
      price: 12.99,
      image: '/images/products/thermometer.jpg',
      category: 'Medical Devices',
      rating: 4.3,
      reviewCount: 189,
      description: 'Fast and accurate temperature readings in 10 seconds'
    },
    {
      id: 'pharm-4',
      name: 'Allergy Relief 24HR - 30 Tablets',
      brand: 'AllerFree',
      price: 18.99,
      salePrice: 14.99,
      image: '/images/products/allergy-relief.jpg',
      category: 'Allergy',
      rating: 4.4,
      reviewCount: 312,
      description: '24-hour non-drowsy allergy relief for seasonal allergies',
      isOTC: true
    },
    {
      id: 'pharm-5',
      name: 'Omega-3 Fish Oil - 120 Softgels',
      brand: 'Ocean\'s Best',
      price: 24.99,
      salePrice: 19.99,
      image: '/images/products/omega-3.jpg',
      category: 'Vitamins',
      rating: 4.6,
      reviewCount: 567,
      description: 'Supports heart and brain health with pure fish oil',
      isNatural: true
    },
    {
      id: 'pharm-6',
      name: 'Blood Pressure Monitor',
      brand: 'HealthTrack',
      price: 49.99,
      salePrice: 39.99,
      image: '/images/products/blood-pressure-monitor.jpg',
      category: 'Medical Devices',
      rating: 4.2,
      reviewCount: 145,
      description: 'Automatic digital blood pressure monitor with memory'
    },
    {
      id: 'pharm-7',
      name: 'Probiotic Complex - 60 Capsules',
      brand: 'GutHealth',
      price: 29.99,
      image: '/images/products/probiotic.jpg',
      category: 'Digestive Health',
      rating: 4.5,
      reviewCount: 289,
      description: 'Advanced probiotic formula for digestive health',
      isNatural: true
    },
    {
      id: 'pharm-8',
      name: 'First Aid Kit - Complete',
      brand: 'SafeCare',
      price: 34.99,
      image: '/images/products/first-aid-kit.jpg',
      category: 'First Aid',
      rating: 4.6,
      reviewCount: 156,
      description: 'Comprehensive first aid kit for home and travel'
    }
  ];

  // Pharmacy services
  const services: Service[] = [
    {
      id: 'service-1',
      name: 'Prescription Refills',
      description: 'Quick and easy prescription refills with automatic reminders',
      icon: FaPills,
      available: true
    },
    {
      id: 'service-2',
      name: 'Flu Shots & Vaccinations',
      description: 'Walk-in flu shots and travel vaccinations by certified pharmacists',
      icon: FaUserMd,
      price: '$25-$75',
      duration: '15 min',
      available: true
    },
    {
      id: 'service-3',
      name: 'Health Screenings',
      description: 'Blood pressure, cholesterol, and diabetes screenings',
      icon: FaHeartbeat,
      price: '$15-$30',
      duration: '10-20 min',
      available: true
    },
    {
      id: 'service-4',
      name: 'Medication Therapy Management',
      description: 'Comprehensive medication review and consultation',
      icon: FaStethoscope,
      price: 'Free with insurance',
      duration: '30-45 min',
      available: true
    },
    {
      id: 'service-5',
      name: 'Prescription Delivery',
      description: 'Free same-day delivery for prescriptions over $35',
      icon: FaMapMarkerAlt,
      price: 'Free',
      available: true
    },
    {
      id: 'service-6',
      name: '24/7 Pharmacist Consultation',
      description: 'Speak with a licensed pharmacist anytime via phone or chat',
      icon: FaPhone,
      available: true
    }
  ];

  const categories = [
    { name: 'all', label: 'All Products', icon: FaPills },
    { name: 'Pain Relief', label: 'Pain Relief', icon: FaBandAid },
    { name: 'Vitamins', label: 'Vitamins & Supplements', icon: FaLeaf },
    { name: 'Allergy', label: 'Allergy Relief', icon: FaEye },
    { name: 'Medical Devices', label: 'Medical Devices', icon: FaThermometerHalf },
    { name: 'Digestive Health', label: 'Digestive Health', icon: FaWeight },
    { name: 'First Aid', label: 'First Aid', icon: FaBandAid }
  ];

  const getFilteredProducts = () => {
    let filtered = products;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

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
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <FaPills className="text-4xl" />
              <h1 className="text-4xl md:text-5xl font-bold">Fresh Pharmacy</h1>
              <FaHeartbeat className="text-4xl text-red-300" />
            </div>
            <p className="text-xl md:text-2xl mb-6">Your health and wellness destination</p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-lg">
              <div className="flex items-center space-x-2">
                <FaShieldAlt className="text-green-300" />
                <span>Licensed Pharmacists</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaClock className="text-green-300" />
                <span>Open 7 Days</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaMapMarkerAlt className="text-green-300" />
                <span>Free Delivery</span>
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
                onClick={() => setActiveTab('products')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === 'products'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaPills />
                <span>Products</span>
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === 'services'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaUserMd />
                <span>Services</span>
              </button>
              <button
                onClick={() => setActiveTab('prescriptions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === 'prescriptions'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaCalendarAlt />
                <span>Prescriptions</span>
              </button>
              <button
                onClick={() => setActiveTab('wellness')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === 'wellness'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaHeartbeat />
                <span>Wellness</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-2 mt-4">
                {categories.map((category) => (
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
                      {product.isOTC && (
                        <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          OTC
                        </div>
                      )}
                      {product.isNatural && (
                        <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                          <FaLeaf className="text-xs" />
                          <span>NATURAL</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                      {product.brand}
                    </p>
                    <h3 className="font-medium text-gray-900 line-clamp-2 mb-2 min-h-[2.5rem]">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex items-center gap-1 mb-3">
                      <div className="flex items-center">
                        {renderStars(product.rating)}
                      </div>
                      <span className="text-xs text-gray-600">({product.reviewCount})</span>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-lg font-bold text-green-600">
                          ${product.salePrice || product.price}
                        </span>
                        {product.salePrice && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ${product.price}
                          </span>
                        )}
                      </div>
                    </div>

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
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <div key={service.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="p-3 bg-green-100 rounded-full">
                      <service.icon className="text-2xl text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                      {service.available ? (
                        <span className="text-sm text-green-600 font-medium">Available Now</span>
                      ) : (
                        <span className="text-sm text-red-600 font-medium">Coming Soon</span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  
                  {(service.price || service.duration) && (
                    <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                      {service.price && <span>Price: {service.price}</span>}
                      {service.duration && <span>Duration: {service.duration}</span>}
                    </div>
                  )}
                  
                  <button 
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                      service.available
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!service.available}
                  >
                    {service.available ? 'Book Now' : 'Coming Soon'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prescriptions Tab */}
        {activeTab === 'prescriptions' && (
          <div className="space-y-8">
            {/* Prescription Management */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Prescription Management</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center p-6 border border-gray-200 rounded-lg hover:border-green-500 transition-colors cursor-pointer">
                  <FaPills className="text-4xl text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Refill Prescription</h3>
                  <p className="text-gray-600 mb-4">Quick and easy prescription refills</p>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                    Start Refill
                  </button>
                </div>
                
                <div className="text-center p-6 border border-gray-200 rounded-lg hover:border-green-500 transition-colors cursor-pointer">
                  <FaCalendarAlt className="text-4xl text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Transfer Prescription</h3>
                  <p className="text-gray-600 mb-4">Transfer from another pharmacy</p>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Transfer Now
                  </button>
                </div>
                
                <div className="text-center p-6 border border-gray-200 rounded-lg hover:border-green-500 transition-colors cursor-pointer">
                  <FaUserMd className="text-4xl text-purple-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">New Prescription</h3>
                  <p className="text-gray-600 mb-4">Submit a new prescription</p>
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                    Submit
                  </button>
                </div>
              </div>
            </div>

            {/* Prescription History */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Prescriptions</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <FaPills className="text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Lisinopril 10mg</h4>
                      <p className="text-sm text-gray-600">30 tablets • Refills: 2 remaining</p>
                      <p className="text-xs text-gray-500">Last filled: Dec 15, 2023</p>
                    </div>
                  </div>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                    Refill
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <FaPills className="text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Metformin 500mg</h4>
                      <p className="text-sm text-gray-600">90 tablets • Refills: 1 remaining</p>
                      <p className="text-xs text-gray-500">Last filled: Dec 10, 2023</p>
                    </div>
                  </div>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                    Refill
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wellness Tab */}
        {activeTab === 'wellness' && (
          <div className="space-y-8">
            {/* Wellness Categories */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Link to="/pharmacy/wellness/fitness" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center hover:shadow-lg transition-shadow">
                <FaRunning className="text-4xl text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900">Fitness</h3>
                <p className="text-sm text-gray-600 mt-1">Exercise & Activity</p>
              </Link>
              
              <Link to="/pharmacy/wellness/nutrition" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center hover:shadow-lg transition-shadow">
                <FaLeaf className="text-4xl text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900">Nutrition</h3>
                <p className="text-sm text-gray-600 mt-1">Diet & Supplements</p>
              </Link>
              
              <Link to="/pharmacy/wellness/mental-health" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center hover:shadow-lg transition-shadow">
                <FaHeartbeat className="text-4xl text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900">Mental Health</h3>
                <p className="text-sm text-gray-600 mt-1">Stress & Wellness</p>
              </Link>
              
              <Link to="/pharmacy/wellness/preventive" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center hover:shadow-lg transition-shadow">
                <FaShieldAlt className="text-4xl text-red-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900">Preventive Care</h3>
                <p className="text-sm text-gray-600 mt-1">Health Screenings</p>
              </Link>
            </div>

            {/* Health Tips */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Health Tips & Articles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <article className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-gray-900 mb-2">Winter Wellness: Staying Healthy</h4>
                  <p className="text-sm text-gray-600 mb-3">Essential tips for maintaining your health during the winter months...</p>
                  <Link to="/pharmacy/articles/winter-wellness" className="text-green-600 hover:text-green-700 text-sm font-medium">
                    Read More →
                  </Link>
                </article>
                
                <article className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-gray-900 mb-2">Understanding Your Medications</h4>
                  <p className="text-sm text-gray-600 mb-3">A guide to medication safety and proper usage...</p>
                  <Link to="/pharmacy/articles/medication-safety" className="text-green-600 hover:text-green-700 text-sm font-medium">
                    Read More →
                  </Link>
                </article>
                
                <article className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-gray-900 mb-2">Heart Health Essentials</h4>
                  <p className="text-sm text-gray-600 mb-3">Simple steps to maintain a healthy heart and cardiovascular system...</p>
                  <Link to="/pharmacy/articles/heart-health" className="text-green-600 hover:text-green-700 text-sm font-medium">
                    Read More →
                  </Link>
                </article>
              </div>
            </div>
          </div>
        )}

        {/* Contact Information */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg p-8 mt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <FaPhone className="text-3xl mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Call Us</h3>
              <p>(555) 123-PHARMACY</p>
              <p className="text-sm opacity-90">24/7 Pharmacist Support</p>
            </div>
            
            <div className="text-center">
              <FaClock className="text-3xl mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Store Hours</h3>
              <p>Mon-Fri: 8AM-10PM</p>
              <p>Sat-Sun: 9AM-9PM</p>
            </div>
            
            <div className="text-center">
              <FaMapMarkerAlt className="text-3xl mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Location</h3>
              <p>123 Health Street</p>
              <p>Miami, FL 33101</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreshPharmacy;