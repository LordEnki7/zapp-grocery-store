import React, { useState } from 'react';
import { FaPhone, FaEnvelope, FaComments, FaClock, FaQuestionCircle, FaShippingFast, FaCreditCard, FaUndo, FaUser, FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const Help: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  });

  const faqs: FAQItem[] = [
    {
      id: '1',
      question: 'How do I track my order?',
      answer: 'You can track your order by logging into your account and visiting the "Your Orders" section. You\'ll find tracking information and delivery updates there. You can also use the tracking number sent to your email.',
      category: 'orders'
    },
    {
      id: '2',
      question: 'What are your shipping options and costs?',
      answer: 'We offer standard shipping (3-5 business days) and express shipping (1-2 business days). Free shipping is available on orders over $35. International shipping is available to the Caribbean and Africa with CIF options.',
      category: 'shipping'
    },
    {
      id: '3',
      question: 'How can I return or exchange an item?',
      answer: 'Items can be returned within 30 days of delivery. Visit our Returns page to initiate a return. Fresh and perishable items have different return policies. Refunds are processed within 5-7 business days.',
      category: 'returns'
    },
    {
      id: '4',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, Apple Pay, Google Pay, and for business customers, we offer Net payment terms (Net 30). All payments are processed securely through Stripe.',
      category: 'payment'
    },
    {
      id: '5',
      question: 'How do I create a business account?',
      answer: 'During signup, select "Business Account" and provide your business information. Business accounts get access to bulk pricing, payment terms, team management, and business analytics.',
      category: 'account'
    },
    {
      id: '6',
      question: 'Do you deliver fresh produce internationally?',
      answer: 'Yes! We specialize in delivering fresh Caribbean and African products internationally. We use specialized packaging and expedited shipping to ensure freshness. Delivery times vary by location.',
      category: 'shipping'
    },
    {
      id: '7',
      question: 'How do I use promo codes?',
      answer: 'Enter your promo code at checkout in the "Promo Code" field. The discount will be applied automatically. Some codes may have restrictions or expiration dates.',
      category: 'orders'
    },
    {
      id: '8',
      question: 'Can I modify or cancel my order?',
      answer: 'Orders can be modified or cancelled within 1 hour of placement. After that, please contact customer service. Once an order is being prepared, changes may not be possible.',
      category: 'orders'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Topics', icon: FaQuestionCircle },
    { id: 'orders', name: 'Orders & Tracking', icon: FaShippingFast },
    { id: 'shipping', name: 'Shipping & Delivery', icon: FaShippingFast },
    { id: 'payment', name: 'Payment & Billing', icon: FaCreditCard },
    { id: 'returns', name: 'Returns & Refunds', icon: FaUndo },
    { id: 'account', name: 'Account & Profile', icon: FaUser }
  ];

  const filteredFAQs = activeCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === activeCategory);

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the form data to your backend
    alert('Thank you for contacting us! We\'ll get back to you within 24 hours.');
    setContactForm({
      name: '',
      email: '',
      subject: '',
      message: '',
      category: 'general'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">How Can We Help You?</h1>
          <p className="text-xl text-blue-100 mb-8">
            Get quick answers to your questions or contact our support team
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Options */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Contact Us</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                  <FaPhone className="text-blue-600 text-xl" />
                  <div>
                    <h3 className="font-semibold text-gray-800">Phone Support</h3>
                    <p className="text-gray-600">1-800-ZAPP-HELP</p>
                    <p className="text-sm text-gray-500">Mon-Fri 8AM-8PM EST</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                  <FaEnvelope className="text-green-600 text-xl" />
                  <div>
                    <h3 className="font-semibold text-gray-800">Email Support</h3>
                    <p className="text-gray-600">support@zapp-ecommerce.com</p>
                    <p className="text-sm text-gray-500">Response within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg">
                  <FaComments className="text-purple-600 text-xl" />
                  <div>
                    <h3 className="font-semibold text-gray-800">Live Chat</h3>
                    <p className="text-gray-600">Available on website</p>
                    <p className="text-sm text-gray-500">Mon-Fri 9AM-6PM EST</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <FaClock className="text-gray-600" />
                  <h3 className="font-semibold text-gray-800">Business Hours</h3>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Monday - Friday: 8:00 AM - 8:00 PM EST</p>
                  <p>Saturday: 9:00 AM - 6:00 PM EST</p>
                  <p>Sunday: 10:00 AM - 4:00 PM EST</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Send us a Message</h2>
              
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Name</label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Category</label>
                  <select
                    value={contactForm.category}
                    onChange={(e) => setContactForm({...contactForm, category: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="orders">Order Issue</option>
                    <option value="shipping">Shipping Question</option>
                    <option value="returns">Return/Refund</option>
                    <option value="technical">Technical Support</option>
                    <option value="business">Business Account</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Subject</label>
                  <input
                    type="text"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Message</label>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
              
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 mb-6">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      activeCategory === category.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <category.icon className="text-sm" />
                    <span className="text-sm font-medium">{category.name}</span>
                  </button>
                ))}
              </div>

              {/* FAQ Items */}
              <div className="space-y-4">
                {filteredFAQs.map((faq) => (
                  <div key={faq.id} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleFAQ(faq.id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="font-semibold text-gray-800">{faq.question}</h3>
                      {expandedFAQ === faq.id ? (
                        <FaChevronUp className="text-gray-500" />
                      ) : (
                        <FaChevronDown className="text-gray-500" />
                      )}
                    </button>
                    
                    {expandedFAQ === faq.id && (
                      <div className="px-4 pb-4">
                        <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredFAQs.length === 0 && (
                <div className="text-center py-8">
                  <FaQuestionCircle className="text-gray-400 text-4xl mx-auto mb-4" />
                  <p className="text-gray-500">No FAQs found for this category.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;