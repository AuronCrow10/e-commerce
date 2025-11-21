const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../models');
const Order = db.Order;
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

exports.createCheckoutSession = async (req, res) => {
  const {products, billingInfo} = req.body;
  const totalPrice = products.reduce((sum, product) => sum + (product.price ? product.price * product.quantity : 0), 0);

  try {
    const options = {
      payment_method_types: ['card', 'paypal'],
      line_items: products.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {name: item.name},
          unit_amount: Math.round(item.price * 100)
        },
        quantity: item.quantity
      })),
      mode: 'payment',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU']  // Adjust to the countries you support
      },
      // Optionally, you can set shipping_options if you need shipping rates
      phone_number_collection: {
        enabled: true
      },
      billing_address_collection: billingInfo ? 'required' : 'auto', //forse non necessario, da verificare se vogliamo richiederlo anche su stripe o meno; qui si può valutare di passare il valore in env anziché il checkbox || process.env.STIPE_BILLING_ENABLED
      success_url: `${process.env.FRONTEND_URL}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout-cancel`,
      metadata: {
        products: JSON.stringify(products),
        billingInfo: billingInfo ? JSON.stringify(billingInfo) : null
      }
    };
    if(totalPrice < 100){
      options.line_items.push({
        price_data: {
          currency: 'usd',
          product_data: {name: "Shipping"},
          unit_amount: Math.round(5.99 * 100)
        },
        quantity: 1
      })
    }
    const session = await stripe.checkout.sessions.create(options);
    // Return the session URL provided by Stripe.
    res.json({url: session.url});
  } catch (error) {
    console.error("Stripe session error:", error.message);
    res.status(500).json({error: error.message});
  }
};

exports.handleWebhook = async (req, res) => {
  let event;
  try {
    const sig = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("Received event:", event.type);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log("Received session:", session);
    // Extract shipping info from shipping_details:
    const shippingInfo = session.shipping_details || null;
    const billingInfo = session.metadata.billingInfo ? JSON.parse(session.metadata.billingInfo) : null;
    try {
      const existingOrder = await Order.findOne({where: {orderIdentifier: session.id}});
      if (!existingOrder) {
        let products = [];
        if (session.metadata && session.metadata.products) {
          try {
            products = JSON.parse(session.metadata.products);
          } catch (e) {
            console.error("Error parsing session metadata products:", e);
          }
        }
        console.log("Creating order with shipping:", shippingInfo);
        const order = await Order.create({
          orderIdentifier: session.id,
          products: products,
          paymentStatus: session.payment_status || 'paid',
          paymentIntent: session.payment_intent,
          orderStatus: 'Pending',
          shippingInfo, // This will save the shipping_details object in the DB
          billingInfo,
        });
        console.log("Order created:", order.orderIdentifier);
      } else {
        console.log("Order already exists for session:", session.id);
      }
    } catch (error) {
      console.error("Error creating order:", error);
    }
  }
  res.json({received: true});
};

exports.refundPayment = async (req, res) => {
  const {transactionIds} = req.body;

  if (!Array.isArray(transactionIds) || transactionIds.length === 0) {
    return res.status(400).json({error: 'Invalid or empty transactionIds array'});
  }

  try {
    const refunds = [];

    for (const orderIdentifier of transactionIds) {
      const order = await Order.findOne({where: {orderIdentifier}});

      if (!order) {
        console.error(`Order with identifier ${orderIdentifier} not found`);
        continue;
      }

      if (
        order.paymentStatus !== 'paid' ||
        order.paymentStatus === 'refunded'
      ) {
        console.error(`Order ${orderIdentifier} is not eligible for refund`);
        continue;
      }

      const refund = await stripe.refunds.create({
        payment_intent: order.paymentIntent,
      });

      console.log(`Refund created for order ${orderIdentifier}:`, refund);

      await order.update({orderStatus: 'refunded'});

      refunds.push({orderIdentifier, refund});
    }

    res.json({success: true, refunds});
  } catch (error) {
    console.error("Error processing refunds:", error.message);
    res.status(500).json({error: error.message});
  }
};

