import pool from "@/lib/db/mysql";
import { sendEmail } from "@/lib/email";
import { createEmailTemplate } from "@/lib/templates/emailTemplate";
import { RowDataPacket } from "mysql2";

interface PendingNewsletter extends RowDataPacket {
  email: string;
  confirmation_token: string;
  expires_at: Date;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const resolvedParams = await params;
  const connection = await pool.getConnection();

  try {
    const [pending] = await connection.execute<PendingNewsletter[]>(
      "SELECT * FROM NewsletterPending WHERE confirmation_token = ? AND expires_at > NOW()",
      [resolvedParams.token]
    );

    if (!Array.isArray(pending) || pending.length === 0) {
      return new Response(
        `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Confirmation échouée - Les Estivales de Brou</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gradient-to-br from-rose-50 to-rose-100 min-h-screen flex items-center justify-center p-4">
            <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                <div class="mb-6">
                    <svg class="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>
                </div>
                <h1 class="text-2xl font-bold text-gray-900 mb-4">Lien invalide ou expiré</h1>
                <p class="text-gray-600 mb-8">Le lien de confirmation n'est plus valide ou a expiré. Veuillez vous réinscrire à la newsletter.</p>
                <a href="/" class="inline-block bg-rose-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-rose-700 transition-colors">
                    Retour à l'accueil
                </a>
            </div>
        </body>
        </html>
        `,
        {
          status: 400,
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    const pendingSubscription = pending[0];
    await connection.beginTransaction();

    try {
      await connection.execute(
        "INSERT INTO Newsletter (email, subscribed_at) VALUES (?, NOW())",
        [pendingSubscription.email]
      );

      await connection.execute(
        "DELETE FROM NewsletterPending WHERE confirmation_token = ?",
        [resolvedParams.token]
      );

      await connection.commit();

      await sendEmail(
        pendingSubscription.email,
        "Bienvenue dans notre newsletter !",
        createEmailTemplate({
          title: "Bienvenue dans notre newsletter !",
          content: `
            <p>Votre inscription à la newsletter des Estivales de Brou a été confirmée avec succès.</p>
            <p>Vous recevrez désormais nos actualités et informations importantes directement dans votre boîte mail.</p>
            <p>Merci de votre confiance !</p>
          `,
          email: pendingSubscription.email,
          isNewsletter: true,
        })
      );

      return new Response(
        `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Inscription confirmée - Les Estivales de Brou</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
            <script src="https://cdn.tailwindcss.com"></script>
            <meta http-equiv="refresh" content="5;url=/">
        </head>
        <body class="bg-gradient-to-br from-rose-50 to-rose-100 min-h-screen flex items-center justify-center p-4">
            <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                <div class="mb-6">
                    <svg class="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                </div>
                <h1 class="text-2xl font-bold text-gray-900 mb-4">Inscription confirmée !</h1>
                <p class="text-gray-600 mb-2">Merci de vous être inscrit à notre newsletter.</p>
                <p class="text-gray-500 text-sm mb-8">Vous allez être redirigé vers la page d'accueil dans quelques secondes...</p>
                <div class="relative">
                    <div class="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div class="h-full bg-rose-600 rounded-full animate-[progress_5s_linear]"></div>
                    </div>
                </div>
                <a href="/" class="inline-block mt-6 text-rose-600 hover:text-rose-700 font-medium transition-colors">
                    Retour immédiat à l'accueil →
                </a>
            </div>
            <style>
                @keyframes progress {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            </style>
        </body>
        </html>
        `,
        {
          headers: { "Content-Type": "text/html" },
        }
      );
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } finally {
    connection.release();
  }
}
