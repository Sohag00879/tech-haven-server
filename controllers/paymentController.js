import Stripe from "stripe";
import asyncHandler from "../middlewares/asyncHandler.js";
// Initialize Stripe with your secret keyy

import dotenv from "dotenv";
dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const payment = asyncHandler(async (req, res) => {
  try {
    const { products } = req.body;

    const lineItems = products.map((product) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: product.name,
          images: [product.image],
        },
        unit_amount: Math.round(product.price * 100),
      },
      quantity: product.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    });
    console.log(session);
    res.status(200).json({ id: session.id });
  } catch (error) {
    // console.error("Error creating session:", error); // Log error details
    // res.status(500).json({ error: error.message });
  }
});

export { payment };

// Route to create a payment intent
// const payment = asyncHandler(async (req, res) => {
//   try {
//     const { amount, currency, customerDetails } = req.body;

//     // Create a payment intent
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount, // Amount should be in the smallest currency unit (e.g., cents for USD)
//       currency,
//       metadata: {
//         customerId: customerDetails._id,
//         email: customerDetails.email,
//       },
//     });

//     res.status(200).json({
//       clientSecret: paymentIntent.client_secret,
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });
