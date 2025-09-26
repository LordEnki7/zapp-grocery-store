import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { useGridVirtualization } from '../../hooks/useVirtualization';
import ProductCard from './ProductCard';
import type { Product } from '../../services/productService';
import { 
  FiLoader, 
  FiGrid, 
  FiList, 
  FiCheckSquare, 
  FiSquare, 
  FiColumns,
  FiFilter,
  FiTrendingUp,
  FiEye,
  FiShoppingCart
} from 'react-icons/fi';

interface VirtualizedProductGridProps {
  products: Product[];
  isLoading?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => Promise<void>;
  viewMode?: 'grid' | 'list' | 'comparison';
  containerHeight?: number;
  gap?: number;
  enableBulkActions?: boolean;
  enableComparison?: boolean;
  onViewModeChange?: (mode: 'grid' | 'list' | 'comparison') => void;
  onBulkAction?: (action: string, productIds: string[]) => void;
  onCompareProducts?: (products: Product[]) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (sortBy: string, order: 'asc' | 'desc') => void;
  onMiniCartOpen?: () => void;
}

const VirtualizedProductGrid: React.FC<VirtualizedProductGridProps> = ({
  products,
  isLoading = false,
  hasNextPage = false,
  onLoadMore,
  viewMode = 'grid',
  containerHeight = 600,
  gap = 16,
  enableBulkActions = false,
  enableComparison = false,
  onViewModeChange,
  onBulkAction,
  onCompareProducts,
  sortBy = 'name',
  sortOrder = 'asc',
  onSortChange,
  onMiniCartOpen
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [comparisonProducts, setComparisonProducts] = useState<Product[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Sort options for enterprise-level sorting
  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'price', label: 'Price' },
    { value: 'rating', label: 'Rating' },
    { value: 'popularity', label: 'Popularity' },
    { value: 'newest', label: 'Newest' },
    { value: 'discount', label: 'Discount' }
  ];

  // Bulk action handlers
  const handleSelectAll = useCallback(() => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map(p => p.id)));
    }
  }, [products, selectedProducts.size]);

  const handleSelectProduct = useCallback((productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
    setShowBulkActions(newSelected.size > 0);
  }, [selectedProducts]);

  const handleBulkAction = useCallback((action: string) => {
    if (onBulkAction) {
      onBulkAction(action, Array.from(selectedProducts));
    }
    setSelectedProducts(new Set());
    setShowBulkActions(false);
  }, [selectedProducts, onBulkAction]);

  // Comparison handlers
  const handleAddToComparison = useCallback((product: Product) => {
    if (comparisonProducts.length < 4 && !comparisonProducts.find(p => p.id === product.id)) {
      const newComparison = [...comparisonProducts, product];
      setComparisonProducts(newComparison);
      if (onCompareProducts) {
        onCompareProducts(newComparison);
      }
    }
  }, [comparisonProducts, onCompareProducts]);

  const handleRemoveFromComparison = useCallback((productId: string) => {
    const newComparison = comparisonProducts.filter(p => p.id !== productId);
    setComparisonProducts(newComparison);
    if (onCompareProducts) {
      onCompareProducts(newComparison);
    }
  }, [comparisonProducts, onCompareProducts]);

  // Calculate item dimensions based on view mode
  const itemDimensions = useMemo(() => {
    // Ensure containerWidth is valid to prevent Infinity calculations
    const safeContainerWidth = Math.max(containerWidth, 300);
    
    if (viewMode === 'list') {
      return {
        width: safeContainerWidth - gap,
        height: 140 // Increased height for enhanced list items
      };
    } else if (viewMode === 'comparison') {
      // Comparison mode - side by side layout
      const maxColumns = Math.min(4, comparisonProducts.length || 1);
      const itemWidth = (safeContainerWidth - (gap * (maxColumns - 1))) / maxColumns;
      return {
        width: Math.max(itemWidth, 200), // Ensure minimum width
        height: 500 // Taller for comparison details
      };
    } else {
      // Grid mode - responsive columns with enterprise sizing
      const minItemWidth = 300; // Increased for better product display
      const maxColumns = Math.max(1, Math.floor(safeContainerWidth / (minItemWidth + gap)));
      const itemWidth = (safeContainerWidth - (gap * (maxColumns - 1))) / maxColumns;
      
      return {
        width: Math.max(itemWidth, 200), // Ensure minimum width
        height: 450 // Increased height for enhanced product cards
      };
    }
  }, [containerWidth, viewMode, gap, comparisonProducts.length]);

  const {
    virtualItems,
    totalHeight,
    handleScroll,
    columnsPerRow
  } = useGridVirtualization({
    itemWidth: itemDimensions.width,
    itemHeight: itemDimensions.height,
    containerWidth,
    containerHeight,
    totalItems: products.length,
    gap,
    overscan: 5
  });

  // Handle container resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Handle infinite scrolling
  const handleScrollWithLoadMore = async (e: React.UIEvent<HTMLDivElement>) => {
    handleScroll(e);

    if (onLoadMore && hasNextPage && !isLoading) {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      const threshold = 200;

      if (scrollHeight - scrollTop - clientHeight < threshold) {
        await onLoadMore();
      }
    }
  };

  if (products.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <div className="text-6xl mb-4">🛒</div>
        <h3 className="text-lg font-medium mb-2">No products found</h3>
        <p className="text-sm">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Enterprise-level toolbar */}
      <div className="bg-white border border-gray-200 rounded-t-lg p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        {/* Left section - View controls and bulk actions */}
        <div className="flex items-center gap-4">
          {/* View mode toggle */}
          {onViewModeChange && (
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                title="Grid View"
              >
                <FiGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                title="List View"
              >
                <FiList className="w-4 h-4" />
              </button>
              {enableComparison && (
                <button
                  onClick={() => onViewModeChange('comparison')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'comparison' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  title="Comparison View"
                >
                  <FiColumns className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Bulk selection */}
          {enableBulkActions && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSelectAll}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {selectedProducts.size === products.length ? (
                  <FiCheckSquare className="w-4 h-4" />
                ) : (
                  <FiSquare className="w-4 h-4" />
                )}
                Select All ({selectedProducts.size})
              </button>
            </div>
          )}
        </div>

        {/* Right section - Sort and comparison */}
        <div className="flex items-center gap-4">
          {/* Comparison indicator */}
          {enableComparison && comparisonProducts.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
              <FiColumns className="w-4 h-4" />
              <span className="text-sm font-medium">
                Comparing {comparisonProducts.length} items
              </span>
              {comparisonProducts.length >= 2 && (
                <button
                  onClick={() => onCompareProducts?.(comparisonProducts)}
                  className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                >
                  Compare
                </button>
              )}
            </div>
          )}

          {/* Sort controls */}
          {onSortChange && (
            <div className="flex items-center gap-2">
              <FiTrendingUp className="w-4 h-4 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value, sortOrder)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                <div className={`transform transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`}>
                  ↑
                </div>
              </button>
            </div>
          )}

          {/* Product count */}
          <div className="text-sm text-gray-500">
            {products.length.toLocaleString()} products
          </div>
        </div>
      </div>

      {/* Bulk actions bar */}
      {showBulkActions && enableBulkActions && (
        <div className="bg-blue-50 border-x border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-blue-900">
              {selectedProducts.size} items selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkAction('addToCart')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiShoppingCart className="w-4 h-4" />
              Add to Cart
            </button>
            <button
              onClick={() => handleBulkAction('compare')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <FiColumns className="w-4 h-4" />
              Compare
            </button>
            <button
              onClick={() => handleBulkAction('quickView')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FiEye className="w-4 h-4" />
              Quick View
            </button>
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        className={`relative overflow-auto border-x border-b border-gray-200 ${
          showBulkActions ? 'rounded-none' : 'rounded-b-lg'
        } bg-gray-50`}
        style={{ height: containerHeight }}
        onScroll={handleScrollWithLoadMore}
      >
        {/* Virtual container */}
        <div
          className="relative bg-white"
          style={{ height: totalHeight }}
        >
          {/* Rendered items */}
          {virtualItems.map((virtualItem) => {
            const product = products[virtualItem.index];
            if (!product) return null;

            const isSelected = selectedProducts.has(product.id);
            const isInComparison = comparisonProducts.find(p => p.id === product.id);

            return (
              <div
                key={`${product.id}-${virtualItem.index}`}
                className={`absolute transition-all duration-200 ${
                  isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                }`}
                style={{
                  left: virtualItem.x,
                  top: virtualItem.y,
                  width: itemDimensions.width,
                  height: itemDimensions.height
                }}
              >
                <div className="p-2 h-full relative">
                  {/* Selection overlay for bulk actions */}
                  {enableBulkActions && (
                    <div className="absolute top-4 left-4 z-10">
                      <button
                        onClick={() => handleSelectProduct(product.id)}
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                          isSelected 
                            ? 'bg-blue-600 border-blue-600 text-white' 
                            : 'bg-white border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        {isSelected && <FiCheckSquare className="w-4 h-4" />}
                      </button>
                    </div>
                  )}

                  {/* Comparison badge */}
                  {enableComparison && isInComparison && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <FiColumns className="w-3 h-3" />
                        Comparing
                      </div>
                    </div>
                  )}

                  <ProductCard
                    product={product}
                    viewMode={viewMode}
                    isSelected={isSelected}
                    enableComparison={enableComparison}
                    onAddToComparison={() => handleAddToComparison(product)}
                    onRemoveFromComparison={() => handleRemoveFromComparison(product.id)}
                    isInComparison={!!isInComparison}
                    onMiniCartOpen={onMiniCartOpen}
                  />
                </div>
              </div>
            );
          })}

          {/* Loading indicator */}
          {isLoading && (
            <div
              className="absolute left-0 right-0 flex items-center justify-center py-8 bg-white border-t border-gray-200"
              style={{ top: totalHeight }}
            >
              <div className="flex items-center gap-3 text-gray-600">
                <FiLoader className="w-6 h-6 animate-spin text-blue-600" />
                <span className="font-medium">Loading more products...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced stats and pagination info */}
      <div className="bg-white border border-gray-200 rounded-b-lg p-4 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <span>
            Showing <span className="font-medium">{virtualItems.length}</span> of{' '}
            <span className="font-medium">{products.length.toLocaleString()}</span> products
          </span>
          {viewMode === 'grid' && (
            <span className="text-gray-400">
              ({columnsPerRow} columns)
            </span>
          )}
          {selectedProducts.size > 0 && (
            <span className="text-blue-600 font-medium">
              {selectedProducts.size} selected
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {comparisonProducts.length > 0 && (
            <span className="text-green-600 font-medium">
              {comparisonProducts.length} in comparison
            </span>
          )}
          {hasNextPage && (
            <span className="text-blue-600">
              Scroll for more
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Performance optimized version with memoization
const MemoizedVirtualizedProductGrid = React.memo(VirtualizedProductGrid, (prevProps, nextProps) => {
  // Custom comparison to avoid unnecessary re-renders
  return (
    prevProps.products.length === nextProps.products.length &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.hasNextPage === nextProps.hasNextPage &&
    prevProps.viewMode === nextProps.viewMode &&
    prevProps.containerHeight === nextProps.containerHeight &&
    prevProps.gap === nextProps.gap &&
    // Deep comparison for products array (only if lengths are the same)
    prevProps.products.every((product, index) => 
      product.id === nextProps.products[index]?.id &&
      product.name === nextProps.products[index]?.name &&
      product.price === nextProps.products[index]?.price
    )
  );
});

MemoizedVirtualizedProductGrid.displayName = 'VirtualizedProductGrid';

export default MemoizedVirtualizedProductGrid;