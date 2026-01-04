"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Pill,
  Search,
  MapPin,
  Truck,
  GraduationCap,
  CreditCard,
  Shield,
  Users,
  Building2,
  Factory,
  Stethoscope,
  ScanLine,
  Bot,
  Clock,
  CheckCircle2,
  ArrowRight,
  Star,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { PaymentDialog } from "@/components/PaymentDialog";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";

const features = [
  { icon: Bot, key: "chatbot", color: "from-green-500 to-emerald-600" },
  { icon: ScanLine, key: "scanPrescription", color: "from-blue-500 to-cyan-600" },
  { icon: MapPin, key: "nearbyPharmacies", color: "from-purple-500 to-violet-600" },
  { icon: Truck, key: "delivery", color: "from-orange-500 to-amber-600" },
  { icon: GraduationCap, key: "training", color: "from-pink-500 to-rose-600" },
  { icon: Shield, key: "chifa", color: "from-teal-500 to-cyan-600" },
];

const plans = [
  {
    key: "free",
    name: "freePlan",
    price: "0",
    period: "DA",
    features: [
      "Recherche de médicaments",
      "Scan d'ordonnances (10/mois)",
      "Localisation de pharmacies",
      "Comparaison de prix",
      "Support par email",
      "Don de médicaments",
    ],
    featuresAr: [
      "البحث عن الأدوية",
      "مسح الوصفات (10/شهر)",
      "تحديد موقع الصيدليات",
      "مقارنة الأسعار",
      "دعم بالبريد الإلكتروني",
      "التبرع بالأدوية",
    ],
    popular: false,
    color: "border-border",
    isPaid: false,
  },
  {
    key: "premium",
    name: "premiumPlan",
    price: "1500",
    period: "DA/mois",
    features: [
      "Tous les services gratuits",
      "Scan d'ordonnances (300/mois)",
      "Rappels de prise",
      "Conseil pharmaceutique",
      "Support prioritaire",
    ],
    featuresAr: [
      "جميع الخدمات المجانية",
      "مسح الوصفات (300/شهر)",
      "تذكيرات الجرعات",
      "استشارة صيدلانية",
      "دعم أولوية",
    ],
    popular: true,
    color: "border-primary",
    isPaid: true,
  },
  {
    key: "professional",
    name: "proPlan",
    price: "4500",
    period: "DA/mois",
    features: [
      "Tous les services Premium",
      "API d'intégration",
      "Tableau de bord avancé",
      "Support dédié",
      "Formation + certification",
      "Offres d'emploi prioritaires",
    ],
    featuresAr: [
      "جميع خدمات المميز",
      "واجهة برمجة التطبيقات",
      "لوحة تحكم متقدمة",
      "دعم مخصص",
      "تدريب + شهادة",
      "عروض عمل أولوية",
    ],
    popular: false,
    color: "border-accent",
    isPaid: true,
  },
  {
    key: "enterprise",
    name: "enterprisePlan",
    price: "7500",
    period: "DA/mois",
    features: [
      "Pour laboratoires",
      "Accès aux pharmacies clientes",
      "Marketing ciblé",
      "Analytics avancés",
      "API illimitée",
      "Account manager dédié",
    ],
    featuresAr: [
      "للمختبرات",
      "الوصول للصيدليات العملاء",
      "تسويق مستهدف",
      "تحليلات متقدمة",
      "API غير محدود",
      "مدير حساب مخصص",
    ],
    popular: false,
    color: "border-chart-3",
    isPaid: true,
  },
];

const roles = [
  { icon: Users, name: "patient", desc: "Recherchez, commandez, suivez" },
  { icon: Stethoscope, name: "doctor", desc: "Ordonnances, historique patient" },
  { icon: Building2, name: "pharmacy", desc: "Gérez stock, commandes, CHIFA" },
  { icon: GraduationCap, name: "school", desc: "Formations, certifications" },
  { icon: Factory, name: "factory", desc: "Catalogue, clients pharmacies" },
  { icon: Shield, name: "creator", desc: "Administration complète" },
];

export default function HomePage() {
  const { language } = useAppStore();
  const [selectedPlan, setSelectedPlan] = useState<{ key: string; price: string } | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const handleSubscribe = (planKey: string, price: string) => {
    setSelectedPlan({ key: planKey, price });
    setIsPaymentOpen(true);
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="relative min-h-screen flex items-center justify-center pt-16 hero-pattern overflow-hidden">
        <div className="absolute inset-0 mesh-gradient" />
        
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "-3s" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 px-4 py-2 text-sm bg-primary/10 border-primary/30 text-primary">
              <Sparkles className="w-4 h-4 mr-2" />
              {t(language, "trialDays")}
            </Badge>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6">
              <span className="gradient-text">{t(language, "appName")}</span>
            </h1>

            <p className="text-xl sm:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              {t(language, "heroSubtitle")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-8">
                  {t(language, "getStarted")}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/medicines">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8">
                  <Search className="mr-2 w-5 h-5" />
                  {t(language, "searchMedicines")}
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
          >
            {features.map((feature, i) => (
              <motion.div
                key={feature.key}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 * i }}
                className="glass-card p-4 text-center hover:scale-105 transition-transform cursor-pointer"
              >
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium">{t(language, feature.key as keyof typeof import("@/lib/i18n").translations.en)}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {language === "ar" ? "حساب لكل احتياج" : language === "en" ? "An Account for Every Need" : "Un compte pour chaque besoin"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {language === "ar" 
                ? "سواء كنت مريضًا أو طبيبًا أو صيدليًا، لدينا الحل المناسب لك"
                : language === "en"
                ? "Whether you're a patient, doctor, or pharmacist, we have the right solution for you"
                : "Que vous soyez patient, médecin ou pharmacien, nous avons la solution adaptée"}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {roles.map((role, i) => (
              <motion.div
                key={role.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 text-center group hover:border-primary/50 transition-colors cursor-pointer"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:from-primary group-hover:to-accent transition-colors">
                  <role.icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="font-semibold mb-1">{t(language, role.name as keyof typeof import("@/lib/i18n").translations.en)}</h3>
                <p className="text-xs text-muted-foreground">{role.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-chart-3/10 text-chart-3 border-chart-3/30">
              <Clock className="w-4 h-4 mr-2" />
              {t(language, "trialDays")}
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t(language, "pricing")}</h2>
            <p className="text-muted-foreground">
              {language === "ar" 
                ? "اختر الخطة المناسبة لاحتياجاتك"
                : language === "en"
                ? "Choose the plan that fits your needs"
                : "Choisissez le plan adapté à vos besoins"}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`glass-card p-6 relative ${plan.color} ${plan.popular ? "border-2 scale-105" : "border"}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      <Star className="w-3 h-3 mr-1" />
                      {language === "ar" ? "الأكثر شعبية" : language === "en" ? "Most Popular" : "Plus populaire"}
                    </Badge>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2">
                    {t(language, plan.name as keyof typeof import("@/lib/i18n").translations.en)}
                  </h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {(language === "ar" ? plan.featuresAr : plan.features).map((feature, j) => (
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
                    {t(language, "startTrial")}
                  </Button>
                ) : (
                  <Link href="/register">
                    <Button 
                      className="w-full"
                      variant="outline"
                    >
                      {t(language, "startTrial")}
                    </Button>
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8 sm:p-12 text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Shield className="w-10 h-10 text-primary-foreground" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              {language === "ar" ? "تكامل كامل مع نظام الشفاء و CNAS" : language === "en" ? "Full CHIFA & CNAS Integration" : "Intégration complète CHIFA & CNAS"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              {language === "ar"
                ? "تعامل مباشر مع بطاقة الشفاء، حساب تلقائي لحصة المؤمن، إنشاء فواتير وسندات للتعويض"
                : language === "en"
                ? "Direct CHIFA card interaction, automatic calculation of insured share, generation of reimbursement documents"
                : "Interaction directe avec la carte CHIFA, calcul automatique de la quote-part assuré, génération de documents de remboursement"}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="outline" className="px-4 py-2">
                <Pill className="w-4 h-4 mr-2" />
                {language === "ar" ? "إدارة المخزون" : language === "en" ? "Stock Management" : "Gestion de stock"}
              </Badge>
              <Badge variant="outline" className="px-4 py-2">
                <CreditCard className="w-4 h-4 mr-2" />
                {language === "ar" ? "المعاملات الآمنة" : language === "en" ? "Secure Transactions" : "Transactions sécurisées"}
              </Badge>
              <Badge variant="outline" className="px-4 py-2">
                <ScanLine className="w-4 h-4 mr-2" />
                {language === "ar" ? "مسح الباركود" : language === "en" ? "Barcode Scanning" : "Scan code-barre"}
              </Badge>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center mb-4">
                <img src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/image-1766707620528.png?width=8000&height=8000&resize=contain" alt="Logo" className="h-24 w-auto" />
              </div>
              <p className="text-sm text-muted-foreground">{t(language, "tagline")}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t(language, "features")}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/medicines" className="hover:text-foreground transition-colors">{t(language, "medicines")}</Link></li>
                <li><Link href="/pharmacies" className="hover:text-foreground transition-colors">{t(language, "pharmacies")}</Link></li>
                <li><Link href="/training" className="hover:text-foreground transition-colors">{t(language, "training")}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t(language, "about")}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/pricing" className="hover:text-foreground transition-colors">{t(language, "pricing")}</Link></li>
                <li><Link href="/contact" className="hover:text-foreground transition-colors">{t(language, "contact")}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t(language, "contact")}</h4>
              <p className="text-sm text-muted-foreground">Daralshifaa25@gmail.com</p>
              <p className="text-sm text-muted-foreground">0558536192</p>
              <p className="text-sm text-muted-foreground">Constantine, Algerie</p>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            © 2024 DAR AL-SHIFAA. {language === "ar" ? "جميع الحقوق محفوظة" : language === "en" ? "All rights reserved" : "Tous droits réservés"}.
          </div>
        </div>
      </footer>

      <PaymentDialog 
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        planKey={selectedPlan?.key || ""}
        price={selectedPlan?.price || ""}
      />
    </div>
  );
}
