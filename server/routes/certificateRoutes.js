const express = require("express");
const { checkCourseCompletion ,generateCertificate} = require("../controllers/certificateController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/check/:courseId", protect , checkCourseCompletion);
router.get("/download/:courseId", protect , generateCertificate);

module.exports = router;
