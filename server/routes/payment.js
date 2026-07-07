const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createPaymentIntent } = require('../controllers/paymentController');

router.post('/create-payment-intent', protect, createPaymentIntent);

module.exports = router;
