import { generateUnsubscribeToken } from '@/lib/utils/tokens';

interface EmailTemplateProps {
  title: string;
  content: string;
  buttonText?: string;
  buttonUrl?: string;
  email?: string;
  isNewsletter?: boolean;
}

export function createEmailTemplate({
  title,
  content,
  buttonText,
  buttonUrl,
  email,
  isNewsletter = false
}: EmailTemplateProps): string {
  const unsubscribeUrl = email && isNewsletter 
    ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/newsletter/unsubscribe/${generateUnsubscribeToken(email)}`
    : null;

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Inter', sans-serif; background-color: #f3f4f6;">
      <table role="presentation" style="width: 100%; border: none; border-spacing: 0;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; border: none; border-spacing: 0; background-color: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header with logo -->
              <tr>
                <td style="padding: 30px 40px; text-align: center; background-color: #E11D48; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">
                    Les Estivales de Brou
                  </h1>
                </td>
              </tr>
              
              <!-- Main content -->
              <tr>
                <td style="padding: 40px;">
                  <h1 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">
                    ${title}
                  </h1>
                  <div style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                    ${content}
                  </div>
                  ${buttonText && buttonUrl ? `
                    <div style="text-align: center; margin-top: 30px;">
                      <a href="${buttonUrl}" 
                         style="display: inline-block; padding: 12px 24px; background-color: #E11D48; color: white; text-decoration: none; border-radius: 6px; font-weight: 500; transition: background-color 0.2s;">
                        ${buttonText}
                      </a>
                    </div>
                  ` : ''}
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px;">
                  <table role="presentation" style="width: 100%; border: none; border-spacing: 0;">
                    <tr>
                      <td style="text-align: center; color: #6b7280; font-size: 14px;">
                        <p style="margin: 0 0 10px;">Les Estivales de Brou</p>
                        <p style="margin: 0;">13 avenue Alsace Lorraine, 01000 Bourg en Bresse</p>
                        ${unsubscribeUrl ? `
                          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                              Pour vous désabonner de notre newsletter, 
                              <a href="${unsubscribeUrl}" 
                                 style="color: #6b7280; text-decoration: underline;"
                                 title="Se désabonner">cliquez ici</a>
                            </p>
                          </div>
                        ` : ''}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
} 