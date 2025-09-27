import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { FiSearch, FiFilter, FiGrid, FiList, FiChevronDown, FiX, FiHeart } from 'react-icons/fi';
import ProductCard from '../components/products/ProductCard';
import ProductRecommendations from '../components/products/ProductRecommendations';
import VirtualizedProductGrid from '../components/products/VirtualizedProductGrid';
import SearchSuggestions from '../components/search/SearchSuggestions';
import SearchFiltersComponent, { SearchFilters } from '../components/search/SearchFilters';
import MiniCart from '../components/cart/MiniCart';
import WishlistSidebar from '../components/cart/WishlistSidebar';
import Button from '../components/ui/Button';
import { ProductSearch, ProductManager, getAllProducts } from '../services/productService';
import type { Product } from '../services/productService';
import { useDebounce } from '../hooks/useDebounce';
import { useProductCache } from '../hooks/useProductCache';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
// import { productCategories } from '../data/productCategories';

// SearchFilters interface is imported from SearchFilters component

const Products: React.FC = () => {
  // Constants
  const itemsPerPage = 20;
  
  // URL parameter handling
  const location = useLocation();
  
  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // UI State
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'comparison'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [comparisonProducts, setComparisonProducts] = useState<Product[]>([]);
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  // Filters state
  const [filters, setFilters] = useState<SearchFilters>({
    categories: [],
    priceRange: [0, 1000],
    rating: 0,
    inStock: false,
    onSale: false,
    brands: [],
    origins: []
  });

  // Ref to access current filters without causing re-renders
  const filtersRef = useRef(filters);
  
  // Update ref when filters change
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Load categories on component mount
  useEffect(() => {
    // Embed categories directly to avoid import issues on Vercel
    const categories = [
      "beverages",
      "frozen", 
      "fresh",
      "fresh-produce",
      "dairy",
      "snacks",
      "general",
      "pantry",
      "breakfast",
      "health",
      "health-wellness",
      "specialty",
      "meat-seafood",
      "bakery",
      "gift-cards",
      "grocery"
    ];
    setAvailableCategories(categories);
  }, []);

  // Enterprise-level handlers
  const handleBulkAction = useCallback((action: string, productIds: string[]) => {
    console.log(`Bulk action: ${action} for products:`, productIds);
    
    switch (action) {
      case 'addToCart':
        // Add selected products to cart
        productIds.forEach(id => {
          const product = products.find(p => p.id === id);
          if (product) {
            addToCart(product, 1);
            console.log(`Adding ${product.name} to cart`);
          }
        });
        // Open mini cart after bulk add
        setTimeout(() => setIsMiniCartOpen(true), 500);
        break;
      case 'compare':
        // Add selected products to comparison
        const selectedProducts = products.filter(p => productIds.includes(p.id));
        setComparisonProducts(selectedProducts.slice(0, 4));
        break;
      case 'quickView':
        // Open quick view for selected products
        console.log('Opening quick view for selected products');
        break;
    }
  }, [products]);

  const handleCompareProducts = useCallback((products: Product[]) => {
    setComparisonProducts(products);
    console.log('Comparing products:', products.map(p => p.name));
  }, []);

  const handleSortChange = useCallback((newSortBy: string, newSortOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1);
    loadProducts(1, false);
  }, []);

  // Hooks
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const { itemCount, addToCart } = useCart();
  const { wishlistCount } = useWishlist();
  const { 
    getSearchResults, 
    setSearchResults, 
    getCategoryProducts, 
    setCategoryProducts,
    cacheStats 
  } = useProductCache();

  // Services
  const productSearch = useMemo(() => new ProductSearch(), []);
  const productManager = useMemo(() => new ProductManager(), []);

  // Load products with caching
  const loadProducts = useCallback(async (page = 1, append = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const currentFilters = filtersRef.current;
      const cacheKey = `products-${page}-${sortBy}-${sortOrder}-${JSON.stringify(currentFilters)}`;
      
      // Check cache first
      const cachedProducts = getSearchResults(cacheKey);
      if (cachedProducts && !append) {
        setProducts(cachedProducts);
        setIsLoading(false);
        return;
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Get all products from productService
      let filteredProducts = await getAllProducts();

      // Apply filters
      if (currentFilters.categories && currentFilters.categories.length > 0) {
        filteredProducts = filteredProducts.filter(p => 
          currentFilters.categories.includes(p.category)
        );
      }

      if (currentFilters.inStock) {
        filteredProducts = filteredProducts.filter(p => p.inStock);
      }

      if (currentFilters.onSale) {
        filteredProducts = filteredProducts.filter(p => 
          p.volumeDiscounts && p.volumeDiscounts.length > 0
        );
      }

      if (currentFilters.rating > 0) {
        filteredProducts = filteredProducts.filter(p => 
          (p.averageRating || 0) >= currentFilters.rating
        );
      }

      // Price range filter
      filteredProducts = filteredProducts.filter(p => 
        p.price >= currentFilters.priceRange[0] && p.price <= currentFilters.priceRange[1]
      );

      // Apply sorting
      filteredProducts.sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'price':
            comparison = a.price - b.price;
            break;
          case 'rating':
            comparison = (b.averageRating || 0) - (a.averageRating || 0);
            break;
          case 'newest':
            comparison = new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
            break;
          default:
            comparison = 0;
        }
        return sortOrder === 'desc' ? -comparison : comparison;
      });

      // Pagination simulation
      const itemsPerPage = 20;
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const pageProducts = filteredProducts.slice(startIndex, endIndex);

      // Cache results
      setSearchResults(cacheKey, pageProducts);

      if (append) {
        setProducts(prev => [...prev, ...pageProducts]);
      } else {
        setProducts(pageProducts);
      }

      setHasNextPage(endIndex < filteredProducts.length);
      setCurrentPage(page);

    } catch (err) {
      setError('Failed to load products');
      console.error('Error loading products:', err);
    } finally {
      setIsLoading(false);
    }
  }, [sortBy, sortOrder, getSearchResults, setSearchResults]);

  // Search products
  const searchProducts = useCallback(async (query: string) => {
    if (!query.trim()) {
      loadProducts(1, false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const cacheKey = `search-${query}-${JSON.stringify(filters)}`;
      
      // Check cache first
      const cachedResults = getSearchResults(cacheKey);
      if (cachedResults) {
        setProducts(cachedResults);
        setIsLoading(false);
        return;
      }

      // Simulate search API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const results = await productSearch.searchProducts(query, {
        categories: filters.categories,
        priceRange: filters.priceRange,
        inStock: filters.inStock,
        rating: filters.rating
      });

      // Cache search results
      setSearchResults(cacheKey, results);
      setProducts(results);
      setHasNextPage(false); // Search results don't paginate in this example

    } catch (err) {
      setError('Search failed');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, productSearch, getSearchResults, setSearchResults, loadProducts]);

  // Load more products (infinite scroll)
  const loadMore = useCallback(async () => {
    if (!hasNextPage || isLoading) return;
    await loadProducts(currentPage + 1, true);
  }, [hasNextPage, isLoading, currentPage, loadProducts]);

  // Get search suggestions
  const getSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const suggestions = await productSearch.getAutocompleteSuggestions(query);
      setSuggestions(suggestions);
    } catch (err) {
      console.error('Error getting suggestions:', err);
    }
  }, [productSearch]);

  // Load initial data and handle URL parameters
  useEffect(() => {
    // Check for category parameter in URL
    const urlParams = new URLSearchParams(location.search);
    const categoryParam = urlParams.get('category');
    
    if (categoryParam) {
      // Set the category filter based on URL parameter
      setFilters(prevFilters => ({
        ...prevFilters,
        categories: [categoryParam]
      }));
    }
    
    loadProducts(1, false);
  }, [loadProducts, location.search]);

  // Handle search with debouncing
  useEffect(() => {
    if (debouncedSearchQuery) {
      searchProducts(debouncedSearchQuery);
    } else {
      loadProducts(1, false);
    }
  }, [debouncedSearchQuery, searchProducts, loadProducts]);

  // Handle search suggestions
  useEffect(() => {
    getSuggestions(searchQuery);
    setShowSuggestions(searchQuery.length > 2);
  }, [searchQuery, getSuggestions]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Apply search query
    if (searchQuery.trim()) {
      result = result.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply filters
    if (filters.categories && filters.categories.length > 0) {
      result = result.filter(product => filters.categories.includes(product.category));
    }

    if (filters.inStock) {
      result = result.filter(product => product.stock > 0);
    }

    if (filters.rating > 0) {
      result = result.filter(product => (product.averageRating || 0) >= filters.rating);
    }

    // Apply price range
    result = result.filter(product => 
      product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'rating':
          comparison = (a.rating || 0) - (b.rating || 0);
          break;
        case 'popularity':
          comparison = (a.popularity || 0) - (b.popularity || 0);
          break;
        case 'newest':
          comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          break;
        default:
          comparison = 0;
      }

      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [products, searchQuery, filters]);

  // Paginate results
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Update total pages when filtered products change
  useEffect(() => {
    setTotalPages(Math.ceil(filteredProducts.length / itemsPerPage));
    setCurrentPage(1);
  }, [filteredProducts, itemsPerPage]);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    
    if (searchQuery.trim()) {
      try {
        const searchResults = await productSearch.searchProducts(searchQuery, filters);
        setProducts(searchResults);
      } catch (err) {
        console.error('Search error:', err);
      }
    }
  };

  const handleSuggestionClick = useCallback((suggestion: any) => {
    setSearchQuery(suggestion.text || suggestion);
    setShowSuggestions(false);
  }, []);

  const handleFilterChange = useCallback((key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  // Get available filter options
  const availableBrands = useMemo(() => {
    return [...new Set(products.map(p => p.brand || 'Unknown').filter(Boolean))];
  }, [products]);

  const availableOrigins = useMemo(() => {
    return [...new Set(products.map(p => p.origin).filter(Boolean))];
  }, [products]);

  const priceRange: [number, number] = useMemo(() => {
    if (products.length === 0) return [0, 100];
    const prices = products.map(p => p.price);
    return [Math.min(...prices), Math.max(...prices)];
  }, [products]);

  const clearFilters = useCallback(() => {
    setFilters({
      categories: [],
      priceRange: [0, 1000],
      rating: 0,
      inStock: false,
      onSale: false,
      brands: [],
      origins: []
    });
    setCurrentPage(1);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setShowSuggestions(false);
  }, []);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) count++;
    if (filters.rating > 0) count++;
    if (filters.inStock) count++;
    if (filters.onSale) count++;
    if (filters.brands.length > 0) count++;
    if (filters.origins.length > 0) count++;
    return count;
  }, [filters]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Header Only */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <FiGrid className="text-4xl" />
              <h1 className="text-4xl md:text-5xl font-bold">All Products</h1>
              <FiSearch className="text-4xl text-green-300" />
            </div>
            <p className="text-xl md:text-2xl mb-6">Discover our complete range of quality products</p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-lg">
              <div className="flex items-center space-x-2">
                <FiHeart className="text-green-300" />
                <span>Premium Quality</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiFilter className="text-green-300" />
                <span>Easy Filtering</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiGrid className="text-green-300" />
                <span>Multiple Views</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Browse All Products</h2>
            <p className="text-gray-600">
              {filteredProducts.length} products found
              {searchQuery && ` for "${searchQuery}"`}
            </p>
          </div>
        
        {/* View Mode Toggle - Mobile Optimized */}
        <div className="flex items-center gap-2 mt-4 lg:mt-0">
          <button
            onClick={() => setIsWishlistOpen(true)}
            className="relative p-3 md:p-2 rounded-md text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation min-w-[44px] min-h-[44px] md:min-w-auto md:min-h-auto flex items-center justify-center"
            title="View Wishlist"
          >
            <FiHeart className="w-6 h-6 md:w-5 md:h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 md:w-5 md:h-5 flex items-center justify-center font-medium">
                {wishlistCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-3 md:p-2 rounded-md touch-manipulation min-w-[44px] min-h-[44px] md:min-w-auto md:min-h-auto flex items-center justify-center transition-colors ${viewMode === 'grid' ? 'bg-green-100 text-green-600' : 'text-gray-500 hover:bg-gray-100 active:bg-gray-200'}`}
          >
            <FiGrid className="w-6 h-6 md:w-5 md:h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-3 md:p-2 rounded-md touch-manipulation min-w-[44px] min-h-[44px] md:min-w-auto md:min-h-auto flex items-center justify-center transition-colors ${viewMode === 'list' ? 'bg-green-100 text-green-600' : 'text-gray-500 hover:bg-gray-100 active:bg-gray-200'}`}
          >
            <FiList className="w-6 h-6 md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        {/* Search Bar */}
        <div className="relative mb-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, categories, or brands..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setShowSuggestions(false);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-5 h-5" />
                </button>
              )}
            </div>
          </form>

          {/* Search Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                >
                  <div className="flex items-center">
                    <FiSearch className="w-4 h-4 text-gray-400 mr-2" />
                    <span>{suggestion}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter Toggle and Sort - Mobile Optimized */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-3 md:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 touch-manipulation min-h-[44px] md:min-h-auto"
              >
                <FiFilter className="w-4 h-4" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
                <FiChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-gray-800 active:text-gray-900 py-2 px-2 touch-manipulation"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Sort Dropdown - Mobile Optimized */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-sm text-gray-600 font-medium">Sort by:</span>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-') as [string, 'asc' | 'desc'];
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                }}
                className="px-3 py-3 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 touch-manipulation min-h-[44px] md:min-h-auto text-base md:text-sm"
              >
                <option value="popularity-desc">Most Popular</option>
                <option value="newest-desc">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating-desc">Highest Rated</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <SearchFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
              availableCategories={availableCategories}
              availableBrands={availableBrands}
              availableOrigins={availableOrigins}
              priceRange={priceRange}
            />
          </div>
        )}
      </div>

      {/* Products Grid/List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
              <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
              <div className="bg-gray-300 h-4 rounded mb-2"></div>
              <div className="bg-gray-300 h-4 rounded w-2/3 mb-2"></div>
              <div className="bg-gray-300 h-6 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <p className="text-lg font-semibold">Error loading products</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={() => loadProducts()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Try Again
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <FiSearch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery ? `No results for "${searchQuery}"` : 'Try adjusting your filters'}
          </p>
          {(searchQuery || activeFiltersCount > 0) && (
            <div className="flex justify-center gap-2">
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50"
                >
                  Clear Search
                </button>
              )}
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <VirtualizedProductGrid
          products={products}
          viewMode={viewMode}
          onLoadMore={hasMore ? loadMore : undefined}
          isLoading={isLoading}
          hasMore={hasMore}
          enableBulkActions={true}
          enableComparison={true}
          onViewModeChange={setViewMode}
          onBulkAction={handleBulkAction}
          onCompareProducts={handleCompareProducts}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          onMiniCartOpen={() => setIsMiniCartOpen(true)}
          containerHeight={600}
        />
      )}

      {/* Product Recommendations */}
      {products.length > 0 && (
        <div className="mt-12">
          <ProductRecommendations
            title="You might also like"
            products={products}
            maxItems={8}
            className="mb-8"
          />
        </div>
      )}

      {/* Mini Cart Sidebar */}
      <MiniCart 
        isOpen={isMiniCartOpen} 
        onClose={() => setIsMiniCartOpen(false)} 
      />
      
      <WishlistSidebar 
        isOpen={isWishlistOpen} 
        onClose={() => setIsWishlistOpen(false)} 
      />
    </div>
    </div>
  );
};

export default Products;