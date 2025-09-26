import { CartItem, DeliveryZone, ShippingOption, DeliverySlot, Address } from '../types';

export interface DeliveryCalculation {
  baseRate: number;
  distanceRate: number;
  perishableHandling: number;
  rushDelivery: number;
  total: number;
  estimatedTime: string;
  availableSlots: DeliverySlot[];
}

export interface DeliverySchedule {
  deliveryDate: Date;
  timeSlot: DeliverySlot;
  specialInstructions?: string;
  contactlessDelivery: boolean;
  requiresSignature: boolean;
}

export class DeliveryService {
  private static deliveryZones: DeliveryZone[] = [
    {
      id: 'zone-1',
      name: 'Downtown Miami',
      zipCodes: ['33101', '33102', '33131', '33132'],
      baseRate: 4.99,
      freeDeliveryThreshold: 35,
      maxDeliveryTime: 60,
      isActive: true,
      perishableHandling: true,
      rushDeliveryAvailable: true
    },
    {
      id: 'zone-2',
      name: 'Miami Beach',
      zipCodes: ['33139', '33140', '33141'],
      baseRate: 6.99,
      freeDeliveryThreshold: 50,
      maxDeliveryTime: 90,
      isActive: true,
      perishableHandling: true,
      rushDeliveryAvailable: true
    },
    {
      id: 'zone-3',
      name: 'Coral Gables',
      zipCodes: ['33134', '33146', '33156'],
      baseRate: 5.99,
      freeDeliveryThreshold: 40,
      maxDeliveryTime: 75,
      isActive: true,
      perishableHandling: true,
      rushDeliveryAvailable: false
    },
    {
      id: 'zone-4',
      name: 'Aventura',
      zipCodes: ['33180', '33160'],
      baseRate: 7.99,
      freeDeliveryThreshold: 60,
      maxDeliveryTime: 120,
      isActive: true,
      perishableHandling: false,
      rushDeliveryAvailable: false
    }
  ];

  private static shippingOptions: ShippingOption[] = [
    {
      id: 'standard',
      name: 'Standard Delivery',
      description: 'Delivery within 2-4 hours',
      basePrice: 0,
      estimatedTime: '2-4 hours',
      isDefault: true,
      requiresScheduling: false
    },
    {
      id: 'express',
      name: 'Express Delivery',
      description: 'Delivery within 1-2 hours',
      basePrice: 3.99,
      estimatedTime: '1-2 hours',
      isDefault: false,
      requiresScheduling: false
    },
    {
      id: 'scheduled',
      name: 'Scheduled Delivery',
      description: 'Choose your delivery time',
      basePrice: 1.99,
      estimatedTime: 'As scheduled',
      isDefault: false,
      requiresScheduling: true
    },
    {
      id: 'next_day',
      name: 'Next Day Delivery',
      description: 'Delivery by tomorrow',
      basePrice: 2.99,
      estimatedTime: 'Next day',
      isDefault: false,
      requiresScheduling: true
    }
  ];

  static async getDeliveryZone(zipCode: string): Promise<DeliveryZone | null> {
    return this.deliveryZones.find(zone => 
      zone.zipCodes.includes(zipCode) && zone.isActive
    ) || null;
  }

  static async getAllDeliveryZones(): Promise<DeliveryZone[]> {
    return this.deliveryZones.filter(zone => zone.isActive);
  }

  static async isDeliveryAvailable(zipCode: string): Promise<boolean> {
    const zone = await this.getDeliveryZone(zipCode);
    return zone !== null;
  }

  static async calculateDeliveryFee(
    items: CartItem[],
    zipCode: string,
    shippingOptionId: string = 'standard',
    isRushDelivery: boolean = false
  ): Promise<DeliveryCalculation> {
    const zone = await this.getDeliveryZone(zipCode);
    const shippingOption = this.shippingOptions.find(opt => opt.id === shippingOptionId);
    
    if (!zone || !shippingOption) {
      throw new Error('Delivery not available for this location');
    }

    // Calculate base rates
    let baseRate = zone.baseRate + shippingOption.basePrice;
    let distanceRate = 0; // Could be calculated based on actual distance
    let perishableHandling = 0;
    let rushDelivery = 0;

    // Check for perishable items
    const hasPerishables = items.some(item => 
      item.product.category === 'fresh-produce' || 
      item.product.category === 'dairy' ||
      item.product.category === 'frozen'
    );

    if (hasPerishables && zone.perishableHandling) {
      perishableHandling = 2.99;
    }

    // Rush delivery fee
    if (isRushDelivery && zone.rushDeliveryAvailable) {
      rushDelivery = 4.99;
    }

    // Calculate total order value
    const orderTotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    // Apply free delivery threshold
    if (orderTotal >= zone.freeDeliveryThreshold) {
      baseRate = 0;
    }

    const total = baseRate + distanceRate + perishableHandling + rushDelivery;

    // Get available delivery slots
    const availableSlots = await this.getAvailableDeliverySlots(
      zone.id,
      shippingOptionId,
      hasPerishables
    );

    return {
      baseRate,
      distanceRate,
      perishableHandling,
      rushDelivery,
      total,
      estimatedTime: shippingOption.estimatedTime,
      availableSlots
    };
  }

  static async getShippingOptions(zipCode: string): Promise<ShippingOption[]> {
    const zone = await this.getDeliveryZone(zipCode);
    if (!zone) return [];

    return this.shippingOptions.filter(option => {
      // Filter options based on zone capabilities
      if (option.id === 'express' && !zone.rushDeliveryAvailable) {
        return false;
      }
      return true;
    });
  }

  static async getAvailableDeliverySlots(
    zoneId: string,
    shippingOptionId: string,
    hasPerishables: boolean = false
  ): Promise<DeliverySlot[]> {
    const now = new Date();
    const slots: DeliverySlot[] = [];

    // Generate slots for the next 7 days
    for (let day = 0; day < 7; day++) {
      const date = new Date(now);
      date.setDate(date.getDate() + day);
      
      // Skip past times for today
      const startHour = day === 0 ? Math.max(now.getHours() + 2, 9) : 9;
      const endHour = 21; // 9 PM

      for (let hour = startHour; hour < endHour; hour += 2) {
        const slotStart = new Date(date);
        slotStart.setHours(hour, 0, 0, 0);
        
        const slotEnd = new Date(slotStart);
        slotEnd.setHours(hour + 2, 0, 0, 0);

        // Check availability (mock logic)
        const isAvailable = Math.random() > 0.3; // 70% availability
        const capacity = Math.floor(Math.random() * 10) + 5;
        const booked = Math.floor(Math.random() * capacity);

        slots.push({
          id: `${zoneId}-${date.toISOString().split('T')[0]}-${hour}`,
          startTime: slotStart,
          endTime: slotEnd,
          isAvailable: isAvailable && booked < capacity,
          capacity,
          booked,
          price: shippingOptionId === 'scheduled' ? 1.99 : 0,
          perishableCompatible: !hasPerishables || hour <= 18 // No perishables after 6 PM
        });
      }
    }

    return slots.filter(slot => 
      slot.isAvailable && 
      (!hasPerishables || slot.perishableCompatible)
    );
  }

  static async scheduleDelivery(
    orderId: string,
    schedule: DeliverySchedule
  ): Promise<{ success: boolean; trackingNumber?: string; error?: string }> {
    try {
      // Validate delivery slot is still available
      const slot = await this.validateDeliverySlot(schedule.timeSlot.id);
      if (!slot) {
        return { success: false, error: 'Selected delivery slot is no longer available' };
      }

      // Generate tracking number
      const trackingNumber = `ZAP${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      // Mock scheduling logic
      console.log('Scheduling delivery:', {
        orderId,
        schedule,
        trackingNumber
      });

      // In a real implementation, this would:
      // 1. Reserve the delivery slot
      // 2. Create delivery record in database
      // 3. Notify delivery service/drivers
      // 4. Send confirmation to customer

      return { success: true, trackingNumber };
    } catch (error) {
      console.error('Error scheduling delivery:', error);
      return { success: false, error: 'Failed to schedule delivery' };
    }
  }

  static async validateDeliverySlot(slotId: string): Promise<DeliverySlot | null> {
    // Mock validation - in real implementation, check database
    const [zoneId, date, hour] = slotId.split('-');
    const slotDate = new Date(date);
    slotDate.setHours(parseInt(hour), 0, 0, 0);

    // Check if slot is in the future
    if (slotDate <= new Date()) {
      return null;
    }

    // Mock slot data
    return {
      id: slotId,
      startTime: slotDate,
      endTime: new Date(slotDate.getTime() + 2 * 60 * 60 * 1000),
      isAvailable: true,
      capacity: 10,
      booked: 3,
      price: 1.99,
      perishableCompatible: true
    };
  }

  static async getDeliveryInstructions(items: CartItem[]): Promise<string[]> {
    const instructions: string[] = [];

    // Check for perishable items
    const perishableItems = items.filter(item => 
      item.product.category === 'fresh-produce' || 
      item.product.category === 'dairy' ||
      item.product.category === 'frozen'
    );

    if (perishableItems.length > 0) {
      instructions.push('Keep refrigerated items cold during transport');
      instructions.push('Deliver frozen items first');
      
      const frozenItems = perishableItems.filter(item => 
        item.product.category === 'frozen'
      );
      
      if (frozenItems.length > 0) {
        instructions.push('Use insulated bags for frozen products');
      }
    }

    // Check for fragile items
    const fragileItems = items.filter(item => 
      item.product.tags?.includes('fragile') ||
      item.product.category === 'beverages'
    );

    if (fragileItems.length > 0) {
      instructions.push('Handle fragile items with care');
      instructions.push('Keep glass containers upright');
    }

    // Check for heavy items
    const heavyItems = items.filter(item => 
      (item.product.weight || 0) > 5 // 5 lbs
    );

    if (heavyItems.length > 0) {
      instructions.push('Heavy items - use proper lifting technique');
    }

    return instructions;
  }

  static async trackDelivery(trackingNumber: string): Promise<{
    status: 'preparing' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered';
    location?: string;
    estimatedArrival?: Date;
    driverName?: string;
    driverPhone?: string;
    updates: Array<{
      timestamp: Date;
      status: string;
      message: string;
      location?: string;
    }>;
  }> {
    // Mock tracking data
    const statuses = ['preparing', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'];
    const currentStatusIndex = Math.floor(Math.random() * statuses.length);
    const currentStatus = statuses[currentStatusIndex] as any;

    const updates = [];
    const now = new Date();

    for (let i = 0; i <= currentStatusIndex; i++) {
      const timestamp = new Date(now.getTime() - (currentStatusIndex - i) * 30 * 60 * 1000);
      updates.push({
        timestamp,
        status: statuses[i],
        message: this.getStatusMessage(statuses[i]),
        location: i >= 2 ? 'Miami, FL' : undefined
      });
    }

    return {
      status: currentStatus,
      location: currentStatusIndex >= 2 ? 'Miami, FL' : undefined,
      estimatedArrival: currentStatusIndex < 4 ? new Date(now.getTime() + 30 * 60 * 1000) : undefined,
      driverName: currentStatusIndex >= 3 ? 'John Smith' : undefined,
      driverPhone: currentStatusIndex >= 3 ? '+1 (555) 123-4567' : undefined,
      updates
    };
  }

  private static getStatusMessage(status: string): string {
    const messages = {
      preparing: 'Your order is being prepared',
      picked_up: 'Order picked up from store',
      in_transit: 'Order is on the way to delivery area',
      out_for_delivery: 'Out for delivery - driver assigned',
      delivered: 'Order delivered successfully'
    };
    return messages[status as keyof typeof messages] || 'Status update';
  }

  static async getDeliveryEstimate(
    fromZipCode: string,
    toZipCode: string,
    shippingOptionId: string = 'standard'
  ): Promise<{
    estimatedTime: string;
    estimatedArrival: Date;
    distance?: number;
  }> {
    const shippingOption = this.shippingOptions.find(opt => opt.id === shippingOptionId);
    const zone = await this.getDeliveryZone(toZipCode);

    if (!shippingOption || !zone) {
      throw new Error('Unable to calculate delivery estimate');
    }

    const now = new Date();
    let estimatedMinutes = zone.maxDeliveryTime;

    // Adjust based on shipping option
    switch (shippingOptionId) {
      case 'express':
        estimatedMinutes = Math.min(estimatedMinutes, 90);
        break;
      case 'standard':
        estimatedMinutes = zone.maxDeliveryTime;
        break;
      case 'next_day':
        estimatedMinutes = 24 * 60; // Next day
        break;
    }

    const estimatedArrival = new Date(now.getTime() + estimatedMinutes * 60 * 1000);

    return {
      estimatedTime: shippingOption.estimatedTime,
      estimatedArrival,
      distance: Math.floor(Math.random() * 20) + 5 // Mock distance in miles
    };
  }

  static async updateDeliveryPreferences(
    userId: string,
    preferences: {
      defaultAddress?: Address;
      contactlessDelivery?: boolean;
      deliveryInstructions?: string;
      preferredTimeSlots?: string[];
      notificationPreferences?: {
        sms: boolean;
        email: boolean;
        push: boolean;
      };
    }
  ): Promise<boolean> {
    try {
      // Mock update - in real implementation, save to database
      console.log('Updating delivery preferences for user:', userId, preferences);
      return true;
    } catch (error) {
      console.error('Error updating delivery preferences:', error);
      return false;
    }
  }
}

export default DeliveryService;