// src/services/stripe.service.ts
import { stripeConfig } from '../config/stripe.config'; // Adjust the path as necessary
import { PaymentIntentRequest } from '@/interfaces/stripe.interfaces'; // Ensure this path is correct
import logger from '../utils/logger';

export class StripeService {
  // Use the Stripe instance from the configuration
  private static stripe = stripeConfig.stripe;

  /**
   * Create a PaymentIntent with the specified payment data.
   *
   * @param paymentData - The payment data containing amount, currency, userId, and bookingId.
   * @returns The created PaymentIntent object.
   */
  static async createPaymentIntent(paymentData: PaymentIntentRequest) {
    try {
      // Create a PaymentIntent using the Stripe API.
      // Here we attach a default test payment method.
      const intent = await this.stripe.paymentIntents.create({
        amount: paymentData.amount,
        currency: paymentData.currency,
        payment_method: 'pm_card_visa', // Use a test payment method
        metadata: {
          userId: paymentData.userId,
          bookingId: paymentData.bookingId,
        },
      });
      logger.info(`Payment intent created: ${intent.id}`);
      return intent;
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error creating payment intent: ${error.message}`);
      } else {
        logger.error('Error creating payment intent: Unknown error');
      }
      throw new Error('Failed to create payment intent');
    }
  }

  /**
   * Confirm a PaymentIntent using the provided PaymentIntent ID.
   *
   * @param paymentId - The ID of the PaymentIntent to confirm.
   * @returns The confirmed PaymentIntent object.
   *
   * @see https://docs.stripe.com/api/payment_intents/confirm
   */
  static async confirmPayment(paymentId: string) {
    try {
      // Include a return_url to satisfy redirect-based payment method requirements.
      const confirmData = {
        return_url: 'http://localhost:3000/payment-success'
      };
      const result = await this.stripe.paymentIntents.confirm(paymentId, confirmData);
      logger.info(`Payment intent confirmed: ${result.id}`);
      return result;
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error confirming payment: ${error.message}`);
      } else {
        logger.error('Error confirming payment: Unknown error');
      }
      throw new Error('Failed to confirm payment');
    }
  }

  /**
   * Construct and verify a Stripe event from the raw webhook payload.
   *
   * @param payload - The raw body of the webhook request as a Buffer.
   * @param signature - The Stripe signature header for verification.
   * @param endpointSecret - The webhook secret for verifying the event.
   * @returns The verified Stripe event object.
   */
  static constructEvent(payload: Buffer, signature: string, endpointSecret: string) {
    try {
      return this.stripe.webhooks.constructEvent(payload, signature, endpointSecret);
    } catch (error) {
      logger.error(`Webhook signature verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new Error('Webhook signature verification failed');
    }
  }
}
