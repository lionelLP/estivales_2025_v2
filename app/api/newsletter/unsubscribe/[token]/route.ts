import { NextResponse } from 'next/server';
import pool from '@/lib/db/mysql';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';

function generateUnsubscribeToken(email: string): string {
  return crypto
    .createHash('sha256')
    .update(email + process.env.JWT_SECRET)
    .digest('hex');
}

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  const connection = await pool.getConnection();
  
  try {
    const [subscribers] = await connection.execute(
      'SELECT email FROM Newsletter WHERE SHA2(CONCAT(email, ?), 256) = ?',
      [process.env.JWT_SECRET, params.token]
    );

    if (!Array.isArray(subscribers) || subscribers.length === 0) {
      return new Response(
        `<!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Lien invalide - Les Estivales de Brou</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gradient-to-br from-rose-50 to-rose-100 min-h-screen flex items-center justify-center p-4">
            <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                <h1 class="text-2xl font-bold text-gray-900 mb-4">Lien invalide</h1>
                <p class="text-gray-600 mb-8">Ce lien de désabonnement n'est pas valide.</p>
                <a href="/" class="inline-block bg-rose-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-rose-700 transition-colors">
                    Retour à l'accueil
                </a>
            </div>
        </body>
        </html>`,
        {
          status: 400,
          headers: { 'Content-Type': 'text/html' },
        }
      );
    }

    const email = subscribers[0].email;
    await connection.execute(
      'DELETE FROM Newsletter WHERE email = ?',
      [email]
    );

    return new Response(
      `<!DOCTYPE html>
      <html lang="fr">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Désabonnement confirmé - Les Estivales de Brou</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <script src="https://cdn.tailwindcss.com"></script>
          <meta http-equiv="refresh" content="5;url=/">
      </head>
      <body class="bg-gradient-to-br from-rose-50 to-rose-100 min-h-screen flex items-center justify-center p-4">
          <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
              <div class="mb-6">
                  <svg class="w-16 h-16 text-rose-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
              </div>
              <h1 class="text-2xl font-bold text-gray-900 mb-4">Désabonnement confirmé</h1>
              <p class="text-gray-600 mb-8">Vous ne recevrez plus nos newsletters.</p>
              <a href="/" class="inline-block bg-rose-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-rose-700 transition-colors">
                  Retour à l'accueil
              </a>
          </div>
      </body>
      </html>`,
      {
        headers: { 'Content-Type': 'text/html' },
      }
    );
  } finally {
    connection.release();
  }
} 