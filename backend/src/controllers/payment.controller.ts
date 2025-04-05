import { Request, Response } from 'express';
import { StripeService } from '../services/stripe.service';
import { PaymentIntentRequestSchema } from '../schemas/payment.schema'; // Import the schema
import logger from '../utils/logger';

// Helper function to handle responses
const handleResponse = (res: Response, status: number, data: any) => {
  res.status(status).json(data);
};

// Create a payment intent
export const createPaymentIntent = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate and extract payment data from the request body
    const paymentData = PaymentIntentRequestSchema.parse(req.body); // Validate using Zod

    // Create a payment intent using the Stripe service
    const intent = await StripeService.createPaymentIntent(paymentData);

    // Respond with the client secret to the client for further processing
    handleResponse(res, 200, { clientSecret: intent.client_secret });
  } catch (error) {
    // Log the error with additional context
    logger.error(`Error creating payment intent: ${error instanceof Error ? error.message : 'Unknown error'}`);

    // Respond with a 500 status code and a user-friendly message
    handleResponse(res, 500, {
      error: 'Failed to create payment intent',
      details: error instanceof Error ? error.message : 'An unexpected error occurred'
    });
  }
};

// Confirm a payment
export const confirmPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract payment ID from the request body
    const { paymentId } = req.body;

    // Confirm the payment using the Stripe service
    const result = await StripeService.confirmPayment(paymentId);

    // Respond with the result of the payment confirmation
    handleResponse(res, 200, result);
  } catch (error) {
    // Log the error with additional context
    logger.error(`Error confirming payment: ${error instanceof Error ? error.message : 'Unknown error'}`);

    // Respond with a 500 status code and a user-friendly message
    handleResponse(res, 500, {
      error: 'Failed to confirm payment',
      details: error instanceof Error ? error.message : 'An unexpected error occurred'
    });
  }
};

// Webhook handler to listen for Stripe events
export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = "process.env.STRIPE_WEBHOOK_SECRET"; // Your webhook secret

  let event;

  try {
    // Verify the webhook signature
    if (typeof sig !== 'string') {
      logger.error('Invalid signature format');
      res.status(400).send('Webhook Error: Invalid signature');
      return
    }

    if (!endpointSecret) {
      logger.error('Missing endpoint secret');
      res.status(500).send('Webhook Error: Missing endpoint secret');
      return
    }

    event = StripeService.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    logger.error(`Webhook signature verification failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Invalid signature'}`);
    return
  }

  // Handle the event based on its type
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      logger.info(`PaymentIntent was successful! ID: ${paymentIntent.id}`);
      // Fulfill the purchase (e.g., update order status in your database)
      break;

    case 'payment_intent.payment_failed':
      const failedPaymentIntent = event.data.object;
      const errorMessage = failedPaymentIntent.last_payment_error?.message;
      logger.error(`PaymentIntent failed: ${failedPaymentIntent.id}, Error: ${errorMessage}`);
      // Notify the customer about the failed payment
      break;

    default:
      logger.warn(`Unhandled event type: ${event.type}`);
  }

  // Respond with a 200 status to acknowledge receipt of the event
  res.json({ received: true });
};