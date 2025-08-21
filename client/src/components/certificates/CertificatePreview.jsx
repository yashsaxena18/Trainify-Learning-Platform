// src/components/certificates/CertificatePreview.jsx
import React from 'react';
import { motion } from 'framer-motion';

const CertificatePreview = ({ 
  course, 
  user, 
  onClose, 
  onDownload,
  downloading = false 
}) => {
  return (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-auto relative"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: "spring", damping: 15, stiffness: 100 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-10 h-10 bg-white hover:bg-gray-100 rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-900 transition-all duration-200 text-2xl font-bold"
          aria-label="Close Preview"
        >
          ×
        </button>

        {/* Certificate Design */}
        <div 
          className="relative p-12 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
          style={{ aspectRatio: '3/2', minHeight: '600px' }}
        >
          {/* Decorative Border */}
          <div className="absolute inset-4 border-8 border-yellow-400 rounded-2xl"></div>
          <div className="absolute inset-6 border-4 border-yellow-600 rounded-xl"></div>

          {/* Header */}
          <div className="text-center mb-8 relative z-10">
            <div className="text-6xl mb-4">🏆</div>
            <h1 className="text-4xl font-black text-gray-800 mb-2 tracking-wider">
              CERTIFICATE OF COMPLETION
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto"></div>
          </div>

          {/* Content */}
          <div className="text-center mb-8 relative z-10">
            <p className="text-xl text-gray-600 mb-6">
              This is to certify that
            </p>
            <h2 className="text-5xl font-black mb-6 text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
              {user?.name || "Student Name"}
            </h2>
            <p className="text-xl text-gray-600 mb-4">
              has successfully completed the course
            </p>
            <h3 className="text-3xl font-bold text-gray-800 mb-8 px-8">
              "{course.title}"
            </h3>

            <div className="grid grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">100%</div>
                <div className="text-gray-600">Completion Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {course.lectures?.length || "7"}
                </div>
                <div className="text-gray-600">Lectures Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">A+</div>
                <div className="text-gray-600">Grade Achieved</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-end relative z-10">
            <div className="text-center">
              <div className="w-48 border-b-2 border-gray-400 mb-2"></div>
              <p className="text-gray-600 font-semibold">Date of Completion</p>
              <p className="text-gray-800 font-bold">
                {new Date().toLocaleDateString("en-GB")}
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-2">🎓</div>
              <p className="text-2xl font-black text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                TRAINIFY
              </p>
              <p className="text-gray-600 text-sm">Learning Platform</p>
            </div>

            <div className="text-center">
              <div className="w-48 border-b-2 border-gray-400 mb-2"></div>
              <p className="text-gray-600 font-semibold">Yash Saxena</p>
              <p className="text-gray-800 font-bold">Platform Administrator</p>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-8 left-8 text-4xl text-yellow-400 opacity-30">🌟</div>
          <div className="absolute top-8 right-8 text-4xl text-yellow-400 opacity-30">🌟</div>
          <div className="absolute bottom-8 left-8 text-4xl text-yellow-400 opacity-30">🌟</div>
          <div className="absolute bottom-8 right-8 text-4xl text-yellow-400 opacity-30">🌟</div>
        </div>

        {/* Preview Actions */}
        <div className="p-6 bg-gray-50 border-t flex justify-between">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-semibold transition-colors"
          >
            Close Preview
          </button>
          <button
            onClick={() => onDownload(course)}
            disabled={downloading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
          >
            {downloading ? (
              <>
                <motion.div
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Generating...
              </>
            ) : (
              <>📥 Download Certificate</>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CertificatePreview;
