// src/components/CourseReview.jsx
import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { toast } from 'react-hot-toast';

const CourseReview = ({ courseId, onReviewAdded }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [courseStats, setCourseStats] = useState({
    averageRating: 0,
    totalReviews: 0
  });
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [loading, setLoading] = useState(true);

  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    if (courseId) {
      fetchReviews();
      checkReviewEligibility();
    }
  }, [courseId]);

  const fetchReviews = async () => {
    try {
      const response = await API.get(`/courses/${courseId}/reviews`);
      if (response.data.success) {
        setReviews(response.data.reviews || []);
        setCourseStats({
          averageRating: response.data.averageRating || 0,
          totalReviews: response.data.totalReviews || 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkReviewEligibility = async () => {
    try {
      // Check if user completed the course and hasn't reviewed yet
      const userResponse = await API.get('/users/me');
      const userData = userResponse.data.user || userResponse.data;
      
      const isCompleted = userData.completedCourses?.includes(courseId);
      const hasAlreadyReviewed = reviews.some(
        review => review.user._id === userData._id
      );

      setCanReview(isCompleted && !hasAlreadyReviewed);
      setHasReviewed(hasAlreadyReviewed);
    } catch (error) {
      console.error('Failed to check review eligibility:', error);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!reviewForm.comment.trim()) {
      toast.error('Please write a comment');
      return;
    }

    try {
      const response = await API.post(`/courses/${courseId}/review`, {
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim()
      });

      if (response.data.success) {
        toast.success('Review submitted successfully!');
        setShowReviewForm(false);
        setReviewForm({ rating: 5, comment: '' });
        setCanReview(false);
        setHasReviewed(true);
        
        // Refresh reviews
        await fetchReviews();
        
        // Notify parent component
        if (onReviewAdded) {
          onReviewAdded(response.data.review);
        }
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const renderStars = (rating, interactive = false, onStarClick = null) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive ? () => onStarClick(star) : undefined}
            className={`text-xl ${
              star <= rating 
                ? 'text-yellow-400' 
                : 'text-gray-300'
            } ${interactive ? 'hover:text-yellow-400 cursor-pointer' : ''}`}
            disabled={!interactive}
          >
            ⭐
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Review Stats */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Course Reviews</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {renderStars(Math.round(courseStats.averageRating))}
            <span className="text-lg font-semibold">{courseStats.averageRating.toFixed(1)}</span>
          </div>
          <span className="text-gray-600">
            ({courseStats.totalReviews} {courseStats.totalReviews === 1 ? 'review' : 'reviews'})
          </span>
        </div>
      </div>

      {/* Add Review Button */}
      {canReview && !showReviewForm && (
        <div className="mb-6">
          <button
            onClick={() => setShowReviewForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Write a Review
          </button>
        </div>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-3">Write Your Review</h4>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rating
              </label>
              {renderStars(
                reviewForm.rating, 
                true, 
                (rating) => setReviewForm({...reviewForm, rating})
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comment
              </label>
              <textarea
                rows={4}
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Share your experience with this course..."
                required
              />
            </div>
            
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Submit Review
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Review Status Messages */}
      {hasReviewed && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800 text-sm">✓ You have already reviewed this course</p>
        </div>
      )}

      {!canReview && !hasReviewed && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800 text-sm">
            Complete this course to leave a review
          </p>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review._id} className="border-b border-gray-200 pb-4 last:border-b-0">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {review.user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{review.user.name}</span>
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-gray-700 text-sm">{review.comment}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">💬</div>
            <p className="text-gray-500">No reviews yet</p>
            <p className="text-gray-400 text-sm">Be the first to review this course!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseReview;
