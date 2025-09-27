import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiShoppingBag, FiTag, FiTruck, FiHeart, FiClock, FiMap, FiArrowRight, FiStar, FiPercent } from 'react-icons/fi';
import { FaLeaf, FaGlobeAmericas, FaGlobeAfrica, FaStar } from 'react-icons/fa';
import ProductCard from '../components/products/ProductCard';
import Button from '../components/ui/Button';
import SimpleFeaturedProducts from '../components/products/SimpleFeaturedProducts';
import { getFeaturedProducts, getCategories, getProductsByOrigin } from '../services/productService';
import type { Product, ProductCategory } from '../services/productService';

const Home: React.FC = () => {
  const { t } = useTranslation();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<'all' | 'african' | 'caribbean'>('all');
  
  // Define regions and their countries
  const regions = {
    african: ['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Ethiopia'],
    caribbean: ['Dominican Republic', 'Puerto Rico', 'Colombia', 'Costa Rica', 'Haiti', 'Jamaica', 'Spanish Virgin Islands', 'Barbados', 'Venezuela', 'Trinidad'],
    other: ['USA', 'Brazil', 'Belgium', 'Florida']
  };
  
  // Filter countries by region
  const getCountriesByRegion = (region: 'african' | 'caribbean') => {
    return regions[region];
  };
  
  // All unique countries
  const allCountries = [...regions.african, ...regions.caribbean, ...regions.other];
  
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        // Load featured products and categories in parallel
        const [productsData, categoriesData] = await Promise.all([
          getFeaturedProducts(12), // Increased number to show more variety
          getCategories()
        ]);
        
        setFeaturedProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading home page data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);
  
  // Filter featured products by selected region
  const filteredProducts = selectedRegion === 'all' 
    ? featuredProducts 
    : featuredProducts.filter(p => getCountriesByRegion(selectedRegion).includes(p.origin));
  
  // Get popular countries from the selected region or all if "all" is selected
  const displayedCountries = selectedRegion === 'all' 
    ? allCountries.slice(0, 6) // Show top 6 countries when "all" is selected
    : getCountriesByRegion(selectedRegion);
  
  return (
    <div className="pb-12">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-green-900 to-green-700 text-white">
        <div className="absolute inset-0 opacity-20 bg-[url('/images/hero-pattern.png')] bg-repeat"></div>
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t('home.hero.title', 'Affordable Grocery & Household Essentials')}
            </h1>
            <p className="text-xl mb-8 text-green-100">
              Shop over 40,000 products including everyday essentials and specialty items, delivered to your doorstep.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products">
                <Button 
                  variant="primary" 
                  size="lg"
                  className="bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold"
                >
                  {t('home.hero.shopNow', 'Shop Now')} <FiShoppingBag className="ml-2" />
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-green-900">
                  {t('home.hero.createAccount', 'Create Account')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
        

      </section>
      
      {/* Spacer for overlapping showcase */}
      <div className="h-32"></div>

      {/* Categories Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{t('home.categories.title', 'Shop by Category')}</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
              Discover our wide range of authentic products from around the world
            </p>
            <Link to="/products" className="inline-flex items-center text-green-600 hover:text-green-700 font-semibold text-lg group">
              {t('home.categories.viewAll', 'View All Categories')} 
              <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map(category => (
              <Link 
                key={category.id} 
                to={`/products?category=${category.id}`}
                className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-green-200"
              >
                <div className="p-8">
                   <div className="flex items-center justify-between mb-6">
                     <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                       {category.image ? (
                         <img 
                           src={category.image} 
                           alt={category.name}
                           className="w-full h-full object-cover rounded-2xl"
                         />
                       ) : (
                         <FiShoppingBag className="w-8 h-8 text-green-600" />
                       )}
                     </div>
                     <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                       <FiArrowRight className="w-6 h-6 text-green-600" />
                     </div>
                   </div>
                  
                  <h3 className="font-bold text-xl text-gray-800 mb-2 group-hover:text-green-700 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {category.description}
                  </p>
                </div>
                
                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </Link>
            ))}
          </div>
          
          {/* Additional category highlights */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTruck className="w-6 h-6 text-yellow-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Fast Delivery</h4>
              <p className="text-gray-600 text-sm">Quick shipping on all category items</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiStar className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Quality Guaranteed</h4>
              <p className="text-gray-600 text-sm">Premium products in every category</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiPercent className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Best Prices</h4>
              <p className="text-gray-600 text-sm">Competitive pricing across all categories</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Products */}
      <SimpleFeaturedProducts />
      
      {/* ZAPP Points */}
      <section className="py-12 bg-yellow-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0 md:pr-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">{t('home.points.title', 'ZAPP Points Rewards')}</h2>
              <p className="text-gray-600 mb-6">
                {t('home.points.description', 'Earn points with every purchase and redeem them for discounts on future orders. The more you shop, the more you save!')}
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                    <FiTag className="text-green-600" />
                  </span>
                  <span>{t('home.points.benefit1', 'Earn 1 point for every $1 spent')}</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                    <FiTag className="text-green-600" />
                  </span>
                  <span>{t('home.points.benefit2', 'Redeem 100 points for $1 off your purchase')}</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                    <FiTag className="text-green-600" />
                  </span>
                  <span>{t('home.points.benefit3', 'Points never expire as long as your account is active')}</span>
                </li>
              </ul>
              <Link to="/signup">
                <Button variant="primary" className="bg-green-600 hover:bg-green-700">
                  {t('home.points.joinNow', 'Join ZAPP Rewards')}
                </Button>
              </Link>
            </div>
            <div className="md:w-1/2">
              <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{t('home.points.cardTitle', 'ZAPP Points Card')}</h3>
                    <p className="text-gray-500">{t('home.points.cardSubtitle', 'Your path to savings')}</p>
                  </div>
                  <div className="bg-green-600 text-white h-12 w-12 rounded-full flex items-center justify-center">
                    <span className="font-bold">ZAPP</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">{t('home.points.spend', 'Spend')}</div>
                    <div className="text-2xl font-bold text-gray-800">$100</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">{t('home.points.earn', 'Earn')}</div>
                    <div className="text-2xl font-bold text-green-600">100 {t('home.points.points', 'Points')}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">{t('home.points.redeem', 'Redeem')}</div>
                    <div className="text-2xl font-bold text-gray-800">100 {t('home.points.points', 'Points')} = $1</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Affiliate Program Teaser */}
      <section className="py-12 bg-gradient-to-r from-green-800 to-green-600 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('home.affiliate.title', 'Become an Affiliate Partner')}</h2>
            <p className="text-lg mb-8 text-green-100">
              {t('home.affiliate.description', 'Share your love for authentic African and Caribbean groceries and earn money with our affiliate program.')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-center">
              <div className="bg-white bg-opacity-10 p-6 rounded-lg">
                <div className="text-yellow-300 text-4xl font-bold mb-2">5%</div>
                <div className="text-green-100">{t('home.affiliate.commission', 'Commission on first orders')}</div>
              </div>
              <div className="bg-white bg-opacity-10 p-6 rounded-lg">
                <div className="text-yellow-300 text-4xl font-bold mb-2">30</div>
                <div className="text-green-100">{t('home.affiliate.days', 'Day cookie duration')}</div>
              </div>
              <div className="bg-white bg-opacity-10 p-6 rounded-lg">
                <div className="text-yellow-300 text-4xl font-bold mb-2">$50</div>
                <div className="text-green-100">{t('home.affiliate.minimum', 'Minimum payout')}</div>
              </div>
            </div>
            <Link to="/affiliate">
              <Button 
                variant="primary" 
                size="lg"
                className="bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold"
              >
                {t('home.affiliate.joinNow', 'Join Affiliate Program')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;