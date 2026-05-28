// src/components/payment/PaymentModal.jsx - Lazy-loaded Stripe
import { Fragment, useMemo } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { AnimatePresence } from 'framer-motion';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from './PaymentForm';

// Stripe loads ONLY when this modal is mounted (not on every page)
let stripePromiseCache = null;
const getStripePromise = () => {
  if (!stripePromiseCache) {
    stripePromiseCache = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromiseCache;
};

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  courseId,  
  courseName, 
  coursePrice, 
  onPaymentSuccess, 
  onEnrollmentComplete 
}) => {
  // Only initialize Stripe when modal opens
  const stripePromise = useMemo(() => {
    if (isOpen) return getStripePromise();
    return null;
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && stripePromise && (
        <Transition appear show={isOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={onClose}>
            {/* Backdrop */}
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div 
                className="fixed inset-0 backdrop-blur-sm"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 100%)'
                }}
              />
            </Transition.Child>

            {/* Modal Container */}
            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-90"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-90"
                >
                  <Dialog.Panel className="w-full max-w-md transform transition-all">
                    {/* Close Button */}
                    <button
                      onClick={onClose}
                      className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:text-gray-200 transition-all duration-300 border border-white/20 hover:border-white/40"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                    {/* Wrap PaymentForm with Stripe Elements */}
                    <Elements stripe={stripePromise}>
                      <PaymentForm
                        courseId={courseId}
                        courseName={courseName}
                        coursePrice={coursePrice}
                        onSuccess={() => {
                          onPaymentSuccess();
                          onClose();
                        }}
                        onCancel={onClose}
                        onEnrollmentComplete={onEnrollmentComplete}
                      />
                    </Elements>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;