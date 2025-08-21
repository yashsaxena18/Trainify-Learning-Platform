// src/components/payment/PaymentForm.jsx - Fixed Version
import { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../services/api';

const PaymentForm = ({ 
  courseId, 
  courseName, 
  coursePrice,
  onSuccess, 
  onCancel, 
  onEnrollmentComplete
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const [processingStep, setProcessingStep] = useState('');
  const [stripeReady, setStripeReady] = useState(false);

  // Check if Stripe is ready
  useEffect(() => {
    if (stripe && elements) {
      setStripeReady(true);
    }
  }, [stripe, elements]);

  const handleCardChange = (event) => {
    setCardComplete(event.complete);
    setCardError(event.error?.message || null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setPaymentError(null);

    if (!stripe || !elements) {
      toast.error('Payment system not ready');
      setLoading(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast.error('Card information not found');
      setLoading(false);
      return;
    }

    try {
      // Step 1: Create payment intent
      setProcessingStep('Creating secure payment...');
      const { data } = await API.post('/payment/create-payment-intent', {
        courseId: courseId,
        studentId: user._id
      });

      if (!data.success || !data.clientSecret) {
        throw new Error('Payment setup failed');
      }

      // Step 2: Confirm payment
      setProcessingStep('Processing payment...');
      const { error, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: user.name || 'Student',
            email: user.email
          }
        }
      });

      if (error) {
        setPaymentError(error.message);
        toast.error(`Payment failed: ${error.message}`);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Step 3: Enroll student
        setProcessingStep('Enrolling you in the course...');
        toast.success('🎉 Payment successful!');
        
        try {
          if (onEnrollmentComplete) {
            await onEnrollmentComplete(courseId);
          }
          
          setProcessingStep('Enrollment complete!');
          setTimeout(() => {
            if (onSuccess) onSuccess();
          }, 1000);
        } catch (enrollmentError) {
          toast.error('Payment successful but enrollment failed. Please contact support.');
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Payment failed';
      setPaymentError(errorMessage);
      toast.error(errorMessage);
    }

    setLoading(false);
    setProcessingStep('');
  };

  // Show loading state while Stripe is loading
  if (!stripeReady) {
    return (
      <div className="relative">
        <motion.div 
          className="relative bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-center py-8">
            <motion.div
              className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-gray-600">Loading payment system...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        <motion.div
          className="absolute -top-4 -left-4 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-full filter blur-xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full filter blur-xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 20, 0],
            scale: [1.2, 1, 1.2],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <motion.div 
        className="relative bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 max-w-md mx-auto"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
      >
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <span className="text-3xl">🎓</span>
          </div>
          <h3 className="text-2xl font-black text-gray-800 mb-2">
            Complete Enrollment
          </h3>
          <p className="text-gray-600 font-medium">
            {courseName}
          </p>
          <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl border border-emerald-200">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-semibold">Total Amount</span>
              <span className="text-3xl font-black text-transparent bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text">
                ₹{coursePrice}
              </span>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card Information Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-sm font-bold text-gray-700 mb-3">
              💳 Card Information
            </label>
            <div className={`relative p-4 bg-white/90 backdrop-blur-sm border-2 rounded-2xl transition-all duration-300 ${
              focusedField === 'card' 
                ? 'border-blue-400 shadow-lg shadow-blue-400/25' 
                : cardError 
                  ? 'border-red-400 shadow-lg shadow-red-400/25'
                  : cardComplete
                    ? 'border-emerald-400 shadow-lg shadow-emerald-400/25'
                    : 'border-gray-200 hover:border-gray-300'
            }`}>
              <CardElement 
                onFocus={() => setFocusedField('card')}
                onBlur={() => setFocusedField(null)}
                onChange={handleCardChange}
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#1f2937',
                      fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
                      fontSmoothing: 'antialiased',
                      lineHeight: '24px',
                      '::placeholder': {
                        color: '#9ca3af',
                      },
                    },
                    invalid: {
                      color: '#ef4444',
                    },
                    complete: {
                      color: '#059669',
                    },
                  },
                  hidePostalCode: false,
                  iconStyle: 'solid',
                  disabled: loading
                }}
              />
              
              {/* Card Status Indicator */}
              <AnimatePresence>
                {cardComplete && (
                  <motion.div
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                  >
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Card Error */}
            <AnimatePresence>
              {cardError && (
                <motion.div
                  className="mt-2 text-red-500 text-sm font-medium flex items-center gap-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <span>⚠️</span>
                  {cardError}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Payment Error */}
          <AnimatePresence>
            {paymentError && (
              <motion.div
                className="p-4 bg-red-50 border border-red-200 rounded-2xl"
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">❌</span>
                  <div>
                    <p className="font-bold text-red-800">Payment Failed</p>
                    <p className="text-red-600 text-sm">{paymentError}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Processing Status */}
          <AnimatePresence>
            {loading && processingStep && (
              <motion.div
                className="p-4 bg-blue-50 border border-blue-200 rounded-2xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <p className="text-blue-800 font-medium">{processingStep}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <motion.div 
            className="flex space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <motion.button
              type="submit"
              disabled={!stripe || loading || !cardComplete}
              className="flex-1 relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    className="flex items-center justify-center gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Processing...
                  </motion.div>
                ) : (
                  <motion.div
                    key="pay"
                    className="flex items-center justify-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <span>🚀</span>
                    Pay ₹{coursePrice}
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Button Shimmer Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              />
            </motion.button>
            
            <motion.button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 disabled:opacity-50 border-2 border-gray-200 hover:border-gray-300"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
          </motion.div>
        </form>

        {/* Security & Test Info */}
        <motion.div 
          className="mt-6 space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl p-3">
            <span className="text-green-500">🔒</span>
            <span className="font-medium">Secured by Stripe</span>
            <span className="text-green-500">✓</span>
          </div>

          {/* Test Card Info */}
          <motion.div 
            className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4"
            whileHover={{ scale: 1.02 }}
          >
            <p className="font-bold text-amber-800 mb-2 flex items-center gap-2">
              <span>🧪</span>
              Test Mode - Use Test Cards
            </p>
            <div className="space-y-1 text-sm text-amber-700">
              <p><strong>Card:</strong> 4000 0035 6000 0008</p>
              <p><strong>Expiry:</strong> Any future date (e.g., 12/25)</p>
              <p><strong>CVC:</strong> Any 3 digits (e.g., 123)</p>
              <p><strong>ZIP:</strong> Any 5-6 digits (e.g., 12345)</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Success Animation Overlay */}
        <AnimatePresence>
          {loading && processingStep === 'Enrollment complete!' && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-emerald-500/90 to-green-600/90 backdrop-blur-sm rounded-3xl flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <div className="text-center text-white">
                <motion.div
                  className="text-6xl mb-4"
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.6 }}
                >
                  🎉
                </motion.div>
                <h3 className="text-2xl font-bold">Success!</h3>
                <p className="text-emerald-100">Welcome to your new course!</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default PaymentForm;