// Core User and Authentication Types
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: Date;
  preferences: {
    language: 'en' | 'es';
    currency: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };
  addresses: Address[];
  loyaltyPoints: number;
  membershipTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  // Business account extensions
  accountType: 'consumer' | 'business';
  businessProfile?: BusinessProfile;
  createdAt: Date;
  updatedAt: Date;
}

// Business Account Types
export interface BusinessProfile {
  id: string;
  businessName: string;
  businessType: 'restaurant' | 'catering' | 'grocery_store' | 'food_truck' | 'distributor' | 'other';
  taxId?: string;
  businessLicense?: string;
  taxExemptStatus: {
    isExempt: boolean;
    exemptionNumber?: string;
    exemptionCertificate?: string;
    validUntil?: Date;
  };
  paymentTerms: {
    type: 'immediate' | 'net_15' | 'net_30' | 'net_60';
    creditLimit?: number;
    approvedCredit: boolean;
  };
  volumeDiscountTier: 'standard' | 'bronze' | 'silver' | 'gold' | 'platinum';
  businessSupport: {
    dedicatedRep?: string;
    repEmail?: string;
    repPhone?: string;
    prioritySupport: boolean;
  };
  businessAddress: Address;
  billingContact: {
    name: string;
    email: string;
    phone: string;
  };
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'suspended';
  approvedAt?: Date;
  approvedBy?: string;
  monthlySpend: number;
  totalSpend: number;
  createdAt: Date;
  updatedAt: Date;
}

// Volume Discount and Business Pricing Types
export interface VolumeDiscount {
  quantity: number;
  discountPercentage: number;
  label?: string;
  businessTierRequired?: 'standard' | 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface BusinessPricing {
  productId: string;
  standardPrice: number;
  businessTiers: {
    bronze: { discount: number; minimumQuantity?: number };
    silver: { discount: number; minimumQuantity?: number };
    gold: { discount: number; minimumQuantity?: number };
    platinum: { discount: number; minimumQuantity?: number };
  };
  volumeBreaks: VolumeDiscount[];
  lastUpdated: Date;
}

// Payment Terms and Credit Types
export interface PaymentTerms {
  id: string;
  businessId: string;
  type: 'immediate' | 'net_15' | 'net_30' | 'net_60';
  creditLimit: number;
  currentBalance: number;
  availableCredit: number;
  paymentHistory: PaymentRecord[];
  approvedAt: Date;
  approvedBy: string;
  nextReviewDate: Date;
  status: 'active' | 'suspended' | 'under_review';
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  paymentMethod?: string;
  notes?: string;
}

// Business Support Types
export interface BusinessSupport {
  id: string;
  businessId: string;
  supportTier: 'standard' | 'priority' | 'dedicated';
  dedicatedRep?: {
    name: string;
    email: string;
    phone: string;
    timezone: string;
  };
  supportChannels: {
    email: boolean;
    phone: boolean;
    chat: boolean;
    video: boolean;
  };
  responseTime: {
    email: string; // e.g., "4 hours"
    phone: string; // e.g., "immediate"
    chat: string; // e.g., "5 minutes"
  };
  businessHours: {
    timezone: string;
    monday: { start: string; end: string };
    tuesday: { start: string; end: string };
    wednesday: { start: string; end: string };
    thursday: { start: string; end: string };
    friday: { start: string; end: string };
    saturday?: { start: string; end: string };
    sunday?: { start: string; end: string };
  };
  escalationPath: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Tax Exemption Types
export interface TaxExemption {
  id: string;
  businessId: string;
  exemptionType: 'resale' | 'nonprofit' | 'government' | 'agricultural' | 'manufacturing';
  exemptionNumber: string;
  issuingState: string;
  issuingAuthority: string;
  validFrom: Date;
  validUntil?: Date;
  certificateUrl?: string;
  applicableStates: string[];
  applicableCategories?: string[]; // Product categories this exemption applies to
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'expired';
  verifiedAt?: Date;
  verifiedBy?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  id: string;
  type: 'billing' | 'shipping' | 'both';
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

// Order Management Types
export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  billingAddress: Address;
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  shippingMethod: ShippingMethod;
  deliverySchedule?: DeliverySchedule;
  notes?: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  weight: string;
  sku: string;
  notes?: string;
}

export interface OrderTracking {
  id: string;
  orderId: string;
  status: OrderStatus;
  message: string;
  location?: string;
  timestamp: Date;
  isPublic: boolean;
}

// Payment Types
export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay' | 'bank_transfer';
  provider: string;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  paymentMethod: PaymentMethod;
  transactionId?: string;
  gatewayResponse?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface Refund {
  id: string;
  orderId: string;
  paymentId: string;
  amount: number;
  reason: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processedAt?: Date;
  createdAt: Date;
}

// Shipping and Delivery Types
export interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  states?: string[];
  cities?: string[];
  zipCodes?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  zoneId: string;
  type: 'standard' | 'express' | 'overnight' | 'same_day';
  baseRate: number;
  weightRate?: number;
  distanceRate?: number;
  freeShippingThreshold?: number;
  estimatedDays: {
    min: number;
    max: number;
  };
  specialHandling: {
    frozen: boolean;
    fragile: boolean;
    hazardous: boolean;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeliverySchedule {
  id: string;
  date: Date;
  timeSlot: {
    start: string;
    end: string;
  };
  type: 'standard' | 'express' | 'scheduled';
  instructions?: string;
}

// Inventory Management Types
export interface InventoryItem {
  id: string;
  productId: string;
  variantId?: string;
  sku: string;
  quantity: number;
  reserved: number;
  available: number;
  lowStockThreshold: number;
  reorderPoint: number;
  reorderQuantity: number;
  cost: number;
  location: string;
  expiryDate?: Date;
  batchNumber?: string;
  supplierId?: string;
  lastRestocked: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockMovement {
  id: string;
  inventoryItemId: string;
  type: 'in' | 'out' | 'adjustment' | 'reserved' | 'unreserved';
  quantity: number;
  reason: string;
  reference?: string;
  userId: string;
  createdAt: Date;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: Address;
  paymentTerms: string;
  leadTime: number;
  minimumOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Customer Experience Types
export interface Wishlist {
  id: string;
  userId: string;
  name: string;
  items: WishlistItem[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WishlistItem {
  id: string;
  productId: string;
  variantId?: string;
  addedAt: Date;
  notes?: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  verified: boolean;
  helpful: number;
  reported: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

// Marketing and Promotions Types
export interface PromoCode {
  id: string;
  code: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed_amount' | 'free_shipping';
  value: number;
  minimumOrder?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  userLimit?: number;
  validFrom: Date;
  validTo: Date;
  applicableProducts?: string[];
  applicableCategories?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoyaltyProgram {
  id: string;
  name: string;
  pointsPerDollar: number;
  tiers: LoyaltyTier[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoyaltyTier {
  id: string;
  name: string;
  minimumPoints: number;
  benefits: {
    discountPercentage: number;
    freeShipping: boolean;
    earlyAccess: boolean;
    birthdayBonus: number;
  };
}

export interface LoyaltyTransaction {
  id: string;
  userId: string;
  orderId?: string;
  type: 'earned' | 'redeemed' | 'expired' | 'bonus';
  points: number;
  description: string;
  createdAt: Date;
}

// Invoice and Receipt Types
export interface Invoice {
  id: string;
  orderId: string;
  invoiceNumber: string;
  type: 'invoice' | 'proforma' | 'receipt';
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  dueDate?: Date;
  paidAt?: Date;
  notes?: string;
  pdfUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Analytics and Reporting Types
export interface AnalyticsEvent {
  id: string;
  userId?: string;
  sessionId: string;
  event: string;
  properties: Record<string, any>;
  timestamp: Date;
}

export interface ProductAnalytics {
  productId: string;
  views: number;
  addToCart: number;
  purchases: number;
  revenue: number;
  conversionRate: number;
  averageRating: number;
  reviewCount: number;
  period: 'day' | 'week' | 'month' | 'year';
  date: Date;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'order_update' | 'promotion' | 'stock_alert' | 'review_request' | 'system';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
}

// Search and Filter Types
export interface SearchFilters {
  categories?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  brands?: string[];
  ratings?: number[];
  inStock?: boolean;
  onSale?: boolean;
  tags?: string[];
  origin?: string[];
}

export interface SearchResult {
  products: any[];
  totalCount: number;
  facets: {
    categories: { name: string; count: number }[];
    brands: { name: string; count: number }[];
    priceRanges: { range: string; count: number }[];
  };
  suggestions?: string[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}