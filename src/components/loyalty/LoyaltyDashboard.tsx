import React, { useState, useEffect } from 'react';
import { 
  FiStar, 
  FiGift, 
  FiTrendingUp, 
  FiAward, 
  FiClock, 
  FiShoppingBag,
  FiLoader,
  FiChevronRight
} from 'react-icons/fi';
import { promoService, UserLoyalty, PointsTransaction } from '../../services/promoService';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

interface LoyaltyDashboardProps {
  className?: string;
}

const LoyaltyDashboard: React.FC<LoyaltyDashboardProps> = ({
  className = ''
}) => {
  const { user } = useAuth();
  const [loyaltyData, setLoyaltyData] = useState<UserLoyalty | null>(null);
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadLoyaltyData();
    }
  }, [user]);

  const loadLoyaltyData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const loyalty = await promoService.getUserLoyalty(user.uid);
      setLoyaltyData(loyalty);
      
      // In a real implementation, you would have a method to get user transactions
      // For now, we'll simulate some data
      setTransactions([]);
    } catch (err) {
      console.error('Error loading loyalty data:', err);
      setError('Failed to load loyalty information');
    } finally {
      setLoading(false);
    }
  };

  const getTierInfo = (tier: string) => {
    const tiers = {
      Bronze: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', next: 'Silver', nextPoints: 500 },
      Silver: { color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200', next: 'Gold', nextPoints: 1000 },
      Gold: { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', next: 'Platinum', nextPoints: 2500 },
      Platinum: { color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', next: null, nextPoints: 0 }
    };
    return tiers[tier as keyof typeof tiers] || tiers.Bronze;
  };

  const getTierBenefits = (tier: string) => {
    const benefits = {
      Bronze: ['1 point per $1 spent', 'Birthday bonus: 50 points'],
      Silver: ['1.2 points per $1 spent', 'Free shipping on orders $50+', 'Birthday bonus: 100 points'],
      Gold: ['1.5 points per $1 spent', 'Free shipping on all orders', 'Early access to sales', 'Birthday bonus: 200 points'],
      Platinum: ['2 points per $1 spent', 'Free shipping on all orders', 'Early access to sales', 'Exclusive products', 'Birthday bonus: 500 points', 'Personal shopper']
    };
    return benefits[tier as keyof typeof benefits] || benefits.Bronze;
  };

  const getProgressPercentage = () => {
    if (!loyaltyData) return 0;
    const tierInfo = getTierInfo(loyaltyData.currentTier);
    if (!tierInfo.next) return 100;
    
    const currentTierMin = loyaltyData.currentTier === 'Bronze' ? 0 : 
                          loyaltyData.currentTier === 'Silver' ? 500 : 
                          loyaltyData.currentTier === 'Gold' ? 1000 : 2500;
    
    const progress = loyaltyData.totalPoints - currentTierMin;
    const required = tierInfo.nextPoints - currentTierMin;
    
    return Math.min((progress / required) * 100, 100);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <FiLoader className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadLoyaltyData} size="sm">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!loyaltyData) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center">
          <FiGift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Join Our Loyalty Program
          </h3>
          <p className="text-gray-600 mb-4">
            Earn points with every purchase and unlock exclusive rewards!
          </p>
          <Button onClick={() => {/* Join loyalty program */}}>
            Join Now
          </Button>
        </div>
      </div>
    );
  }

  const tierInfo = getTierInfo(loyaltyData.currentTier);
  const benefits = getTierBenefits(loyaltyData.currentTier);
  const progressPercentage = getProgressPercentage();

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className={`${tierInfo.bg} ${tierInfo.border} border-b px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 ${tierInfo.bg} rounded-full`}>
              <FiAward className={`w-6 h-6 ${tierInfo.color}`} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {loyaltyData.currentTier} Member
              </h2>
              <p className="text-sm text-gray-600">
                Member since {loyaltyData.joinedAt.toDate().toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {loyaltyData.availablePoints.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Available Points</div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Points Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <FiStar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="text-xl font-semibold text-gray-900">
              {loyaltyData.totalPoints.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Earned</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <FiShoppingBag className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <div className="text-xl font-semibold text-gray-900">
              ${loyaltyData.lifetimeSpent.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Lifetime Spent</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <FiTrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <div className="text-xl font-semibold text-gray-900">
              {loyaltyData.currentTier}
            </div>
            <div className="text-sm text-gray-600">Current Tier</div>
          </div>
        </div>

        {/* Tier Progress */}
        {tierInfo.next && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">
                Progress to {tierInfo.next}
              </h3>
              <span className="text-sm text-gray-600">
                {loyaltyData.totalPoints} / {tierInfo.nextPoints} points
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">
              {tierInfo.nextPoints - loyaltyData.totalPoints} more points to reach {tierInfo.next}
            </p>
          </div>
        )}

        {/* Current Tier Benefits */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900">
            Your {loyaltyData.currentTier} Benefits
          </h3>
          <div className="space-y-2">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2">
                <FiGift className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-sm text-gray-600">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center justify-center gap-2"
            onClick={() => {/* Navigate to rewards catalog */}}
          >
            <FiGift className="w-4 h-4" />
            Redeem Points
            <FiChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center justify-center gap-2"
            onClick={() => {/* Navigate to points history */}}
          >
            <FiClock className="w-4 h-4" />
            Points History
            <FiChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Recent Activity */}
        {transactions.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900">Recent Activity</h3>
            <div className="space-y-2">
              {transactions.slice(0, 3).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-1 rounded-full ${
                      transaction.type === 'earned' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {transaction.type === 'earned' ? (
                        <FiTrendingUp className="w-3 h-3 text-green-600" />
                      ) : (
                        <FiGift className="w-3 h-3 text-red-600" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.description}
                      </div>
                      <div className="text-xs text-gray-500">
                        {transaction.createdAt.toDate().toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${
                    transaction.type === 'earned' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'earned' ? '+' : ''}{transaction.points}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Referral Program */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-3 mb-2">
            <FiGift className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-medium text-gray-900">
              Refer Friends & Earn
            </h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Give your friends 10% off their first order and earn 100 points for each successful referral.
          </p>
          <Button size="sm" variant="outline">
            Share Referral Link
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyDashboard;