import React, { useState, useEffect } from 'react';
import {
  FaShippingFast,
  FaCreditCard,
  FaCheck,
  FaEdit,
  FaSpinner,
  FaExclamationTriangle,
  FaLock,
  FaGift
} from 'react-icons/fa';
import PaymentForm from '../payment/PaymentForm';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { OrderService } from '../../services/orderService';
import { Address, CartItem, Order } from '../../types';
import SmartAddressInput from '../ui/SmartAddressInput';
import { addressValidationService, AddressValidationResult, ValidatedAddress } from '../../services/addressValidationService';

interface CheckoutStep {
  id: string;
  title: string;
  icon: React.ReactNode;
  completed: boolean;
}

const CheckoutForm: React.FC = () => {
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');

  // Shipping Information
  const [shippingAddress, setShippingAddress] = useState<Address>({
    street: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  });
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [deliveryTime, setDeliveryTime] = useState<'standard' | 'express' | 'scheduled'>('standard');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  // Shipping Options
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express' | 'overnight'>('standard');
  const [shippingCost, setShippingCost] = useState(0);

  // Promo Code
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');

  // Address Validation
  const [addressValidationResult, setAddressValidationResult] = useState<AddressValidationResult | null>(null);
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);
  const [addressValidationError, setAddressValidationError] = useState<string>('');
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const steps: CheckoutStep[] = [
    {
      id: 'shipping',
      title: 'Shipping Information',
      icon: <FaShippingFast />,
      completed: currentStep > 0
    },
    {
      id: 'payment',
      title: 'Payment',
      icon: <FaCreditCard />,
      completed: currentStep > 1
    },
    {
      id: 'confirmation',
      title: 'Confirmation',
      icon: <FaCheck />,
      completed: false
    }
  ];

  useEffect(() => {
    // Load user's default shipping address if available
    if (user?.addresses && user.addresses.length > 0) {
      const defaultAddress = user.addresses.find(addr => addr.isDefault) || user.addresses[0];
      setShippingAddress(defaultAddress);
    }
  }, [user]);

  useEffect(() => {
    // Calculate shipping cost based on method and items
    calculateShippingCost();
  }, [shippingMethod, items, shippingAddress]);

  const calculateShippingCost = () => {
    let cost = 0;
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    
    switch (shippingMethod) {
      case 'standard':
        cost = itemCount > 10 ? 0 : 5.99; // Free shipping over 10 items
        break;
      case 'express':
        cost = 12.99;
        break;
      case 'overnight':
        cost = 24.99;
        break;
    }
    
    setShippingCost(cost);
  };

  // Address validation handlers
  const handleAddressSelect = (validatedAddress: ValidatedAddress) => {
    setShippingAddress({
      street: validatedAddress.street,
      apartment: validatedAddress.apartment || '',
      city: validatedAddress.city,
      state: validatedAddress.state,
      zipCode: validatedAddress.zipCode,
      country: validatedAddress.country
    });
    setAddressValidationResult(null);
    setAddressValidationError('');
  };

  const handleGPSLocationFound = (address: ValidatedAddress) => {
    setShippingAddress({
      street: address.street,
      apartment: address.apartment || '',
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country
    });
    setAddressValidationError('');
  };

  const handleGPSLocationError = (error: string) => {
    setAddressValidationError(error);
  };

  const validateAddress = async () => {
    if (!shippingAddress.street || !shippingAddress.city || 
        !shippingAddress.state || !shippingAddress.zipCode) {
      return;
    }

    setIsValidatingAddress(true);
    setAddressValidationError('');

    try {
      const result = await addressValidationService.validateAddress(shippingAddress);
      setAddressValidationResult(result);
      
      // Show confirmation modal if there are validation issues or suggestions
      if (!result.isValid || (result.suggestions && result.suggestions.length > 0)) {
        setShowConfirmationModal(true);
      } else if (result.validatedAddress) {
        // Auto-update address if validation is successful and no issues
        setShippingAddress({
          ...shippingAddress,
          ...result.validatedAddress
        });
      }
    } catch (error) {
      console.error('Address validation error:', error);
      setAddressValidationError('Unable to validate address. Please check your input.');
    } finally {
      setIsValidatingAddress(false);
    }
  };

  const handleAddressSuggestionSelect = async (suggestion: any) => {
    if (suggestion.placeId) {
      try {
        const detailedAddress = await addressValidationService.getPlaceDetails(suggestion.placeId);
        if (detailedAddress) {
          handleAddressSelect(detailedAddress);
        }
      } catch (error) {
        console.error('Error getting place details:', error);
      }
    }
  };

  // Confirmation Modal Handlers
  const handleConfirmOriginalAddress = () => {
    setShowConfirmationModal(false);
    // Keep the original address as entered by user
  };

  const handleSelectSuggestion = (suggestion: ValidatedAddress) => {
    setShippingAddress({
      street: suggestion.street || shippingAddress.street,
      apartment: suggestion.apartment || shippingAddress.apartment,
      city: suggestion.city || shippingAddress.city,
      state: suggestion.state || shippingAddress.state,
      zipCode: suggestion.zipCode || shippingAddress.zipCode,
      country: suggestion.country || shippingAddress.country
    });
    setShowConfirmationModal(false);
    
    // Clear validation result since user selected a suggestion
    setAddressValidationResult(null);
  };

  const validateShippingInfo = (): boolean => {
    if (!shippingAddress.street || !shippingAddress.city || 
        !shippingAddress.state || !shippingAddress.zipCode) {
      setError('Please fill in all required shipping information');
      return false;
    }

    // Check if address validation failed
    if (addressValidationResult && !addressValidationResult.isValid) {
      setError('Please correct the address validation errors before proceeding');
      return false;
    }

    return true;
  };

  const handleNextStep = async () => {
    if (currentStep === 0) {
      if (!validateShippingInfo()) {
        return;
      }
      
      // Validate address before proceeding
      await validateAddress();
      
      // Check validation result after validation
      if (addressValidationResult && !addressValidationResult.isValid) {
        setError('Please correct the address validation errors before proceeding');
        return;
      }
    }
    
    setError('');
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const handlePreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;

    try {
      setPromoError('');
      // Mock promo code validation - replace with actual service call
      const validCodes = {
        'SAVE10': 0.1,
        'WELCOME20': 0.2,
        'FREESHIP': 0
      };

      if (validCodes[promoCode.toUpperCase() as keyof typeof validCodes] !== undefined) {
        const discount = validCodes[promoCode.toUpperCase() as keyof typeof validCodes];
        setPromoDiscount(discount);
        if (promoCode.toUpperCase() === 'FREESHIP') {
          setShippingCost(0);
        }
      } else {
        setPromoError('Invalid promo code');
      }
    } catch (error) {
      setPromoError('Failed to apply promo code');
    }
  };

  const createOrder = async (): Promise<string> => {
    const orderData = {
      userId: user?.id || '',
      items: items.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
        name: item.name
      })),
      shippingAddress,
      deliveryInstructions,
      deliveryTime,
      scheduledDate: deliveryTime === 'scheduled' ? scheduledDate : undefined,
      scheduledTime: deliveryTime === 'scheduled' ? scheduledTime : undefined,
      shippingMethod,
      shippingCost,
      subtotal: total,
      promoCode: promoCode || undefined,
      promoDiscount,
      total: (total + shippingCost) * (1 - promoDiscount),
      status: 'pending' as const
    };

    const order = await OrderService.createOrder(orderData);
    return order.id;
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      setLoading(true);
      
      // Update order with payment information
      await OrderService.updateOrderPayment(orderId, paymentIntentId, 'completed');
      
      // Clear cart
      clearCart();
      
      // Move to confirmation step
      setCurrentStep(2);
    } catch (error) {
      console.error('Error completing order:', error);
      setError('Failed to complete order. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentError = (error: string) => {
    setError(error);
  };

  const initializePayment = async () => {
    try {
      setLoading(true);
      setError('');
      
      const newOrderId = await createOrder();
      setOrderId(newOrderId);
      
      handleNextStep();
    } catch (error) {
      console.error('Error creating order:', error);
      setError('Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const subtotalWithDiscount = total * (1 - promoDiscount);
  const finalTotal = subtotalWithDiscount + shippingCost;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  index <= currentStep
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-300 text-gray-400'
                }`}
              >
                {step.completed ? <FaCheck /> : step.icon}
              </div>
              <div className="ml-3">
                <div
                  className={`text-sm font-medium ${
                    index <= currentStep ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  {step.title}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 h-0.5 mx-4 ${
                    index < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-800">
            <FaExclamationTriangle />
            <span className="font-medium">Error</span>
          </div>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Step 1: Shipping Information */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900">Shipping Information</h2>
              
              <div className="space-y-4">
                <SmartAddressInput
                  value={shippingAddress}
                  onChange={setShippingAddress}
                  onSaveAddress={handleAddressSelect}
                  enableGPS={true}
                  showMinimap={true}
                />
              </div>

              {/* Manual Address Validation Button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={validateAddress}
                  disabled={isValidatingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isValidatingAddress ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-2"></div>
                      Validating Address...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Validate Address
                    </>
                  )}
                </button>
              </div>

              {/* Delivery Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Instructions
                </label>
                <textarea
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any special instructions for delivery..."
                />
              </div>

              {/* Shipping Method */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Shipping Method</h3>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="standard"
                      checked={shippingMethod === 'standard'}
                      onChange={(e) => setShippingMethod(e.target.value as 'standard')}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium">Standard Delivery (5-7 business days)</div>
                      <div className="text-sm text-gray-500">
                        {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="express"
                      checked={shippingMethod === 'express'}
                      onChange={(e) => setShippingMethod(e.target.value as 'express')}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium">Express Delivery (2-3 business days)</div>
                      <div className="text-sm text-gray-500">$12.99</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="overnight"
                      checked={shippingMethod === 'overnight'}
                      onChange={(e) => setShippingMethod(e.target.value as 'overnight')}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium">Overnight Delivery</div>
                      <div className="text-sm text-gray-500">$24.99</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {currentStep === 1 && orderId && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900">Payment Information</h2>
              
              <PaymentForm
                amount={finalTotal}
                orderId={orderId}
                items={items.map(item => ({
                  id: item.id,
                  price: item.price,
                  quantity: item.quantity,
                  taxable: true
                }))}
                shippingAddress={shippingAddress}
                shippingCost={shippingCost}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
              />
            </div>
          )}

          {/* Step 3: Confirmation */}
          {currentStep === 2 && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <FaCheck className="w-8 h-8 text-green-600" />
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Order Confirmed!</h2>
                <p className="text-gray-600">
                  Thank you for your order. You'll receive a confirmation email shortly.
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Order ID</div>
                <div className="font-mono text-lg">{orderId}</div>
              </div>
              
              <div className="flex space-x-4 justify-center">
                <button
                  onClick={() => window.location.href = '/orders'}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Order
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-6 rounded-lg sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
            
            {/* Items */}
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code */}
            {currentStep < 2 && (
              <div className="mb-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Promo code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    onClick={applyPromoCode}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    Apply
                  </button>
                </div>
                {promoError && (
                  <p className="text-red-600 text-sm mt-1">{promoError}</p>
                )}
              </div>
            )}

            {/* Totals */}
            <div className="space-y-2 text-sm border-t pt-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              
              {promoDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({promoCode}):</span>
                  <span>-${(total * promoDiscount).toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
              </div>
              
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total:</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Navigation Buttons */}
            {currentStep < 2 && (
              <div className="mt-6 space-y-3">
                {currentStep === 0 ? (
                  <button
                    onClick={initializePayment}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <FaLock />
                        <span>Continue to Payment</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handlePreviousStep}
                    className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                  >
                    Back to Shipping
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;