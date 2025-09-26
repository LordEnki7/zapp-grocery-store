import React from 'react';
import { FaChartLine, FaShoppingCart, FaDollarSign, FaUsers, FaBox, FaTruck, FaFileInvoiceDollar, FaCalendarAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import BusinessSupportCard from '../../components/account/BusinessSupportCard';

const BusinessDashboard: React.FC = () => {
  const { userProfile } = useAuth();

  const stats = [
    { label: 'Monthly Orders', value: '47', change: '+12%', icon: FaShoppingCart, color: 'text-blue-600' },
    { label: 'Total Spent', value: '$12,450', change: '+8%', icon: FaDollarSign, color: 'text-green-600' },
    { label: 'Active Products', value: '156', change: '+3%', icon: FaBox, color: 'text-purple-600' },
    { label: 'Team Members', value: '8', change: '0%', icon: FaUsers, color: 'text-orange-600' }
  ];

  const recentOrders = [
    { id: 'BO-2024-001', date: '2024-01-15', amount: '$1,245.00', status: 'Delivered', items: 15 },
    { id: 'BO-2024-002', date: '2024-01-12', amount: '$890.50', status: 'In Transit', items: 8 },
    { id: 'BO-2024-003', date: '2024-01-10', amount: '$2,150.75', status: 'Processing', items: 22 },
    { id: 'BO-2024-004', date: '2024-01-08', amount: '$675.25', status: 'Delivered', items: 12 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'text-green-600 bg-green-100';
      case 'In Transit': return 'text-blue-600 bg-blue-100';
      case 'Processing': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Business Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {userProfile?.businessProfile?.companyName || 'Business User'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-green-600">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-full bg-gray-100 ${stat.color}`}>
                  <stat.icon className="text-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View All Orders
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium text-gray-900">{order.id}</p>
                            <p className="text-sm text-gray-600">{order.date}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">{order.items} items</p>
                            <p className="font-medium text-gray-900">{order.amount}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        <button className="text-blue-600 hover:text-blue-700 text-sm">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Business Support & Quick Actions */}
          <div className="space-y-6">
            {/* Business Support Card */}
            {userProfile?.businessProfile && (
              <BusinessSupportCard businessProfile={userProfile.businessProfile} />
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <FaFileInvoiceDollar className="text-blue-600" />
                  <span className="text-gray-700">Request Invoice</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <FaTruck className="text-green-600" />
                  <span className="text-gray-700">Track Shipments</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <FaCalendarAlt className="text-purple-600" />
                  <span className="text-gray-700">Schedule Delivery</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <FaChartLine className="text-orange-600" />
                  <span className="text-gray-700">View Analytics</span>
                </button>
              </div>
            </div>

            {/* Account Status */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Account Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Account Type</span>
                  <span className="font-medium text-blue-600">Business</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Credit Limit</span>
                  <span className="font-medium">$50,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Available Credit</span>
                  <span className="font-medium text-green-600">$47,550</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Terms</span>
                  <span className="font-medium">Net 30</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;