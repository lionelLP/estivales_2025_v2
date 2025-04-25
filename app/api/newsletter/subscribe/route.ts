import pool from "@/lib/db/mysql";
import { sendEmail } from "@/lib/email";
import { createEmailTemplate } from "@/lib/templates/emailTemplate";
import {
  generateConfirmationToken,
  getExpirationDate,
} from "@/lib/utils/tokens";
import { NextResponse } from "next/server";

interface CustomError extends Error {
  code?: string;
  errno?: number;
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Check all required environment variables
    const requiredEnvVars = [
      "JWT_SECRET",
      "SMTP_HOST",
      "SMTP_PORT",
      "SMTP_USER",
      "SMTP_PASSWORD",
      "SMTP_FROM",
      "NEXT_PUBLIC_BASE_URL",
    ];

    const missingEnvVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    );
    if (missingEnvVars.length > 0) {
      console.error("Missing environment variables:", missingEnvVars);
      throw new Error(
        `Missing required environment variables: ${missingEnvVars.join(", ")}`
      );
    }

    const connection = await pool.getConnection();

    try {
      // Check if email already exists in Newsletter
      const [existing] = await connection.execute(
        "SELECT email FROM Newsletter WHERE email = ?",
        [email]
      );

      if (Array.isArray(existing) && existing.length > 0) {
        return NextResponse.json(
          { error: "Email déjà inscrit à la newsletter" },
          { status: 400 }
        );
      }

      // Generate confirmation token
      const confirmationToken = generateConfirmationToken();
      const expiresAt = getExpirationDate();

      // Store pending subscription
      await connection.execute(
        "INSERT INTO NewsletterPending (email, confirmation_token, created_at, expires_at) VALUES (?, ?, NOW(), ?)",
        [email, confirmationToken, expiresAt]
      );

      // Send confirmation email
      const confirmUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/newsletter/confirm/${confirmationToken}`;

      const emailResult = await sendEmail(
        email,
        "Confirmez votre inscription à la newsletter",
        createEmailTemplate({
          title: "Confirmez votre inscription",
          content: `
            <p>Pour finaliser votre inscription à la newsletter des Estivales de Brou, veuillez cliquer sur le bouton ci-dessous :</p>
            <p>Ce lien expire dans 24 heures.</p>
          `,
          buttonText: "Confirmer mon inscription",
          buttonUrl: confirmUrl,
          email,
          isNewsletter: true,
        }),
        true
      );
      console.log("Email sending result:", emailResult);

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Inner try-catch error:", error);
      const customError = error as CustomError;
      console.error("Error details:", {
        message: customError.message,
        stack: customError.stack,
        code: customError.code,
        errno: customError.errno,
      });
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    const customError = error as CustomError;
    console.error("Newsletter subscription error:", {
      message: customError.message,
      stack: customError.stack,
      code: customError.code,
      errno: customError.errno,
    });

    let errorMessage = "Erreur lors de l'inscription";
    if (
      customError.message.includes("Missing required environment variables")
    ) {
      errorMessage = "Configuration du serveur incomplète";
    } else if (customError.code === "ECONNREFUSED") {
      errorMessage = "Impossible de se connecter au serveur SMTP";
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
