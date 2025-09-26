export interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

export class GPSUtils {
  private static readonly TIMEOUT = 10000; // 10 seconds
  private static readonly MAX_AGE = 300000; // 5 minutes

  /**
   * Check if geolocation is supported by the browser
   */
  static isGeolocationSupported(): boolean {
    return 'geolocation' in navigator;
  }

  /**
   * Check if geolocation permission is granted
   */
  static async checkPermission(): Promise<PermissionState> {
    if (!this.isGeolocationSupported()) {
      throw new Error('Geolocation is not supported by this browser');
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      return permission.state;
    } catch (error) {
      // Fallback for browsers that don't support permissions API
      return 'prompt';
    }
  }

  /**
   * Request geolocation permission and get current position
   */
  static async getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!this.isGeolocationSupported()) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: this.TIMEOUT,
        maximumAge: this.MAX_AGE
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          });
        },
        (error) => {
          reject(this.handleGeolocationError(error));
        },
        options
      );
    });
  }

  /**
   * Watch position changes (for real-time tracking)
   */
  static watchPosition(
    onSuccess: (position: GeolocationPosition) => void,
    onError: (error: GeolocationError) => void
  ): number {
    if (!this.isGeolocationSupported()) {
      onError({
        code: 0,
        message: 'Geolocation is not supported by this browser'
      });
      return -1;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: this.TIMEOUT,
      maximumAge: this.MAX_AGE
    };

    return navigator.geolocation.watchPosition(
      (position) => {
        onSuccess({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
      },
      (error) => {
        onError(this.handleGeolocationError(error));
      },
      options
    );
  }

  /**
   * Clear position watcher
   */
  static clearWatch(watchId: number): void {
    if (this.isGeolocationSupported()) {
      navigator.geolocation.clearWatch(watchId);
    }
  }

  /**
   * Calculate distance between two coordinates (in meters)
   */
  static calculateDistance(
    pos1: GeolocationPosition,
    pos2: GeolocationPosition
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (pos1.latitude * Math.PI) / 180;
    const φ2 = (pos2.latitude * Math.PI) / 180;
    const Δφ = ((pos2.latitude - pos1.latitude) * Math.PI) / 180;
    const Δλ = ((pos2.longitude - pos1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Format coordinates for display
   */
  static formatCoordinates(position: GeolocationPosition): string {
    return `${position.latitude.toFixed(6)}, ${position.longitude.toFixed(6)}`;
  }

  /**
   * Handle geolocation errors and provide user-friendly messages
   */
  private static handleGeolocationError(error: GeolocationPositionError): GeolocationError {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return {
          code: error.code,
          message: 'Location access denied. Please enable location permissions in your browser settings.'
        };
      case error.POSITION_UNAVAILABLE:
        return {
          code: error.code,
          message: 'Location information is unavailable. Please check your GPS or internet connection.'
        };
      case error.TIMEOUT:
        return {
          code: error.code,
          message: 'Location request timed out. Please try again.'
        };
      default:
        return {
          code: error.code,
          message: 'An unknown error occurred while retrieving your location.'
        };
    }
  }

  /**
   * Check if position is accurate enough for address lookup
   */
  static isPositionAccurate(position: GeolocationPosition, maxAccuracy: number = 100): boolean {
    return position.accuracy !== undefined && position.accuracy <= maxAccuracy;
  }

  /**
   * Check if position is recent enough
   */
  static isPositionRecent(position: GeolocationPosition, maxAge: number = this.MAX_AGE): boolean {
    if (!position.timestamp) return false;
    return Date.now() - position.timestamp <= maxAge;
  }
}

export default GPSUtils;