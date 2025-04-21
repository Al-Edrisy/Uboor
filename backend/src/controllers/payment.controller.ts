import { Request, Response } from 'express';
import { StripeService } from '../services/stripe.service';
import { PaymentIntentRequestSchema } from '../schemas/payment.schema';
import logger from '../utils/logger';

const handleResponse = (res: Response, status: number, data: any) => {
  res.status(status).json(data);
};

export const processPayment = async (req: Request, res: Response) => {
  try {
    const paymentData = PaymentIntentRequestSchema.parse(req.body);
    const result = await StripeService.processPayment(paymentData);
    handleResponse(res, 200, result);
  } catch (error) {
    logger.error(`Payment processing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    handleResponse(res, 400, {
      error: 'Payment processing failed',
      details: error instanceof Error ? error.message : 'An unexpected error occurred'
    });
  }
};

export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const paymentData = PaymentIntentRequestSchema.parse(req.body);
    const result = await StripeService.processPayment(paymentData);
    handleResponse(res, 200, result);
  } catch (error) {
    logger.error(`Error creating payment intent: ${error instanceof Error ? error.message : 'Unknown error'}`);
    handleResponse(res, 400, {
      error: 'Failed to create payment intent',
      details: error instanceof Error ? error.message : 'An unexpected error occurred'
    });
  }
};

export const confirmPayment = async (req: Request, res: Response) => {
  try {
    const { paymentId, card } = req.body;
    
    if (!paymentId) throw new Error('Payment ID is required');

    const result = await StripeService.processPayment(paymentId);
    handleResponse(res, 200, result);
  } catch (error) {
    logger.error(`Error confirming payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    handleResponse(res, 400, {
      error: 'Failed to confirm payment',
      details: error instanceof Error ? error.message : 'An unexpected error occurred'
    });
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  try {
    const event = StripeService.constructEvent(req.body, sig, endpointSecret);

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        logger.info(`PaymentIntent succeeded: ${paymentIntent.id}`);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        logger.error(`Payment failed: ${failedPayment.id}`);
        break;

      default:
        logger.warn(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    logger.error(`Webhook error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(400).send(`Webhook Error: ${error instanceof Error ? error.message : 'Invalid signature'}`);
  }
};