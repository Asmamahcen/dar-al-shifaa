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
  AlertTriangle,
  History,
  Search,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useAppStore, type ChatMessage } from "@/lib/store";
import { t } from "@/lib/i18n";

interface KnowledgeEntry {
  fr: string[];
  en: string[];
  ar: string[];
  response: {
    fr: string;
    en: string;
    ar: string;
  };
  category: "symptom" | "info" | "action" | "emergency";
}

const medicalDatabase: KnowledgeEntry[] = [
  {
    fr: ["mal de tête", "migraine", "céphalée", "tête qui tourne", "mal à la tête", "douleur crânienne", "pression tête"],
    en: ["headache", "migraine", "dizzy", "head pain", "skull pain", "head pressure"],
    ar: ["صداع", "شقيقة", "ألم رأس", "دوار", "دوخة", "وجع رأس"],
    category: "symptom",
    response: {
      fr: "Pour un mal de tête, vous pouvez prendre du Paracétamol (Doliprane) ou de l'Ibuprofène. Reposez-vous dans le noir et hydratez-vous. Si la douleur est brutale, intense ou s'accompagne de troubles de la vision ou de raideur de la nuque, consultez en urgence.",
      en: "For a headache, you can take Paracetamol or Ibuprofen. Rest in a dark room and stay hydrated. If the pain is sudden, severe, or accompanied by vision problems or neck stiffness, seek emergency care.",
      ar: "للصداع، يمكنك تناول الباراسيتامول (دوليبران) أو الإيبوبروفين. استرح في مكان مظلم واشرب الكثير من الماء. إذا كان الألم مفاجئاً، شديداً، أو مصحوباً بضعف في الرؤية أو تصلب في الرقبة، استشر الطبيب فوراً.",
    }
  },
  {
    fr: ["fièvre", "chaud", "température", "brulant", "frissons", "sueurs"],
    en: ["fever", "hot", "temperature", "burning up", "chills", "sweating"],
    ar: ["حمى", "سخانة", "حرارة مرتفعة", "رعدة", "عرق"],
    category: "symptom",
    response: {
      fr: "La fièvre est une réaction normale de l'organisme. Prenez du Paracétamol toutes les 6 heures sans dépasser 3g/jour. Buvez beaucoup d'eau. Consultez si elle dépasse 39.5°C, si elle dure plus de 3 jours ou si elle s'accompagne de taches rouges sur la peau.",
      en: "Fever is a normal body reaction. Take Paracetamol every 6 hours (max 3g/day). Drink plenty of fluids. Consult a doctor if it exceeds 39.5°C (103°F), lasts more than 3 days, or is accompanied by a red rash.",
      ar: "الحمى هي رد فعل طبيعي للجسم. تناول الباراسيتامول كل 6 ساعات دون تجاوز 3 غرام في اليوم. اشرب الكثير من السوائل. استشر الطبيب إذا تجاوزت الحرارة 39.5 درجة، أو استمرت لأكثر من 3 أيام، أو كانت مصحوبة بطفح جلدي أحمر.",
    }
  },
  {
    fr: ["toux", "tousser", "gorge", "bronches", "mal de gorge", "angine", "déglutition"],
    en: ["cough", "coughing", "throat", "bronchi", "sore throat", "strep throat", "swallowing pain"],
    ar: ["سعال", "كحة", "حلق", "صدر", "ألم حلق", "بحة", "بلاعيم"],
    category: "symptom",
    response: {
      fr: "Pour un mal de gorge, gargarisez-vous à l'eau salée. Pour une toux sèche, un sirop antitussif peut aider. Pour une toux grasse, préférez un fluidifiant. Le miel et le citron sont d'excellents remèdes naturels. Si vous avez du mal à respirer, consultez immédiatement.",
      en: "For a sore throat, gargle with salt water. For a dry cough, an antitussive syrup may help. For a productive cough, use an expectorant. Honey and lemon are excellent natural remedies. If you have difficulty breathing, seek immediate medical attention.",
      ar: "لآلام الحلق، تغرغر بالماء المالح. للسعال الجاف، قد يساعد شراب مضاد للسعال. للسعال الرطب، يفضل مذيب للبلغم. العسل والليمون علاجات طبيعية ممتازة. إذا كنت تعاني من ضيق في التنفس، استشر الطبيب فوراً.",
    }
  },
  {
    fr: ["grippe", "rhume", "nez bouché", "coule", "éternuement", "fatigue intense", "courbatures"],
    en: ["flu", "cold", "stuffy nose", "runny nose", "sneezing", "extreme fatigue", "body aches"],
    ar: ["زكام", "انفلونزا", "نيف يسيل", "لاغريب", "عطس", "فشل", "وجع عظام"],
    category: "symptom",
    response: {
      fr: "C'est probablement viral (rhume ou grippe). Repos total, Vitamine C, et lavage de nez fréquent au sérum physiologique. Le paracétamol aidera pour les courbatures. Surveillez votre température.",
      en: "It's likely viral (cold or flu). Rest, take Vitamin C, and use saline nasal spray frequently. Paracetamol is effective for body aches. Monitor your temperature.",
      ar: "من المحتمل أن يكون فيروسياً (زكام أو انفلونزا). الراحة التامة، فيتامين ج، وغسل الأنف المتكرر بالمحلول الملحي. سيساعد الباراسيتامول في تخفيف آلام الجسم. راقب درجة حرارتك.",
    }
  },
  {
    fr: ["estomac", "ventre", "diarrhée", "constipation", "nausée", "vomir", "ballonnement", "gaz", "crampe"],
    en: ["stomach", "belly", "diarrhea", "constipation", "nausea", "vomit", "bloating", "gas", "cramps"],
    ar: ["معدة", "كرش", "إسهال", "إمساك", "غثيان", "قيء", "نفخة", "غازات", "سطر"],
    category: "symptom",
    response: {
      fr: "Pour les maux d'estomac, le Smecta ou l'Antigast est utile. En cas de diarrhée, buvez beaucoup pour éviter la déshydratation et mangez du riz, des carottes cuites et des bananes. Si les vomissements persistent ou s'il y a du sang, consultez d'urgence.",
      en: "For stomach pain, Smecta or Antigast is useful. In case of diarrhea, drink plenty of fluids to avoid dehydration and eat rice, cooked carrots, and bananas. If vomiting persists or there is blood, seek emergency care.",
      ar: "لآلام المعدة، يعتبر سميكتا أو أنتيغاست مفيداً. في حالة الإسهال، اشرب الكثير من السوائل لتجنب الجفاف وتناول الأرز والجزر المطبوخ والموز. إذا استمر القيء أو ظهر دم، استشر الطبيب فوراً.",
    }
  },
  {
    fr: ["dent", "gencive", "rage de dent", "carie", "gonflé", "abcès"],
    en: ["tooth", "gum", "toothache", "cavity", "swollen", "abscess"],
    ar: ["سنة", "ضرس", "لثة", "وجع سن", "سوسة", "منفوخ"],
    category: "symptom",
    response: {
      fr: "Pour une douleur dentaire, l'ibuprofène est souvent plus efficace que le paracétamol. Faites des bains de bouche à l'eau salée tiède. Prenez rendez-vous chez un dentiste rapidement.",
      en: "For dental pain, ibuprofen is often more effective than paracetamol. Rinse with warm salt water. Make an appointment with a dentist as soon as possible.",
      ar: "لآلام الأسنان، غالباً ما يكون الإيبوبروفين أكثر فعالية من الباراسيتامول. استعمل مضمضة بالماء المالح الدافئ. احجز موعداً عند طبيب الأسنان في أقرب وقت.",
    }
  },
  {
    fr: ["allergie", "bouton", "démangeaison", "rougeur", "urticaire", "rhume des foins"],
    en: ["allergy", "rash", "itchy", "redness", "hives", "hay fever"],
    ar: ["حساسية", "حب", "حكة", "حمرور", "ارتيكاريا"],
    category: "symptom",
    response: {
      fr: "S'il s'agit d'une réaction cutanée légère, un antihistaminique peut aider. Évitez tout contact avec l'allergène. Attention : si vous avez un gonflement du visage ou du mal à respirer, appelez le 14 immédiatement.",
      en: "For a mild skin reaction, an antihistamine may help. Avoid contact with the allergen. Warning: if you experience facial swelling or difficulty breathing, call emergency services immediately.",
      ar: "إذا كان تفاعلاً جلدياً طفيفاً، فقد يساعد مضاد للهيستامين. تجنب ملامسة مسبب الحساسية. تحذير: إذا شعرت بانتفاخ في الوجه أو ضيق في التنفس، اتصل بالإسعاف فوراً.",
    }
  },
  {
    fr: ["urgence", "grave", "samu", "accident", "saigne", "étouffe", "conscience", "poison"],
    en: ["emergency", "serious", "ambulance", "accident", "bleeding", "choking", "unconscious", "poison"],
    ar: ["طوارئ", "خطير", "إسعاف", "حادث", "نزيف", "خنقة", "غيبوبة", "تسمم"],
    category: "emergency",
    response: {
      fr: "⚠️ URGENCE VITALE : En Algérie, appelez immédiatement le 14 (Protection Civile) ou le 1548 (Police). Si vous êtes proche d'un hôpital, rendez-vous aux urgences sans attendre.",
      en: "⚠️ LIFE-THREATENING EMERGENCY: In Algeria, call 14 (Civil Protection) or 1548 (Police) immediately. If you are near a hospital, go to the emergency room without delay.",
      ar: "⚠️ حالة طوارئ حيوية: في الجزائر، اتصل فوراً بالرقم 14 (الحماية المدنية) أو 1548 (الأمن الوطني). إذا كنت قريباً من مستشفى، توجه إلى مصلحة الاستعجالات دون تأخير.",
    }
  },
  {
    fr: ["pharmacie", "trouver", "ouvert", "garde", "médicament", "acheter", "disponible"],
    en: ["pharmacy", "find", "open", "duty", "medicine", "buy", "available"],
    ar: ["صيدلية", "بحث", "مفتوحة", "مناوبة", "دواء", "شراء", "متوفر"],
    category: "action",
    response: {
      fr: "Je peux vous aider à localiser les pharmacies. Consultez l'onglet 'Pharmacies' pour voir la carte interactive et identifier les pharmacies de garde ouvertes actuellement.",
      en: "I can help you locate pharmacies. Check the 'Pharmacies' tab to see the interactive map and identify pharmacies currently on duty.",
      ar: "يمكنني مساعدتك في تحديد مواقع الصيدليات. راجع تبويب 'الصيدليات' لرؤية الخريطة التفاعلية والتعرف على صيدليات المناوبة المفتوحة حالياً.",
    }
  },
  {
    fr: ["chifa", "carte", "remboursement", "cnas", "médicament gratuit", "tiers payant"],
    en: ["chifa", "card", "reimbursement", "cnas", "free medicine", "third party payer"],
    ar: ["شفاء", "بطاقة", "تعويض", "كناس", "دواء مجاني"],
    category: "info",
    response: {
      fr: "La carte CHIFA vous permet de ne pas avancer les frais de médicaments. Vous pouvez gérer vos informations CHIFA et suivre vos dossiers CNAS dans la section dédiée de l'application.",
      en: "The CHIFA card allows you to avoid upfront costs for medicines. You can manage your CHIFA information and track your CNAS files in the dedicated section of the app.",
      ar: "تسمح لك بطاقة الشفاء بعدم دفع تكاليف الأدوية مسبقاً. يمكنك إدارة معلومات الشفاء الخاصة بك ومتابعة ملفات الكناس في القسم المخصص في التطبيق.",
    }
  }
];

function generateAdvancedResponse(message: string, lang: string): { text: string; category: string } {
  const lowerMsg = message.toLowerCase();
  
  // Scoring system
  let bestMatch: KnowledgeEntry | null = null;
  let maxScore = 0;

  for (const entry of medicalDatabase) {
    let score = 0;
    
    // Check keywords in current language (double weight)
    const currentLangKeywords = entry[lang as "fr" | "en" | "ar"] || [];
    for (const kw of currentLangKeywords) {
      if (lowerMsg.includes(kw.toLowerCase())) {
        score += kw.length * 2;
      }
    }

    // Check keywords in other languages (single weight)
    const otherLangs = (["fr", "en", "ar"] as const).filter(l => l !== lang);
    for (const otherLang of otherLangs) {
      for (const kw of entry[otherLang]) {
        if (lowerMsg.includes(kw.toLowerCase())) {
          score += kw.length;
        }
      }
    }

    if (score > maxScore) {
      maxScore = score;
      bestMatch = entry;
    }
  }

  // Threshold for matching
  if (bestMatch && maxScore >= 4) {
    return { 
      text: bestMatch.response[lang as "fr" | "en" | "ar"] || bestMatch.response.fr,
      category: bestMatch.category 
    };
  }

  // Specific Greeting Patterns
  const greetings = {
    fr: ["bonjour", "salut", "coucou", "hello"],
    en: ["hello", "hi", "hey", "greetings"],
    ar: ["مرحبا", "سلام", "اهلا", "أهلاً", "صباح الخير", "مساء الخير"]
  };

  if (Object.values(greetings).flat().some(g => lowerMsg.includes(g))) {
    return {
      category: "info",
      text: lang === "ar" 
        ? "أهلاً بك! أنا مساعدك الصحي الذكي. صف لي أعراضك أو اطلب المساعدة في العثور على صيدلية أو معلومات عن بطاقة الشفاء."
        : lang === "en"
        ? "Hello! I'm your AI health assistant. Describe your symptoms or ask for help finding a pharmacy or CHIFA card info."
        : "Bonjour! Je suis votre assistant santé IA. Décrivez vos symptômes ou demandez de l'aide pour trouver une pharmacie ou des infos sur la carte CHIFA."
    };
  }

  // Fallback for symptoms if "mal" or "pain" is mentioned but not caught
  if (["mal", "douleur", "pain", "hurt", "ألم", "وجع", "سطر"].some(w => lowerMsg.includes(w))) {
    return {
      category: "info",
      text: lang === "ar"
        ? "أين تشعر بالألم بالضبط؟ (مثلاً: الرأس، المعدة، الظهر...) لأتمكن من مساعدتك."
        : lang === "en"
        ? "Where exactly do you feel pain? (e.g., head, stomach, back...) so I can help you better."
        : "Où ressentez-vous la douleur exactement ? (ex: tête, estomac, dos...) pour que je puisse mieux vous aider."
    };
  }

  // Default
  return {
    category: "info",
    text: lang === "ar"
      ? "عذراً، لم أفهم طلبك تماماً. هل يمكنك تحديد العرض (صداع، حمى، سعال...) أو السؤال عن الصيدليات أو بطاقة الشفاء؟"
      : lang === "en"
      ? "I'm sorry, I didn't quite understand. Could you specify the symptom (headache, fever, cough...) or ask about pharmacies or the CHIFA card?"
      : "Désolé, je n'ai pas tout à fait compris. Pouvez-vous préciser le symptôme (mal de tête, fièvre, toux...) ou poser une question sur les pharmacies ou la carte CHIFA ?"
  };
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLLMReady, setIsLLMReady] = useState(false);
  const [llmStatus, setLlmStatus] = useState("");
  const workerRef = useRef<Worker | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { language, chatMessages, addChatMessage, clearChat } = useAppStore();

  useEffect(() => {
    // Initialize Web Worker for LLM
    if (!workerRef.current && typeof window !== 'undefined') {
      workerRef.current = new Worker(new URL('../lib/chat-worker.ts', import.meta.url), {
        type: 'module'
      });

      workerRef.current.onmessage = (e) => {
        const { type, text, message } = e.data;
        if (type === 'ready') {
          setIsLLMReady(true);
          setLlmStatus("");
        } else if (type === 'status') {
          setLlmStatus(message);
        } else if (type === 'result') {
          const assistantMessage: ChatMessage = {
            id: `msg-${Date.now() + 1}`,
            role: "assistant",
            content: text,
            timestamp: new Date().toISOString(),
          };
          addChatMessage(assistantMessage);
          setIsTyping(false);
        } else if (type === 'error') {
          console.error("LLM Worker Error:", message);
          // Fallback handled in generate logic
          setIsTyping(false);
        }
      };

      workerRef.current.postMessage({ type: 'load' });
    }

    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, isTyping, llmStatus]);

  const handleSend = async (customMessage?: string) => {
    const textToSend = customMessage || input;
    if (!textToSend.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: textToSend.trim(),
      timestamp: new Date().toISOString(),
    };
    addChatMessage(userMessage);
    if (!customMessage) setInput("");
    setIsTyping(true);

    // Check if we should use LLM or Rule-based
    // We use LLM for complex queries if ready, otherwise rule-based
    const ruleResponse = generateAdvancedResponse(textToSend.trim(), language);
    
    // If it's a specific match from database, use it (it's more reliable for medical advice)
    if (ruleResponse.category !== "info" || !isLLMReady) {
      await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 1000));
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: ruleResponse.text,
        timestamp: new Date().toISOString(),
      };
      addChatMessage(assistantMessage);
      setIsTyping(false);
    } else {
      // Use LLM for general/unrecognized queries
      workerRef.current?.postMessage({
        type: 'generate',
        text: textToSend.trim(),
        language
      });
    }
  };

  const quickActions = [
    { icon: Pill, label: { fr: "Symptômes", en: "Symptoms", ar: "أعراض" }, color: "text-blue-500", query: { fr: "J'ai des symptômes", en: "I have symptoms", ar: "لدي أعراض" } },
    { icon: MapPin, label: { fr: "Pharmacies", en: "Pharmacies", ar: "صيدليات" }, color: "text-green-500", query: { fr: "Où est la pharmacie ?", en: "Where is the pharmacy?", ar: "أين الصيدلية؟" } },
    { icon: AlertTriangle, label: { fr: "Urgences", en: "Emergencies", ar: "طوارئ" }, color: "text-red-500", query: { fr: "Urgence médicale", en: "Medical emergency", ar: "طوارئ طبية" } },
    { icon: BookOpen, label: { fr: "Conseils", en: "Tips", ar: "نصائح" }, color: "text-purple-500", query: { fr: "Conseils santé", en: "Health tips", ar: "نصائح صحية" } },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.95, y: 40, filter: "blur(10px)" }}
            className="fixed bottom-24 right-4 sm:right-6 w-[calc(100%-2rem)] sm:w-[400px] h-[600px] bg-background/80 backdrop-blur-xl border border-border rounded-3xl flex flex-col z-50 shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${isLLMReady ? 'bg-green-500' : 'bg-yellow-500'} border-2 border-background rounded-full animate-pulse`} />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">Assistant Shifaa</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-primary" />
                      {language === "ar" ? "ذكاء اصطناعي محلي" : language === "en" ? "Local Intelligence" : "Intelligence Locale"}
                    </p>
                    {isLLMReady && (
                      <Badge variant="outline" className="text-[8px] h-4 px-1 border-primary/30 text-primary animate-in fade-in zoom-in">
                        LLM ACTIVE
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={clearChat} className="rounded-full hover:bg-primary/10">
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full hover:bg-destructive/10">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 px-4 py-6" ref={scrollRef}>
              <div className="space-y-6">
                {llmStatus && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center gap-2 py-2 bg-primary/5 rounded-xl border border-primary/10"
                  >
                    <Loader2 className="w-3 h-3 animate-spin text-primary" />
                    <span className="text-[10px] font-medium text-primary uppercase tracking-wider">{llmStatus}</span>
                  </motion.div>
                )}

                {chatMessages.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4"
                  >
                    <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center border border-primary/10">
                      <Stethoscope className="w-10 h-10 text-primary/40" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-xl">
                        {language === "ar" ? "كيف يمكنني مساعدتك؟" : language === "en" ? "How can I help you?" : "Comment puis-je vous aider ?"}
                      </h4>
                      <p className="text-sm text-muted-foreground max-w-[250px] mx-auto">
                        {language === "ar" ? "أنا هنا للإجابة على تساؤلاتك الطبية والبحث عن الصيدليات." : language === "en" ? "I'm here to answer your medical questions and find pharmacies." : "Je suis là pour répondre à vos questions médicales et trouver des pharmacies."}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-8">
                      {quickActions.map((action, i) => (
                        <motion.button
                          key={i}
                          whileHover={{ scale: 1.02, backgroundColor: "rgba(var(--primary), 0.05)" }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSend(action.query[language as "fr" | "en" | "ar"])}
                          className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-border bg-card/50 hover:border-primary/50 transition-all"
                        >
                          <action.icon className={`w-6 h-6 ${action.color}`} />
                          <span className="text-xs font-medium">{action.label[language as "fr" | "en" | "ar"]}</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {chatMessages.map((msg, i) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`relative max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-none"
                          : "bg-muted/50 border border-border/50 rounded-tl-none"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      <span className="text-[10px] opacity-50 mt-1 block text-right">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-muted/30 rounded-2xl rounded-tl-none px-4 py-3 border border-border/50">
                      <div className="flex gap-1.5">
                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t border-border bg-background/50">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="relative flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t(language, "typeMessage")}
                    className="pr-12 h-12 rounded-2xl bg-muted/50 border-none focus-visible:ring-primary/20"
                    disabled={isTyping}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {isLLMReady && <Cpu className="w-3 h-3 text-primary animate-pulse" />}
                    <Search className="w-4 h-4 text-muted-foreground opacity-50" />
                  </div>
                </div>
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isTyping}
                  className="w-12 h-12 rounded-2xl bg-primary hover:scale-105 transition-transform shrink-0 shadow-lg"
                >
                  {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </Button>
              </form>
              <p className="text-[10px] text-center text-muted-foreground mt-3 uppercase tracking-widest opacity-50">
                {language === "ar" ? "استشارة طبية ذكية مجانية" : language === "en" ? "Free AI Health Consultation" : "Consultation Santé IA Gratuite"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-4 sm:right-6 group z-50"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-primary blur-xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full" />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-2xl flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                  <X className="w-7 h-7 text-white" />
                </motion.div>
              ) : (
                <motion.div key="open" className="flex flex-col items-center">
                  <MessageCircle className="w-7 h-7 text-white" />
                  <span className="text-[8px] font-bold text-white mt-0.5">AI</span>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Animated particles */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-white/10 to-transparent" />
            </div>
          </div>
          
          {!isOpen && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-background rounded-full flex items-center justify-center"
            >
              <span className="text-[10px] font-bold text-white">1</span>
            </motion.div>
          )}
        </div>
      </motion.button>
    </>
  );
}
