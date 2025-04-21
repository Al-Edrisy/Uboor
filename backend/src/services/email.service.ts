// backend/src/services/email.service.ts
import nodemailer from 'nodemailer';
import { getEmailConfig } from '../constants/errorMessages';
import logger from '../utils/logger';
import { bookingConfirmationTemplate } from '../templates/emails/bookingConfirmation';

interface IEmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType?: string;
  }>;
}

export class EmailService {
  private transporter: nodemailer.Transporter;
  private config: ReturnType<typeof getEmailConfig>;

  constructor() {
    this.config = getEmailConfig();
    this.transporter = nodemailer.createTransport({
      host: this.config.smtpHost,
      port: this.config.smtpPort,
      secure: this.config.secure, // true for 465, false for other ports
      auth: {
        user: this.config.smtpUser,
        pass: this.config.smtpPassword,
      },
      logger: true,
      debug: process.env.NODE_ENV !== 'production',
    });

    this.verifyConnection();
  }

  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      logger.info('SMTP connection established successfully');
    } catch (error) {
      logger.error('SMTP connection failed:', error);
      throw new Error('Failed to establish SMTP connection');
    }
  }

  async sendEmail(options: IEmailOptions): Promise<void> {
    const { to, subject, html, attachments = [] } = options;

    try {
      const mailOptions: nodemailer.SendMailOptions = {
        from: `"${this.config.fromName}" <${this.config.fromEmail}>`,
        to,
        subject,
        html,
        attachments: attachments.map(attachment => ({
          ...attachment,
          contentType: attachment.contentType || 'application/octet-stream',
        })),
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent to ${to}`, { messageId: info.messageId });
    } catch (error) {
      logger.error('Failed to send email', { error, to, subject });
      throw error;
    }
  }

  async sendBookingConfirmation(
    to: string,
    bookingReference: string,
    passengerName: string,
    pdfAttachment?: Buffer
  ): Promise<void> {
    const subject = `Booking Confirmation - ${bookingReference}`;
    const html = bookingConfirmationTemplate({ passengerName, bookingReference });

    await this.sendEmail({
      to,
      subject,
      html,
      attachments: pdfAttachment ? [{
        filename: `booking-${bookingReference}.pdf`,
        content: pdfAttachment,
        contentType: 'application/pdf',
      }] : undefined,
    });
  }
}

export const emailService = new EmailService();