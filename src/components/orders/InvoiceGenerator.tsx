import React, { useState } from 'react';
import { FiDownload, FiMail, FiPrinter, FiEye, FiLoader } from 'react-icons/fi';
import { Order } from '../../types/order';
import { invoiceService } from '../../services/invoiceService';
import { emailService } from '../../services/emailService';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

interface InvoiceGeneratorProps {
  order: Order;
  className?: string;
}

const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({
  order,
  className = ''
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<{
    download: boolean;
    email: boolean;
    preview: boolean;
  }>({
    download: false,
    email: false,
    preview: false
  });
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Download invoice PDF
  const handleDownloadInvoice = async () => {
    if (!user) return;

    setLoading(prev => ({ ...prev, download: true }));
    setError(null);

    try {
      await invoiceService.downloadInvoice(order, user);
    } catch (err) {
      console.error('Error downloading invoice:', err);
      setError('Failed to download invoice. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, download: false }));
    }
  };

  // Download receipt PDF
  const handleDownloadReceipt = async () => {
    if (!user) return;

    setLoading(prev => ({ ...prev, download: true }));
    setError(null);

    try {
      await invoiceService.downloadReceipt(order, user);
    } catch (err) {
      console.error('Error downloading receipt:', err);
      setError('Failed to download receipt. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, download: false }));
    }
  };

  // Email invoice
  const handleEmailInvoice = async () => {
    if (!user?.email) return;

    setLoading(prev => ({ ...prev, email: true }));
    setError(null);

    try {
      await invoiceService.sendEmailReceipt(order, user, {
        includeInvoice: true,
        includeReceipt: true,
        customMessage: 'Thank you for your order! Please find your invoice and receipt attached.'
      });
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 3000);
    } catch (err) {
      console.error('Error sending email:', err);
      setError('Failed to send email. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, email: false }));
    }
  };

  // Preview invoice
  const handlePreviewInvoice = async () => {
    if (!user) return;

    setLoading(prev => ({ ...prev, preview: true }));
    setError(null);

    try {
      const pdfBlob = await invoiceService.generateInvoicePDF(order, user);
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
      
      // Clean up the URL after a delay
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
    } catch (err) {
      console.error('Error previewing invoice:', err);
      setError('Failed to preview invoice. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, preview: false }));
    }
  };

  // Print invoice
  const handlePrintInvoice = async () => {
    if (!user) return;

    setLoading(prev => ({ ...prev, preview: true }));
    setError(null);

    try {
      const pdfBlob = await invoiceService.generateInvoicePDF(order, user);
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // Create a hidden iframe for printing
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = pdfUrl;
      document.body.appendChild(iframe);
      
      iframe.onload = () => {
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
          URL.revokeObjectURL(pdfUrl);
        }, 1000);
      };
    } catch (err) {
      console.error('Error printing invoice:', err);
      setError('Failed to print invoice. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, preview: false }));
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Invoice & Receipt
        </h3>
        <div className="text-sm text-gray-500">
          Order #{order.orderNumber}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {emailSent && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-600">
            Invoice and receipt sent to {user?.email}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Download Invoice */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadInvoice}
          disabled={loading.download}
          className="flex items-center justify-center gap-2"
        >
          {loading.download ? (
            <FiLoader className="w-4 h-4 animate-spin" />
          ) : (
            <FiDownload className="w-4 h-4" />
          )}
          Invoice
        </Button>

        {/* Download Receipt */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadReceipt}
          disabled={loading.download}
          className="flex items-center justify-center gap-2"
        >
          {loading.download ? (
            <FiLoader className="w-4 h-4 animate-spin" />
          ) : (
            <FiDownload className="w-4 h-4" />
          )}
          Receipt
        </Button>

        {/* Preview */}
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviewInvoice}
          disabled={loading.preview}
          className="flex items-center justify-center gap-2"
        >
          {loading.preview ? (
            <FiLoader className="w-4 h-4 animate-spin" />
          ) : (
            <FiEye className="w-4 h-4" />
          )}
          Preview
        </Button>

        {/* Email */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleEmailInvoice}
          disabled={loading.email || !user?.email}
          className="flex items-center justify-center gap-2"
        >
          {loading.email ? (
            <FiLoader className="w-4 h-4 animate-spin" />
          ) : (
            <FiMail className="w-4 h-4" />
          )}
          Email
        </Button>
      </div>

      {/* Print Option */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrintInvoice}
          disabled={loading.preview}
          className="flex items-center justify-center gap-2 w-full"
        >
          {loading.preview ? (
            <FiLoader className="w-4 h-4 animate-spin" />
          ) : (
            <FiPrinter className="w-4 h-4" />
          )}
          Print Invoice
        </Button>
      </div>

      {/* Order Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Order Date:</span>
            <div className="font-medium">
              {order.createdAt.toDate().toLocaleDateString()}
            </div>
          </div>
          <div>
            <span className="text-gray-500">Total Amount:</span>
            <div className="font-medium">
              ${order.total.toFixed(2)}
            </div>
          </div>
          <div>
            <span className="text-gray-500">Payment Method:</span>
            <div className="font-medium capitalize">
              {order.paymentMethod}
            </div>
          </div>
          <div>
            <span className="text-gray-500">Status:</span>
            <div className="font-medium">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                order.status === 'delivered' 
                  ? 'bg-green-100 text-green-800'
                  : order.status === 'shipped'
                  ? 'bg-blue-100 text-blue-800'
                  : order.status === 'processing'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {order.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Notice */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          This invoice is generated electronically and is valid without signature. 
          For questions about this invoice, please contact our support team.
        </p>
      </div>
    </div>
  );
};

export default InvoiceGenerator;