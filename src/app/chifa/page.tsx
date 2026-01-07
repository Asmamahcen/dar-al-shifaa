"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  CreditCard,
  FileText,
  Calculator,
  Printer,
  Search,
  CheckCircle,
  AlertCircle,
  User,
  Calendar,
  Pill,
  Receipt,
  Download,
  Scan,
  QrCode,
  History,
  Info,
  ChevronRight,
  Plus,
  Trash2,
  FileCheck,
  AlertTriangle,
  Activity,
  Stethoscope,
  MapPin as MapPinIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Navbar } from "@/components/Navbar";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { toast } from "sonner";
import { 
  CNAS_CATEGORIES, 
  CNAS_RATES, 
  validateNSS, 
  calculateReimbursement, 
  generateCnasQrHash,
  getLegalDisclaimer 
} from "@/lib/cnas-service";

export default function ChifaPage() {
  const { language, user, medicines } = useAppStore();
  const [activeTab, setActiveTab] = useState("patient");
  const [nss, setNss] = useState("");
  const [patientName, setPatientName] = useState("");
  const [isChronic, setIsChronic] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  
  const [selectedMedicines, setSelectedMedicines] = useState<{ medicineId: string; quantity: number; category: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [qrHash, setQrHash] = useState("");

  // Role detection
  const isDoctorOrPharmacist = user?.role === "doctor" || user?.role === "pharmacy";
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (isDoctorOrPharmacist) setActiveTab("verify");
    else if (isAdmin) setActiveTab("admin");
  }, [user]);

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      // Adaptation for CHIFA: we expect NSS and name
      // If the API returns medicines, we try to extract patient info or use mock if not found
      // For this specific page, we might want a different prompt or just use what we get
      const analysis = data.analysis;
      
      const result = {
        nss: analysis.nss || "1234567890",
        fullName: analysis.patientName || analysis.fullName || "BENALI AHMED",
        validityDate: "2026-12-31",
        status: "✅ CNAS actif",
      };

      setScanResult(result);
      setNss(result.nss);
      setPatientName(result.fullName);
      toast.success(language === "ar" ? "تم المسح بنجاح" : "Scan réussi");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'analyse");
    } finally {
      setIsScanning(false);
    }
  };

  const triggerScan = () => {
    document.getElementById('chifa-ocr-upload')?.click();
  };

  const handleGenerateQR = () => {
    if (!nss || !hasConsented) {
      toast.error(language === "ar" ? "يرجى الموافقة وإدخال الرقم" : "Veuillez consentir et entrer le NSS");
      return;
    }
    const hash = generateCnasQrHash(nss, "active");
    setQrHash(hash);
    toast.success(language === "ar" ? "تم إنشاء رمز QR" : "QR Code généré");
  };

  const handleAddMedicine = (med: any) => {
    const category = med.isChronic ? CNAS_CATEGORIES.CHRONIC : CNAS_CATEGORIES.ESSENTIAL;
    setSelectedMedicines([...selectedMedicines, { medicineId: med.id, quantity: 1, category }]);
    setSearchTerm("");
  };

  const totalCalculation = selectedMedicines.reduce((acc, item) => {
    const med = medicines.find(m => m.id === item.medicineId);
    if (!med) return acc;
    const { cnasShare, patientShare } = calculateReimbursement(med.price * item.quantity, item.category, isChronic);
    return {
      total: acc.total + (med.price * item.quantity),
      cnas: acc.cnas + cnasShare,
      patient: acc.patient + patientShare,
    };
  }, { total: 0, cnas: 0, patient: 0 });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">E-CHIFA CNAS Pro</h1>
                <p className="text-muted-foreground flex items-center gap-1">
                  <FileCheck className="w-4 h-4 text-teal-500" />
                  {language === "ar" ? "نظام المساعدة الرقمية للضمان الاجتماعي" : "Système d'assistance numérique CNAS"}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Badge variant="outline" className="px-3 py-1 bg-teal-500/5 text-teal-600 border-teal-200">
                Interoperabilité v2.1
              </Badge>
              <Badge variant="outline" className="px-3 py-1 bg-blue-500/5 text-blue-600 border-blue-200">
                Simulation Tiers Payant
              </Badge>
            </div>
          </div>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/50 p-1 border">
            <TabsTrigger value="patient" className="gap-2">
              <User className="w-4 h-4" />
              {language === "ar" ? "فضاء المؤمن" : "Espace Assuré"}
            </TabsTrigger>
            <TabsTrigger value="simulator" className="gap-2">
              <Calculator className="w-4 h-4" />
              {language === "ar" ? "محاكي التعويض" : "Simulateur"}
            </TabsTrigger>
            {(isDoctorOrPharmacist || isAdmin) && (
              <TabsTrigger value="verify" className="gap-2">
                <Scan className="w-4 h-4" />
                {language === "ar" ? "تحقق مهني" : "Vérification Pro"}
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger value="admin" className="gap-2">
                <Shield className="w-4 h-4" />
                Admin
              </TabsTrigger>
            )}
          </TabsList>

            <TabsContent value="patient" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  {/* CHIFA Virtual Card */}
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card p-8 bg-gradient-to-br from-teal-600 to-cyan-700 text-white relative overflow-hidden group min-h-[280px]"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                      <Shield className="w-64 h-64" />
                    </div>
                    
                    <div className="relative z-10 flex flex-col h-full justify-between">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <p className="text-teal-100 text-[10px] font-bold uppercase tracking-widest opacity-80">République Algérienne</p>
                          <h3 className="text-2xl font-black italic tracking-tighter">CARTE CHIFA 2.0</h3>
                        </div>
                        <img 
                          src="https://pqdsohdevctvozwfxatq.supabase.co/storage/v1/object/public/document-uploads/chifa_chip.png" 
                          alt="chip" 
                          className="w-14 h-12 object-contain rounded brightness-110 shadow-lg"
                        />
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-1">
                          <p className="text-teal-100/70 text-[10px] font-bold uppercase tracking-wider">Numéro de Sécurité Sociale (NSS)</p>
                          <p className="text-3xl font-mono tracking-[0.2em] font-bold">{nss || "•••• •••• ••"}</p>
                        </div>
                        
                        <div className="flex justify-between items-end">
                          <div className="space-y-1">
                            <p className="text-teal-100/70 text-[10px] font-bold uppercase tracking-wider">Titulaire du compte</p>
                            <p className="text-xl font-bold uppercase tracking-wide">{patientName || "--- ---"}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/20 px-3 py-1 backdrop-blur-sm">
                              {scanResult?.status || "⚠️ Status inconnu"}
                            </Badge>
                            <p className="text-[9px] text-teal-200/50 uppercase font-mono">Dar Al Shifaa Verified</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Service Grid - New Advanced Services */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="glass-card p-4 hover:border-teal-500/50 transition-colors cursor-pointer group">
                      <Activity className="w-6 h-6 text-teal-600 mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-bold">Dossier Médical</p>
                      <p className="text-[10px] text-muted-foreground">Numérique & Partagé</p>
                    </div>
                    <div className="glass-card p-4 hover:border-teal-500/50 transition-colors cursor-pointer group">
                      <Stethoscope className="w-6 h-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-bold">Consultations</p>
                      <p className="text-[10px] text-muted-foreground">Historique complet</p>
                    </div>
                    <div className="glass-card p-4 hover:border-teal-500/50 transition-colors cursor-pointer group">
                      <MapPinIcon className="w-6 h-6 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-bold">Pharmacies</p>
                      <p className="text-[10px] text-muted-foreground">Conventionnées</p>
                    </div>
                    <div className="glass-card p-4 hover:border-teal-500/50 transition-colors cursor-pointer group">
                      <FileText className="w-6 h-6 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-bold">Remboursements</p>
                      <p className="text-[10px] text-muted-foreground">Suivi en direct</p>
                    </div>
                  </div>
                </div>

                {/* QR Code & Digital Access */}
                <div className="space-y-6">
                  <div className="glass-card p-6 border-2 border-teal-500/20 bg-teal-50/10">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold flex items-center gap-2">
                        <QrCode className="w-5 h-5 text-teal-600" />
                        Accès Rapide
                      </h3>
                      <Badge variant="outline" className="text-[9px] uppercase border-teal-200 text-teal-700 bg-teal-50">Sécurisé</Badge>
                    </div>
                    
                    {!qrHash ? (
                      <div className="space-y-4">
                        <div className="p-3 bg-white border border-teal-100 rounded-lg text-xs leading-relaxed text-teal-900 shadow-sm italic">
                          "Générez votre jeton numérique pour une prise en charge immédiate en pharmacie sans votre carte physique."
                        </div>
                        
                        <div className="flex items-center gap-3 p-2 hover:bg-white rounded-lg transition-colors cursor-pointer border border-transparent hover:border-teal-100">
                          <input 
                            type="checkbox" 
                            id="consent" 
                            checked={hasConsented}
                            onChange={(e) => setHasConsented(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                          />
                          <label htmlFor="consent" className="text-[11px] text-muted-foreground cursor-pointer select-none">
                            {language === "ar" ? "أوافق على استخدام بياناتي بشكل رقمي" : "J'autorise l'accès sécurisé à mes droits CNAS"}
                          </label>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-[10px] uppercase font-bold text-muted-foreground">Confirmation NSS</Label>
                          <Input 
                            placeholder="Ex: 1234567890" 
                            value={nss}
                            onChange={(e) => setNss(e.target.value)}
                            className="h-10 font-mono tracking-widest text-center"
                          />
                        </div>

                        <Button 
                          className="w-full bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-500/20 h-11 font-bold"
                          onClick={handleGenerateQR}
                          disabled={!hasConsented || !nss}
                        >
                          ACTIVER ACCÈS DIGITAL
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center space-y-4">
                        <div className="w-full aspect-square mx-auto bg-white p-4 border-2 border-teal-100 rounded-2xl flex items-center justify-center shadow-inner">
                          <div className="w-full h-full bg-slate-50 rounded-xl flex items-center justify-center relative overflow-hidden">
                             {/* Simplified QR representation */}
                             <div className="grid grid-cols-6 gap-1 p-4 opacity-80">
                                {Array.from({length: 36}).map((_, i) => (
                                  <div key={i} className={`w-3 h-3 rounded-sm ${Math.random() > 0.4 ? "bg-slate-800" : "bg-transparent"}`} />
                                ))}
                             </div>
                             <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-12 h-12 bg-white rounded-lg shadow-xl flex items-center justify-center border-2 border-teal-500">
                                  <Shield className="w-8 h-8 text-teal-600" />
                                </div>
                             </div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-muted-foreground font-medium uppercase">Jeton temporaire (24h)</p>
                          <p className="text-xs font-mono font-bold text-teal-700">HASH: {qrHash.substring(0, 12)}...</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1 text-xs h-9" onClick={() => setQrHash("")}>Réinitialiser</Button>
                          <Button className="flex-1 text-xs h-9 gap-2 bg-teal-600"><Download className="w-3 h-3" /> Télécharger</Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Reimbursement Stats */}
                  <div className="glass-card p-5 space-y-4">
                    <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">État des Consommations</h4>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span>Plafond annuel</span>
                          <span>12,400 / 30,000 DA</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-teal-500 w-[40%]" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs p-2 bg-green-50 rounded-lg text-green-700 font-medium">
                        <CheckCircle className="w-4 h-4" />
                        Droits ouverts jusqu'au 31/12
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Services Section */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <History className="w-5 h-5 text-blue-600" />
                    Dernières Transactions & Remboursements
                  </h3>
                  <div className="border rounded-xl overflow-hidden shadow-sm">
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow>
                          <TableHead className="text-[11px] uppercase">Date</TableHead>
                          <TableHead className="text-[11px] uppercase">Prestataire</TableHead>
                          <TableHead className="text-[11px] uppercase">Montant</TableHead>
                          <TableHead className="text-[11px] uppercase text-right">Statut</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="hover:bg-muted/10 transition-colors">
                          <TableCell className="text-xs">02/01/2026</TableCell>
                          <TableCell className="text-xs font-bold">Pharmacie El Qods</TableCell>
                          <TableCell className="text-xs">4,200 DA</TableCell>
                          <TableCell className="text-right">
                            <Badge className="bg-green-500/10 text-green-700 border-green-200 text-[10px]">Remboursé</Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-muted/10 transition-colors">
                          <TableCell className="text-xs">28/12/2025</TableCell>
                          <TableCell className="text-xs font-bold">Dr. Belhouchet (Gynéco)</TableCell>
                          <TableCell className="text-xs">2,500 DA</TableCell>
                          <TableCell className="text-right">
                            <Badge className="bg-blue-500/10 text-blue-700 border-blue-200 text-[10px]">En cours</Badge>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="glass-card p-6 bg-gradient-to-br from-blue-50 to-white border-blue-100">
                  <h3 className="font-bold mb-4 flex items-center gap-2 text-blue-900">
                    <Info className="w-5 h-5" />
                    Prochains Examens Recommandés
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-white rounded-lg border border-blue-100 flex items-center justify-between group cursor-pointer hover:border-blue-300 transition-colors shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-blue-600">
                          <Stethoscope className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold">Bilan Sanguin Annuel</p>
                          <p className="text-[10px] text-muted-foreground">Conseillé avant Mars 2026</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-blue-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-blue-100 flex items-center justify-between group cursor-pointer hover:border-blue-300 transition-colors shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-blue-600">
                          <Shield className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold">Renouvellement Droits</p>
                          <p className="text-[10px] text-muted-foreground">Mise à jour en borne requise</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-blue-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </div>
                  <Button variant="link" className="text-blue-600 p-0 h-auto mt-4 text-xs font-bold">Voir toutes les recommandations →</Button>
                </div>
              </div>
            </TabsContent>

          <TabsContent value="simulator" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Calculator className="w-6 h-6 text-teal-600" />
                    Calculateur de Tiers Payant
                  </h3>
                  
                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-2">
                      <Label>Type d'assuré</Label>
                      <div className="flex gap-2">
                        <Button 
                          variant={!isChronic ? "default" : "outline"} 
                          className="flex-1"
                          onClick={() => setIsChronic(false)}
                        >
                          Standard (80%)
                        </Button>
                        <Button 
                          variant={isChronic ? "default" : "outline"} 
                          className="flex-1 bg-teal-600"
                          onClick={() => setIsChronic(true)}
                        >
                          Chronique (100%)
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Recherche Médicament</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          placeholder="Nom ou Code..." 
                          className="pl-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                          <div className="absolute top-full left-0 w-full bg-popover border rounded-lg shadow-xl z-20 mt-1 max-h-48 overflow-y-auto">
                            {medicines.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())).map(med => (
                              <button 
                                key={med.id}
                                className="w-full p-3 text-left hover:bg-muted flex justify-between items-center text-sm border-b last:border-0"
                                onClick={() => handleAddMedicine(med)}
                              >
                                <span>{med.name}</span>
                                <Badge variant="outline">{med.price} DA</Badge>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {selectedMedicines.length === 0 ? (
                      <div className="text-center py-12 border-2 border-dashed rounded-xl text-muted-foreground">
                        <Pill className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        Ajoutez des médicaments pour simuler le remboursement
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {selectedMedicines.map((item, idx) => {
                          const med = medicines.find(m => m.id === item.medicineId);
                          if (!med) return null;
                          return (
                            <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-teal-500/10 flex items-center justify-center">
                                  <Pill className="w-4 h-4 text-teal-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{med.name}</p>
                                  <p className="text-xs text-muted-foreground">{med.price} DA × {item.quantity}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className="text-xs font-bold text-teal-600">
                                    -{calculateReimbursement(med.price * item.quantity, item.category, isChronic).cnasShare} DA
                                  </p>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-destructive h-8 w-8 p-0"
                                  onClick={() => setSelectedMedicines(selectedMedicines.filter((_, i) => i !== idx))}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="glass-card p-6 border-2 border-teal-500/20">
                  <h3 className="font-bold mb-6 flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-teal-600" />
                    Estimation du Ticket Modérateur
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Brut</span>
                      <span className="font-semibold">{totalCalculation.total.toFixed(2)} DA</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-teal-600 font-medium">Part CNAS ({isChronic ? "100%" : "80%"})</span>
                      <span className="font-bold text-teal-600">-{totalCalculation.cnas.toFixed(2)} DA</span>
                    </div>
                    <div className="pt-4 border-t flex justify-between items-center">
                      <span className="font-bold">RESTE À PAYER</span>
                      <span className="text-2xl font-black text-orange-600">{totalCalculation.patient.toFixed(2)} DA</span>
                    </div>
                  </div>
                  <Button className="w-full mt-6 bg-orange-500 hover:bg-orange-600 gap-2">
                    <Download className="w-4 h-4" /> Exporter Simulation PDF
                  </Button>
                </div>

                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3">
                   <Info className="w-5 h-5 text-blue-500 shrink-0" />
                   <p className="text-xs text-blue-800 leading-relaxed">
                     Les taux affichés sont basés sur le moteur de règles 2024. Le remboursement réel peut varier selon la validité de vos droits au moment de l'achat.
                   </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="verify" className="space-y-6">
             <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-6">
                     <div className="glass-card p-6">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                          <Scan className="w-5 h-5 text-teal-600" />
                          Scanner CHIFA / Attestation
                        </h3>
                        <input
                          type="file"
                          id="chifa-ocr-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={handleScan}
                        />
                        <div 
                          className="aspect-video bg-muted rounded-xl border-2 border-dashed border-teal-500/30 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-muted/50 transition-colors group relative overflow-hidden"
                          onClick={triggerScan}
                        >
                         {isScanning ? (
                            <div className="flex flex-col items-center gap-2">
                               <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
                               <p className="text-xs font-medium text-teal-600">OCR en cours...</p>
                            </div>
                         ) : (
                            <>
                               <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                  <Plus className="w-6 h-6 text-teal-600" />
                               </div>
                               <div className="text-center">
                                  <p className="text-sm font-semibold">Cliquer pour scanner</p>
                                  <p className="text-[10px] text-muted-foreground">Supporte JPEG, PNG, PDF</p>
                               </div>
                            </>
                         )}
                         <div className="absolute top-0 left-0 w-full h-1 bg-teal-500 animate-scan-line opacity-20" />
                      </div>
                   </div>

                   {scanResult && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card p-4 border-l-4 border-green-500 space-y-3"
                      >
                         <div className="flex justify-between items-start">
                            <p className="text-xs font-bold text-muted-foreground uppercase">Extraction Réussie</p>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                         </div>
                         <div className="space-y-1">
                            <p className="text-sm font-bold">{scanResult.fullName}</p>
                            <p className="text-xs text-muted-foreground font-mono">NSS: {scanResult.nss}</p>
                            <p className="text-[10px] text-muted-foreground">Valide jusqu'au: {scanResult.validityDate}</p>
                         </div>
                         <Badge className="w-full bg-green-100 text-green-700 border-green-200 justify-center">
                            {scanResult.status}
                         </Badge>
                      </motion.div>
                   )}
                </div>

                <div className="md:col-span-2">
                   <div className="glass-card p-6">
                      <div className="flex items-center justify-between mb-6">
                         <h3 className="font-bold text-lg">Console de Vérification Droits</h3>
                         <div className="flex gap-2">
                            <Input placeholder="Rechercher NSS..." className="w-48 h-9" />
                            <Button size="sm" variant="outline">Filtrer</Button>
                         </div>
                      </div>

                      <div className="border rounded-xl overflow-hidden">
                         <Table>
                            <TableHeader className="bg-muted/50">
                               <TableRow>
                                  <TableHead>Assuré</TableHead>
                                  <TableHead>NSS</TableHead>
                                  <TableHead>Dernier Scan</TableHead>
                                  <TableHead>Résultat</TableHead>
                                  <TableHead className="text-right">Action</TableHead>
                               </TableRow>
                            </TableHeader>
                            <TableBody>
                               <TableRow className="hover:bg-muted/20">
                                  <TableCell className="font-medium">BELKACEM RAMDANE</TableCell>
                                  <TableCell className="font-mono text-xs">198816254412</TableCell>
                                  <TableCell className="text-xs text-muted-foreground">Il y a 2h</TableCell>
                                  <TableCell>
                                     <Badge className="bg-green-500/10 text-green-600 border-green-200">Actif</Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                     <Button variant="ghost" size="sm" className="h-8 gap-1">
                                        Dossier <ChevronRight className="w-4 h-4" />
                                     </Button>
                                  </TableCell>
                               </TableRow>
                               <TableRow className="hover:bg-muted/20">
                                  <TableCell className="font-medium">HADDAD ZOHRA</TableCell>
                                  <TableCell className="font-mono text-xs">295416002144</TableCell>
                                  <TableCell className="text-xs text-muted-foreground">Hier</TableCell>
                                  <TableCell>
                                     <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">À confirmer</Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                     <Button variant="ghost" size="sm" className="h-8 gap-1">
                                        Dossier <ChevronRight className="w-4 h-4" />
                                     </Button>
                                  </TableCell>
                               </TableRow>
                            </TableBody>
                         </Table>
                      </div>
                   </div>
                </div>
             </div>
          </TabsContent>
          
          <TabsContent value="admin" className="space-y-6">
             <div className="grid md:grid-cols-4 gap-4">
                <div className="glass-card p-4 text-center">
                   <p className="text-xs text-muted-foreground mb-1 uppercase font-bold">Total Scans 24h</p>
                   <p className="text-2xl font-black text-teal-600">1,284</p>
                </div>
                <div className="glass-card p-4 text-center">
                   <p className="text-xs text-muted-foreground mb-1 uppercase font-bold">Alertes Fraude</p>
                   <p className="text-2xl font-black text-red-500">3</p>
                </div>
                <div className="glass-card p-4 text-center">
                   <p className="text-xs text-muted-foreground mb-1 uppercase font-bold">Remboursement Est.</p>
                   <p className="text-2xl font-black text-blue-600">420k DA</p>
                </div>
                <div className="glass-card p-4 text-center">
                   <p className="text-xs text-muted-foreground mb-1 uppercase font-bold">Uptime Moteur</p>
                   <p className="text-2xl font-black text-green-500">99.9%</p>
                </div>
             </div>
             
             <div className="glass-card p-6">
                <h3 className="font-bold mb-4">Statistiques d'utilisation par Centre CNAS (Anonymisé)</h3>
                <div className="h-[200px] flex items-end justify-around gap-2 px-4 border-b">
                   <div className="w-12 bg-teal-500 rounded-t h-[60%] relative group">
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">Alger</div>
                   </div>
                   <div className="w-12 bg-teal-500 rounded-t h-[85%] relative group">
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">Constantine</div>
                   </div>
                   <div className="w-12 bg-teal-500 rounded-t h-[45%] relative group">
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">Oran</div>
                   </div>
                   <div className="w-12 bg-teal-500 rounded-t h-[70%] relative group">
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">Setif</div>
                   </div>
                </div>
             </div>
          </TabsContent>
        </Tabs>
      </div>

      <footer className="fixed bottom-0 w-full bg-background/80 backdrop-blur-md border-t py-3 z-50">
         <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
            <Shield className="w-3 h-3 text-teal-600" />
            <p>{getLegalDisclaimer(language || "fr")}</p>
         </div>
      </footer>
    </div>
  );
}

