const User = require("../models/User");
const Course = require("../models/Course");
const PDFDocument = require("pdfkit"); // ✅ Add this import

// src/controllers/certificateController.js
exports.checkCourseCompletion = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId } = req.params;

    const user = await User.findById(userId);
    const course = await Course.findById(courseId);

    if (!user || !course) {
      return res.status(404).json({ success: false, message: "User or course not found" });
    }

    // ✅ Use the SAME logic as getCourseProgress
    const courseProgress = user.completedLectures.find(
      (entry) => entry.courseId && entry.courseId.toString() === courseId
    );

    const completedLectureCount = courseProgress?.lectureIds?.length || 0;
    const totalLectures = course.lectures.length;
    const progressPercentage = totalLectures > 0 ? (completedLectureCount / totalLectures) * 100 : 0;

    // ✅ Check for 100% completion
    const isCompleted = progressPercentage === 100;

    return res.status(200).json({
      success: true,
      isCompleted,
      completedLectureCount,
      totalLectures,
      progressPercentage: progressPercentage.toFixed(2)
    });
  } catch (error) {
    console.error('Certificate check error:', error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.generateCertificate = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId } = req.params;

    const user = await User.findById(userId);
    const course = await Course.findById(courseId);

    if (!user || !course) {
      return res.status(404).json({ success: false, message: "User or course not found" });
    }

    // ✅ Use consistent completion check
    const courseProgress = user.completedLectures.find(
      (entry) => entry.courseId && entry.courseId.toString() === courseId
    );

    const completedLectureCount = courseProgress?.lectureIds?.length || 0;
    const totalLectures = course.lectures.length;
    
    // ✅ Check for exact completion
    if (completedLectureCount !== totalLectures || totalLectures === 0) {
      return res.status(403).json({ 
        success: false, 
        message: "Course not yet completed",
        debug: {
          completed: completedLectureCount,
          total: totalLectures,
          progress: `${completedLectureCount}/${totalLectures}`
        }
      });
    }

    // ✅ Generate certificate (your existing PDF code)
    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=certificate-${course.title}.pdf`);

    doc.fontSize(26).text("Certificate of Completion", { align: "center" });
    doc.moveDown();
    doc.fontSize(20).text(`This is to certify that`, { align: "center" });
    doc.moveDown();
    doc.fontSize(24).text(user.name, { align: "center", underline: true });
    doc.moveDown();
    doc.fontSize(20).text(`has successfully completed the course`, { align: "center" });
    doc.moveDown();
    doc.fontSize(24).text(course.title, { align: "center", underline: true });
    doc.moveDown(2);
    doc.fontSize(16).text(`Date: ${new Date().toLocaleDateString()}`, { align: "right" });

    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error('Certificate generation error:', error);
    res.status(500).json({ success: false, message: "Failed to generate certificate" });
  }
};
