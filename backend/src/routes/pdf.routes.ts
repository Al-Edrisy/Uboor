import express from 'express';
import { pdfController } from '../controllers/pdf.controller';
import validate from '../middleware/validate';
import { pdfSchema, emailPdfSchema } from '../schemas/pdf.schema';

const router = express.Router();

router.post(
  '/generate',
  validate(pdfSchema),
  (req, res, next) => pdfController.generateBookingPDF(req, res).catch(next)
);

router.post(
  '/sent-flight-ticket',
  validate(emailPdfSchema),
  (req, res, next) => pdfController.sendBookingConfirmation(req, res).catch(next)
);

export default router;