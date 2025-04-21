// backend/src/services/pdf.service.ts
import { createWriteStream, mkdirSync } from 'fs';
import { join } from 'path';
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import { IPDFData } from '../interfaces/pdf.interface';
import logger from '../utils/logger';
import fontkit from '@pdf-lib/fontkit';
import fs from 'fs';

export class PDFService {
  private async loadFont(pdfDoc: PDFDocument) {
    try {
      pdfDoc.registerFontkit(fontkit);
      
      // For production, use a proper font file
      const fontBytes = fs.readFileSync(join(__dirname, './../../assets/fonts/Roboto/Roboto-Regular.ttf'));
      return await pdfDoc.embedFont(fontBytes);
    } catch (error) {
      logger.warn('Failed to load custom font, using standard fonts', error);
      return await pdfDoc.embedFont(StandardFonts.Helvetica);
    }
  }

  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  }

  private async addHeader(pdfDoc: PDFDocument, page: any, width: number, title: string) {
    const font = await this.loadFont(pdfDoc);
    const fontSize = 24;
    
    page.drawText(title, {
      x: 50,
      y: page.getHeight() - 50,
      size: fontSize,
      font,
      color: rgb(0, 0.2, 0.4),
    });

    page.drawLine({
      start: { x: 50, y: page.getHeight() - 70 },
      end: { x: width - 50, y: page.getHeight() - 70 },
      thickness: 2,
      color: rgb(0, 0.2, 0.4),
    });
  }

  private async addFlightDetails(pdfDoc: PDFDocument, page: any, data: IPDFData, yPosition: number, width: number) {
    const font = await this.loadFont(pdfDoc);
    const fontSize = 14;
    const smallFontSize = 10;
    const x = 50;
    let y = yPosition;

    // Flight Information Section
    page.drawText('Flight Details', {
      x,
      y,
      size: fontSize + 2,
      font,
      color: rgb(0, 0.2, 0.4),
    });
    y -= 25;

    // Flight Route
    page.drawText(`${data.flight.departureCity} -> ${data.flight.arrivalCity}`, {
      x,
      y,
      size: fontSize,
      font,
    });
    y -= 20;

    // Flight Number and Date
    page.drawText(`Flight Number: ${data.flight.flightNumber}`, { x, y, size: smallFontSize, font });
    page.drawText(`Departure: ${this.formatDate(data.flight.departureTime)}`, { 
      x: width / 2, 
      y, 
      size: smallFontSize, 
      font 
    });
    y -= 15;

    // Duration
    page.drawText(`Duration: ${data.flight.duration}`, { x, y, size: smallFontSize, font });
    y -= 30;

    return y;
  }

  private async addPassengerDetails(pdfDoc: PDFDocument, page: any, data: IPDFData, yPosition: number) {
    const font = await this.loadFont(pdfDoc);
    const fontSize = 14;
    const smallFontSize = 10;
    const x = 50;
    let y = yPosition;

    // Passenger Information Section
    page.drawText('Passenger Information', {
      x,
      y,
      size: fontSize + 2,
      font,
      color: rgb(0, 0.2, 0.4),
    });
    y -= 25;

    data.passengers.forEach((passenger, index) => {
      page.drawText(`${index + 1}. ${passenger.firstName} ${passenger.lastName}`, { x, y, size: fontSize, font });
      if (passenger.passportNumber) {
        page.drawText(`Passport: ${passenger.passportNumber}`, { x: x + 150, y, size: smallFontSize, font });
      }
      y -= 20;
    });

    y -= 10;
    return y;
  }

  private async addPaymentDetails(pdfDoc: PDFDocument, page: any, data: IPDFData, yPosition: number, width: number) {
    const font = await this.loadFont(pdfDoc);
    const fontSize = 14;
    const smallFontSize = 10;
    const x = 50;
    let y = yPosition;

    // Payment Information Section
    page.drawText('Payment Details', {
      x,
      y,
      size: fontSize + 2,
      font,
      color: rgb(0, 0.2, 0.4),
    });
    y -= 25;

    page.drawText(`Amount: ${data.payment.amount} ${data.payment.currency}`, { x, y, size: fontSize, font });
    y -= 20;

    page.drawText(`Method: ${data.payment.method}`, { x, y, size: smallFontSize, font });
    page.drawText(`Status: ${data.payment.status}`, { x: width / 2, y, size: smallFontSize, font });
    y -= 15;

    page.drawText(`Transaction ID: ${data.payment.transactionId}`, { x, y, size: smallFontSize, font });
    y -= 30;

    return y;
  }

  private async addFooter(pdfDoc: PDFDocument, page: any, width: number, bookingReference: string) {
    const font = await this.loadFont(pdfDoc);
    const fontSize = 10;
    
    page.drawText(`Booking Reference: ${bookingReference}`, {
      x: 50,
      y: 50,
      size: fontSize,
      font,
    });

    page.drawText('Thank you for choosing our service!', {
      x: 50,
      y: 30,
      size: fontSize,
      font,
    });

    page.drawText(new Date().toLocaleDateString(), {
      x: width - 100,
      y: 30,
      size: fontSize,
      font,
    });
  }

  async generateBookingPDF(data: IPDFData): Promise<Uint8Array> {
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]); // A4 size in points (72ppi)
      const { width, height } = page.getSize();

      // Add document header
      await this.addHeader(pdfDoc, page, width, 'Booking Confirmation');

      // Add booking reference
      let currentY = height - 100;
      page.drawText(`Booking Reference: ${data.bookingReference}`, {
        x: 50,
        y: currentY,
        size: 12,
        font: await this.loadFont(pdfDoc),
      });
      currentY -= 30;

      // Add flight details
      currentY = await this.addFlightDetails(pdfDoc, page, data, currentY, width);

      // Add passenger details
      currentY = await this.addPassengerDetails(pdfDoc, page, data, currentY);

      // Add payment details
      currentY = await this.addPaymentDetails(pdfDoc, page, data, currentY, width);

      // Add terms and conditions
      page.drawText('Terms and Conditions:', {
        x: 50,
        y: currentY,
        size: 12,
        font: await this.loadFont(pdfDoc),
        color: rgb(0, 0.2, 0.4),
      });
      currentY -= 20;

      const terms = [
        '1. Tickets are non-refundable but can be changed for a fee.',
        '2. Check-in opens 24 hours before departure.',
        '3. Baggage allowance may apply.',
        '4. Government taxes and fees included.'
      ];

      const font = await this.loadFont(pdfDoc);

      terms.forEach(term => {
        page.drawText(term, {
          x: 60,
          y: currentY,
          size: 10,
          font,
        });
        currentY -= 15;
      });

      // Add footer
      await this.addFooter(pdfDoc, page, width, data.bookingReference);

      // Add watermark
      const tempPdf = await PDFDocument.create();
      const tempPage = tempPdf.addPage([300, 100]);
      const watermarkFont = await this.loadFont(tempPdf);
      tempPage.drawText('CONFIDENTIAL', {
        x: 50,
        y: 50,
        size: 20,
        font: watermarkFont,
        color: rgb(0.75, 0.75, 0.75),
        rotate: degrees(-45),
      });

      const embeddedPage = await pdfDoc.embedPage(tempPage);
      const { width: embeddedWidth, height: embeddedHeight } = embeddedPage;

      page.drawPage(embeddedPage, {
        x: width / 2 - embeddedWidth / 2,
        y: height / 2 - embeddedHeight / 2,
        width: embeddedWidth,
        height: embeddedHeight,
        opacity: 0.1,
        rotate: degrees(-45),
      });

      const pdfBytes = await pdfDoc.save();
      return pdfBytes;
    } catch (error) {
      logger.error('Error generating PDF', error);
      throw error;
    }
  }

  async generateAndSaveBookingPDF(data: IPDFData): Promise<{ pdfBytes: Uint8Array; filePath: string }> {
    try {
      const pdfBytes = await this.generateBookingPDF(data);
      const saveDir = join(__dirname, '../../templates/pdfs');
      mkdirSync(saveDir, { recursive: true });

      const filename = `booking-${data.bookingReference}.pdf`;
      const filePath = join(saveDir, filename);

      await new Promise<void>((resolve, reject) => {
        const stream = createWriteStream(filePath);
        stream.write(Buffer.from(pdfBytes));
        stream.end();
        stream.on('finish', () => resolve());
        stream.on('error', (error) => reject(error));
      });

      return { pdfBytes, filePath };
    } catch (error) {
      logger.error('Error saving PDF', error);
      throw error;
    }
  }
}

export const pdfService = new PDFService();