"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/Navbar";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { toast } from "sonner";
import { useState } from "react";

export default function ContactPage() {
  const { language } = useAppStore();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
  
      const formData = new FormData(e.target as HTMLFormElement);
      const data = Object.fromEntries(formData);
      
      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data)
        });
  
        if (!response.ok) throw new Error("Failed to send message");
  
        toast.success(language === "ar" ? "تم إرسال رسالتكم بنجاح" : "Message envoyé avec succès");
        (e.target as HTMLFormElement).reset();
      } catch (error) {
        toast.error(language === "ar" ? "فشل إرسال الرسالة" : "Échec de l'envoi du message");
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold mb-4">{t(language, "contact")}</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {language === "ar" 
              ? "نحن هنا للإجابة على جميع استفساراتكم ومساعدتكم في استخدام المنصة"
              : "Nous sommes là pour répondre à toutes vos questions et vous aider à utiliser la plateforme"}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="glass-card p-8 space-y-8">
              <h2 className="text-2xl font-semibold mb-6">
                {language === "ar" ? "معلومات الاتصال" : "Informations de Contact"}
              </h2>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                  <div>
                    <h3 className="font-medium">{language === "ar" ? "البريد الإلكتروني" : "Email"}</h3>
                    <p className="text-muted-foreground">Daralshifaa25@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-medium">{language === "ar" ? "الهاتف" : "Téléphone"}</h3>
                    <p className="text-muted-foreground">0558536192</p>
                  </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{language === "ar" ? "العنوان" : "Adresse"}</h3>
                  <p className="text-muted-foreground">Constantine, Algerie</p>
                </div>
              </div>


            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
              <h2 className="text-2xl font-semibold mb-6">
                {language === "ar" ? "أرسل لنا رسالة" : "Envoyez-nous un message"}
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{language === "ar" ? "الاسم الكامل" : "Nom Complet"}</label>
                    <Input name="name" required placeholder="Ex: Ahmed Benali" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{language === "ar" ? "البريد الإلكتروني" : "Email"}</label>
                    <Input name="email" required type="email" placeholder="ahmed@example.com" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{language === "ar" ? "الموضوع" : "Sujet"}</label>
                  <Input name="subject" required placeholder={language === "ar" ? "عنوان الرسالة" : "Sujet de votre message"} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{language === "ar" ? "الرسالة" : "Message"}</label>
                  <Textarea name="message" required className="min-h-[150px]" placeholder={language === "ar" ? "كيف يمكننا مساعدتك؟" : "Comment pouvons-nous vous aider ?"} />
                </div>


              <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent" disabled={loading}>
                {loading ? (
                  <Clock className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {language === "ar" ? "إرسال الرسالة" : "Envoyer le message"}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
