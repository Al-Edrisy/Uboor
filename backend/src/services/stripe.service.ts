import { stripeConfig } from '../config/stripe.config';
import { PaymentIntentRequest, CardDetails, PaymentResult } from '../interfaces/stripe.interfaces';
import logger from '../utils/logger';

export class StripeService {
  private static stripe = stripeConfig.stripe;

  private static validateCardDetails(card: CardDetails): void {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    if (card.exp_year < currentYear || 
        (card.exp_year === currentYear && card.exp_month < currentMonth)) {
      throw new Error('Card has expired');
    }

    if (!card.number.startsWith('558')) {
      throw new Error('For testing, only cards starting with 558 are accepted');
    }
  }

  static async processPayment(paymentData: PaymentIntentRequest): Promise<PaymentResult> {
    try {
      if (paymentData.card) {
        this.validateCardDetails(paymentData.card);

        const paymentMethod = await this.stripe.paymentMethods.create({
          type: 'card',
          card: {
            token: 'tok_visa',
          },
        });

        const intent = await this.stripe.paymentIntents.create({
          amount: paymentData.amount,
          currency: paymentData.currency,
          payment_method: paymentMethod.id,
          confirm: true,
          metadata: {
            userId: paymentData.userId,
          },
          return_url: 'http://localhost:2000/payment-success',
        });

        
        logger.info(`Payment processed successfully: ${intent.id}`);
        
        return {
          id: intent.id,
          status: intent.status,
          amount: intent.amount,
          currency: intent.currency,
          clientSecret: intent.client_secret ?? undefined,
          requiresAction: intent.status === 'requires_action'
        };
      } else {
        const intent = await this.stripe.paymentIntents.create({
          amount: paymentData.amount,
          currency: paymentData.currency,
          payment_method: 'pm_card_visa',
          confirm: true,
          metadata: {
            userId: paymentData.userId,          },
        });

        logger.info(`Payment processed with default test card: ${intent.id}`);
        
        return {
          id: intent.id,
          status: intent.status,
          amount: intent.amount,
          currency: intent.currency,
        };
      }
    } catch (error) {
      logger.error(`Payment processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  static constructEvent(payload: Buffer, signature: string, endpointSecret: string) {
    try {
      return this.stripe.webhooks.constructEvent(payload, signature, endpointSecret);
    } catch (error) {
      logger.error(`Webhook signature verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new Error('Webhook signature verification failed');
    }
  }
}