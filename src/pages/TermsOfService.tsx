import React from 'react';
import { FiFileText, FiShield, FiAlertTriangle, FiScale } from 'react-icons/fi';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-100 rounded-full">
              <FiFileText className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
              <p className="text-gray-600 mt-2">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed">
            Welcome to Zapp E-Commerce. These Terms of Service ("Terms") govern your use of our 
            website and services. By accessing or using our services, you agree to be bound by 
            these Terms. Please read them carefully.
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-8">
          
          {/* Acceptance of Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing and using Zapp E-Commerce ("we," "us," or "our"), you accept and agree 
              to be bound by the terms and provision of this agreement. If you do not agree to 
              abide by the above, please do not use this service.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>Important:</strong> These terms constitute a legally binding agreement 
                between you and Zapp E-Commerce. Please ensure you understand all provisions 
                before using our services.
              </p>
            </div>
          </section>

          {/* Definitions */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Definitions</h2>
            <div className="space-y-3">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-medium text-gray-900">"Service"</h4>
                <p className="text-gray-700 text-sm">
                  Refers to the Zapp E-Commerce website, mobile applications, and all related services.
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-medium text-gray-900">"User" or "You"</h4>
                <p className="text-gray-700 text-sm">
                  Refers to any individual or entity that accesses or uses our Service.
                </p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-medium text-gray-900">"Content"</h4>
                <p className="text-gray-700 text-sm">
                  Includes all text, images, videos, data, and other materials available through our Service.
                </p>
              </div>
            </div>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <FiShield className="w-6 h-6 text-blue-600" />
              3. User Accounts
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Account Creation</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>You must be at least 18 years old to create an account</li>
                  <li>You must provide accurate and complete information</li>
                  <li>You are responsible for maintaining account security</li>
                  <li>One person or entity may not maintain multiple accounts</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Account Responsibilities</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Keep your password secure and confidential</li>
                  <li>Notify us immediately of any unauthorized access</li>
                  <li>Update your information to keep it current and accurate</li>
                  <li>You are liable for all activities under your account</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Acceptable Use */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <FiAlertTriangle className="w-6 h-6 text-yellow-600" />
              4. Acceptable Use Policy
            </h2>
            
            <p className="text-gray-700 mb-4">
              You agree not to use our Service for any unlawful or prohibited activities, including:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2 text-red-600">Prohibited Activities</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  <li>Violating any applicable laws or regulations</li>
                  <li>Infringing on intellectual property rights</li>
                  <li>Transmitting harmful or malicious code</li>
                  <li>Attempting to gain unauthorized access</li>
                  <li>Harassing or threatening other users</li>
                  <li>Posting false or misleading information</li>
                  <li>Engaging in fraudulent activities</li>
                  <li>Spamming or sending unsolicited communications</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2 text-green-600">Encouraged Behavior</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  <li>Providing honest product reviews</li>
                  <li>Respecting other users and their opinions</li>
                  <li>Following community guidelines</li>
                  <li>Reporting suspicious or inappropriate content</li>
                  <li>Using the Service as intended</li>
                  <li>Protecting your personal information</li>
                  <li>Providing feedback to improve our Service</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Orders and Payments */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Orders and Payments</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Order Process</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>All orders are subject to acceptance and availability</li>
                  <li>We reserve the right to refuse or cancel any order</li>
                  <li>Prices are subject to change without notice</li>
                  <li>Order confirmation does not guarantee product availability</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Terms</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Payment is due at the time of order placement</li>
                  <li>We accept major credit cards and other specified payment methods</li>
                  <li>All payments are processed securely through third-party providers</li>
                  <li>You authorize us to charge your payment method for all purchases</li>
                </ul>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">Pricing Disclaimer</h4>
                <p className="text-yellow-700 text-sm">
                  While we strive to provide accurate pricing information, errors may occur. 
                  In the event of a pricing error, we reserve the right to cancel the order 
                  and refund any payment made.
                </p>
              </div>
            </div>
          </section>

          {/* Shipping and Returns */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Shipping and Returns</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Shipping Policy</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  <li>Shipping times are estimates and not guaranteed</li>
                  <li>Risk of loss transfers upon delivery to carrier</li>
                  <li>International shipping may be subject to customs fees</li>
                  <li>We are not responsible for shipping delays beyond our control</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Return Policy</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  <li>Returns must be initiated within 30 days of delivery</li>
                  <li>Items must be in original condition and packaging</li>
                  <li>Some items may not be eligible for return</li>
                  <li>Return shipping costs may apply</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Intellectual Property Rights</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Our Rights</h3>
                <p className="text-gray-700 mb-3">
                  All content on our Service, including text, graphics, logos, images, and software, 
                  is the property of Zapp E-Commerce or its licensors and is protected by copyright, 
                  trademark, and other intellectual property laws.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your Rights</h3>
                <p className="text-gray-700 mb-3">
                  We grant you a limited, non-exclusive, non-transferable license to access and 
                  use our Service for personal, non-commercial purposes, subject to these Terms.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">User-Generated Content</h3>
                <p className="text-gray-700">
                  By submitting content (reviews, comments, etc.), you grant us a worldwide, 
                  royalty-free license to use, modify, and display such content in connection 
                  with our Service.
                </p>
              </div>
            </div>
          </section>

          {/* Privacy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Privacy</h2>
            <p className="text-gray-700 mb-4">
              Your privacy is important to us. Our Privacy Policy explains how we collect, use, 
              and protect your information when you use our Service. By using our Service, you 
              agree to the collection and use of information in accordance with our Privacy Policy.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                Please review our <a href="/privacy-policy" className="underline hover:text-blue-900">Privacy Policy</a> 
                to understand our practices regarding your personal information.
              </p>
            </div>
          </section>

          {/* Disclaimers */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <FiScale className="w-6 h-6 text-red-600" />
              9. Disclaimers and Limitation of Liability
            </h2>
            
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-red-800 mb-2">Service Disclaimer</h3>
                <p className="text-red-700 text-sm">
                  OUR SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, 
                  EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF 
                  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
                </p>
              </div>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-orange-800 mb-2">Limitation of Liability</h3>
                <p className="text-orange-700 text-sm">
                  IN NO EVENT SHALL ZAPP E-COMMERCE BE LIABLE FOR ANY INDIRECT, INCIDENTAL, 
                  SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, 
                  LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
                </p>
              </div>
            </div>
          </section>

          {/* Indemnification */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Indemnification</h2>
            <p className="text-gray-700">
              You agree to defend, indemnify, and hold harmless Zapp E-Commerce and its officers, 
              directors, employees, and agents from and against any claims, damages, obligations, 
              losses, liabilities, costs, or debt, and expenses (including attorney's fees) arising from:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 mt-3">
              <li>Your use of and access to the Service</li>
              <li>Your violation of any term of these Terms</li>
              <li>Your violation of any third-party right</li>
              <li>Any claim that your content caused damage to a third party</li>
            </ul>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Termination</h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                We may terminate or suspend your account and bar access to the Service immediately, 
                without prior notice or liability, under our sole discretion, for any reason whatsoever 
                and without limitation, including but not limited to a breach of the Terms.
              </p>
              <p className="text-gray-700">
                If you wish to terminate your account, you may simply discontinue using the Service 
                or contact us to request account deletion.
              </p>
            </div>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Governing Law</h2>
            <p className="text-gray-700">
              These Terms shall be interpreted and governed by the laws of the State of [Your State], 
              without regard to conflict of law provisions. Any disputes arising under these Terms 
              shall be subject to the exclusive jurisdiction of the courts located in [Your City, State].
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Changes to Terms</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to modify or replace these Terms at any time. If a revision is 
              material, we will provide at least 30 days notice prior to any new terms taking effect.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-700 text-sm">
                What constitutes a material change will be determined at our sole discretion. 
                By continuing to access or use our Service after any revisions become effective, 
                you agree to be bound by the revised terms.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            
            <div className="space-y-2 text-gray-700">
              <div>Email: legal@zapp-ecommerce.com</div>
              <div>Phone: 1-800-ZAPP-HELP (1-800-927-7435)</div>
              <div>
                Address: Zapp E-Commerce Legal Department<br />
                123 Commerce Street<br />
                Tech City, TC 12345<br />
                United States
              </div>
            </div>
          </section>

          {/* Acknowledgment */}
          <section className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Acknowledgment</h2>
            <p className="text-gray-700">
              BY USING OUR SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS OF SERVICE 
              AND AGREE TO BE BOUND BY THEM. IF YOU DO NOT AGREE TO THESE TERMS, YOU MUST NOT 
              USE OUR SERVICE.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;