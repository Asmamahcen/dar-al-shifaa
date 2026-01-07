"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Shield, 
  Save,
  ChevronLeft,
  Bell,
  Lock,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();
  const { language, user, updateUser, isHydrated } = useAppStore();
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    wilaya: "",
    specialty: "",
    licenseNumber: "",
  });

  useEffect(() => {
    if (isHydrated && !user) {
      router.push("/login");
    }
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        wilaya: user.wilaya || "",
        specialty: user.specialty || "",
        licenseNumber: user.licenseNumber || "",
      });
    }
  }, [user, isHydrated, router]);

  const handleSave = async () => {
    if (!user) return;
    try {
      await updateUser(user.id, formData);
      toast.success(language === "ar" ? "تم تحديث الإعدادات بنجاح" : "Paramètres mis à jour avec succès");
    } catch (error) {
      toast.error(language === "ar" ? "حدث خطأ أثناء التحديث" : "Erreur lors de la mise à jour");
    }
  };

  if (!isHydrated || !user) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent uppercase italic">
              {t(language, "myAccount")}
            </h1>
            <p className="text-muted-foreground">{t(language, "settings")}</p>
          </div>
        </div>

        <div className="grid gap-6">
          <Card className="glass-card overflow-hidden">
            <div className="h-2 w-full bg-gradient-to-r from-primary to-accent" />
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-3xl font-black">
                {user.fullName.charAt(0)}
              </div>
              <div>
                <CardTitle className="text-2xl font-black uppercase italic">{user.fullName}</CardTitle>
                <Badge variant="secondary" className="mt-1 uppercase font-black text-[10px]">
                  {t(language, user.role as any)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="uppercase font-black text-[10px] flex items-center gap-2">
                    <User className="h-3 w-3" /> {t(language, "fullName")}
                  </Label>
                  <Input 
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="uppercase font-black text-[10px] flex items-center gap-2">
                    <Mail className="h-3 w-3" /> {t(language, "email")}
                  </Label>
                  <Input 
                    value={formData.email}
                    disabled
                    className="bg-secondary/20 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="uppercase font-black text-[10px] flex items-center gap-2">
                    <Phone className="h-3 w-3" /> {t(language, "phone")}
                  </Label>
                  <Input 
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="uppercase font-black text-[10px] flex items-center gap-2">
                    <MapPin className="h-3 w-3" /> {t(language, "wilaya")}
                  </Label>
                  <Input 
                    value={formData.wilaya}
                    onChange={(e) => setFormData({ ...formData, wilaya: e.target.value })}
                    className="font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="uppercase font-black text-[10px] flex items-center gap-2">
                  <Building className="h-3 w-3" /> {t(language, "address")}
                </Label>
                <Input 
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="font-bold"
                />
              </div>

              {user.role === 'doctor' && (
                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div className="space-y-2">
                    <Label className="uppercase font-black text-[10px]">Spécialité</Label>
                    <Input 
                      value={formData.specialty}
                      onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                      className="font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="uppercase font-black text-[10px]">N° Inscription</Label>
                    <Input 
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      className="font-mono"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleSave}
                  className="rounded-full font-black uppercase italic px-8 shadow-xl bg-gradient-to-r from-primary to-accent hover:opacity-90"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {t(language, "save")}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg font-black uppercase italic flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" /> Sécurité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-xl">
                  <div className="text-sm font-bold uppercase">Mot de passe</div>
                  <Button variant="outline" size="sm" className="rounded-full text-[10px] font-black uppercase italic">Modifier</Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-xl">
                  <div className="text-sm font-bold uppercase">Double Auth (2FA)</div>
                  <Badge variant="outline">Désactivé</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg font-black uppercase italic flex items-center gap-2">
                  <Bell className="h-5 w-5 text-accent" /> Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-xl">
                  <div className="text-sm font-bold uppercase">Emails</div>
                  <Badge className="bg-green-500">Activé</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-xl">
                  <div className="text-sm font-bold uppercase">Alertes Stock</div>
                  <Badge className="bg-green-500">Activé</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
