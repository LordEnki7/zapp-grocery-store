import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  FiSearch, 
  FiX, 
  FiMic, 
  FiCamera, 
  FiFilter,
  FiTrendingUp,
  FiClock,
  FiMapPin
} from 'react-icons/fi';
import { useDebounce } from '../../hooks/useDebounce';
import SearchSuggestions from './SearchSuggestions';
import SearchFilters from './SearchFilters';
import { ProductSearch } from '../../services/productService';

interface SearchBarProps {
  onSearch: (query: string, filters?: any) => void;
  onFilterChange?: (filters: any) => void;
  placeholder?: string;
  showFilters?: boolean;
  showVoiceSearch?: boolean;
  showBarcodeScanner?: boolean;
  showLocationFilter?: boolean;
  className?: string;
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'product' | 'category' | 'brand' | 'recent' | 'trending';
  count?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onFilterChange,
  placeholder = "Search products, brands, and more...",
  showFilters = true,
  showVoiceSearch = true,
  showBarcodeScanner = true,
  showLocationFilter = false,
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    categories: [],
    priceRange: [0, 1000],
    rating: 0,
    inStock: false,
    onSale: false,
    brands: [],
    origins: [],
    location: ''
  });

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognition = useRef<any>(null);
  const debouncedQuery = useDebounce(query, 300);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'en-US';

      recognition.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
        handleSearch(transcript);
      };

      recognition.current.onerror = () => {
        setIsListening(false);
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Get search suggestions
  const getSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      // Show recent and trending searches when no query
      const recentSuggestions: SearchSuggestion[] = recentSearches.slice(0, 5).map((search, index) => ({
        id: `recent-${index}`,
        text: search,
        type: 'recent'
      }));

      const trendingSuggestions: SearchSuggestion[] = [
        { id: 'trending-1', text: 'Jamaican Blue Mountain Coffee', type: 'trending', count: 245 },
        { id: 'trending-2', text: 'Trinidad Scorpion Pepper', type: 'trending', count: 189 },
        { id: 'trending-3', text: 'Ghanaian Chocolate', type: 'trending', count: 156 },
        { id: 'trending-4', text: 'Caribbean Spices', type: 'trending', count: 134 },
        { id: 'trending-5', text: 'African Tea Blends', type: 'trending', count: 98 }
      ];

      setSuggestions([...recentSuggestions, ...trendingSuggestions]);
      return;
    }

    try {
      // Get autocomplete suggestions from ProductSearch
      const productSuggestions = await ProductSearch.getAutocompleteSuggestions(searchQuery);
      
      const formattedSuggestions: SearchSuggestion[] = productSuggestions.map((suggestion: any, index: number) => ({
        id: `suggestion-${index}`,
        text: suggestion.text || suggestion,
        type: suggestion.type || 'product',
        count: suggestion.count
      }));

      setSuggestions(formattedSuggestions);
    } catch (error) {
      console.error('Error getting suggestions:', error);
      setSuggestions([]);
    }
  }, [recentSearches]);

  // Handle debounced search suggestions
  useEffect(() => {
    if (isFocused) {
      getSuggestions(debouncedQuery);
    }
  }, [debouncedQuery, isFocused, getSuggestions]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    // Add to recent searches
    const updatedRecent = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 10);
    setRecentSearches(updatedRecent);
    localStorage.setItem('recentSearches', JSON.stringify(updatedRecent));

    setShowSuggestions(false);
    setIsFocused(false);
    onSearch(searchQuery, filters);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    handleSearch(suggestion.text);
  };

  const handleVoiceSearch = () => {
    if (!recognition.current) {
      alert('Voice search is not supported in your browser');
      return;
    }

    if (isListening) {
      recognition.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognition.current.start();
    }
  };

  const handleBarcodeScanner = () => {
    // In a real implementation, this would open camera for barcode scanning
    alert('Barcode scanner would open camera here. This feature requires camera permissions and a barcode scanning library.');
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    onFilterChange?.(newFilters);
    if (query.trim()) {
      onSearch(query, newFilters);
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
    getSuggestions(query);
  };

  const clearQuery = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      {/* Main Search Bar */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
            
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                setIsFocused(true);
                setShowSuggestions(true);
              }}
              placeholder={placeholder}
              className="w-full pl-12 pr-20 py-3 md:py-4 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-gray-700 text-base md:text-lg transition-colors"
            />

            {/* Clear button */}
            {query && (
              <button
                type="button"
                onClick={clearQuery}
                className="absolute right-16 md:right-20 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1 ml-2">
            {/* Voice Search */}
            {showVoiceSearch && (
              <button
                type="button"
                onClick={handleVoiceSearch}
                className={`p-2 md:p-3 rounded-lg transition-colors ${
                  isListening 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Voice Search"
              >
                <FiMic className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            )}

            {/* Barcode Scanner */}
            {showBarcodeScanner && (
              <button
                type="button"
                onClick={handleBarcodeScanner}
                className="p-2 md:p-3 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                title="Scan Barcode"
              >
                <FiCamera className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            )}

            {/* Filters Toggle */}
            {showFilters && (
              <button
                type="button"
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className={`p-2 md:p-3 rounded-lg transition-colors ${
                  showFiltersPanel 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Filters"
              >
                <FiFilter className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            )}

            {/* Search Button */}
            <button
              type="submit"
              className="px-4 md:px-6 py-2 md:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Search
            </button>
          </div>
        </div>
      </form>

      {/* Location Filter */}
      {showLocationFilter && (
        <div className="mt-2 flex items-center text-sm text-gray-600">
          <FiMapPin className="w-4 h-4 mr-1" />
          <span>Delivering to: Miami, FL 33101</span>
          <button className="ml-2 text-green-600 hover:text-green-700">Change</button>
        </div>
      )}

      {/* Search Suggestions */}
      <SearchSuggestions
        suggestions={suggestions}
        onSuggestionClick={handleSuggestionClick}
        onClearRecent={clearRecentSearches}
        isVisible={showSuggestions && isFocused}
      />

      {/* Filters Panel */}
      {showFiltersPanel && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl mt-2 z-40 p-4">
          <SearchFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={() => handleFilterChange({
              categories: [],
              priceRange: [0, 1000],
              rating: 0,
              inStock: false,
              onSale: false,
              brands: [],
              origins: [],
              location: ''
            })}
            availableCategories={['Grocery', 'Frozen', 'Beverages', 'Snacks', 'Spices', 'Produce']}
            availableBrands={['Island Spice Co.', 'Caribbean Gold', 'Tropical Treats', 'Afro Fusion']}
            availableOrigins={['Jamaica', 'Trinidad', 'Ghana', 'Nigeria', 'Barbados', 'Haiti']}
            priceRange={[0, 1000]}
          />
        </div>
      )}
    </div>
  );
};

export default SearchBar;