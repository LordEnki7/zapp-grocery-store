import { db, storage } from '../config/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  increment,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { InputSanitizer } from '../utils/security';

export interface ReviewImage {
  id: string;
  url: string;
  filename: string;
  uploadedAt: Date;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  content: string;
  images: ReviewImage[];
  verified: boolean;
  helpful: number;
  notHelpful: number;
  helpfulVotes: string[]; // User IDs who voted helpful
  notHelpfulVotes: string[]; // User IDs who voted not helpful
  flagged: boolean;
  flagReasons: string[];
  moderationStatus: 'pending' | 'approved' | 'rejected';
  moderatorNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  orderNumber?: string; // For verified purchases
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  verifiedReviews: number;
  recentReviews: number; // Reviews in last 30 days
}

export interface ReviewFilters {
  rating?: number[];
  verified?: boolean;
  hasImages?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  sortBy?: 'newest' | 'oldest' | 'highest-rated' | 'lowest-rated' | 'most-helpful';
}

class ReviewService {
  private reviewsCollection = collection(db, 'reviews');
  private productsCollection = collection(db, 'products');

  // Create a new review
  async createReview(
    productId: string,
    userId: string,
    userName: string,
    reviewData: {
      rating: number;
      title: string;
      content: string;
      images?: File[];
      orderNumber?: string;
    },
    userAvatar?: string
  ): Promise<string> {
    try {
      // Validate rating
      if (reviewData.rating < 1 || reviewData.rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      // Check if user already reviewed this product
      const existingReview = await this.getUserReviewForProduct(userId, productId);
      if (existingReview) {
        throw new Error('You have already reviewed this product');
      }

      // Upload images if provided
      const uploadedImages: ReviewImage[] = [];
      if (reviewData.images && reviewData.images.length > 0) {
        for (const image of reviewData.images) {
          const imageData = await this.uploadReviewImage(image, userId, productId);
          uploadedImages.push(imageData);
        }
      }

      // Check if this is a verified purchase
      const verified = reviewData.orderNumber ? await this.verifyPurchase(userId, productId, reviewData.orderNumber) : false;

      const review: Omit<Review, 'id'> = {
        productId,
        userId,
        userName: InputSanitizer.sanitizeText(userName),
        userAvatar,
        rating: reviewData.rating,
        title: InputSanitizer.sanitizeText(reviewData.title),
        content: InputSanitizer.sanitizeText(reviewData.content),
        images: uploadedImages,
        verified,
        helpful: 0,
        notHelpful: 0,
        helpfulVotes: [],
        notHelpfulVotes: [],
        flagged: false,
        flagReasons: [],
        moderationStatus: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        orderNumber: reviewData.orderNumber
      };

      const docRef = await addDoc(this.reviewsCollection, {
        ...review,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      // Update product rating statistics
      await this.updateProductRatingStats(productId);

      return docRef.id;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  // Upload review image
  private async uploadReviewImage(file: File, userId: string, productId: string): Promise<ReviewImage> {
    try {
      const filename = `${Date.now()}-${file.name}`;
      const imagePath = `reviews/${productId}/${userId}/${filename}`;
      const imageRef = ref(storage, imagePath);

      await uploadBytes(imageRef, file);
      const url = await getDownloadURL(imageRef);

      return {
        id: crypto.randomUUID(),
        url,
        filename,
        uploadedAt: new Date()
      };
    } catch (error) {
      console.error('Error uploading review image:', error);
      throw new Error('Failed to upload image');
    }
  }

  // Verify purchase for verified reviews
  private async verifyPurchase(userId: string, productId: string, orderNumber: string): Promise<boolean> {
    try {
      // This would check against the orders collection
      // For now, we'll return true if orderNumber is provided
      return !!orderNumber;
    } catch (error) {
      console.error('Error verifying purchase:', error);
      return false;
    }
  }

  // Get reviews for a product
  async getProductReviews(
    productId: string,
    filters?: ReviewFilters,
    pageSize: number = 10,
    lastReviewId?: string
  ): Promise<{ reviews: Review[]; hasMore: boolean }> {
    try {
      let q = query(
        this.reviewsCollection,
        where('productId', '==', productId),
        where('moderationStatus', '==', 'approved')
      );

      // Apply sorting
      const sortBy = filters?.sortBy || 'newest';
      switch (sortBy) {
        case 'newest':
          q = query(q, orderBy('createdAt', 'desc'));
          break;
        case 'oldest':
          q = query(q, orderBy('createdAt', 'asc'));
          break;
        case 'highest-rated':
          q = query(q, orderBy('rating', 'desc'), orderBy('createdAt', 'desc'));
          break;
        case 'lowest-rated':
          q = query(q, orderBy('rating', 'asc'), orderBy('createdAt', 'desc'));
          break;
        case 'most-helpful':
          q = query(q, orderBy('helpful', 'desc'), orderBy('createdAt', 'desc'));
          break;
      }

      q = query(q, limit(pageSize + 1));

      if (lastReviewId) {
        const lastReviewDoc = await getDoc(doc(this.reviewsCollection, lastReviewId));
        if (lastReviewDoc.exists()) {
          q = query(q, startAfter(lastReviewDoc));
        }
      }

      const snapshot = await getDocs(q);
      const reviews: Review[] = [];

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        reviews.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          images: data.images?.map((img: any) => ({
            ...img,
            uploadedAt: img.uploadedAt?.toDate() || new Date()
          })) || []
        } as Review);
      });

      const hasMore = reviews.length > pageSize;
      if (hasMore) {
        reviews.pop();
      }

      // Apply client-side filters
      let filteredReviews = reviews;

      if (filters?.rating && filters.rating.length > 0) {
        filteredReviews = filteredReviews.filter(review => 
          filters.rating!.includes(review.rating)
        );
      }

      if (filters?.verified !== undefined) {
        filteredReviews = filteredReviews.filter(review => 
          review.verified === filters.verified
        );
      }

      if (filters?.hasImages !== undefined) {
        filteredReviews = filteredReviews.filter(review => 
          filters.hasImages ? review.images.length > 0 : review.images.length === 0
        );
      }

      if (filters?.dateRange) {
        filteredReviews = filteredReviews.filter(review =>
          review.createdAt >= filters.dateRange!.start &&
          review.createdAt <= filters.dateRange!.end
        );
      }

      return { reviews: filteredReviews, hasMore };
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      throw new Error('Failed to fetch reviews');
    }
  }

  // Get review statistics for a product
  async getProductReviewStats(productId: string): Promise<ReviewStats> {
    try {
      const q = query(
        this.reviewsCollection,
        where('productId', '==', productId),
        where('moderationStatus', '==', 'approved')
      );

      const snapshot = await getDocs(q);
      const reviews: Review[] = [];

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        reviews.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as Review);
      });

      const totalReviews = reviews.length;
      const averageRating = totalReviews > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
        : 0;

      const ratingDistribution = {
        1: reviews.filter(r => r.rating === 1).length,
        2: reviews.filter(r => r.rating === 2).length,
        3: reviews.filter(r => r.rating === 3).length,
        4: reviews.filter(r => r.rating === 4).length,
        5: reviews.filter(r => r.rating === 5).length
      };

      const verifiedReviews = reviews.filter(r => r.verified).length;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentReviews = reviews.filter(r => r.createdAt >= thirtyDaysAgo).length;

      return {
        totalReviews,
        averageRating,
        ratingDistribution,
        verifiedReviews,
        recentReviews
      };
    } catch (error) {
      console.error('Error fetching review stats:', error);
      throw new Error('Failed to fetch review statistics');
    }
  }

  // Update product rating statistics
  private async updateProductRatingStats(productId: string): Promise<void> {
    try {
      const stats = await this.getProductReviewStats(productId);
      const productRef = doc(this.productsCollection, productId);

      await updateDoc(productRef, {
        averageRating: stats.averageRating,
        reviewCount: stats.totalReviews,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating product rating stats:', error);
    }
  }

  // Vote on review helpfulness
  async voteOnReview(reviewId: string, userId: string, helpful: boolean): Promise<void> {
    try {
      const reviewRef = doc(this.reviewsCollection, reviewId);
      const reviewDoc = await getDoc(reviewRef);

      if (!reviewDoc.exists()) {
        throw new Error('Review not found');
      }

      const reviewData = reviewDoc.data() as Review;
      const helpfulVotes = reviewData.helpfulVotes || [];
      const notHelpfulVotes = reviewData.notHelpfulVotes || [];

      // Remove user from both arrays first
      const newHelpfulVotes = helpfulVotes.filter(id => id !== userId);
      const newNotHelpfulVotes = notHelpfulVotes.filter(id => id !== userId);

      // Add user to appropriate array
      if (helpful) {
        newHelpfulVotes.push(userId);
      } else {
        newNotHelpfulVotes.push(userId);
      }

      await updateDoc(reviewRef, {
        helpful: newHelpfulVotes.length,
        notHelpful: newNotHelpfulVotes.length,
        helpfulVotes: newHelpfulVotes,
        notHelpfulVotes: newNotHelpfulVotes,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error voting on review:', error);
      throw new Error('Failed to vote on review');
    }
  }

  // Flag review for moderation
  async flagReview(reviewId: string, userId: string, reason: string): Promise<void> {
    try {
      const reviewRef = doc(this.reviewsCollection, reviewId);
      const reviewDoc = await getDoc(reviewRef);

      if (!reviewDoc.exists()) {
        throw new Error('Review not found');
      }

      const reviewData = reviewDoc.data() as Review;
      const flagReasons = reviewData.flagReasons || [];

      if (!flagReasons.includes(reason)) {
        flagReasons.push(reason);
      }

      await updateDoc(reviewRef, {
        flagged: true,
        flagReasons,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error flagging review:', error);
      throw new Error('Failed to flag review');
    }
  }

  // Get user's review for a product
  async getUserReviewForProduct(userId: string, productId: string): Promise<Review | null> {
    try {
      const q = query(
        this.reviewsCollection,
        where('userId', '==', userId),
        where('productId', '==', productId),
        limit(1)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      const data = doc.data();

      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        images: data.images?.map((img: any) => ({
          ...img,
          uploadedAt: img.uploadedAt?.toDate() || new Date()
        })) || []
      } as Review;
    } catch (error) {
      console.error('Error fetching user review:', error);
      return null;
    }
  }

  // Update review
  async updateReview(
    reviewId: string,
    userId: string,
    updates: {
      rating?: number;
      title?: string;
      content?: string;
      images?: File[];
    }
  ): Promise<void> {
    try {
      const reviewRef = doc(this.reviewsCollection, reviewId);
      const reviewDoc = await getDoc(reviewRef);

      if (!reviewDoc.exists()) {
        throw new Error('Review not found');
      }

      const reviewData = reviewDoc.data() as Review;
      if (reviewData.userId !== userId) {
        throw new Error('Unauthorized to update this review');
      }

      const updateData: any = {
        updatedAt: Timestamp.now(),
        moderationStatus: 'pending' // Reset moderation status on update
      };

      if (updates.rating !== undefined) {
        if (updates.rating < 1 || updates.rating > 5) {
          throw new Error('Rating must be between 1 and 5');
        }
        updateData.rating = updates.rating;
      }

      if (updates.title !== undefined) {
        updateData.title = InputSanitizer.sanitizeText(updates.title);
      }

      if (updates.content !== undefined) {
        updateData.content = InputSanitizer.sanitizeText(updates.content);
      }

      if (updates.images) {
        // Delete old images
        for (const oldImage of reviewData.images) {
          try {
            const imageRef = ref(storage, `reviews/${reviewData.productId}/${userId}/${oldImage.filename}`);
            await deleteObject(imageRef);
          } catch (error) {
            console.warn('Failed to delete old image:', error);
          }
        }

        // Upload new images
        const uploadedImages: ReviewImage[] = [];
        for (const image of updates.images) {
          const imageData = await this.uploadReviewImage(image, userId, reviewData.productId);
          uploadedImages.push(imageData);
        }
        updateData.images = uploadedImages;
      }

      await updateDoc(reviewRef, updateData);

      // Update product rating statistics
      await this.updateProductRatingStats(reviewData.productId);
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  }

  // Delete review
  async deleteReview(reviewId: string, userId: string): Promise<void> {
    try {
      const reviewRef = doc(this.reviewsCollection, reviewId);
      const reviewDoc = await getDoc(reviewRef);

      if (!reviewDoc.exists()) {
        throw new Error('Review not found');
      }

      const reviewData = reviewDoc.data() as Review;
      if (reviewData.userId !== userId) {
        throw new Error('Unauthorized to delete this review');
      }

      // Delete review images
      for (const image of reviewData.images) {
        try {
          const imageRef = ref(storage, `reviews/${reviewData.productId}/${userId}/${image.filename}`);
          await deleteObject(imageRef);
        } catch (error) {
          console.warn('Failed to delete review image:', error);
        }
      }

      await deleteDoc(reviewRef);

      // Update product rating statistics
      await this.updateProductRatingStats(reviewData.productId);
    } catch (error) {
      console.error('Error deleting review:', error);
      throw new Error('Failed to delete review');
    }
  }

  // Get user's reviews
  async getUserReviews(userId: string, limit: number = 10): Promise<Review[]> {
    try {
      const q = query(
        this.reviewsCollection,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limit)
      );

      const snapshot = await getDocs(q);
      const reviews: Review[] = [];

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        reviews.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          images: data.images?.map((img: any) => ({
            ...img,
            uploadedAt: img.uploadedAt?.toDate() || new Date()
          })) || []
        } as Review);
      });

      return reviews;
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      throw new Error('Failed to fetch user reviews');
    }
  }

  // Admin: Moderate review
  async moderateReview(
    reviewId: string,
    status: 'approved' | 'rejected',
    moderatorNotes?: string
  ): Promise<void> {
    try {
      const reviewRef = doc(this.reviewsCollection, reviewId);
      await updateDoc(reviewRef, {
        moderationStatus: status,
        moderatorNotes,
        updatedAt: Timestamp.now()
      });

      // Update product stats if approved
      if (status === 'approved') {
        const reviewDoc = await getDoc(reviewRef);
        if (reviewDoc.exists()) {
          const reviewData = reviewDoc.data() as Review;
          await this.updateProductRatingStats(reviewData.productId);
        }
      }
    } catch (error) {
      console.error('Error moderating review:', error);
      throw new Error('Failed to moderate review');
    }
  }

  // Get reviews pending moderation
  async getPendingReviews(limit: number = 20): Promise<Review[]> {
    try {
      const q = query(
        this.reviewsCollection,
        where('moderationStatus', '==', 'pending'),
        orderBy('createdAt', 'asc'),
        limit(limit)
      );

      const snapshot = await getDocs(q);
      const reviews: Review[] = [];

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        reviews.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          images: data.images?.map((img: any) => ({
            ...img,
            uploadedAt: img.uploadedAt?.toDate() || new Date()
          })) || []
        } as Review);
      });

      return reviews;
    } catch (error) {
      console.error('Error fetching pending reviews:', error);
      throw new Error('Failed to fetch pending reviews');
    }
  }
}

export const reviewService = new ReviewService();
export default reviewService;