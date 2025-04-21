// backend/src/controllers/pdf.controller.ts
import { Request, Response } from 'express';
import { pdfService } from '../services/pdf.service';
import { emailService } from '../services/email.service';
import { IPDFData } from '../interfaces/pdf.interface';
import logger from '../utils/logger';

export class PDFController {
  async generateBookingPDF(req: Request, res: Response) {
    try {
      const data: IPDFData = req.body;
      const pdfBuffer = await pdfService.generateBookingPDF(data);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=booking-${data.bookingReference}.pdf`);
      res.send(pdfBuffer);
    } catch (error) {
      logger.error('PDF generation failed', { error });
      res.status(500).json({ 
        error: 'Failed to generate PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async sendBookingConfirmation(req: Request, res: Response) {
    try {
      const data: IPDFData & { email: string } = req.body;
      const  pdfBuffer = await pdfService.generateBookingPDF(data);
      
      await emailService.sendBookingConfirmation(
        data.email,
        data.bookingReference,
        `${data.passengers[0].firstName} ${data.passengers[0].lastName}`,
        Buffer.from(pdfBuffer)
      );

      res.json({
        success: true,
        message: 'Confirmation email sent successfully',
        bookingReference: data.bookingReference
      });
    } catch (error) {
      logger.error('Booking confirmation failed', { error });
      res.status(500).json({ 
        error: 'Failed to send confirmation email',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export const pdfController = new PDFController();