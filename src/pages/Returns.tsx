import React, { useState, useEffect } from 'react';
import { FaBox, FaSearch, FaUndo, FaFileAlt, FaCalendarAlt, FaFilter, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

interface ReturnRequest {
  id: string;
  orderNumber: string;
  returnNumber: string;
  date: Date;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  reason: string;
  refundAmount: number;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
    returnReason: string;
  }>;
  notes?: string;
}

const Returns: React.FC = () => {
  const { user } = useAuth();
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showReturnForm, setShowReturnForm] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockReturns: ReturnRequest[] = [
      {
        id: '1',
        orderNumber: 'ORD-2024-001',
        returnNumber: 'RET-2024-001',
        date: new Date('2024-01-18'),
        status: 'completed',
        reason: 'Damaged item',
        refundAmount: 24.99,
        items: [
          {
            id: '1',
            name: 'Organic Bananas',
            quantity: 1,
            price: 24.99,
            image: '/images/products/bananas.jpg',
            returnReason: 'Item arrived damaged'
          }
        ],
        notes: 'Refund processed to original payment method'
      },
      {
        id: '2',
        orderNumber: 'ORD-2024-002',
        returnNumber: 'RET-2024-002',
        date: new Date('2024-01-22'),
        status: 'processing',
        reason: 'Wrong item received',
        refundAmount: 15.49,
        items: [
          {
            id: '2',
            name: 'Whole Milk',
            quantity: 1,
            price: 15.49,
            image: '/images/products/milk.jpg',
            returnReason: 'Received wrong product variant'
          }
        ]
      }
    ];

    setTimeout(() => {
      setReturns(mockReturns);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="text-green-600" />;
      case 'approved':
        return <FaCheckCircle className="text-blue-600" />;
      case 'processing':
        return <FaClock className="text-yellow-600" />;
      case 'pending':
        return <FaClock className="text-gray-600" />;
      case 'rejected':
        return <FaTimesCircle className="text-red-600" />;
      default:
        return <FaClock className="text-gray-600" />;
    }
  };

  const filteredReturns = returns.filter(returnRequest => {
    const matchesSearch = returnRequest.returnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         returnRequest.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         returnRequest.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || returnRequest.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to view your returns.</p>
          <Link
            to="/login"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Returns & Refunds</h1>
            <p className="text-gray-600">Manage your return requests and track refunds</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => setShowReturnForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <FaUndo />
              <span>Request Return</span>
            </button>
          </div>
        </div>
      </div>

      {/* Return Policy Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Return Policy</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">Fresh & Perishable Items</h4>
            <ul className="space-y-1">
              <li>• Must be returned within 24 hours</li>
              <li>• Full refund for quality issues</li>
              <li>• Contact us immediately for damaged items</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Non-Perishable Items</h4>
            <ul className="space-y-1">
              <li>• 30-day return window</li>
              <li>• Items must be unopened</li>
              <li>• Original packaging required</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search returns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Returns List */}
      <div className="space-y-6">
        {filteredReturns.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <FaBox className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No returns found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : "You haven't requested any returns yet"
              }
            </p>
            <Link
              to="/orders"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Orders
            </Link>
          </div>
        ) : (
          filteredReturns.map((returnRequest) => (
            <div key={returnRequest.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Return Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{returnRequest.returnNumber}</h3>
                  <p className="text-sm text-gray-500">
                    Order: {returnRequest.orderNumber} • Requested on {returnRequest.date.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4 mt-2 sm:mt-0">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(returnRequest.status)}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(returnRequest.status)}`}>
                      {returnRequest.status.charAt(0).toUpperCase() + returnRequest.status.slice(1)}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    ${returnRequest.refundAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Return Reason */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Return Reason</h4>
                <p className="text-gray-700">{returnRequest.reason}</p>
                {returnRequest.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <h5 className="font-medium text-gray-900 mb-1">Notes</h5>
                    <p className="text-gray-600 text-sm">{returnRequest.notes}</p>
                  </div>
                )}
              </div>

              {/* Return Items */}
              <div className="border-t border-gray-200 pt-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-3">Items to Return</h4>
                <div className="space-y-3">
                  {returnRequest.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                        }}
                      />
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{item.name}</h5>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                        <p className="text-sm text-gray-600">{item.returnReason}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">${item.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Return Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <FaFileAlt />
                  <span>View Details</span>
                </button>
                
                {returnRequest.status === 'pending' && (
                  <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    <FaTimesCircle />
                    <span>Cancel Return</span>
                  </button>
                )}
                
                {returnRequest.status === 'completed' && (
                  <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <FaFileAlt />
                    <span>Download Receipt</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/help"
            className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
          >
            <FaFileAlt className="text-blue-600" />
            <div>
              <h4 className="font-medium text-gray-900">Help Center</h4>
              <p className="text-sm text-gray-500">Find answers to common questions</p>
            </div>
          </Link>
          
          <Link
            to="/contact"
            className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
          >
            <FaFileAlt className="text-blue-600" />
            <div>
              <h4 className="font-medium text-gray-900">Contact Support</h4>
              <p className="text-sm text-gray-500">Get help from our team</p>
            </div>
          </Link>
          
          <Link
            to="/orders"
            className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
          >
            <FaBox className="text-blue-600" />
            <div>
              <h4 className="font-medium text-gray-900">View Orders</h4>
              <p className="text-sm text-gray-500">Check your order history</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Returns;