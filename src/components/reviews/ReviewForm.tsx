import React, { useState, useRef } from 'react';
import { FaStar, FaCamera, FaTimes, FaUpload, FaCheck } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { reviewService } from '../../services/reviewService';
import Button from '../common/Button';

interface ReviewFormProps {
  productId: string;
  productName: string;
  orderNumber?: string;
  onSubmit?: (reviewId: string) => void;
  onCancel?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  productId,
  productName,
  orderNumber,
  onSubmit,
  onCancel
}) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxImages = 5;
  const maxImageSize = 5 * 1024 * 1024; // 5MB

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (rating === 0) {
      newErrors.rating = 'Please select a rating';
    }

    if (!title.trim()) {
      newErrors.title = 'Please enter a review title';
    } else if (title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters long';
    } else if (title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (!content.trim()) {
      newErrors.content = 'Please enter your review';
    } else if (content.length < 10) {
      newErrors.content = 'Review must be at least 10 characters long';
    } else if (content.length > 2000) {
      newErrors.content = 'Review must be less than 2000 characters';
    }

    if (images.length > maxImages) {
      newErrors.images = `Maximum ${maxImages} images allowed`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles: File[] = [];
    const newPreviews: string[] = [];
    let hasError = false;

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, images: 'Only image files are allowed' }));
        hasError = true;
        continue;
      }

      if (file.size > maxImageSize) {
        setErrors(prev => ({ ...prev, images: 'Images must be less than 5MB' }));
        hasError = true;
        continue;
      }

      if (images.length + validFiles.length >= maxImages) {
        setErrors(prev => ({ ...prev, images: `Maximum ${maxImages} images allowed` }));
        break;
      }

      validFiles.push(file);
      const preview = URL.createObjectURL(file);
      newPreviews.push(preview);
    }

    if (!hasError) {
      setErrors(prev => ({ ...prev, images: '' }));
    }

    setImages(prev => [...prev, ...validFiles]);
    setImagePreviews(prev => [...prev, ...newPreviews]);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setErrors(prev => ({ ...prev, images: '' }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user) {
      setErrors({ general: 'You must be logged in to submit a review' });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const reviewId = await reviewService.createReview(
        productId,
        user.uid,
        user.displayName || user.email || 'Anonymous',
        {
          rating,
          title: title.trim(),
          content: content.trim(),
          images: images.length > 0 ? images : undefined,
          orderNumber
        },
        user.photoURL || undefined
      );

      // Clean up image previews
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview));

      onSubmit?.(reviewId);
    } catch (error) {
      console.error('Error submitting review:', error);
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to submit review'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingText = (rating: number): string => {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Write a Review
        </h3>
        <p className="text-gray-600">
          Share your experience with {productName}
        </p>
        {orderNumber && (
          <div className="mt-2 flex items-center text-sm text-green-600">
            <FaCheck className="mr-1" />
            Verified Purchase
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Overall Rating *
          </label>
          <div className="flex items-center space-x-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`text-2xl transition-colors ${
                    star <= (hoverRating || rating)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  <FaStar />
                </button>
              ))}
            </div>
            {(hoverRating || rating) > 0 && (
              <span className="text-sm text-gray-600 ml-2">
                {getRatingText(hoverRating || rating)}
              </span>
            )}
          </div>
          {errors.rating && (
            <p className="mt-1 text-sm text-red-600">{errors.rating}</p>
          )}
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Review Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your experience"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.title ? 'border-red-300' : 'border-gray-300'
            }`}
            maxLength={100}
          />
          <div className="mt-1 flex justify-between">
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title}</p>
            )}
            <p className="text-sm text-gray-500 ml-auto">
              {title.length}/100
            </p>
          </div>
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Your Review *
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tell others about your experience with this product..."
            rows={5}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical ${
              errors.content ? 'border-red-300' : 'border-gray-300'
            }`}
            maxLength={2000}
          />
          <div className="mt-1 flex justify-between">
            {errors.content && (
              <p className="text-sm text-red-600">{errors.content}</p>
            )}
            <p className="text-sm text-gray-500 ml-auto">
              {content.length}/2000
            </p>
          </div>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Photos (Optional)
          </label>
          <p className="text-sm text-gray-500 mb-3">
            Help others by showing the product in use. Max {maxImages} photos, 5MB each.
          </p>

          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-3">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-20 object-cover rounded-md border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          {images.length < maxImages && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-md hover:border-gray-400 transition-colors"
              >
                <div className="text-center">
                  <FaCamera className="mx-auto h-6 w-6 text-gray-400 mb-1" />
                  <span className="text-sm text-gray-600">Add Photos</span>
                </div>
              </button>
            </div>
          )}

          {errors.images && (
            <p className="mt-1 text-sm text-red-600">{errors.images}</p>
          )}
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </div>
            ) : (
              'Submit Review'
            )}
          </Button>
        </div>
      </form>

      {/* Guidelines */}
      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Review Guidelines</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Be honest and helpful to other customers</li>
          <li>• Focus on the product's features and your experience</li>
          <li>• Avoid inappropriate language or personal information</li>
          <li>• Reviews are moderated and may take time to appear</li>
        </ul>
      </div>
    </div>
  );
};

export default ReviewForm;