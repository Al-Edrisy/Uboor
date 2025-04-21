// backend/src/interfaces/email.interface.ts
export interface IEmailService {
    sendBookingConfirmation(
      to: string,
      subject: string,
      html: string,
      pdfAttachment?: { filename: string; content: Buffer }
    ): Promise<void>;
  }
  
  export interface IEmailConfig {
    smtpHost: string;
    smtpPort: number;
    secure: boolean;
    smtpUser: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
  }