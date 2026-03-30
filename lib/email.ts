import crypto from "crypto";
import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

interface EmailHeaders {
  [key: string]: string | string[] | { prepared: boolean; value: string };
}

function generateUnsubscribeToken(email: string): string {
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not set in environment variables");
    throw new Error("JWT_SECRET is required for newsletter functionality");
  }

  return crypto
    .createHash("sha256")
    .update(email + process.env.JWT_SECRET)
    .digest("hex");
}

const isMailhog = process.env.SMTP_HOST === "mailhog";

const transportOptions: SMTPTransport.Options = {
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: isMailhog
      ? undefined
      : {
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASS || "",
      },
} as any;

const transporter = nodemailer.createTransport(transportOptions);

export async function sendEmail(
    to: string,
    subject: string,
    html: string,
    isNewsletter: boolean = false
) {
  try {
    const headers: EmailHeaders = {};
    if (isNewsletter) {
      const unsubscribeUrl = `${
          process.env.NEXT_PUBLIC_BASE_URL
      }/api/newsletter/unsubscribe/${generateUnsubscribeToken(to)}`;
      headers["List-Unsubscribe"] = `<${unsubscribeUrl}>`;
      headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
    }

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@estivales.com',
      to,
      subject,
      html,
      headers: headers as any, // Ajouté ici pour que tes headers servent à quelque chose !
    });

    console.log('Email envoyé:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Erreur envoi email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}