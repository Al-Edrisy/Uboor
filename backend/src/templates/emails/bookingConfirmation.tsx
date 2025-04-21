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
    companyName = 'Safe Travels Airlines',
    supportEmail = 'support@safetravels.com',
    supportPhone = '+1 (800) 123-4567',
  }: BookingConfirmationParams): string => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmation - ${bookingReference}</title>
      <style>
          * {
              font-family: 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333333;
              box-sizing: border-box;
          }
          body {
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
          }
          .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #ffffff;
          }
          .header {
              background-color: #0066cc;
              padding: 30px 20px;
              text-align: center;
              color: white;
          }
          .logo {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
          }
          .content {
              padding: 30px 20px;
          }
          .footer {
              margin-top: 20px;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #777777;
              border-top: 1px solid #eeeeee;
          }
          .button {
              display: inline-block;
              padding: 10px 20px;
              background-color: #0066cc;
              color: white;
              text-decoration: none;
              border-radius: 4px;
              margin: 15px 0;
          }
          .details {
              background-color: #f9f9f9;
              padding: 15px;
              border-radius: 4px;
              margin: 20px 0;
          }
          .reference {
              font-size: 18px;
              font-weight: bold;
              color: #0066cc;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <div class="logo">${companyName}</div>
              <h1>Your Booking Confirmation</h1>
          </div>
          
          <div class="content">
              <p>Dear ${passengerName},</p>
              <p>Thank you for choosing ${companyName}. Your booking has been confirmed and we're preparing everything for your trip.</p>
              
              <div class="details">
                  <p><strong>Booking Reference:</strong> <span class="reference">${bookingReference}</span></p>
                  <p>Please keep this reference number for all communications regarding your booking.</p>
              </div>
              
              <p>We've attached your booking confirmation and receipt to this email for your records.</p>
              
              <p>If you need to make any changes to your booking or have any questions, please don't hesitate to contact our customer support team.</p>
              
              <p>Wishing you pleasant travels,</p>
              <p><strong>The ${companyName} Team</strong></p>
          </div>
          
          <div class="footer">
              <p>${companyName}</p>
              <p>Customer Support: ${supportPhone} | ${supportEmail}</p>
              <p>© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>
  `;