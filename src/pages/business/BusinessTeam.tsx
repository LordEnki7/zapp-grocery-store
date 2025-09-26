import React, { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaUserPlus, FaEnvelope, FaPhone, FaCalendarAlt, FaShieldAlt, FaEye } from 'react-icons/fa';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'manager' | 'buyer' | 'viewer';
  department: string;
  joinDate: string;
  lastActive: string;
  status: 'active' | 'inactive' | 'pending';
  permissions: string[];
}

const BusinessTeam: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'members' | 'roles' | 'invitations'>('members');
  const [showInviteModal, setShowInviteModal] = useState(false);

  const teamMembers: TeamMember[] = [
    {
      id: 'TM-001',
      name: 'John Smith',
      email: 'john.smith@company.com',
      phone: '+1 (555) 123-4567',
      role: 'admin',
      department: 'Operations',
      joinDate: '2023-01-15',
      lastActive: '2024-01-15',
      status: 'active',
      permissions: ['manage_orders', 'manage_team', 'view_analytics', 'manage_billing']
    },
    {
      id: 'TM-002',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      phone: '+1 (555) 234-5678',
      role: 'manager',
      department: 'Purchasing',
      joinDate: '2023-03-20',
      lastActive: '2024-01-14',
      status: 'active',
      permissions: ['manage_orders', 'view_analytics']
    },
    {
      id: 'TM-003',
      name: 'Mike Davis',
      email: 'mike.davis@company.com',
      role: 'buyer',
      department: 'Procurement',
      joinDate: '2023-06-10',
      lastActive: '2024-01-13',
      status: 'active',
      permissions: ['place_orders', 'view_products']
    },
    {
      id: 'TM-004',
      name: 'Lisa Wilson',
      email: 'lisa.wilson@company.com',
      role: 'viewer',
      department: 'Finance',
      joinDate: '2023-09-05',
      lastActive: '2024-01-12',
      status: 'inactive',
      permissions: ['view_orders', 'view_analytics']
    }
  ];

  const pendingInvitations = [
    {
      id: 'INV-001',
      email: 'new.employee@company.com',
      role: 'buyer',
      department: 'Operations',
      invitedBy: 'John Smith',
      invitedDate: '2024-01-10',
      status: 'pending'
    },
    {
      id: 'INV-002',
      email: 'contractor@company.com',
      role: 'viewer',
      department: 'Consulting',
      invitedBy: 'Sarah Johnson',
      invitedDate: '2024-01-08',
      status: 'pending'
    }
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-600 bg-red-100';
      case 'manager': return 'text-blue-600 bg-blue-100';
      case 'buyer': return 'text-green-600 bg-green-100';
      case 'viewer': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const rolePermissions = {
    admin: ['Manage team members', 'Manage orders', 'View analytics', 'Manage billing', 'Manage settings'],
    manager: ['Manage orders', 'View analytics', 'Manage department team'],
    buyer: ['Place orders', 'View products', 'Manage cart', 'View order history'],
    viewer: ['View orders', 'View products', 'View analytics (read-only)']
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
              <p className="text-gray-600 mt-2">Manage your business team members and their permissions</p>
            </div>
            <button
              onClick={() => setShowInviteModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <FaUserPlus />
              <span>Invite Member</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('members')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'members'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Team Members ({teamMembers.length})
              </button>
              <button
                onClick={() => setActiveTab('roles')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'roles'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Roles & Permissions
              </button>
              <button
                onClick={() => setActiveTab('invitations')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'invitations'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pending Invitations ({pendingInvitations.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Team Members Tab */}
            {activeTab === 'members' && (
              <div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Member
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Active
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {teamMembers.map((member) => (
                        <tr key={member.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {member.name.charAt(0)}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{member.name}</div>
                                <div className="text-sm text-gray-500 flex items-center space-x-1">
                                  <FaEnvelope className="text-xs" />
                                  <span>{member.email}</span>
                                </div>
                                {member.phone && (
                                  <div className="text-sm text-gray-500 flex items-center space-x-1">
                                    <FaPhone className="text-xs" />
                                    <span>{member.phone}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(member.role)}`}>
                              {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {member.department}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(member.status)}`}>
                              {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {member.lastActive}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-900" title="View Details">
                                <FaEye />
                              </button>
                              <button className="text-green-600 hover:text-green-900" title="Edit Member">
                                <FaEdit />
                              </button>
                              <button className="text-red-600 hover:text-red-900" title="Remove Member">
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Roles & Permissions Tab */}
            {activeTab === 'roles' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Roles & Permissions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(rolePermissions).map(([role, permissions]) => (
                    <div key={role} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <FaShieldAlt className="text-blue-600" />
                          <h3 className="text-lg font-medium text-gray-900 capitalize">{role}</h3>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(role)}`}>
                          {teamMembers.filter(m => m.role === role).length} members
                        </span>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Permissions:</p>
                        <ul className="space-y-1">
                          {permissions.map((permission, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                              <span>{permission}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pending Invitations Tab */}
            {activeTab === 'invitations' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Pending Invitations</h2>
                {pendingInvitations.length > 0 ? (
                  <div className="space-y-4">
                    {pendingInvitations.map((invitation) => (
                      <div key={invitation.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600">
                                <FaEnvelope />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{invitation.email}</p>
                                <p className="text-sm text-gray-600">
                                  Invited as {invitation.role} • {invitation.department}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Invited by {invitation.invitedBy} on {invitation.invitedDate}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                              Resend
                            </button>
                            <button className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FaUserPlus className="mx-auto text-4xl text-gray-400 mb-4" />
                    <p className="text-lg text-gray-500">No pending invitations</p>
                    <p className="text-sm text-gray-400">Invite team members to get started</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FaUserPlus />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">{teamMembers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FaShieldAlt />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Members</p>
                <p className="text-2xl font-bold text-gray-900">
                  {teamMembers.filter(m => m.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <FaEnvelope />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Invites</p>
                <p className="text-2xl font-bold text-gray-900">{pendingInvitations.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <FaCalendarAlt />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(teamMembers.map(m => m.department)).size}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal (placeholder) */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Invite Team Member</h3>
            <p className="text-gray-600 mb-4">Invite modal content would go here...</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessTeam;