import React from 'react';
import { AddressValidationResult, AddressSuggestion } from '../../services/addressValidationService';

interface AddressValidationFeedbackProps {
  validationResult: AddressValidationResult | null;
  isValidating?: boolean;
  onSuggestionSelect?: (suggestion: AddressSuggestion) => void;
  className?: string;
}

export const AddressValidationFeedback: React.FC<AddressValidationFeedbackProps> = ({
  validationResult,
  isValidating = false,
  onSuggestionSelect,
  className = ""
}) => {
  if (isValidating) {
    return (
      <div className={`mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md ${className}`}>
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
          <span className="text-blue-700 text-sm">Validating address...</span>
        </div>
      </div>
    );
  }

  if (!validationResult) {
    return null;
  }

  const { isValid, confidence, suggestions, validatedAddress, errors } = validationResult;

  // Success state
  if (isValid && validatedAddress) {
    const getConfidenceColor = (conf: string) => {
      switch (conf) {
        case 'high': return 'text-green-700 bg-green-50 border-green-200';
        case 'medium': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
        case 'low': return 'text-orange-700 bg-orange-50 border-orange-200';
        default: return 'text-gray-700 bg-gray-50 border-gray-200';
      }
    };

    const getConfidenceIcon = (conf: string) => {
      switch (conf) {
        case 'high':
          return (
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          );
        case 'medium':
          return (
            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          );
        case 'low':
          return (
            <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          );
        default:
          return null;
      }
    };

    return (
      <div className={`mt-2 p-3 border rounded-md ${getConfidenceColor(confidence)} ${className}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-2 mt-0.5">
            {getConfidenceIcon(confidence)}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Address {confidence === 'high' ? 'verified' : confidence === 'medium' ? 'validated' : 'found'}
              </span>
              <span className="text-xs opacity-75 capitalize">
                {confidence} confidence
              </span>
            </div>
            
            {validatedAddress.latitude && validatedAddress.longitude && (
              <div className="mt-1 text-xs opacity-75">
                📍 GPS coordinates available
              </div>
            )}
            
            {validatedAddress.deliverable && (
              <div className="mt-1 text-xs opacity-75">
                ✓ Deliverable address
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Error state with suggestions
  if (!isValid) {
    return (
      <div className={`mt-2 ${className}`}>
        {/* Error messages */}
        {errors.length > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md mb-2">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-2">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-700 mb-1">
                  Address validation failed
                </h4>
                <ul className="text-sm text-red-600 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && onSuggestionSelect && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-2">
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-blue-700 mb-2">
                  Did you mean one of these?
                </h4>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={suggestion.id}
                      onClick={() => onSuggestionSelect(suggestion)}
                      className="w-full text-left p-2 bg-white border border-blue-200 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      <div className="text-sm font-medium text-gray-900">
                        {suggestion.mainText}
                      </div>
                      {suggestion.secondaryText && (
                        <div className="text-xs text-gray-500 mt-1">
                          {suggestion.secondaryText}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default AddressValidationFeedback;