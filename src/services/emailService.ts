// Email service for sending automated emails
// This is a mock implementation - in production, you would integrate with a service like SendGrid, Mailgun, or AWS SES

export interface EmailAttachment {
  filename: string;
  content: Uint8Array;
  contentType: string;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  attachments?: EmailAttachment[];
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private readonly defaultFrom = 'noreply@zapp-ecommerce.com';
  private readonly apiKey = process.env.REACT_APP_EMAIL_API_KEY;
  private readonly apiUrl = process.env.REACT_APP_EMAIL_API_URL;

  // Send email
  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      // In a real implementation, you would use a service like SendGrid
      // For now, we'll simulate the email sending
      console.log('Sending email:', {
        to: options.to,
        subject: options.subject,
        from: options.from || this.defaultFrom,
        hasAttachments: !!options.attachments?.length
      });

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In production, you would make an actual API call:
      /*
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: options.to }],
            subject: options.subject
          }],
          from: { email: options.from || this.defaultFrom },
          content: [
            {
              type: 'text/html',
              value: options.html
            },
            ...(options.text ? [{
              type: 'text/plain',
              value: options.text
            }] : [])
          ],
          attachments: options.attachments?.map(att => ({
            content: Buffer.from(att.content).toString('base64'),
            filename: att.filename,
            type: att.contentType,
            disposition: 'attachment'
          }))
        })
      });

      if (!response.ok) {
        throw new Error(`Email API error: ${response.statusText}`);
      }
      */

      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  // Send order confirmation email
  async sendOrderConfirmation(
    customerEmail: string,
    customerName: string,
    orderNumber: string,
    orderTotal: number
  ): Promise<void> {
    const template = this.getOrderConfirmationTemplate(customerName, orderNumber, orderTotal);
    
    await this.sendEmail({
      to: customerEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  // Send shipping notification
  async sendShippingNotification(
    customerEmail: string,
    customerName: string,
    orderNumber: string,
    trackingNumber: string,
    carrier: string
  ): Promise<void> {
    const template = this.getShippingNotificationTemplate(
      customerName,
      orderNumber,
      trackingNumber,
      carrier
    );
    
    await this.sendEmail({
      to: customerEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  // Send delivery confirmation
  async sendDeliveryConfirmation(
    customerEmail: string,
    customerName: string,
    orderNumber: string
  ): Promise<void> {
    const template = this.getDeliveryConfirmationTemplate(customerName, orderNumber);
    
    await this.sendEmail({
      to: customerEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  // Send password reset email
  async sendPasswordReset(
    customerEmail: string,
    resetLink: string
  ): Promise<void> {
    const template = this.getPasswordResetTemplate(resetLink);
    
    await this.sendEmail({
      to: customerEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  // Send welcome email
  async sendWelcomeEmail(
    customerEmail: string,
    customerName: string
  ): Promise<void> {
    const template = this.getWelcomeTemplate(customerName);
    
    await this.sendEmail({
      to: customerEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  // Send promotional email
  async sendPromotionalEmail(
    customerEmail: string,
    customerName: string,
    promoCode: string,
    discount: number,
    expiryDate: Date
  ): Promise<void> {
    const template = this.getPromotionalTemplate(customerName, promoCode, discount, expiryDate);
    
    await this.sendEmail({
      to: customerEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  // Email templates
  private getOrderConfirmationTemplate(
    customerName: string,
    orderNumber: string,
    orderTotal: number
  ): EmailTemplate {
    return {
      subject: `Order Confirmation - ${orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #3b82f6; color: white; padding: 20px; text-align: center;">
            <h1>Order Confirmed!</h1>
          </div>
          <div style="padding: 20px;">
            <p>Hi ${customerName},</p>
            <p>Thank you for your order! We've received your order and are processing it now.</p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Order Details:</h3>
              <p><strong>Order Number:</strong> ${orderNumber}</p>
              <p><strong>Total:</strong> $${orderTotal.toFixed(2)}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            <p>You'll receive another email with tracking information once your order ships.</p>
            <p>Thanks for shopping with us!</p>
            <p>The Zapp E-Commerce Team</p>
          </div>
        </div>
      `,
      text: `Hi ${customerName}, Thank you for your order! Order Number: ${orderNumber}, Total: $${orderTotal.toFixed(2)}. You'll receive tracking information once your order ships.`
    };
  }

  private getShippingNotificationTemplate(
    customerName: string,
    orderNumber: string,
    trackingNumber: string,
    carrier: string
  ): EmailTemplate {
    return {
      subject: `Your Order ${orderNumber} Has Shipped!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #10b981; color: white; padding: 20px; text-align: center;">
            <h1>Your Order Has Shipped!</h1>
          </div>
          <div style="padding: 20px;">
            <p>Hi ${customerName},</p>
            <p>Great news! Your order is on its way.</p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Shipping Details:</h3>
              <p><strong>Order Number:</strong> ${orderNumber}</p>
              <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
              <p><strong>Carrier:</strong> ${carrier}</p>
              <p><strong>Shipped Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            <p>You can track your package using the tracking number above on the ${carrier} website.</p>
            <p>Thanks for your business!</p>
            <p>The Zapp E-Commerce Team</p>
          </div>
        </div>
      `,
      text: `Hi ${customerName}, Your order ${orderNumber} has shipped! Tracking: ${trackingNumber} via ${carrier}.`
    };
  }

  private getDeliveryConfirmationTemplate(
    customerName: string,
    orderNumber: string
  ): EmailTemplate {
    return {
      subject: `Your Order ${orderNumber} Has Been Delivered!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #059669; color: white; padding: 20px; text-align: center;">
            <h1>Order Delivered!</h1>
          </div>
          <div style="padding: 20px;">
            <p>Hi ${customerName},</p>
            <p>Your order has been successfully delivered!</p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Delivery Details:</h3>
              <p><strong>Order Number:</strong> ${orderNumber}</p>
              <p><strong>Delivered Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            <p>We hope you love your purchase! If you have any issues, please don't hesitate to contact us.</p>
            <p>Consider leaving a review to help other customers.</p>
            <p>Thanks for choosing us!</p>
            <p>The Zapp E-Commerce Team</p>
          </div>
        </div>
      `,
      text: `Hi ${customerName}, Your order ${orderNumber} has been delivered! Thanks for your business.`
    };
  }

  private getPasswordResetTemplate(resetLink: string): EmailTemplate {
    return {
      subject: 'Reset Your Password - Zapp E-Commerce',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #3b82f6; color: white; padding: 20px; text-align: center;">
            <h1>Password Reset</h1>
          </div>
          <div style="padding: 20px;">
            <p>You requested to reset your password for your Zapp E-Commerce account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
            </div>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #3b82f6;">${resetLink}</p>
            <p>This link will expire in 1 hour for security reasons.</p>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <p>The Zapp E-Commerce Team</p>
          </div>
        </div>
      `,
      text: `Reset your password by clicking this link: ${resetLink}. This link expires in 1 hour.`
    };
  }

  private getWelcomeTemplate(customerName: string): EmailTemplate {
    return {
      subject: 'Welcome to Zapp E-Commerce!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #3b82f6; color: white; padding: 20px; text-align: center;">
            <h1>Welcome to Zapp E-Commerce!</h1>
          </div>
          <div style="padding: 20px;">
            <p>Hi ${customerName},</p>
            <p>Welcome to Zapp E-Commerce! We're excited to have you as part of our community.</p>
            <p>Here's what you can do with your new account:</p>
            <ul>
              <li>Browse our extensive product catalog</li>
              <li>Save items to your wishlist</li>
              <li>Track your orders</li>
              <li>Leave reviews and ratings</li>
              <li>Get exclusive offers and promotions</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://zapp-ecommerce.com" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Start Shopping</a>
            </div>
            <p>If you have any questions, feel free to contact our support team.</p>
            <p>Happy shopping!</p>
            <p>The Zapp E-Commerce Team</p>
          </div>
        </div>
      `,
      text: `Hi ${customerName}, Welcome to Zapp E-Commerce! Start shopping at https://zapp-ecommerce.com`
    };
  }

  private getPromotionalTemplate(
    customerName: string,
    promoCode: string,
    discount: number,
    expiryDate: Date
  ): EmailTemplate {
    return {
      subject: `Special Offer: ${discount}% Off Your Next Order!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 20px; text-align: center;">
            <h1>Special Offer Just for You!</h1>
            <h2 style="margin: 10px 0; font-size: 36px;">${discount}% OFF</h2>
          </div>
          <div style="padding: 20px;">
            <p>Hi ${customerName},</p>
            <p>We have a special offer just for you! Get ${discount}% off your next order.</p>
            <div style="background: #fef3c7; border: 2px dashed #f59e0b; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px;">
              <h3 style="margin: 0 0 10px 0; color: #92400e;">Use Promo Code:</h3>
              <div style="font-size: 24px; font-weight: bold; color: #92400e; letter-spacing: 2px;">${promoCode}</div>
            </div>
            <p><strong>Offer expires:</strong> ${expiryDate.toLocaleDateString()}</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://zapp-ecommerce.com" style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Shop Now</a>
            </div>
            <p style="font-size: 12px; color: #6b7280;">*Terms and conditions apply. Cannot be combined with other offers.</p>
            <p>Happy shopping!</p>
            <p>The Zapp E-Commerce Team</p>
          </div>
        </div>
      `,
      text: `Hi ${customerName}, Get ${discount}% off with code ${promoCode}. Expires ${expiryDate.toLocaleDateString()}. Shop at https://zapp-ecommerce.com`
    };
  }

  // Bulk email sending
  async sendBulkEmails(emails: EmailOptions[]): Promise<void> {
    try {
      const promises = emails.map(email => this.sendEmail(email));
      await Promise.all(promises);
    } catch (error) {
      console.error('Error sending bulk emails:', error);
      throw new Error('Failed to send bulk emails');
    }
  }

  // Email validation
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Get email status (mock implementation)
  async getEmailStatus(emailId: string): Promise<'sent' | 'delivered' | 'opened' | 'failed'> {
    // In a real implementation, you would query your email service provider's API
    return 'delivered';
  }

  // Unsubscribe handling
  async handleUnsubscribe(email: string, type: 'all' | 'promotional' | 'transactional'): Promise<void> {
    // In a real implementation, you would update your database
    console.log(`Unsubscribed ${email} from ${type} emails`);
  }
}

export const emailService = new EmailService();
export default emailService;

// Export the sendEmail function for use in other services
export const sendEmail = (options: EmailOptions) => emailService.sendEmail(options);