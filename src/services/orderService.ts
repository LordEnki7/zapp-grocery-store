import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import type { 
  Order, 
  OrderItem, 
  OrderStatus, 
  OrderTracking,
  Address,
  PaymentMethod,
  ShippingMethod,
  DeliverySchedule
} from '../types';
import type { CartItem } from '../context/CartContext';
import { InputSanitizer } from '../utils/security';

export class OrderService {
  private static readonly COLLECTION = 'orders';
  private static readonly TRACKING_COLLECTION = 'order_tracking';

  // Create a new order
  static async createOrder(orderData: {
    userId: string;
    items: CartItem[];
    billingAddress: Address;
    shippingAddress: Address;
    paymentMethod: PaymentMethod;
    shippingMethod: ShippingMethod;
    deliverySchedule?: DeliverySchedule;
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
    currency: string;
    notes?: string;
  }): Promise<string> {
    try {
      const orderNumber = await this.generateOrderNumber();
      
      const orderItems: OrderItem[] = orderData.items.map(item => ({
        id: crypto.randomUUID(),
        productId: item.product.id,
        productName: item.product.name,
        productImage: item.product.primaryImage,
        variantId: item.selectedVariant,
        variantName: item.selectedVariant ? `Variant: ${item.selectedVariant}` : undefined,
        quantity: item.quantity,
        unitPrice: item.product.price,
        totalPrice: item.product.price * item.quantity,
        weight: item.product.weight,
        sku: item.product.sku,
        notes: item.notes
      }));

      const order: Omit<Order, 'id'> = {
        orderNumber,
        userId: orderData.userId,
        status: 'pending',
        items: orderItems,
        subtotal: orderData.subtotal,
        tax: orderData.tax,
        shipping: orderData.shipping,
        discount: orderData.discount,
        total: orderData.total,
        currency: orderData.currency,
        billingAddress: orderData.billingAddress,
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod,
        shippingMethod: orderData.shippingMethod,
        deliverySchedule: orderData.deliverySchedule,
        notes: orderData.notes,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const sanitizedOrder = InputSanitizer.sanitizeObject(order);
      const docRef = await addDoc(collection(db, this.COLLECTION), {
        ...sanitizedOrder,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Create initial tracking entry
      await this.addTrackingEntry(docRef.id, 'pending', 'Order created and awaiting confirmation');

      return docRef.id;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
  }

  // Get order by ID
  static async getOrder(orderId: string): Promise<Order | null> {
    try {
      const docRef = doc(db, this.COLLECTION, orderId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          estimatedDelivery: data.estimatedDelivery?.toDate(),
          actualDelivery: data.actualDelivery?.toDate()
        } as Order;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw new Error('Failed to fetch order');
    }
  }

  // Get orders for a user
  static async getUserOrders(userId: string, limitCount: number = 20): Promise<Order[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        estimatedDelivery: doc.data().estimatedDelivery?.toDate(),
        actualDelivery: doc.data().actualDelivery?.toDate()
      })) as Order[];
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw new Error('Failed to fetch orders');
    }
  }

  // Update order status
  static async updateOrderStatus(
    orderId: string, 
    status: OrderStatus, 
    message?: string,
    trackingNumber?: string,
    estimatedDelivery?: Date
  ): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      // Update order
      const orderRef = doc(db, this.COLLECTION, orderId);
      const updateData: any = {
        status,
        updatedAt: serverTimestamp()
      };
      
      if (trackingNumber) updateData.trackingNumber = trackingNumber;
      if (estimatedDelivery) updateData.estimatedDelivery = estimatedDelivery;
      
      batch.update(orderRef, updateData);
      
      // Add tracking entry
      const trackingRef = doc(collection(db, this.TRACKING_COLLECTION));
      const trackingEntry: Omit<OrderTracking, 'id'> = {
        orderId,
        status,
        message: message || this.getStatusMessage(status),
        timestamp: new Date(),
        isPublic: true
      };
      
      batch.set(trackingRef, {
        ...trackingEntry,
        timestamp: serverTimestamp()
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error updating order status:', error);
      throw new Error('Failed to update order status');
    }
  }

  // Get order tracking history
  static async getOrderTracking(orderId: string): Promise<OrderTracking[]> {
    try {
      const q = query(
        collection(db, this.TRACKING_COLLECTION),
        where('orderId', '==', orderId),
        where('isPublic', '==', true),
        orderBy('timestamp', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })) as OrderTracking[];
    } catch (error) {
      console.error('Error fetching order tracking:', error);
      throw new Error('Failed to fetch tracking information');
    }
  }

  // Add tracking entry
  static async addTrackingEntry(
    orderId: string, 
    status: OrderStatus, 
    message: string,
    location?: string,
    isPublic: boolean = true
  ): Promise<void> {
    try {
      const trackingEntry: Omit<OrderTracking, 'id'> = {
        orderId,
        status,
        message,
        location,
        timestamp: new Date(),
        isPublic
      };
      
      await addDoc(collection(db, this.TRACKING_COLLECTION), {
        ...trackingEntry,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding tracking entry:', error);
      throw new Error('Failed to add tracking entry');
    }
  }

  // Cancel order
  static async cancelOrder(orderId: string, reason: string): Promise<void> {
    try {
      await this.updateOrderStatus(orderId, 'cancelled', `Order cancelled: ${reason}`);
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw new Error('Failed to cancel order');
    }
  }

  // Calculate order totals
  static calculateOrderTotals(
    items: CartItem[],
    shippingCost: number = 0,
    taxRate: number = 0.08,
    discountAmount: number = 0
  ): {
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
  } {
    const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const discountedSubtotal = Math.max(0, subtotal - discountAmount);
    const tax = discountedSubtotal * taxRate;
    const total = discountedSubtotal + tax + shippingCost;
    
    return {
      subtotal,
      tax: Math.round(tax * 100) / 100,
      shipping: shippingCost,
      discount: discountAmount,
      total: Math.round(total * 100) / 100
    };
  }

  // Generate unique order number
  private static async generateOrderNumber(): Promise<string> {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp.slice(-8)}-${random}`;
  }

  // Get status message
  private static getStatusMessage(status: OrderStatus): string {
    const messages: Record<OrderStatus, string> = {
      pending: 'Order received and awaiting confirmation',
      confirmed: 'Order confirmed and being prepared',
      processing: 'Order is being processed',
      packed: 'Order has been packed and ready for shipment',
      shipped: 'Order has been shipped',
      out_for_delivery: 'Order is out for delivery',
      delivered: 'Order has been delivered',
      cancelled: 'Order has been cancelled',
      refunded: 'Order has been refunded'
    };
    
    return messages[status] || 'Order status updated';
  }

  // Get orders by status (for admin)
  static async getOrdersByStatus(status: OrderStatus, limitCount: number = 50): Promise<Order[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('status', '==', status),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        estimatedDelivery: doc.data().estimatedDelivery?.toDate(),
        actualDelivery: doc.data().actualDelivery?.toDate()
      })) as Order[];
    } catch (error) {
      console.error('Error fetching orders by status:', error);
      throw new Error('Failed to fetch orders');
    }
  }

  // Search orders
  static async searchOrders(searchTerm: string, limitCount: number = 20): Promise<Order[]> {
    try {
      // Note: This is a basic implementation. For production, consider using Algolia or similar
      const q = query(
        collection(db, this.COLLECTION),
        orderBy('createdAt', 'desc'),
        limit(limitCount * 2) // Get more to filter client-side
      );
      
      const querySnapshot = await getDocs(q);
      const orders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        estimatedDelivery: doc.data().estimatedDelivery?.toDate(),
        actualDelivery: doc.data().actualDelivery?.toDate()
      })) as Order[];
      
      // Filter by search term
      const filtered = orders.filter(order => 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => 
          item.productName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      
      return filtered.slice(0, limitCount);
    } catch (error) {
      console.error('Error searching orders:', error);
      throw new Error('Failed to search orders');
    }
  }
}