import express from 'express';
import { pdfController } from '../controllers/pdf.controller';
import validate from '../middleware/validate';
import { pdfSchema } from './../schemas/pdf.schema';

const router = express.Router();

router.post(
  '/generate',
  validate(pdfSchema),
  pdfController.generateBookingPDF
);

router.post(
  '/send-confirmation',
  validate(pdfSchema),
  pdfController.sendBookingConfirmation
);

export default router;