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
  ScanLine,
  QrCode,
  History,
  Info,
  ChevronRight,
  Plus,
  Trash2,
  FileCheck,
  AlertTriangle,
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

  const handleScan = () => {
    setIsScanning(true);
    // Simulate OCR with tesseract.js pattern
    setTimeout(() => {
      setIsScanning(false);
      const mockResult = {
        nss: "1234567890",
        fullName: "BENALI AHMED",
        validityDate: "2026-12-31",
        status: "✅ CNAS actif",
      };
      setScanResult(mockResult);
      setNss(mockResult.nss);
      setPatientName(mockResult.fullName);
      toast.success(language === "ar" ? "تم المسح بنجاح" : "Scan réussi");
    }, 2000);
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
                <ScanLine className="w-4 h-4" />
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
            <div className="grid md:grid-cols-2 gap-6">
              {/* CHIFA Virtual Card */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card p-8 bg-gradient-to-br from-teal-600 to-cyan-700 text-white relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                  <Shield className="w-48 h-48" />
                </div>
                
                <div className="relative z-10 flex flex-col h-full justify-between min-h-[220px]">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-teal-100 text-xs font-medium uppercase tracking-widest">République Algérienne</p>
                      <h3 className="text-xl font-bold">CARTE CHIFA DIGITALE</h3>
                    </div>
                    <img 
                      src="https://pqdsohdevctvozwfxatq.supabase.co/storage/v1/object/public/document-uploads/chifa_chip.png" 
                      alt="chip" 
                      className="w-12 h-10 object-contain rounded"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-teal-100/70 text-[10px] uppercase">Numéro de Sécurité Sociale (NSS)</p>
                      <p className="text-2xl font-mono tracking-widest">{nss || "•••• •••• ••"}</p>
                    </div>
                    
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-teal-100/70 text-[10px] uppercase">Assuré</p>
                        <p className="font-semibold uppercase">{patientName || "--- ---"}</p>
                      </div>
                      <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/20">
                        {scanResult?.status || "⚠️ À confirmer"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* QR Code & Actions */}
              <div className="space-y-6">
                <div className="glass-card p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-teal-600" />
                    {language === "ar" ? "QR الشفاء الرقمي" : "QR CHIFA Déclaratif"}
                  </h3>
                  
                  {!qrHash ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <p>{getLegalDisclaimer(language || "fr")}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id="consent" 
                          checked={hasConsented}
                          onChange={(e) => setHasConsented(e.target.checked)}
                          className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                        <label htmlFor="consent" className="text-sm text-muted-foreground">
                          {language === "ar" ? "أوافق على استخدام بياناتي بشكل رقمي" : "J'accepte l'utilisation numérique de mes données"}
                        </label>
                      </div>

                      <div className="space-y-2">
                        <Label>NSS</Label>
                        <Input 
                          placeholder="Ex: 1234567890" 
                          value={nss}
                          onChange={(e) => setNss(e.target.value)}
                        />
                      </div>

                      <Button 
                        className="w-full bg-teal-600 hover:bg-teal-700"
                        onClick={handleGenerateQR}
                        disabled={!hasConsented || !nss}
                      >
                        Générer mon QR Code
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="w-48 h-48 mx-auto bg-white p-4 border-4 border-teal-100 rounded-2xl flex items-center justify-center">
                        <div className="w-full h-full bg-slate-100 rounded flex items-center justify-center relative">
                           {/* Simplified QR representation */}
                           <div className="grid grid-cols-4 gap-1 p-2">
                              {Array.from({length: 16}).map((_, i) => (
                                <div key={i} className={`w-6 h-6 ${Math.random() > 0.5 ? "bg-teal-900" : "bg-transparent"}`} />
                              ))}
                           </div>
                           <Shield className="absolute w-8 h-8 text-teal-500 opacity-20" />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground italic">Expira dans 72h • Sécurisé par Hash</p>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1" onClick={() => setQrHash("")}>Reset</Button>
                        <Button className="flex-1 gap-2"><Download className="w-4 h-4" /> Save</Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* History Table */}
            <div className="glass-card p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                {language === "ar" ? "سجل الحقوق والتعويضات" : "Historique des Droits"}
              </h3>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Validité</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>30/12/2025</TableCell>
                      <TableCell>Attestation Affiliation</TableCell>
                      <TableCell><Badge className="bg-green-500">Validé</Badge></TableCell>
                      <TableCell>31/12/2026</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm"><Printer className="w-4 h-4" /></Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
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
                        <ScanLine className="w-5 h-5 text-teal-600" />
                        Scanner CHIFA / Attestation
                      </h3>
                      <div 
                        className="aspect-video bg-muted rounded-xl border-2 border-dashed border-teal-500/30 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-muted/50 transition-colors group relative overflow-hidden"
                        onClick={handleScan}
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

