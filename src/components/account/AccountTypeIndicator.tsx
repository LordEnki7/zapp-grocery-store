import React from 'react';
import { FaBuilding, FaUser, FaShieldAlt, FaCrown, FaStar, FaCheckCircle, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import type { UserProfile } from '../../types';

interface AccountTypeIndicatorProps {
  userProfile: UserProfile;
  size?: 'small' | 'medium' | 'large';
  showDetails?: boolean;
}

const AccountTypeIndicator: React.FC<AccountTypeIndicatorProps> = ({ 
  userProfile, 
  size = 'medium', 
  showDetails = false 
}) => {
  const isBusinessAccount = userProfile.accountType === 'business';
  const businessProfile = userProfile.businessProfile;

  const sizeClasses = {
    small: 'text-xs px-2 py-1',
    medium: 'text-sm px-3 py-1.5',
    large: 'text-base px-4 py-2'
  };

  const iconSizes = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  // Get business tier color and icon
  const getTierInfo = (tier?: string) => {
    switch (tier) {
      case 'platinum':
        return { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: FaCrown };
      case 'gold':
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: FaStar };
      case 'silver':
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: FaShieldAlt };
      case 'bronze':
        return { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: FaShieldAlt };
      default:
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: FaBuilding };
    }
  };

  // Get approval status info
  const getApprovalInfo = (status?: string) => {
    switch (status) {
      case 'approved':
        return { color: 'text-green-600', icon: FaCheckCircle, text: 'Verified' };
      case 'pending':
        return { color: 'text-yellow-600', icon: FaClock, text: 'Pending' };
      case 'rejected':
      case 'suspended':
        return { color: 'text-red-600', icon: FaExclamationTriangle, text: 'Suspended' };
      default:
        return { color: 'text-gray-600', icon: FaClock, text: 'Unverified' };
    }
  };

  if (!isBusinessAccount) {
    return (
      <div className={`inline-flex items-center space-x-1 bg-gray-100 text-gray-700 rounded-full border ${sizeClasses[size]}`}>
        <FaUser className={iconSizes[size]} />
        <span>Personal Account</span>
      </div>
    );
  }

  const tierInfo = getTierInfo(businessProfile?.volumeDiscountTier);
  const approvalInfo = getApprovalInfo(businessProfile?.approvalStatus);
  const TierIcon = tierInfo.icon;
  const ApprovalIcon = approvalInfo.icon;

  return (
    <div className="space-y-2">
      {/* Main Business Badge */}
      <div className={`inline-flex items-center space-x-2 ${tierInfo.color} rounded-full border ${sizeClasses[size]}`}>
        <TierIcon className={iconSizes[size]} />
        <span className="font-medium">Business Account</span>
        {businessProfile?.volumeDiscountTier && (
          <span className="capitalize">({businessProfile.volumeDiscountTier})</span>
        )}
      </div>

      {/* Additional Details */}
      {showDetails && businessProfile && (
        <div className="space-y-1">
          {/* Business Name */}
          <div className="text-sm font-medium text-gray-800">
            {businessProfile.businessName}
          </div>
          
          {/* Business Type */}
          <div className="text-xs text-gray-600 capitalize">
            {businessProfile.businessType.replace('_', ' ')}
          </div>
          
          {/* Approval Status */}
          <div className={`inline-flex items-center space-x-1 text-xs ${approvalInfo.color}`}>
            <ApprovalIcon />
            <span>{approvalInfo.text}</span>
          </div>
          
          {/* Tax Exempt Status */}
          {businessProfile.taxExemptStatus.isExempt && (
            <div className="inline-flex items-center space-x-1 text-xs text-green-600">
              <FaShieldAlt />
              <span>Tax Exempt</span>
            </div>
          )}
          
          {/* Priority Support */}
          {businessProfile.businessSupport.prioritySupport && (
            <div className="inline-flex items-center space-x-1 text-xs text-purple-600">
              <FaCrown />
              <span>Priority Support</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AccountTypeIndicator;