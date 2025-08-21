// src/components/certificates/CertificatesSection.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CertificatePreview from './CertificatePreview';
import { generateCertificatePDF, validateCourseCompletion } from '../../utils/CertificateGenerator';

const CertificatesSection = ({
  enrolledCourses,
  userProgress,
  onCertificateDownload,
  user,
}) => {
  const [downloading, setDownloading] = useState({});
  const [showCertificatePreview, setShowCertificatePreview] = useState(null);

  // Filter completed courses
  const completedCourses = enrolledCourses.filter((course) => 
    validateCourseCompletion(course, userProgress)
  );

  // Handle certificate download
  const handleCertificateDownload = async (course) => {
    setDownloading({ ...downloading, [course._id]: true });
    
    const success = await generateCertificatePDF(course, user);
    
    if (success && onCertificateDownload) {
      onCertificateDownload();
    }
    
    setDownloading({ ...downloading, [course._id]: false });
  };

  if (completedCourses.length === 0) {
    return (
      <motion.div
        className="text-center py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-8xl mb-6">🏆</div>
        <h3 className="text-2xl font-bold text-white mb-4">
          No certificates yet
        </h3>
        <p className="text-gray-300 text-lg">
          Complete a course to earn your first certificate.
        </p>
      </motion.div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {completedCourses.map((course, index) => (
          <motion.div
            key={course._id}
            className="bg-gradient-to-br from-yellow-400/20 via-orange-400/20 to-red-400/20 border border-yellow-400/30 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden group"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
          >
            {/* Decorative Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="text-center relative z-10">
              <motion.div
                className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-2xl"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                🏆
              </motion.div>

              <h3 className="font-bold text-white text-lg mb-3 line-clamp-2">
                {course.title}
              </h3>
              <p className="text-yellow-200 text-sm mb-6 font-medium">
                ✅ Completed on {new Date().toLocaleDateString("en-GB")}
              </p>

              <div className="space-y-3">
                <motion.button
                  onClick={() => setShowCertificatePreview(course)}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  👁️ Preview Certificate
                </motion.button>

                <motion.button
                  onClick={() => handleCertificateDownload(course)}
                  disabled={downloading[course._id]}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-2xl font-bold transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {downloading[course._id] ? (
                    <>
                      <motion.div
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                      Generating PDF...
                    </>
                  ) : (
                    <>📥 Download PDF</>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Certificate Preview Modal */}
      <AnimatePresence>
        {showCertificatePreview && (
          <CertificatePreview
            course={showCertificatePreview}
            user={user}
            onClose={() => setShowCertificatePreview(null)}
            onDownload={handleCertificateDownload}
            downloading={downloading[showCertificatePreview._id]}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default CertificatesSection;