import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { 
  PaymentMethod, 
  PaymentIntent, 
  Order, 
  Address, 
  TaxCalculation,
  PaymentMethodType 
} from '../types';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '');

export class PaymentService {
  private static stripe: Stripe | null = null;

  static async getStripe(): Promise<Stripe | null> {
    if (!this.stripe) {
      this.stripe = await stripePromise;
    }
    return this.stripe;
  }

  // Create payment intent for order
  static async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    orderId: string,
    customerId?: string
  ): Promise<{ clientSecret: string; paymentIntentId: string }> {
    try {
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency,
          orderId,
          customerId,
          automatic_payment_methods: {
            enabled: true,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const data = await response.json();
      return {
        clientSecret: data.client_secret,
        paymentIntentId: data.id
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  // Process payment with Stripe Elements
  static async processPayment(
    elements: StripeElements,
    clientSecret: string,
    paymentData: {
      email: string;
      name: string;
      address: Address;
      phone?: string;
    }
  ): Promise<{ success: boolean; paymentIntent?: any; error?: string }> {
    try {
      const stripe = await this.getStripe();
      if (!stripe) {
        throw new Error('Stripe not initialized');
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation`,
          receipt_email: paymentData.email,
          shipping: {
            name: paymentData.name,
            phone: paymentData.phone,
            address: {
              line1: paymentData.address.street,
              line2: paymentData.address.apartment || '',
              city: paymentData.address.city,
              state: paymentData.address.state,
              postal_code: paymentData.address.zipCode,
              country: paymentData.address.country || 'US',
            },
          },
        },
        redirect: 'if_required',
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, paymentIntent };
    } catch (error) {
      console.error('Error processing payment:', error);
      return { success: false, error: 'Payment processing failed' };
    }
  }

  // Save payment method for future use
  static async savePaymentMethod(
    paymentMethodId: string,
    customerId: string,
    isDefault: boolean = false
  ): Promise<PaymentMethod> {
    try {
      const response = await fetch('/api/payments/save-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          paymentMethodId,
          customerId,
          isDefault
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save payment method');
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving payment method:', error);
      throw error;
    }
  }

  // Get saved payment methods
  static async getPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    try {
      const response = await fetch(`/api/payments/methods/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payment methods');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  }

  // Delete payment method
  static async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      const response = await fetch(`/api/payments/methods/${paymentMethodId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete payment method');
      }
    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw error;
    }
  }

  // Calculate tax for order
  static async calculateTax(
    items: Array<{ id: string; price: number; quantity: number; taxable: boolean }>,
    shippingAddress: Address,
    shippingCost: number = 0
  ): Promise<TaxCalculation> {
    try {
      const response = await fetch('/api/payments/calculate-tax', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          items,
          shippingAddress,
          shippingCost
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate tax');
      }

      return await response.json();
    } catch (error) {
      console.error('Error calculating tax:', error);
      // Return default tax calculation if service fails
      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const taxRate = 0.08; // Default 8% tax rate
      const taxAmount = (subtotal + shippingCost) * taxRate;
      
      return {
        subtotal,
        taxAmount,
        taxRate,
        shippingCost,
        total: subtotal + taxAmount + shippingCost,
        taxBreakdown: [
          {
            type: 'sales_tax',
            rate: taxRate,
            amount: taxAmount,
            jurisdiction: 'Default'
          }
        ]
      };
    }
  }

  // Process refund
  static async processRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: string
  ): Promise<{ success: boolean; refund?: any; error?: string }> {
    try {
      const response = await fetch('/api/payments/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          paymentIntentId,
          amount: amount ? Math.round(amount * 100) : undefined, // Convert to cents
          reason
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process refund');
      }

      const refund = await response.json();
      return { success: true, refund };
    } catch (error) {
      console.error('Error processing refund:', error);
      return { success: false, error: 'Refund processing failed' };
    }
  }

  // Create customer in Stripe
  static async createCustomer(
    email: string,
    name: string,
    phone?: string,
    address?: Address
  ): Promise<{ customerId: string }> {
    try {
      const response = await fetch('/api/payments/create-customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          email,
          name,
          phone,
          address: address ? {
            line1: address.street,
            line2: address.apartment || '',
            city: address.city,
            state: address.state,
            postal_code: address.zipCode,
            country: address.country || 'US',
          } : undefined
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create customer');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  // Setup payment method for future payments
  static async setupPaymentMethod(
    customerId: string,
    paymentMethodType: PaymentMethodType = 'card'
  ): Promise<{ clientSecret: string; setupIntentId: string }> {
    try {
      const response = await fetch('/api/payments/setup-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          customerId,
          payment_method_types: [paymentMethodType],
          usage: 'off_session'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create setup intent');
      }

      const data = await response.json();
      return {
        clientSecret: data.client_secret,
        setupIntentId: data.id
      };
    } catch (error) {
      console.error('Error creating setup intent:', error);
      throw error;
    }
  }

  // Confirm setup intent
  static async confirmSetupIntent(
    elements: StripeElements,
    clientSecret: string
  ): Promise<{ success: boolean; setupIntent?: any; error?: string }> {
    try {
      const stripe = await this.getStripe();
      if (!stripe) {
        throw new Error('Stripe not initialized');
      }

      const { error, setupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/account/payment-methods`,
        },
        redirect: 'if_required',
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, setupIntent };
    } catch (error) {
      console.error('Error confirming setup intent:', error);
      return { success: false, error: 'Setup confirmation failed' };
    }
  }

  // Get payment method details
  static async getPaymentMethodDetails(paymentMethodId: string): Promise<any> {
    try {
      const stripe = await this.getStripe();
      if (!stripe) {
        throw new Error('Stripe not initialized');
      }

      const { paymentMethod, error } = await stripe.retrievePaymentMethod(paymentMethodId);
      
      if (error) {
        throw new Error(error.message);
      }

      return paymentMethod;
    } catch (error) {
      console.error('Error retrieving payment method:', error);
      throw error;
    }
  }

  // Format payment method for display
  static formatPaymentMethod(paymentMethod: any): string {
    if (paymentMethod.type === 'card') {
      const card = paymentMethod.card;
      return `**** **** **** ${card.last4} (${card.brand.toUpperCase()})`;
    }
    
    return paymentMethod.type.charAt(0).toUpperCase() + paymentMethod.type.slice(1);
  }

  // Validate payment amount
  static validatePaymentAmount(amount: number): { valid: boolean; error?: string } {
    if (amount <= 0) {
      return { valid: false, error: 'Payment amount must be greater than zero' };
    }
    
    if (amount < 0.50) {
      return { valid: false, error: 'Minimum payment amount is $0.50' };
    }
    
    if (amount > 999999.99) {
      return { valid: false, error: 'Maximum payment amount is $999,999.99' };
    }
    
    return { valid: true };
  }

  // Get supported payment methods
  static getSupportedPaymentMethods(): PaymentMethodType[] {
    return ['card', 'paypal', 'apple_pay', 'google_pay'];
  }

  // Check if payment method is supported
  static isPaymentMethodSupported(type: PaymentMethodType): boolean {
    return this.getSupportedPaymentMethods().includes(type);
  }
}