// src/controllers/pdf.controller.ts
import { Request, Response } from 'express';
import { pdfService } from '../services/pdf.service';
import { emailService } from '../services/email.service';
import { emailPdfSchema } from '../schemas/pdf.schema';
import logger from '../utils/logger';

export class PDFController {
  async generateBookingPDF(req: Request, res: Response): Promise<void> {
    try {
      const validationResult = emailPdfSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          error: 'Invalid request data',
          details: validationResult.error.errors
        });
        return;
      }

      const data = validationResult.data;
      const pdfUint8Array = await pdfService.generateBookingPDF(data);
      const pdfBuffer = Buffer.from(pdfUint8Array); // Convert Uint8Array to Buffer

      const sanitizedRef = data.bookingReference.replace(/[^a-z0-9]/gi, '_');
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename=Booking_${sanitizedRef}.pdf`);
      res.send(pdfBuffer);

    } catch (error) {
      logger.error('PDF generation failed', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      res.status(500).json({ 
        error: 'Failed to generate PDF',
        details: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  async sendBookingConfirmation(req: Request, res: Response): Promise<void> {
    try {
      const validationResult = emailPdfSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          error: 'Invalid request data',
          details: validationResult.error.errors
        });
        return;
      }

      const data = validationResult.data;
      const pdfUint8Array = await pdfService.generateBookingPDF(data);
      const pdfBuffer = Buffer.from(pdfUint8Array); // Convert Uint8Array to Buffer

      await emailService.sendBookingConfirmation(
        data.email,
        data.bookingReference,
        `${data.passengers[0].firstName} ${data.passengers[0].lastName}`,
        pdfBuffer
      );

      res.json({
        success: true,
        message: 'Confirmation email sent successfully',
        bookingReference: data.bookingReference,
        email: data.email
      });

    } catch (error) {
      logger.error('Booking confirmation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });

      res.status(500).json({ 
        error: 'Failed to send confirmation email',
        details: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }
}

export const pdfController = new PDFController();