import React, { useState, useEffect } from 'react';
import {
  FaTruck,
  FaClock,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSnowflake,
  FaLeaf,
  FaInfoCircle,
  FaEdit
} from 'react-icons/fa';
import { DeliveryService } from '../../services/deliveryService';
import { CartItem, DeliverySlot, ShippingOption, DeliverySchedule, Address } from '../../types';

interface DeliverySchedulerProps {
  items: CartItem[];
  deliveryAddress: Address;
  onScheduleSelect: (schedule: DeliverySchedule, shippingOption: ShippingOption, fee: number) => void;
  onAddressChange?: () => void;
}

const DeliveryScheduler: React.FC<DeliverySchedulerProps> = ({
  items,
  deliveryAddress,
  onScheduleSelect,
  onAddressChange
}) => {
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShippingOption, setSelectedShippingOption] = useState<ShippingOption | null>(null);
  const [availableSlots, setAvailableSlots] = useState<DeliverySlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<DeliverySlot | null>(null);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [contactlessDelivery, setContactlessDelivery] = useState(false);
  const [requiresSignature, setRequiresSignature] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [deliveryInstructions, setDeliveryInstructions] = useState<string[]>([]);

  useEffect(() => {
    loadDeliveryOptions();
  }, [deliveryAddress.zipCode, items]);

  useEffect(() => {
    if (selectedShippingOption) {
      loadDeliverySlots();
      calculateDeliveryFee();
    }
  }, [selectedShippingOption, items]);

  const loadDeliveryOptions = async () => {
    try {
      setLoading(true);
      setError('');

      // Check if delivery is available
      const isAvailable = await DeliveryService.isDeliveryAvailable(deliveryAddress.zipCode);
      if (!isAvailable) {
        setError('Delivery is not available to this location');
        return;
      }

      // Load shipping options
      const options = await DeliveryService.getShippingOptions(deliveryAddress.zipCode);
      setShippingOptions(options);
      
      // Select default option
      const defaultOption = options.find(opt => opt.isDefault) || options[0];
      setSelectedShippingOption(defaultOption);

      // Load delivery instructions
      const instructions = await DeliveryService.getDeliveryInstructions(items);
      setDeliveryInstructions(instructions);

    } catch (error) {
      console.error('Error loading delivery options:', error);
      setError('Failed to load delivery options');
    } finally {
      setLoading(false);
    }
  };

  const loadDeliverySlots = async () => {
    if (!selectedShippingOption) return;

    try {
      const zone = await DeliveryService.getDeliveryZone(deliveryAddress.zipCode);
      if (!zone) return;

      const hasPerishables = items.some(item => 
        item.product.category === 'fresh-produce' || 
        item.product.category === 'dairy' ||
        item.product.category === 'frozen'
      );

      const slots = await DeliveryService.getAvailableDeliverySlots(
        zone.id,
        selectedShippingOption.id,
        hasPerishables
      );

      setAvailableSlots(slots);
      
      // Auto-select first available slot for scheduled delivery
      if (selectedShippingOption.requiresScheduling && slots.length > 0) {
        setSelectedSlot(slots[0]);
      } else {
        setSelectedSlot(null);
      }
    } catch (error) {
      console.error('Error loading delivery slots:', error);
    }
  };

  const calculateDeliveryFee = async () => {
    if (!selectedShippingOption) return;

    try {
      const calculation = await DeliveryService.calculateDeliveryFee(
        items,
        deliveryAddress.zipCode,
        selectedShippingOption.id
      );
      setDeliveryFee(calculation.total);
    } catch (error) {
      console.error('Error calculating delivery fee:', error);
    }
  };

  const handleShippingOptionChange = (option: ShippingOption) => {
    setSelectedShippingOption(option);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: DeliverySlot) => {
    setSelectedSlot(slot);
  };

  const handleScheduleConfirm = () => {
    if (!selectedShippingOption) return;

    const schedule: DeliverySchedule = {
      deliveryDate: selectedSlot?.startTime || new Date(),
      timeSlot: selectedSlot || {
        id: 'immediate',
        startTime: new Date(),
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        isAvailable: true,
        capacity: 1,
        booked: 0,
        price: 0,
        perishableCompatible: true
      },
      specialInstructions,
      contactlessDelivery,
      requiresSignature
    };

    onScheduleSelect(schedule, selectedShippingOption, deliveryFee);
  };

  const getItemCategoryIcon = (category: string) => {
    switch (category) {
      case 'frozen':
        return <FaSnowflake className="text-blue-500" />;
      case 'fresh-produce':
      case 'dairy':
        return <FaLeaf className="text-green-500" />;
      default:
        return null;
    }
  };

  const formatTimeSlot = (slot: DeliverySlot) => {
    const start = slot.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const end = slot.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${start} - ${end}`;
  };

  const groupSlotsByDate = (slots: DeliverySlot[]) => {
    const grouped: { [key: string]: DeliverySlot[] } = {};
    
    slots.forEach(slot => {
      const dateKey = slot.startTime.toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(slot);
    });

    return grouped;
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
          <span className="font-medium">Delivery Error</span>
        </div>
        <p className="text-sm text-red-700 mt-1">{error}</p>
        {onAddressChange && (
          <button
            onClick={onAddressChange}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Change Address
          </button>
        )}
      </div>
    );
  }

  const groupedSlots = groupSlotsByDate(availableSlots);
  const canConfirm = selectedShippingOption && (!selectedShippingOption.requiresScheduling || selectedSlot);

  return (
    <div className="space-y-6">
      {/* Delivery Address */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FaMapMarkerAlt className="text-blue-600" />
            <div>
              <h3 className="font-medium text-gray-900">Delivery Address</h3>
              <p className="text-sm text-gray-600">
                {deliveryAddress.street}, {deliveryAddress.city}, {deliveryAddress.state} {deliveryAddress.zipCode}
              </p>
            </div>
          </div>
          {onAddressChange && (
            <button
              onClick={onAddressChange}
              className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <FaEdit />
              <span>Change</span>
            </button>
          )}
        </div>
      </div>

      {/* Delivery Instructions */}
      {deliveryInstructions.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-yellow-800 mb-2">
            <FaInfoCircle />
            <span className="font-medium">Special Handling Required</span>
          </div>
          <ul className="text-sm text-yellow-700 space-y-1">
            {deliveryInstructions.map((instruction, index) => (
              <li key={index} className="flex items-center space-x-2">
                <span>•</span>
                <span>{instruction}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Perishable Items Alert */}
      {items.some(item => 
        item.product.category === 'fresh-produce' || 
        item.product.category === 'dairy' ||
        item.product.category === 'frozen'
      ) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-blue-800 mb-2">
            <FaSnowflake />
            <span className="font-medium">Perishable Items Detected</span>
          </div>
          <div className="text-sm text-blue-700">
            <p>Your order contains perishable items that require special handling:</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {items
                .filter(item => 
                  item.product.category === 'fresh-produce' || 
                  item.product.category === 'dairy' ||
                  item.product.category === 'frozen'
                )
                .map(item => (
                  <div key={item.product.id} className="flex items-center space-x-1 bg-blue-100 px-2 py-1 rounded">
                    {getItemCategoryIcon(item.product.category)}
                    <span className="text-xs">{item.product.name}</span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}

      {/* Shipping Options */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Options</h3>
        <div className="space-y-3">
          {shippingOptions.map((option) => (
            <div
              key={option.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedShippingOption?.id === option.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleShippingOptionChange(option)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    checked={selectedShippingOption?.id === option.id}
                    onChange={() => handleShippingOptionChange(option)}
                    className="text-blue-600"
                  />
                  <FaTruck className="text-gray-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">{option.name}</h4>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    {option.basePrice > 0 ? `+$${option.basePrice.toFixed(2)}` : 'Free'}
                  </div>
                  <div className="text-sm text-gray-500">{option.estimatedTime}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Slots */}
      {selectedShippingOption?.requiresScheduling && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Delivery Time</h3>
          
          {Object.keys(groupedSlots).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p>No delivery slots available</p>
              <p className="text-sm">Please try a different delivery option</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedSlots).map(([date, slots]) => (
                <div key={date}>
                  <h4 className="font-medium text-gray-900 mb-2">
                    {new Date(date).toLocaleDateString([], { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {slots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => handleSlotSelect(slot)}
                        disabled={!slot.isAvailable}
                        className={`p-3 rounded-lg border text-sm transition-colors ${
                          selectedSlot?.id === slot.id
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : slot.isAvailable
                            ? 'border-gray-200 hover:border-gray-300 text-gray-700'
                            : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <FaClock />
                          <span>{formatTimeSlot(slot)}</span>
                        </div>
                        {slot.price > 0 && (
                          <div className="text-xs mt-1">+${slot.price.toFixed(2)}</div>
                        )}
                        <div className="text-xs mt-1 text-gray-500">
                          {slot.capacity - slot.booked} slots left
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delivery Preferences */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="contactless"
              checked={contactlessDelivery}
              onChange={(e) => setContactlessDelivery(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="contactless" className="text-sm text-gray-700">
              Contactless delivery (leave at door)
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="signature"
              checked={requiresSignature}
              onChange={(e) => setRequiresSignature(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="signature" className="text-sm text-gray-700">
              Require signature on delivery
            </label>
          </div>

          <div>
            <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">
              Special Instructions
            </label>
            <textarea
              id="instructions"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g., Ring doorbell, Leave with concierge, etc."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Delivery Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-3">Delivery Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Delivery Option:</span>
            <span>{selectedShippingOption?.name}</span>
          </div>
          {selectedSlot && (
            <div className="flex justify-between">
              <span>Delivery Time:</span>
              <span>
                {selectedSlot.startTime.toLocaleDateString()} {formatTimeSlot(selectedSlot)}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Delivery Fee:</span>
            <span>${deliveryFee.toFixed(2)}</span>
          </div>
          {contactlessDelivery && (
            <div className="flex justify-between text-blue-600">
              <span>Contactless Delivery:</span>
              <FaCheckCircle />
            </div>
          )}
        </div>
      </div>

      {/* Confirm Button */}
      <button
        onClick={handleScheduleConfirm}
        disabled={!canConfirm}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          canConfirm
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {selectedShippingOption?.requiresScheduling && !selectedSlot
          ? 'Select a delivery time'
          : 'Confirm Delivery Schedule'
        }
      </button>
    </div>
  );
};

export default DeliveryScheduler;