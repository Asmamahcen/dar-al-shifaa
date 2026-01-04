"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  MapPin,
  Pill,
  Heart,
  ShoppingCart,
  Building2,
  AlertCircle,
  Database,
  BookOpen,
  CheckCircle,
  X,
  Info,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Navbar } from "@/components/Navbar";
import { Chatbot } from "@/components/Chatbot";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { toast } from "sonner";

interface AlgerianMedicine {
  id: string;
  registration_number: string;
  brand_name: string;
  brand_name_ar: string;
  dci: string;
  dci_ar: string;
  dosage: string;
  form: string;
  form_ar: string;
  conditioning: string;
  laboratory: string;
  country: string;
  is_reimbursable: boolean;
  reimbursement_rate: number;
  price_public: number;
  therapeutic_class: string;
  therapeutic_class_ar: string;
  is_generic: boolean;
}

const categories = ["all", "Pain Relief", "Antibiotics", "Gastro", "Vitamins", "Cardiovascular", "Respiratory"];
const therapeuticClasses = [
  "all",
  "Antalgique",
  "Antibiotique",
  "Anti-inflammatoire",
  "Antidiabétique",
  "Antihypertenseur",
  "Antihistaminique",
  "Antiulcéreux",
  "Bronchodilatateur",
  "Corticostéroïde",
  "Diurétique",
];

export default function MedicinesPage() {
  const language = useAppStore(state => state.language);
  const medicines = useAppStore(state => state.medicines);
  const pharmacies = useAppStore(state => state.pharmacies);
  const user = useAppStore(state => state.user);
  const addOrder = useAppStore(state => state.addOrder);
  
  const [activeTab, setActiveTab] = useState("pharmacy");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedWilaya, setSelectedWilaya] = useState("all");
  const [selectedTherapeuticClass, setSelectedTherapeuticClass] = useState("all");
  const [showDonationsOnly, setShowDonationsOnly] = useState(false);
  const [showGenericsOnly, setShowGenericsOnly] = useState(false);
  const [showReimbursableOnly, setShowReimbursableOnly] = useState(false);
  const [orderingId, setOrderingId] = useState<string | null>(null);
  
  const [algerianMedicines, setAlgerianMedicines] = useState<AlgerianMedicine[]>([]);
  const [loadingNomenclature, setLoadingNomenclature] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<AlgerianMedicine | null>(null);

  const wilayas = [...new Set(pharmacies.map(p => p.wilaya))];

  useEffect(() => {
    if (activeTab === "nomenclature") {
      loadNomenclature();
    }
  }, [activeTab, searchTerm, selectedTherapeuticClass, showGenericsOnly, showReimbursableOnly]);

  const loadNomenclature = async () => {
    setLoadingNomenclature(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("q", searchTerm);
      if (selectedTherapeuticClass !== "all") params.append("class", selectedTherapeuticClass);
      if (showGenericsOnly) params.append("generic", "true");
      params.append("limit", "50");
      
      const res = await fetch(`/api/medicines/search?${params.toString()}`);
      const data = await res.json();
      
      let filtered = data.medicines || [];
      if (showReimbursableOnly) {
        filtered = filtered.filter((m: AlgerianMedicine) => m.is_reimbursable);
      }
      
      setAlgerianMedicines(filtered);
    } catch (err) {
      console.error("Error loading nomenclature:", err);
      toast.error("Erreur de chargement");
    } finally {
      setLoadingNomenclature(false);
    }
  };

  const filteredMedicines = medicines.filter((med) => {
    const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         med.nameAr.includes(searchTerm) ||
                         med.genericName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || med.category === selectedCategory;
    const pharmacy = pharmacies.find(p => p.id === med.pharmacyId);
    const matchesWilaya = selectedWilaya === "all" || pharmacy?.wilaya === selectedWilaya;
    const matchesDonation = !showDonationsOnly || med.isDonation;
    return matchesSearch && matchesCategory && matchesWilaya && matchesDonation && med.quantity > 0;
  });

  const getPharmacy = (pharmacyId: string) => pharmacies.find(p => p.id === pharmacyId);

  const handleOrder = async (medicineId: string) => {
    if (!user) {
      toast.error(language === "ar" ? "يرجى تسجيل الدخول" : language === "en" ? "Please login first" : "Veuillez vous connecter");
      return;
    }

    const medicine = medicines.find(m => m.id === medicineId);
    if (!medicine) return;

    setOrderingId(medicineId);
    try {
      const orderId = `order-${Date.now()}`;
      await addOrder({
        id: orderId,
        userId: user.id,
        pharmacyId: medicine.pharmacyId,
        items: [{ medicineId: medicine.id, quantity: 1, price: medicine.price }],
        status: 'pending',
        totalAmount: medicine.isDonation ? 0 : medicine.price,
        deliveryFee: 0,
        deliveryAddress: user.address || (language === "ar" ? "الجزائر" : "Algérie"),
        paymentMethod: 'cash_on_delivery',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      toast.success(
        language === "ar" 
          ? (medicine.isDonation ? "تم إرسال طلب التبرع" : "تم إرسال الطلب بنجاح")
          : language === "en"
          ? (medicine.isDonation ? "Donation request sent" : "Order sent successfully")
          : (medicine.isDonation ? "Demande de don envoyée" : "Commande envoyée avec succès")
      );
    } catch (error) {
      toast.error("Error creating order");
    } finally {
      setOrderingId(null);
    }
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
          <h1 className="text-3xl font-bold mb-2">{t(language, "medicines")}</h1>
          <p className="text-muted-foreground">
            {language === "ar" 
              ? "ابحث عن الأدوية في الصيدليات القريبة منك أو استشر قاعدة البيانات الوطنية"
              : language === "en"
              ? "Search for medicines in nearby pharmacies or consult the national database"
              : "Recherchez des médicaments dans les pharmacies ou consultez la base nationale"}
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="pharmacy" className="gap-2">
              <Building2 className="w-4 h-4" />
              {language === "ar" ? "الصيدليات" : "Pharmacies"}
            </TabsTrigger>
            <TabsTrigger value="nomenclature" className="gap-2">
              <Database className="w-4 h-4" />
              {language === "ar" ? "قاعدة البيانات الوطنية" : "Base Nationale DZ"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pharmacy">
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
                    placeholder={t(language, "searchMedicines")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 text-lg"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-40">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{language === "ar" ? "كل الفئات" : language === "en" ? "All Categories" : "Toutes catégories"}</SelectItem>
                      {categories.slice(1).map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

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
                    variant={showDonationsOnly ? "default" : "outline"}
                    onClick={() => setShowDonationsOnly(!showDonationsOnly)}
                    className={showDonationsOnly ? "bg-pink-500 hover:bg-pink-600" : ""}
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    {t(language, "donation")}
                  </Button>
                </div>
              </div>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredMedicines.map((medicine, i) => {
                const pharmacy = getPharmacy(medicine.pharmacyId);
                return (
                  <motion.div
                    key={medicine.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card p-4 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <Pill className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex gap-1">
                        {medicine.requiresPrescription && (
                          <Badge variant="outline" className="text-xs">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Rx
                          </Badge>
                        )}
                        {medicine.isDonation && (
                          <Badge className="bg-pink-500 text-white text-xs">
                            <Heart className="w-3 h-3 mr-1" />
                            {language === "ar" ? "تبرع" : "Don"}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <h3 className="font-semibold mb-1">{medicine.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{medicine.genericName}</p>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">{medicine.category}</Badge>
                      <span className="text-xs text-muted-foreground">{medicine.manufacturer}</span>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold text-primary">
                        {medicine.isDonation ? (language === "ar" ? "مجاني" : "Gratuit") : `${medicine.price} DA`}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {medicine.quantity} {medicine.unit}
                      </span>
                    </div>

                    {pharmacy && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <Building2 className="w-4 h-4" />
                        <span>{pharmacy.name}</span>
                        <span>•</span>
                        <MapPin className="w-3 h-3" />
                        <span>{pharmacy.wilaya}</span>
                      </div>
                    )}

                    <Button 
                      className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                      onClick={() => handleOrder(medicine.id)}
                      disabled={orderingId === medicine.id}
                    >
                      {orderingId === medicine.id ? (
                        <span className="animate-pulse">...</span>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          {medicine.isDonation 
                            ? (language === "ar" ? "طلب" : language === "en" ? "Request" : "Demander")
                            : (language === "ar" ? "اطلب الآن" : language === "en" ? "Order Now" : "Commander")}
                        </>
                      )}
                    </Button>
                  </motion.div>
                );
              })}
            </div>

            {filteredMedicines.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <Pill className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">
                  {language === "ar" ? "لا توجد نتائج" : language === "en" ? "No results found" : "Aucun résultat"}
                </h3>
                <p className="text-muted-foreground">
                  {language === "ar" 
                    ? "جرب تغيير معايير البحث"
                    : language === "en"
                    ? "Try changing your search criteria"
                    : "Essayez de modifier vos critères de recherche"}
                </p>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="nomenclature">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 mb-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">
                    {language === "ar" ? "قاعدة البيانات الوطنية للأدوية" : "Base Nationale des Médicaments - Algérie"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? "LNCPP - وزارة الصحة" : "LNCPP - Ministère de la Santé"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder={language === "ar" ? "بحث بالاسم التجاري أو DCI..." : "Rechercher par nom commercial ou DCI..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 text-lg"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Select value={selectedTherapeuticClass} onValueChange={setSelectedTherapeuticClass}>
                    <SelectTrigger className="w-48">
                      <BookOpen className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Classe thérapeutique" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{language === "ar" ? "كل الأصناف" : "Toutes classes"}</SelectItem>
                      {therapeuticClasses.slice(1).map(cls => (
                        <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant={showGenericsOnly ? "default" : "outline"}
                    onClick={() => setShowGenericsOnly(!showGenericsOnly)}
                    className={showGenericsOnly ? "bg-blue-500 hover:bg-blue-600" : ""}
                  >
                    <Pill className="w-4 h-4 mr-2" />
                    {language === "ar" ? "جنيريك" : "Génériques"}
                  </Button>

                  <Button
                    variant={showReimbursableOnly ? "default" : "outline"}
                    onClick={() => setShowReimbursableOnly(!showReimbursableOnly)}
                    className={showReimbursableOnly ? "bg-green-500 hover:bg-green-600" : ""}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    CNAS
                  </Button>
                </div>
              </div>
            </motion.div>

            {loadingNomenclature ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {algerianMedicines.map((med, i) => (
                  <motion.div
                    key={med.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="glass-card p-4 hover:border-primary/50 transition-all cursor-pointer group"
                    onClick={() => setSelectedMedicine(med)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-600/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Pill className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="flex gap-1 flex-wrap justify-end">
                        {med.is_reimbursable && (
                          <Badge className="bg-green-500 text-white text-[10px]">
                            CNAS {med.reimbursement_rate}%
                          </Badge>
                        )}
                        {med.is_generic && (
                          <Badge variant="outline" className="text-[10px] border-blue-500 text-blue-600">
                            Générique
                          </Badge>
                        )}
                      </div>
                    </div>

                    <h3 className="font-bold mb-0.5">{med.brand_name}</h3>
                    {med.brand_name_ar && (
                      <p className="text-sm text-muted-foreground mb-1" dir="rtl">{med.brand_name_ar}</p>
                    )}
                    <p className="text-xs text-primary font-medium mb-2">DCI: {med.dci}</p>
                    
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <Badge variant="secondary" className="text-[10px]">{med.dosage}</Badge>
                      <Badge variant="outline" className="text-[10px]">{med.form}</Badge>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl font-black text-primary">{med.price_public} DA</span>
                      <span className="text-[10px] text-muted-foreground">{med.conditioning}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="font-semibold">{med.laboratory}</span>
                      <span>•</span>
                      <span>{med.country}</span>
                    </div>

                    <div className="mt-2 pt-2 border-t">
                      <Badge variant="outline" className="text-[9px] w-full justify-center">
                        {med.therapeutic_class}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {!loadingNomenclature && algerianMedicines.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <Database className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">
                  {language === "ar" ? "ابدأ البحث" : "Commencez votre recherche"}
                </h3>
                <p className="text-muted-foreground">
                  {language === "ar" 
                    ? "اكتب اسم الدواء للبحث في قاعدة البيانات الوطنية"
                    : "Tapez le nom du médicament pour rechercher dans la base nationale"}
                </p>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!selectedMedicine} onOpenChange={() => setSelectedMedicine(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                <Pill className="w-6 h-6 text-white" />
              </div>
              {selectedMedicine?.brand_name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedMedicine && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase">Nom commercial</p>
                  <p className="font-bold">{selectedMedicine.brand_name}</p>
                  {selectedMedicine.brand_name_ar && (
                    <p className="text-sm text-muted-foreground" dir="rtl">{selectedMedicine.brand_name_ar}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase">DCI (Générique)</p>
                  <p className="font-bold text-primary">{selectedMedicine.dci}</p>
                  {selectedMedicine.dci_ar && (
                    <p className="text-sm text-muted-foreground" dir="rtl">{selectedMedicine.dci_ar}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase">Dosage</p>
                  <Badge variant="secondary" className="font-bold">{selectedMedicine.dosage}</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase">Forme</p>
                  <p className="font-medium">{selectedMedicine.form}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase">Conditionnement</p>
                  <p className="font-medium">{selectedMedicine.conditioning}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase">Laboratoire</p>
                  <p className="font-bold">{selectedMedicine.laboratory}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase">Pays</p>
                  <p className="font-medium">{selectedMedicine.country}</p>
                </div>
              </div>

              <div className="bg-secondary/10 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase">Prix Public</p>
                    <p className="text-3xl font-black text-primary">{selectedMedicine.price_public} DA</p>
                  </div>
                  <div className="flex gap-2">
                    {selectedMedicine.is_reimbursable && (
                      <Badge className="bg-green-500 text-white font-bold py-2 px-4">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Remboursable CNAS {selectedMedicine.reimbursement_rate}%
                      </Badge>
                    )}
                    {selectedMedicine.is_generic && (
                      <Badge variant="outline" className="border-blue-500 text-blue-600 font-bold py-2 px-4">
                        Générique
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-muted-foreground uppercase">Classe Thérapeutique</p>
                <Badge variant="outline" className="text-sm py-1 px-3">
                  {selectedMedicine.therapeutic_class}
                </Badge>
                {selectedMedicine.therapeutic_class_ar && (
                  <Badge variant="outline" className="text-sm py-1 px-3 mr-2" dir="rtl">
                    {selectedMedicine.therapeutic_class_ar}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                  {language === "ar" 
                    ? "هذه المعلومات مرجعية فقط. استشر طبيبك أو الصيدلي قبل استخدام أي دواء."
                    : "Ces informations sont à titre indicatif. Consultez votre médecin ou pharmacien avant utilisation."}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Chatbot />
    </div>
  );
}
