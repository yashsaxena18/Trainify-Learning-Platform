// src/pages/course/CourseDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { trackCoursePageView } from '../../services/api';
import API from '../../services/api';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CourseDetail = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseAndTrackView = async () => {
      try {
        setLoading(true);

        // Fetch course data
        const response = await API.get(`/courses/${courseId}`);
        setCourse(response.data.course);

        // Track page view
        await trackCoursePageView(courseId);

      } catch (error) {
        console.error('Failed to load course:', error);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseAndTrackView();
    }
  }, [courseId]);

  const handlePayment = async () => {
    try {
      const res = await API.post('/payment/create-checkout-session', {
        courseId: course._id,
        courseName: course.title,
        coursePrice: course.price,
      });

      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId: res.data.id });
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  if (loading) return <div>Loading course...</div>;

  return (
    <div className="course-detail">
      <h1>{course.title}</h1>
      <div className="course-stats">
        <span>👁️ {course.views} views</span>
        <span>👥 {course.studentsEnrolled?.length} students</span>
        <span>⭐ {course.averageRating} ({course.totalReviews} reviews)</span>
      </div>

      <p className="course-price">Price: ${course.price}</p>

      <button 
        onClick={handlePayment}
        className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
      >
        Buy Now
      </button>

      {/* Rest of your course detail content */}
    </div>
  );
};

export default CourseDetail;
