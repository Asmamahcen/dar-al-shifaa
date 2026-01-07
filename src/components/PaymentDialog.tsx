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
import { CreditCard, Landmark, Upload, Loader2, CheckCircle2, Copy, Smartphone } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  planKey: string;
  price: string;
}

const BARIDIMOB_INFO = {
  rip: "00799999000123456789",
  accountHolder: "DAR AL-SHIFAA SARL",
  phone: "+213 555 123 456",
};

export function PaymentDialog({ isOpen, onClose, planKey, price }: PaymentDialogProps) {
  const { language, user } = useAppStore();
  const [method, setMethod] = useState<"stripe" | "baridimob" | null>(null);
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
        body: JSON.stringify({ planKey, email: user?.email, userId: user?.id }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Erreur lors de la création de la session");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleBaridiMob = async () => {
    if (!file || !user) return;
    setLoading(true);
    try {
      const fileName = `baridimob/${user.id}-${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("receipts")
        .getPublicUrl(fileName);

      const { error: paymentError } = await supabase
        .from("baridimob_payments")
        .insert({
          user_id: user.id,
          plan_key: planKey,
          amount: parseInt(price),
          receipt_url: publicUrl,
          status: "pending"
        });

      if (paymentError) throw paymentError;

      const { error: updateError } = await supabase
        .from("users")
        .update({
          baridimob_receipt_url: publicUrl,
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setMethod(null);
        setFile(null);
      }, 4000);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'envoi du reçu");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copié!`);
  };

  const resetDialog = () => {
    setMethod(null);
    setFile(null);
    setSuccess(false);
  };

  const handleClose = () => {
    resetDialog();
    onClose();
  };

  const getText = (fr: string, ar: string, en: string) => {
    if (language === "ar") return ar;
    if (language === "en") return en;
    return fr;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-black">
            {getText("Mode de Paiement", "طريقة الدفع", "Payment Method")}
          </DialogTitle>
          <DialogDescription>
            {getText(
              `Abonnement ${planKey.charAt(0).toUpperCase() + planKey.slice(1)} - ${price} DA/mois`,
              `اشتراك ${planKey} - ${price} دج/شهر`,
              `${planKey.charAt(0).toUpperCase() + planKey.slice(1)} Plan - ${price} DA/month`
            )}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-12 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-bounce" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-emerald-600">
              {getText("Demande envoyée!", "تم إرسال الطلب!", "Request sent!")}
            </h3>
            <p className="text-muted-foreground text-sm max-w-[300px]">
              {getText(
                "Votre compte sera activé sous 24-48h après vérification du paiement par notre équipe.",
                "سيتم تفعيل حسابك خلال 24-48 ساعة بعد التحقق من الدفع.",
                "Your account will be activated within 24-48h after payment verification."
              )}
            </p>
          </div>
        ) : !method ? (
          <div className="grid grid-cols-1 gap-4 py-4">
            <Button
              variant="outline"
              className="h-28 flex flex-col gap-3 hover:border-primary hover:bg-primary/5 group transition-all"
              onClick={() => setMethod("stripe")}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <p className="font-bold">Carte Bancaire (Stripe)</p>
                <p className="text-xs text-muted-foreground">Visa, Mastercard, CIB</p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-28 flex flex-col gap-3 hover:border-amber-500 hover:bg-amber-500/5 group transition-all"
              onClick={() => setMethod("baridimob")}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <p className="font-bold">BaridiMob</p>
                <p className="text-xs text-muted-foreground">
                  {getText("Virement via application mobile", "تحويل عبر التطبيق", "Mobile transfer")}
                </p>
              </div>
            </Button>
          </div>
        ) : method === "baridimob" ? (
          <div className="space-y-5 py-4">
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-5 rounded-xl space-y-4">
              <div className="flex items-center gap-3 border-b border-amber-500/20 pb-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Landmark className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-bold text-amber-700 dark:text-amber-400">
                    {getText("Informations BaridiMob", "معلومات بريدي موب", "BaridiMob Details")}
                  </p>
                  <p className="text-xs text-muted-foreground">RIP (Relevé d'Identité Postale)</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-background/50 p-3 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      {getText("Numéro RIP", "رقم RIP", "RIP Number")}
                    </p>
                    <p className="font-mono font-bold text-lg tracking-wider">{BARIDIMOB_INFO.rip}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-9 w-9 p-0"
                    onClick={() => copyToClipboard(BARIDIMOB_INFO.rip, "RIP")}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between bg-background/50 p-3 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      {getText("Titulaire", "صاحب الحساب", "Account Holder")}
                    </p>
                    <p className="font-bold">{BARIDIMOB_INFO.accountHolder}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-9 w-9 p-0"
                    onClick={() => copyToClipboard(BARIDIMOB_INFO.accountHolder, getText("Titulaire", "الاسم", "Name"))}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>

                <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">
                    {getText("Montant à transférer", "المبلغ المطلوب", "Amount to transfer")}
                  </p>
                  <p className="text-2xl font-black text-primary">{price} DA</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block">
                <span className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  {getText(
                    "Capture d'écran du transfert",
                    "لقطة شاشة التحويل",
                    "Transfer screenshot"
                  )}
                </span>
                <div className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors relative bg-muted/30">
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    accept="image/*"
                  />
                  {file ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      </div>
                      <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Upload className="w-10 h-10" />
                      <span className="text-sm">
                        {getText(
                          "Cliquez pour télécharger",
                          "انقر للتحميل",
                          "Click to upload"
                        )}
                      </span>
                      <span className="text-xs">PNG, JPG (max 5MB)</span>
                    </div>
                  )}
                </div>
              </label>

              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setMethod(null)} 
                  className="flex-1"
                  disabled={loading}
                >
                  {getText("Retour", "رجوع", "Back")}
                </Button>
                <Button 
                  onClick={handleBaridiMob} 
                  disabled={!file || loading}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {getText("Envoyer", "إرسال", "Submit")}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="font-bold mb-1">
                {getText("Paiement sécurisé par Stripe", "دفع آمن عبر Stripe", "Secure payment via Stripe")}
              </p>
              <p className="text-sm text-muted-foreground">
                {getText(
                  "Vous serez redirigé vers la page de paiement",
                  "ستتم إعادة توجيهك إلى صفحة الدفع",
                  "You will be redirected to the payment page"
                )}
              </p>
            </div>
            <div className="space-y-3">
              <Button 
                className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700" 
                disabled={loading} 
                onClick={handleStripe}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {getText("Payer", "ادفع", "Pay")} {price} DA
              </Button>
              <Button variant="ghost" onClick={() => setMethod(null)} className="w-full" disabled={loading}>
                {getText("Retour", "رجوع", "Back")}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
