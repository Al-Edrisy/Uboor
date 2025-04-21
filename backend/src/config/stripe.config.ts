import dotenv from 'dotenv';
import Stripe from 'stripe';

// Load environment variables from .env file
dotenv.config();

// Create and export the Stripe configuration
export const stripeConfig = {
  stripe: new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia',
    typescript: true,
  }),
};