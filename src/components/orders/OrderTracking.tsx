import React from 'react';
import { CheckCircle, Clock, Package, Truck, MapPin } from 'lucide-react';
import type { Order, OrderStatus, OrderTracking as OrderTrackingType } from '../../types';

interface OrderTrackingProps {
  order: Order;
  tracking?: OrderTrackingType;
}

export const OrderTracking: React.FC<OrderTrackingProps> = ({ order, tracking }) => {
  const trackingSteps = [
    {
      status: 'confirmed' as OrderStatus,
      title: 'Order Confirmed',
      description: 'Your order has been confirmed and is being prepared',
      icon: CheckCircle
    },
    {
      status: 'processing' as OrderStatus,
      title: 'Processing',
      description: 'Your items are being picked and prepared',
      icon: Package
    },
    {
      status: 'packed' as OrderStatus,
      title: 'Packed',
      description: 'Your order has been packed and is ready for shipping',
      icon: Package
    },
    {
      status: 'shipped' as OrderStatus,
      title: 'Shipped',
      description: 'Your order is on its way to you',
      icon: Truck
    },
    {
      status: 'delivered' as OrderStatus,
      title: 'Delivered',
      description: 'Your order has been delivered successfully',
      icon: MapPin
    }
  ];

  const getStepStatus = (stepStatus: OrderStatus) => {
    const currentStepIndex = trackingSteps.findIndex(step => step.status === order.status);
    const stepIndex = trackingSteps.findIndex(step => step.status === stepStatus);
    
    if (stepIndex <= currentStepIndex) {
      return 'completed';
    } else if (stepIndex === currentStepIndex + 1) {
      return 'current';
    } else {
      return 'upcoming';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusDate = (status: OrderStatus) => {
    if (status === 'confirmed') return order.createdAt;
    if (tracking?.statusHistory) {
      const statusEntry = tracking.statusHistory.find(entry => entry.status === status);
      return statusEntry?.timestamp;
    }
    return undefined;
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Order Tracking
        </h2>
        <p className="text-gray-600">
          Order #{order.orderNumber} • Estimated delivery: {order.estimatedDelivery ? formatDate(order.estimatedDelivery) : 'TBD'}
        </p>
      </div>

      {/* Tracking Steps */}
      <div className="space-y-6">
        {trackingSteps.map((step, index) => {
          const stepStatus = getStepStatus(step.status);
          const statusDate = getStatusDate(step.status);
          const Icon = step.icon;

          return (
            <div key={step.status} className="relative">
              {/* Connector Line */}
              {index < trackingSteps.length - 1 && (
                <div
                  className={`absolute left-6 top-12 w-0.5 h-6 ${
                    stepStatus === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              )}

              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                    stepStatus === 'completed'
                      ? 'bg-green-500 text-white'
                      : stepStatus === 'current'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {stepStatus === 'completed' ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : stepStatus === 'current' ? (
                    <Clock className="h-6 w-6" />
                  ) : (
                    <Icon className="h-6 w-6" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3
                      className={`text-lg font-semibold ${
                        stepStatus === 'completed' || stepStatus === 'current'
                          ? 'text-gray-900'
                          : 'text-gray-500'
                      }`}
                    >
                      {step.title}
                    </h3>
                    {statusDate && (
                      <span className="text-sm text-gray-600">
                        {formatDate(statusDate)}
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-sm mt-1 ${
                      stepStatus === 'completed' || stepStatus === 'current'
                        ? 'text-gray-600'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.description}
                  </p>

                  {/* Additional tracking info for current step */}
                  {stepStatus === 'current' && tracking?.currentLocation && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                          Current Location
                        </span>
                      </div>
                      <p className="text-sm text-blue-700 mt-1">
                        {tracking.currentLocation}
                      </p>
                      {tracking.estimatedDelivery && (
                        <p className="text-sm text-blue-600 mt-1">
                          Estimated delivery: {formatDate(tracking.estimatedDelivery)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Carrier Information */}
      {tracking?.carrier && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Shipping Information</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <p><span className="font-medium">Carrier:</span> {tracking.carrier}</p>
            {tracking.trackingNumber && (
              <p><span className="font-medium">Tracking Number:</span> {tracking.trackingNumber}</p>
            )}
            {tracking.carrierUrl && (
              <a
                href={tracking.carrierUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 text-blue-600 hover:text-blue-500"
              >
                Track on carrier website →
              </a>
            )}
          </div>
        </div>
      )}

      {/* Delivery Instructions */}
      {order.deliveryInstructions && (
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-medium text-yellow-900 mb-2">Delivery Instructions</h4>
          <p className="text-sm text-yellow-800">{order.deliveryInstructions}</p>
        </div>
      )}
    </div>
  );
};