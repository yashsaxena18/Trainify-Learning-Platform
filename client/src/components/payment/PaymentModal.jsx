// src/components/payment/PaymentModal.jsx - Modern Design
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {  motion ,AnimatePresence } from 'framer-motion';
import PaymentForm from './PaymentForm';

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  courseId,  
  courseName, 
  coursePrice, 
  onPaymentSuccess, 
  onEnrollmentComplete 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <Transition appear show={isOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={onClose}>
            {/* Backdrop */}
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-500"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <motion.div 
                className="fixed inset-0 backdrop-blur-sm"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 100%)'
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            </Transition.Child>

            {/* Modal Container */}
            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-500"
                  enterFrom="opacity-0 scale-75 rotate-12"
                  enterTo="opacity-100 scale-100 rotate-0"
                  leave="ease-in duration-300"
                  leaveFrom="opacity-100 scale-100 rotate-0"
                  leaveTo="opacity-0 scale-75 rotate-12"
                >
                  <Dialog.Panel className="w-full max-w-md transform transition-all">
                    {/* Animated Background Elements */}
                    <div className="absolute inset-0 overflow-hidden rounded-3xl">
                      <motion.div
                        className="absolute top-0 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-full filter blur-3xl"
                        animate={{
                          scale: [1, 1.2, 1],
                          rotate: [0, 180, 360],
                        }}
                        transition={{ duration: 20, repeat: Infinity }}
                      />
                      <motion.div
                        className="absolute bottom-0 right-1/4 w-72 h-72 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full filter blur-3xl"
                        animate={{
                          scale: [1.2, 1, 1.2],
                          rotate: [360, 180, 0],
                        }}
                        transition={{ duration: 25, repeat: Infinity }}
                      />
                    </div>

                    {/* Close Button */}
                    <motion.button
                      onClick={onClose}
                      className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:text-gray-200 transition-all duration-300 border border-white/20 hover:border-white/40"
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>

                    {/* Payment Form */}
                    <motion.div
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
                    >
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
                    </motion.div>
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