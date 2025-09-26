import React, { useState, useEffect } from 'react';
import {
  FaTruck,
  FaMapMarkerAlt,
  FaClock,
  FaPhone,
  FaUser,
  FaCheckCircle,
  FaSpinner,
  FaExclamationTriangle,
  FaRefresh,
  FaRoute,
  FaBox,
  FaClipboardCheck
} from 'react-icons/fa';
import { DeliveryService } from '../../services/deliveryService';

interface DeliveryTrackerProps {
  trackingNumber: string;
  orderId?: string;
  compact?: boolean;
  showMap?: boolean;
}

interface TrackingInfo {
  status: 'preparing' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered';
  location?: string;
  estimatedArrival?: Date;
  driverName?: string;
  driverPhone?: string;
  updates: Array<{
    timestamp: Date;
    status: string;
    message: string;
    location?: string;
  }>;
}

const DeliveryTracker: React.FC<DeliveryTrackerProps> = ({
  trackingNumber,
  orderId,
  compact = false,
  showMap = false
}) => {
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTrackingInfo();
    
    // Set up auto-refresh for active deliveries
    const interval = setInterval(() => {
      if (trackingInfo && trackingInfo.status !== 'delivered') {
        loadTrackingInfo(true);
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [trackingNumber]);

  const loadTrackingInfo = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');

      const info = await DeliveryService.trackDelivery(trackingNumber);
      setTrackingInfo(info);
    } catch (error) {
      console.error('Error loading tracking info:', error);
      setError('Failed to load tracking information');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'preparing':
        return <FaBox className="text-blue-600" />;
      case 'picked_up':
        return <FaClipboardCheck className="text-green-600" />;
      case 'in_transit':
        return <FaRoute className="text-orange-600" />;
      case 'out_for_delivery':
        return <FaTruck className="text-purple-600" />;
      case 'delivered':
        return <FaCheckCircle className="text-green-600" />;
      default:
        return <FaSpinner className="text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'picked_up':
        return 'bg-green-100 text-green-800';
      case 'in_transit':
        return 'bg-orange-100 text-orange-800';
      case 'out_for_delivery':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusMessage = (status: string) => {
    const messages = {
      preparing: 'Your order is being prepared',
      picked_up: 'Order picked up from store',
      in_transit: 'Order is on the way',
      out_for_delivery: 'Out for delivery',
      delivered: 'Order delivered'
    };
    return messages[status as keyof typeof messages] || 'Status unknown';
  };

  const formatEstimatedArrival = (date: Date) => {
    const now = new Date();
    const diffMinutes = Math.floor((date.getTime() - now.getTime()) / (1000 * 60));
    
    if (diffMinutes <= 0) {
      return 'Arriving now';
    } else if (diffMinutes < 60) {
      return `Arriving in ${diffMinutes} minutes`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return `Arriving in ${hours}h ${minutes}m`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-red-800">
          <FaExclamationTriangle />
          <span className="font-medium">Tracking Error</span>
        </div>
        <p className="text-sm text-red-700 mt-1">{error}</p>
        <button
          onClick={() => loadTrackingInfo()}
          className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!trackingInfo) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FaTruck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p>No tracking information available</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon(trackingInfo.status)}
            <div>
              <div className="font-medium text-gray-900">
                {getStatusMessage(trackingInfo.status)}
              </div>
              {trackingInfo.estimatedArrival && (
                <div className="text-sm text-gray-500">
                  {formatEstimatedArrival(trackingInfo.estimatedArrival)}
                </div>
              )}
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(trackingInfo.status)}`}>
            {trackingInfo.status.replace('_', ' ').toUpperCase()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Track Your Order</h2>
          <p className="text-sm text-gray-500">Tracking Number: {trackingNumber}</p>
        </div>
        <button
          onClick={() => loadTrackingInfo(true)}
          disabled={refreshing}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
        >
          <FaRefresh className={refreshing ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Current Status */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-3 rounded-full bg-blue-100">
            {getStatusIcon(trackingInfo.status)}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900">
              {getStatusMessage(trackingInfo.status)}
            </h3>
            {trackingInfo.location && (
              <div className="flex items-center space-x-2 text-gray-600 mt-1">
                <FaMapMarkerAlt />
                <span>{trackingInfo.location}</span>
              </div>
            )}
          </div>
          <div className={`px-4 py-2 rounded-full font-medium ${getStatusColor(trackingInfo.status)}`}>
            {trackingInfo.status.replace('_', ' ').toUpperCase()}
          </div>
        </div>

        {trackingInfo.estimatedArrival && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-blue-800">
              <FaClock />
              <span className="font-medium">Estimated Arrival</span>
            </div>
            <p className="text-blue-700 mt-1">
              {formatEstimatedArrival(trackingInfo.estimatedArrival)} • {trackingInfo.estimatedArrival.toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* Driver Information */}
      {trackingInfo.driverName && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Driver</h3>
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-gray-100">
              <FaUser className="text-gray-600" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">{trackingInfo.driverName}</div>
              {trackingInfo.driverPhone && (
                <div className="flex items-center space-x-2 text-gray-600 mt-1">
                  <FaPhone />
                  <span>{trackingInfo.driverPhone}</span>
                </div>
              )}
            </div>
            {trackingInfo.driverPhone && (
              <a
                href={`tel:${trackingInfo.driverPhone}`}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <FaPhone />
                <span>Call</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Progress Timeline */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Progress</h3>
        <div className="space-y-4">
          {trackingInfo.updates.map((update, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="flex-shrink-0 mt-1">
                <div className="p-2 rounded-full bg-green-100">
                  {getStatusIcon(update.status)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">{update.message}</p>
                  <p className="text-sm text-gray-500">
                    {update.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
                {update.location && (
                  <div className="flex items-center space-x-1 text-sm text-gray-600 mt-1">
                    <FaMapMarkerAlt />
                    <span>{update.location}</span>
                  </div>
                )}
                <p className="text-sm text-gray-500">
                  {update.timestamp.toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Map Placeholder */}
      {showMap && trackingInfo.status !== 'delivered' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Tracking</h3>
          <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <FaMapMarkerAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p>Live map tracking will be displayed here</p>
              <p className="text-sm">Integration with mapping service required</p>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Instructions */}
      {trackingInfo.status === 'out_for_delivery' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-yellow-800 mb-2">
            <FaExclamationTriangle />
            <span className="font-medium">Delivery Instructions</span>
          </div>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Please be available to receive your order</li>
            <li>• Have your order confirmation ready</li>
            <li>• Check perishable items immediately upon delivery</li>
            <li>• Contact us if there are any issues with your order</li>
          </ul>
        </div>
      )}

      {/* Delivery Complete */}
      {trackingInfo.status === 'delivered' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-green-800 mb-2">
            <FaCheckCircle />
            <span className="font-medium">Order Delivered Successfully!</span>
          </div>
          <p className="text-sm text-green-700">
            Your order has been delivered. We hope you enjoy your groceries!
          </p>
          <div className="mt-3 flex space-x-3">
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
              Rate Your Experience
            </button>
            <button className="bg-white text-green-600 border border-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors text-sm">
              Reorder Items
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryTracker;