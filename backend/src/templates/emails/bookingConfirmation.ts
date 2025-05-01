// backend/src/templates/emails/bookingConfirmation.ts

interface BookingConfirmationParams {
  passengerName: string;
  bookingReference: string;
  companyName?: string;
  supportEmail?: string;
  supportPhone?: string;
}

export const bookingConfirmationTemplate = ({
  passengerName,
  bookingReference,
  companyName = 'Uboor',
  supportEmail = 'support@uboor.com',
  supportPhone = '+1 (800) 555-UBOOR',
}: BookingConfirmationParams): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation - ${bookingReference}</title>
  <style>
    * {
      box-sizing: border-box;
      font-family: 'Helvetica Neue', Arial, sans-serif;
      color: #333;
    }
    body {
      margin: 0;
      padding: 0;
      background-color: #f2f2f2;
    }
    .container {
      max-width: 600px;
      margin: 30px auto;
      background: #ffffff;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    .header {
      background-color: #000000;
      padding: 30px 20px;
      text-align: center;
    }
    .logo {
      font-size: 40px;
      font-weight: 800;
      color: white;
      margin: 0;
    }
    .brand-name {
      color: white;
      font-size: 16px;
      font-weight: 600;
      letter-spacing: 1px;
      margin-top: 8px;
    }
    .content {
      padding: 30px 20px;
    }
    h1 {
      font-size: 24px;
      color: #000;
      margin-top: 0;
      margin-bottom: 20px;
    }
    .ticket-info {
      background-color: #f7f9fc;
      border: 1px solid #e1e5eb;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .ticket-info p {
      margin: 8px 0;
      font-size: 16px;
    }
    .booking-ref {
      font-size: 20px;
      font-weight: bold;
      color: #000;
    }
    .button {
      display: inline-block;
      margin-top: 20px;
      padding: 12px 24px;
      background-color: #000000;
      color: #ffffff;
      text-decoration: none;
      border-radius: 5px;
      font-weight: 600;
      font-size: 16px;
    }
    .footer {
      background: #fafafa;
      text-align: center;
      padding: 20px;
      font-size: 12px;
      color: #777;
      border-top: 1px solid #eee;
    }
    .footer p {
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">U</div>
      <div class="brand-name">UBOOR</div>
    </div>
    <div class="content">
      <h1>Booking Confirmation</h1>
      <p>Hello ${passengerName},</p>
      <p>Thank you for booking with <strong>${companyName}</strong>! Your trip is confirmed. Below are your ticket details:</p>

      <div class="ticket-info">
        <p><strong>Booking Reference:</strong></p>
        <p class="booking-ref">${bookingReference}</p>
      </div>

      <p>A detailed itinerary and payment receipt have been attached to this email for your records.</p>

      <a href="#" class="button">View My Booking</a>

      <p style="margin-top: 30px;">If you have any questions or need assistance, feel free to contact our support team.</p>

      <p>Safe travels,</p>
      <p><strong>The ${companyName} Team</strong></p>
    </div>
    <div class="footer">
      <p>Customer Support: ${supportPhone} | ${supportEmail}</p>
      <p>© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
