import { NextResponse } from 'next/server';
import pool from '@/lib/db/mysql';
import { sendEmail } from '@/lib/email';
import { createEmailTemplate } from '@/lib/templates/emailTemplate';
import { generateConfirmationToken, getExpirationDate } from '@/lib/utils/tokens';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const connection = await pool.getConnection();

    try {
      // Check if user exists
      const [users] = await connection.execute(
        'SELECT id FROM User WHERE email = ?',
        [email]
      );

      if (!Array.isArray(users) || users.length === 0) {
        return NextResponse.json(
          { message: "Si cette adresse existe, vous recevrez un email de réinitialisation." },
          { status: 200 }
        );
      }

      // Generate reset token
      const resetToken = generateConfirmationToken();
      const expiresAt = getExpirationDate();

      // Store reset token
      await connection.execute(
        'INSERT INTO PasswordReset (user_id, reset_token, expires_at) VALUES (?, ?, ?)',
        [users[0].id, resetToken, expiresAt]
      );

      // Send reset email
      const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password/${resetToken}`;
      
      await sendEmail(
        email,
        'Réinitialisation de votre mot de passe',
        createEmailTemplate({
          title: 'Réinitialisation de votre mot de passe',
          content: `
            <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
            <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
            <p>Ce lien expire dans 24 heures.</p>
          `,
          buttonText: 'Réinitialiser mon mot de passe',
          buttonUrl: resetUrl
        })
      );

      return NextResponse.json({
        message: "Si cette adresse existe, vous recevrez un email de réinitialisation."
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { message: "Une erreur est survenue" },
      { status: 500 }
    );
  }
} 