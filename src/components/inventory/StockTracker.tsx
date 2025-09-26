import React, { useState, useEffect } from 'react';
import {
  FaBox,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaChartLine,
  FaSync,
  FaFilter,
  FaSearch,
  FaBell,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';
import { InventoryService } from '../../services/inventoryService';
import { StockLevel, StockAlert, ExpiryAlert } from '../../types';

interface StockTrackerProps {
  productIds?: string[];
  showAlerts?: boolean;
  compact?: boolean;
}

const StockTracker: React.FC<StockTrackerProps> = ({
  productIds = [],
  showAlerts = true,
  compact = false
}) => {
  const [stockLevels, setStockLevels] = useState<StockLevel[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [expiryAlerts, setExpiryAlerts] = useState<ExpiryAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'low_stock' | 'out_of_stock'>('all');
  const [activeTab, setActiveTab] = useState<'stock' | 'alerts' | 'expiry'>('stock');

  useEffect(() => {
    loadData();
    
    // Set up real-time updates
    const interval = setInterval(loadData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [productIds]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [stockData, stockAlertsData, expiryAlertsData] = await Promise.all([
        productIds.length > 0 
          ? InventoryService.getStockLevels(productIds)
          : InventoryService.getStockLevels([]), // Load all if no specific products
        showAlerts ? InventoryService.getLowStockAlerts() : Promise.resolve([]),
        showAlerts ? InventoryService.getExpiryAlerts() : Promise.resolve([])
      ]);

      setStockLevels(stockData);
      setStockAlerts(stockAlertsData);
      setExpiryAlerts(expiryAlertsData);
    } catch (error) {
      console.error('Error loading inventory data:', error);
      setError('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeStockAlert = async (alertId: string) => {
    try {
      await InventoryService.acknowledgeStockAlert(alertId);
      setStockAlerts(alerts => 
        alerts.map(alert => 
          alert.id === alertId ? { ...alert, acknowledged: true } : alert
        )
      );
    } catch (error) {
      console.error('Error acknowledging stock alert:', error);
    }
  };

  const handleAcknowledgeExpiryAlert = async (alertId: string) => {
    try {
      await InventoryService.acknowledgeExpiryAlert(alertId);
      setExpiryAlerts(alerts => 
        alerts.map(alert => 
          alert.id === alertId ? { ...alert, acknowledged: true } : alert
        )
      );
    } catch (error) {
      console.error('Error acknowledging expiry alert:', error);
    }
  };

  const getStockStatusColor = (stockLevel: StockLevel): string => {
    if (stockLevel.availableStock === 0) return 'text-red-600 bg-red-50';
    if (stockLevel.availableStock <= stockLevel.reorderPoint) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  const getStockStatusIcon = (stockLevel: StockLevel) => {
    if (stockLevel.availableStock === 0) return <FaTimesCircle className="text-red-600" />;
    if (stockLevel.availableStock <= stockLevel.reorderPoint) return <FaExclamationTriangle className="text-orange-600" />;
    return <FaCheckCircle className="text-green-600" />;
  };

  const filteredStockLevels = stockLevels.filter(stock => {
    const matchesSearch = stock.productId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'out_of_stock' && stock.availableStock === 0) ||
      (filterStatus === 'low_stock' && stock.availableStock > 0 && stock.availableStock <= stock.reorderPoint);
    
    return matchesSearch && matchesFilter;
  });

  const unacknowledgedStockAlerts = stockAlerts.filter(alert => !alert.acknowledged);
  const unacknowledgedExpiryAlerts = expiryAlerts.filter(alert => !alert.acknowledged);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-red-800">
          <FaExclamationTriangle />
          <span className="font-medium">Error</span>
        </div>
        <p className="text-sm text-red-700 mt-1">{error}</p>
        <button
          onClick={loadData}
          className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {filteredStockLevels.slice(0, 5).map((stock) => (
          <div key={stock.productId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div className="flex items-center space-x-2">
              {getStockStatusIcon(stock)}
              <span className="text-sm font-medium">{stock.productId}</span>
            </div>
            <span className="text-sm text-gray-600">{stock.availableStock} available</span>
          </div>
        ))}
        {filteredStockLevels.length > 5 && (
          <div className="text-center text-sm text-gray-500">
            +{filteredStockLevels.length - 5} more items
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Inventory Tracker</h2>
        <button
          onClick={loadData}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <FaSync />
          <span>Refresh</span>
        </button>
      </div>

      {/* Alert Summary */}
      {showAlerts && (unacknowledgedStockAlerts.length > 0 || unacknowledgedExpiryAlerts.length > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-yellow-800 mb-2">
            <FaBell />
            <span className="font-medium">Active Alerts</span>
          </div>
          <div className="text-sm text-yellow-700">
            {unacknowledgedStockAlerts.length > 0 && (
              <span>{unacknowledgedStockAlerts.length} low stock alert(s)</span>
            )}
            {unacknowledgedStockAlerts.length > 0 && unacknowledgedExpiryAlerts.length > 0 && (
              <span> • </span>
            )}
            {unacknowledgedExpiryAlerts.length > 0 && (
              <span>{unacknowledgedExpiryAlerts.length} expiry alert(s)</span>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('stock')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'stock'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FaBox />
              <span>Stock Levels</span>
            </div>
          </button>
          
          {showAlerts && (
            <>
              <button
                onClick={() => setActiveTab('alerts')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'alerts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FaExclamationTriangle />
                  <span>Stock Alerts</span>
                  {unacknowledgedStockAlerts.length > 0 && (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                      {unacknowledgedStockAlerts.length}
                    </span>
                  )}
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('expiry')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'expiry'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FaCalendarAlt />
                  <span>Expiry Alerts</span>
                  {unacknowledgedExpiryAlerts.length > 0 && (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                      {unacknowledgedExpiryAlerts.length}
                    </span>
                  )}
                </div>
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Stock Levels Tab */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Items</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>

          {/* Stock Levels Grid */}
          <div className="grid gap-4">
            {filteredStockLevels.map((stock) => (
              <div key={stock.productId} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getStockStatusIcon(stock)}
                    <div>
                      <h3 className="font-medium text-gray-900">{stock.productId}</h3>
                      <p className="text-sm text-gray-500">
                        Last updated: {stock.lastUpdated.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStockStatusColor(stock)}`}>
                    {InventoryService.formatStockStatus(stock).message}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Available:</span>
                    <div className="font-semibold">{stock.availableStock}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Reserved:</span>
                    <div className="font-semibold">{stock.reservedStock}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Total:</span>
                    <div className="font-semibold">{stock.currentStock}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Reorder Point:</span>
                    <div className="font-semibold">{stock.reorderPoint}</div>
                  </div>
                </div>
                
                {/* Stock Level Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Stock Level</span>
                    <span>{stock.currentStock} / {stock.maxStock}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        stock.availableStock === 0 
                          ? 'bg-red-500' 
                          : stock.availableStock <= stock.reorderPoint 
                          ? 'bg-orange-500' 
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min((stock.currentStock / stock.maxStock) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredStockLevels.length === 0 && (
            <div className="text-center py-8">
              <FaBox className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No stock data found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      )}

      {/* Stock Alerts Tab */}
      {activeTab === 'alerts' && showAlerts && (
        <div className="space-y-4">
          {stockAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`border rounded-lg p-4 ${
                alert.acknowledged ? 'bg-gray-50 border-gray-200' : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FaExclamationTriangle
                    className={alert.severity === 'critical' ? 'text-red-600' : 'text-orange-600'}
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{alert.productName}</h3>
                    <p className="text-sm text-gray-500">
                      Current stock: {alert.currentStock} (Reorder point: {alert.reorderPoint})
                    </p>
                    <p className="text-xs text-gray-400">
                      {alert.createdAt.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {!alert.acknowledged && (
                  <button
                    onClick={() => handleAcknowledgeStockAlert(alert.id)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          ))}

          {stockAlerts.length === 0 && (
            <div className="text-center py-8">
              <FaCheckCircle className="mx-auto h-12 w-12 text-green-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No stock alerts</h3>
              <p className="text-gray-500">All products are adequately stocked</p>
            </div>
          )}
        </div>
      )}

      {/* Expiry Alerts Tab */}
      {activeTab === 'expiry' && showAlerts && (
        <div className="space-y-4">
          {expiryAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`border rounded-lg p-4 ${
                alert.acknowledged ? 'bg-gray-50 border-gray-200' : 'bg-yellow-50 border-yellow-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FaCalendarAlt
                    className={alert.severity === 'critical' ? 'text-red-600' : 'text-orange-600'}
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{alert.productName}</h3>
                    <p className="text-sm text-gray-500">
                      Batch {alert.batchNumber}: {alert.quantity} units expire in {alert.daysUntilExpiry} days
                    </p>
                    <p className="text-xs text-gray-400">
                      Expiry date: {alert.expiryDate.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {!alert.acknowledged && (
                  <button
                    onClick={() => handleAcknowledgeExpiryAlert(alert.id)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          ))}

          {expiryAlerts.length === 0 && (
            <div className="text-center py-8">
              <FaCheckCircle className="mx-auto h-12 w-12 text-green-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No expiry alerts</h3>
              <p className="text-gray-500">No products are expiring soon</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StockTracker;