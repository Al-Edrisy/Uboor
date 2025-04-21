import { Router } from 'express';
import { createPaymentIntent, confirmPayment, handleWebhook } from '../controllers/payment.controller';
import validate from '../middleware/validate';
import { PaymentIntentRequestSchema } from '../schemas/payment.schema';

const router = Router();

router.post('/create-intent', validate(PaymentIntentRequestSchema), createPaymentIntent);
router.post('/confirm', confirmPayment);
router.post('/webhook', handleWebhook);

export default router;