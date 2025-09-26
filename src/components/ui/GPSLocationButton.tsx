import React, { useState, useEffect } from 'react';
import { addressValidationService, ValidatedAddress, GeolocationResult } from '../../services/addressValidationService';
import GPSUtils, { GeolocationPosition } from '../../utils/gpsUtils';

interface GPSLocationButtonProps {
  onLocationFound?: (address: ValidatedAddress) => void;
  onLocationError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline';
}

export const GPSLocationButton: React.FC<GPSLocationButtonProps> = ({
  onLocationFound,
  onLocationError,
  className = "",
  disabled = false,
  size = 'md',
  variant = 'outline'
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState>('prompt');

  // Check permission status on component mount
  useEffect(() => {
    const checkInitialPermission = async () => {
      try {
        const state = await GPSUtils.checkPermission();
        setPermissionState(state);
        setHasPermission(state === 'granted');
      } catch (error) {
        console.error('Error checking GPS permission:', error);
      }
    };

    if (GPSUtils.isGeolocationSupported()) {
      checkInitialPermission();
    }
  }, []);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'px-2 py-1 text-xs';
      case 'lg': return 'px-6 py-3 text-base';
      default: return 'px-4 py-2 text-sm';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600';
      case 'secondary':
        return 'bg-gray-600 text-white hover:bg-gray-700 border-gray-600';
      default:
        return 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300';
    }
  };

  const handleLocationRequest = async () => {
    if (!GPSUtils.isGeolocationSupported()) {
      const error = 'Geolocation is not supported by this browser';
      onLocationError?.(error);
      return;
    }

    setIsLoading(true);

    try {
      // Check permission first
      const permission = await GPSUtils.checkPermission();
      setPermissionState(permission);
      
      if (permission === 'denied') {
        throw new Error('Location access denied. Please enable location permissions in your browser settings.');
      }

      // Get current position using GPS utilities
      const position: GeolocationPosition = await GPSUtils.getCurrentPosition();
      
      // Check if position is accurate enough
      if (!GPSUtils.isPositionAccurate(position, 100)) {
        console.warn('GPS position accuracy is low:', position.accuracy);
      }

      // Check if position is recent enough
      if (!GPSUtils.isPositionRecent(position)) {
        console.warn('GPS position may be outdated');
      }

      // Get address from coordinates using the address service
      const address = await addressValidationService.getAddressFromCoordinates(
        position.latitude,
        position.longitude
      );

      if (!address) {
        throw new Error('Unable to determine address from your location. Please enter your address manually.');
      }

      // Success - call the callback with the found address
      onLocationFound?.(address);
      setHasPermission(true);
      setPermissionState('granted');

    } catch (error) {
      console.error('GPS location error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get location';
      onLocationError?.(errorMessage);
      
      // Update permission state based on error
      if (errorMessage.includes('denied') || errorMessage.includes('permission')) {
        setHasPermission(false);
        setPermissionState('denied');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
          Getting location...
        </>
      );
    }

    if (!GPSUtils.isGeolocationSupported()) {
      return (
        <>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
          </svg>
          GPS Not Supported
        </>
      );
    }

    if (permissionState === 'denied') {
      return (
        <>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          Enable Location
        </>
      );
    }

    if (permissionState === 'granted') {
      return (
        <>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Use My Location
        </>
      );
    }

    return (
      <>
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Use My Location
      </>
    );
  };

  const getTooltipText = () => {
    if (!GPSUtils.isGeolocationSupported()) {
      return 'Geolocation is not supported by your browser';
    }
    if (permissionState === 'denied') {
      return 'Location access was denied. Click to try again or check your browser settings.';
    }
    if (isLoading) {
      return 'Getting your current location...';
    }
    if (permissionState === 'granted') {
      return 'Automatically fill address using your current location';
    }
    return 'Click to allow location access and automatically fill your address';
  };

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={handleLocationRequest}
        disabled={disabled || isLoading || !GPSUtils.isGeolocationSupported()}
        className={`
          inline-flex items-center justify-center font-medium rounded-md border transition-colors
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed
          ${getSizeClasses()}
          ${getVariantClasses()}
          ${className}
        `}
        title={getTooltipText()}
      >
        {getButtonContent()}
      </button>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-gray-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
        {getTooltipText()}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
};

export default GPSLocationButton;