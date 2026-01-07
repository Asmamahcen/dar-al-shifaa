import { NextResponse } from 'next/server';
import { createClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { sendEmail } from '@/lib/email';
import { t } from '@/lib/i18n';

export async function GET(req: Request) {
  // This route should ideally be protected by an API key for cron jobs
  const authHeader = req.headers.get('authorization');
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: {} }
  );

  try {
    // 1. Fetch all non-free users/pharmacies
    const { data: owners, error: ownersError } = await supabase
      .from('users')
      .select('id, email, full_name, role, plan, pharmacy_id, factory_id')
      .neq('plan', 'free');

    if (ownersError) throw ownersError;

    const results = [];

    for (const owner of owners) {
      const alerts = [];

      // Check Pharmacy Inventory
      if (owner.role === 'pharmacy' && owner.pharmacy_id) {
        const { data: meds } = await supabase
          .from('medicines')
          .select('*')
          .eq('pharmacy_id', owner.pharmacy_id);

        if (meds) {
          const today = new Date();
          const thirtyDaysFromNow = new Date();
          thirtyDaysFromNow.setDate(today.getDate() + 30);

          for (const med of meds) {
            // Low Stock check
            if (med.quantity <= 5) {
              alerts.push(`⚠️ <strong>Stock Bas:</strong> ${med.name} (${med.quantity} restants)`);
            }

            // Expiry check
            const expiry = new Date(med.expiry_date);
            if (expiry <= thirtyDaysFromNow) {
              alerts.push(`⏰ <strong>Expiration Proche:</strong> ${med.name} (Expire le ${med.expiry_date})`);
            }
          }
        }
      }

      // Check Factory Inventory
      if (owner.role === 'factory' && owner.factory_id) {
        const { data: meds } = await supabase
          .from('factory_inventory')
          .select('*')
          .eq('factory_id', owner.factory_id);

        if (meds) {
          const today = new Date();
          const thirtyDaysFromNow = new Date();
          thirtyDaysFromNow.setDate(today.getDate() + 30);

          for (const med of meds) {
            if (med.quantity <= 50) { // Factory threshold higher
              alerts.push(`⚠️ <strong>Stock Bas:</strong> ${med.medicine_name} (${med.quantity} restants)`);
            }

            const expiry = new Date(med.expiry_date);
            if (expiry <= thirtyDaysFromNow) {
              alerts.push(`⏰ <strong>Expiration Proche:</strong> ${med.medicine_name} (Expire le ${med.expiry_date})`);
            }
          }
        }
      }

      if (alerts.length > 0) {
        const html = `
          <h2>Alertes de Stock et d'Expiration - Dar Al-Shifaa</h2>
          <p>Bonjour ${owner.full_name},</p>
          <p>Voici les alertes pour votre établissement :</p>
          <ul>
            ${alerts.map(a => `<li>${a}</li>`).join('')}
          </ul>
          <p>Connectez-vous à votre tableau de bord pour gérer votre inventaire.</p>
        `;

        await sendEmail({
          to: owner.email,
          subject: `[Alerte Dar Al-Shifaa] Stock et Expiration`,
          html,
        });

        results.push({ email: owner.email, alertsCount: alerts.length });
      }
    }

    return NextResponse.json({ success: true, processed: results });
  } catch (error: any) {
    console.error('Alerts check error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
