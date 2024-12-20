import nodemailer from 'nodemailer';
import crypto from 'crypto';

function generateUnsubscribeToken(email: string): string {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not set in environment variables');
    throw new Error('JWT_SECRET is required for newsletter functionality');
  }
  
  return crypto
    .createHash('sha256')
    .update(email + process.env.JWT_SECRET)
    .digest('hex');
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendEmail(to: string, subject: string, html: string, isNewsletter = false) {
  try {
    console.log('Starting email send process...', { to, subject, isNewsletter });
    
    const headers: any = {};
    if (isNewsletter) {
      const unsubscribeUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/newsletter/unsubscribe/${generateUnsubscribeToken(to)}`;
      headers['List-Unsubscribe'] = `<${unsubscribeUrl}>`;
      headers['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click';
      headers['Precedence'] = 'bulk';
      headers['X-Mailer'] = 'Les Estivales de Brou Newsletter';
    }
    
    console.log('Attempting to send email with nodemailer...');
    console.log('SMTP Configuration:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        // Hide password in logs
        pass: process.env.SMTP_PASSWORD ? '****' : 'not set'
      }
    });

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
      headers
    });
    
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Detailed email error:', {
      error: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    });
    return { success: false, error };
  }
} 