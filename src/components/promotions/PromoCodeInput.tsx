import React, { useState } from 'react';
import { FiTag, FiCheck, FiX, FiLoader } from 'react-icons/fi';
import { promoService } from '../../services/promoService';
import Button from '../ui/Button';

interface PromoCodeInputProps {
  orderAmount: number;
  cartItems: any[];
  userId: string;
  onPromoApplied: (discount: number, promoCode: string) => void;
  onPromoRemoved: () => void;
  appliedPromo?: {
    code: string;
    discount: number;
  };
  className?: string;
}

const PromoCodeInput: React.FC<PromoCodeInputProps> = ({
  orderAmount,
  cartItems,
  userId,
  onPromoApplied,
  onPromoRemoved,
  appliedPromo,
  className = ''
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setError('Please enter a promo code');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const validation = await promoService.validatePromoCode(
        promoCode.trim(),
        userId,
        orderAmount,
        cartItems
      );

      if (validation.valid) {
        onPromoApplied(validation.discount, promoCode.trim().toUpperCase());
        setSuccess(validation.message);
        setPromoCode('');
      } else {
        setError(validation.message);
      }
    } catch (err) {
      console.error('Error applying promo code:', err);
      setError('Failed to apply promo code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePromo = () => {
    onPromoRemoved();
    setError(null);
    setSuccess(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApplyPromo();
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <FiTag className="w-4 h-4 text-gray-500" />
        <h3 className="text-sm font-medium text-gray-900">Promo Code</h3>
      </div>

      {appliedPromo ? (
        // Applied promo display
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center gap-2">
            <FiCheck className="w-4 h-4 text-green-600" />
            <div>
              <div className="text-sm font-medium text-green-800">
                {appliedPromo.code}
              </div>
              <div className="text-xs text-green-600">
                Discount: ${appliedPromo.discount.toFixed(2)}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemovePromo}
            className="text-green-600 hover:text-green-700 hover:bg-green-100"
          >
            <FiX className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        // Promo code input
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                placeholder="Enter promo code"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
            <Button
              onClick={handleApplyPromo}
              disabled={loading || !promoCode.trim()}
              size="sm"
              className="px-4"
            >
              {loading ? (
                <FiLoader className="w-4 h-4 animate-spin" />
              ) : (
                'Apply'
              )}
            </Button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md">
              <FiX className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md">
              <FiCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}
        </div>
      )}

      {/* Popular promo codes hint */}
      {!appliedPromo && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">Popular codes:</p>
          <div className="flex flex-wrap gap-2">
            {['WELCOME10', 'SAVE20', 'FREESHIP'].map((code) => (
              <button
                key={code}
                onClick={() => setPromoCode(code)}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                {code}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Terms */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Promo codes cannot be combined with other offers. 
          See <button className="text-blue-600 hover:underline">terms and conditions</button> for details.
        </p>
      </div>
    </div>
  );
};

export default PromoCodeInput;