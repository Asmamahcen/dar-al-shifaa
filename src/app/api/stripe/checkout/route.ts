import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

const PLAN_PRICES: Record<string, { amount: number; name: string; nameFr: string }> = {
  premium: { 
    amount: 1500, 
    name: "Premium Plan - DAR AL-SHIFAA",
    nameFr: "Plan Premium - DAR AL-SHIFAA"
  },
  professional: { 
    amount: 4500, 
    name: "Professional Plan - DAR AL-SHIFAA",
    nameFr: "Plan Professionnel - DAR AL-SHIFAA"
  },
  enterprise: { 
    amount: 7500, 
    name: "Enterprise Plan - DAR AL-SHIFAA",
    nameFr: "Plan Entreprise - DAR AL-SHIFAA"
  },
};

export async function POST(request: NextRequest) {
  try {
    let body;
    
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    
    const { planKey, email, userId } = body;

    if (!planKey || !PLAN_PRICES[planKey]) {
      return NextResponse.json(
        { error: `Plan invalide: ${planKey}` },
        { status: 400 }
      );
    }

    const plan = PLAN_PRICES[planKey];
    const origin = request.headers.get("origin") || "http://localhost:3000";

    const product = await stripe.products.create({
      name: plan.nameFr,
      description: `Abonnement mensuel ${planKey} - ${plan.amount} DA/mois`,
      metadata: { 
        plan: planKey,
        price_da: plan.amount.toString()
      },
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
        metadata: { 
          plan: planKey,
          user_id: userId || ""
        },
      },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&plan=${planKey}`,
      cancel_url: `${origin}/pricing?canceled=true`,
      metadata: { 
        plan: planKey,
        user_id: userId || "",
        amount_da: plan.amount.toString()
      },
      allow_promotion_codes: true,
    };

    if (email) {
      sessionParams.customer_email = email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ 
      url: session.url,
      sessionId: session.id 
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { error: `Erreur lors de la création de la session: ${errorMessage}` },
      { status: 500 }
    );
  }
}
