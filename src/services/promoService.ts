import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  increment
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Interfaces
export interface PromoCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number; // percentage (0-100) or fixed amount
  description: string;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  userLimit?: number; // max uses per user
  validFrom: Timestamp;
  validUntil: Timestamp;
  isActive: boolean;
  applicableCategories?: string[];
  applicableProducts?: string[];
  excludedCategories?: string[];
  excludedProducts?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PromoUsage {
  id: string;
  promoCodeId: string;
  userId: string;
  orderId: string;
  discountAmount: number;
  usedAt: Timestamp;
}

export interface LoyaltyProgram {
  id: string;
  name: string;
  description: string;
  pointsPerDollar: number;
  isActive: boolean;
  tiers: LoyaltyTier[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface LoyaltyTier {
  name: string;
  minPoints: number;
  benefits: {
    discountPercentage?: number;
    freeShipping?: boolean;
    earlyAccess?: boolean;
    birthdayBonus?: number;
    pointsMultiplier?: number;
  };
}

export interface UserLoyalty {
  id: string;
  userId: string;
  totalPoints: number;
  availablePoints: number;
  currentTier: string;
  lifetimeSpent: number;
  joinedAt: Timestamp;
  lastActivity: Timestamp;
}

export interface PointsTransaction {
  id: string;
  userId: string;
  type: 'earned' | 'redeemed' | 'expired' | 'bonus';
  points: number;
  description: string;
  orderId?: string;
  promoId?: string;
  createdAt: Timestamp;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  type: 'email' | 'banner' | 'popup' | 'notification';
  targetAudience: {
    userSegment?: 'all' | 'new' | 'returning' | 'vip';
    minOrderValue?: number;
    categories?: string[];
    loyaltyTier?: string;
  };
  content: {
    title: string;
    message: string;
    imageUrl?: string;
    ctaText?: string;
    ctaUrl?: string;
    promoCode?: string;
  };
  schedule: {
    startDate: Timestamp;
    endDate: Timestamp;
    frequency?: 'once' | 'daily' | 'weekly' | 'monthly';
  };
  metrics: {
    sent: number;
    opened: number;
    clicked: number;
    converted: number;
  };
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

class PromoService {
  private readonly promoCodesCollection = 'promoCodes';
  private readonly promoUsageCollection = 'promoUsage';
  private readonly loyaltyProgramCollection = 'loyaltyPrograms';
  private readonly userLoyaltyCollection = 'userLoyalty';
  private readonly pointsTransactionsCollection = 'pointsTransactions';
  private readonly campaignsCollection = 'campaigns';

  // Promo Codes
  async createPromoCode(promoData: Omit<PromoCode, 'id' | 'usedCount' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.promoCodesCollection), {
        ...promoData,
        code: promoData.code.toUpperCase(),
        usedCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating promo code:', error);
      throw new Error('Failed to create promo code');
    }
  }

  async getPromoCode(code: string): Promise<PromoCode | null> {
    try {
      const q = query(
        collection(db, this.promoCodesCollection),
        where('code', '==', code.toUpperCase()),
        where('isActive', '==', true)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as PromoCode;
    } catch (error) {
      console.error('Error getting promo code:', error);
      throw new Error('Failed to get promo code');
    }
  }

  async validatePromoCode(
    code: string, 
    userId: string, 
    orderAmount: number, 
    cartItems: any[]
  ): Promise<{ valid: boolean; discount: number; message: string }> {
    try {
      const promoCode = await this.getPromoCode(code);
      
      if (!promoCode) {
        return { valid: false, discount: 0, message: 'Invalid promo code' };
      }

      const now = Timestamp.now();
      
      // Check validity period
      if (now.toMillis() < promoCode.validFrom.toMillis() || now.toMillis() > promoCode.validUntil.toMillis()) {
        return { valid: false, discount: 0, message: 'Promo code has expired' };
      }

      // Check usage limit
      if (promoCode.usageLimit && promoCode.usedCount >= promoCode.usageLimit) {
        return { valid: false, discount: 0, message: 'Promo code usage limit reached' };
      }

      // Check user usage limit
      if (promoCode.userLimit) {
        const userUsage = await this.getUserPromoUsage(userId, promoCode.id);
        if (userUsage >= promoCode.userLimit) {
          return { valid: false, discount: 0, message: 'You have reached the usage limit for this promo code' };
        }
      }

      // Check minimum order amount
      if (promoCode.minOrderAmount && orderAmount < promoCode.minOrderAmount) {
        return { 
          valid: false, 
          discount: 0, 
          message: `Minimum order amount of $${promoCode.minOrderAmount} required` 
        };
      }

      // Check applicable products/categories
      if (promoCode.applicableProducts?.length || promoCode.applicableCategories?.length) {
        const hasApplicableItems = cartItems.some(item => 
          promoCode.applicableProducts?.includes(item.productId) ||
          promoCode.applicableCategories?.includes(item.category)
        );
        
        if (!hasApplicableItems) {
          return { valid: false, discount: 0, message: 'Promo code not applicable to items in cart' };
        }
      }

      // Check excluded products/categories
      if (promoCode.excludedProducts?.length || promoCode.excludedCategories?.length) {
        const hasExcludedItems = cartItems.some(item => 
          promoCode.excludedProducts?.includes(item.productId) ||
          promoCode.excludedCategories?.includes(item.category)
        );
        
        if (hasExcludedItems) {
          return { valid: false, discount: 0, message: 'Promo code cannot be applied to some items in cart' };
        }
      }

      // Calculate discount
      let discount = 0;
      switch (promoCode.type) {
        case 'percentage':
          discount = (orderAmount * promoCode.value) / 100;
          if (promoCode.maxDiscount) {
            discount = Math.min(discount, promoCode.maxDiscount);
          }
          break;
        case 'fixed':
          discount = Math.min(promoCode.value, orderAmount);
          break;
        case 'free_shipping':
          discount = 0; // Handled separately in shipping calculation
          break;
      }

      return { 
        valid: true, 
        discount: Math.round(discount * 100) / 100, 
        message: 'Promo code applied successfully' 
      };
    } catch (error) {
      console.error('Error validating promo code:', error);
      return { valid: false, discount: 0, message: 'Error validating promo code' };
    }
  }

  async applyPromoCode(promoCodeId: string, userId: string, orderId: string, discountAmount: number): Promise<void> {
    try {
      // Record usage
      await addDoc(collection(db, this.promoUsageCollection), {
        promoCodeId,
        userId,
        orderId,
        discountAmount,
        usedAt: Timestamp.now()
      });

      // Update usage count
      const promoRef = doc(db, this.promoCodesCollection, promoCodeId);
      await updateDoc(promoRef, {
        usedCount: increment(1),
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error applying promo code:', error);
      throw new Error('Failed to apply promo code');
    }
  }

  async getUserPromoUsage(userId: string, promoCodeId: string): Promise<number> {
    try {
      const q = query(
        collection(db, this.promoUsageCollection),
        where('userId', '==', userId),
        where('promoCodeId', '==', promoCodeId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      console.error('Error getting user promo usage:', error);
      return 0;
    }
  }

  // Loyalty Program
  async createLoyaltyProgram(programData: Omit<LoyaltyProgram, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.loyaltyProgramCollection), {
        ...programData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating loyalty program:', error);
      throw new Error('Failed to create loyalty program');
    }
  }

  async getUserLoyalty(userId: string): Promise<UserLoyalty | null> {
    try {
      const q = query(
        collection(db, this.userLoyaltyCollection),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as UserLoyalty;
    } catch (error) {
      console.error('Error getting user loyalty:', error);
      throw new Error('Failed to get user loyalty');
    }
  }

  async addLoyaltyPoints(userId: string, points: number, description: string, orderId?: string): Promise<void> {
    try {
      let userLoyalty = await this.getUserLoyalty(userId);
      
      if (!userLoyalty) {
        // Create new loyalty account
        const docRef = await addDoc(collection(db, this.userLoyaltyCollection), {
          userId,
          totalPoints: points,
          availablePoints: points,
          currentTier: 'Bronze',
          lifetimeSpent: 0,
          joinedAt: Timestamp.now(),
          lastActivity: Timestamp.now()
        });
        userLoyalty = { id: docRef.id, userId, totalPoints: points, availablePoints: points, currentTier: 'Bronze', lifetimeSpent: 0, joinedAt: Timestamp.now(), lastActivity: Timestamp.now() };
      } else {
        // Update existing account
        const loyaltyRef = doc(db, this.userLoyaltyCollection, userLoyalty.id);
        await updateDoc(loyaltyRef, {
          totalPoints: increment(points),
          availablePoints: increment(points),
          lastActivity: Timestamp.now()
        });
      }

      // Record transaction
      await addDoc(collection(db, this.pointsTransactionsCollection), {
        userId,
        type: 'earned',
        points,
        description,
        orderId,
        createdAt: Timestamp.now()
      });

      // Update tier if necessary
      await this.updateUserTier(userId);
    } catch (error) {
      console.error('Error adding loyalty points:', error);
      throw new Error('Failed to add loyalty points');
    }
  }

  async redeemLoyaltyPoints(userId: string, points: number, description: string): Promise<boolean> {
    try {
      const userLoyalty = await this.getUserLoyalty(userId);
      
      if (!userLoyalty || userLoyalty.availablePoints < points) {
        return false;
      }

      // Update available points
      const loyaltyRef = doc(db, this.userLoyaltyCollection, userLoyalty.id);
      await updateDoc(loyaltyRef, {
        availablePoints: increment(-points),
        lastActivity: Timestamp.now()
      });

      // Record transaction
      await addDoc(collection(db, this.pointsTransactionsCollection), {
        userId,
        type: 'redeemed',
        points: -points,
        description,
        createdAt: Timestamp.now()
      });

      return true;
    } catch (error) {
      console.error('Error redeeming loyalty points:', error);
      throw new Error('Failed to redeem loyalty points');
    }
  }

  async updateUserTier(userId: string): Promise<void> {
    try {
      const userLoyalty = await this.getUserLoyalty(userId);
      if (!userLoyalty) return;

      // Get active loyalty program
      const q = query(
        collection(db, this.loyaltyProgramCollection),
        where('isActive', '==', true),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) return;

      const program = querySnapshot.docs[0].data() as LoyaltyProgram;
      
      // Determine new tier
      let newTier = program.tiers[0].name;
      for (const tier of program.tiers.sort((a, b) => b.minPoints - a.minPoints)) {
        if (userLoyalty.totalPoints >= tier.minPoints) {
          newTier = tier.name;
          break;
        }
      }

      // Update tier if changed
      if (newTier !== userLoyalty.currentTier) {
        const loyaltyRef = doc(db, this.userLoyaltyCollection, userLoyalty.id);
        await updateDoc(loyaltyRef, {
          currentTier: newTier,
          lastActivity: Timestamp.now()
        });
      }
    } catch (error) {
      console.error('Error updating user tier:', error);
    }
  }

  // Campaigns
  async createCampaign(campaignData: Omit<Campaign, 'id' | 'metrics' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.campaignsCollection), {
        ...campaignData,
        metrics: {
          sent: 0,
          opened: 0,
          clicked: 0,
          converted: 0
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw new Error('Failed to create campaign');
    }
  }

  async getActiveCampaigns(): Promise<Campaign[]> {
    try {
      const now = Timestamp.now();
      const q = query(
        collection(db, this.campaignsCollection),
        where('isActive', '==', true),
        where('schedule.startDate', '<=', now),
        where('schedule.endDate', '>=', now),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Campaign[];
    } catch (error) {
      console.error('Error getting active campaigns:', error);
      return [];
    }
  }

  async updateCampaignMetrics(campaignId: string, metric: keyof Campaign['metrics']): Promise<void> {
    try {
      const campaignRef = doc(db, this.campaignsCollection, campaignId);
      await updateDoc(campaignRef, {
        [`metrics.${metric}`]: increment(1),
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating campaign metrics:', error);
    }
  }

  // Analytics
  async getPromoCodeStats(promoCodeId: string): Promise<{
    totalUsage: number;
    totalDiscount: number;
    uniqueUsers: number;
    conversionRate: number;
  }> {
    try {
      const q = query(
        collection(db, this.promoUsageCollection),
        where('promoCodeId', '==', promoCodeId)
      );
      const querySnapshot = await getDocs(q);
      
      const usage = querySnapshot.docs.map(doc => doc.data() as PromoUsage);
      const uniqueUsers = new Set(usage.map(u => u.userId)).size;
      const totalDiscount = usage.reduce((sum, u) => sum + u.discountAmount, 0);
      
      return {
        totalUsage: usage.length,
        totalDiscount,
        uniqueUsers,
        conversionRate: 0 // Would need order data to calculate
      };
    } catch (error) {
      console.error('Error getting promo code stats:', error);
      return { totalUsage: 0, totalDiscount: 0, uniqueUsers: 0, conversionRate: 0 };
    }
  }

  async getLoyaltyStats(): Promise<{
    totalMembers: number;
    totalPointsIssued: number;
    totalPointsRedeemed: number;
    tierDistribution: Record<string, number>;
  }> {
    try {
      const loyaltyQuery = await getDocs(collection(db, this.userLoyaltyCollection));
      const members = loyaltyQuery.docs.map(doc => doc.data() as UserLoyalty);
      
      const pointsQuery = await getDocs(collection(db, this.pointsTransactionsCollection));
      const transactions = pointsQuery.docs.map(doc => doc.data() as PointsTransaction);
      
      const totalPointsIssued = transactions
        .filter(t => t.type === 'earned')
        .reduce((sum, t) => sum + t.points, 0);
      
      const totalPointsRedeemed = transactions
        .filter(t => t.type === 'redeemed')
        .reduce((sum, t) => sum + Math.abs(t.points), 0);
      
      const tierDistribution = members.reduce((acc, member) => {
        acc[member.currentTier] = (acc[member.currentTier] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return {
        totalMembers: members.length,
        totalPointsIssued,
        totalPointsRedeemed,
        tierDistribution
      };
    } catch (error) {
      console.error('Error getting loyalty stats:', error);
      return { totalMembers: 0, totalPointsIssued: 0, totalPointsRedeemed: 0, tierDistribution: {} };
    }
  }
}

export const promoService = new PromoService();
export default promoService;