import React, { useState, useEffect } from 'react';
import {
  FaBox,
  FaChartLine,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaDownload,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFilter,
  FaSort,
  FaEye,
  FaWarehouse,
  FaTruck,
  FaClipboardList
} from 'react-icons/fa';
import StockTracker from './StockTracker';
import { InventoryService } from '../../services/inventoryService';
import { StockLevel, InventoryReport, Product } from '../../types';

interface InventoryDashboardProps {
  isAdmin?: boolean;
}

const InventoryDashboard: React.FC<InventoryDashboardProps> = ({ isAdmin = false }) => {
  const [activeView, setActiveView] = useState<'overview' | 'stock' | 'reports' | 'manage'>('overview');
  const [inventoryStats, setInventoryStats] = useState({
    totalProducts: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    expiringItems: 0,
    totalValue: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load dashboard statistics
      const [stockLevels, alerts, expiryAlerts, activity] = await Promise.all([
        InventoryService.getStockLevels([]),
        InventoryService.getLowStockAlerts(),
        InventoryService.getExpiryAlerts(),
        InventoryService.getRecentActivity()
      ]);

      // Calculate statistics
      const stats = {
        totalProducts: stockLevels.length,
        lowStockItems: stockLevels.filter(s => s.availableStock > 0 && s.availableStock <= s.reorderPoint).length,
        outOfStockItems: stockLevels.filter(s => s.availableStock === 0).length,
        expiringItems: expiryAlerts.filter(a => !a.acknowledged).length,
        totalValue: stockLevels.reduce((sum, s) => sum + (s.currentStock * (s.unitCost || 0)), 0)
      };

      setInventoryStats(stats);
      setRecentActivity(activity);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async (type: 'stock' | 'alerts' | 'expiry') => {
    try {
      const report = await InventoryService.generateInventoryReport(type);
      
      // Create and download CSV
      const csvContent = InventoryService.exportToCSV(report);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `inventory-${type}-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    trend?: string;
  }> = ({ title, value, icon, color, trend }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {trend && (
            <p className="text-sm text-gray-500 mt-1">{trend}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleExportReport('stock')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <FaDownload />
            <span>Export Report</span>
          </button>
          {isAdmin && (
            <button
              onClick={() => setShowProductModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <FaPlus />
              <span>Add Product</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveView('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeView === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FaChartLine />
              <span>Overview</span>
            </div>
          </button>
          
          <button
            onClick={() => setActiveView('stock')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeView === 'stock'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FaBox />
              <span>Stock Tracker</span>
            </div>
          </button>
          
          <button
            onClick={() => setActiveView('reports')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeView === 'reports'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FaClipboardList />
              <span>Reports</span>
            </div>
          </button>
          
          {isAdmin && (
            <button
              onClick={() => setActiveView('manage')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeView === 'manage'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FaWarehouse />
                <span>Manage</span>
              </div>
            </button>
          )}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <StatCard
              title="Total Products"
              value={inventoryStats.totalProducts}
              icon={<FaBox className="text-blue-600" />}
              color="bg-blue-100"
            />
            <StatCard
              title="Low Stock Items"
              value={inventoryStats.lowStockItems}
              icon={<FaExclamationTriangle className="text-orange-600" />}
              color="bg-orange-100"
            />
            <StatCard
              title="Out of Stock"
              value={inventoryStats.outOfStockItems}
              icon={<FaExclamationTriangle className="text-red-600" />}
              color="bg-red-100"
            />
            <StatCard
              title="Expiring Soon"
              value={inventoryStats.expiringItems}
              icon={<FaCalendarAlt className="text-yellow-600" />}
              color="bg-yellow-100"
            />
            <StatCard
              title="Total Value"
              value={`$${inventoryStats.totalValue.toLocaleString()}`}
              icon={<FaChartLine className="text-green-600" />}
              color="bg-green-100"
            />
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => handleExportReport('stock')}
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FaDownload className="text-blue-600" />
                <div className="text-left">
                  <div className="font-medium">Export Stock Report</div>
                  <div className="text-sm text-gray-500">Download current stock levels</div>
                </div>
              </button>
              
              <button
                onClick={() => handleExportReport('alerts')}
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FaExclamationTriangle className="text-orange-600" />
                <div className="text-left">
                  <div className="font-medium">Export Alerts</div>
                  <div className="text-sm text-gray-500">Download low stock alerts</div>
                </div>
              </button>
              
              <button
                onClick={() => handleExportReport('expiry')}
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FaCalendarAlt className="text-yellow-600" />
                <div className="text-left">
                  <div className="font-medium">Export Expiry Report</div>
                  <div className="text-sm text-gray-500">Download expiring items</div>
                </div>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.slice(0, 10).map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {activity.type === 'stock_update' && <FaBox className="text-blue-600" />}
                    {activity.type === 'low_stock_alert' && <FaExclamationTriangle className="text-orange-600" />}
                    {activity.type === 'expiry_alert' && <FaCalendarAlt className="text-yellow-600" />}
                    {activity.type === 'restock' && <FaTruck className="text-green-600" />}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{activity.message}</div>
                    <div className="text-xs text-gray-500">{activity.timestamp.toLocaleString()}</div>
                  </div>
                </div>
              ))}
              
              {recentActivity.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No recent activity
                </div>
              )}
            </div>
          </div>

          {/* Compact Stock Tracker */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Critical Stock Levels</h3>
              <button
                onClick={() => setActiveView('stock')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All →
              </button>
            </div>
            <StockTracker compact={true} showAlerts={false} />
          </div>
        </div>
      )}

      {/* Stock Tracker Tab */}
      {activeView === 'stock' && (
        <StockTracker showAlerts={true} />
      )}

      {/* Reports Tab */}
      {activeView === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <FaBox className="text-blue-600" />
                  <h4 className="font-medium">Stock Level Report</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Complete inventory with current stock levels, reorder points, and availability status.
                </p>
                <button
                  onClick={() => handleExportReport('stock')}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Generate Report
                </button>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <FaExclamationTriangle className="text-orange-600" />
                  <h4 className="font-medium">Low Stock Alerts</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Items that have reached or fallen below their reorder points.
                </p>
                <button
                  onClick={() => handleExportReport('alerts')}
                  className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Generate Report
                </button>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <FaCalendarAlt className="text-yellow-600" />
                  <h4 className="font-medium">Expiry Report</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Products with upcoming expiry dates that require immediate attention.
                </p>
                <button
                  onClick={() => handleExportReport('expiry')}
                  className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Generate Report
                </button>
              </div>
            </div>
          </div>

          {/* Report History */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Report History</h3>
            <div className="text-center py-8 text-gray-500">
              <FaClipboardList className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p>Report history will be displayed here</p>
              <p className="text-sm">Generated reports will be saved and accessible for future reference</p>
            </div>
          </div>
        </div>
      )}

      {/* Management Tab (Admin Only) */}
      {activeView === 'manage' && isAdmin && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Management</h3>
            <div className="text-center py-8 text-gray-500">
              <FaWarehouse className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p>Product management interface will be implemented here</p>
              <p className="text-sm">Add, edit, and manage product inventory settings</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryDashboard;