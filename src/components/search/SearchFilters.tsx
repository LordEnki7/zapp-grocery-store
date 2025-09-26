import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiX, FiStar } from 'react-icons/fi';

interface SearchFilters {
  categories: string[];
  priceRange: [number, number];
  rating: number;
  inStock: boolean;
  onSale: boolean;
  brands: string[];
  origins: string[];
}

interface SearchFiltersProps {
  filters: SearchFilters;
  onFilterChange: (key: keyof SearchFilters, value: any) => void;
  onClearFilters: () => void;
  availableCategories: string[];
  availableBrands: string[];
  availableOrigins: string[];
  priceRange: [number, number];
}

const SearchFiltersComponent: React.FC<SearchFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  availableCategories,
  availableBrands,
  availableOrigins,
  priceRange
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['categories', 'price'])
  );
  const [animatingFilters, setAnimatingFilters] = useState<Set<string>>(new Set());

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const updateFilters = (key: keyof SearchFilters, value: any) => {
    // Add visual feedback animation
    setAnimatingFilters(prev => new Set(prev).add(key));
    setTimeout(() => {
      setAnimatingFilters(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    }, 300);
    
    onFilterChange(key, value);
  };

  const clearAllFilters = () => {
    onClearFilters();
  };

  const hasActiveFilters = 
    filters.categories.length > 0 ||
    filters.priceRange[0] !== priceRange[0] ||
    filters.priceRange[1] !== priceRange[1] ||
    filters.rating > 0 ||
    filters.inStock ||
    filters.onSale ||
    filters.brands.length > 0 ||
    filters.origins.length > 0;

  const renderStars = (rating: number, onRatingClick: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onRatingClick(star)}
            className={`w-6 h-6 transition-all duration-200 transform hover:scale-110 ${
              star <= rating 
                ? 'text-yellow-400 fill-current drop-shadow-sm' 
                : 'text-gray-300 hover:text-yellow-300'
            }`}
          >
            <FiStar className="w-full h-full" />
          </button>
        ))}
        <span className="ml-3 text-sm text-gray-600 font-medium">
          {rating > 0 ? `${rating}+ stars` : 'Any rating'}
        </span>
      </div>
    );
  };

  const FilterSection: React.FC<{
    title: string;
    section: string;
    children: React.ReactNode;
  }> = ({ title, section, children }) => {
    const isExpanded = expandedSections.has(section);
    const isAnimating = animatingFilters.has(section as keyof SearchFilters);
    
    return (
      <div className={`border-b border-gray-200 last:border-b-0 transition-all duration-300 ${
        isAnimating ? 'bg-blue-50 border-blue-200' : ''
      }`}>
        <button
          onClick={() => toggleSection(section)}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-200"
        >
          <span className="font-medium text-gray-800">{title}</span>
          <div className={`transform transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : 'rotate-0'
          }`}>
            <FiChevronDown className="w-4 h-4 text-gray-500" />
          </div>
        </button>
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="px-4 pb-4">
            {children}
          </div>
        </div>
      </div>
    );
  };

  const activeFiltersCount = 
    filters.categories.length +
    filters.brands.length +
    filters.origins.length +
    (filters.rating > 0 ? 1 : 0) +
    (filters.inStock ? 1 : 0) +
    (filters.onSale ? 1 : 0) +
    (filters.priceRange[0] > priceRange[0] || filters.priceRange[1] < priceRange[1] ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {activeFiltersCount > 0 && (
          <button
            onClick={onClearFilters}
            className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <FiX className="w-4 h-4" />
            Clear all ({activeFiltersCount})
          </button>
        )}
      </div>

      {/* Categories */}
      <FilterSection title="Categories" section="categories">
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {availableCategories.map((category) => (
            <label key={category} className="flex items-center group cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors duration-200">
              <input
                type="checkbox"
                checked={filters.categories.includes(category)}
                onChange={(e) => handleCategoryChange(category, e.target.checked)}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2 transition-all duration-200"
              />
              <span className={`ml-2 text-sm capitalize transition-colors duration-200 ${
                filters.categories.includes(category) 
                  ? 'text-green-700 font-medium' 
                  : 'text-gray-700 group-hover:text-gray-900'
              }`}>
                {category}
              </span>
              {filters.categories.includes(category) && (
                <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full animate-pulse">
                  Active
                </span>
              )}
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range" section="price">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute -top-5 left-0 text-xs text-gray-500">Min</span>
              <input
                type="number"
                value={filters.priceRange[0]}
                onChange={(e) => {
                  const min = Math.max(0, parseInt(e.target.value) || 0);
                  updateFilters('priceRange', [min, Math.max(min, filters.priceRange[1])]);
                }}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                placeholder="0"
              />
            </div>
            <span className="text-gray-400 font-medium">—</span>
            <div className="relative">
              <span className="absolute -top-5 left-0 text-xs text-gray-500">Max</span>
              <input
                type="number"
                value={filters.priceRange[1]}
                onChange={(e) => {
                  const max = parseInt(e.target.value) || priceRange[1];
                  updateFilters('priceRange', [Math.min(filters.priceRange[0], max), max]);
                }}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                placeholder="1000"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>${filters.priceRange[0]}</span>
              <span>${filters.priceRange[1]}</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min={priceRange[0]}
                max={priceRange[1]}
                value={filters.priceRange[0]}
                onChange={(e) => updateFilters('priceRange', [parseInt(e.target.value), filters.priceRange[1]])}
                className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                style={{ zIndex: 1 }}
              />
              <input
                type="range"
                min={priceRange[0]}
                max={priceRange[1]}
                value={filters.priceRange[1]}
                onChange={(e) => updateFilters('priceRange', [filters.priceRange[0], parseInt(e.target.value)])}
                className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                style={{ zIndex: 2 }}
              />
              <div className="relative h-2 bg-gray-200 rounded-lg">
                <div 
                  className="absolute h-2 bg-green-500 rounded-lg transition-all duration-300"
                  style={{
                    left: `${((filters.priceRange[0] - priceRange[0]) / (priceRange[1] - priceRange[0])) * 100}%`,
                    width: `${((filters.priceRange[1] - filters.priceRange[0]) / (priceRange[1] - priceRange[0])) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Customer Rating" section="rating">
        <div className="space-y-3">
          {renderStars(filters.rating, (rating) => {
            updateFilters('rating', filters.rating === rating ? 0 : rating);
          })}
          {filters.rating > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                {filters.rating}+ Stars Selected
              </span>
              <button
                onClick={() => updateFilters('rating', 0)}
                className="text-gray-500 hover:text-red-500 transition-colors duration-200"
                title="Clear rating filter"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </FilterSection>

      {/* Availability */}
      <FilterSection title="Availability" section="availability">
        <div className="space-y-3">
          <label className="flex items-center group cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors duration-200">
            <input
              type="checkbox"
              checked={filters.inStock}
              onChange={(e) => updateFilters('inStock', e.target.checked)}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2 transition-all duration-200"
            />
            <span className={`ml-2 text-sm transition-colors duration-200 ${
              filters.inStock 
                ? 'text-green-700 font-medium' 
                : 'text-gray-700 group-hover:text-gray-900'
            }`}>
              In Stock Only
            </span>
            {filters.inStock && (
              <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                ✓
              </span>
            )}
          </label>
          <label className="flex items-center group cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors duration-200">
            <input
              type="checkbox"
              checked={filters.onSale}
              onChange={(e) => updateFilters('onSale', e.target.checked)}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2 transition-all duration-200"
            />
            <span className={`ml-2 text-sm transition-colors duration-200 ${
              filters.onSale 
                ? 'text-green-700 font-medium' 
                : 'text-gray-700 group-hover:text-gray-900'
            }`}>
              On Sale
            </span>
            {filters.onSale && (
              <span className="ml-auto text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                🏷️
              </span>
            )}
          </label>
        </div>
      </FilterSection>

      {/* Brands */}
      {availableBrands.length > 0 && (
        <FilterSection title="Brands" section="brands">
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {availableBrands.map((brand) => (
              <label key={brand} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.brands.includes(brand)}
                  onChange={(e) => handleBrandChange(brand, e.target.checked)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-700">{brand}</span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Origins */}
      {availableOrigins.length > 0 && (
        <FilterSection title="Origin" section="origins">
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {availableOrigins.map((origin) => (
              <label key={origin} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.origins.includes(origin)}
                  onChange={(e) => handleOriginChange(origin, e.target.checked)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-700">{origin}</span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}
    </div>
  );
};

export default SearchFiltersComponent;
export { SearchFiltersComponent as SearchFilters };