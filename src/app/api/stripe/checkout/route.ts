import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PLAN_PRICES: Record<string, { amount: number; name: string }> = {
  premium: { amount: 1500, name: "Plan Premium - DAR AL-SHIFAA" },
  professional: { amount: 4500, name: "Plan Professionnel - DAR AL-SHIFAA" },
  enterprise: { amount: 7500, name: "Plan Entreprise - DAR AL-SHIFAA" },
};

export async function POST(request: NextRequest) {
  try {
    const text = await request.text();
    let body;
    
    try {
      body = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    
    const { planKey, email } = body;

    if (!planKey || !PLAN_PRICES[planKey]) {
      return NextResponse.json(
        { error: "Plan invalide" },
        { status: 400 }
      );
    }

    const plan = PLAN_PRICES[planKey];
    const origin = request.headers.get("origin") || "http://localhost:3000";

    const product = await stripe.products.create({
      name: plan.name,
      metadata: { plan: planKey },
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: plan.amount * 100,
      currency: "dzd",
      recurring: { interval: "month" },
    });

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 60,
        metadata: { plan: planKey },
      },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      metadata: { plan: planKey },
    };

    if (email) {
      sessionParams.customer_email = email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la session" },
      { status: 500 }
    );
  }
}
