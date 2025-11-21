const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripeController');

// Create checkout session
router.post('/create-checkout-session', stripeController.createCheckoutSession);

// Webhook (using raw body)
router.post('/webhook', express.raw({ type: 'application/json' }), stripeController.handleWebhook);

router.post('/refund', stripeController.refundPayment);

module.exports = router;
