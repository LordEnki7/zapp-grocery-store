export interface GiftCard {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  primaryImage?: string;
  images?: string[];
  image?: string; // Legacy support
  denominations: number[];
  customAmount?: boolean;
  minAmount?: number;
  maxAmount?: number;
  isPopular?: boolean;
  discount?: number;
  averageRating?: number;
  rating?: number; // Legacy support
  reviewCount?: number;
  expirationPolicy?: string;
  termsAndConditions?: string;
  availableDeliveryMethods?: ('email' | 'sms' | 'print')[];
  processingTime?: string;
  restrictions?: string[];
  tags?: string[];
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GiftCardPurchaseDetails {
  cardId: string;
  amount: number;
  quantity: number;
  recipientName: string;
  recipientEmail: string;
  senderName: string;
  message: string;
  deliveryMethod: 'email' | 'sms' | 'print';
  deliveryDate?: string;
}