import React from 'react';
import { FaCheck, FaExclamationTriangle, FaTimes, FaMapMarkerAlt } from 'react-icons/fa';
import { ValidatedAddress, AddressValidationResult } from '../../services/addressValidationService';

interface AddressConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalAddress: {
    street: string;
    apartment?: string;
    city: string;
    state: string;
    zipCode: string;
  };
  validationResult: AddressValidationResult;
  onConfirmOriginal: () => void;
  onSelectSuggestion: (address: ValidatedAddress) => void;
}

const AddressConfirmationModal: React.FC<AddressConfirmationModalProps> = ({
  isOpen,
  onClose,
  originalAddress,
  validationResult,
  onConfirmOriginal,
  onSelectSuggestion
}) => {
  if (!isOpen) return null;

  const formatAddress = (address: ValidatedAddress | typeof originalAddress) => {
    if ('formattedAddress' in address) {
      return address.formattedAddress;
    }
    return `${address.street}${address.apartment ? `, ${address.apartment}` : ''}, ${address.city}, ${address.state} ${address.zipCode}`;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <FaMapMarkerAlt className="text-blue-500 mr-3" size={24} />
              <h2 className="text-xl font-semibold text-gray-900">
                Address Confirmation
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes size={20} />
            </button>
          </div>

          {/* Validation Status */}
          <div className="mb-6">
            <div className={`flex items-center p-4 rounded-lg ${
              validationResult.isValid 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-yellow-50 border border-yellow-200'
            }`}>
              {validationResult.isValid ? (
                <FaCheck className="text-green-500 mr-3" />
              ) : (
                <FaExclamationTriangle className="text-yellow-500 mr-3" />
              )}
              <div>
                <p className={`font-medium ${
                  validationResult.isValid ? 'text-green-800' : 'text-yellow-800'
                }`}>
                  {validationResult.isValid 
                    ? 'Address validation successful' 
                    : 'Address needs verification'
                  }
                </p>
                {validationResult.confidence !== undefined && (
                  <p className={`text-sm ${getConfidenceColor(validationResult.confidence)}`}>
                    {getConfidenceText(validationResult.confidence)} ({Math.round(validationResult.confidence * 100)}%)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Original Address */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Your Entered Address</h3>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <p className="text-gray-800">{formatAddress(originalAddress)}</p>
              <button
                onClick={onConfirmOriginal}
                className="mt-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Use This Address
              </button>
            </div>
          </div>

          {/* Validation Errors */}
          {validationResult.errors && validationResult.errors.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Issues Found</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <ul className="space-y-2">
                  {validationResult.errors.map((error, index) => (
                    <li key={index} className="flex items-start">
                      <FaExclamationTriangle className="text-red-500 mr-2 mt-0.5 flex-shrink-0" size={14} />
                      <span className="text-red-700 text-sm">{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Suggested Addresses */}
          {validationResult.suggestions && validationResult.suggestions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Suggested Addresses ({validationResult.suggestions.length})
              </h3>
              <div className="space-y-3">
                {validationResult.suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-gray-800 font-medium">
                          {suggestion.formattedAddress}
                        </p>
                        {suggestion.confidence !== undefined && (
                          <p className={`text-sm mt-1 ${getConfidenceColor(suggestion.confidence)}`}>
                            {getConfidenceText(suggestion.confidence)} ({Math.round(suggestion.confidence * 100)}%)
                          </p>
                        )}
                        {suggestion.components && (
                          <div className="mt-2 text-sm text-gray-600">
                            <p>Components: {Object.entries(suggestion.components)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(', ')}</p>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => onSelectSuggestion(suggestion)}
                        className="ml-4 inline-flex items-center px-3 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Select
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={onConfirmOriginal}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Proceed with Original Address
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressConfirmationModal;