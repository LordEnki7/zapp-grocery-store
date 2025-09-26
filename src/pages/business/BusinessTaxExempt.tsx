import React, { useState } from 'react';
import { FaUpload, FaDownload, FaEye, FaTrash, FaCheck, FaTimes, FaFileAlt, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';

interface TaxExemptCertificate {
  id: string;
  type: 'resale' | 'nonprofit' | 'government' | 'manufacturing' | 'other';
  certificateNumber: string;
  issuingState: string;
  validFrom: string;
  validUntil: string;
  status: 'active' | 'expired' | 'pending' | 'rejected';
  documentUrl?: string;
  uploadedDate: string;
}

const BusinessTaxExempt: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'certificates' | 'upload' | 'settings'>('certificates');

  const certificates: TaxExemptCertificate[] = [
    {
      id: 'CERT-001',
      type: 'resale',
      certificateNumber: 'RS-123456789',
      issuingState: 'California',
      validFrom: '2024-01-01',
      validUntil: '2025-12-31',
      status: 'active',
      documentUrl: '/certificates/cert-001.pdf',
      uploadedDate: '2024-01-15'
    },
    {
      id: 'CERT-002',
      type: 'nonprofit',
      certificateNumber: 'NP-987654321',
      issuingState: 'New York',
      validFrom: '2023-06-01',
      validUntil: '2024-05-31',
      status: 'expired',
      documentUrl: '/certificates/cert-002.pdf',
      uploadedDate: '2023-06-01'
    },
    {
      id: 'CERT-003',
      type: 'government',
      certificateNumber: 'GOV-456789123',
      issuingState: 'Texas',
      validFrom: '2024-01-01',
      validUntil: '2024-12-31',
      status: 'pending',
      uploadedDate: '2024-01-10'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'expired': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'resale': return 'Resale Certificate';
      case 'nonprofit': return 'Nonprofit Exemption';
      case 'government': return 'Government Exemption';
      case 'manufacturing': return 'Manufacturing Exemption';
      default: return 'Other Exemption';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tax Exemption Management</h1>
          <p className="text-gray-600 mt-2">Manage your tax exemption certificates and settings</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('certificates')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'certificates'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Certificates
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'upload'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Upload New
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Settings
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Certificates Tab */}
            {activeTab === 'certificates' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Your Tax Exemption Certificates</h2>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <FaUpload />
                    <span>Upload Certificate</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {certificates.map((cert) => (
                    <div key={cert.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">
                              {getTypeLabel(cert.type)}
                            </h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(cert.status)}`}>
                              {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Certificate Number:</span>
                              <div>{cert.certificateNumber}</div>
                            </div>
                            <div>
                              <span className="font-medium">Issuing State:</span>
                              <div className="flex items-center space-x-1">
                                <FaMapMarkerAlt />
                                <span>{cert.issuingState}</span>
                              </div>
                            </div>
                            <div>
                              <span className="font-medium">Valid Period:</span>
                              <div className="flex items-center space-x-1">
                                <FaCalendarAlt />
                                <span>{cert.validFrom} - {cert.validUntil}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-2 ml-4">
                          {cert.documentUrl && (
                            <>
                              <button className="text-blue-600 hover:text-blue-800 p-2" title="View Certificate">
                                <FaEye />
                              </button>
                              <button className="text-green-600 hover:text-green-800 p-2" title="Download Certificate">
                                <FaDownload />
                              </button>
                            </>
                          )}
                          <button className="text-red-600 hover:text-red-800 p-2" title="Delete Certificate">
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Tab */}
            {activeTab === 'upload' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Upload New Tax Exemption Certificate</h2>
                
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Certificate Type
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Select certificate type</option>
                        <option value="resale">Resale Certificate</option>
                        <option value="nonprofit">Nonprofit Exemption</option>
                        <option value="government">Government Exemption</option>
                        <option value="manufacturing">Manufacturing Exemption</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Certificate Number
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter certificate number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Issuing State
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Select state</option>
                        <option value="CA">California</option>
                        <option value="NY">New York</option>
                        <option value="TX">Texas</option>
                        <option value="FL">Florida</option>
                        {/* Add more states as needed */}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Valid Until
                      </label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Certificate Document
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <FaFileAlt className="mx-auto text-4xl text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-2">
                        Drag and drop your certificate file here, or click to browse
                      </p>
                      <p className="text-sm text-gray-500">
                        Supported formats: PDF, JPG, PNG (Max size: 10MB)
                      </p>
                      <button
                        type="button"
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Choose File
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Upload Certificate
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Tax Exemption Settings</h2>
                
                <div className="space-y-6">
                  {/* Auto-apply Settings */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Auto-Apply Tax Exemptions</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-700">Automatically apply valid exemptions</p>
                          <p className="text-sm text-gray-600">Apply tax exemptions automatically when valid certificates are on file</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Notification Settings */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-700">Expiration reminders</p>
                          <p className="text-sm text-gray-600">Get notified 30 days before certificates expire</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-700">Status updates</p>
                          <p className="text-sm text-gray-600">Get notified when certificate status changes</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Default Settings */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Default Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Default Business State
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                          <option value="CA">California</option>
                          <option value="NY">New York</option>
                          <option value="TX">Texas</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Primary Certificate Type
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                          <option value="resale">Resale Certificate</option>
                          <option value="nonprofit">Nonprofit Exemption</option>
                          <option value="government">Government Exemption</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Save Settings
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessTaxExempt;