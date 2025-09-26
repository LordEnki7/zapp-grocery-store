import React, { useState, useEffect } from 'react';
import { FaStar, FaCheck, FaCamera, FaChartBar } from 'react-icons/fa';
import { reviewService, ReviewStats } from '../../services/reviewService';

interface ReviewSummaryProps {
  productId: string;
  showDistribution?: boolean;
  compact?: boolean;
  onWriteReview?: () => void;
}

const ReviewSummary: React.FC<ReviewSummaryProps> = ({
  productId,
  showDistribution = true,
  compact = false,
  onWriteReview
}) => {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const reviewStats = await reviewService.getProductReviewStats(productId);
        setStats(reviewStats);
        setError(null);
      } catch (err) {
        console.error('Error loading review stats:', err);
        setError('Failed to load review statistics');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [productId]);

  const renderStars = (rating: number, size = 'text-lg') => {
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
    if (!stats || !showDistribution) return null;

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution];
          const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

          return (
            <div key={rating} className="flex items-center space-x-2 text-sm">
              <span className="w-4 text-right">{rating}</span>
              <FaStar className="text-yellow-400 text-xs" />
              <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-0">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-right text-gray-600">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const getRecommendationText = (rating: number): string => {
    if (rating >= 4.5) return 'Highly Recommended';
    if (rating >= 4.0) return 'Recommended';
    if (rating >= 3.5) return 'Good Choice';
    if (rating >= 3.0) return 'Average';
    if (rating >= 2.0) return 'Below Average';
    return 'Not Recommended';
  };

  const getRecommendationColor = (rating: number): string => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-green-500';
    if (rating >= 3.5) return 'text-yellow-600';
    if (rating >= 3.0) return 'text-yellow-500';
    if (rating >= 2.0) return 'text-orange-500';
    return 'text-red-500';
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-4 animate-pulse ${compact ? 'space-y-2' : 'space-y-4'}`}>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-8 bg-gray-300 rounded"></div>
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-gray-300 rounded"></div>
            ))}
          </div>
          <div className="w-20 h-4 bg-gray-300 rounded"></div>
        </div>
        {!compact && (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <div className="flex-1 h-2 bg-gray-300 rounded"></div>
                <div className="w-8 h-4 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1">
          {renderStars(Math.round(stats.averageRating), 'text-sm')}
          <span className="text-sm font-medium text-gray-900 ml-1">
            {stats.averageRating.toFixed(1)}
          </span>
        </div>
        <span className="text-sm text-gray-600">
          ({stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''})
        </span>
        {stats.verifiedReviews > 0 && (
          <span className="inline-flex items-center text-xs text-green-600">
            <FaCheck className="mr-1" />
            {stats.verifiedReviews} verified
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Reviews</h3>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.averageRating.toFixed(1)}
              </div>
              {renderStars(Math.round(stats.averageRating), 'text-xl')}
              <div className="text-sm text-gray-600 mt-1">
                {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        {onWriteReview && (
          <button
            onClick={onWriteReview}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Write Review
          </button>
        )}
      </div>

      {/* Rating Distribution */}
      {showDistribution && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Rating Breakdown</h4>
          {renderRatingDistribution()}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-semibold text-gray-900">
            {((stats.verifiedReviews / Math.max(stats.totalReviews, 1)) * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-gray-600 flex items-center justify-center mt-1">
            <FaCheck className="mr-1" />
            Verified
          </div>
        </div>

        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-semibold text-gray-900">
            {stats.recentReviews}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Recent (30d)
          </div>
        </div>

        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-semibold text-gray-900">
            {stats.ratingDistribution[5] + stats.ratingDistribution[4]}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            4+ Stars
          </div>
        </div>

        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className={`text-lg font-semibold ${getRecommendationColor(stats.averageRating)}`}>
            {getRecommendationText(stats.averageRating)}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Overall
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      {stats.totalReviews > 0 && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Insights</h4>
          <div className="space-y-2 text-sm text-gray-600">
            {stats.verifiedReviews > 0 && (
              <div className="flex items-center">
                <FaCheck className="text-green-500 mr-2" />
                <span>
                  {stats.verifiedReviews} verified purchase{stats.verifiedReviews !== 1 ? 's' : ''}
                </span>
              </div>
            )}
            
            {stats.recentReviews > 0 && (
              <div className="flex items-center">
                <FaChartBar className="text-blue-500 mr-2" />
                <span>
                  {stats.recentReviews} review{stats.recentReviews !== 1 ? 's' : ''} in the last 30 days
                </span>
              </div>
            )}

            {stats.averageRating >= 4.0 && (
              <div className="flex items-center">
                <FaStar className="text-yellow-400 mr-2" />
                <span>
                  {((stats.ratingDistribution[5] + stats.ratingDistribution[4]) / stats.totalReviews * 100).toFixed(0)}% of customers rate this 4+ stars
                </span>
              </div>
            )}

            {stats.totalReviews >= 10 && stats.averageRating >= 4.5 && (
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-green-600 font-medium">
                  Highly rated by customers
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* No Reviews State */}
      {stats.totalReviews === 0 && (
        <div className="text-center py-8">
          <FaStar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h4>
          <p className="text-gray-600 mb-4">Be the first to share your experience!</p>
          {onWriteReview && (
            <button
              onClick={onWriteReview}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Write the First Review
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewSummary;