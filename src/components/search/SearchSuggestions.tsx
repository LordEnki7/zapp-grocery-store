import React from 'react';
import { FiSearch, FiTrendingUp, FiClock } from 'react-icons/fi';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'product' | 'category' | 'brand' | 'recent' | 'trending';
  count?: number;
}

interface SearchSuggestionsProps {
  suggestions: SearchSuggestion[];
  onSuggestionClick: (suggestion: SearchSuggestion) => void;
  onClearRecent?: () => void;
  isVisible: boolean;
}

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  suggestions,
  onSuggestionClick,
  onClearRecent,
  isVisible
}) => {
  if (!isVisible || suggestions.length === 0) {
    return null;
  }

  const getIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'trending':
        return <FiTrendingUp className="w-4 h-4 text-orange-500" />;
      case 'recent':
        return <FiClock className="w-4 h-4 text-gray-400" />;
      default:
        return <FiSearch className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeLabel = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'product':
        return 'Product';
      case 'category':
        return 'Category';
      case 'brand':
        return 'Brand';
      case 'recent':
        return 'Recent';
      case 'trending':
        return 'Trending';
      default:
        return '';
    }
  };

  // Group suggestions by type
  const groupedSuggestions = suggestions.reduce((acc, suggestion) => {
    if (!acc[suggestion.type]) {
      acc[suggestion.type] = [];
    }
    acc[suggestion.type].push(suggestion);
    return acc;
  }, {} as Record<string, SearchSuggestion[]>);

  return (
    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
      {Object.entries(groupedSuggestions).map(([type, typeSuggestions]) => (
        <div key={type} className="border-b border-gray-100 last:border-b-0">
          {/* Section Header */}
          <div className="px-4 py-2 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getIcon(type as SearchSuggestion['type'])}
              <span className="text-sm font-medium text-gray-700 capitalize">
                {getTypeLabel(type as SearchSuggestion['type'])}
              </span>
            </div>
            {type === 'recent' && onClearRecent && (
              <button
                onClick={onClearRecent}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            )}
          </div>

          {/* Suggestions */}
          <div className="py-1">
            {typeSuggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => onSuggestionClick(suggestion)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  {getIcon(suggestion.type)}
                  <span className="text-gray-800 group-hover:text-green-600">
                    {suggestion.text}
                  </span>
                </div>
                {suggestion.count && (
                  <span className="text-xs text-gray-500">
                    {suggestion.count} items
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* No Results */}
      {suggestions.length === 0 && (
        <div className="px-4 py-8 text-center text-gray-500">
          <FiSearch className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p>No suggestions found</p>
        </div>
      )}
    </div>
  );
};

export default SearchSuggestions;