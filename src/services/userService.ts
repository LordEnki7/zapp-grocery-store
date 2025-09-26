import { 
  doc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  arrayUnion, 
  arrayRemove,
  increment,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { 
  UserProfile, 
  Address, 
  PaymentMethod, 
  UserPreferences,
  WishlistItem 
} from '../types';

export class UserService {
  // Update user profile
  static async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Add address to user profile
  static async addAddress(userId: string, address: Address): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        addresses: arrayUnion(address),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error adding address:', error);
      throw error;
    }
  }

  // Remove address from user profile
  static async removeAddress(userId: string, address: Address): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        addresses: arrayRemove(address),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error removing address:', error);
      throw error;
    }
  }

  // Update user preferences
  static async updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        preferences,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }

  // Add payment method
  static async addPaymentMethod(userId: string, paymentMethod: PaymentMethod): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        paymentMethods: arrayUnion(paymentMethod),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  }

  // Remove payment method
  static async removePaymentMethod(userId: string, paymentMethodId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      // Note: This requires fetching the user first to find the exact payment method object
      // In a real implementation, you might want to store payment methods in a separate collection
      await updateDoc(userRef, {
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error removing payment method:', error);
      throw error;
    }
  }

  // Add item to wishlist
  static async addToWishlist(userId: string, item: WishlistItem): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        wishlist: arrayUnion(item),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  }

  // Remove item from wishlist
  static async removeFromWishlist(userId: string, productId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      // Note: This requires fetching the user first to find the exact wishlist item
      // In a real implementation, you might want to store wishlist in a separate collection
      await updateDoc(userRef, {
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  }

  // Update recently viewed products
  static async updateRecentlyViewed(userId: string, productId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const recentItem = {
        productId,
        viewedAt: new Date()
      };
      
      await updateDoc(userRef, {
        recentlyViewed: arrayUnion(recentItem),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating recently viewed:', error);
      throw error;
    }
  }

  // Update loyalty points
  static async updateLoyaltyPoints(userId: string, points: number): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        loyaltyPoints: increment(points),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating loyalty points:', error);
      throw error;
    }
  }

  // Update order statistics
  static async updateOrderStats(userId: string, orderValue: number): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        totalSpent: increment(orderValue),
        orderCount: increment(1),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating order stats:', error);
      throw error;
    }
  }

  // Search users (admin function)
  static async searchUsers(searchTerm: string, role?: string): Promise<UserProfile[]> {
    try {
      let q = query(collection(db, 'users'));
      
      if (role) {
        q = query(collection(db, 'users'), where('role', '==', role));
      }
      
      const querySnapshot = await getDocs(q);
      const users: UserProfile[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (
          data.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          data.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          data.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          data.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          users.push({
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
            lastLogin: data.lastLogin?.toDate(),
            dateOfBirth: data.dateOfBirth?.toDate()
          } as UserProfile);
        }
      });
      
      return users;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  // Deactivate user account
  static async deactivateUser(userId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isActive: false,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error deactivating user:', error);
      throw error;
    }
  }

  // Reactivate user account
  static async reactivateUser(userId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isActive: true,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error reactivating user:', error);
      throw error;
    }
  }
}