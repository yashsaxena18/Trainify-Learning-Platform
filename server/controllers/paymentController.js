const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Course = require('../models/Course');

// Create Stripe payment intent
const createPaymentIntent = async (req, res) => {
  console.log('📝 Payment intent request received:', req.body);
  
  try {
    const { courseId } = req.body;
    const studentId = req.user._id; // Use authenticated user IDl

    // Validation
    if (!courseId) {
      console.log('❌ Missing courseId');
      return res.status(400).json({ error: 'Missing courseId' });
    }

    // Fetch course from database
    console.log('🔍 Fetching course:', courseId);
    const course = await Course.findById(courseId).select('_id title price');
    
    if (!course) {
      console.log('❌ Course not found:', courseId);
      return res.status(404).json({ error: 'Course not found' });
    }

    console.log('✅ Course found:', { id: course._id, title: course.title, price: course.price });

    // Validate price
    if (typeof course.price !== 'number' || isNaN(course.price) || course.price <= 0) {
      console.log('❌ Invalid course price:', course.price);
      return res.status(400).json({ error: 'Invalid course price in database' });
    }

    // Convert rupees to paise (multiply by 100)
    const amountInPaise = Math.round(course.price * 100);
    console.log('💰 Amount in paise:', amountInPaise);

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInPaise,
      currency: 'inr',
      automatic_payment_methods: { enabled: true },
      description: `Enrollment for course: ${course.title}`,
      metadata: {
        courseId: String(course._id),
        courseName: course.title,
        studentId: String(studentId),
        enrollmentType: 'course_enrollment',
      },
    });

    console.log('✅ Payment intent created:', {
      id: paymentIntent.id,
      amount: amountInPaise,
      currency: 'inr'
    });

    // Return success response
    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: course.price, // Original rupee amount for display
      currency: 'INR',
      course: { 
        id: course._id, 
        title: course.title 
      },
    });

  } catch (err) {
    console.error('💥 Error creating payment intent:', err);
    return res.status(500).json({
      error: 'Failed to create payment intent',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    });
  }
};

module.exports = { createPaymentIntent };
