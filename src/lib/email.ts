import { Resend } from 'resend';

// Resend est gratuit jusqu'à 3 000 emails/mois.
// NOTE: Sans domaine vérifié, vous ne pouvez envoyer des emails qu'à l'adresse 
// utilisée pour créer votre compte Resend (ex: daralshifaa25@gmail.com).
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
  from = 'Dar Al-Shifaa <onboarding@resend.dev>',
}: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}) {
  try {
    // Si on est en mode "gratuit sans domaine", on s'assure que l'email part quand même
    // vers l'admin pour les réclamations ou les alertes critiques.
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Email error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email exception:', error);
    return { success: false, error };
  }
}
