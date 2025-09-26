import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../services/productService';
import { FiPrinter, FiDownload, FiMail } from 'react-icons/fi';
import Button from '../ui/Button';
import type { CartItem } from '../../context/CartContext';

interface ProformaInvoiceProps {
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  insurance: number;
  tax: number;
  total: number;
  buyerInfo: {
    name: string;
    company: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    email: string;
    phone: string;
  };
  cifDetails: {
    portOfLoading: string;
    portOfDischarge: string;
    estimatedDeparture: string;
    estimatedArrival: string;
    incoterms: string;
    paymentTerms: string;
    countryOfOrigin: string;
  };
}

const ProformaInvoice: React.FC<ProformaInvoiceProps> = ({
  orderNumber,
  items,
  subtotal,
  shipping,
  insurance,
  tax,
  total,
  buyerInfo,
  cifDetails
}) => {
  const { t } = useTranslation();
  const today = new Date().toLocaleDateString();
  const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">PROFORMA INVOICE</h1>
          <p className="text-gray-600 mb-1">Invoice No: PI-{orderNumber}</p>
          <p className="text-gray-600 mb-1">Date: {today}</p>
          <p className="text-gray-600">Due Date: {dueDate}</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold text-green-600 mb-1">ZAPP</h2>
          <p className="text-gray-600 mb-1">Global Commodities</p>
          <p className="text-gray-600 mb-1">123 Commerce St.</p>
          <p className="text-gray-600 mb-1">Suite 500</p>
          <p className="text-gray-600">business@zapp.com</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="border rounded-lg p-4">
          <h3 className="font-bold text-gray-700 mb-2">Bill To:</h3>
          <p className="mb-1">{buyerInfo.name}</p>
          {buyerInfo.company && <p className="mb-1">{buyerInfo.company}</p>}
          <p className="mb-1">{buyerInfo.address}</p>
          <p className="mb-1">{buyerInfo.city}, {buyerInfo.state} {buyerInfo.zip}</p>
          <p className="mb-1">{buyerInfo.country}</p>
          <p className="mb-1">Email: {buyerInfo.email}</p>
          <p>Phone: {buyerInfo.phone}</p>
        </div>
        
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="font-bold text-gray-700 mb-2">CIF Shipping Details:</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-gray-600">Incoterms:</div>
            <div className="font-medium">{cifDetails.incoterms}</div>
            
            <div className="text-gray-600">Port of Loading:</div>
            <div className="font-medium">{cifDetails.portOfLoading}</div>
            
            <div className="text-gray-600">Port of Discharge:</div>
            <div className="font-medium">{cifDetails.portOfDischarge}</div>
            
            <div className="text-gray-600">Est. Departure:</div>
            <div className="font-medium">{cifDetails.estimatedDeparture}</div>
            
            <div className="text-gray-600">Est. Arrival:</div>
            <div className="font-medium">{cifDetails.estimatedArrival}</div>
            
            <div className="text-gray-600">Country of Origin:</div>
            <div className="font-medium">{cifDetails.countryOfOrigin}</div>
            
            <div className="text-gray-600">Payment Terms:</div>
            <div className="font-medium">{cifDetails.paymentTerms}</div>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Item Description</th>
              <th className="border p-2 text-center">Origin</th>
              <th className="border p-2 text-right">Unit Price</th>
              <th className="border p-2 text-center">Quantity</th>
              <th className="border p-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border p-2">
                  <div className="font-medium">{item.product.name}</div>
                  <div className="text-xs text-gray-500">{item.product.description.substring(0, 60)}...</div>
                </td>
                <td className="border p-2 text-center">{item.product.origin}</td>
                <td className="border p-2 text-right">{formatCurrency(item.product.price)}</td>
                <td className="border p-2 text-center">{item.quantity}</td>
                <td className="border p-2 text-right">{formatCurrency(item.product.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-end mb-8">
        <div className="w-full md:w-1/3">
          <div className="border-t pt-4">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Shipping (CIF):</span>
              <span>{formatCurrency(shipping)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Insurance:</span>
              <span>{formatCurrency(insurance)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Tax:</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between border-t border-b py-2 my-2">
              <span className="font-bold">Total:</span>
              <span className="font-bold">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="font-bold text-gray-700 mb-2">Terms & Conditions:</h3>
        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
          <li>This is a proforma invoice and not a demand for payment.</li>
          <li>Payment terms: {cifDetails.paymentTerms}</li>
          <li>Prices are valid for 30 days from the date of this proforma invoice.</li>
          <li>Shipping terms are as per Incoterms 2020.</li>
          <li>Insurance covers 110% of invoice value.</li>
          <li>Title and risk pass upon delivery as per Incoterms.</li>
          <li>Any bank charges related to payment are the responsibility of the buyer.</li>
        </ul>
      </div>
      
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" size="sm" className="flex items-center border-gray-300">
          <FiPrinter className="mr-2" /> Print Invoice
        </Button>
        <Button variant="outline" size="sm" className="flex items-center border-gray-300">
          <FiDownload className="mr-2" /> Download PDF
        </Button>
        <Button variant="outline" size="sm" className="flex items-center border-gray-300">
          <FiMail className="mr-2" /> Email Invoice
        </Button>
      </div>
    </div>
  );
};

export default ProformaInvoice; 