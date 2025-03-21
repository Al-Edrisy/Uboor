import { Router } from 'express';
import { createPaymentIntent, confirmPayment, handleWebhook } from '../controllers/payment.controller';
import validate from '../middleware/validate'; 
import { PaymentIntentRequestSchema } from '../schemas/payment.schema'; 

const router = Router();

// Route to create a payment intent
router.post('/create-intent', validate(PaymentIntentRequestSchema), createPaymentIntent);

// Route to confirm a payment
router.post('/confirm', confirmPayment);

// Webhook route for Stripe events
router.post('/webhook', handleWebhook);

export default router;