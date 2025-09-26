import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Order, OrderItem } from '../types/order';
import { User } from 'firebase/auth';
import { sendEmail } from './emailService';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface InvoiceData {
  order: Order;
  customer: {
    name: string;
    email: string;
    phone?: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
  company: {
    name: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    phone: string;
    email: string;
    website: string;
    taxId?: string;
  };
}

export interface EmailReceiptOptions {
  customerEmail: string;
  customerName: string;
  attachPDF?: boolean;
  customMessage?: string;
}

class InvoiceService {
  private readonly companyInfo = {
    name: 'Zapp E-Commerce',
    address: {
      street: '123 Commerce Street',
      city: 'Business City',
      state: 'BC',
      zipCode: '12345',
      country: 'United States'
    },
    phone: '+1 (555) 123-4567',
    email: 'orders@zapp-ecommerce.com',
    website: 'www.zapp-ecommerce.com',
    taxId: 'TAX123456789'
  };

  // Generate PDF invoice
  async generateInvoicePDF(invoiceData: InvoiceData): Promise<Uint8Array> {
    const doc = new jsPDF();
    const { order, customer, company } = invoiceData;

    // Set up colors
    const primaryColor = [59, 130, 246]; // Blue
    const secondaryColor = [107, 114, 128]; // Gray
    const textColor = [17, 24, 39]; // Dark gray

    // Header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, 'F');

    // Company logo/name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(company.name, 20, 25);

    // Invoice title
    doc.setFontSize(16);
    doc.text('INVOICE', 150, 25);

    // Reset text color
    doc.setTextColor(...textColor);

    // Company information
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    let yPos = 50;
    doc.text(company.address.street, 20, yPos);
    doc.text(`${company.address.city}, ${company.address.state} ${company.address.zipCode}`, 20, yPos + 5);
    doc.text(company.address.country, 20, yPos + 10);
    doc.text(`Phone: ${company.phone}`, 20, yPos + 15);
    doc.text(`Email: ${company.email}`, 20, yPos + 20);
    if (company.taxId) {
      doc.text(`Tax ID: ${company.taxId}`, 20, yPos + 25);
    }

    // Invoice details
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice Details:', 120, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice #: ${order.orderNumber}`, 120, yPos + 5);
    doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`, 120, yPos + 10);
    doc.text(`Due Date: ${new Date(order.createdAt).toLocaleDateString()}`, 120, yPos + 15);
    doc.text(`Status: ${order.status.toUpperCase()}`, 120, yPos + 20);

    // Customer information
    yPos += 40;
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(customer.name, 20, yPos + 5);
    doc.text(customer.address.street, 20, yPos + 10);
    doc.text(`${customer.address.city}, ${customer.address.state} ${customer.address.zipCode}`, 20, yPos + 15);
    doc.text(customer.address.country, 20, yPos + 20);
    doc.text(`Email: ${customer.email}`, 20, yPos + 25);
    if (customer.phone) {
      doc.text(`Phone: ${customer.phone}`, 20, yPos + 30);
    }

    // Shipping information (if different)
    if (order.shippingAddress) {
      doc.setFont('helvetica', 'bold');
      doc.text('Ship To:', 120, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(order.shippingAddress.fullName, 120, yPos + 5);
      doc.text(order.shippingAddress.street, 120, yPos + 10);
      doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}`, 120, yPos + 15);
      doc.text(order.shippingAddress.country, 120, yPos + 20);
    }

    // Items table
    yPos += 50;
    const tableColumns = ['Item', 'Quantity', 'Unit Price', 'Total'];
    const tableRows = order.items.map(item => [
      `${item.name}\n${item.description || ''}`,
      item.quantity.toString(),
      `$${item.price.toFixed(2)}`,
      `$${(item.quantity * item.price).toFixed(2)}`
    ]);

    doc.autoTable({
      startY: yPos,
      head: [tableColumns],
      body: tableRows,
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 10,
        cellPadding: 5
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 30, halign: 'right' }
      }
    });

    // Get the final Y position after the table
    const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;

    // Totals section
    const totalsY = finalY + 10;
    const totalsX = 130;

    // Subtotal
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', totalsX, totalsY);
    doc.text(`$${order.subtotal.toFixed(2)}`, totalsX + 40, totalsY);

    // Tax
    if (order.tax > 0) {
      doc.text('Tax:', totalsX, totalsY + 5);
      doc.text(`$${order.tax.toFixed(2)}`, totalsX + 40, totalsY + 5);
    }

    // Shipping
    if (order.shippingCost > 0) {
      doc.text('Shipping:', totalsX, totalsY + 10);
      doc.text(`$${order.shippingCost.toFixed(2)}`, totalsX + 40, totalsY + 10);
    }

    // Discount
    if (order.discount > 0) {
      doc.text('Discount:', totalsX, totalsY + 15);
      doc.text(`-$${order.discount.toFixed(2)}`, totalsX + 40, totalsY + 15);
    }

    // Total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Total:', totalsX, totalsY + 25);
    doc.text(`$${order.total.toFixed(2)}`, totalsX + 40, totalsY + 25);

    // Payment information
    if (order.paymentMethod) {
      const paymentY = totalsY + 40;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Payment Information:', 20, paymentY);
      doc.setFont('helvetica', 'normal');
      doc.text(`Payment Method: ${order.paymentMethod}`, 20, paymentY + 5);
      if (order.paymentStatus) {
        doc.text(`Payment Status: ${order.paymentStatus.toUpperCase()}`, 20, paymentY + 10);
      }
    }

    // Footer
    const footerY = 280;
    doc.setFontSize(8);
    doc.setTextColor(...secondaryColor);
    doc.text('Thank you for your business!', 20, footerY);
    doc.text(`For questions about this invoice, contact us at ${company.email} or ${company.phone}`, 20, footerY + 5);
    doc.text(`Visit us at ${company.website}`, 20, footerY + 10);

    // Terms and conditions
    doc.text('Terms: Payment is due within 30 days. Late payments may incur additional fees.', 20, footerY + 20);

    return doc.output('arraybuffer') as Uint8Array;
  }

  // Generate simple receipt PDF
  async generateReceiptPDF(order: Order, customerInfo: any): Promise<Uint8Array> {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, 210, 30, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('RECEIPT', 20, 20);

    // Reset colors
    doc.setTextColor(0, 0, 0);

    // Receipt details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Receipt Details', 20, 45);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Receipt #: ${order.orderNumber}`, 20, 55);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 20, 62);
    doc.text(`Time: ${new Date(order.createdAt).toLocaleTimeString()}`, 20, 69);

    // Customer info
    doc.setFont('helvetica', 'bold');
    doc.text('Customer:', 20, 85);
    doc.setFont('helvetica', 'normal');
    doc.text(customerInfo.name, 20, 92);
    doc.text(customerInfo.email, 20, 99);

    // Items
    let yPos = 115;
    doc.setFont('helvetica', 'bold');
    doc.text('Items:', 20, yPos);

    order.items.forEach((item, index) => {
      yPos += 10;
      doc.setFont('helvetica', 'normal');
      doc.text(`${item.quantity}x ${item.name}`, 20, yPos);
      doc.text(`$${(item.quantity * item.price).toFixed(2)}`, 150, yPos);
    });

    // Totals
    yPos += 20;
    doc.line(20, yPos, 190, yPos);
    yPos += 10;

    doc.text(`Subtotal: $${order.subtotal.toFixed(2)}`, 20, yPos);
    if (order.tax > 0) {
      yPos += 7;
      doc.text(`Tax: $${order.tax.toFixed(2)}`, 20, yPos);
    }
    if (order.shippingCost > 0) {
      yPos += 7;
      doc.text(`Shipping: $${order.shippingCost.toFixed(2)}`, 20, yPos);
    }

    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: $${order.total.toFixed(2)}`, 20, yPos);

    // Payment method
    if (order.paymentMethod) {
      yPos += 15;
      doc.setFont('helvetica', 'normal');
      doc.text(`Payment: ${order.paymentMethod}`, 20, yPos);
    }

    // Footer
    yPos += 30;
    doc.setFontSize(8);
    doc.text('Thank you for your purchase!', 20, yPos);
    doc.text('Visit us at www.zapp-ecommerce.com', 20, yPos + 7);

    return doc.output('arraybuffer') as Uint8Array;
  }

  // Send email receipt
  async sendEmailReceipt(
    order: Order,
    customer: any,
    options: EmailReceiptOptions
  ): Promise<void> {
    try {
      let pdfAttachment: Uint8Array | undefined;

      if (options.attachPDF) {
        const invoiceData: InvoiceData = {
          order,
          customer: {
            name: customer.name || customer.displayName || 'Customer',
            email: customer.email,
            phone: customer.phone,
            address: order.shippingAddress || {
              street: '',
              city: '',
              state: '',
              zipCode: '',
              country: ''
            }
          },
          company: this.companyInfo
        };

        pdfAttachment = await this.generateInvoicePDF(invoiceData);
      }

      const emailContent = this.generateEmailReceiptHTML(order, customer, options.customMessage);

      await sendEmail({
        to: options.customerEmail,
        subject: `Order Confirmation - ${order.orderNumber}`,
        html: emailContent,
        attachments: pdfAttachment ? [{
          filename: `invoice-${order.orderNumber}.pdf`,
          content: pdfAttachment,
          contentType: 'application/pdf'
        }] : undefined
      });
    } catch (error) {
      console.error('Error sending email receipt:', error);
      throw new Error('Failed to send email receipt');
    }
  }

  // Generate HTML email content
  private generateEmailReceiptHTML(order: Order, customer: any, customMessage?: string): string {
    const itemsHTML = order.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <strong>${item.name}</strong><br>
          ${item.description || ''}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          $${item.price.toFixed(2)}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          $${(item.quantity * item.price).toFixed(2)}
        </td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Order Confirmed!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Thank you for your purchase, ${customer.name || customer.displayName || 'valued customer'}!</p>
        </div>

        <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
          ${customMessage ? `
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <p style="margin: 0; color: #6c757d;">${customMessage}</p>
            </div>
          ` : ''}

          <div style="margin-bottom: 30px;">
            <h2 style="color: #3b82f6; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">Order Details</h2>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span><strong>Order Number:</strong> ${order.orderNumber}</span>
              <span><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <div style="margin-bottom: 10px;">
              <strong>Status:</strong> <span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">${order.status.toUpperCase()}</span>
            </div>
          </div>

          <div style="margin-bottom: 30px;">
            <h3 style="color: #374151; margin-bottom: 15px;">Items Ordered</h3>
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
              <thead>
                <tr style="background: #f8f9fa;">
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
                  <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
              </tbody>
            </table>
          </div>

          <div style="margin-bottom: 30px;">
            <div style="background: #f8f9fa; padding: 20px; border-radius: 5px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>Subtotal:</span>
                <span>$${order.subtotal.toFixed(2)}</span>
              </div>
              ${order.tax > 0 ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                  <span>Tax:</span>
                  <span>$${order.tax.toFixed(2)}</span>
                </div>
              ` : ''}
              ${order.shippingCost > 0 ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                  <span>Shipping:</span>
                  <span>$${order.shippingCost.toFixed(2)}</span>
                </div>
              ` : ''}
              ${order.discount > 0 ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px; color: #10b981;">
                  <span>Discount:</span>
                  <span>-$${order.discount.toFixed(2)}</span>
                </div>
              ` : ''}
              <hr style="margin: 10px 0; border: none; border-top: 1px solid #ddd;">
              <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #3b82f6;">
                <span>Total:</span>
                <span>$${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          ${order.shippingAddress ? `
            <div style="margin-bottom: 30px;">
              <h3 style="color: #374151; margin-bottom: 15px;">Shipping Address</h3>
              <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
                <p style="margin: 0;">
                  ${order.shippingAddress.fullName}<br>
                  ${order.shippingAddress.street}<br>
                  ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
                  ${order.shippingAddress.country}
                </p>
              </div>
            </div>
          ` : ''}

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #6c757d; margin-bottom: 15px;">Questions about your order?</p>
            <p style="margin: 5px 0;">
              <strong>Email:</strong> <a href="mailto:${this.companyInfo.email}" style="color: #3b82f6;">${this.companyInfo.email}</a>
            </p>
            <p style="margin: 5px 0;">
              <strong>Phone:</strong> <a href="tel:${this.companyInfo.phone}" style="color: #3b82f6;">${this.companyInfo.phone}</a>
            </p>
            <p style="margin: 15px 0 5px 0;">
              <a href="${this.companyInfo.website}" style="color: #3b82f6; text-decoration: none;">Visit our website</a>
            </p>
          </div>

          <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #6c757d; font-size: 12px;">
            <p>Thank you for choosing ${this.companyInfo.name}!</p>
            <p>This email was sent to ${customer.email}. If you have any questions, please contact us.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Download invoice as PDF
  async downloadInvoice(order: Order, customer: any, filename?: string): Promise<void> {
    try {
      const invoiceData: InvoiceData = {
        order,
        customer: {
          name: customer.name || customer.displayName || 'Customer',
          email: customer.email,
          phone: customer.phone,
          address: order.shippingAddress || {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
          }
        },
        company: this.companyInfo
      };

      const pdfBytes = await this.generateInvoicePDF(invoiceData);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `invoice-${order.orderNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      throw new Error('Failed to download invoice');
    }
  }

  // Download receipt as PDF
  async downloadReceipt(order: Order, customer: any, filename?: string): Promise<void> {
    try {
      const pdfBytes = await this.generateReceiptPDF(order, customer);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `receipt-${order.orderNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading receipt:', error);
      throw new Error('Failed to download receipt');
    }
  }

  // Send automated receipt after order completion
  async sendAutomatedReceipt(order: Order, customer: any): Promise<void> {
    try {
      await this.sendEmailReceipt(order, customer, {
        customerEmail: customer.email,
        customerName: customer.name || customer.displayName || 'Customer',
        attachPDF: true,
        customMessage: 'Your order has been confirmed and is being processed. You will receive tracking information once your order ships.'
      });
    } catch (error) {
      console.error('Error sending automated receipt:', error);
      // Don't throw error for automated receipts to avoid disrupting order flow
    }
  }

  // Get invoice data for preview
  async getInvoiceData(order: Order, customer: any): Promise<InvoiceData> {
    return {
      order,
      customer: {
        name: customer.name || customer.displayName || 'Customer',
        email: customer.email,
        phone: customer.phone,
        address: order.shippingAddress || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        }
      },
      company: this.companyInfo
    };
  }
}

export const invoiceService = new InvoiceService();
export default invoiceService;