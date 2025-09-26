export interface AddressValidationResult {
  isValid: boolean;
  confidence: 'high' | 'medium' | 'low';
  suggestions: AddressSuggestion[];
  validatedAddress?: ValidatedAddress;
  errors: string[];
}

export interface AddressSuggestion {
  id: string;
  description: string;
  mainText: string;
  secondaryText: string;
  placeId?: string;
  types: string[];
}

export interface ValidatedAddress {
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  isResidential?: boolean;
  isCommercial?: boolean;
  deliverable: boolean;
}

export interface GeolocationResult {
  latitude: number;
  longitude: number;
  accuracy: number;
  address?: string;
}

class AddressValidationService {
  private googleMapsApiKey: string | null = null;
  private autocompleteService: google.maps.places.AutocompleteService | null = null;
  private placesService: google.maps.places.PlacesService | null = null;
  private geocoder: google.maps.Geocoder | null = null;

  constructor() {
    // Initialize Google Maps API key from environment
    this.googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || null;
    this.initializeGoogleServices();
  }

  private async initializeGoogleServices(): Promise<void> {
    if (!this.googleMapsApiKey) {
      console.warn('Google Maps API key not found. Address validation will use basic validation only.');
      return;
    }

    try {
      // Load Google Maps API if not already loaded
      if (!window.google?.maps) {
        await this.loadGoogleMapsScript();
      }

      // Initialize services
      this.autocompleteService = new google.maps.places.AutocompleteService();
      this.geocoder = new google.maps.Geocoder();
      
      // Create a dummy div for PlacesService (required by Google Maps API)
      const dummyDiv = document.createElement('div');
      this.placesService = new google.maps.places.PlacesService(dummyDiv);
    } catch (error) {
      console.error('Failed to initialize Google Maps services:', error);
    }
  }

  private loadGoogleMapsScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.google?.maps) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.googleMapsApiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Maps script'));
      
      document.head.appendChild(script);
    });
  }

  /**
   * Get address suggestions as user types, with optional GPS bias
   */
  async getAddressSuggestions(
    input: string, 
    countryCode: string = 'US', 
    userLocation?: { latitude: number; longitude: number }
  ): Promise<AddressSuggestion[]> {
    if (!input || input.length < 3) {
      return [];
    }

    try {
      if (this.autocompleteService) {
        return await this.getGooglePlacesSuggestions(input, countryCode, userLocation);
      } else {
        // Fallback to basic suggestions if Google Places is not available
        return this.getBasicAddressSuggestions(input);
      }
    } catch (error) {
      console.error('Error getting address suggestions:', error);
      return [];
    }
  }

  private getGooglePlacesSuggestions(
    input: string, 
    countryCode: string, 
    userLocation?: { latitude: number; longitude: number }
  ): Promise<AddressSuggestion[]> {
    return new Promise((resolve) => {
      if (!this.autocompleteService) {
        resolve([]);
        return;
      }

      const request: google.maps.places.AutocompletionRequest = {
        input,
        types: ['address'],
        componentRestrictions: { country: countryCode.toLowerCase() },
        fields: ['place_id', 'formatted_address', 'address_components', 'geometry']
      };

      // Add location bias if GPS coordinates are available
      if (userLocation) {
        request.location = new google.maps.LatLng(userLocation.latitude, userLocation.longitude);
        request.radius = 50000; // 50km radius for location bias
      }

      this.autocompleteService.getPlacePredictions(request, (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          const suggestions: AddressSuggestion[] = predictions.map(prediction => ({
            id: prediction.place_id,
            description: prediction.description,
            mainText: prediction.structured_formatting.main_text,
            secondaryText: prediction.structured_formatting.secondary_text || '',
            placeId: prediction.place_id,
            types: prediction.types
          }));
          resolve(suggestions);
        } else {
          resolve([]);
        }
      });
    });
  }

  private getBasicAddressSuggestions(input: string): AddressSuggestion[] {
    // Basic fallback suggestions - in a real implementation, you might use a local database
    // or a simpler API for basic address completion
    return [];
  }

  /**
   * Validate a complete address
   */
  async validateAddress(address: {
    street: string;
    apartment?: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  }): Promise<AddressValidationResult> {
    const errors: string[] = [];
    
    // Basic validation
    if (!address.street?.trim()) errors.push('Street address is required');
    if (!address.city?.trim()) errors.push('City is required');
    if (!address.state?.trim()) errors.push('State is required');
    if (!address.zipCode?.trim()) errors.push('ZIP code is required');

    // ZIP code format validation (US)
    if (address.zipCode && !this.isValidZipCode(address.zipCode)) {
      errors.push('Invalid ZIP code format');
    }

    if (errors.length > 0) {
      return {
        isValid: false,
        confidence: 'low',
        suggestions: [],
        errors
      };
    }

    try {
      // Try Google Geocoding for validation
      if (this.geocoder) {
        return await this.validateWithGoogleGeocoding(address);
      } else {
        // Basic validation without external service
        return {
          isValid: true,
          confidence: 'medium',
          suggestions: [],
          validatedAddress: {
            ...address,
            country: address.country || 'US',
            deliverable: true
          },
          errors: []
        };
      }
    } catch (error) {
      console.error('Address validation error:', error);
      return {
        isValid: false,
        confidence: 'low',
        suggestions: [],
        errors: ['Unable to validate address at this time']
      };
    }
  }

  private async validateWithGoogleGeocoding(address: any): Promise<AddressValidationResult> {
    return new Promise((resolve) => {
      if (!this.geocoder) {
        resolve({
          isValid: false,
          confidence: 'low',
          suggestions: [],
          errors: ['Geocoding service not available']
        });
        return;
      }

      const fullAddress = `${address.street}${address.apartment ? ' ' + address.apartment : ''}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country || 'US'}`;

      this.geocoder.geocode({ address: fullAddress }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
          const result = results[0];
          const location = result.geometry.location;
          
          // Extract validated address components
          const validatedAddress: ValidatedAddress = {
            street: address.street,
            apartment: address.apartment,
            city: address.city,
            state: address.state,
            zipCode: address.zipCode,
            country: address.country || 'US',
            latitude: location.lat(),
            longitude: location.lng(),
            deliverable: true
          };

          // Determine confidence based on location type
          let confidence: 'high' | 'medium' | 'low' = 'medium';
          if (result.geometry.location_type === google.maps.GeocoderLocationType.ROOFTOP) {
            confidence = 'high';
          } else if (result.geometry.location_type === google.maps.GeocoderLocationType.RANGE_INTERPOLATED) {
            confidence = 'medium';
          } else {
            confidence = 'low';
          }

          resolve({
            isValid: true,
            confidence,
            suggestions: [],
            validatedAddress,
            errors: []
          });
        } else {
          resolve({
            isValid: false,
            confidence: 'low',
            suggestions: [],
            errors: ['Address could not be verified']
          });
        }
      });
    });
  }

  /**
   * Get address from GPS coordinates
   */
  async getAddressFromCoordinates(latitude: number, longitude: number): Promise<ValidatedAddress | null> {
    try {
      if (!this.geocoder) {
        throw new Error('Geocoding service not available');
      }

      return new Promise((resolve) => {
        if (!this.geocoder) {
          resolve(null);
          return;
        }

        const latlng = new google.maps.LatLng(latitude, longitude);
        
        this.geocoder.geocode({ location: latlng }, (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
            const result = results[0];
            const components = result.address_components;
            
            // Extract address components
            let street = '';
            let apartment = '';
            let city = '';
            let state = '';
            let zipCode = '';
            let country = '';

            components.forEach(component => {
              const types = component.types;
              
              if (types.includes('street_number')) {
                street = component.long_name + ' ';
              } else if (types.includes('route')) {
                street += component.long_name;
              } else if (types.includes('subpremise')) {
                apartment = component.long_name;
              } else if (types.includes('locality')) {
                city = component.long_name;
              } else if (types.includes('administrative_area_level_1')) {
                state = component.short_name;
              } else if (types.includes('postal_code')) {
                zipCode = component.long_name;
              } else if (types.includes('country')) {
                country = component.short_name;
              }
            });

            resolve({
              street: street.trim(),
              apartment,
              city,
              state,
              zipCode,
              country,
              latitude,
              longitude,
              deliverable: true
            });
          } else {
            resolve(null);
          }
        });
      });
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }

  /**
   * Get user's current location
   */
  async getCurrentLocation(): Promise<GeolocationResult | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          // Try to get address from coordinates
          const address = await this.getAddressFromCoordinates(latitude, longitude);
          
          resolve({
            latitude,
            longitude,
            accuracy,
            address: address ? `${address.street}, ${address.city}, ${address.state} ${address.zipCode}` : undefined
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  /**
   * Get place details from place ID
   */
  async getPlaceDetails(placeId: string): Promise<ValidatedAddress | null> {
    if (!this.placesService) {
      return null;
    }

    return new Promise((resolve) => {
      if (!this.placesService) {
        resolve(null);
        return;
      }

      const request: google.maps.places.PlaceDetailsRequest = {
        placeId,
        fields: ['address_components', 'formatted_address', 'geometry']
      };

      this.placesService.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          const components = place.address_components;
          const location = place.geometry?.location;
          
          if (!components) {
            resolve(null);
            return;
          }

          // Extract address components
          let street = '';
          let apartment = '';
          let city = '';
          let state = '';
          let zipCode = '';
          let country = '';

          components.forEach(component => {
            const types = component.types;
            
            if (types.includes('street_number')) {
              street = component.long_name + ' ';
            } else if (types.includes('route')) {
              street += component.long_name;
            } else if (types.includes('subpremise')) {
              apartment = component.long_name;
            } else if (types.includes('locality')) {
              city = component.long_name;
            } else if (types.includes('administrative_area_level_1')) {
              state = component.short_name;
            } else if (types.includes('postal_code')) {
              zipCode = component.long_name;
            } else if (types.includes('country')) {
              country = component.short_name;
            }
          });

          resolve({
            street: street.trim(),
            apartment,
            city,
            state,
            zipCode,
            country,
            latitude: location?.lat(),
            longitude: location?.lng(),
            deliverable: true
          });
        } else {
          resolve(null);
        }
      });
    });
  }

  private isValidZipCode(zipCode: string): boolean {
    // US ZIP code validation (5 digits or 5+4 format)
    const zipRegex = /^\d{5}(-\d{4})?$/;
    return zipRegex.test(zipCode.trim());
  }
}

// Export singleton instance
export const addressValidationService = new AddressValidationService();
export default addressValidationService;