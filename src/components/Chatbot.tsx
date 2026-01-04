"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  Pill,
  Stethoscope,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppStore, type ChatMessage } from "@/lib/store";
import { t } from "@/lib/i18n";

const pharmaceuticalKnowledge = {
  symptoms: {
    "mal de tête": {
      ar: "صداع",
      en: "headache",
      medicines: ["Paracétamol 500mg", "Ibuprofène 400mg"],
      advice: "Reposez-vous dans un endroit calme et sombre. Hydratez-vous bien.",
      adviceAr: "استرح في مكان هادئ ومظلم. اشرب الكثير من الماء.",
    },
    "fièvre": {
      ar: "حمى",
      en: "fever",
      medicines: ["Paracétamol 500mg", "Aspirine 500mg"],
      advice: "Restez hydraté, reposez-vous. Consultez un médecin si la fièvre persiste plus de 3 jours.",
      adviceAr: "حافظ على الترطيب، واسترح. استشر طبيبًا إذا استمرت الحمى أكثر من 3 أيام.",
    },
    "toux": {
      ar: "سعال",
      en: "cough",
      medicines: ["Sirop antitussif", "Miel et citron"],
      advice: "Évitez les irritants, buvez des boissons chaudes.",
      adviceAr: "تجنب المهيجات، اشرب المشروبات الساخنة.",
    },
    "douleur estomac": {
      ar: "ألم المعدة",
      en: "stomach pain",
      medicines: ["Oméprazole 20mg", "Antiacides"],
      advice: "Évitez les aliments épicés et gras. Mangez des repas légers.",
      adviceAr: "تجنب الأطعمة الحارة والدهنية. تناول وجبات خفيفة.",
    },
    "allergie": {
      ar: "حساسية",
      en: "allergy",
      medicines: ["Cétirizine 10mg", "Loratadine 10mg"],
      advice: "Évitez l'allergène si identifié. Consultez un allergologue.",
      adviceAr: "تجنب المسبب إذا تم تحديده. استشر طبيب حساسية.",
    },
    "grippe": {
      ar: "انفلونزا",
      en: "flu",
      medicines: ["Paracétamol", "Vitamine C", "Zinc"],
      advice: "Repos complet, hydratation, alimentation équilibrée.",
      adviceAr: "راحة تامة، ترطيب، تغذية متوازنة.",
    },
    "دواء": {
      medicines: ["Consultez la pharmacie la plus proche"],
      advice: "يرجى زيارة الصيدلية القريبة للحصول على الدواء المناسب",
      adviceAr: "يرجى زيارة الصيدلية القريبة للحصول على الدواء المناسب",
    },
  },
  greetings: ["bonjour", "salut", "hello", "hi", "مرحبا", "السلام", "سلام"],
  thanks: ["merci", "شكرا", "thank"],
};

function generateResponse(message: string, lang: string): string {
  const lowerMsg = message.toLowerCase();

  if (pharmaceuticalKnowledge.greetings.some((g) => lowerMsg.includes(g))) {
    if (lang === "ar") {
      return "مرحباً بك في دار الشفاء! 👋\n\nأنا مساعدك الصيدلاني الذكي. كيف يمكنني مساعدتك اليوم؟\n\n🔹 وصف الأعراض للحصول على توصيات\n🔹 البحث عن صيدلية قريبة\n🔹 معلومات عن الأدوية";
    }
    if (lang === "en") {
      return "Welcome to DAR AL-SHIFAA! 👋\n\nI'm your intelligent pharmaceutical assistant. How can I help you today?\n\n🔹 Describe symptoms for recommendations\n🔹 Find nearby pharmacies\n🔹 Medicine information";
    }
    return "Bienvenue sur DAR AL-SHIFAA! 👋\n\nJe suis votre assistant pharmaceutique intelligent. Comment puis-je vous aider aujourd'hui?\n\n🔹 Décrivez vos symptômes pour des recommandations\n🔹 Trouver une pharmacie proche\n🔹 Informations sur les médicaments";
  }

  if (pharmaceuticalKnowledge.thanks.some((t) => lowerMsg.includes(t))) {
    if (lang === "ar") return "على الرحب والسعة! لا تتردد في السؤال إذا احتجت مساعدة أخرى. 🌟";
    if (lang === "en") return "You're welcome! Don't hesitate to ask if you need more help. 🌟";
    return "Je vous en prie! N'hésitez pas si vous avez d'autres questions. 🌟";
  }

  for (const [symptom, data] of Object.entries(pharmaceuticalKnowledge.symptoms)) {
    if (lowerMsg.includes(symptom) || (data.ar && lowerMsg.includes(data.ar)) || (data.en && lowerMsg.includes(data.en))) {
      const medicines = data.medicines.join("\n• ");
      const advice = lang === "ar" ? data.adviceAr : data.advice;

      if (lang === "ar") {
        return `🏥 **تحليل الأعراض**\n\nبناءً على وصفك، إليك توصياتي:\n\n💊 **الأدوية المقترحة:**\n• ${medicines}\n\n📋 **نصائح:**\n${advice}\n\n⚠️ **تنبيه:** هذه توصيات عامة. يرجى استشارة طبيب أو صيدلي للحصول على تشخيص دقيق.`;
      }
      if (lang === "en") {
        return `🏥 **Symptom Analysis**\n\nBased on your description, here are my recommendations:\n\n💊 **Suggested Medicines:**\n• ${medicines}\n\n📋 **Advice:**\n${advice}\n\n⚠️ **Warning:** These are general recommendations. Please consult a doctor or pharmacist for accurate diagnosis.`;
      }
      return `🏥 **Analyse des symptômes**\n\nD'après votre description, voici mes recommandations:\n\n💊 **Médicaments suggérés:**\n• ${medicines}\n\n📋 **Conseils:**\n${advice}\n\n⚠️ **Attention:** Ce sont des recommandations générales. Veuillez consulter un médecin ou pharmacien pour un diagnostic précis.`;
    }
  }

  if (lowerMsg.includes("pharmacie") || lowerMsg.includes("صيدلية") || lowerMsg.includes("pharmacy")) {
    if (lang === "ar") {
      return "🗺️ **البحث عن صيدلية**\n\nيمكنك العثور على الصيدليات القريبة منك من خلال:\n\n1. الذهاب إلى صفحة 'الصيدليات'\n2. تفعيل الموقع الجغرافي\n3. عرض الصيدليات على الخريطة\n\n💡 يمكنك أيضًا البحث عن دواء معين ومعرفة الصيدليات التي تتوفر عليه!";
    }
    if (lang === "en") {
      return "🗺️ **Find a Pharmacy**\n\nYou can find nearby pharmacies by:\n\n1. Going to the 'Pharmacies' page\n2. Enabling location services\n3. Viewing pharmacies on the map\n\n💡 You can also search for a specific medicine and see which pharmacies have it in stock!";
    }
    return "🗺️ **Trouver une pharmacie**\n\nVous pouvez trouver les pharmacies proches en:\n\n1. Allant sur la page 'Pharmacies'\n2. Activant la géolocalisation\n3. Consultant la carte des pharmacies\n\n💡 Vous pouvez aussi rechercher un médicament spécifique et voir quelles pharmacies l'ont en stock!";
  }

  if (lang === "ar") {
    return "🤔 أنا هنا لمساعدتك في:\n\n• وصف أعراضك (صداع، حمى، سعال...)\n• البحث عن صيدلية قريبة\n• معلومات عن الأدوية\n• نصائح صحية عامة\n\nكيف يمكنني مساعدتك؟";
  }
  if (lang === "en") {
    return "🤔 I'm here to help you with:\n\n• Describing your symptoms (headache, fever, cough...)\n• Finding nearby pharmacies\n• Medicine information\n• General health advice\n\nHow can I help you?";
  }
  return "🤔 Je suis là pour vous aider avec:\n\n• La description de vos symptômes (mal de tête, fièvre, toux...)\n• La recherche de pharmacies proches\n• Les informations sur les médicaments\n• Des conseils de santé généraux\n\nComment puis-je vous aider?";
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { language, chatMessages, addChatMessage, clearChat } = useAppStore();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };
    addChatMessage(userMessage);
    setInput("");
    setIsTyping(true);

    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

    const response = generateResponse(input.trim(), language);
    const assistantMessage: ChatMessage = {
      id: `msg-${Date.now() + 1}`,
      role: "assistant",
      content: response,
      timestamp: new Date().toISOString(),
    };
    addChatMessage(assistantMessage);
    setIsTyping(false);
  };

  const quickActions = [
    { icon: Pill, label: language === "ar" ? "أعراض" : language === "en" ? "Symptoms" : "Symptômes", action: () => setInput(language === "ar" ? "لدي صداع" : language === "en" ? "I have a headache" : "J'ai mal à la tête") },
    { icon: MapPin, label: language === "ar" ? "صيدلية" : language === "en" ? "Pharmacy" : "Pharmacie", action: () => setInput(language === "ar" ? "أين أجد صيدلية؟" : language === "en" ? "Where can I find a pharmacy?" : "Où trouver une pharmacie?") },
    { icon: Stethoscope, label: language === "ar" ? "نصيحة" : language === "en" ? "Advice" : "Conseil", action: () => setInput(language === "ar" ? "نصائح صحية" : language === "en" ? "Health tips" : "Conseils santé") },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-4 sm:right-6 w-[calc(100%-2rem)] sm:w-96 h-[500px] glass-card flex flex-col z-50 shadow-2xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">{t(language, "chatbot")}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    {language === "ar" ? "متصل" : language === "en" ? "Online" : "En ligne"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={clearChat} title="Clear chat">
                  <Sparkles className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              {chatMessages.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <Bot className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="font-medium mb-2">
                    {language === "ar" ? "مرحبًا! كيف يمكنني مساعدتك؟" : language === "en" ? "Hello! How can I help you?" : "Bonjour! Comment puis-je vous aider?"}
                  </h4>
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {quickActions.map((action, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={action.action}
                      >
                        <action.icon className="w-3 h-3 mr-1" />
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {chatMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                        msg.role === "user"
                          ? "bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-br-none"
                          : "bg-secondary text-secondary-foreground rounded-bl-none"
                      }`}
                    >
                      {msg.role === "assistant" && (
                        <div className="flex items-center gap-2 mb-1">
                          <Bot className="w-3 h-3" />
                          <span className="text-xs font-medium">Assistant</span>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-secondary rounded-2xl rounded-bl-none px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-border">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t(language, "typeMessage")}
                  className="flex-1"
                  disabled={isTyping}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isTyping}
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                >
                  {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-4 sm:right-6 w-14 h-14 rounded-full bg-gradient-to-r from-primary to-accent shadow-lg flex items-center justify-center z-50 animate-pulse-glow"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6 text-primary-foreground" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="w-6 h-6 text-primary-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
