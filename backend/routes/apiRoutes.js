const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Guest checkout
router.post('/orders', orderController.createOrder);
// (Additional public endpoints can be added here)

module.exports = router;
