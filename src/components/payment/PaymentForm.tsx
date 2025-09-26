import React, { useState, useEffect } from 'react';
import {
  Elements,
  CardElement,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import {
  FaCreditCard,
  FaPaypal,
  FaApplePay,
  FaGooglePay,
  FaLock,
  FaShieldAlt,
  FaSpinner,
  FaCheck,
  FaExclamationTriangle
} from 'react-icons/fa';
import { PaymentService } from '../../services/paymentService';
import { useAuth } from '../../context/AuthContext';
import { Address, PaymentMethod, TaxCalculation } from '../../types';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '');

interface PaymentFormProps {
  amount: number;
  orderId: string;
  items: Array<{ id: string; price: number; quantity: number; taxable: boolean }>;
  shippingAddress: Address;
  shippingCost: number;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
}

interface PaymentFormInnerProps extends PaymentFormProps {
  clientSecret: string;
  taxCalculation: TaxCalculation;
}

const PaymentFormInner: React.FC<PaymentFormInnerProps> = ({
  amount,
  orderId,
  shippingAddress,
  clientSecret,
  taxCalculation,
  onPaymentSuccess,
  onPaymentError
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user, userProfile } = useAuth();
  
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'apple_pay' | 'google_pay' | 'net_terms'>('card');
  const [savePaymentMethod, setSavePaymentMethod] = useState(false);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [useNewPaymentMethod, setUseNewPaymentMethod] = useState(true);
  const [selectedSavedMethod, setSelectedSavedMethod] = useState('');
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedNetTerms, setSelectedNetTerms] = useState<'net_30' | 'net_60'>('net_30');
  const [selectedSavedMethod, setSelectedSavedMethod] = useState<string>('');
  const [useNewPaymentMethod, setUseNewPaymentMethod] = useState(true);

  useEffect(() => {
    if (user?.stripeCustomerId) {
      loadSavedPaymentMethods();
    }
  }, [user]);

  useEffect(() => {
    if (sameAsShipping) {
      setBillingAddress(shippingAddress);
    }
  }, [sameAsShipping, shippingAddress]);

  const loadSavedPaymentMethods = async () => {
    try {
      if (user?.stripeCustomerId) {
        const methods = await PaymentService.getPaymentMethods(user.stripeCustomerId);
        setSavedPaymentMethods(methods);
        if (methods.length > 0 && methods[0].isDefault) {
          setSelectedSavedMethod(methods[0].id);
          setUseNewPaymentMethod(false);
        }
      }
    } catch (error) {
      console.error('Error loading saved payment methods:', error);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      let result;

      // Handle net payment terms for business accounts
      if (paymentMethod === 'net_terms' && userProfile?.accountType === 'business') {
        // For net payment terms, we create the order without immediate payment
        // The payment will be processed later according to the terms
        result = {
          success: true,
          paymentIntent: {
            id: `net_terms_${orderId}_${selectedNetTerms}`,
            status: 'requires_payment_method'
          }
        };
        
        // Log the net terms order for business processing
        console.log(`Net payment terms order created: ${orderId}, Terms: ${selectedNetTerms}`);
      } else if (useNewPaymentMethod) {
        // Process with new payment method
        result = await PaymentService.processPayment(
          elements,
          clientSecret,
          {
            email: user?.email || '',
            name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || '',
            address: billingAddress,
            phone: user?.phone
          }
        );
      } else {
        // Process with saved payment method
        result = await stripe.confirmPayment({
          clientSecret,
          confirmParams: {
            payment_method: selectedSavedMethod,
            return_url: `${window.location.origin}/order-confirmation`,
          },
          redirect: 'if_required',
        });

        if (result.error) {
          result = { success: false, error: result.error.message };
        } else {
          result = { success: true, paymentIntent: result.paymentIntent };
        }
      }

      if (result.success) {
        // Save payment method if requested (not applicable for net terms)
        if (savePaymentMethod && useNewPaymentMethod && user?.stripeCustomerId && paymentMethod !== 'net_terms') {
          try {
            const paymentMethodId = result.paymentIntent?.payment_method;
            if (paymentMethodId) {
              await PaymentService.savePaymentMethod(
                paymentMethodId,
                user.stripeCustomerId,
                savedPaymentMethods.length === 0
              );
            }
          } catch (error) {
            console.error('Error saving payment method:', error);
          }
        }

        onPaymentSuccess(result.paymentIntent?.id || '');
      } else {
        onPaymentError(result.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      onPaymentError('An unexpected error occurred');
    } finally {
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Order Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${taxCalculation.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping:</span>
            <span>${taxCalculation.shippingCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax:</span>
            <span>${taxCalculation.taxAmount.toFixed(2)}</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-semibold">
            <span>Total:</span>
            <span>${taxCalculation.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Saved Payment Methods */}
      {savedPaymentMethods.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Payment Method</h3>
          
          <div className="space-y-3">
            {savedPaymentMethods.map((method) => (
              <label
                key={method.id}
                className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={selectedSavedMethod === method.id && !useNewPaymentMethod}
                  onChange={() => {
                    setSelectedSavedMethod(method.id);
                    setUseNewPaymentMethod(false);
                  }}
                  className="mr-3"
                />
                <FaCreditCard className="mr-3 text-gray-400" />
                <div className="flex-1">
                  <div className="font-medium">{method.brand?.toUpperCase()} ending in {method.last4}</div>
                  <div className="text-sm text-gray-500">Expires {method.expMonth}/{method.expYear}</div>
                </div>
                {method.isDefault && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Default</span>
                )}
              </label>
            ))}
            
            <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="paymentMethod"
                value="new"
                checked={useNewPaymentMethod}
                onChange={() => setUseNewPaymentMethod(true)}
                className="mr-3"
              />
              <FaPlus className="mr-3 text-gray-400" />
              <span>Use a new payment method</span>
            </label>
          </div>
        </div>
      )}

      {/* New Payment Method */}
      {useNewPaymentMethod && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">
            {savedPaymentMethods.length > 0 ? 'New Payment Method' : 'Payment Method'}
          </h3>

          {/* Payment Method Selection */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`p-3 border rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                paymentMethod === 'card'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <FaCreditCard className="text-xl" />
              <span className="text-sm font-medium">Card</span>
            </button>
            
            <button
              type="button"
              onClick={() => setPaymentMethod('paypal')}
              className={`p-3 border rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                paymentMethod === 'paypal'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <FaPaypal className="text-xl" />
              <span className="text-sm font-medium">PayPal</span>
            </button>
            
            <button
              type="button"
              onClick={() => setPaymentMethod('apple_pay')}
              className={`p-3 border rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                paymentMethod === 'apple_pay'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <FaApplePay className="text-xl" />
              <span className="text-sm font-medium">Apple Pay</span>
            </button>
            
            <button
              type="button"
              onClick={() => setPaymentMethod('google_pay')}
              className={`p-3 border rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                paymentMethod === 'google_pay'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <FaGooglePay className="text-xl" />
              <span className="text-sm font-medium">Google Pay</span>
            </button>
          </div>

          {/* Business Net Payment Terms - Only show for business accounts */}
          {userProfile?.accountType === 'business' && userProfile.businessProfile?.paymentTerms && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('net_terms')}
                className={`w-full p-4 border rounded-lg flex items-center space-x-3 transition-colors ${
                  paymentMethod === 'net_terms'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <FaLock className="text-xl" />
                <div className="flex-1 text-left">
                  <div className="font-medium">Net Payment Terms</div>
                  <div className="text-sm text-gray-500">Pay according to your business terms</div>
                </div>
              </button>
              
              {paymentMethod === 'net_terms' && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Select Payment Terms</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="netTerms"
                        value="net_30"
                        checked={selectedNetTerms === 'net_30'}
                        onChange={(e) => setSelectedNetTerms(e.target.value as 'net_30' | 'net_60')}
                        className="mr-2"
                      />
                      <span>Net 30 - Payment due in 30 days</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="netTerms"
                        value="net_60"
                        checked={selectedNetTerms === 'net_60'}
                        onChange={(e) => setSelectedNetTerms(e.target.value as 'net_30' | 'net_60')}
                        className="mr-2"
                      />
                      <span>Net 60 - Payment due in 60 days</span>
                    </label>
                  </div>
                  <div className="mt-2 text-xs text-gray-600">
                    Invoice will be sent to your business email. Late payment fees may apply.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Payment Element */}
          {paymentMethod !== 'net_terms' && (
            <div className="p-4 border border-gray-300 rounded-lg">
              {paymentMethod === 'card' ? (
                <CardElement options={cardElementOptions} />
              ) : (
                <PaymentElement />
              )}
            </div>
          )}

          {/* Save Payment Method */}
          {user && paymentMethod !== 'net_terms' && (
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={savePaymentMethod}
                onChange={(e) => setSavePaymentMethod(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Save this payment method for future purchases</span>
            </label>
          )}
        </div>
      )}

      {/* Billing Address */}
      {useNewPaymentMethod && paymentMethod !== 'net_terms' && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Billing Address</h3>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={sameAsShipping}
              onChange={(e) => setSameAsShipping(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Same as shipping address</span>
          </label>

          {!sameAsShipping && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={billingAddress.street}
                  onChange={(e) => setBillingAddress({ ...billingAddress, street: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoComplete="billing street-address"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apartment/Suite
                </label>
                <input
                  type="text"
                  value={billingAddress.apartment || ''}
                  onChange={(e) => setBillingAddress({ ...billingAddress, apartment: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoComplete="billing address-line2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={billingAddress.city}
                  onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoComplete="billing address-level2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={billingAddress.state}
                  onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoComplete="billing address-level1"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={billingAddress.zipCode}
                  onChange={(e) => setBillingAddress({ ...billingAddress, zipCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoComplete="billing postal-code"
                  required
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Security Notice */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-green-800">
          <FaShieldAlt />
          <span className="font-medium">Secure Payment</span>
        </div>
        <p className="text-sm text-green-700 mt-1">
          Your payment information is encrypted and secure. We never store your card details.
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
      >
        {processing ? (
          <>
            <FaSpinner className="animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <FaLock />
            <span>
              {paymentMethod === 'net_terms' 
                ? `Place Order - ${selectedNetTerms.toUpperCase()} Terms` 
                : `Complete Payment - $${taxCalculation.total.toFixed(2)}`
              }
            </span>
          </>
        )}
      </button>
    </form>
  );
};

const PaymentForm: React.FC<PaymentFormProps> = (props) => {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [taxCalculation, setTaxCalculation] = useState<TaxCalculation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    initializePayment();
  }, [props.amount, props.orderId, props.items, props.shippingAddress, props.shippingCost]);

  const initializePayment = async () => {
    try {
      setLoading(true);
      setError('');

      // Calculate tax
      const tax = await PaymentService.calculateTax(
        props.items,
        props.shippingAddress,
        props.shippingCost
      );
      setTaxCalculation(tax);

      // Create payment intent
      const { clientSecret } = await PaymentService.createPaymentIntent(
        tax.total,
        'usd',
        props.orderId
      );
      setClientSecret(clientSecret);
    } catch (error) {
      console.error('Error initializing payment:', error);
      setError('Failed to initialize payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-red-800">
          <FaExclamationTriangle />
          <span className="font-medium">Payment Error</span>
        </div>
        <p className="text-sm text-red-700 mt-1">{error}</p>
        <button
          onClick={initializePayment}
          className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!clientSecret || !taxCalculation) {
    return null;
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentFormInner
        {...props}
        clientSecret={clientSecret}
        taxCalculation={taxCalculation}
      />
    </Elements>
  );
};

export default PaymentForm;