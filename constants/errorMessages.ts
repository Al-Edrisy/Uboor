export const getEmailConfig = () => ({
    smtpHost: process.env.SMTP_HOST || 'smtp.example.com',
    smtpPort: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    smtpUser: process.env.SMTP_USER || 'user@example.com',
    smtpPassword: process.env.SMTP_PASSWORD || 'password',
    fromEmail: process.env.FROM_EMAIL || 'noreply@example.com',
    fromName: process.env.FROM_NAME || 'Travel Booking',
  });