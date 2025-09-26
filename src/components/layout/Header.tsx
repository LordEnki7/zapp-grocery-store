import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaShoppingCart, 
  FaUser, 
  FaBars, 
  FaGlobe, 
  FaSearch, 
  FaHeart,
  FaMapMarkerAlt,
  FaChevronDown,
  FaTimes,
  FaBox,
  FaUtensils,
  FaHome,
  FaBaby,
  FaTshirt,
  FaLaptop,
  FaSignOutAlt,
  FaCog,
  FaBuilding,
  FaChartLine,
  FaFileInvoiceDollar,
  FaUsers,
  FaToggleOn,
  FaToggleOff
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { AuthModal } from '../auth/AuthModal';

interface SearchSuggestion {
  id: string;
  title: string;
  category: string;
  image?: string;
}

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  
  // Add timeout refs for better dropdown control
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get cart data from context
  const { itemCount, totals } = useCart();
  
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { currentUser, userProfile, logout, switchAccountType } = useAuth();
  
  // Use actual user data instead of mock
  const user = currentUser && userProfile ? {
    ...currentUser,
    firstName: userProfile.firstName,
    lastName: userProfile.lastName,
    accountType: userProfile.accountType,
    businessProfile: userProfile.businessProfile
  } : null;

  // Check if user is in business account mode
  const isBusinessAccount = userProfile?.accountType === 'business';

  // Use the actual authenticated user
  const effectiveUser = user;
  const effectiveIsBusinessAccount = isBusinessAccount;

  // Mock search suggestions - in real app, this would be an API call
  const mockSuggestions: SearchSuggestion[] = [
    { id: '1', title: 'Organic Bananas', category: 'Fresh Produce' },
    { id: '2', title: 'Whole Milk', category: 'Dairy' },
    { id: '3', title: 'Bread Loaf', category: 'Bakery' },
    { id: '4', title: 'Chicken Breast', category: 'Meat & Seafood' },
    { id: '5', title: 'Rice 5lb', category: 'Pantry' }
  ];

  const categories = [
    { name: 'beverages', displayName: 'Beverages', icon: FaUtensils, subcategories: ['Juices', 'Drinks', 'Refreshments'] },
    { name: 'frozen', displayName: 'Frozen Foods', icon: FaBox, subcategories: ['Frozen Meals', 'Frozen Products'] },
    { name: 'fresh', displayName: 'Fresh Produce', icon: FaUtensils, subcategories: ['Fruits', 'Vegetables', 'Fresh Items'] },
    { name: 'dairy', displayName: 'Dairy & Milk', icon: FaHome, subcategories: ['Milk', 'Cheese', 'Yogurt', 'Dairy Products'] },
    { name: 'snacks', displayName: 'Snacks & Cookies', icon: FaBox, subcategories: ['Cookies', 'Chips', 'Snack Foods'] },
    { name: 'candy', displayName: 'Candy & Sweets', icon: FaBox, subcategories: ['Chocolates', 'Candies', 'Sweet Treats'] },
    { name: 'cheese-snacks', displayName: 'Cheese & Savory Snacks', icon: FaBox, subcategories: ['Cheese Products', 'Savory Snacks'] },
    { name: 'grocery', displayName: 'Grocery Essentials', icon: FaBox, subcategories: ['Pantry Items', 'Essential Groceries'] },
    { name: 'household', displayName: 'Household Items', icon: FaHome, subcategories: ['Cleaning Supplies', 'Home Care'] },
    { name: 'personal care', displayName: 'Personal Care', icon: FaBaby, subcategories: ['Health & Beauty', 'Personal Hygiene'] },
    { name: 'produce', displayName: 'Fresh Produce', icon: FaUtensils, subcategories: ['Fresh Fruits', 'Fresh Vegetables'] },
    { name: 'sodas', displayName: 'Sodas & Soft Drinks', icon: FaUtensils, subcategories: ['Carbonated Drinks', 'Soft Drinks'] }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      // Clean up timeout on unmount
      if (megaMenuTimeoutRef.current) {
        clearTimeout(megaMenuTimeoutRef.current);
      }
    };
  }, []);

  // Improved dropdown handlers with delays
  const handleMegaMenuEnter = () => {
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current);
    }
    setIsMegaMenuOpen(true);
  };

  const handleMegaMenuLeave = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setIsMegaMenuOpen(false);
    }, 300); // 300ms delay before closing
  };

  // Close dropdown when category is clicked
  const handleCategoryClick = () => {
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current);
    }
    setIsMegaMenuOpen(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 0) {
      const filtered = mockSuggestions.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );
      setSearchSuggestions(filtered);
    } else {
      setSearchSuggestions([]);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchFocused(false);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const openAuthModal = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
    setIsUserMenuOpen(false);
  };

  const toggleAccountType = async () => {
    if (switchAccountType && user) {
      const newAccountType = effectiveIsBusinessAccount ? 'consumer' : 'business';
      await switchAccountType(newAccountType);
    }
  };

  return (
    <>
      {/* Top Bar */}
      <div className="bg-gray-800 text-white text-sm py-2 hidden lg:block">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <span className="flex items-center">
              <FaMapMarkerAlt className="mr-1" />
              Deliver to: Miami, FL 33101
            </span>
            <span>Free shipping on orders $35+</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/help" className="hover:text-gray-300">Customer Service</Link>
            <Link to="/stores" className="hover:text-gray-300">Store Locator</Link>
            <button className="flex items-center hover:text-gray-300">
              <FaGlobe className="mr-1" />
              English
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          {/* Top Row */}
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-bold text-2xl">
                ZAPP
              </div>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8 relative" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="relative">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products, brands, and more..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    className="w-full px-4 py-3 pl-12 pr-16 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-700 text-lg"
                  />
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Search Suggestions */}
              {isSearchFocused && (searchSuggestions.length > 0 || searchQuery.length === 0) && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl mt-1 z-50">
                  {searchQuery.length === 0 ? (
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-700 mb-3">Popular Searches</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {mockSuggestions.slice(0, 6).map((item) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              setSearchQuery(item.title);
                              handleSearchSubmit({ preventDefault: () => {} } as React.FormEvent);
                            }}
                            className="text-left p-2 hover:bg-gray-50 rounded text-sm text-gray-600"
                          >
                            {item.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto">
                      {searchSuggestions.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setSearchQuery(item.title);
                            handleSearchSubmit({ preventDefault: () => {} } as React.FormEvent);
                          }}
                          className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center">
                            <FaSearch className="text-gray-400 mr-3" />
                            <div>
                              <div className="font-medium text-gray-800">{item.title}</div>
                              <div className="text-sm text-gray-500">{item.category}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-6">
              {/* Account Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <FaUser className="text-lg" />
                  <div className="hidden lg:block text-left">
                    <div className="text-xs text-gray-500">
                      {effectiveUser ? `Hello, ${effectiveUser.firstName || effectiveUser.displayName || effectiveUser.email}` : 'Hello, Sign in'}
                    </div>
                    <div className="font-semibold flex items-center">
                      {effectiveIsBusinessAccount ? 'Business Account' : 'Account & Lists'}
                      <FaChevronDown className="ml-1 text-xs" />
                    </div>
                  </div>
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                    {!effectiveUser ? (
                      <div className="p-4 border-b border-gray-200">
                        <button
                          onClick={() => openAuthModal('login')}
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center block mb-2"
                        >
                          Sign In
                        </button>
                        <p className="text-sm text-gray-600 text-center">
                          New customer? 
                          <button 
                            onClick={() => openAuthModal('register')}
                            className="text-blue-600 hover:underline ml-1"
                          >
                            Start here
                          </button>
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {effectiveUser.firstName ? effectiveUser.firstName.charAt(0).toUpperCase() : effectiveUser.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">
                              {effectiveUser.firstName && effectiveUser.lastName ? `${effectiveUser.firstName} ${effectiveUser.lastName}` : effectiveUser.email}
                            </div>
                            <div className="text-sm text-gray-600">{effectiveUser.email}</div>
                            {effectiveUser.accountType === 'business' && (
                              <div className="text-xs text-blue-600 font-medium">Business Account</div>
                            )}
                          </div>
                        </div>
                        
                        {/* Account Type Toggle */}
                        {user && user.accountType === 'business' && (
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-3">
                            <div className="flex items-center space-x-2">
                              <FaBuilding className="text-blue-600" />
                              <span className="text-sm font-medium">Business Mode</span>
                            </div>
                            <button
                              onClick={toggleAccountType}
                              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                            >
                              {effectiveIsBusinessAccount ? <FaToggleOn className="text-lg" /> : <FaToggleOff className="text-lg" />}
                              <span className="text-xs">{effectiveIsBusinessAccount ? 'ON' : 'OFF'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="p-2">
                      {user ? (
                        <>
                          <Link
                            to="/account"
                            className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <FaUser className="text-gray-500" />
                            <span>Your Account</span>
                          </Link>
                          
                          {/* Business Account Features */}
                          {effectiveIsBusinessAccount && effectiveUser && effectiveUser.accountType === 'business' && (
                            <>
                              <Link
                                to="/business/analytics"
                                className="flex items-center space-x-3 px-3 py-2 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <FaChartLine className="text-blue-500" />
                                <span>Business Analytics</span>
                              </Link>
                              <Link
                                to="/business/orders"
                                className="flex items-center space-x-3 px-3 py-2 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <FaFileInvoiceDollar className="text-blue-500" />
                                <span>Business Orders</span>
                              </Link>
                              <Link
                                to="/business/team"
                                className="flex items-center space-x-3 px-3 py-2 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <FaUsers className="text-blue-500" />
                                <span>Team Management</span>
                              </Link>
                              <hr className="my-2" />
                            </>
                          )}
                          
                          <Link
                            to="/orders"
                            className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <FaBox className="text-gray-500" />
                            <span>{effectiveIsBusinessAccount ? 'Personal Orders' : 'Your Orders'}</span>
                          </Link>
                          <Link
                            to="/wishlist"
                            className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <FaHeart className="text-gray-500" />
                            <span>Your Wishlist</span>
                          </Link>
                          <Link
                            to="/account/settings"
                            className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <FaCog className="text-gray-500" />
                            <span>Settings</span>
                          </Link>
                          <hr className="my-2" />
                          <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full text-left"
                          >
                            <FaSignOutAlt className="text-red-500" />
                            <span>Sign Out</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/help"
                            className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <span>Customer Service</span>
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Wishlist */}
              <Link to="/wishlist" className="flex items-center text-gray-700 hover:text-red-500 transition-colors">
                <FaHeart className="text-lg" />
                <div className="hidden lg:block ml-2">
                  <div className="text-xs text-gray-500">Returns</div>
                  <div className="font-semibold">& Orders</div>
                </div>
              </Link>

              {/* Cart */}
              <Link to="/cart" className="flex items-center text-gray-700 hover:text-blue-600 transition-colors relative">
                <div className="relative">
                  <FaShoppingCart className="text-2xl" />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {itemCount}
                    </span>
                  )}
                </div>
                <div className="hidden lg:block ml-2">
                  <div className="text-xs text-gray-500">Cart</div>
                  <div className="font-semibold">${totals.total.toFixed(2)}</div>
                </div>
              </Link>

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden text-gray-700"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <FaBars className="text-xl" />
              </button>
            </div>
          </div>

          {/* Navigation Bar */}
          <div className="hidden lg:flex items-center justify-between py-3 border-t border-gray-200">
            <div className="flex items-center space-x-8">
              {/* Categories Mega Menu */}
              <div className="relative">
                <button
                  onMouseEnter={handleMegaMenuEnter}
                  onMouseLeave={handleMegaMenuLeave}
                  onClick={handleMegaMenuEnter}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 font-semibold transition-colors"
                >
                  <FaBars />
                  <span>All Departments</span>
                  <FaChevronDown className="text-xs" />
                </button>

                {/* Mega Menu */}
                {isMegaMenuOpen && (
                  <div
                    className="absolute top-full left-0 mt-1 w-screen max-w-6xl bg-white border border-gray-200 rounded-lg shadow-2xl z-50"
                    onMouseEnter={handleMegaMenuEnter}
                    onMouseLeave={handleMegaMenuLeave}
                  >
                    <div className="grid grid-cols-4 gap-6 p-6">
                      {categories.map((category) => (
                        <div key={category.name} className="space-y-3">
                          <Link
                            to={`/products?category=${encodeURIComponent(category.name)}`}
                            onClick={handleCategoryClick}
                            className="flex items-center space-x-3 font-semibold text-gray-800 hover:text-blue-600 transition-colors"
                          >
                            <category.icon className="text-blue-600" />
                            <span>{category.displayName}</span>
                          </Link>
                          <ul className="space-y-2 ml-6">
                            {category.subcategories.map((sub) => (
                              <li key={sub}>
                                <Link
                                  to={`/products?category=${encodeURIComponent(category.name)}&subcategory=${encodeURIComponent(sub)}`}
                                  onClick={handleCategoryClick}
                                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                                >
                                  {sub}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Links */}
              <Link to="/deals" className="text-gray-700 hover:text-red-600 font-semibold transition-colors">
                Today's Deals
              </Link>
              <Link to="/fresh" className="text-gray-700 hover:text-green-600 font-semibold transition-colors">
                Fresh
              </Link>
              <Link to="/pharmacy" className="text-gray-700 hover:text-blue-600 font-semibold transition-colors">
                Pharmacy
              </Link>
              <Link to="/gift-cards" className="text-gray-700 hover:text-purple-600 font-semibold transition-colors">
                Gift Cards
              </Link>
            </div>

            <div className="flex items-center space-x-4 text-sm">
              <span className="text-gray-600">Deliver to Miami 33101</span>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200">
            <div className="p-4 space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>

              {/* Mobile Navigation */}
              <nav className="space-y-3">
                <Link to="/" className="block py-2 text-gray-700 hover:text-blue-600 font-medium">
                  Home
                </Link>
                <Link to="/products" className="block py-2 text-gray-700 hover:text-blue-600 font-medium flex items-center space-x-2">
                  <FaBars className="text-sm" />
                  <span>All Departments</span>
                </Link>
                <Link to="/deals" className="block py-2 text-gray-700 hover:text-blue-600 font-medium">
                  Today's Deals
                </Link>
                <Link to="/fresh" className="block py-2 text-gray-700 hover:text-green-600 font-medium">
                  Fresh
                </Link>
                <Link to="/pharmacy" className="block py-2 text-gray-700 hover:text-blue-600 font-medium">
                  Pharmacy
                </Link>
                <Link to="/gift-cards" className="block py-2 text-gray-700 hover:text-purple-600 font-medium">
                  Gift Cards
                </Link>
                <Link to="/account" className="block py-2 text-gray-700 hover:text-blue-600 font-medium">
                  Your Account
                </Link>
                <Link to="/orders" className="block py-2 text-gray-700 hover:text-blue-600 font-medium">
                  Your Orders
                </Link>
                <Link to="/help" className="block py-2 text-gray-700 hover:text-blue-600 font-medium">
                  Customer Service
                </Link>
              </nav>

              {/* Mobile Categories */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-gray-800 mb-3">Shop by Category</h3>
                <div className="grid grid-cols-2 gap-2">
                  {categories.slice(0, 6).map((category) => (
                    <Link
                      key={category.name}
                      to={`/products?category=${encodeURIComponent(category.name)}`}
                      className="flex items-center space-x-2 p-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded"
                    >
                      <category.icon />
                      <span>{category.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </>
  );
}

export default Header;