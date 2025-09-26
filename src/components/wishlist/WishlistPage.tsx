import React, { useState, useEffect } from 'react';
import {
  FiHeart,
  FiGrid,
  FiList,
  FiFilter,
  FiSearch,
  FiX,
  FiShoppingCart,
  FiTrash2,
  FiShare2,
  FiDownload,
  FiStar,
  FiCalendar,
  FiDollarSign
} from 'react-icons/fi';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import ProductCard from '../products/ProductCard';
import Button from '../ui/Button';
import type { Product } from '../../services/productService';

interface WishlistFilters {
  category: string;
  priceRange: [number, number];
  availability: 'all' | 'in-stock' | 'out-of-stock';
  dateAdded: 'all' | 'today' | 'week' | 'month';
  sortBy: 'date-added' | 'name' | 'price' | 'rating';
  sortOrder: 'asc' | 'desc';
}

const WishlistPage: React.FC = () => {
  const { user } = useAuth();
  const { wishlistItems, removeFromWishlist, clearWishlist, getWishlistStats } = useWishlist();
  const { addToCart } = useCart();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [filters, setFilters] = useState<WishlistFilters>({
    category: 'all',
    priceRange: [0, 1000],
    availability: 'all',
    dateAdded: 'all',
    sortBy: 'date-added',
    sortOrder: 'desc'
  });

  const stats = getWishlistStats();

  // Filter and sort wishlist items
  const filteredItems = React.useMemo(() => {
    let items = [...wishlistItems];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item =>
        item.product.name.toLowerCase().includes(query) ||
        item.product.description?.toLowerCase().includes(query) ||
        item.product.category.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (filters.category !== 'all') {
      items = items.filter(item => item.product.category === filters.category);
    }

    // Apply price range filter
    items = items.filter(item =>
      item.product.price >= filters.priceRange[0] &&
      item.product.price <= filters.priceRange[1]
    );

    // Apply availability filter
    if (filters.availability !== 'all') {
      items = items.filter(item => {
        if (filters.availability === 'in-stock') return item.product.inStock;
        if (filters.availability === 'out-of-stock') return !item.product.inStock;
        return true;
      });
    }

    // Apply date filter
    if (filters.dateAdded !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.dateAdded) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }

      items = items.filter(item => new Date(item.addedAt) >= filterDate);
    }

    // Apply sorting
    items.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'name':
          comparison = a.product.name.localeCompare(b.product.name);
          break;
        case 'price':
          comparison = a.product.price - b.product.price;
          break;
        case 'rating':
          comparison = (a.product.averageRating || 0) - (b.product.averageRating || 0);
          break;
        case 'date-added':
        default:
          comparison = new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
          break;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return items;
  }, [wishlistItems, searchQuery, filters]);

  const categories = React.useMemo(() => {
    const cats = new Set(wishlistItems.map(item => item.product.category));
    return Array.from(cats);
  }, [wishlistItems]);

  const handleSelectItem = (productId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedItems(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
      setShowBulkActions(false);
    } else {
      const allIds = new Set(filteredItems.map(item => item.product.id));
      setSelectedItems(allIds);
      setShowBulkActions(true);
    }
  };

  const handleBulkAddToCart = async () => {
    setIsLoading(true);
    try {
      for (const productId of selectedItems) {
        const item = wishlistItems.find(item => item.product.id === productId);
        if (item && item.product.inStock) {
          await addToCart(item.product, 1);
        }
      }
      setSelectedItems(new Set());
      setShowBulkActions(false);
    } catch (error) {
      console.error('Error adding items to cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkRemove = async () => {
    setIsLoading(true);
    try {
      for (const productId of selectedItems) {
        await removeFromWishlist(productId);
      }
      setSelectedItems(new Set());
      setShowBulkActions(false);
    } catch (error) {
      console.error('Error removing items from wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareWishlist = () => {
    const url = `${window.location.origin}/wishlist/shared/${user?.uid}`;
    navigator.clipboard.writeText(url);
    alert('Wishlist link copied to clipboard!');
  };

  const handleExportWishlist = () => {
    const data = filteredItems.map(item => ({
      name: item.product.name,
      price: item.product.price,
      category: item.product.category,
      dateAdded: new Date(item.addedAt).toLocaleDateString()
    }));

    const csv = [
      'Name,Price,Category,Date Added',
      ...data.map(row => `"${row.name}",${row.price},"${row.category}","${row.dateAdded}"`)
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wishlist.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiHeart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Sign in to view your wishlist</h2>
          <p className="text-gray-600 mb-6">Save your favorite products and access them anywhere</p>
          <Button variant="primary" onClick={() => window.location.href = '/login'}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FiHeart className="w-8 h-8 text-red-500 mr-3" />
                My Wishlist
              </h1>
              <p className="text-gray-600 mt-1">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>

            {wishlistItems.length > 0 && (
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={handleShareWishlist}
                  leftIcon={<FiShare2 />}
                  size="sm"
                >
                  Share
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExportWishlist}
                  leftIcon={<FiDownload />}
                  size="sm"
                >
                  Export
                </Button>
                <Button
                  variant="outline"
                  onClick={() => clearWishlist()}
                  leftIcon={<FiTrash2 />}
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  Clear All
                </Button>
              </div>
            )}
          </div>

          {/* Stats */}
          {wishlistItems.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <FiHeart className="w-5 h-5 text-red-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Total Items</p>
                    <p className="text-lg font-semibold">{stats.totalItems}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <FiDollarSign className="w-5 h-5 text-green-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Total Value</p>
                    <p className="text-lg font-semibold">${stats.totalValue.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <FiStar className="w-5 h-5 text-yellow-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Avg Rating</p>
                    <p className="text-lg font-semibold">{stats.averageRating.toFixed(1)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <FiCalendar className="w-5 h-5 text-blue-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">In Stock</p>
                    <p className="text-lg font-semibold">{stats.inStockItems}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <FiHeart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8">Start adding products you love to keep track of them</p>
            <Button variant="primary" onClick={() => window.location.href = '/products'}>
              Browse Products
            </Button>
          </div>
        ) : (
          <>
            {/* Controls */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search wishlist..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Controls */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    {selectedItems.size === filteredItems.length ? 'Deselect All' : 'Select All'}
                  </button>

                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-2 rounded-lg transition-colors ${
                      showFilters ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <FiFilter className="w-5 h-5" />
                  </button>

                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'grid' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600'
                      }`}
                    >
                      <FiGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'list' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600'
                      }`}
                    >
                      <FiList className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={filters.category}
                        onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="all">All Categories</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                      <select
                        value={filters.availability}
                        onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="all">All Items</option>
                        <option value="in-stock">In Stock</option>
                        <option value="out-of-stock">Out of Stock</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date Added</label>
                      <select
                        value={filters.dateAdded}
                        onChange={(e) => setFilters(prev => ({ ...prev, dateAdded: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                      <select
                        value={`${filters.sortBy}-${filters.sortOrder}`}
                        onChange={(e) => {
                          const [sortBy, sortOrder] = e.target.value.split('-');
                          setFilters(prev => ({ ...prev, sortBy: sortBy as any, sortOrder: sortOrder as any }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="date-added-desc">Newest First</option>
                        <option value="date-added-asc">Oldest First</option>
                        <option value="name-asc">Name A-Z</option>
                        <option value="name-desc">Name Z-A</option>
                        <option value="price-asc">Price Low-High</option>
                        <option value="price-desc">Price High-Low</option>
                        <option value="rating-desc">Highest Rated</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bulk Actions */}
            {showBulkActions && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-green-800 font-medium">
                    {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
                  </span>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      onClick={handleBulkAddToCart}
                      leftIcon={<FiShoppingCart />}
                      size="sm"
                      disabled={isLoading}
                    >
                      Add to Cart
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleBulkRemove}
                      leftIcon={<FiTrash2 />}
                      size="sm"
                      disabled={isLoading}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                    <button
                      onClick={() => {
                        setSelectedItems(new Set());
                        setShowBulkActions(false);
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Products Grid/List */}
            {filteredItems.length === 0 ? (
              <div className="text-center py-16">
                <FiSearch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
              }>
                {filteredItems.map((item) => (
                  <div key={item.product.id} className="relative">
                    {/* Selection checkbox */}
                    <div className="absolute top-2 left-2 z-10">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.product.id)}
                        onChange={() => handleSelectItem(item.product.id)}
                        className="w-4 h-4 text-green-600 bg-white border-gray-300 rounded focus:ring-green-500"
                      />
                    </div>

                    <ProductCard
                      product={item.product}
                      showWishlistButton={false}
                      className={viewMode === 'list' ? 'flex-row' : ''}
                    />

                    {/* Date added */}
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-gray-600">
                      Added {new Date(item.addedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;