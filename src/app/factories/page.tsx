"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  Phone,
  Mail,
  Building2,
  Filter,
  Factory,
  CheckCircle,
  Truck,
  Globe,
    RefreshCw,
    Trash2,
  } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navbar } from "@/components/Navbar";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";

export default function FactoriesPage() {
  const { language, factories, productionLines, user, fetchInitialData, deleteFactory } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleRefresh = async () => {
    setIsLoading(true);
    await fetchInitialData();
    setIsLoading(false);
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWilaya, setSelectedWilaya] = useState("all");

  const wilayas = [...new Set(factories.map(f => f.wilaya))];

  const filteredFactories = factories.filter((factory) => {
    const matchesSearch = factory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (factory.nameAr && factory.nameAr.includes(searchTerm)) ||
                         factory.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWilaya = selectedWilaya === "all" || factory.wilaya === selectedWilaya;
    return matchesSearch && matchesWilaya;
  });

  const getProductionCount = (factoryId: string) => {
    return productionLines.filter(p => p.factoryId === factoryId).length;
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
                <h1 className="text-3xl font-bold mb-2">{language === 'ar' ? "المصانع الشريكة" : "Usines Partenaires"}</h1>
                <p className="text-muted-foreground">
                  {language === "ar" 
                    ? "استكشف القدرات الصناعية الدوائية في الجزائر"
                    : "Explorez les capacités industrielles pharmaceutiques en Algérie"}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading} className="rounded-full">
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {language === "ar" ? "تحديث" : "Actualiser"}
              </Button>
            </div>

            {user?.role === 'factory' && !user.factoryId && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                    <Factory className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium">
                    {language === "ar" 
                      ? "هل أنت مصنع؟ سجل مؤسستك لتظهر هنا." 
                      : "Vous êtes une usine ? Enregistrez votre établissement pour apparaître ici."}
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
                placeholder={language === "ar" ? "ابحث عن مصنع..." : "Rechercher une usine..."}
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
                  <SelectItem value="all">{language === "ar" ? "كل الولايات" : "Toutes wilayas"}</SelectItem>
                  {wilayas.map(wilaya => (
                    <SelectItem key={wilaya} value={wilaya}>{wilaya}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFactories.map((factory, i) => (
            <motion.div
              key={factory.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 hover:border-primary/50 transition-colors border-t-4 border-primary"
            >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Factory className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                      {language === "ar" ? "مصنع معتمد" : "Usine Certifiée"}
                    </Badge>
                    {user?.role === 'admin' && (
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="h-8 rounded-full"
                        onClick={async (e) => {
                          e.preventDefault();
                          if (confirm(language === 'ar' ? "هل أنت متأكد من حذف هذا المصنع؟" : "Supprimer cette usine ?")) {
                            await deleteFactory(factory.id);
                          }
                        }}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        {language === 'ar' ? "حذف" : "Supprimer"}
                      </Button>
                    )}
                  </div>
                </div>


              <h3 className="text-xl font-bold mb-1">{factory.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{factory.nameAr}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{factory.address}, {factory.city}, {factory.wilaya}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{factory.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{factory.email}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-none">
                  <Building2 className="w-3 h-3 mr-1" />
                  {getProductionCount(factory.id)} {language === "ar" ? "خط إنتاج" : "lignes actives"}
                </Badge>
                <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-none">
                  <Truck className="w-3 h-3 mr-1" />
                  {language === "ar" ? "توزيع وطني" : "Distribution nationale"}
                </Badge>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 rounded-full">
                  <Mail className="w-4 h-4 mr-2" />
                  {language === "ar" ? "اتصل" : "Contact"}
                </Button>
                <Button className="flex-1 bg-primary hover:opacity-90 rounded-full font-bold uppercase italic">
                  <Globe className="w-4 h-4 mr-2" />
                  {language === "ar" ? "كتالوج" : "Catalogue"}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredFactories.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-20" />
            <h3 className="text-xl font-semibold mb-2">
              {language === "ar" ? "لا توجد مصانع حاليا" : "Aucune usine trouvée"}
            </h3>
          </motion.div>
        )}
      </div>
    </div>
  );
}
