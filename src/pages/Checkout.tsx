import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiCreditCard, FiTruck, FiCheck, FiFileText } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import Button from '../components/ui/Button';
import { formatCurrency } from '../services/productService';
import ProformaInvoice from '../components/checkout/ProformaInvoice';
import CardIcon from '../components/ui/CardIcons';

const Checkout: React.FC = () => {
  const { t } = useTranslation();
  const { items, totals, itemCount } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'shipping' | 'payment' | 'confirmation' | 'proforma'>('shipping');
  const [showProforma, setShowProforma] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    email: '',
    phone: '',
  });

  // Payment form state
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvc: ''
  });

  const [paymentErrors, setPaymentErrors] = useState({
    cardNumber: '',
    expiryDate: '',
    cvc: ''
  });

  const [cardType, setCardType] = useState<string>('');
  
  // CIF shipping details
  const [cifDetails, setCifDetails] = useState({
    portOfLoading: 'Houston, USA',
    portOfDischarge: 'Kingston, Jamaica',
    estimatedDeparture: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    estimatedArrival: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    incoterms: 'CIF',
    paymentTerms: '50% advance, 50% before shipment',
    countryOfOrigin: 'USA'
  });
  
  // Use totals from cart context to ensure consistency
  const { subtotal, discountedSubtotal, totalSavings, shipping, tax, total } = totals;
  
  // Insurance calculation (2% of subtotal)
  const insurance = subtotal * 0.02;
  
  // Generate random order number
  const orderNumber = `ORD-${Math.floor(Math.random() * 100000)}`;
  
  // Handle form field changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };
  
  // Handle CIF detail changes
  const handleCifChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setCifDetails(prev => ({
      ...prev,
      [id]: value
    }));
  };
  
  // Mock submission
  const handleSubmitOrder = () => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('confirmation');
    }, 1500);
  };
  
  // Toggle proforma invoice view
  const toggleProforma = () => {
    if (showProforma) {
      setShowProforma(false);
    } else {
      setShowProforma(true);
      setStep('proforma');
    }
  };

  // Card type detection function
  const detectCardType = (cardNumber: string): string => {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    
    // Visa: starts with 4
    if (/^4/.test(cleanNumber)) {
      return 'visa';
    }
    
    // Mastercard: starts with 5[1-5] or 2[2-7]
    if (/^5[1-5]/.test(cleanNumber) || /^2[2-7]/.test(cleanNumber)) {
      return 'mastercard';
    }
    
    // American Express: starts with 34 or 37
    if (/^3[47]/.test(cleanNumber)) {
      return 'amex';
    }
    
    return '';
  };

  // Card number formatting and validation
  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const cardType = detectCardType(v);
    
    // American Express: 4-6-5 format
    if (cardType === 'amex') {
      return v.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3');
    }
    
    // Visa/Mastercard: 4-4-4-4 format
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const validateCardNumber = (cardNumber: string) => {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    if (cleanNumber.length === 0) {
      return 'Card number is required';
    }
    
    const cardType = detectCardType(cleanNumber);
    
    // Check length based on card type
    if (cardType === 'amex' && cleanNumber.length !== 15) {
      return 'American Express cards must be 15 digits';
    }
    if ((cardType === 'visa' || cardType === 'mastercard') && cleanNumber.length !== 16) {
      return 'Visa and Mastercard must be 16 digits';
    }
    if (!cardType && (cleanNumber.length < 13 || cleanNumber.length > 19)) {
      return 'Card number must be between 13-19 digits';
    }
    
    // Luhn algorithm validation
    let sum = 0;
    let isEven = false;
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber.charAt(i), 10);
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      sum += digit;
      isEven = !isEven;
    }
    if (sum % 10 !== 0) {
      return 'Invalid card number';
    }
    return '';
  };

  // Expiry date formatting and validation
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const validateExpiryDate = (expiryDate: string) => {
    if (expiryDate.length === 0) {
      return 'Expiry date is required';
    }
    if (expiryDate.length !== 5) {
      return 'Expiry date must be in MM/YY format';
    }
    const [month, year] = expiryDate.split('/');
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt('20' + year, 10);
    
    if (monthNum < 1 || monthNum > 12) {
      return 'Invalid month';
    }
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
      return 'Card has expired';
    }
    
    return '';
  };

  // CVC validation
  const validateCVC = (cvc: string, cardType: string): string => {
    if (!cvc.trim()) {
      return 'CVC is required';
    }
    
    if (!/^\d+$/.test(cvc)) {
      return 'CVC must contain only numbers';
    }
    
    // American Express uses 4-digit CVC, others use 3-digit
    const expectedLength = cardType === 'amex' ? 4 : 3;
    const cvcName = cardType === 'amex' ? 'CID' : 'CVC';
    
    if (cvc.length !== expectedLength) {
      return `${cvcName} must be ${expectedLength} digits`;
    }
    
    return '';
  };

  // Handle payment input changes
  const handlePaymentInputChange = (field: 'cardNumber' | 'expiryDate' | 'cvc', value: string) => {
    let formattedValue = value;
    let error = '';
    let detectedCardType = cardType;

    switch (field) {
      case 'cardNumber':
        formattedValue = formatCardNumber(value);
        detectedCardType = detectCardType(value);
        setCardType(detectedCardType);
        if (formattedValue.replace(/\s/g, '').length >= 13) {
          error = validateCardNumber(formattedValue);
        }
        break;
      case 'expiryDate':
        formattedValue = formatExpiryDate(value);
        if (formattedValue.length === 5) {
          error = validateExpiryDate(formattedValue);
        }
        break;
      case 'cvc':
        formattedValue = value.replace(/[^0-9]/g, '').substring(0, detectedCardType === 'amex' ? 4 : 3);
        if (formattedValue.length >= 3) {
          error = validateCVC(formattedValue, detectedCardType);
        }
        break;
    }

    setPaymentData(prev => ({ ...prev, [field]: formattedValue }));
    setPaymentErrors(prev => ({ ...prev, [field]: error }));
  };
  
  // Construct buyer info for proforma invoice
  const buyerInfo = {
    name: `${formData.firstName} ${formData.lastName}`,
    company: formData.company,
    address: formData.address,
    city: formData.city,
    state: formData.state,
    zip: formData.zip,
    country: formData.country || 'United States',
    email: formData.email,
    phone: formData.phone
  };
  
  if (step === 'confirmation') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheck size={32} className="text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-green-600 mb-2">{t('checkout.orderConfirmed')}</h1>
            <p className="text-gray-600 mb-6">{t('checkout.orderConfirmationMessage')}</p>
            
            <div className="text-left bg-gray-50 p-4 rounded-lg mb-6">
              <p className="font-medium mb-2">{t('checkout.orderDetails')}</p>
              <p className="text-sm text-gray-600">{t('checkout.orderNumber')}: {orderNumber}</p>
              <p className="text-sm text-gray-600">{t('checkout.estimatedShipping')}: {cifDetails.estimatedDeparture}</p>
              <p className="text-sm text-gray-600">{t('checkout.estimatedDelivery')}: {cifDetails.estimatedArrival}</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3">
              <Button 
                variant="primary" 
                className="bg-green-600 hover:bg-green-700 flex items-center"
                onClick={toggleProforma}
              >
                <FiFileText className="mr-2" />
                {t('checkout.viewProformaInvoice')}
              </Button>
              
              <Link to="/account">
                <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                  {t('checkout.viewAccount')}
                </Button>
              </Link>
              
              <Link to="/products">
                <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                  {t('checkout.continueShopping')}
                </Button>
              </Link>
            </div>
          </div>
          
          {showProforma && (
            <ProformaInvoice
              orderNumber={orderNumber}
              items={items}
              subtotal={subtotal}
              shipping={shipping}
              insurance={insurance}
              tax={tax}
              total={total}
              buyerInfo={buyerInfo}
              cifDetails={cifDetails}
            />
          )}
        </div>
      </div>
    );
  }
  
  if (step === 'proforma') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => setStep('confirmation')}
            className="flex items-center text-green-600 hover:text-green-700 mb-6"
          >
            <FiArrowLeft className="mr-2" />
            Back to Order Confirmation
          </button>
          
          <ProformaInvoice
            orderNumber={orderNumber}
            items={items}
            subtotal={subtotal}
            shipping={shipping}
            insurance={insurance}
            tax={tax}
            total={total}
            buyerInfo={buyerInfo}
            cifDetails={cifDetails}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/cart" className="inline-flex items-center text-green-600 hover:text-green-700 mb-6">
        <FiArrowLeft className="mr-2" />
        {t('checkout.backToCart')}
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-6">{t('checkout.title')}</h1>
              
              {/* Checkout Steps */}
              <div className="mb-8">
                <div className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    step === 'shipping' || step === 'payment' ? 'bg-green-600 text-white' : 'bg-gray-200'
                  }`}>
                    <span>1</span>
                  </div>
                  <div className="ml-4 flex-grow">
                    <h2 className="font-semibold">{t('checkout.shippingInfo')}</h2>
                  </div>
                  <div className="w-16 h-1 bg-gray-200"></div>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    step === 'payment' ? 'bg-green-600 text-white' : 'bg-gray-200'
                  }`}>
                    <span>2</span>
                  </div>
                  <div className="ml-4">
                    <h2 className="font-semibold">{t('checkout.payment')}</h2>
                  </div>
                </div>
              </div>
              
              {step === 'shipping' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-4">{t('checkout.shippingAddress')}</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2" htmlFor="firstName">
                        {t('checkout.firstName')}
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        autoComplete="shipping given-name"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2" htmlFor="lastName">
                        {t('checkout.lastName')}
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        autoComplete="shipping family-name"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2" htmlFor="company">
                      {t('checkout.companyName')} ({t('checkout.optional')})
                    </label>
                    <input
                      type="text"
                      id="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      autoComplete="shipping organization"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2" htmlFor="address">
                      {t('checkout.address')}
                    </label>
                    <input
                      type="text"
                      id="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      autoComplete="shipping street-address"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2" htmlFor="city">
                        {t('checkout.city')}
                      </label>
                      <input
                        type="text"
                        id="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        autoComplete="shipping address-level2"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2" htmlFor="state">
                        {t('checkout.state')}
                      </label>
                      <input
                        type="text"
                        id="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        autoComplete="shipping address-level1"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2" htmlFor="zip">
                        {t('checkout.zipCode')}
                      </label>
                      <input
                        type="text"
                        id="zip"
                        value={formData.zip}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        autoComplete="shipping postal-code"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2" htmlFor="country">
                      {t('checkout.country')}
                    </label>
                    <select
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({...formData, country: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      autoComplete="shipping country"
                    >
                      <option value="United States">United States</option>
                      <option value="Dominican Republic">Dominican Republic</option>
                      <option value="Puerto Rico">Puerto Rico</option>
                      <option value="Colombia">Colombia</option>
                      <option value="Costa Rica">Costa Rica</option>
                      <option value="Haiti">Haiti</option>
                      <option value="Jamaica">Jamaica</option>
                      <option value="Spanish Virgin Islands">Spanish Virgin Islands</option>
                      <option value="Barbados">Barbados</option>
                      <option value="Venezuela">Venezuela</option>
                      <option value="Nigeria">Nigeria</option>
                      <option value="Ghana">Ghana</option>
                      <option value="Kenya">Kenya</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2" htmlFor="email">
                      {t('checkout.email')}
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      autoComplete="email"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2" htmlFor="phone">
                      {t('checkout.phone')}
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      autoComplete="tel"
                    />
                  </div>
                  
                  {/* CIF Shipping Details */}
                  <div className="border-t pt-4 mt-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <FiFileText className="mr-2 text-blue-600" />
                      CIF Shipping Details
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg">
                      <div>
                        <label className="block text-gray-700 mb-2" htmlFor="portOfLoading">
                          Port of Loading
                        </label>
                        <input
                          type="text"
                          id="portOfLoading"
                          value={cifDetails.portOfLoading}
                          onChange={handleCifChange}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 mb-2" htmlFor="portOfDischarge">
                          Port of Discharge
                        </label>
                        <input
                          type="text"
                          id="portOfDischarge"
                          value={cifDetails.portOfDischarge}
                          onChange={handleCifChange}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 mb-2" htmlFor="incoterms">
                          Incoterms
                        </label>
                        <select
                          id="incoterms"
                          value={cifDetails.incoterms}
                          onChange={(e) => setCifDetails({...cifDetails, incoterms: e.target.value})}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="CIF">CIF (Cost, Insurance & Freight)</option>
                          <option value="FOB">FOB (Free On Board)</option>
                          <option value="EXW">EXW (Ex Works)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 mb-2" htmlFor="paymentTerms">
                          Payment Terms
                        </label>
                        <select
                          id="paymentTerms"
                          value={cifDetails.paymentTerms}
                          onChange={(e) => setCifDetails({...cifDetails, paymentTerms: e.target.value})}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="50% advance, 50% before shipment">50% advance, 50% before shipment</option>
                          <option value="100% advance payment">100% advance payment</option>
                          <option value="Letter of Credit">Letter of Credit</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 mb-2" htmlFor="countryOfOrigin">
                          Country of Origin
                        </label>
                        <select
                          id="countryOfOrigin"
                          value={cifDetails.countryOfOrigin}
                          onChange={(e) => setCifDetails({...cifDetails, countryOfOrigin: e.target.value})}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="USA">USA</option>
                          <option value="Nigeria">Nigeria</option>
                          <option value="Ghana">Ghana</option>
                          <option value="Jamaica">Jamaica</option>
                          <option value="Colombia">Colombia</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      variant="primary" 
                      size="lg" 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => setStep('payment')}
                    >
                      {t('checkout.continueToPayment')}
                    </Button>
                  </div>
                </div>
              )}
              
              {step === 'payment' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <FiCreditCard className="mr-2 text-green-600" />
                    {t('checkout.paymentMethod')}
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <label className="flex items-center cursor-pointer">
                        <input type="radio" name="paymentMethod" className="h-5 w-5 text-green-600" defaultChecked />
                        <span className="ml-3 font-medium">{t('checkout.creditCard')}</span>
                      </label>
                      
                      <div className="mt-4 pl-8 space-y-4">
                        <div>
                          <label className="block text-gray-700 mb-2" htmlFor="cardNumber">
                            {t('checkout.cardNumber')}
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              id="cardNumber"
                              value={paymentData.cardNumber}
                              onChange={(e) => handlePaymentInputChange('cardNumber', e.target.value)}
                              placeholder="1234 5678 9012 3456"
                              className={`w-full px-4 py-2 pr-12 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                                paymentErrors.cardNumber ? 'border-red-500' : ''
                              }`}
                              maxLength={cardType === 'amex' ? 17 : 19}
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <CardIcon type={cardType} />
                            </div>
                          </div>
                          {paymentErrors.cardNumber && (
                            <p className="text-red-500 text-sm mt-1">{paymentErrors.cardNumber}</p>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-gray-700 mb-2" htmlFor="expiry">
                              {t('checkout.expiryDate')}
                            </label>
                            <input
                              type="text"
                              id="expiry"
                              value={paymentData.expiryDate}
                              onChange={(e) => handlePaymentInputChange('expiryDate', e.target.value)}
                              placeholder="MM/YY"
                              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                                paymentErrors.expiryDate ? 'border-red-500' : ''
                              }`}
                              maxLength={5}
                            />
                            {paymentErrors.expiryDate && (
                              <p className="text-red-500 text-sm mt-1">{paymentErrors.expiryDate}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-gray-700 mb-2" htmlFor="cvc">
                              {t('checkout.cvc')} {cardType === 'amex' ? '(CID)' : '(CVC)'}
                            </label>
                            <input
                              type="text"
                              id="cvc"
                              value={paymentData.cvc}
                              onChange={(e) => handlePaymentInputChange('cvc', e.target.value)}
                              placeholder={cardType === 'amex' ? '1234' : '123'}
                              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                                paymentErrors.cvc ? 'border-red-500' : ''
                              }`}
                              maxLength={cardType === 'amex' ? 4 : 3}
                            />
                            {paymentErrors.cvc && (
                              <p className="text-red-500 text-sm mt-1">{paymentErrors.cvc}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <label className="flex items-center cursor-pointer">
                        <input type="radio" name="paymentMethod" className="h-5 w-5 text-green-600" />
                        <span className="ml-3 font-medium">{t('checkout.paypal')}</span>
                      </label>
                    </div>
                    
                    <div className="border rounded-lg p-4 bg-blue-50 border-blue-100">
                      <label className="flex items-center cursor-pointer">
                        <input type="radio" name="paymentMethod" className="h-5 w-5 text-blue-600" />
                        <span className="ml-3 font-medium text-blue-800">Wire Transfer (For CIF Orders)</span>
                      </label>
                      <div className="mt-2 pl-8">
                        <p className="text-sm text-blue-700">
                          For international shipments with CIF terms. You will receive wire transfer instructions in the proforma invoice.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex mt-6 pt-4">
                    <Button 
                      variant="outline" 
                      className="border-gray-300 mr-3"
                      onClick={() => setStep('shipping')}
                    >
                      {t('checkout.back')}
                    </Button>
                    <Button 
                      variant="primary" 
                      size="lg" 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={handleSubmitOrder}
                      isLoading={isSubmitting}
                    >
                      {t('checkout.placeOrder')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FiTruck className="mr-2 text-green-600" />
              {t('checkout.shippingMethod')}
            </h2>
            
            <div className="space-y-3">
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="radio" name="shipping" className="h-5 w-5 text-green-600" />
                <div className="ml-3 flex-grow">
                  <span className="font-medium">{t('checkout.standardShipping')}</span>
                  <p className="text-sm text-gray-500">{t('checkout.standardShippingDescription')}</p>
                </div>
                <span className="font-medium">{formatCurrency(shipping)}</span>
              </label>
              
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="radio" name="shipping" className="h-5 w-5 text-green-600" />
                <div className="ml-3 flex-grow">
                  <span className="font-medium">{t('checkout.expressShipping')}</span>
                  <p className="text-sm text-gray-500">{t('checkout.expressShippingDescription')}</p>
                </div>
                <span className="font-medium">{formatCurrency(12.99)}</span>
              </label>
              
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 bg-blue-50 border-blue-100">
                <input type="radio" name="shipping" className="h-5 w-5 text-blue-600" defaultChecked />
                <div className="ml-3 flex-grow">
                  <span className="font-medium text-blue-800">CIF International Shipping</span>
                  <p className="text-sm text-blue-700">Cost, Insurance & Freight to international destination</p>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    Includes Proforma Invoice
                  </span>
                </div>
                <span className="font-medium">{formatCurrency(shipping + insurance)}</span>
              </label>
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
            <h2 className="text-xl font-bold mb-6">{t('checkout.orderSummary')}</h2>
            
            <div className="max-h-64 overflow-y-auto mb-4">
              {items.map((item) => (
                <div key={item.product.id} className="flex items-center py-3 border-b">
                  <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden mr-3 flex-shrink-0">
                    <img 
                      src={(() => {
                        const imageSrc = item.product.images?.[0] || item.product.primaryImage || `/images/products/${item.product.image}` || '/images/product-placeholder.svg';
                        console.log('Checkout item debug:', {
                          productName: item.product.name,
                          images: item.product.images,
                          primaryImage: item.product.primaryImage,
                          image: item.product.image,
                          finalSrc: imageSrc
                        });
                        return imageSrc;
                      })()} 
                      alt={item.product.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        console.log('Checkout image failed to load:', target.src, 'for product:', item.product.name);
                        if (target.src !== '/images/product-placeholder.svg') {
                          target.src = '/images/product-placeholder.svg';
                        }
                      }}
                    />
                  </div>
                  <div className="flex-grow">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(item.product.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-3 border-b pb-4 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('checkout.subtotal')}</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              
              {/* Show savings only if there are any */}
              {totalSavings > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>{t('checkout.savings')}</span>
                  <span>-{formatCurrency(totalSavings)}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600">{t('checkout.shipping')}</span>
                <span>{formatCurrency(shipping)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Insurance</span>
                <span>{formatCurrency(insurance)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span>{formatCurrency(tax)}</span>
              </div>
            </div>
            
            <div className="flex justify-between font-bold text-lg mb-6">
              <span>{t('checkout.total')}</span>
              <span>{formatCurrency(total)}</span>
            </div>
            
            <div className="text-sm text-gray-600 mb-4">
              {t('checkout.taxDisclaimer')}
            </div>
            
            {/* For mobile, show a checkout button */}
            <div className="lg:hidden">
              {step === 'shipping' ? (
                <Button 
                  variant="primary" 
                  size="lg" 
                  fullWidth 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => setStep('payment')}
                >
                  {t('checkout.continueToPayment')}
                </Button>
              ) : (
                <Button 
                  variant="primary" 
                  size="lg" 
                  fullWidth 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleSubmitOrder}
                  isLoading={isSubmitting}
                >
                  {t('checkout.placeOrder')}
                </Button>
              )}
            </div>
            
            {/* Preview proforma invoice button */}
            <div className="mt-4 pt-4 border-t">
              <Button 
                variant="outline"
                fullWidth
                className="flex items-center justify-center border-blue-600 text-blue-600 hover:bg-blue-50"
                onClick={toggleProforma}
              >
                <FiFileText className="mr-2" />
                Preview Proforma Invoice
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;