import React, { useState, useEffect } from 'react';
import {
  FaStar,
  FaThumbsUp,
  FaThumbsDown,
  FaFlag,
  FaCamera,
  FaFilter,
  FaSort,
  FaCheck,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { reviewService, Review, ReviewFilters, ReviewStats } from '../../services/reviewService';
import Button from '../common/Button';

interface ReviewListProps {
  productId: string;
  showFilters?: boolean;
  maxReviews?: number;
}

const ReviewList: React.FC<ReviewListProps> = ({
  productId,
  showFilters = true,
  maxReviews
}) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ReviewFilters>({
    sortBy: 'newest'
  });

  const loadReviews = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setReviews([]);
      } else {
        setLoadingMore(true);
      }

      const lastReviewId = reset ? undefined : reviews[reviews.length - 1]?.id;
      const pageSize = maxReviews || 10;

      const { reviews: newReviews, hasMore: moreAvailable } = await reviewService.getProductReviews(
        productId,
        filters,
        pageSize,
        lastReviewId
      );

      if (reset) {
        setReviews(newReviews);
      } else {
        setReviews(prev => [...prev, ...newReviews]);
      }

      setHasMore(moreAvailable && (!maxReviews || reviews.length + newReviews.length < maxReviews));
    } catch (err) {
      console.error('Error loading reviews:', err);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadStats = async () => {
    try {
      const reviewStats = await reviewService.getProductReviewStats(productId);
      setStats(reviewStats);
    } catch (err) {
      console.error('Error loading review stats:', err);
    }
  };

  useEffect(() => {
    loadReviews(true);
    loadStats();
  }, [productId, filters]);

  const handleVote = async (reviewId: string, helpful: boolean) => {
    if (!user) {
      setError('You must be logged in to vote on reviews');
      return;
    }

    try {
      await reviewService.voteOnReview(reviewId, user.uid, helpful);
      
      // Update the review in the local state
      setReviews(prev => prev.map(review => {
        if (review.id === reviewId) {
          const helpfulVotes = review.helpfulVotes.filter(id => id !== user.uid);
          const notHelpfulVotes = review.notHelpfulVotes.filter(id => id !== user.uid);

          if (helpful) {
            helpfulVotes.push(user.uid);
          } else {
            notHelpfulVotes.push(user.uid);
          }

          return {
            ...review,
            helpful: helpfulVotes.length,
            notHelpful: notHelpfulVotes.length,
            helpfulVotes,
            notHelpfulVotes
          };
        }
        return review;
      }));
    } catch (err) {
      console.error('Error voting on review:', err);
      setError('Failed to vote on review');
    }
  };

  const handleFlag = async (reviewId: string, reason: string) => {
    if (!user) {
      setError('You must be logged in to flag reviews');
      return;
    }

    try {
      await reviewService.flagReview(reviewId, user.uid, reason);
      setError(null);
      // Show success message or update UI
    } catch (err) {
      console.error('Error flagging review:', err);
      setError('Failed to flag review');
    }
  };

  const toggleReviewExpansion = (reviewId: string) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const renderStars = (rating: number, size = 'text-sm') => {
    return (
      <div className={`flex ${size}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  const renderRatingDistribution = () => {
    if (!stats) return null;

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution];
          const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

          return (
            <div key={rating} className="flex items-center space-x-2 text-sm">
              <span className="w-8">{rating}</span>
              <FaStar className="text-yellow-400" />
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-gray-600">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/3 mb-3"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Review Stats */}
      {stats && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {stats.averageRating.toFixed(1)}
                  </div>
                  {renderStars(Math.round(stats.averageRating), 'text-lg')}
                  <div className="text-sm text-gray-600 mt-1">
                    {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <FaCheck className="text-green-500 mr-1" />
                  {stats.verifiedReviews} verified
                </div>
                <div>
                  {stats.recentReviews} recent
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Rating Distribution</h4>
              {renderRatingDistribution()}
            </div>
          </div>
        </div>
      )}

      {/* Filters and Sorting */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Reviews</h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <FaFilter className="mr-1" />
              Filters
              {showFilters ? <FaChevronUp className="ml-1" /> : <FaChevronDown className="ml-1" />}
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort by
                </label>
                <select
                  value={filters.sortBy || 'newest'}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="highest-rated">Highest Rated</option>
                  <option value="lowest-rated">Lowest Rated</option>
                  <option value="most-helpful">Most Helpful</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating
                </label>
                <select
                  value={filters.rating?.[0] || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    rating: e.target.value ? [parseInt(e.target.value)] : undefined
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={filters.verified === undefined ? '' : filters.verified ? 'verified' : 'all'}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    verified: e.target.value === 'verified' ? true : undefined
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">All Reviews</option>
                  <option value="verified">Verified Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Photos
                </label>
                <select
                  value={filters.hasImages === undefined ? '' : filters.hasImages ? 'with' : 'without'}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    hasImages: e.target.value === 'with' ? true : e.target.value === 'without' ? false : undefined
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">All Reviews</option>
                  <option value="with">With Photos</option>
                  <option value="without">Without Photos</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <FaStar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-600">Be the first to review this product!</p>
          </div>
        ) : (
          reviews.map((review) => {
            const isExpanded = expandedReviews.has(review.id);
            const shouldTruncate = review.content.length > 300;
            const displayContent = shouldTruncate && !isExpanded 
              ? review.content.substring(0, 300) + '...' 
              : review.content;

            return (
              <div key={review.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start space-x-4">
                  {/* User Avatar */}
                  <div className="flex-shrink-0">
                    {review.userAvatar ? (
                      <img
                        src={review.userAvatar}
                        alt={review.userName}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {review.userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">{review.userName}</h4>
                          {review.verified && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              <FaCheck className="mr-1" />
                              Verified
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-600">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Review Title */}
                    <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>

                    {/* Review Content */}
                    <p className="text-gray-700 mb-3 whitespace-pre-wrap">{displayContent}</p>

                    {shouldTruncate && (
                      <button
                        onClick={() => toggleReviewExpansion(review.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-3"
                      >
                        {isExpanded ? 'Show less' : 'Read more'}
                      </button>
                    )}

                    {/* Review Images */}
                    {review.images.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                        {review.images.map((image, index) => (
                          <img
                            key={image.id}
                            src={image.url}
                            alt={`Review image ${index + 1}`}
                            className="w-full h-20 object-cover rounded-md border cursor-pointer hover:opacity-75 transition-opacity"
                            onClick={() => {
                              // Open image in modal or new tab
                              window.open(image.url, '_blank');
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Helpful Votes */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleVote(review.id, true)}
                            disabled={!user}
                            className={`flex items-center space-x-1 text-sm px-2 py-1 rounded transition-colors ${
                              user && review.helpfulVotes.includes(user.uid)
                                ? 'bg-green-100 text-green-700'
                                : 'text-gray-600 hover:text-green-600'
                            }`}
                          >
                            <FaThumbsUp />
                            <span>{review.helpful}</span>
                          </button>

                          <button
                            onClick={() => handleVote(review.id, false)}
                            disabled={!user}
                            className={`flex items-center space-x-1 text-sm px-2 py-1 rounded transition-colors ${
                              user && review.notHelpfulVotes.includes(user.uid)
                                ? 'bg-red-100 text-red-700'
                                : 'text-gray-600 hover:text-red-600'
                            }`}
                          >
                            <FaThumbsDown />
                            <span>{review.notHelpful}</span>
                          </button>
                        </div>

                        {/* Flag Button */}
                        {user && user.uid !== review.userId && (
                          <button
                            onClick={() => handleFlag(review.id, 'inappropriate')}
                            className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-600 px-2 py-1 rounded transition-colors"
                          >
                            <FaFlag />
                            <span>Report</span>
                          </button>
                        )}
                      </div>

                      {/* Helpful Text */}
                      {review.helpful > 0 && (
                        <span className="text-sm text-gray-600">
                          {review.helpful} {review.helpful === 1 ? 'person' : 'people'} found this helpful
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Load More Button */}
      {hasMore && !maxReviews && (
        <div className="text-center">
          <Button
            onClick={() => loadReviews(false)}
            disabled={loadingMore}
            variant="outline"
          >
            {loadingMore ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                Loading...
              </div>
            ) : (
              'Load More Reviews'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReviewList;