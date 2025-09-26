import React from 'react';
import { 
  FaPhone, 
  FaEnvelope, 
  FaComments, 
  FaHeadset, 
  FaCrown, 
  FaClock,
  FaUserTie,
  FaCalendarAlt,
  FaExternalLinkAlt
} from 'react-icons/fa';
import type { BusinessProfile } from '../../types';

interface BusinessSupportCardProps {
  businessProfile: BusinessProfile;
  className?: string;
}

const BusinessSupportCard: React.FC<BusinessSupportCardProps> = ({ 
  businessProfile, 
  className = '' 
}) => {
  const hasDedicatedRep = businessProfile.businessSupport.dedicatedRep;
  const hasPrioritySupport = businessProfile.businessSupport.prioritySupport;

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
          <FaHeadset className="text-blue-600" />
          <span>Business Support</span>
        </h3>
        {hasPrioritySupport && (
          <div className="flex items-center space-x-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
            <FaCrown />
            <span>Priority</span>
          </div>
        )}
      </div>

      {/* Dedicated Representative */}
      {hasDedicatedRep ? (
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 mb-3">
            <FaUserTie className="text-blue-600" />
            <h4 className="font-medium text-blue-800">Your Dedicated Representative</h4>
          </div>
          
          <div className="space-y-2">
            <div className="font-semibold text-gray-800">
              {businessProfile.businessSupport.dedicatedRep}
            </div>
            
            <div className="space-y-1">
              {businessProfile.businessSupport.repEmail && (
                <a 
                  href={`mailto:${businessProfile.businessSupport.repEmail}`}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
                >
                  <FaEnvelope />
                  <span>{businessProfile.businessSupport.repEmail}</span>
                </a>
              )}
              
              {businessProfile.businessSupport.repPhone && (
                <a 
                  href={`tel:${businessProfile.businessSupport.repPhone}`}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
                >
                  <FaPhone />
                  <span>{businessProfile.businessSupport.repPhone}</span>
                </a>
              )}
            </div>
            
            <button className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center space-x-2">
              <FaCalendarAlt />
              <span>Schedule Meeting</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="text-center text-gray-600">
            <FaUserTie className="mx-auto text-2xl mb-2 text-gray-400" />
            <p className="text-sm">No dedicated representative assigned</p>
            <p className="text-xs text-gray-500 mt-1">
              Upgrade to Gold tier or higher for dedicated support
            </p>
          </div>
        </div>
      )}

      {/* Support Options */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-800 mb-3">Support Options</h4>
        
        {/* Business Phone Support */}
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <FaPhone className="text-green-600" />
            <div>
              <div className="font-medium text-green-800">Business Phone Support</div>
              <div className="text-sm text-green-600">
                {hasPrioritySupport ? 'Priority Queue' : 'Standard Queue'}
              </div>
            </div>
          </div>
          <a 
            href="tel:1-800-ZAPP-BIZ"
            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
          >
            Call Now
          </a>
        </div>

        {/* Business Email Support */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <FaEnvelope className="text-blue-600" />
            <div>
              <div className="font-medium text-blue-800">Business Email Support</div>
              <div className="text-sm text-blue-600">
                Response within {hasPrioritySupport ? '2 hours' : '24 hours'}
              </div>
            </div>
          </div>
          <a 
            href="mailto:business-support@zapp.com"
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
          >
            Email
          </a>
        </div>

        {/* Live Chat */}
        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <FaComments className="text-purple-600" />
            <div>
              <div className="font-medium text-purple-800">Business Live Chat</div>
              <div className="text-sm text-purple-600 flex items-center space-x-1">
                <FaClock />
                <span>Available 24/7</span>
              </div>
            </div>
          </div>
          <button className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors flex items-center space-x-1">
            <span>Chat</span>
            <FaExternalLinkAlt className="text-xs" />
          </button>
        </div>
      </div>

      {/* Support Hours */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h5 className="font-medium text-gray-800 mb-2 flex items-center space-x-2">
          <FaClock />
          <span>Business Support Hours</span>
        </h5>
        <div className="text-sm text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span>Phone Support:</span>
            <span>Mon-Fri 6AM-10PM EST</span>
          </div>
          <div className="flex justify-between">
            <span>Email Support:</span>
            <span>24/7</span>
          </div>
          <div className="flex justify-between">
            <span>Live Chat:</span>
            <span>24/7</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessSupportCard;