import { Product, InventoryItem, StockAlert, ExpiryAlert } from '../types';

export interface InventoryUpdate {
  productId: string;
  quantityChange: number;
  reason: 'sale' | 'restock' | 'adjustment' | 'expired' | 'damaged';
  notes?: string;
}

export interface StockLevel {
  productId: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  reorderPoint: number;
  maxStock: number;
  lastUpdated: Date;
}

export interface ExpiryBatch {
  id: string;
  productId: string;
  quantity: number;
  expiryDate: Date;
  batchNumber: string;
  receivedDate: Date;
  supplierId?: string;
}

export class InventoryService {
  private static readonly API_BASE = '/api/inventory';

  // Stock Management
  static async getStockLevel(productId: string): Promise<StockLevel> {
    try {
      const response = await fetch(`${this.API_BASE}/stock/${productId}`);
      if (!response.ok) throw new Error('Failed to fetch stock level');
      return await response.json();
    } catch (error) {
      console.error('Error fetching stock level:', error);
      // Mock data for development
      return {
        productId,
        currentStock: Math.floor(Math.random() * 100),
        reservedStock: Math.floor(Math.random() * 10),
        availableStock: Math.floor(Math.random() * 90),
        reorderPoint: 20,
        maxStock: 200,
        lastUpdated: new Date()
      };
    }
  }

  static async getStockLevels(productIds: string[]): Promise<StockLevel[]> {
    try {
      const response = await fetch(`${this.API_BASE}/stock/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds })
      });
      if (!response.ok) throw new Error('Failed to fetch stock levels');
      return await response.json();
    } catch (error) {
      console.error('Error fetching stock levels:', error);
      // Mock data for development
      return productIds.map(productId => ({
        productId,
        currentStock: Math.floor(Math.random() * 100),
        reservedStock: Math.floor(Math.random() * 10),
        availableStock: Math.floor(Math.random() * 90),
        reorderPoint: 20,
        maxStock: 200,
        lastUpdated: new Date()
      }));
    }
  }

  static async updateStock(update: InventoryUpdate): Promise<StockLevel> {
    try {
      const response = await fetch(`${this.API_BASE}/stock/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update)
      });
      if (!response.ok) throw new Error('Failed to update stock');
      return await response.json();
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  }

  static async reserveStock(productId: string, quantity: number, orderId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE}/stock/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity, orderId })
      });
      return response.ok;
    } catch (error) {
      console.error('Error reserving stock:', error);
      return false;
    }
  }

  static async releaseReservedStock(productId: string, quantity: number, orderId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE}/stock/release`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity, orderId })
      });
      return response.ok;
    } catch (error) {
      console.error('Error releasing reserved stock:', error);
      return false;
    }
  }

  // Low Stock Alerts
  static async getLowStockAlerts(): Promise<StockAlert[]> {
    try {
      const response = await fetch(`${this.API_BASE}/alerts/low-stock`);
      if (!response.ok) throw new Error('Failed to fetch low stock alerts');
      return await response.json();
    } catch (error) {
      console.error('Error fetching low stock alerts:', error);
      // Mock data for development
      return [
        {
          id: '1',
          productId: 'prod-1',
          productName: 'Organic Bananas',
          currentStock: 5,
          reorderPoint: 20,
          severity: 'critical',
          createdAt: new Date(),
          acknowledged: false
        },
        {
          id: '2',
          productId: 'prod-2',
          productName: 'Whole Milk',
          currentStock: 15,
          reorderPoint: 25,
          severity: 'warning',
          createdAt: new Date(),
          acknowledged: false
        }
      ];
    }
  }

  static async acknowledgeStockAlert(alertId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE}/alerts/${alertId}/acknowledge`, {
        method: 'POST'
      });
      return response.ok;
    } catch (error) {
      console.error('Error acknowledging stock alert:', error);
      return false;
    }
  }

  static async setReorderPoint(productId: string, reorderPoint: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE}/stock/${productId}/reorder-point`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reorderPoint })
      });
      return response.ok;
    } catch (error) {
      console.error('Error setting reorder point:', error);
      return false;
    }
  }

  // Expiry Date Management
  static async getExpiryBatches(productId?: string): Promise<ExpiryBatch[]> {
    try {
      const url = productId 
        ? `${this.API_BASE}/expiry/batches?productId=${productId}`
        : `${this.API_BASE}/expiry/batches`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch expiry batches');
      return await response.json();
    } catch (error) {
      console.error('Error fetching expiry batches:', error);
      // Mock data for development
      const mockBatches: ExpiryBatch[] = [
        {
          id: 'batch-1',
          productId: 'prod-1',
          quantity: 50,
          expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          batchNumber: 'B001',
          receivedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          supplierId: 'supplier-1'
        },
        {
          id: 'batch-2',
          productId: 'prod-2',
          quantity: 30,
          expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          batchNumber: 'B002',
          receivedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          supplierId: 'supplier-2'
        }
      ];
      return productId ? mockBatches.filter(b => b.productId === productId) : mockBatches;
    }
  }

  static async addExpiryBatch(batch: Omit<ExpiryBatch, 'id'>): Promise<ExpiryBatch> {
    try {
      const response = await fetch(`${this.API_BASE}/expiry/batches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batch)
      });
      if (!response.ok) throw new Error('Failed to add expiry batch');
      return await response.json();
    } catch (error) {
      console.error('Error adding expiry batch:', error);
      throw error;
    }
  }

  static async updateExpiryBatch(batchId: string, updates: Partial<ExpiryBatch>): Promise<ExpiryBatch> {
    try {
      const response = await fetch(`${this.API_BASE}/expiry/batches/${batchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update expiry batch');
      return await response.json();
    } catch (error) {
      console.error('Error updating expiry batch:', error);
      throw error;
    }
  }

  static async getExpiryAlerts(daysAhead: number = 7): Promise<ExpiryAlert[]> {
    try {
      const response = await fetch(`${this.API_BASE}/alerts/expiry?daysAhead=${daysAhead}`);
      if (!response.ok) throw new Error('Failed to fetch expiry alerts');
      return await response.json();
    } catch (error) {
      console.error('Error fetching expiry alerts:', error);
      // Mock data for development
      return [
        {
          id: '1',
          productId: 'prod-1',
          productName: 'Organic Bananas',
          batchId: 'batch-1',
          batchNumber: 'B001',
          quantity: 50,
          expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          daysUntilExpiry: 3,
          severity: 'critical',
          createdAt: new Date(),
          acknowledged: false
        },
        {
          id: '2',
          productId: 'prod-2',
          productName: 'Whole Milk',
          batchId: 'batch-2',
          batchNumber: 'B002',
          quantity: 30,
          expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          daysUntilExpiry: 7,
          severity: 'warning',
          createdAt: new Date(),
          acknowledged: false
        }
      ];
    }
  }

  static async acknowledgeExpiryAlert(alertId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE}/alerts/expiry/${alertId}/acknowledge`, {
        method: 'POST'
      });
      return response.ok;
    } catch (error) {
      console.error('Error acknowledging expiry alert:', error);
      return false;
    }
  }

  static async markBatchAsExpired(batchId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE}/expiry/batches/${batchId}/expire`, {
        method: 'POST'
      });
      return response.ok;
    } catch (error) {
      console.error('Error marking batch as expired:', error);
      return false;
    }
  }

  // Inventory Reports
  static async getInventoryReport(startDate: Date, endDate: Date): Promise<any> {
    try {
      const response = await fetch(`${this.API_BASE}/reports/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate, endDate })
      });
      if (!response.ok) throw new Error('Failed to fetch inventory report');
      return await response.json();
    } catch (error) {
      console.error('Error fetching inventory report:', error);
      throw error;
    }
  }

  static async getStockMovementHistory(productId: string, limit: number = 50): Promise<any[]> {
    try {
      const response = await fetch(`${this.API_BASE}/stock/${productId}/history?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch stock movement history');
      return await response.json();
    } catch (error) {
      console.error('Error fetching stock movement history:', error);
      return [];
    }
  }

  // Utility Methods
  static async checkProductAvailability(productId: string, requestedQuantity: number): Promise<{
    available: boolean;
    availableQuantity: number;
    message?: string;
  }> {
    try {
      const stockLevel = await this.getStockLevel(productId);
      const available = stockLevel.availableStock >= requestedQuantity;
      
      return {
        available,
        availableQuantity: stockLevel.availableStock,
        message: available 
          ? undefined 
          : `Only ${stockLevel.availableStock} items available`
      };
    } catch (error) {
      console.error('Error checking product availability:', error);
      return {
        available: false,
        availableQuantity: 0,
        message: 'Unable to check availability'
      };
    }
  }

  static async bulkCheckAvailability(items: { productId: string; quantity: number }[]): Promise<{
    allAvailable: boolean;
    unavailableItems: { productId: string; requested: number; available: number }[];
  }> {
    try {
      const productIds = items.map(item => item.productId);
      const stockLevels = await this.getStockLevels(productIds);
      
      const unavailableItems: { productId: string; requested: number; available: number }[] = [];
      
      for (const item of items) {
        const stockLevel = stockLevels.find(sl => sl.productId === item.productId);
        if (!stockLevel || stockLevel.availableStock < item.quantity) {
          unavailableItems.push({
            productId: item.productId,
            requested: item.quantity,
            available: stockLevel?.availableStock || 0
          });
        }
      }
      
      return {
        allAvailable: unavailableItems.length === 0,
        unavailableItems
      };
    } catch (error) {
      console.error('Error bulk checking availability:', error);
      return {
        allAvailable: false,
        unavailableItems: items.map(item => ({
          productId: item.productId,
          requested: item.quantity,
          available: 0
        }))
      };
    }
  }

  static getDaysUntilExpiry(expiryDate: Date): number {
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  static getExpirySeverity(daysUntilExpiry: number): 'critical' | 'warning' | 'normal' {
    if (daysUntilExpiry <= 2) return 'critical';
    if (daysUntilExpiry <= 7) return 'warning';
    return 'normal';
  }

  static formatStockStatus(stockLevel: StockLevel): {
    status: 'in_stock' | 'low_stock' | 'out_of_stock';
    message: string;
    color: string;
  } {
    if (stockLevel.availableStock === 0) {
      return {
        status: 'out_of_stock',
        message: 'Out of Stock',
        color: 'red'
      };
    }
    
    if (stockLevel.availableStock <= stockLevel.reorderPoint) {
      return {
        status: 'low_stock',
        message: `Low Stock (${stockLevel.availableStock} left)`,
        color: 'orange'
      };
    }
    
    return {
      status: 'in_stock',
      message: `In Stock (${stockLevel.availableStock} available)`,
      color: 'green'
    };
  }
}

export default InventoryService;