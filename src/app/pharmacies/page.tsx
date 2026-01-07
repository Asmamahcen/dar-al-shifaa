"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Search,
  MapPin,
  Clock,
  Phone,
  Mail,
  Truck,
  Star,
  Navigation,
  Building2,
  Filter,
    CheckCircle,
    RefreshCw,
    Trash2,
    MessageSquare,
  } from "lucide-react";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { Badge } from "@/components/ui/badge";
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
  import { Navbar } from "@/components/Navbar";
  import { useAppStore } from "@/lib/store";
  import { t } from "@/lib/i18n";
  import { StarRating } from "@/components/reviews/StarRating";
  import { ReviewForm } from "@/components/reviews/ReviewForm";
  import { ReviewList } from "@/components/reviews/ReviewList";
  import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog";

  export default function PharmaciesPage() {
  const { language, pharmacies, medicines, user, fetchInitialData, deletePharmacy } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWilaya, setSelectedWilaya] = useState("all");
  const [filterOpen24h, setFilterOpen24h] = useState(false);
  const [filterDelivery, setFilterDelivery] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleRefresh = async () => {
    setIsLoading(true);
    await fetchInitialData();
    setIsLoading(false);
  };

  const wilayas = [...new Set(pharmacies.map(p => p.wilaya))];

  const filteredPharmacies = pharmacies.filter((pharmacy) => {
    const matchesSearch = pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pharmacy.nameAr.includes(searchTerm) ||
                         pharmacy.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWilaya = selectedWilaya === "all" || pharmacy.wilaya === selectedWilaya;
    const matches24h = !filterOpen24h || pharmacy.isOpen24h;
    const matchesDelivery = !filterDelivery || pharmacy.hasDelivery;
    return matchesSearch && matchesWilaya && matches24h && matchesDelivery;
  });

  const getMedicineCount = (pharmacyId: string) => {
    return medicines.filter(m => m.pharmacyId === pharmacyId).length;
  };

  const isOpen = (pharmacy: typeof pharmacies[0]) => {
    if (pharmacy.isOpen24h) return true;
    const now = new Date();
    const dayIndex = now.getDay();
    const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    const today = pharmacy.openingHours.find(h => h.day === days[dayIndex]);
    if (!today || !today.isOpen) return false;
    
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [openH, openM] = today.open.split(":").map(Number);
    const [closeH, closeM] = today.close.split(":").map(Number);
    const openTime = openH * 60 + openM;
    const closeTime = closeH * 60 + closeM;
    
    return currentTime >= openTime && currentTime <= closeTime;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{t(language, "pharmacies")}</h1>
                <p className="text-muted-foreground">
                  {language === "ar" 
                    ? "اعثر على الصيدليات القريبة منك"
                    : language === "en"
                    ? "Find pharmacies near you"
                    : "Trouvez les pharmacies près de chez vous"}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading} className="rounded-full">
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {language === "ar" ? "تحديث" : "Actualiser"}
              </Button>
            </div>

            {user?.role === 'pharmacy' && !user.pharmacyId && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium">
                    {language === "ar" 
                      ? "هل أنت صيدلي؟ سجل صيدليتك لتظهر هنا." 
                      : "Vous êtes pharmacien ? Enregistrez votre pharmacie pour apparaître ici."}
                  </p>
                </div>
                <Button size="sm" className="rounded-full font-bold uppercase italic" asChild>
                  <Link href="/dashboard">S'enregistrer maintenant</Link>
                </Button>
              </motion.div>
            )}
          </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder={language === "ar" ? "ابحث عن صيدلية..." : language === "en" ? "Search pharmacies..." : "Rechercher une pharmacie..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={selectedWilaya} onValueChange={setSelectedWilaya}>
                <SelectTrigger className="w-40">
                  <MapPin className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === "ar" ? "كل الولايات" : language === "en" ? "All Wilayas" : "Toutes wilayas"}</SelectItem>
                  {wilayas.map(wilaya => (
                    <SelectItem key={wilaya} value={wilaya}>{wilaya}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant={filterOpen24h ? "default" : "outline"}
                onClick={() => setFilterOpen24h(!filterOpen24h)}
                className={filterOpen24h ? "bg-green-500 hover:bg-green-600" : ""}
              >
                <Clock className="w-4 h-4 mr-2" />
                24/7
              </Button>

              <Button
                variant={filterDelivery ? "default" : "outline"}
                onClick={() => setFilterDelivery(!filterDelivery)}
                className={filterDelivery ? "bg-blue-500 hover:bg-blue-600" : ""}
              >
                <Truck className="w-4 h-4 mr-2" />
                {t(language, "delivery")}
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPharmacies.map((pharmacy, i) => (
            <motion.div
              key={pharmacy.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 hover:border-primary/50 transition-colors"
            >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Building2 className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className="bg-primary/20 text-primary border-primary/30">
                      <Building2 className="w-3 h-3 mr-1" />
                      {language === "ar" ? "صيدلية" : "Pharmacie"}
                    </Badge>
                    <div className="flex items-center gap-2">
                      {pharmacy.verified && (
                        <Badge className="bg-blue-500">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {language === "ar" ? "موثق" : "Vérifié"}
                        </Badge>
                      )}
                      <Badge variant={isOpen(pharmacy) ? "default" : "secondary"} className={isOpen(pharmacy) ? "bg-green-500" : ""}>
                        {isOpen(pharmacy) 
                          ? (language === "ar" ? "مفتوح" : language === "en" ? "Open" : "Ouvert")
                          : (language === "ar" ? "مغلق" : language === "en" ? "Closed" : "Fermé")}
                      </Badge>
                    </div>
                    {user?.role === 'admin' && (
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="h-8 rounded-full"
                        onClick={async (e) => {
                          e.preventDefault();
                          if (confirm(language === 'ar' ? "هل أنت متأكد من حذف هذه الصيدلية؟" : "Supprimer cette pharmacie ?")) {
                            await deletePharmacy(pharmacy.id);
                          }
                        }}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        {language === 'ar' ? "حذف" : "Supprimer"}
                      </Button>
                    )}
                  </div>
                </div>


              <h3 className="text-xl font-bold mb-1">{pharmacy.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{pharmacy.nameAr}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{pharmacy.address}, {pharmacy.city}, {pharmacy.wilaya}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{pharmacy.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{pharmacy.email}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {pharmacy.isOpen24h && (
                  <Badge variant="outline" className="text-green-500 border-green-500/30">
                    <Clock className="w-3 h-3 mr-1" />
                    24/7
                  </Badge>
                )}
                {pharmacy.hasDelivery && (
                  <Badge variant="outline" className="text-blue-500 border-blue-500/30">
                    <Truck className="w-3 h-3 mr-1" />
                    {t(language, "delivery")}
                  </Badge>
                )}
                <Badge variant="outline">
                  {getMedicineCount(pharmacy.id)} {language === "ar" ? "دواء" : "médicaments"}
                </Badge>
              </div>

                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex-1">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        {language === "ar" ? "آراء" : "Avis"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{pharmacy.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-secondary rounded-lg">
                            <p className="text-sm text-muted-foreground">Ville</p>
                            <p className="font-semibold">{pharmacy.city}</p>
                          </div>
                          <div className="p-4 bg-secondary rounded-lg">
                            <p className="text-sm text-muted-foreground">Wilaya</p>
                            <p className="font-semibold">{pharmacy.wilaya}</p>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Donner votre avis</h3>
                          <ReviewForm targetId={pharmacy.id} targetType="pharmacy" />
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Avis des clients</h3>
                          <ReviewList targetId={pharmacy.id} targetType="pharmacy" />
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90">
                    <Navigation className="w-4 h-4 mr-2" />
                    {language === "ar" ? "الاتجاهات" : language === "en" ? "Directions" : "Itinéraire"}
                  </Button>
                </div>
            </motion.div>
          ))}
        </div>

        {filteredPharmacies.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">
              {language === "ar" ? "لا توجد صيدليات" : language === "en" ? "No pharmacies found" : "Aucune pharmacie trouvée"}
            </h3>
          </motion.div>
        )}
      </div>
    </div>
  );
}

