"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, Landmark, Upload, Loader2, CheckCircle2 } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { createClient } from "@/lib/supabase";
import { t } from "@/lib/i18n";

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  planKey: string;
  price: string;
}

export function PaymentDialog({ isOpen, onClose, planKey, price }: PaymentDialogProps) {
  const { language, user } = useAppStore();
  const [method, setMethod] = useState<"stripe" | "ccp" | null>(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleStripe = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey, email: user?.email }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Error");
      }
    } catch (error) {
      console.error(error);
      alert("Error");
    } finally {
      setLoading(false);
    }
  };

  const handleCCP = async () => {
    if (!file || !user) return;
    setLoading(true);
    try {
      const fileName = `${user.id}-${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("receipts")
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from("users")
        .update({
          ccp_receipt_url: publicUrl,
          plan: planKey,
          is_approved: false
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // Update local store
      useAppStore.getState().setUser({
        ...user,
        ccpReceiptUrl: publicUrl,
        plan: planKey as any,
        isApproved: false
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setMethod(null);
        setFile(null);
      }, 3000);
    } catch (error) {
      console.error(error);
      alert("Error uploading receipt");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {language === "ar" ? "اختر طريقة الدفع" : language === "en" ? "Choose Payment Method" : "Choisir le mode de paiement"}
          </DialogTitle>
          <DialogDescription>
            {language === "ar" 
              ? `دفع اشتراك ${planKey} بقيمة ${price} دج`
              : `Paiement de l'abonnement ${planKey} (${price} DA)`}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-12 flex flex-col items-center text-center">
            <CheckCircle2 className="w-16 h-16 text-primary mb-4 animate-bounce" />
            <h3 className="text-xl font-bold mb-2">
              {language === "ar" ? "تم إرسال الطلب بنجاح" : "Demande envoyée avec succès"}
            </h3>
            <p className="text-muted-foreground">
              {language === "ar" 
                ? "سيتم تفعيل حسابك بعد مراجعة الوصل من طرف الإدارة"
                : "Votre compte sera activé après vérification du reçu par l'administration"}
            </p>
          </div>
        ) : !method ? (
          <div className="grid grid-cols-1 gap-4 py-4">
            <Button
              variant="outline"
              className="h-24 flex flex-col gap-2 hover:border-primary hover:bg-primary/5"
              onClick={() => setMethod("stripe")}
            >
              <CreditCard className="w-8 h-8" />
              <span>Carte Bancaire / CIB (Stripe)</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col gap-2 hover:border-primary hover:bg-primary/5"
              onClick={() => setMethod("ccp")}
            >
              <Landmark className="w-8 h-8" />
              <span>CCP (Virement / Versement)</span>
            </Button>
          </div>
        ) : method === "ccp" ? (
          <div className="space-y-6 py-4">
            <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
              <p className="font-bold border-b pb-2 mb-2">Informations CCP :</p>
              <div className="flex justify-between">
                <span>Titulaire:</span>
                <span className="font-mono">DAR AL-SHIFAA</span>
              </div>
              <div className="flex justify-between">
                <span>CCP:</span>
                <span className="font-mono">0028134082</span>
              </div>
              <div className="flex justify-between">
                <span>Clé:</span>
                <span className="font-mono">85</span>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium mb-2 block">
                  {language === "ar" ? "ارفع صورة الوصل" : "Télécharger le reçu (Image/PDF)"}
                </span>
                <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors relative">
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    accept="image/*,application/pdf"
                  />
                  {file ? (
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Upload className="w-8 h-8" />
                      <span className="text-sm">Cliquez pour choisir un fichier</span>
                    </div>
                  )}
                </div>
              </label>

              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setMethod(null)} className="flex-1">
                  Retour
                </Button>
                <Button 
                  onClick={handleCCP} 
                  disabled={!file || loading}
                  className="flex-1"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Confirmer
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center space-y-4">
            <p>Redirection vers la plateforme de paiement sécurisée...</p>
            <Button disabled={loading} onClick={handleStripe}>
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Continuer vers Stripe
            </Button>
            <Button variant="ghost" onClick={() => setMethod(null)} className="block w-full">
              Retour
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
