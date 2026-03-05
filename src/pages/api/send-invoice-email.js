import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { to, subject, message, clientName, amount, date, invoiceId, invoiceLink } = req.body;

  // IMPORTANT: You need to set these environment variables in your .env file
  // EMAIL_USER=chooseyourtherapist@gmail.com
  // EMAIL_PASS=your-gmail-app-password
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'chooseyourtherapist@gmail.com',
      pass: process.env.EMAIL_PASS, // App password required for Gmail
    },
  });

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
      <div style="background-color: #228756; padding: 20px; text-align: center; color: white;">
        <h2 style="margin: 0;">ChooseYourTherapist</h2>
        <p style="margin: 5px 0 0 0; font-size: 14px;">Professional Therapy Services</p>
      </div>
      
      <div style="padding: 30px; line-height: 1.6;">
        <h3 style="color: #228756;">Hello ${clientName},</h3>
        <p>${message}</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #e2e8f0;">
          <h4 style="margin: 0 0 15px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; color: #1e293b;">Invoice Details</h4>
          <table style="width: 100%; font-size: 14px;">
            <tr>
              <td style="padding: 5px 0; color: #64748b;">Invoice ID:</td>
              <td style="padding: 5px 0; font-weight: bold; text-align: right;">#${invoiceId}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #64748b;">Date:</td>
              <td style="padding: 5px 0; font-weight: bold; text-align: right;">${date}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #64748b;">Amount:</td>
              <td style="padding: 5px 0; font-weight: bold; text-align: right; color: #228756; font-size: 18px;">₹${amount}</td>
            </tr>
          </table>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${invoiceLink}" style="background-color: #228756; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View Full Invoice</a>
        </div>
        
        <p style="margin-top: 30px; font-size: 13px; color: #64748b;">
          If you have any questions, please reply to this email or contact us at info.cyt@gmail.com.
        </p>
      </div>
      
      <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #94a3b8;">
        © ${new Date().getFullYear()} ChooseYourTherapist LLP. All rights reserved.
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: '"ChooseYourTherapist" <chooseyourtherapist@gmail.com>',
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
