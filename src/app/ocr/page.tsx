"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  CloudUpload, 
  BrainCircuit, 
  Scan, 
  Pill, 
  ShieldCheck, 
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { toast } from "sonner";
import Link from "next/link";

export default function OCRPage() {
  const { language } = useAppStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => setSelectedImage(reader.result as string);
    reader.readAsDataURL(file);

    setIsAnalyzing(true);
    setAnalysisResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setAnalysisResult(data.analysis);
      toast.success(t(language, "analysisResult"));
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'analyse");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <div className="pt-32 px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-1">
            <BrainCircuit className="w-4 h-4 mr-2" />
            {language === "ar" ? "ذكاء اصطناعي متطور" : "Intelligence Artificielle de Pointe"}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-4 gradient-text">
            {t(language, "ocr")}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {language === "ar" 
              ? "حول وصفاتك الطبية الورقية إلى بيانات رقمية دقيقة في ثوانٍ."
              : "Transformez vos ordonnances papier en données numériques précises en quelques secondes."}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="glass-card border-2 border-dashed border-primary/20 hover:border-primary/50 transition-colors group cursor-pointer relative overflow-hidden h-[400px]" onClick={() => document.getElementById('file-upload')?.click()}>
            <CardContent className="h-full flex flex-col items-center justify-center p-8 text-center">
              {selectedImage ? (
                <img src={selectedImage} alt="Preview" className="absolute inset-0 w-full h-full object-contain opacity-40 group-hover:scale-105 transition-transform" />
              ) : (
                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <CloudUpload className="w-10 h-10 text-primary" />
                </div>
              )}
              <div className="relative z-10">
                <h3 className="text-xl font-black uppercase italic mb-2">
                  {language === "ar" ? "اختر صورة الوصفة" : "Sélectionner une photo"}
                </h3>
                <p className="text-sm text-muted-foreground font-bold">
                  JPG, PNG ou PDF (Max 10MB)
                </p>
              </div>
              <input 
                type="file" 
                id="file-upload" 
                className="hidden" 
                accept="image/*,.pdf" 
                onChange={handleFileUpload}
              />
            </CardContent>
          </Card>

          <Card className="glass-card relative overflow-hidden min-h-[400px]">
            <CardHeader>
              <CardTitle className="font-black uppercase italic flex items-center gap-2">
                <Scan className="w-5 h-5 text-primary" />
                {t(language, "analysisResult")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {isAnalyzing ? (
                  <motion.div
                    key="analyzing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                  >
                    <div className="w-16 h-16 border-4 border-primary/20 rounded-full animate-spin border-t-primary mb-4" />
                    <p className="font-black uppercase italic text-primary animate-pulse">{t(language, "analyzing")}</p>
                  </motion.div>
                ) : analysisResult ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase opacity-50 flex items-center gap-2">
                        <Pill className="w-3 h-3 text-primary" />
                        {t(language, "medicineFound")}
                      </Label>
                      {analysisResult.medicines?.map((med: any, i: number) => (
                        <div key={i} className="p-3 bg-secondary/10 rounded-xl border border-white/20 flex justify-between items-center">
                          <div>
                            <p className="font-black uppercase italic text-sm">{med.name}</p>
                            <p className="text-[10px] opacity-60 font-bold">{med.dosage} • {med.duration}</p>
                          </div>
                          <Badge variant="outline" className="text-[8px] font-black uppercase">
                            {med.confidence}% Match
                          </Badge>
                        </div>
                      ))}
                    </div>

                    {analysisResult.instructions && (
                      <div className="p-4 bg-accent/5 rounded-2xl border border-accent/20 italic text-sm">
                        {analysisResult.instructions}
                      </div>
                    )}

                    <Link href="/dashboard" className="block">
                      <Button className="w-full rounded-full font-black uppercase italic h-12 shadow-lg group">
                        Chercher ces médicaments
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                    <ShieldCheck className="w-16 h-16 mb-4" />
                    <p className="font-black uppercase italic text-xs">
                      {language === "ar" ? "بانتظار الوصفة..." : "En attente d'une ordonnance..."}
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>

        <section className="mt-20">
          <h2 className="text-2xl font-black uppercase italic mb-8 text-center">{language === "ar" ? "كيف يعمل؟" : "Comment ça marche ?"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: CloudUpload, title: "Upload", desc: "Prenez une photo nette de votre ordonnance médicale." },
              { icon: BrainCircuit, title: "Analyse IA", desc: "Notre IA identifie les noms, dosages et fréquences des médicaments." },
              { icon: CheckCircle2, title: "Résultat", desc: "Vérifiez les disponibilités et commandez en un clic." }
            ].map((step, i) => (
              <div key={i} className="text-center group">
                <div className="w-16 h-16 mx-auto bg-secondary/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                <h4 className="font-black uppercase italic mb-2">{step.title}</h4>
                <p className="text-xs text-muted-foreground font-medium">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
