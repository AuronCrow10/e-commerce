// controllers/orderController.js

const db = require('../models');
const Order = db.Order;
const crypto = require('crypto');

exports.createOrder = async (req, res) => {
  try {
    // 1) Generate a unique identifier
    const orderIdentifier = crypto.randomBytes(8).toString('hex').toUpperCase();

    // 2) Destructure everything out of the body
    let {
      products,
      paymentStatus,
      paymentIntent,
      orderStatus,
      shippingInfo,
      billingInfo
    } = req.body;

    // 3) Defensive parsing in case any field comes in as a JSON string
    if (typeof products === 'string') {
      try { products = JSON.parse(products); }
      catch (e) { /* leave as-is */ }
    }
    if (typeof shippingInfo === 'string') {
      try { shippingInfo = JSON.parse(shippingInfo); }
      catch (e) { /* leave as-is */ }
    }
    if (typeof billingInfo === 'string') {
      try { billingInfo = JSON.parse(billingInfo); }
      catch (e) { /* leave as-is */ }
    }

    // 4) Fallbacks
    paymentIntent = paymentIntent || 'crypto';
    orderStatus   = orderStatus   || 'Pending';

    // 5) Create the order record
    const order = await Order.create({
      orderIdentifier,
      products,
      paymentStatus,
      paymentIntent,
      orderStatus,
      shippingInfo,
      billingInfo
    });

    return res.json(order);
  } catch (err) {
    console.error('CreateOrderError:', err);
    return res.status(500).json({ error: err.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll();
    return res.json(orders);
  } catch (err) {
    console.error('GetOrdersError:', err);
    return res.status(500).json({ error: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Not found' });

    order.orderStatus   = req.body.orderStatus   || order.orderStatus;
    order.paymentStatus = req.body.paymentStatus || order.paymentStatus;
    await order.save();

    return res.json(order);
  } catch (err) {
    console.error('UpdateOrderStatusError:', err);
    return res.status(500).json({ error: err.message });
  }
};
