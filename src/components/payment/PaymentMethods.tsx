import React, { useState, useEffect } from 'react';
import {
  FaCreditCard,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheck,
  FaStar,
  FaSpinner,
  FaExclamationTriangle
} from 'react-icons/fa';
import { PaymentService } from '../../services/paymentService';
import { useAuth } from '../../context/AuthContext';
import { PaymentMethod } from '../../types';

interface PaymentMethodsProps {
  onPaymentMethodSelect?: (paymentMethodId: string) => void;
  selectionMode?: boolean;
  selectedMethodId?: string;
}

const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  onPaymentMethodSelect,
  selectionMode = false,
  selectedMethodId
}) => {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [deletingId, setDeletingId] = useState<string>('');
  const [settingDefaultId, setSettingDefaultId] = useState<string>('');

  useEffect(() => {
    if (user?.stripeCustomerId) {
      loadPaymentMethods();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (user?.stripeCustomerId) {
        const methods = await PaymentService.getPaymentMethods(user.stripeCustomerId);
        setPaymentMethods(methods);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
      setError('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) {
      return;
    }

    try {
      setDeletingId(paymentMethodId);
      await PaymentService.deletePaymentMethod(paymentMethodId);
      setPaymentMethods(methods => methods.filter(method => method.id !== paymentMethodId));
    } catch (error) {
      console.error('Error deleting payment method:', error);
      setError('Failed to delete payment method');
    } finally {
      setDeletingId('');
    }
  };

  const handleSetDefaultPaymentMethod = async (paymentMethodId: string) => {
    if (!user?.stripeCustomerId) return;

    try {
      setSettingDefaultId(paymentMethodId);
      await PaymentService.setDefaultPaymentMethod(user.stripeCustomerId, paymentMethodId);
      
      // Update local state
      setPaymentMethods(methods =>
        methods.map(method => ({
          ...method,
          isDefault: method.id === paymentMethodId
        }))
      );
    } catch (error) {
      console.error('Error setting default payment method:', error);
      setError('Failed to set default payment method');
    } finally {
      setSettingDefaultId('');
    }
  };

  const getCardIcon = (brand: string) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'amex':
        return '💳';
      case 'discover':
        return '💳';
      default:
        return '💳';
    }
  };

  const getCardColor = (brand: string) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return 'bg-blue-500';
      case 'mastercard':
        return 'bg-red-500';
      case 'amex':
        return 'bg-green-500';
      case 'discover':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
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
          <span className="font-medium">Error</span>
        </div>
        <p className="text-sm text-red-700 mt-1">{error}</p>
        <button
          onClick={loadPaymentMethods}
          className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!selectionMode && (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Payment Methods</h2>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <FaPlus />
            <span>Add New</span>
          </button>
        </div>
      )}

      {paymentMethods.length === 0 ? (
        <div className="text-center py-8">
          <FaCreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No payment methods</h3>
          <p className="text-gray-500 mb-4">Add a payment method to make purchases easier</p>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto">
            <FaPlus />
            <span>Add Payment Method</span>
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`border rounded-lg p-4 transition-all ${
                selectionMode
                  ? selectedMethodId === method.id
                    ? 'border-blue-500 bg-blue-50 cursor-pointer'
                    : 'border-gray-300 hover:border-gray-400 cursor-pointer'
                  : 'border-gray-300'
              }`}
              onClick={() => selectionMode && onPaymentMethodSelect?.(method.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {selectionMode && (
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={selectedMethodId === method.id}
                      onChange={() => onPaymentMethodSelect?.(method.id)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                  )}
                  
                  <div className={`w-12 h-8 rounded flex items-center justify-center text-white ${getCardColor(method.brand || '')}`}>
                    <span className="text-xs font-bold">{method.brand?.toUpperCase()}</span>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {method.brand?.toUpperCase()} ending in {method.last4}
                      </span>
                      {method.isDefault && (
                        <div className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          <FaStar className="w-3 h-3" />
                          <span>Default</span>
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      Expires {method.expMonth?.toString().padStart(2, '0')}/{method.expYear}
                    </div>
                  </div>
                </div>

                {!selectionMode && (
                  <div className="flex items-center space-x-2">
                    {!method.isDefault && (
                      <button
                        onClick={() => handleSetDefaultPaymentMethod(method.id)}
                        disabled={settingDefaultId === method.id}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
                        title="Set as default"
                      >
                        {settingDefaultId === method.id ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaStar />
                        )}
                      </button>
                    )}
                    
                    <button
                      className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      title="Edit payment method"
                    >
                      <FaEdit />
                    </button>
                    
                    <button
                      onClick={() => handleDeletePaymentMethod(method.id)}
                      disabled={deletingId === method.id}
                      className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                      title="Delete payment method"
                    >
                      {deletingId === method.id ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaTrash />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {selectionMode && selectedMethodId === method.id && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <div className="flex items-center space-x-2 text-blue-700">
                    <FaCheck className="w-4 h-4" />
                    <span className="text-sm font-medium">Selected payment method</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectionMode && paymentMethods.length > 0 && (
        <div className="border-t pt-4">
          <button
            onClick={() => onPaymentMethodSelect?.('new')}
            className={`w-full p-4 border-2 border-dashed rounded-lg transition-colors flex items-center justify-center space-x-2 ${
              selectedMethodId === 'new'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <FaPlus />
            <span>Use a new payment method</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentMethods;