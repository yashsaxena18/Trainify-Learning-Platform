const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getInstructorCourses ,getInstructorDashboard, getInstructorAnalytics, getInstructorCourse } = require("../controllers/instructorController");
const { getInstructorStudents } = require('../controllers/studentController');

const isInstructor = (req,res, next)=>{
    if(req.user.role !== 'instructor'){
        return res.status(403).json({ message: "Only instructors can access this." });
    }
    next();

};
router.get("/courses" , protect , isInstructor ,getInstructorCourses);
router.get("/courses/:id", protect, isInstructor, getInstructorCourse);
router.get("/dashboard", protect, isInstructor, getInstructorDashboard);
// Analytics routes
router.get('/analytics', protect, isInstructor, getInstructorAnalytics);
router.get('/students', protect, isInstructor, getInstructorStudents);
module.exports = router;