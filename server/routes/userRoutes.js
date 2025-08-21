const express = require("express");
const router = express.Router();
const { getUserProfile , getMe } = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");


router.get("/profile" , protect , getUserProfile);
router.get('/me' , protect , getMe );



module.exports = router;
