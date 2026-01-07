"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  CheckCircle2,
  Star,
  Clock,
  Sparkles,
  Shield,
  Zap,
  Crown,
  Building,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { Chatbot } from "@/components/Chatbot";
import { PaymentDialog } from "@/components/PaymentDialog";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";

const plans = [
  {
    key: "free",
    nameKey: "freePlan",
    price: "0",
    period: "DA",
    icon: Sparkles,
    color: "border-border",
    gradient: "from-gray-500 to-slate-600",
    features: {
      fr: [
        "Recherche de médicaments",
        "Scan d'ordonnances (10/mois)",
        "Localisation de pharmacies",
        "Comparaison de prix",
        "Support par email",
        "Don de médicaments aux personnes dans le besoin",
      ],
      ar: [
        "البحث عن الأدوية",
        "مسح الوصفات (10/شهر)",
        "تحديد موقع الصيدليات",
        "مقارنة الأسعار",
        "دعم بالبريد الإلكتروني",
        "التبرع بالأدوية للمحتاجين",
      ],
      en: [
        "Medicine search",
        "Prescription scan (10/month)",
        "Pharmacy locator",
        "Price comparison",
        "Email support",
        "Medicine donation to those in need",
      ],
    },
    popular: false,
    isPaid: false,
  },
  {
    key: "premium",
    nameKey: "premiumPlan",
    price: "1500",
    period: "DA/mois",
    icon: Star,
    color: "border-primary",
    gradient: "from-primary to-emerald-600",
    features: {
      fr: [
        "Tous les services gratuits",
        "Scan d'ordonnances (30/mois)",
        "Rappels de prise de médicaments",
        "Conseil pharmaceutique",
        "Support prioritaire",
        "Historique des ordonnances",
      ],
      ar: [
        "جميع الخدمات المجانية",
        "مسح الوصفات (30/شهر)",
        "تذكيرات الجرعات",
        "استشارة صيدلانية",
        "دعم أولوية",
        "سجل الوصفات",
      ],
      en: [
        "All free services",
        "Prescription scan (30/month)",
        "Medication reminders",
        "Pharmaceutical advice",
        "Priority support",
        "Prescription history",
      ],
    },
    popular: true,
    isPaid: true,
  },
  {
    key: "professional",
    nameKey: "proPlan",
    price: "4500",
    period: "DA/mois",
    icon: Crown,
    color: "border-accent",
    gradient: "from-accent to-purple-600",
    features: {
      fr: [
        "Tous les services Premium",
        "API d'intégration",
        "Tableau de bord avancé",
        "Support dédié 24/7",
        "Formation + certification",
        "Offres d'emploi prioritaires dans les pharmacies",
        "Analytics avancés",
      ],
      ar: [
        "جميع خدمات المميز",
        "واجهة برمجة التطبيقات",
        "لوحة تحكم متقدمة",
        "دعم مخصص 24/7",
        "تدريب + شهادة",
        "عروض عمل أولوية في الصيدليات",
        "تحليلات متقدمة",
      ],
      en: [
        "All Premium services",
        "API integration",
        "Advanced dashboard",
        "Dedicated 24/7 support",
        "Training + certification",
        "Priority job offers in pharmacies",
        "Advanced analytics",
      ],
    },
    popular: false,
    isPaid: true,
  },
  {
    key: "enterprise",
    nameKey: "enterprisePlan",
    price: "7500",
    period: "DA/mois",
    icon: Building,
    color: "border-chart-3",
    gradient: "from-yellow-500 to-orange-600",
    features: {
      fr: [
        "Pour laboratoires pharmaceutiques",
        "Accès aux pharmacies clientes",
        "Marketing ciblé",
        "Analytics avancés",
        "API illimitée",
        "Account manager dédié",
        "Rapports personnalisés",
        "Intégration ERP",
      ],
      ar: [
        "للمختبرات الصيدلانية",
        "الوصول للصيدليات العملاء",
        "تسويق مستهدف",
        "تحليلات متقدمة",
        "API غير محدود",
        "مدير حساب مخصص",
        "تقارير مخصصة",
        "تكامل ERP",
      ],
      en: [
        "For pharmaceutical labs",
        "Access to client pharmacies",
        "Targeted marketing",
        "Advanced analytics",
        "Unlimited API",
        "Dedicated account manager",
        "Custom reports",
        "ERP integration",
      ],
    },
    popular: false,
    isPaid: true,
  },
];

export default function PricingPage() {
  const { language } = useAppStore();
  const [selectedPlan, setSelectedPlan] = useState<{ key: string; price: string } | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const handleSubscribe = (planKey: string, price: string) => {
    setSelectedPlan({ key: planKey, price });
    setIsPaymentOpen(true);
  };

  const buttonText = {
    fr: { free: "Commencer gratuitement", paid: "S'abonner - 60j gratuits" },
    ar: { free: "ابدأ مجانًا", paid: "اشترك - 60 يوم مجاني" },
    en: { free: "Start for free", paid: "Subscribe - 60 days free" },
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-chart-3/10 text-chart-3 border-chart-3/30 px-4 py-2">
            <Clock className="w-4 h-4 mr-2" />
            {t(language, "trialDays")}
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            {t(language, "pricing")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {language === "ar" 
              ? "اختر الخطة المناسبة لاحتياجاتك. جميع الخطط تشمل 60 يومًا من التجربة المجانية!"
              : language === "en"
              ? "Choose the plan that fits your needs. All plans include 60 days free trial!"
              : "Choisissez le plan adapté à vos besoins. Tous les plans incluent 60 jours d'essai gratuit!"}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`glass-card p-6 relative ${plan.color} ${plan.popular ? "border-2 scale-105 z-10" : "border"}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3">
                    <Star className="w-3 h-3 mr-1" />
                    {language === "ar" ? "الأكثر شعبية" : language === "en" ? "Most Popular" : "Plus populaire"}
                  </Badge>
                </div>
              )}

              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-4`}>
                <plan.icon className="w-7 h-7 text-white" />
              </div>

              <h3 className="text-xl font-bold mb-2">
                {t(language, plan.nameKey as keyof typeof import("@/lib/i18n").translations.en)}
              </h3>
              
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features[language].map((feature, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

                {plan.isPaid ? (
                  <Button 
                    className={`w-full ${plan.popular ? "bg-gradient-to-r from-primary to-accent hover:opacity-90" : ""}`}
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handleSubscribe(plan.key, plan.price)}
                  >
                    {buttonText[language].paid}
                  </Button>
                ) : (

                <Link href="/register">
                  <Button 
                    className="w-full"
                    variant="outline"
                  >
                    {buttonText[language].free}
                  </Button>
                </Link>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-8 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-4">
            {language === "ar" ? "ضمان استرداد الأموال" : language === "en" ? "Money Back Guarantee" : "Garantie de remboursement"}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            {language === "ar"
              ? "إذا لم تكن راضيًا عن خدماتنا خلال 30 يومًا الأولى، سنقوم برد أموالك بالكامل دون أي أسئلة."
              : language === "en"
              ? "If you're not satisfied with our services within the first 30 days, we'll refund your money in full, no questions asked."
              : "Si vous n'êtes pas satisfait de nos services dans les 30 premiers jours, nous vous remboursons intégralement, sans poser de questions."}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge variant="outline" className="px-4 py-2">
              <Zap className="w-4 h-4 mr-2 text-yellow-500" />
              {language === "ar" ? "تفعيل فوري" : language === "en" ? "Instant activation" : "Activation instantanée"}
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              <Shield className="w-4 h-4 mr-2 text-green-500" />
              {language === "ar" ? "دفع آمن" : language === "en" ? "Secure payment" : "Paiement sécurisé"}
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              <Clock className="w-4 h-4 mr-2 text-blue-500" />
              {language === "ar" ? "إلغاء في أي وقت" : language === "en" ? "Cancel anytime" : "Annulez à tout moment"}
            </Badge>
          </div>
        </motion.div>
      </div>

      <PaymentDialog 
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        planKey={selectedPlan?.key || ""}
        price={selectedPlan?.price || ""}
      />

      <Chatbot />
    </div>
  );
}
