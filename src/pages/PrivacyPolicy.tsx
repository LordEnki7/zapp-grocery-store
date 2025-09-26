import React from 'react';
import { FiShield, FiLock, FiEye, FiMail, FiPhone } from 'react-icons/fi';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-100 rounded-full">
              <FiShield className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
              <p className="text-gray-600 mt-2">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed">
            At Zapp E-Commerce, we are committed to protecting your privacy and ensuring 
            the security of your personal information. This Privacy Policy explains how we 
            collect, use, disclose, and safeguard your information when you visit our website 
            and use our services.
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-8">
          
          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <FiEye className="w-6 h-6 text-blue-600" />
              Information We Collect
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Personal Information</h3>
                <p className="text-gray-700 mb-3">
                  We collect personal information that you voluntarily provide to us when you:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Create an account on our website</li>
                  <li>Make a purchase or place an order</li>
                  <li>Subscribe to our newsletter or marketing communications</li>
                  <li>Contact us for customer support</li>
                  <li>Participate in surveys, contests, or promotions</li>
                  <li>Leave reviews or ratings for products</li>
                </ul>
                <p className="text-gray-700 mt-3">
                  This information may include: name, email address, phone number, billing and 
                  shipping addresses, payment information, date of birth, and preferences.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Automatically Collected Information</h3>
                <p className="text-gray-700 mb-3">
                  When you visit our website, we automatically collect certain information about 
                  your device and browsing behavior, including:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>IP address and location data</li>
                  <li>Browser type and version</li>
                  <li>Operating system</li>
                  <li>Pages visited and time spent on our site</li>
                  <li>Referring website</li>
                  <li>Search terms used</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <FiLock className="w-6 h-6 text-blue-600" />
              How We Use Your Information
            </h2>
            
            <p className="text-gray-700 mb-4">
              We use the information we collect for various purposes, including:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Service Provision</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  <li>Process and fulfill your orders</li>
                  <li>Manage your account and preferences</li>
                  <li>Provide customer support</li>
                  <li>Send order confirmations and updates</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Communication</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  <li>Send promotional emails and newsletters</li>
                  <li>Notify you about new products and offers</li>
                  <li>Respond to your inquiries and requests</li>
                  <li>Send important account notifications</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Improvement & Analytics</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  <li>Analyze website usage and performance</li>
                  <li>Improve our products and services</li>
                  <li>Personalize your shopping experience</li>
                  <li>Conduct market research</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Legal & Security</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  <li>Comply with legal obligations</li>
                  <li>Prevent fraud and abuse</li>
                  <li>Protect our rights and property</li>
                  <li>Ensure website security</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Information Sharing */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information Sharing and Disclosure</h2>
            
            <p className="text-gray-700 mb-4">
              We do not sell, trade, or rent your personal information to third parties. 
              We may share your information in the following circumstances:
            </p>
            
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-medium text-gray-900">Service Providers</h4>
                <p className="text-gray-700 text-sm">
                  We work with trusted third-party service providers who assist us in operating 
                  our website, conducting business, or serving you (payment processors, shipping 
                  companies, email service providers).
                </p>
              </div>
              
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-medium text-gray-900">Legal Requirements</h4>
                <p className="text-gray-700 text-sm">
                  We may disclose your information when required by law, court order, or 
                  government regulation, or to protect our rights, property, or safety.
                </p>
              </div>
              
              <div className="border-l-4 border-yellow-500 pl-4">
                <h4 className="font-medium text-gray-900">Business Transfers</h4>
                <p className="text-gray-700 text-sm">
                  In the event of a merger, acquisition, or sale of assets, your information 
                  may be transferred as part of the business transaction.
                </p>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Security</h2>
            
            <p className="text-gray-700 mb-4">
              We implement appropriate technical and organizational security measures to protect 
              your personal information against unauthorized access, alteration, disclosure, or destruction:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Technical Measures</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• SSL/TLS encryption</li>
                  <li>• Secure payment processing</li>
                  <li>• Regular security audits</li>
                  <li>• Access controls and authentication</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Organizational Measures</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Employee training and access limits</li>
                  <li>• Data minimization practices</li>
                  <li>• Regular policy updates</li>
                  <li>• Incident response procedures</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights and Choices</h2>
            
            <p className="text-gray-700 mb-4">
              You have certain rights regarding your personal information:
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-medium text-gray-900">Access and Portability</h4>
                  <p className="text-gray-700 text-sm">
                    Request access to your personal information and receive a copy in a portable format.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-medium text-gray-900">Correction and Update</h4>
                  <p className="text-gray-700 text-sm">
                    Update or correct inaccurate personal information in your account settings.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-medium text-gray-900">Deletion</h4>
                  <p className="text-gray-700 text-sm">
                    Request deletion of your personal information, subject to legal and business requirements.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-medium text-gray-900">Marketing Opt-out</h4>
                  <p className="text-gray-700 text-sm">
                    Unsubscribe from marketing communications at any time using the unsubscribe link.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cookies and Tracking Technologies</h2>
            
            <p className="text-gray-700 mb-4">
              We use cookies and similar technologies to enhance your browsing experience:
            </p>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">Type</th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">Purpose</th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Essential</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Website functionality and security</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Session</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Analytics</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Usage statistics and performance</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">2 years</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Marketing</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Personalized ads and content</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">1 year</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Preferences</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Remember your settings</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Children's Privacy</h2>
            <p className="text-gray-700">
              Our services are not intended for children under 13 years of age. We do not 
              knowingly collect personal information from children under 13. If you are a 
              parent or guardian and believe your child has provided us with personal information, 
              please contact us immediately.
            </p>
          </section>

          {/* International Transfers */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">International Data Transfers</h2>
            <p className="text-gray-700">
              Your information may be transferred to and processed in countries other than your 
              country of residence. We ensure appropriate safeguards are in place to protect 
              your information in accordance with applicable data protection laws.
            </p>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to This Privacy Policy</h2>
            <p className="text-gray-700">
              We may update this Privacy Policy from time to time. We will notify you of any 
              material changes by posting the new Privacy Policy on this page and updating the 
              "Last updated" date. We encourage you to review this Privacy Policy periodically.
            </p>
          </section>

          {/* Contact Information */}
          <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about this Privacy Policy or our privacy practices, 
              please contact us:
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <FiMail className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700">privacy@zapp-ecommerce.com</span>
              </div>
              <div className="flex items-center gap-3">
                <FiPhone className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700">1-800-ZAPP-HELP (1-800-927-7435)</span>
              </div>
              <div className="flex items-start gap-3">
                <FiMail className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-gray-700">
                  <div>Zapp E-Commerce Privacy Team</div>
                  <div>123 Commerce Street</div>
                  <div>Tech City, TC 12345</div>
                  <div>United States</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;