import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const PLANS = {
  free: {
    name: "Plan Gratuit",
    nameAr: "الخطة المجانية",
    nameEn: "Free Plan",
    price: 0,
    priceId: null,
  },
  premium: {
    name: "Plan Premium",
    nameAr: "الخطة المميزة",
    nameEn: "Premium Plan",
    price: 1500,
    priceId: "", // Will be set after product creation
  },
  professional: {
    name: "Plan Professionnel",
    nameAr: "الخطة الاحترافية",
    nameEn: "Professional Plan",
    price: 4500,
    priceId: "",
  },
  enterprise: {
    name: "Plan Entreprise",
    nameAr: "خطة المؤسسات",
    nameEn: "Enterprise Plan",
    price: 7500,
    priceId: "",
  },
};