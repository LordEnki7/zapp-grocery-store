import React, { useEffect, useRef, useState } from 'react';
import { FaMapMarkerAlt, FaExpand, FaCompress } from 'react-icons/fa';

interface AddressMinimapProps {
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
  className?: string;
  height?: number;
  showFullscreen?: boolean;
}

export const AddressMinimap: React.FC<AddressMinimapProps> = ({
  address,
  coordinates,
  className = '',
  height = 200,
  showFullscreen = true
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  // Format address for display
  const formatAddress = () => {
    if (!address) return '';
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
  };

  // Generate static map URL (using a free service like OpenStreetMap)
  const getStaticMapUrl = () => {
    if (!coordinates) return null;
    
    const { lat, lng } = coordinates;
    const zoom = 15;
    const size = isFullscreen ? '800x600' : `400x${height}`;
    
    // Using OpenStreetMap static map service
    return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s-l+000(${lng},${lat})/${lng},${lat},${zoom}/${size}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`;
  };

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Handle map load error
  const handleImageError = () => {
    setMapError(true);
  };

  // Handle map load success
  const handleImageLoad = () => {
    setMapLoaded(true);
    setMapError(false);
  };

  if (!address && !coordinates) {
    return null;
  }

  const staticMapUrl = getStaticMapUrl();

  return (
    <>
      <div 
        ref={mapRef}
        className={`relative bg-gray-100 rounded-lg overflow-hidden border ${className}`}
        style={{ height: isFullscreen ? '60vh' : `${height}px` }}
      >
        {/* Map Header */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/50 to-transparent z-10 p-3">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center">
              <FaMapMarkerAlt className="mr-2" size={14} />
              <span className="text-sm font-medium">Address Location</span>
            </div>
            {showFullscreen && (
              <button
                onClick={toggleFullscreen}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                title={isFullscreen ? "Exit fullscreen" : "View fullscreen"}
              >
                {isFullscreen ? <FaCompress size={14} /> : <FaExpand size={14} />}
              </button>
            )}
          </div>
        </div>

        {/* Map Content */}
        {staticMapUrl && !mapError ? (
          <img
            src={staticMapUrl}
            alt="Address location map"
            className="w-full h-full object-cover"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            {mapError ? (
              <div className="text-center text-gray-500">
                <FaMapMarkerAlt size={24} className="mx-auto mb-2" />
                <p className="text-sm">Map unavailable</p>
                <p className="text-xs">Location services may be disabled</p>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <div className="animate-pulse">
                  <FaMapMarkerAlt size={24} className="mx-auto mb-2" />
                  <p className="text-sm">Loading map...</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Address Overlay */}
        {address && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <div className="text-white">
              <p className="text-sm font-medium truncate">{formatAddress()}</p>
              {coordinates && (
                <p className="text-xs opacity-75">
                  {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {!mapLoaded && !mapError && staticMapUrl && (
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm">Loading map...</p>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl">
            <button
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <FaCompress size={16} />
            </button>
            <AddressMinimap
              address={address}
              coordinates={coordinates}
              height={600}
              showFullscreen={false}
              className="w-full"
            />
          </div>
        </div>
      )}
    </>
  );
};