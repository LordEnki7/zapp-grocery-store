import React, { useState } from 'react';
import { FaSearch, FaUserEdit, FaUserSlash, FaCrown } from 'react-icons/fa';

function Users() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  // Mock users data
  const users = [
    { 
      id: '1', 
      name: 'John Smith', 
      email: 'john@example.com',
      role: 'customer',
      loyaltyPoints: 420,
      signupDate: '2025-03-10',
      orders: 8
    },
    { 
      id: '2', 
      name: 'Maria Garcia', 
      email: 'maria@example.com',
      role: 'customer',
      loyaltyPoints: 150,
      signupDate: '2025-04-15',
      orders: 3
    },
    { 
      id: '3', 
      name: 'Admin User', 
      email: 'admin@zapp.com',
      role: 'admin',
      loyaltyPoints: 0,
      signupDate: '2025-01-01',
      orders: 0
    },
    { 
      id: '4', 
      name: 'Robert Johnson', 
      email: 'robert@example.com',
      role: 'affiliate',
      loyaltyPoints: 780,
      signupDate: '2025-02-20',
      orders: 12
    },
    { 
      id: '5', 
      name: 'Sarah Williams', 
      email: 'sarah@example.com',
      role: 'customer',
      loyaltyPoints: 280,
      signupDate: '2025-05-05',
      orders: 5
    }
  ];

  // Filter users by search query and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const roleOptions = ['all', 'customer', 'admin', 'affiliate'];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Users</h1>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div className="md:w-48">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role === 'all' ? 'All Roles' : role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loyalty Points
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs ${
                        user.role === 'admin'
                          ? 'bg-red-100 text-red-800'
                          : user.role === 'affiliate'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.loyaltyPoints}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.orders}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.signupDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {user.role !== 'admin' && (
                      <button 
                        className="text-purple-600 hover:text-purple-900 mr-3"
                        onClick={() => alert(`Upgrade ${user.name} to admin`)}
                        title="Make Admin"
                      >
                        <FaCrown />
                      </button>
                    )}
                    <button 
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      onClick={() => alert(`Edit user ${user.id}`)}
                      title="Edit User"
                    >
                      <FaUserEdit />
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-900"
                      onClick={() => alert(`Deactivate user ${user.id}`)}
                      title="Deactivate User"
                    >
                      <FaUserSlash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            No users found. Try adjusting your filters.
          </div>
        )}
      </div>
    </div>
  );
}

export default Users; 