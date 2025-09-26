import React from 'react';
import { FaHandshake, FaDollarSign, FaUsers, FaChartLine, FaGift, FaRocket } from 'react-icons/fa';
import { AffiliateJoinForm } from '../components/affiliate/AffiliateJoinForm';

const Affiliate: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Join the ZAPP Affiliate Program
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Earn 5% commission promoting authentic Caribbean & African products
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <FaDollarSign className="text-4xl mb-4 mx-auto text-yellow-300" />
                <h3 className="text-xl font-semibold mb-2">5% Commission</h3>
                <p className="text-blue-100">Earn on every first order from your referrals</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <FaGift className="text-4xl mb-4 mx-auto text-green-300" />
                <h3 className="text-xl font-semibold mb-2">$50 Minimum</h3>
                <p className="text-blue-100">Low payout threshold with monthly payments</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <FaRocket className="text-4xl mb-4 mx-auto text-pink-300" />
                <h3 className="text-xl font-semibold mb-2">30-Day Cookies</h3>
                <p className="text-blue-100">Extended tracking window for better conversions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
              Why Partner with ZAPP?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaHandshake className="text-2xl text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Trusted Brand</h3>
                <p className="text-gray-600">
                  Partner with a leading platform for authentic Caribbean & African products
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaUsers className="text-2xl text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Growing Community</h3>
                <p className="text-gray-600">
                  Tap into our expanding customer base of food enthusiasts and cultural communities
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaChartLine className="text-2xl text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Marketing Support</h3>
                <p className="text-gray-600">
                  Access to promotional materials, product images, and marketing resources
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaDollarSign className="text-2xl text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Competitive Rates</h3>
                <p className="text-gray-600">
                  Earn 5% commission on first orders with potential for performance bonuses
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaGift className="text-2xl text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Exclusive Products</h3>
                <p className="text-gray-600">
                  Promote unique, hard-to-find products with high demand and customer loyalty
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaRocket className="text-2xl text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Easy Integration</h3>
                <p className="text-gray-600">
                  Simple setup with tracking links, banners, and real-time analytics dashboard
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Apply & Get Approved</h3>
                <p className="text-gray-600">
                  Fill out our application form and get approved within 24-48 hours
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Promote Products</h3>
                <p className="text-gray-600">
                  Share your unique referral links through your channels and social media
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Earn Commissions</h3>
                <p className="text-gray-600">
                  Get paid monthly for every first order made through your referral links
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Application Form Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-gray-600">
                Join thousands of affiliates earning with ZAPP. Fill out the form below to apply.
              </p>
            </div>
            
            {/* Affiliate Join Form */}
            <AffiliateJoinForm />
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-2 text-gray-900">
                  How much can I earn as a ZAPP affiliate?
                </h3>
                <p className="text-gray-600">
                  You earn 5% commission on the first order from each customer you refer. With our average order value of $75, you can earn approximately $3.75 per successful referral. Top affiliates earn $500-2000+ per month.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-2 text-gray-900">
                  When do I get paid?
                </h3>
                <p className="text-gray-600">
                  Payments are processed monthly on the 15th of each month for the previous month's earnings. You need to reach a minimum of $50 in commissions to receive a payout.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-2 text-gray-900">
                  What marketing materials do you provide?
                </h3>
                <p className="text-gray-600">
                  We provide banners, product images, promotional copy, and seasonal campaign materials. You'll also get access to our affiliate dashboard with real-time tracking and analytics.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-2 text-gray-900">
                  Can I promote ZAPP on social media?
                </h3>
                <p className="text-gray-600">
                  Absolutely! Social media is one of our most effective channels. We encourage promotion on Instagram, Facebook, TikTok, YouTube, and other platforms. Just make sure to follow FTC guidelines and disclose your affiliate relationship.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Affiliate;