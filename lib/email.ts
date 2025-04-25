import crypto from "crypto";
import nodemailer from "nodemailer";

interface EmailHeaders {
  [key: string]: string | string[] | { prepared: boolean; value: string };
}

interface NodemailerError extends Error {
  code?: string;
  command?: string;
  response?: string;
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

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  isNewsletter = false
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
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
      headers,
    });

    return { success: true, messageId: info.messageId };
  } catch (error: unknown) {
    const mailerError = error as NodemailerError;
    console.error("Detailed email error:", {
      error: error instanceof Error ? error.message : String(error),
      code: mailerError.code,
      command: mailerError.command,
      response: mailerError.response,
    });
    return { success: false, error: String(error) };
  }
}
