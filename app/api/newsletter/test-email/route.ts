import { sendEmail } from "@/lib/email";
import { createEmailTemplate } from "@/lib/templates/emailTemplate";
import { NextResponse } from "next/server";

interface CustomError extends Error {
  code?: string;
}

export async function GET() {
  try {
    // Log environment variables (excluding sensitive data)
    console.log("Environment check:", {
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_FROM: process.env.SMTP_FROM,
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
      JWT_SECRET: process.env.JWT_SECRET ? "set" : "not set",
      SMTP_PASSWORD: process.env.SMTP_PASSWORD ? "set" : "not set",
    });

    const result = await sendEmail(
      "your-email@example.com",
      "Test Email Configuration",
      createEmailTemplate({
        title: "Test Email",
        content:
          "<p>This is a test email to verify the newsletter configuration.</p>",
        buttonText: "Test Button",
        buttonUrl: "https://example.com",
        email: "your-email@example.com",
        isNewsletter: true,
      }),
      true
    );

    return NextResponse.json({
      success: true,
      result,
      config: {
        smtp_host: process.env.SMTP_HOST,
        smtp_port: process.env.SMTP_PORT,
        smtp_user: process.env.SMTP_USER,
        base_url: process.env.NEXT_PUBLIC_BASE_URL,
        jwt_secret: !!process.env.JWT_SECRET,
        smtp_password: !!process.env.SMTP_PASSWORD,
      },
    });
  } catch (error) {
    const customError = error as CustomError;
    console.error("Test email error:", customError);
    return NextResponse.json(
      {
        success: false,
        error: customError.message,
        stack: customError.stack,
        code: customError.code,
      },
      {
        status: 500,
      }
    );
  }
}
