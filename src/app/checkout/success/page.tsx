"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Loader2, Crown, Star, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { useAppStore } from "@/lib/store";
import { createClient } from "@/lib/supabase";

const planIcons: Record<string, React.ElementType> = {
  premium: Star,
  professional: Crown,
  enterprise: Building,
};

const planLabels: Record<string, { fr: string; ar: string; en: string }> = {
  premium: { fr: "Premium", ar: "مميز", en: "Premium" },
  professional: { fr: "Professionnel", ar: "احترافي", en: "Professional" },
  enterprise: { fr: "Entreprise", ar: "مؤسسة", en: "Enterprise" },
};

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const planKey = searchParams.get("plan") || "premium";
  const { language, user, setUser } = useAppStore();
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const updateUserPlan = async () => {
      if (sessionId && user) {
        try {
          const { error } = await supabase
            .from("users")
            .update({
              plan: planKey,
              is_approved: true,
              stripe_subscription_id: sessionId,
            })
            .eq("id", user.id);

          if (!error) {
            setUser({
              ...user,
              plan: planKey as any,
              isApproved: true,
            });
          }
        } catch (e) {
          console.error("Failed to update user plan:", e);
        }
      }
      setTimeout(() => setLoading(false), 1500);
    };

    updateUserPlan();
  }, [sessionId, user, planKey, supabase, setUser]);

  const content = {
    fr: {
      title: "Paiement réussi!",
      subtitle: "Votre abonnement DAR AL-SHIFAA a été activé avec succès.",
      trial: "Vous bénéficiez de 60 jours d'essai gratuit.",
      planActivated: "Plan activé:",
      dashboard: "Aller au tableau de bord",
      home: "Retour à l'accueil",
    },
    ar: {
      title: "تم الدفع بنجاح!",
      subtitle: "تم تفعيل اشتراكك في دار الشفاء بنجاح.",
      trial: "لديك 60 يومًا من التجربة المجانية.",
      planActivated: "الخطة المفعلة:",
      dashboard: "الذهاب إلى لوحة التحكم",
      home: "العودة للرئيسية",
    },
    en: {
      title: "Payment successful!",
      subtitle: "Your DAR AL-SHIFAA subscription has been activated.",
      trial: "You have a 60-day free trial.",
      planActivated: "Plan activated:",
      dashboard: "Go to dashboard",
      home: "Back to home",
    },
  };

  const t = content[language];
  const PlanIcon = planIcons[planKey] || Star;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-32 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center"
        >
          <CheckCircle2 className="w-12 h-12 text-white" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold mb-4"
        >
          {t.title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-muted-foreground mb-4"
        >
          {t.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-4"
        >
          <Badge className="px-4 py-2 text-base bg-gradient-to-r from-primary to-accent">
            <PlanIcon className="w-5 h-5 mr-2" />
            {t.planActivated} {planLabels[planKey]?.[language] || planKey}
          </Badge>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-primary font-medium mb-8"
        >
          {t.trial}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/dashboard">
            <Button size="lg" className="bg-gradient-to-r from-primary to-accent">
              {t.dashboard}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/">
            <Button size="lg" variant="outline">
              {t.home}
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
