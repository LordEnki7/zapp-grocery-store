import React, { useState } from 'react';
import { FiUser, FiShoppingBag, FiCreditCard, FiSettings, FiLogOut, FiPackage } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import AccountTypeIndicator from '../components/account/AccountTypeIndicator';
import BusinessSupportCard from '../components/account/BusinessSupportCard';
import QuickReorder from '../components/account/QuickReorder';

const Account: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser, userProfile, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Form state for account settings
  const [formData, setFormData] = useState({
    name: userProfile?.firstName && userProfile?.lastName 
      ? `${userProfile.firstName} ${userProfile.lastName}` 
      : userProfile?.displayName || currentUser?.displayName || '',
    email: currentUser?.email || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  // Mock user data (in a real app, this would come from authentication context)
  const user = {
    name: userProfile?.firstName && userProfile?.lastName 
      ? `${userProfile.firstName} ${userProfile.lastName}` 
      : userProfile?.displayName || currentUser?.email || 'Business User',
    email: currentUser?.email || 'business@example.com',
    accountType: 'reseller',
    joinDate: new Date(2023, 1, 15),
    avatar: currentUser?.photoURL
  };
  
  const tabs = [
    { id: 'dashboard', label: t('account.dashboard'), icon: <FiUser /> },
    { id: 'orders', label: t('account.orders'), icon: <FiPackage /> },
    { id: 'purchases', label: t('account.purchases'), icon: <FiShoppingBag /> },
    { id: 'payment', label: t('account.payment'), icon: <FiCreditCard /> },
    { id: 'settings', label: t('account.settings'), icon: <FiSettings /> }
  ];

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    setIsLoading(true);
    setSaveMessage('');
    
    try {
      // Basic validation
      if (!formData.name.trim()) {
        throw new Error('Full name is required');
      }
      if (!formData.email.trim()) {
        throw new Error('Email is required');
      }
      
      // Split name into first and last name
      const nameParts = formData.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Since Firebase is not configured, we'll use a fallback approach
      // In a real app, this would save to a backend API or properly configured Firebase
      
      console.log('Attempting to update profile with:', {
        firstName,
        lastName,
        displayName: formData.name,
        email: formData.email
      });
      
      // Simulate a successful save operation
      // In development mode without Firebase, we'll just update local state
      const isDevelopmentMode = !currentUser || !updateUserProfile;
      
      if (isDevelopmentMode) {
        // Development fallback - just update local storage and show success
        const profileData = {
          firstName,
          lastName,
          displayName: formData.name,
          email: formData.email,
          updatedAt: new Date().toISOString()
        };
        
        // Save to localStorage for persistence during development
        localStorage.setItem('userProfile', JSON.stringify(profileData));
        
        console.log('Profile updated in development mode (localStorage)');
        setSaveMessage('Changes saved successfully! (Development mode - changes saved locally)');
      } else {
        // Production mode with Firebase
        if (!currentUser) {
          throw new Error('No authenticated user found. Please log in again.');
        }
        
        if (!updateUserProfile) {
          throw new Error('Update function not available. Please refresh the page and try again.');
        }
        
        await updateUserProfile({
          firstName,
          lastName,
          displayName: formData.name,
          email: formData.email
        });
        
        console.log('Profile update successful');
        setSaveMessage('Changes saved successfully!');
      }
      
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error: any) {
      console.error('Error saving changes:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Error saving changes. ';
      
      if (error.message.includes('Firebase')) {
        errorMessage += 'Database connection issue. Please check your internet connection and try again.';
      } else if (error.message.includes('auth')) {
        errorMessage += 'Authentication issue. Please log out and log back in.';
      } else if (error.message.includes('permission')) {
        errorMessage += 'Permission denied. Please contact support.';
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please try again or contact support if the problem persists.';
      }
      
      setSaveMessage(errorMessage);
      setTimeout(() => setSaveMessage(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('account.title')}</h1>
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 text-white text-xl font-bold">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <h2 className="font-bold text-xl">{user.name}</h2>
              <p className="text-gray-600 text-sm">{user.email}</p>
              <div className="mt-2">
                {userProfile ? (
                  <AccountTypeIndicator 
                    userProfile={userProfile} 
                    size="medium" 
                    showDetails={true} 
                  />
                ) : (
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    Reseller Account
                  </span>
                )}
              </div>
            </div>
            
            <div className="space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id 
                      ? 'bg-green-50 text-green-700' 
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="flex-shrink-0">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
              
              <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-700 mt-8">
                <span className="flex-shrink-0"><FiLogOut /></span>
                <span>{t('account.logout')}</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-grow">
          {activeTab === 'dashboard' && (
            <div>
              <h1 className="text-2xl font-bold mb-6">{t('account.welcomeBack')}</h1>
              
              {/* Account Overview */}
              <div className="bg-white rounded-lg shadow-sm p-5 mb-8">
                <h2 className="text-xl font-bold mb-4">{t('account.overview')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="text-gray-500 mb-1">{t('account.memberSince')}</div>
                    <div className="font-medium">{user.joinDate.toLocaleDateString()}</div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="text-gray-500 mb-1">{t('account.totalOrders')}</div>
                    <div className="font-medium">24</div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="text-gray-500 mb-1">{t('account.rewardPoints')}</div>
                    <div className="font-medium">1,250 pts</div>
                  </div>
                </div>
              </div>
              
              {/* Reseller Benefits */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-5 mb-8">
                <h2 className="text-xl font-bold text-blue-800 mb-4">{t('account.resellerBenefits')}</h2>
                <ul className="space-y-2 text-blue-700">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 mr-2 mt-0.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{t('account.bulkDiscounts')}</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 mr-2 mt-0.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{t('account.priorityShipping')}</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 mr-2 mt-0.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{t('account.dedicatedSupport')}</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 mr-2 mt-0.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{t('account.businessPricing')}</span>
                  </li>
                </ul>
              </div>
              
              {/* Business Support Card - Only show for business accounts */}
              {userProfile?.accountType === 'business' && (
                <div className="mb-8">
                  <BusinessSupportCard userProfile={userProfile} />
                </div>
              )}
              
              {/* Quick Reorder Section */}
              <QuickReorder />
            </div>
          )}
          
          {activeTab === 'orders' && (
            <div>
              <h1 className="text-2xl font-bold mb-6">Your Orders</h1>
              <div className="bg-white rounded-lg shadow-sm p-5">
                <p className="text-gray-500 text-center py-8">No orders yet</p>
              </div>
            </div>
          )}
          
          {activeTab === 'purchases' && (
            <div>
              <h1 className="text-2xl font-bold mb-6">Purchase History</h1>
              <div className="bg-white rounded-lg shadow-sm p-5">
                <p className="text-gray-500 text-center py-8">No purchases yet</p>
              </div>
            </div>
          )}
          
          {activeTab === 'payment' && (
            <div>
              <h1 className="text-2xl font-bold mb-6">Payment Methods</h1>
              <div className="bg-white rounded-lg shadow-sm p-5">
                <p className="text-gray-500 text-center py-8">No payment methods yet</p>
              </div>
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div>
              <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
              <div className="bg-white rounded-lg shadow-sm p-5">
                {saveMessage && (
                  <div className={`mb-4 p-3 rounded-lg ${
                    saveMessage.includes('Error') 
                      ? 'bg-red-100 text-red-700 border border-red-300' 
                      : 'bg-green-100 text-green-700 border border-green-300'
                  }`}>
                    {saveMessage}
                  </div>
                )}
                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                  <div>
                    <label className="block text-gray-700 mb-2" htmlFor="name">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      autoComplete="name"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2" htmlFor="email">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      autoComplete="email"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={handleSaveChanges}
                      disabled={isLoading}
                      className={`font-medium py-2 px-4 rounded-lg ${
                        isLoading 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-green-600 hover:bg-green-700'
                      } text-white`}
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;