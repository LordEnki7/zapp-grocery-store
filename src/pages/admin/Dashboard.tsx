import React from 'react';
import { FaShoppingCart, FaUsers, FaBox, FaChartLine } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function Dashboard() {
  // Mock data for dashboard
  const stats = {
    totalSales: 24850.75,
    totalOrders: 143,
    totalCustomers: 89,
    totalProducts: 412
  };

  const recentOrders = [
    { id: 'ORD-001', customer: 'John Smith', date: '2025-06-10', total: 87.45, status: 'Delivered' },
    { id: 'ORD-002', customer: 'Maria Garcia', date: '2025-06-09', total: 124.99, status: 'Processing' },
    { id: 'ORD-003', customer: 'Robert Johnson', date: '2025-06-09', total: 56.20, status: 'Pending' },
    { id: 'ORD-004', customer: 'Sarah Williams', date: '2025-06-08', total: 210.50, status: 'Shipped' }
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
          <div className="rounded-full bg-primary/10 p-3 mr-4">
            <FaChartLine className="text-primary text-xl" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Sales</p>
            <p className="text-2xl font-bold">${stats.totalSales.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
          <div className="rounded-full bg-secondary/10 p-3 mr-4">
            <FaShoppingCart className="text-secondary text-xl" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="text-2xl font-bold">{stats.totalOrders}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
          <div className="rounded-full bg-accent/10 p-3 mr-4">
            <FaUsers className="text-accent text-xl" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Customers</p>
            <p className="text-2xl font-bold">{stats.totalCustomers}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
          <div className="rounded-full bg-primary/10 p-3 mr-4">
            <FaBox className="text-primary text-xl" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Products</p>
            <p className="text-2xl font-bold">{stats.totalProducts}</p>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Recent Orders</h2>
          <Link to="/admin/orders" className="text-primary hover:underline">
            View All
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-4 text-left font-medium text-gray-500">Order ID</th>
                <th className="py-3 px-4 text-left font-medium text-gray-500">Customer</th>
                <th className="py-3 px-4 text-left font-medium text-gray-500">Date</th>
                <th className="py-3 px-4 text-left font-medium text-gray-500">Amount</th>
                <th className="py-3 px-4 text-left font-medium text-gray-500">Status</th>
                <th className="py-3 px-4 text-left font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">{order.id}</td>
                  <td className="py-3 px-4">{order.customer}</td>
                  <td className="py-3 px-4">{order.date}</td>
                  <td className="py-3 px-4">${order.total.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs ${
                        order.status === 'Delivered'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'Processing'
                          ? 'bg-blue-100 text-blue-800'
                          : order.status === 'Shipped'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Link to={`/admin/orders/${order.id}`} className="text-primary hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 