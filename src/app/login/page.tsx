"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/Navbar";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const { language, setUser, user, isHydrated } = useAppStore();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  useEffect(() => {
    if (isHydrated && user) {
      router.push("/dashboard");
    }
  }, [user, isHydrated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        toast.error(language === "ar" ? "بيانات غير صحيحة" : language === "en" ? "Invalid credentials" : "Identifiants incorrects");
        setLoading(false);
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      if (userError || !userData) {
        toast.error(language === "ar" ? "خطأ في تحميل البيانات" : language === "en" ? "Error loading user data" : "Erreur de chargement des données");
        setLoading(false);
        return;
      }

        setUser({
          id: userData.id,
          email: userData.email,
          fullName: userData.full_name,
          phone: userData.phone || "",
          role: userData.role,
          plan: userData.plan || "free",
          wilaya: userData.wilaya || "",
          city: userData.city || "",
          address: userData.address || "",
          verified: userData.verified || false,
          isApproved: userData.is_approved || false,
          pharmacyId: userData.pharmacy_id,
          createdAt: userData.created_at,
        });

      toast.success(language === "ar" ? "تم تسجيل الدخول بنجاح" : language === "en" ? "Login successful" : "Connexion réussie");
      router.push("/dashboard");
    } catch {
      toast.error(language === "ar" ? "حدث خطأ" : language === "en" ? "An error occurred" : "Une erreur s'est produite");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="min-h-screen flex items-center justify-center pt-16 px-4 hero-pattern">
        <div className="absolute inset-0 mesh-gradient" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="glass-card p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-foreground">د</span>
              </div>
              <h1 className="text-2xl font-bold mb-2">{t(language, "login")}</h1>
              <p className="text-muted-foreground text-sm">
                {language === "ar" ? "مرحبًا بعودتك" : language === "en" ? "Welcome back" : "Content de vous revoir"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t(language, "email")}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t(language, "password")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {t(language, "login")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                {language === "ar" ? "ليس لديك حساب؟" : language === "en" ? "Don't have an account?" : "Pas encore de compte?"}{" "}
              </span>
              <Link href="/register" className="text-primary hover:underline font-medium">
                {t(language, "register")}
              </Link>
            </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }
