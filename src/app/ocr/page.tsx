"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { createWorker } from "tesseract.js";
import {
  ScanLine,
  Upload,
  Camera,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  Pill,
  Search,
  X,
  Image,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Navbar } from "@/components/Navbar";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase";

interface PharmacyStock {
  name: string;
  address: string;
  city: string;
  quantity: number;
  price: number;
}

interface ExtractedMedicine {
  name: string;
  dosage: string;
  quantity: string;
  found: boolean;
  inStock?: boolean;
  genericName?: string;
  stocks?: PharmacyStock[];
  recommendations?: any[];
}

export default function OCRPage() {
  const { language, user } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedMedicines, setExtractedMedicines] = useState<ExtractedMedicine[]>([]);
  const [rawText, setRawText] = useState("");
  const [progress, setProgress] = useState(0);
  const [usage, setUsage] = useState({ count: 0, limit: 10 });
  const supabase = createClient();

  useEffect(() => {
    if (user) {
      fetchUsage();
    }
  }, [user]);

  const fetchUsage = async () => {
    if (!user) return;
    
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const { data, error } = await supabase
      .from("ocr_usage")
      .select("usage_count")
      .eq("user_id", user.id)
      .eq("month", month)
      .eq("year", year)
      .single();

    let count = 0;
    if (data) {
      count = data.usage_count;
    } else if (!error) {
      // Create record if not exists
      await supabase.from("ocr_usage").insert({
        user_id: user.id,
        usage_count: 0,
        month,
        year
      });
    }

    const limit = user.plan === "premium" ? 300 : user.plan === "professional" || user.plan === "enterprise" ? 1000000 : 10;
    setUsage({ count, limit });
  };

  const updateUsage = async () => {
    if (!user) return;
    
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const { error } = await supabase.rpc('increment_ocr_usage', { 
      p_user_id: user.id, 
      p_month: month, 
      p_year: year 
    });

    if (error) {
      // Fallback if RPC doesn't exist
      await supabase
        .from("ocr_usage")
        .update({ usage_count: usage.count + 1 })
        .eq("user_id", user.id)
        .eq("month", month)
        .eq("year", year);
    }
    
    setUsage(prev => ({ ...prev, count: prev.count + 1 }));
  };

  const getRecommendations = async (medName: string, genericName?: string) => {
    try {
      // Search by generic name for best results
      let query = supabase.from("medicines").select("*, pharmacies(name, address, city)");
      
      if (genericName) {
        query = query.eq("generic_name", genericName);
      } else {
        query = query.ilike("name", `%${medName}%`);
      }

      const { data, error } = await query.limit(5);
      if (error) throw error;
      
      return data?.map(m => ({
        name: m.name,
        price: m.price,
        quantity: m.quantity,
        pharmacy: m.pharmacies?.name || "Pharmacie inconnue",
        address: m.pharmacies?.address || ""
      })) || [];
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      return [];
    }
  };

  const performOCR = async (imageFile: File) => {
    if (usage.count >= usage.limit) {
      toast.error(language === "ar" 
        ? "لقد وصلت إلى الحد الأقصى للمسح الشهري. يرجى الترقية." 
        : "Limite mensuelle atteinte. Veuillez passer à un plan supérieur.");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    try {
      const worker = await createWorker("fra+ara", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      const { data: { text } } = await worker.recognize(imageFile);
      setRawText(text);

      const extracted: ExtractedMedicine[] = [];
      const lines = text.split("\n");
      // Improved regex to capture medicine name and dosage more reliably
      const dosageRegex = /(\d+(\.\d+)?)\s*(mg|ml|g|mcg|µg|cp|gel|flacon|amp|ui|iu)/i;
      
      for (const line of lines) {
        const trimmed = line.trim();
        // Skip common headers and short noise
        if (trimmed.length < 4 || /^(dr|docteur|service|hopital|date|tel|fax|cite|wilaya)/i.test(trimmed)) continue;

        const dosageMatch = trimmed.match(dosageRegex);
        if (dosageMatch) {
          const dosageIndex = trimmed.indexOf(dosageMatch[0]);
          let name = trimmed.substring(0, dosageIndex).replace(/^[\d\s.\/]+/, "").trim();
          
          // If name is too short or empty, check after dosage
          if (name.length < 2) {
             name = trimmed.substring(dosageIndex + dosageMatch[0].length).trim().split(/\s+/)[0];
          }

          if (name && name.length > 2 && !/^(matin|midi|soir|nuit|fois|jour)/i.test(name)) {
            if (!extracted.some(e => e.name.toLowerCase().includes(name.toLowerCase()))) {
              // Fetch medicine details and pharmacy info
              const { data: medResults } = await supabase
                .from("medicines")
                .select("*, pharmacies(name, address, city)")
                .ilike("name", `%${name}%`);

              const medData = medResults?.[0];
              const stocks = medResults?.filter(m => m.quantity > 0).map(m => ({
                name: m.pharmacies?.name || "Pharmacie",
                address: m.pharmacies?.address || "",
                city: m.pharmacies?.city || "",
                quantity: m.quantity,
                price: m.price
              })) || [];

              const recommendations = await getRecommendations(name, medData?.generic_name);

              extracted.push({
                name: `${name} ${dosageMatch[0]}`,
                dosage: trimmed,
                quantity: "1",
                found: !!medData,
                inStock: stocks.length > 0,
                genericName: medData?.generic_name,
                stocks,
                recommendations: recommendations.filter(r => r.name !== name)
              });
            }
          }
        }
      }

      if (extracted.length === 0 && text.length > 10) {
        // Fallback for lines that look like medicines but no dosage match
        for (const line of lines) {
          const t = line.trim();
          if (t.length > 8 && t.length < 40 && !extracted.some(e => e.name === t)) {
             const { data } = await supabase.from("medicines").select("name").ilike("name", `%${t}%`).limit(1);
             if (data && data.length > 0) {
                extracted.push({
                  name: t,
                  dosage: language === "ar" ? "غير محدد" : "Indéterminé",
                  quantity: "1",
                  found: true,
                  inStock: false
                });
             }
          }
        }
      }

      setExtractedMedicines(extracted);
      await worker.terminate();
      
      // Update usage after successful scan
      await updateUsage();
      
      toast.success(language === "ar" ? "تم تحليل الوصفة بنجاح" : "Ordonnance analysée avec succès");
    } catch (error) {
      console.error("OCR Error:", error);
      toast.error(language === "ar" ? "فشل تحليل الوصفة" : "Échec de l'analyse");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(language === "ar" ? "يرجى اختيار صورة" : "Veuillez sélectionner une image");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    performOCR(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    performOCR(file);
  };

  const resetScan = () => {
    setSelectedImage(null);
    setExtractedMedicines([]);
    setRawText("");
    setProgress(0);
  };

  const searchMedicineGlobal = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from("medicines")
        .select("*, pharmacies(name, city)")
        .ilike("name", `%${name}%`);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        toast.success(`${data.length} ${language === "ar" ? "نتيجة" : "résultat(s)"}`);
        // Here we could open a modal with results
      } else {
        toast.info(language === "ar" ? "لم يتم العثور على الدواء في أي صيدلية" : "Médicament non trouvé dans les pharmacies");
      }
    } catch (err) {
      toast.error("Erreur lors de la recherche");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold mb-2">{t(language, "scanPrescription")}</h1>
              <p className="text-muted-foreground">
                {language === "ar" 
                  ? "قم بمسح الوصفة الطبية واستخراج الأدوية تلقائياً"
                  : language === "en"
                  ? "Scan your prescription and extract medicines automatically"
                  : "Scannez votre ordonnance et extrayez les médicaments automatiquement"}
              </p>
            </div>
            
            <div className="glass-card px-6 py-3 min-w-[250px]">
              <div className="flex justify-between text-xs font-black uppercase mb-2">
                <span>{language === "ar" ? "الاستخدام" : "Usage"}</span>
                <span className={usage.count >= usage.limit ? "text-red-500" : "text-primary"}>
                  {usage.count} / {usage.limit} {language === "ar" ? "مسح" : "scans"}
                </span>
              </div>
              <Progress value={(usage.count / usage.limit) * 100} className="h-2" />
              <p className="text-[10px] mt-2 opacity-60">
                {user?.plan === "free" 
                  ? (language === "ar" ? "خطة مجانية (10/شهر)" : "Plan Gratuit (10/mois)")
                  : user?.plan === "premium"
                  ? (language === "ar" ? "خطة مميزة (300/شهر)" : "Plan Premium (300/mois)")
                  : (language === "ar" ? "خطة احترافية (غير محدود)" : "Plan Pro (Illimité)")}
              </p>
            </div>
          </motion.div>

        {!selectedImage ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-8"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <div className="border-2 border-dashed border-border rounded-xl p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <ScanLine className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {language === "ar" ? "رفع صورة الوصفة" : "Télécharger l'image de l'ordonnance"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {language === "ar" 
                  ? "اسحب وأفلت الصورة هنا أو انقر للاختيار"
                  : "Glissez-déposez l'image ici ou cliquez pour sélectionner"}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {language === "ar" ? "اختر صورة" : "Choisir une image"}
                </Button>
                <Button variant="outline">
                  <Camera className="w-4 h-4 mr-2" />
                  {language === "ar" ? "التقط صورة" : "Prendre une photo"}
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            <div className="mt-8 grid sm:grid-cols-3 gap-4 text-center">
              <div className="p-4">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-500" />
                </div>
                <h4 className="font-medium mb-1">
                  {language === "ar" ? "مسح ذكي" : "Scan intelligent"}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {language === "ar" ? "يدعم الوصفات المكتوبة بخط اليد" : "Supporte les ordonnances manuscrites"}
                </p>
              </div>
              <div className="p-4">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <h4 className="font-medium mb-1">
                  {language === "ar" ? "استخراج تلقائي" : "Extraction auto"}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {language === "ar" ? "يستخرج الأدوية والجرعات" : "Extrait les médicaments et dosages"}
                </p>
              </div>
              <div className="p-4">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Search className="w-6 h-6 text-purple-500" />
                </div>
                <h4 className="font-medium mb-1">
                  {language === "ar" ? "بحث فوري" : "Recherche instantanée"}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {language === "ar" ? "يبحث في الصيدليات القريبة" : "Recherche dans les pharmacies proches"}
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  {language === "ar" ? "الصورة" : "Image"}
                </h3>
                <Button variant="ghost" size="icon" onClick={resetScan}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="relative rounded-lg overflow-hidden">
                <img src={selectedImage} alt="Prescription" className="w-full" />
                {isProcessing && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                      <p className="text-sm">{t(language, "processing")} ({progress}%)</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="glass-card p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Pill className="w-5 h-5" />
                  {language === "ar" ? "الأدوية المستخرجة" : "Médicaments extraits"}
                </h3>
                {extractedMedicines.length > 0 ? (
                  <div className="space-y-3">
                    {extractedMedicines.map((med, i) => (
                        <div
                          key={i}
                          className="flex flex-col p-3 rounded-lg bg-secondary/50 gap-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-medium">{med.name}</h4>
                                {med.found && med.inStock && (
                                  <Badge className="bg-green-500 text-xs text-white">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    {language === "ar" ? "متوفر" : "Disponible"}
                                  </Badge>
                                )}
                                {med.found && !med.inStock && (
                                  <Badge variant="destructive" className="text-xs">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    {language === "ar" ? "نفدت الكمية" : "En rupture"}
                                  </Badge>
                                )}
                                {!med.found && (
                                  <Badge variant="outline" className="text-xs">
                                    {language === "ar" ? "غير موجود" : "Non référencé"}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{med.dosage}</p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => searchMedicineGlobal(med.name)}
                            >
                              <Search className="w-4 h-4" />
                            </Button>
                          </div>

                          {med.stocks && med.stocks.length > 0 && (
                            <div className="pl-4 border-l-2 border-green-500/30 space-y-2">
                              <p className="text-xs font-bold uppercase tracking-wider text-green-600 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                {language === "ar" ? "متوفر في الصيدليات التالية" : "Disponible dans ces pharmacies"}
                              </p>
                              <div className="grid gap-2">
                                {med.stocks.slice(0, 3).map((stock, j) => (
                                  <div key={j} className="flex items-center justify-between text-sm bg-green-500/5 p-2 rounded border border-green-500/10">
                                    <div className="flex flex-col">
                                      <span className="font-medium">{stock.name}</span>
                                      <span className="text-[10px] text-muted-foreground">{stock.address}, {stock.city}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                      <span className="font-bold text-primary">{stock.price} DA</span>
                                      <span className="text-[10px]">{language === "ar" ? "الكمية" : "Stock"}: {stock.quantity}</span>
                                    </div>
                                  </div>
                                ))}
                                {med.stocks.length > 3 && (
                                  <p className="text-[10px] text-muted-foreground italic text-center">
                                    + {med.stocks.length - 3} {language === "ar" ? "صيدليات أخرى" : "autres pharmacies"}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {med.recommendations && med.recommendations.length > 0 && (
                            <div className="pl-4 border-l-2 border-primary/30 space-y-2">
                              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                <Pill className="w-3 h-3" />
                                {language === "ar" ? "البدائل الجنيسة المقترحة" : "Alternatives Génériques Suggérées"}
                              </p>
                              <div className="grid gap-2">
                                {med.recommendations.map((rec, j) => (
                                  <div key={j} className="flex items-center justify-between text-sm bg-background/50 p-2 rounded border border-border/50">
                                    <div className="flex flex-col">
                                      <span className="font-medium text-foreground">{rec.name}</span>
                                      <span className="text-[10px] text-muted-foreground">{rec.pharmacy}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className="font-bold text-primary">{rec.price} DA</span>
                                      <Button size="sm" variant="ghost" className="h-7 px-2">
                                        {language === "ar" ? "طلب" : "Commander"}
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                    ))}
                  </div>
                ) : !isProcessing ? (
                  <p className="text-muted-foreground text-center py-8">
                    {language === "ar" ? "لم يتم استخراج أي أدوية" : "Aucun médicament extrait"}
                  </p>
                ) : null}
              </div>

              {rawText && (
                <div className="glass-card p-4">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {language === "ar" ? "النص المستخرج" : "Texte extrait"}
                  </h3>
                  <pre className="text-sm text-muted-foreground whitespace-pre-wrap bg-secondary/50 p-4 rounded-lg max-h-60 overflow-y-auto">
                    {rawText}
                  </pre>
                </div>
              )}

              {extractedMedicines.length > 0 && (
                <Button className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90">
                  {language === "ar" ? "البحث عن جميع الأدوية" : "Rechercher tous les médicaments"}
                </Button>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
