// controllers/studentController.js
const Course = require("../models/Course");
const User = require("../models/User");

const getInstructorStudents = async (req, res) => {
  try {
    const instructorId = req.user._id;
    
    // Get all courses by instructor
    const courses = await Course.find({ createdBy: instructorId })
      .populate({
        path: 'studentsEnrolled',
        select: 'name email enrolledCourses completedLectures',
      });
    
    // Collect all unique students
    const studentsMap = new Map();
    
    courses.forEach(course => {
      course.studentsEnrolled.forEach(student => {
        if (!studentsMap.has(student._id.toString())) {
          studentsMap.set(student._id.toString(), {
            _id: student._id,
            name: student.name,
            email: student.email,
            enrolledCourses: [],
            totalProgress: 0
          });
        }
        
        // Add course info
        const studentData = studentsMap.get(student._id.toString());
        const courseProgress = student.completedLectures?.find(
          entry => entry.courseId && entry.courseId.toString() === course._id.toString()
        );
        const progress = courseProgress ? courseProgress.lectureIds.length : 0;
        
        studentData.enrolledCourses.push({
          courseId: course._id,
          title: course.title,
          progress
        });
      });
    });
    
    const students = Array.from(studentsMap.values());
    
    res.json({
      students,
      totalStudents: students.length,
      courses: courses.map(c => ({ 
        _id: c._id, 
        title: c.title, 
        studentsCount: c.studentsEnrolled.length 
      }))
    });
  } catch (error) {
    console.error('Student Management Error:', error);
    res.status(500).json({ message: "Failed to fetch students" });
  }
};

module.exports = { getInstructorStudents };
