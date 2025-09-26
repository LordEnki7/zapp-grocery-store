import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaMapMarkerAlt, FaCheck, FaExclamationTriangle, FaSpinner, FaEdit, FaTimes, FaSave, FaStar } from 'react-icons/fa';
import { addressValidationService, AddressSuggestion, ValidatedAddress, AddressValidationResult } from '../../services/addressValidationService';
import { savedAddressService, SavedAddress } from '../../services/savedAddressService';
import { useAuth } from '../../context/AuthContext';
import GPSUtils from '../../utils/gpsUtils';
import { AddressMinimap } from './AddressMinimap';
import { Address } from '../../types';

interface SmartAddressInputProps {
  value?: Address;
  onChange?: (address: Address) => void;
  onSaveAddress?: (address: Address) => void;
  enableGPS?: boolean;
  showMinimap?: boolean;
  placeholder?: string;
  className?: string;
}

const SmartAddressInput: React.FC<SmartAddressInputProps> = ({
  value = { street: '', apartment: '', city: '', state: '', zipCode: '', country: 'US' },
  onChange,
  onSaveAddress,
  enableGPS = true,
  showMinimap = false,
  placeholder = "Enter your address",
  className = ""
}) => {
  const { user } = useAuth();
  const [currentAddress, setCurrentAddress] = useState<Address>(value);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [validationMessage, setValidationMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showSavedDropdown, setShowSavedDropdown] = useState(false);
  const [userSavedAddresses, setUserSavedAddresses] = useState<SavedAddress[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Load saved addresses when user changes
  useEffect(() => {
    if (user?.id) {
      const saved = savedAddressService.getSavedAddresses(user.id);
      setUserSavedAddresses(saved);
    }
  }, [user?.id]);

  // Initialize search query from address
  useEffect(() => {
    if (value.street && !searchQuery) {
      const fullAddress = `${value.street}${value.apartment ? `, ${value.apartment}` : ''}, ${value.city}, ${value.state} ${value.zipCode}`;
      setSearchQuery(fullAddress);
    }
  }, [value, searchQuery]);

  // Get user's GPS location on component mount
  useEffect(() => {
    if (enableGPS && GPSUtils.isGeolocationSupported()) {
      const getUserLocation = async () => {
        try {
          const position = await GPSUtils.getCurrentPosition();
          if (position && GPSUtils.isPositionAccurate(position) && GPSUtils.isPositionRecent(position)) {
            setGpsLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          }
        } catch (error) {
          console.log('Could not get user location for address suggestions:', error);
        }
      };
      getUserLocation();
    }
  }, [enableGPS]);

  // Format address for display
  const formatAddressForDisplay = (address: Address): string => {
    const parts = [
      address.street,
      address.city,
      address.state,
      address.zipCode
    ].filter(Boolean);
    return parts.join(', ');
  };

  // Check if address is complete
  const isAddressComplete = (address: Address): boolean => {
    return !!(address.street && address.city && address.state && address.zipCode);
  };

  // Initialize search query from current address
  useEffect(() => {
    if (isAddressComplete(value) && !isExpanded) {
      setSearchQuery(formatAddressForDisplay(value));
    }
  }, [value, isExpanded]);

  // Debounced search function
  const debouncedSearch = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      const results = await addressValidationService.getAddressSuggestions(
        query,
        'US',
        gpsLocation || undefined
      );
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  }, [gpsLocation]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowSavedDropdown(false);

    // Clear debounce timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new debounce timer
    debounceRef.current = setTimeout(() => {
      debouncedSearch(query);
    }, 300);
  };

  // Handle address selection from suggestions
  const handleAddressSelect = async (suggestion: AddressSuggestion) => {
    try {
      setIsLoading(true);
      const placeDetails = await addressValidationService.getPlaceDetails(suggestion.placeId);
      
      if (placeDetails) {
        const newAddress: Address = {
          street: placeDetails.street || '',
          apartment: value.apartment || '',
          city: placeDetails.city || '',
          state: placeDetails.state || '',
          zipCode: placeDetails.zipCode || '',
          country: placeDetails.country || 'US'
        };

        onChange?.(newAddress);
        setSearchQuery(formatAddressForDisplay(newAddress));
        setIsExpanded(true);
        setShowSuggestions(false);
        
        // Validate the selected address
        validateAddress(newAddress);
      }
    } catch (error) {
      console.error('Error selecting address:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle saved address selection
  const handleSavedAddressSelect = (savedAddress: SavedAddress) => {
    const addressData: Address = {
      street: savedAddress.street,
      apartment: savedAddress.apartment,
      city: savedAddress.city,
      state: savedAddress.state,
      zipCode: savedAddress.zipCode,
      country: savedAddress.country
    };
    
    onChange?.(addressData);
    setSearchQuery(`${savedAddress.street}${savedAddress.apartment ? `, ${savedAddress.apartment}` : ''}, ${savedAddress.city}, ${savedAddress.state} ${savedAddress.zipCode}`);
    setShowSavedDropdown(false);
    setIsExpanded(false);
    
    // Mark as used
    if (user?.id) {
      savedAddressService.markAsUsed(savedAddress.id, user.id);
    }
  };

  // Save current address
  const handleSaveCurrentAddress = () => {
    if (!user?.id || !currentAddress.street) return;
    
    const label = `${currentAddress.street}, ${currentAddress.city}`;
    const existing = savedAddressService.addressExists(currentAddress, user.id);
    
    if (!existing) {
      savedAddressService.saveAddress(currentAddress, label, user.id);
      const updated = savedAddressService.getSavedAddresses(user.id);
      setUserSavedAddresses(updated);
      onSaveAddress?.(currentAddress);
    }
  };



  // Validate address
  const validateAddress = async (address: Address) => {
    if (!isAddressComplete(address)) return;

    setValidationStatus('validating');
    try {
      const result = await addressValidationService.validateAddress(address);
      setValidationStatus(result.isValid ? 'valid' : 'invalid');
      setValidationMessage(result.message || '');
    } catch (error) {
      console.error('Error validating address:', error);
      setValidationStatus('invalid');
      setValidationMessage('Unable to validate address');
    }
  };

  // Handle input focus
  const handleInputFocus = () => {
    if (userSavedAddresses.length > 0 && !searchQuery) {
      setShowSavedDropdown(true);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = showSavedDropdown ? userSavedAddresses : suggestions;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < items.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      if (showSavedDropdown) {
        handleSavedAddressSelect(userSavedAddresses[selectedIndex]);
      } else {
        handleAddressSelect(suggestions[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setShowSavedDropdown(false);
      setSelectedIndex(-1);
    }
  };

  // Handle field changes in expanded mode
  const handleFieldChange = (field: keyof Address, fieldValue: string) => {
    const newAddress = { ...value, [field]: fieldValue };
    onChange?.(newAddress);
    
    // Re-validate if address is complete
    if (isAddressComplete(newAddress)) {
      validateAddress(newAddress);
    }
  };

  // Toggle edit mode
  const handleEditToggle = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setSearchQuery('');
    } else {
      setSearchQuery(formatAddressForDisplay(value));
    }
  };

  // Get validation status icon
  const getValidationIcon = () => {
    if (isValidating) {
      return <FaSpinner className="animate-spin text-blue-500" />;
    }
    if (validationResult?.isValid) {
      return <FaCheck className="text-green-500" />;
    }
    if (validationResult && !validationResult.isValid) {
      return <FaExclamationTriangle className="text-yellow-500" />;
    }
    return null;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Saved Addresses Button */}
      {!isExpanded && userSavedAddresses.length > 0 && (
        <div className="mb-2">
          <button
            type="button"
            onClick={() => setShowSavedDropdown(!showSavedDropdown)}
            className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            <FaStar size={12} />
            <span>Choose from saved addresses ({userSavedAddresses.length})</span>
          </button>
        </div>
      )}

      {/* Saved Addresses Dropdown */}
      {showSavedDropdown && userSavedAddresses.length > 0 && (
        <div className="mb-4 border border-gray-200 rounded-lg bg-white shadow-sm">
          <div className="p-3 border-b border-gray-100">
            <h4 className="text-sm font-medium text-gray-700">Saved Addresses</h4>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {userSavedAddresses.map((savedAddr) => (
              <button
                key={savedAddr.id}
                type="button"
                onClick={() => handleSavedAddressSelect(savedAddr)}
                className="w-full text-left p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">{savedAddr.label}</span>
                      {savedAddr.isDefault && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Default</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {savedAddr.street}{savedAddr.apartment && `, ${savedAddr.apartment}`}
                    </div>
                    <div className="text-sm text-gray-600">
                      {savedAddr.city}, {savedAddr.state} {savedAddr.zipCode}
                    </div>
                  </div>
                  <FaMapMarkerAlt className="text-gray-400 mt-1" size={12} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Input Field */}
      <div className="relative">
        <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base ${
              validationStatus === 'invalid' ? 'border-yellow-400 bg-yellow-50' : 
              validationStatus === 'valid' ? 'border-green-400 bg-green-50' : 
              'border-gray-300'
            }`}
            autoComplete="street-address"
            inputMode="text"
            enterKeyHint="search"
          />
        
        {/* Status Icons */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
          {isLoading && <FaSpinner className="animate-spin text-blue-500" size={14} />}
          {validationStatus === 'validating' && <FaSpinner className="animate-spin text-blue-500" size={14} />}
          {validationStatus === 'valid' && <FaCheck className="text-green-500" size={14} />}
          {validationStatus === 'invalid' && <FaExclamationTriangle className="text-yellow-500" size={14} />}
          {currentAddress.street && (
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="text-blue-500 hover:text-blue-600"
              title={isEditing ? "Collapse" : "Edit address details"}
            >
              {isEditing ? <FaChevronUp size={14} /> : <FaEdit size={14} />}
            </button>
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.placeId || index}
              type="button"
              onClick={() => handleAddressSelect(suggestion)}
              className="w-full px-4 py-4 text-left hover:bg-blue-50 transition-colors touch-manipulation"
            >
              <div className="flex items-center">
                <FaMapMarkerAlt className="text-gray-400 mr-3 flex-shrink-0" size={16} />
                <div>
                  <div className="font-medium text-gray-900 text-base">{suggestion.mainText}</div>
                  <div className="text-sm text-gray-500">{suggestion.secondaryText}</div>
                </div>
              </div>
            </button>
          ))}
          
          {/* Loading State */}
          {isLoading && (
            <div className="px-4 py-4 text-center text-gray-500">
              <FaSpinner className="animate-spin inline mr-2" />
              Loading suggestions...
            </div>
          )}
        </div>
      )}

      {/* Expanded Address Form */}
      {isEditing && currentAddress.street && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
          <div className="grid grid-cols-1 gap-4">
            {/* Apartment/Unit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apartment, Suite, Unit (optional)
              </label>
              <input
                type="text"
                value={currentAddress.apartment || ''}
                onChange={(e) => handleFieldChange('apartment', e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                placeholder="Apt, Suite, Unit"
                autoComplete="address-line2"
                inputMode="text"
              />
            </div>

            {/* City and State Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={currentAddress.city}
                  onChange={(e) => handleFieldChange('city', e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  placeholder="City"
                  autoComplete="address-level2"
                  inputMode="text"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={currentAddress.state}
                    onChange={(e) => handleFieldChange('state', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    placeholder="State"
                    autoComplete="address-level1"
                    inputMode="text"
                    maxLength={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={currentAddress.zipCode}
                    onChange={(e) => handleFieldChange('zipCode', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    placeholder="ZIP"
                    autoComplete="postal-code"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Validation Feedback */}
          {validationStatus !== 'idle' && (
            <div className="mt-4">
              {validationStatus === 'valid' ? (
                <div className="flex items-center text-green-700 bg-green-50 p-3 rounded-lg">
                  <FaCheck className="mr-2" />
                  <span className="text-sm">Address verified and ready for delivery</span>
                </div>
              ) : validationStatus === 'invalid' ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center text-yellow-700 mb-2">
                    <FaExclamationTriangle className="mr-2" />
                    <span className="text-sm font-medium">Address needs attention</span>
                  </div>
                  {validationMessage && (
                    <div className="text-sm text-yellow-600">
                      {validationMessage}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center text-blue-700 bg-blue-50 p-3 rounded-lg">
                  <FaSpinner className="animate-spin mr-2" />
                  <span className="text-sm">Validating address...</span>
                </div>
              )}
            </div>
          )}

          {/* Minimap */}
            {showMinimap && validationStatus === 'valid' && gpsLocation && (
              <div className="mt-4">
                <AddressMinimap
                  address={currentAddress}
                  coordinates={gpsLocation}
                  height={150}
                  className="border-2 border-green-200"
                />
              </div>
            )}

            {/* Save Address Option */}
          {user?.id && validationStatus === 'valid' && (
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSaveCurrentAddress}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-base font-medium touch-manipulation"
              >
                <FaSave className="w-5 h-5 inline mr-2" />
                Save Address
              </button>
              
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors text-base font-medium touch-manipulation"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartAddressInput;