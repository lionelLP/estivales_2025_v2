import { NextResponse } from 'next/server';
import pool from '@/lib/db/mysql';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const connection = await pool.getConnection();

    try {
      // Check if email already exists
      const [existing] = await connection.execute(
        'SELECT email FROM Newsletter WHERE email = ?',
        [email]
      );

      if (Array.isArray(existing) && existing.length > 0) {
        return NextResponse.json(
          { error: 'Email déjà inscrit à la newsletter' },
          { status: 400 }
        );
      }

      // Add email to newsletter list
      await connection.execute(
        'INSERT INTO Newsletter (email, subscribed_at) VALUES (?, NOW())',
        [email]
      );

      // Send confirmation email
      await sendEmail(
        email,
        'Confirmation d\'inscription à la newsletter',
        `
        <h1>Merci de votre inscription !</h1>
        <p>Vous êtes maintenant inscrit à la newsletter des Estivales de Brou.</p>
        `
      );

      return NextResponse.json({ success: true });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    );
  }
} 