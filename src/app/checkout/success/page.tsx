"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { useAppStore } from "@/lib/store";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { language } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      setTimeout(() => setLoading(false), 1500);
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  const content = {
    fr: {
      title: "Paiement réussi!",
      subtitle: "Votre abonnement DAR AL-SHIFAA a été activé avec succès.",
      trial: "Vous bénéficiez de 60 jours d'essai gratuit.",
      dashboard: "Aller au tableau de bord",
      home: "Retour à l'accueil",
    },
    ar: {
      title: "تم الدفع بنجاح!",
      subtitle: "تم تفعيل اشتراكك في دار الشفاء بنجاح.",
      trial: "لديك 60 يومًا من التجربة المجانية.",
      dashboard: "الذهاب إلى لوحة التحكم",
      home: "العودة للرئيسية",
    },
    en: {
      title: "Payment successful!",
      subtitle: "Your DAR AL-SHIFAA subscription has been activated.",
      trial: "You have a 60-day free trial.",
      dashboard: "Go to dashboard",
      home: "Back to home",
    },
  };

  const t = content[language];

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
