import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { to, subject, message, clientName, amount, date, invoiceId, invoiceLink, phone, therapistName, therapistType } = req.body;

  // IMPORTANT: You need to set these environment variables in your .env file
  // EMAIL_USER=appointment.cyt@gmail.com
  // EMAIL_PASS=your-gmail-app-password
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'appointment.cyt@gmail.com',
      pass: process.env.EMAIL_PASS, // App password required for Gmail
    },
  });

  const emailHtml = `
    <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="background: linear-gradient(135deg, #228756 0%, #1b6843 100%); padding: 35px 20px; text-align: center; color: white;">
        <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 5px;">
          <h2 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; display: inline-block; vertical-align: middle;">Choose Your Therapist</h2>
        </div>
      </div>
      
      <div style="padding: 35px; line-height: 1.6;">
        <h3 style="color: #228756; margin-top: 0; font-size: 20px; font-weight: 700;">Hello ${clientName},</h3>
        <p style="color: #475569; font-size: 15px;">${message}</p>
        
        <div style="background-color: #f8fafc; padding: 25px; border-radius: 12px; margin: 30px 0; border: 1px solid #f1f5f9;">
          <h4 style="margin: 0 0 15px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; color: #1e293b; font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Invoice Summary</h4>
          <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Therapist</td>
              <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #1e293b;">
                ${therapistName || 'Your Therapist'}
                ${therapistType ? `<br><span style="font-size: 11px; color: #64748b; font-weight: 500;">${therapistType}</span>` : ''}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Client Name</td>
              <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #1e293b;">${clientName}</td>
            </tr>
            ${to ? `
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Client Email</td>
              <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #1e293b;">${to}</td>
            </tr>` : ''}
            ${phone ? `
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Client Phone</td>
              <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #1e293b;">${phone}</td>
            </tr>` : ''}
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Invoice ID</td>
              <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #1e293b;">#${invoiceId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Date</td>
              <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #1e293b;">${date}</td>
            </tr>
            <tr>
              <td style="padding: 15px 0 8px 0; color: #64748b; font-weight: 600; font-size: 16px;">Total Amount</td>
              <td style="padding: 15px 0 8px 0; font-weight: 900; text-align: right; color: #228756; font-size: 22px;">₹${amount}</td>
            </tr>
          </table>
        </div>
        
        <div style="text-align: center; margin: 35px 0;">
          <a href="${invoiceLink}" style="background-color: #228756; color: white; padding: 14px 35px; text-decoration: none; border-radius: 10px; font-weight: 700; display: inline-block; font-size: 16px; box-shadow: 0 4px 10px rgba(34, 135, 86, 0.2);">View & Download Invoice</a>
        </div>
        
        <div style="margin-top: 35px; padding-top: 25px; border-top: 1px solid #f1f5f9;">
          <p style="margin: 0 0 10px 0; font-size: 13px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Contact Support</p>
          <p style="margin: 0 0 5px 0; font-size: 14px; color: #1e293b;"><strong>Email:</strong> <a href="mailto:chooseyourtherapist@gmail.com" style="color: #228756; text-decoration: none;">chooseyourtherapist@gmail.com</a></p>
          <p style="margin: 0; font-size: 14px; color: #1e293b;"><strong>Phone:</strong> +91-8077757951</p>
        </div>
      </div>
      
      <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9;">
        <p style="margin: 0;">© ${new Date().getFullYear()} Choose Your Therapist. All rights reserved.</p>
        <p style="margin: 5px 0 0 0;">This is an automated invoice. No signature required.</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: '"Choose Your Therapist" <appointment.cyt@gmail.com>',
      to,
      subject,
      html: emailHtml,
    });

    return res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
}
