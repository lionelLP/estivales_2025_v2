import crypto from 'crypto';

export function generateConfirmationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function generateUnsubscribeToken(email: string): string {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not set in environment variables');
    throw new Error('JWT_SECRET is required for newsletter functionality');
  }
  
  return crypto
    .createHash('sha256')
    .update(email + process.env.JWT_SECRET)
    .digest('hex');
}

export function getExpirationDate(): Date {
  const date = new Date();
  date.setHours(date.getHours() + 24);
  return date;
} 