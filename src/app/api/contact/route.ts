import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const html = `
      <h2>Nouvelle Réclamation / Contact</h2>
      <p><strong>Nom:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Sujet:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `;

    const result = await sendEmail({
      to: 'daralshifaa25@gmail.com',
      subject: `[Contact Dar Al-Shifaa] ${subject}`,
      html,
    });

    if (!result.success) {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
