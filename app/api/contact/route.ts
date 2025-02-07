import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Configuration du transporteur SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const firstname = formData.get("firstname") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const postcode = formData.get("postcode") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    // Validation des données
    if (!firstname || !name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    // Vérification de la configuration SMTP
    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASSWORD ||
      !process.env.CONTACT_EMAIL
    ) {
      console.error("Configuration SMTP manquante");
      return NextResponse.json(
        { error: "Erreur de configuration du serveur mail" },
        { status: 500 }
      );
    }

    // Configuration de l'email
    const mailOptions = {
      from: process.env.SMTP_USER,
      replyTo: `${firstname} ${name} <${email}>`,
      to: process.env.CONTACT_EMAIL,
      subject: `Nouveau message de contact: ${subject}`,
      text: `
Message de: ${firstname} ${name}
Email: ${email}
Adresse: ${address || "Non renseignée"}
${city ? `Ville: ${city}` : ""}
${postcode ? `Code postal: ${postcode}` : ""}

Sujet: ${subject}

Message:
${message}
      `,
      html: `
        <h2>Nouveau message de contact</h2>
        <p><strong>Prénom:</strong> ${firstname}</p>
        <p><strong>Nom:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${address ? `<p><strong>Adresse:</strong> ${address}</p>` : ""}
        ${city ? `<p><strong>Ville:</strong> ${city}</p>` : ""}
        ${postcode ? `<p><strong>Code postal:</strong> ${postcode}</p>` : ""}
        <p><strong>Sujet:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    };

    // Envoi de l'email
    try {
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error("Erreur détaillée lors de l'envoi:", emailError);
      return NextResponse.json(
        {
          error:
            "Erreur lors de l'envoi du message. Vérifiez la configuration SMTP.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Message envoyé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors du traitement de la requête:", error);
    return NextResponse.json(
      { error: "Erreur lors du traitement de la demande" },
      { status: 500 }
    );
  }
}
