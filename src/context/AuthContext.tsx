import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { SessionManager, AuditLogger, InputSanitizer, ValidationPatterns } from '../utils/security';
import type { UserProfile, Address, BusinessProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  registerBusiness: (email: string, password: string, displayName: string, businessData: Partial<BusinessProfile>) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  isBusinessAccount: () => boolean;
  switchAccountType: (accountType: 'consumer' | 'business') => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userProfile: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  registerBusiness: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
  updateUserProfile: async () => {},
  changePassword: async () => {},
  hasRole: () => false,
  hasPermission: () => false,
  isBusinessAccount: () => false,
  switchAccountType: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Validate input data
  const validateEmail = (email: string): void => {
    if (!ValidationPatterns.email.test(email)) {
      throw new Error('Invalid email format');
    }
  };

  const validatePassword = (password: string): void => {
    if (!ValidationPatterns.password.test(password)) {
      throw new Error('Password must be at least 8 characters with uppercase, lowercase, number, and special character');
    }
  };

  // Load user profile from Firestore
  const loadUserProfile = async (user: User): Promise<UserProfile | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phone: data.phone || '',
          dateOfBirth: data.dateOfBirth?.toDate(),
          role: data.role || 'customer',
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastLogin: new Date(),
          isActive: data.isActive !== false,
          isEmailVerified: user.emailVerified,
          preferences: data.preferences || {
            language: 'en',
            currency: 'USD',
            notifications: {
              email: true,
              sms: false,
              push: true,
              marketing: false
            },
            theme: 'light'
          },
          loyaltyPoints: data.loyaltyPoints || 0,
          totalSpent: data.totalSpent || 0,
          orderCount: data.orderCount || 0,
          addresses: data.addresses || [],
          paymentMethods: data.paymentMethods || [],
          wishlist: data.wishlist || [],
          recentlyViewed: data.recentlyViewed || []
        };
      }
      return null;
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  };

  // Create user profile in Firestore
  const createUserProfile = async (user: User, additionalData: any = {}): Promise<void> => {
    try {
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        firstName: additionalData.firstName || '',
        lastName: additionalData.lastName || '',
        phone: additionalData.phone || '',
        dateOfBirth: additionalData.dateOfBirth,
        role: 'customer',
        accountType: additionalData.accountType || 'consumer',
        businessProfile: additionalData.businessProfile || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date(),
        isActive: true,
        isEmailVerified: user.emailVerified,
        preferences: {
          language: 'en',
          currency: 'USD',
          notifications: {
            email: true,
            sms: false,
            push: true,
            marketing: false
          },
          theme: 'light'
        },
        loyaltyPoints: 0,
        totalSpent: 0,
        orderCount: 0,
        addresses: [],
        paymentMethods: [],
        wishlist: [],
        recentlyViewed: [],
        ...additionalData
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);
      setUserProfile(userProfile);
      
      await AuditLogger.log('user_created', user.uid, { email: user.email, accountType: userProfile.accountType });
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    try {
      // Check if Firebase is configured
      if (!auth) {
        // Development fallback - check mock users
        const existingUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
        const mockUser = existingUsers.find((u: any) => u.email === email);
        
        if (!mockUser) {
          throw new Error('No account found with this email address');
        }
        
        // In development, we'll accept any password for simplicity
        // In a real app, you'd hash and compare passwords
        localStorage.setItem('currentMockUser', JSON.stringify(mockUser));
        
        // Load mock user profile
        const mockProfile = JSON.parse(localStorage.getItem('mockUserProfile') || '{}');
        if (mockProfile.uid === mockUser.uid) {
          setUserProfile(mockProfile);
        }
        
        setCurrentUser(mockUser as any);
        console.log('Mock user logged in successfully (development mode)');
        return;
      }
      
      // Production Firebase login
      validateEmail(email);
      const sanitizedEmail = InputSanitizer.sanitizeEmail(email);
      
      const userCredential = await signInWithEmailAndPassword(auth, sanitizedEmail, password);
      const profile = await loadUserProfile(userCredential.user);
      
      if (profile && !profile.isActive) {
        await signOut(auth);
        throw new Error('Account is deactivated. Please contact support.');
      }
      
      if (profile) {
        // Update last login
        await updateDoc(doc(db, 'users', userCredential.user.uid), {
          lastLogin: new Date()
        });
        
        SessionManager.createSession(userCredential.user.uid, profile.role);
        await AuditLogger.log('user_login', userCredential.user.uid);
      }
    } catch (error: any) {
      await AuditLogger.log('login_failed', 'unknown', { email, error: error.message });
      throw error;
    }
  };

  // Register function
  const register = async (email: string, password: string, displayName: string): Promise<void> => {
    try {
      // Check if Firebase is configured
      if (!auth) {
        // Development fallback - create mock user account
        const mockUser = {
          uid: `mock_${Date.now()}`,
          email: email,
          displayName: displayName,
          emailVerified: false,
          createdAt: new Date().toISOString()
        };
        
        // Store in localStorage for development
        const existingUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
        
        // Check if user already exists
        if (existingUsers.find((u: any) => u.email === email)) {
          throw new Error('An account with this email already exists');
        }
        
        existingUsers.push(mockUser);
        localStorage.setItem('mockUsers', JSON.stringify(existingUsers));
        localStorage.setItem('currentMockUser', JSON.stringify(mockUser));
        
        // Create mock user profile
        const mockProfile = {
          uid: mockUser.uid,
          email: email,
          displayName: displayName,
          firstName: displayName.split(' ')[0] || '',
          lastName: displayName.split(' ').slice(1).join(' ') || '',
          phone: '',
          role: 'customer',
          accountType: 'consumer',
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          isEmailVerified: false,
          preferences: {
            language: 'en',
            currency: 'USD',
            notifications: {
              email: true,
              sms: false,
              push: true,
              marketing: false
            },
            theme: 'light'
          },
          loyaltyPoints: 0,
          totalSpent: 0,
          orderCount: 0,
          addresses: [],
          paymentMethods: [],
          wishlist: [],
          recentlyViewed: []
        };
        
        localStorage.setItem('mockUserProfile', JSON.stringify(mockProfile));
        
        // Set state to simulate logged in user
        setCurrentUser(mockUser as any);
        setUserProfile(mockProfile as any);
        
        console.log('Mock user created successfully (development mode)');
        return;
      }
      
      // Production Firebase registration
      validateEmail(email);
      validatePassword(password);
      
      const sanitizedEmail = InputSanitizer.sanitizeEmail(email);
      const sanitizedDisplayName = InputSanitizer.sanitizeString(displayName);
      
      const userCredential = await createUserWithEmailAndPassword(auth, sanitizedEmail, password);
      
      await updateProfile(userCredential.user, {
        displayName: sanitizedDisplayName
      });
      
      await createUserProfile(userCredential.user, {
        displayName: sanitizedDisplayName,
        accountType: 'consumer'
      });
      
      SessionManager.createSession(userCredential.user.uid, 'customer');
    } catch (error: any) {
      await AuditLogger.log('registration_failed', 'unknown', { email, error: error.message });
      throw error;
    }
  };

  // Register business function
  const registerBusiness = async (email: string, password: string, displayName: string, businessData: Partial<BusinessProfile>): Promise<void> => {
    try {
      validateEmail(email);
      validatePassword(password);
      
      const sanitizedEmail = InputSanitizer.sanitizeEmail(email);
      const sanitizedDisplayName = InputSanitizer.sanitizeString(displayName);
      
      const userCredential = await createUserWithEmailAndPassword(auth, sanitizedEmail, password);
      
      await updateProfile(userCredential.user, {
        displayName: sanitizedDisplayName
      });
      
      // Create business profile with default values
      const businessProfile: BusinessProfile = {
        companyName: businessData.companyName || '',
        businessType: businessData.businessType || 'other',
        taxId: businessData.taxId || '',
        businessAddress: businessData.businessAddress || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'US'
        },
        contactPerson: businessData.contactPerson || {
          name: displayName,
          title: '',
          email: email,
          phone: ''
        },
        paymentTerms: businessData.paymentTerms || {
          type: 'immediate',
          days: 0,
          creditLimit: 0,
          currentBalance: 0,
          paymentHistory: []
        },
        volumeDiscounts: businessData.volumeDiscounts || [],
        taxExemption: businessData.taxExemption || {
          isExempt: false,
          exemptionNumber: '',
          exemptionType: 'none',
          validUntil: null,
          exemptStates: [],
          documentUrl: ''
        },
        businessSupport: businessData.businessSupport || {
          accountManager: '',
          supportTier: 'standard',
          contactMethods: ['email'],
          businessHours: '9AM-5PM EST',
          emergencyContact: ''
        },
        isVerified: false,
        verificationDocuments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await createUserProfile(userCredential.user, {
        displayName: sanitizedDisplayName,
        accountType: 'business',
        businessProfile: businessProfile
      });
      
      SessionManager.createSession(userCredential.user.uid, 'customer');
      await AuditLogger.log('business_registration', userCredential.user.uid, { companyName: businessProfile.companyName });
    } catch (error: any) {
      await AuditLogger.log('business_registration_failed', 'unknown', { email, error: error.message });
      throw error;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      // Check if Firebase is configured
      if (!auth) {
        // Development fallback - clear mock user data
        localStorage.removeItem('currentMockUser');
        localStorage.removeItem('mockUserProfile');
        setCurrentUser(null);
        setUserProfile(null);
        console.log('Mock user logged out successfully (development mode)');
        return;
      }
      
      // Production Firebase logout
      if (currentUser) {
        await AuditLogger.log('user_logout', currentUser.uid);
      }
      
      SessionManager.clearSession();
      await signOut(auth);
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  // Reset password function
  const resetPassword = async (email: string): Promise<void> => {
    try {
      validateEmail(email);
      const sanitizedEmail = InputSanitizer.sanitizeEmail(email);
      
      await sendPasswordResetEmail(auth, sanitizedEmail);
      await AuditLogger.log('password_reset_requested', 'unknown', { email: sanitizedEmail });
    } catch (error: any) {
      await AuditLogger.log('password_reset_failed', 'unknown', { email, error: error.message });
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!currentUser || !userProfile) {
      throw new Error('No authenticated user');
    }

    try {
      const sanitizedUpdates = {
        ...updates,
        displayName: updates.displayName ? InputSanitizer.sanitizeString(updates.displayName) : undefined
      };

      await updateDoc(doc(db, 'users', currentUser.uid), {
        ...sanitizedUpdates,
        updatedAt: new Date()
      });

      setUserProfile(prev => prev ? { ...prev, ...sanitizedUpdates } : null);
      
      await AuditLogger.log('profile_updated', currentUser.uid, { updates: Object.keys(sanitizedUpdates) });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  // Change password
  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    if (!currentUser) {
      throw new Error('No authenticated user');
    }

    try {
      validatePassword(newPassword);
      
      const credential = EmailAuthProvider.credential(currentUser.email!, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);
      
      await AuditLogger.log('password_changed', currentUser.uid);
    } catch (error: any) {
      await AuditLogger.log('password_change_failed', currentUser.uid, { error: error.message });
      throw error;
    }
  };

  // Role and permission checking
  const hasRole = (role: string): boolean => {
    return userProfile?.role === role;
  };

  const hasPermission = (permission: string): boolean => {
    if (!userProfile) return false;
    
    // Simple permission mapping - in production, use more sophisticated RBAC
    const rolePermissions = {
      customer: ['read:products', 'write:orders'],
      manager: ['read:products', 'write:products', 'read:orders', 'write:orders', 'manage:inventory'],
      admin: ['*'] // Admin has all permissions
    };
    
    const permissions = rolePermissions[userProfile.role] || [];
    return permissions.includes('*') || permissions.includes(permission);
  };

  // Business account utilities
  const isBusinessAccount = (): boolean => {
    return userProfile?.accountType === 'business';
  };

  const switchAccountType = async (accountType: 'consumer' | 'business'): Promise<void> => {
    if (!currentUser || !userProfile) {
      throw new Error('No authenticated user');
    }

    try {
      const updates: Partial<UserProfile> = {
        accountType,
        updatedAt: new Date()
      };

      // If switching to business but no business profile exists, create a basic one
      if (accountType === 'business' && !userProfile.businessProfile) {
        updates.businessProfile = {
          companyName: '',
          businessType: 'other',
          taxId: '',
          businessAddress: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'US'
          },
          contactPerson: {
            name: userProfile.displayName,
            title: '',
            email: userProfile.email,
            phone: userProfile.phone || ''
          },
          paymentTerms: {
            type: 'immediate',
            days: 0,
            creditLimit: 0,
            currentBalance: 0,
            paymentHistory: []
          },
          volumeDiscounts: [],
          taxExemption: {
            isExempt: false,
            exemptionNumber: '',
            exemptionType: 'none',
            validUntil: null,
            exemptStates: [],
            documentUrl: ''
          },
          businessSupport: {
            accountManager: '',
            supportTier: 'standard',
            contactMethods: ['email'],
            businessHours: '9AM-5PM EST',
            emergencyContact: ''
          },
          isVerified: false,
          verificationDocuments: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }

      await updateDoc(doc(db, 'users', currentUser.uid), updates);
      setUserProfile(prev => prev ? { ...prev, ...updates } : null);
      
      await AuditLogger.log('account_type_switched', currentUser.uid, { 
        from: userProfile.accountType, 
        to: accountType 
      });
    } catch (error) {
      console.error('Error switching account type:', error);
      throw error;
    }
  };

  // Auth state listener
  useEffect(() => {
    if (!auth) {
      // Development fallback - check for mock user in localStorage
      const mockUser = localStorage.getItem('currentMockUser');
      const mockProfile = localStorage.getItem('mockUserProfile');
      
      if (mockUser) {
        try {
          const parsedUser = JSON.parse(mockUser);
          const parsedProfile = mockProfile ? JSON.parse(mockProfile) : null;
          
          setCurrentUser(parsedUser);
          setUserProfile(parsedProfile);
          console.log('Mock user restored from localStorage (development mode)');
        } catch (error) {
          console.error('Error parsing mock user data:', error);
          localStorage.removeItem('currentMockUser');
          localStorage.removeItem('mockUserProfile');
        }
      }
      
      setLoading(false);
      return;
    }
    
    // Production Firebase auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        const profile = await loadUserProfile(user);
        setUserProfile(profile);
        
        if (profile) {
          SessionManager.createSession(user.uid, profile.role);
        }
      } else {
        setUserProfile(null);
        SessionManager.clearSession();
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Session validation
  useEffect(() => {
    const validateSession = () => {
      if (currentUser && !SessionManager.isValidSession()) {
        logout();
      }
    };

    const interval = setInterval(validateSession, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [currentUser]);

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    login,
    register,
    registerBusiness,
    logout,
    resetPassword,
    updateUserProfile,
    changePassword,
    hasRole,
    hasPermission,
    isBusinessAccount,
    switchAccountType
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};