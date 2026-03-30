import { createEmailTemplate } from "./emailTemplate";

export function createEventNotificationEmail(
  event: {
    title: string;
    subtitle?: string;
    description: string;
    event_date: string;
    address: string;
    location: string;
    booking_link?: string;
    id: number;
  },
  recipientEmail: string
) {
  const eventDate = new Date(event.event_date).toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const bookingSection = event.booking_link
    ? `<p style="margin-top: 20px;">Réservez dès maintenant votre place :</p>`
    : "";

  const eventDetailsLink = `${process.env.NEXT_PUBLIC_BASE_URL}/events/${event.id}`;

  return createEmailTemplate({
    title: "Nouvel événement : " + event.title,
    content: `
      <p>Un nouvel événement vient d'être ajouté aux Estivales de Brou !</p>
      
      <div style="margin: 20px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
        <h2 style="margin: 0 0 15px; color: #1f2937;">${event.title}</h2>
        ${
          event.subtitle
            ? `<h3 style="margin: 0 0 15px; color: #4b5563;">${event.subtitle}</h3>`
            : ""
        }
        <p style="margin: 10px 0;"><strong>Date :</strong> ${eventDate}</p>
        <p style="margin: 10px 0;"><strong>Lieu :</strong> ${
          event.location ? `${event.location}, ` : ""
        }${event.address}</p>
        <p style="margin: 15px 0;">${event.description}</p>
      </div>
      
      ${bookingSection}
      
      <p style="margin-top: 20px;">
        <a href="${eventDetailsLink}" 
           style="color: #E11D48; text-decoration: underline;">
          Voir les détails complets de l'événement
        </a>
      </p>
    `,
    buttonText: event.booking_link ? "Réserver" : undefined,
    buttonUrl: event.booking_link,
    email: recipientEmail,
    isNewsletter: true,
  });
}
