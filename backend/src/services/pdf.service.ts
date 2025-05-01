import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { IPDFData } from '../interfaces/pdf.interface';
import { format, parseISO } from 'date-fns';

export class PDFService {
  private readonly PAGE_WIDTH = 595;
  private readonly PAGE_HEIGHT = 842;
  private readonly MARGIN = 50;
  private readonly COLUMN_WIDTH = (this.PAGE_WIDTH - (this.MARGIN * 2)) / 2;

  private async createDocument() {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    return pdfDoc;
  }

  private async loadFonts(pdfDoc: PDFDocument) {
    try {
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      return { bold: boldFont, regular: regularFont };
    } catch (error) {
      throw new Error('Font loading failed');
    }
  }

  private formatDate(dateString: string, formatString: string = 'PPpp') {
    try {
      return format(parseISO(dateString), formatString);
    } catch {
      return dateString;
    }
  }

  private formatDuration(duration: string): string {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (!match) return duration;
    
    const hours = match[1] ? `${match[1]}h ` : '';
    const minutes = match[2] ? `${match[2]}m` : '';
    return `${hours}${minutes}`.trim() || duration;
  }

  private drawSectionHeader(page: any, text: string, y: number, fonts: any) {
    page.drawText(text, {
      x: this.MARGIN,
      y,
      size: 18,
      font: fonts.bold,
      color: rgb(0.1, 0.1, 0.1)
    });
    
    page.drawLine({
      start: { x: this.MARGIN, y: y - 5 },
      end: { x: this.PAGE_WIDTH - this.MARGIN, y: y - 5 },
      thickness: 1,
      color: rgb(0.7, 0.7, 0.7)
    });
    
    return y - 30;
  }

  private async addFlightItinerary(pdfDoc: PDFDocument, page: any, data: IPDFData, fonts: any, startY: number) {
    let y = startY;
    
    for (const itinerary of data.flights) {
      const result = await this.checkPageSpace(pdfDoc, page, y, 100, data.metadata, fonts);
      page = result.page;
      y = result.y;

      y = this.drawSectionHeader(page, `${itinerary.itineraryType} JOURNEY`, y, fonts);
      
      for (const segment of itinerary.segments) {
        const departureCity = segment.departure.cityName || segment.departure.iataCode;
        const arrivalCity = segment.arrival.cityName || segment.arrival.iataCode;
        
        page.drawText(`${departureCity} -> ${arrivalCity}`, {
          x: this.MARGIN,
          y,
          size: 14,
          font: fonts.bold,
          color: rgb(0.1, 0.1, 0.1)
        });

        const leftCol = this.MARGIN;
        const rightCol = this.MARGIN + this.COLUMN_WIDTH;
        
        page.drawText(`Flight: ${segment.airline.code} ${segment.flightNumber}`, { 
          x: leftCol , 
          y: y - 20, 
          size: 11, 
          font: fonts.regular,
          color: rgb(0.2, 0.2, 0.2) 
        });
        
        page.drawText(`Departs: ${this.formatDate(segment.departure.time, 'MMM dd, yyyy HH:mm')}`, { 
          x: leftCol, 
          y: y - 35, 
          size: 11, 
          font: fonts.regular,
          color: rgb(0.2, 0.2, 0.2) 
        });
        
        page.drawText(`Duration: ${this.formatDuration(segment.duration)}`, { 
          x: leftCol, 
          y: y - 50, 
          size: 11, 
          font: fonts.regular,
          color: rgb(0.2, 0.2, 0.2) 
        });

        page.drawText(`Class: ${segment.cabin} (${segment.bookingClass})`, { 
          x: rightCol, 
          y: y - 20, 
          size: 11, 
          font: fonts.regular,
          color: rgb(0.2, 0.2, 0.2) 
        });
        
        page.drawText(`Arrives: ${this.formatDate(segment.arrival.time, 'MMM dd, yyyy HH:mm')}`, { 
          x: rightCol, 
          y: y - 35, 
          size: 11, 
          font: fonts.regular,
          color: rgb(0.2, 0.2, 0.2) 
        });
        
        page.drawText(`Aircraft: ${segment.aircraft || 'Not specified'}`, { 
          x: rightCol, 
          y: y - 50, 
          size: 11, 
          font: fonts.regular,
          color: rgb(0.2, 0.2, 0.2) 
        });

        y -= 70;
      }
    }

    return { page, y };
  }

  private async checkPageSpace(pdfDoc: PDFDocument, page: any, y: number, requiredSpace: number, metadata: IPDFData['metadata'], fonts: any) {
    if (y - requiredSpace < this.MARGIN) {
      const newPage = pdfDoc.addPage([this.PAGE_WIDTH, this.PAGE_HEIGHT]);
      this.addWatermark(newPage, fonts);
      return { 
        page: newPage, 
        y: this.PAGE_HEIGHT - this.MARGIN - 50 
      };
    }
    return { page, y };
  }

  private async addPassengerDetails(pdfDoc: PDFDocument, page: any, data: IPDFData, fonts: any, startY: number) {
    let y = startY;
    
    const result = await this.checkPageSpace(pdfDoc, page, y, 100, data.metadata, fonts);
    page = result.page;
    y = result.y;

    y = this.drawSectionHeader(page, 'PASSENGER DETAILS', y, fonts);

    for (const [index, passenger] of data.passengers.entries()) {
      const spaceNeeded = 30 + (Math.max(3, passenger.documents?.length || 0) * 15);
      const check = await this.checkPageSpace(pdfDoc, page, y, spaceNeeded, data.metadata, fonts);
      page = check.page;
      y = check.y;

      page.drawText(`${index + 1}. ${passenger.firstName} ${passenger.lastName}`, {
        x: this.MARGIN,
        y,
        size: 14,
        font: fonts.bold,
        color: rgb(0.1, 0.1, 0.1)
      });

      const detailsLeft = [
        `Date of Birth: ${this.formatDate(passenger.dateOfBirth, 'PP')}`,
        `Nationality: ${passenger.nationality || 'Not specified'}`
      ];

      const detailsRight = [
        ...(passenger.documents?.map(doc => `${doc.type}: ${doc.number}`) || []),
        `Contact: ${passenger.contact?.email || 'No email'}${passenger.contact?.phone ? ` | ${passenger.contact.phone}` : ''}`
      ];

      detailsLeft.forEach((detail, i) => {
        page.drawText(detail, {
          x: this.MARGIN,
          y: y - 20 - (i * 15),
          size: 10,
          font: fonts.regular,
          color: rgb(0.2, 0.2, 0.2)
        });
      });

      detailsRight.forEach((detail, i) => {
        page.drawText(detail, {
          x: this.MARGIN + this.COLUMN_WIDTH,
          y: y - 20 - (i * 15),
 size: 10,
          font: fonts.regular,
          color: rgb(0.2, 0.2, 0.2)
        });
      });

      y -= 30 + (Math.max(detailsLeft.length, detailsRight.length) * 15);
    }

    return { page, y };
  }

  private async addPriceBreakdown(pdfDoc: PDFDocument, page: any, data: IPDFData, fonts: any, startY: number) {
    let y = startY;
    
    const result = await this.checkPageSpace(pdfDoc, page, y, 100, data.metadata, fonts);
    page = result.page;
    y = result.y;

    y = this.drawSectionHeader(page, 'PRICE BREAKDOWN', y, fonts);

    page.drawText(`Total: ${data.price.total} ${data.price.currency}`, {
      x: this.MARGIN,
      y: y - 20,
      size: 14,
      font: fonts.bold,
      color: rgb(0.1, 0.1, 0.1)
    });
    y -= 40;

    if (data.price.taxes.length > 0) {
      page.drawText('Taxes & Fees:', {
        x: this.MARGIN,
        y,
        size: 12,
        font: fonts.regular,
        color: rgb(0.1, 0.1, 0.1)
      });

      data.price.taxes.forEach((tax, i) => {
        page.drawText(`${tax.code}: ${tax.amount}`, {
          x: this.MARGIN + 20,
          y: y - 15 - (i * 15),
          size: 11,
          font: fonts.regular,
          color: rgb(0.2, 0.2, 0.2)
        });
      });
      y -= 20 + (data.price.taxes.length * 15);
    }

    return { page, y };
  }

  private async addPaymentDetails(pdfDoc: PDFDocument, page: any, data: IPDFData, fonts: any, startY: number) {
    let y = startY;
    
    const result = await this.checkPageSpace(pdfDoc, page, y, 100, data.metadata, fonts);
    page = result.page;
    y = result.y;

    y = this.drawSectionHeader(page, 'PAYMENT INFORMATION', y, fonts);

    const paymentDetails = [
      `Amount Paid: ${data.payment.amount} ${data.payment.currency}`,
      `Payment Method: ${data.payment.method || 'Credit Card'}`,
      `Transaction ID: ${data.payment.id}`,
      `Status: ${data.payment.status.toUpperCase()}`,
      `Processed At: ${this.formatDate(data.payment.processedAt)}`
    ];

    paymentDetails.forEach((detail, i) => {
      page.drawText(detail, {
        x: this.MARGIN,
        y: y - 20 - (i * 15),
        size: 11,
        font: fonts.regular,
        color: rgb(0.2, 0.2, 0.2)
      });
    });

    y -= 30 + (paymentDetails.length * 15);
    return { page, y };
  }

  private async addContactInformation(pdfDoc: PDFDocument, page: any, data: IPDFData, fonts: any, startY: number) {
    let y = startY;
    
    const result = await this.checkPageSpace(pdfDoc, page, y, 150, data.metadata, fonts);
    page = result.page;
    y = result.y;

    y = this.drawSectionHeader(page, 'CONTACT INFORMATION', y, fonts);

    if (data.contactDetails.agency) {
      page.drawText(`Agency: ${data.contactDetails.agency.name}`, {
        x: this.MARGIN,
        y: y - 20,
        size: 12,
        font: fonts.bold,
        color: rgb(0.1, 0.1, 0.1)
      });

      const agencyDetails = [
        `Email: ${data.contactDetails.agency.email}`,
        `Phone: ${data.contactDetails.agency.phone}`
      ];

      agencyDetails.forEach((detail, i) => {
        page.drawText(detail, {
          x: this.MARGIN + 20,
          y: y - 40 - (i * 15),
          size: 10,
          font: fonts.regular,
          color: rgb(0.2, 0.2, 0.2)
        });
      });

      y -= 70;
    }

    page.drawText('Customer:', {
      x: this.MARGIN,
      y: y - 20,
      size: 12,
      font: fonts.bold,
      color: rgb(0.1, 0.1, 0.1)
    });

    const customerDetails = [
      `Name: ${data.contactDetails.customer.name}`,
      `Email: ${data.contactDetails.customer.email}`,
      ...(data.contactDetails.customer.phone ? [`Phone: ${data.contactDetails.customer.phone}`] : []),
      ...(data.contactDetails.customer.address ? [`Address: ${data.contactDetails.customer.address}`] : [])
    ];

    customerDetails.forEach((detail, i) => {
      page.drawText(detail, {
        x: this.MARGIN + 20,
        y: y - 40 - (i * 15),
        size: 10,
        font: fonts.regular,
        color: rgb(0.2, 0.2, 0.2)
      });
    });

    y -= 40 + (customerDetails.length * 15);
    return { page, y };
  }

  private addFooter(page: any, metadata: IPDFData['metadata'], fonts: any) {
    page.drawLine({
      start: { x: this.MARGIN, y: 60 },
      end: { x: this.PAGE_WIDTH - this.MARGIN, y: 60 },
      thickness: 0.5,
      color: rgb(0.7, 0.7, 0.7)
    });

    page.drawText(`Issued by: ${metadata.issuedBy} | ${this.formatDate(metadata.issueDate)}`, {
      x: this.MARGIN,
      y: 45,
      size: 8,
      font: fonts.regular,
      color: rgb(0.5, 0.5, 0.5)
    });

    page.drawText(`Terms & Conditions: ${metadata.termsLink}`, {
      x: this.MARGIN,
      y: 30,
      size: 8,
      font: fonts.regular,
      color: rgb(0.5, 0.5, 0.5)
    });

    page.drawText('CONFIDENTIAL', {
      x: this.PAGE_WIDTH - this.MARGIN - 60,
      y: 30,
      size: 8,
      font: fonts.regular,
      color: rgb(0.5, 0.5, 0.5)
    });
  }

  private addWatermark(page: any, fonts: any) {
    page.drawText('CONFIRMED', {
      x: this.PAGE_WIDTH / 2 - 100,
      y: this.PAGE_HEIGHT / 2,
      size: 72,
      font: fonts.bold,
      color: rgb(0.9, 0.9, 0.9),
      rotate: degrees(-45),
      opacity: 0.2
    });
  }

  async generateBookingPDF(data: IPDFData): Promise<Uint8Array> {
    const pdfDoc = await this.createDocument();
    let page = pdfDoc.addPage([this.PAGE_WIDTH, this.PAGE_HEIGHT]);
    const fonts = await this.loadFonts(pdfDoc);
    
    this.addWatermark(page, fonts);

    // Header
    let yPosition = this.PAGE_HEIGHT - this.MARGIN;
    page.drawText('TRAVEL CONFIRMATION', {
      x: this.MARGIN,
      y: yPosition,
      size: 26,
      font: fonts.bold,
      color: rgb(0, 0.2, 0.4)
    });

    yPosition -= 25;
    page.drawText(`Booking Reference: ${data.bookingReference}`, {
      x: this.MARGIN,
      y: yPosition,
      size: 12,
      font: fonts.regular,
      color: rgb(0.2, 0.2, 0.2)
    });

    yPosition -= 50;

    // Content sections with pagination
    const flightResult = await this.addFlightItinerary(pdfDoc, page, data, fonts, yPosition);
    page = flightResult.page;
    yPosition = flightResult.y;

    const passengerResult = await this.addPassengerDetails(pdfDoc, page, data, fonts, yPosition);
    page = passengerResult.page;
    yPosition = passengerResult.y;

    const priceResult = await this.addPriceBreakdown(pdfDoc, page, data, fonts, yPosition);
    page = priceResult.page;
    yPosition = priceResult.y;

    const paymentResult = await this.addPaymentDetails(pdfDoc, page, data, fonts, yPosition);
    page = paymentResult.page;
    yPosition = paymentResult.y;

    const contactResult = await this.addContactInformation(pdfDoc, page, data, fonts, yPosition);
    page = contactResult.page;

    // Add footer to all pages
    const pages = pdfDoc.getPages();
    for (const pg of pages) {
      this.addFooter(pg, data.metadata, fonts);
    }

    return pdfDoc.save();
  }
}

export const pdfService = new PDFService();