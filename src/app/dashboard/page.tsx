"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Tesseract from "tesseract.js";
import { 
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  AlertTriangle,
  Clock,
  Lock,
  Plus,
  Upload,
  Download,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  FileSpreadsheet,
  Pill,
  Building2,
  CreditCard,
  GraduationCap,
  ScanLine,
  Shield,
  Bell,
  ChevronRight,
  BarChart3,
  Calendar,
  MapPin,
  Truck,
  Heart,
  Video,
  FileText,
  Settings,
  Factory,
  Award,
  Star,
  CheckCircle2,
  X,
  Stethoscope,
  Briefcase,
  History as HistoryIcon,
  Send,
  Printer,
  QrCode,
  Languages,
  DollarSign,
  CloudUpload,
  BookOpen,
  Map as MapIcon,
  Receipt,
  UserPlus,
  CheckCircle,
  Loader2,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { MedicineAutocomplete } from "@/components/MedicineAutocomplete";
import { CNASStatusBadge } from "@/components/cnas/CNASStatusBadge";
import { CHIFAScanner } from "@/components/cnas/CHIFAScanner";
import { CHIFAQRCode } from "@/components/cnas/CHIFAQRCode";
import { ReimbursementSummary } from "@/components/cnas/ReimbursementSummary";
import { calculateReimbursement, generateCHIFAHash, validateNSS, CNAS_DISCLAIMER } from "@/lib/cnas";
import { useAppStore, type Medicine, type JobOffer, type Prescription, type ProductionLine, type User, type Course, type TrainingEnrollment } from "@/lib/store";

import { t } from "@/lib/i18n";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase";

const categories = ["Pain Relief", "Antibiotics", "Gastro", "Vitamins", "Cardiovascular", "Respiratory", "Other"];

export default function DashboardPage() {
  const router = useRouter();
  const { 
    language, 
    user, 
    isHydrated,
    medicines, 
    pharmacies,
    orders,
    courses,
    jobOffers,
    prescriptions,
    medicalDossiers,
    productionLines,
    factoryInventory,
    factoryOrders,
    cnasStatuses,
    appointments,
    enrollments,
    users: allUsers,
    factories,
    schools,
    addUser,
    setUser,
    addMedicine, 
    updateMedicine, 
    deleteMedicine,
    addJobOffer,
    updateJobOffer,
    deleteJobOffer,
    addPrescription,
    addProductionLine,
    updateProductionLine,
    deleteProductionLine,
    addFactoryInventory,
    addFactoryOrder,
    updateFactoryOrder,
    updateCNASStatus,
    addOrder,
    updateOrder,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    addEnrollment,
    updateEnrollment,
    deleteEnrollment,
    updateUser,
    deleteUser,
    addMedicalDossier,
    updateMedicalDossier,
    addCourse,
    updateCourse,
    deleteCourse,
    addPharmacy,
    addFactory,
    addSchool,
  } = useAppStore();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [editingJob, setEditingJob] = useState<JobOffer | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingProductionLine, setEditingProductionLine] = useState<ProductionLine | null>(null);
  const [reimbursementData, setReimbursementData] = useState<any>(null);
  const [pharmacyVerificationData, setPharmacyVerificationData] = useState<{ nss: string; fullName: string; isValid: boolean } | null>(null);
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isZoomDialogOpen, setIsZoomDialogOpen] = useState(false);
  const [isPrescriptionDialogOpen, setIsPrescriptionDialogOpen] = useState(false);
  const [isJobOfferDialogOpen, setIsJobOfferDialogOpen] = useState(false);
  const [isFactoryOrderDialogOpen, setIsFactoryOrderDialogOpen] = useState(false);
  const [isPatientOrderDialogOpen, setIsPatientOrderDialogOpen] = useState(false);
  const [isProductionLineDialogOpen, setIsProductionLineDialogOpen] = useState(false);
  const [isInventoryDialogOpen, setIsInventoryDialogOpen] = useState(false);
  const [isDossierDialogOpen, setIsDossierDialogOpen] = useState(false);
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  const [isOCRDialogOpen, setIsOCRDialogOpen] = useState(false);
  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false);
  const [isDonationDialogOpen, setIsDonationDialogOpen] = useState(false);
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);
  const [isNewPatientDialogOpen, setIsNewPatientDialogOpen] = useState(false);
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [isUserEditDialogOpen, setIsUserEditDialogOpen] = useState(false);
  const [isEntityRegistrationOpen, setIsEntityRegistrationOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);
  const [selectedDossierPatient, setSelectedDossierPatient] = useState<User | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [zoomUrl, setZoomUrl] = useState("");
  const [selectedZoomCourseId, setSelectedZoomCourseId] = useState("");
  const [selectedDoctorForRDV, setSelectedDoctorForRDV] = useState<User | null>(null);
  
    const [ocrUsage, setOcrUsage] = useState({ count: 0, limit: 10 });
    
      const [newEntity, setNewEntity] = useState({
    name: "",
    nameAr: "",
    wilaya: "",
    city: "",
    address: "",
    phone: "",
    email: "",
  });

  const handleRegisterEntity = async () => {
    if (!user) return;
    try {
      if (user.role === 'pharmacy') {
        await addPharmacy({ ...newEntity, ownerId: user.id });
        toast.success("Pharmacie enregistrée avec succès !");
      } else if (user.role === 'factory') {
        await addFactory({ ...newEntity, ownerId: user.id });
        toast.success("Usine enregistrée avec succès !");
      } else if (user.role === 'trainer' || user.role === 'school') {
        await addSchool({ ...newEntity, ownerId: user.id });
        toast.success("École/Centre de formation enregistré !");
      }
      setIsEntityRegistrationOpen(false);
    } catch (err) {
      toast.error("Erreur lors de l'enregistrement.");
    }
  };

  const userPharmacy = pharmacies.find(p => p.ownerId === user?.id);
  const userFactory = factories.find(f => f.ownerId === user?.id);
  const userSchool = schools.find(s => s.ownerId === user?.id);

  const hasEntity = (user?.role === 'pharmacy' && userPharmacy) || 
                    (user?.role === 'factory' && userFactory) || 
                    (user?.role === 'trainer' && userSchool) ||
                    (user?.role === 'school' && userSchool) ||
                    !['pharmacy', 'factory', 'trainer', 'school'].includes(user?.role || '');

  const fetchOCRUsage = async () => {
    if (!user) return;
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const supabase = createClient();

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
      await supabase.from("ocr_usage").insert({
        user_id: user.id,
        usage_count: 0,
        month,
        year
      });
    }

    const limit = user.plan === "premium" ? 300 : user.plan === "professional" || user.plan === "enterprise" ? 1000000 : 10;
    setOcrUsage({ count, limit });
  };

  const updateOCRUsage = async () => {
    if (!user) return;
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const supabase = createClient();

    const { error } = await supabase.rpc('increment_ocr_usage', { 
      p_user_id: user.id, 
      p_month: month, 
      p_year: year 
    });

    if (error) {
      await supabase
        .from("ocr_usage")
        .update({ usage_count: ocrUsage.count + 1 })
        .eq("user_id", user.id)
        .eq("month", month)
        .eq("year", year);
    }
    
    setOcrUsage(prev => ({ ...prev, count: prev.count + 1 }));
  };

  useEffect(() => {
    if (user) fetchOCRUsage();
  }, [user]);

  const [doctorInfo, setDoctorInfo] = useState({
    specialty: user?.specialty || "",
    licenseNumber: user?.licenseNumber || "",
    phone: user?.phone || "",
    address: user?.address || "",
    wilaya: user?.wilaya || "",
  });

  const [newAppointment, setNewAppointment] = useState({
      patientId: "",
      date: "",
      time: "",
      notes: "",
  });

  const [newDonation, setNewDonation] = useState({
      name: "",
      quantity: 1,
      expiryDate: "",
      description: ""
  });

  const [cnasCheckId, setCnasCheckId] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [nearbyFactories, setNearbyFactories] = useState<User[]>([]);
  const [searchMedsInNearby, setSearchMedsInNearby] = useState("");
  const [ccpReceipt, setCcpReceipt] = useState<File | null>(null);

  const prescriptionRef = useRef<HTMLDivElement>(null);

  const [newFactoryOrder, setNewFactoryOrder] = useState({
    factoryId: "",
    items: [{ medicineName: "", quantity: 1, price: 0 }]
  });

  const [newPatientOrder, setNewPatientOrder] = useState({
    pharmacyId: "",
    items: [{ medicineId: "", quantity: 1, price: 0 }],
    deliveryAddress: "",
  });

  const [newMedicine, setNewMedicine] = useState({
    name: "", nameAr: "", genericName: "", category: "", manufacturer: "",
    price: "", quantity: "", unit: "tablets", expiryDate: "", batchNumber: "",
    barcode: "", description: "", requiresPrescription: false, isDonation: false,
  });

  const [newPrescription, setNewPrescription] = useState({
    patientId: "",
    patientCNAS: "",
    diagnosis: "",
    medications: [{ name: "", dosage: "", duration: "", instructions: "" }],
    cnasEligible: true,
    stamped: true,
    notes: "",
  });

  useEffect(() => {
    const updateReimbursement = async () => {
      const medsToCalculate = newPrescription.medications
        .filter(m => m.name)
        .map(m => {
          const foundMed = medicines.find(med => med.name === m.name);
          return {
            publicPrice: foundMed?.price || 500,
            isReimbursable: true
          };
        });

      if (medsToCalculate.length > 0) {
        const result = await calculateReimbursement(medsToCalculate, "Standard");
        setReimbursementData(result);
      } else {
        setReimbursementData(null);
      }
    };

    updateReimbursement();
  }, [newPrescription.medications, medicines]);

  const [newJobOffer, setNewJobOffer] = useState({
    title: "", description: "", role: "", location: "", salary: "",
  });

  const [newInventory, setNewInventory] = useState({
    medicineName: "",
    quantity: 0,
    price: 0,
    batchNumber: "",
    expiryDate: ""
  });

  const [newCourse, setNewCourse] = useState<Partial<Course>>({
    title: "",
    description: "",
    price: 0,
    isFree: false,
    duration: "",
    modules: [],
    materialsUrls: []
  });

  const [newPatient, setNewPatient] = useState({
    fullName: "",
    email: "",
    phone: "",
    wilaya: "",
    city: "",
    address: "",
  });

  const [newStudentEnrollment, setNewStudentEnrollment] = useState({
    userId: "",
    courseId: "",
  });

  const [ocrResults, setOcrResults] = useState<{
    name: string; 
    dosage: string; 
    quantity: string; 
    found: boolean; 
    genericName?: string;
    generics?: { name: string; pharmacyName: string; price: number; quantity: number }[];
    pharmacies?: { name: string; address: string; distance?: string }[];
  }[]>([]);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [isOCRSummaryOpen, setIsOCRSummaryOpen] = useState(false);

  const calculateSimilarity = (s1: string, s2: string) => {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    const longerLength = longer.length;
    if (longerLength === 0) return 1.0;
    
    const editDistance = (s1: string, s2: string) => {
      const costs = [];
      for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
          if (i === 0) costs[j] = j;
          else {
            if (j > 0) {
              let newValue = costs[j - 1];
              if (s1.charAt(i - 1) !== s2.charAt(j - 1))
                newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
              costs[j - 1] = lastValue;
              lastValue = newValue;
            }
          }
        }
        if (i > 0) costs[s2.length] = lastValue;
      }
      return costs[s2.length];
    };

    return (longerLength - editDistance(longer, shorter)) / longerLength;
  };

  const handleOCR = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (ocrUsage.count >= ocrUsage.limit) {
      toast.error(language === "ar" 
        ? "لقد وصلت إلى الحد الأقصى للمسح الشهري. يرجى الترقية." 
        : "Limite mensuelle atteinte. Veuillez passer à un plan supérieur.");
      return;
    }

    setOcrLoading(true);
    setOcrProgress(0);
    toast.info("Initialisation du moteur d'OCR Pro...");

    try {
      const worker = await Tesseract.createWorker('fra+ara', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            setOcrProgress(Math.round(m.progress * 100));
          }
        }
      });

      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      const normalizedText = text.toLowerCase().replace(/[^a-z0-9\s\u0600-\u06FF]/g, ' ');
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
      const detectedMeds: any[] = [];
      
      const dosageRegex = /(\d+(\.\d+)?)\s*(mg|ml|g|mcg|µg|cp|gel|flacon|amp|ui|iu|x|box)/i;

      // 1. Scan for known medicines with fuzzy matching
      const medicineNames = medicines.map(m => ({ 
        id: m.id, 
        name: m.name.toLowerCase(), 
        nameAr: m.nameAr?.toLowerCase() || "",
        original: m 
      }));

      lines.forEach(line => {
        const l = line.toLowerCase();
        const words = l.split(/\s+/);
        
        // Check for dosage in the line
        const dosageMatch = l.match(dosageRegex);
        
        medicineNames.forEach(m => {
          let similarity = 0;
          if (l.includes(m.name) || (m.nameAr && l.includes(m.nameAr))) {
            similarity = 1.0;
          } else {
            // Check individual words for high similarity
            words.forEach(word => {
              if (word.length > 3) {
                const sim = calculateSimilarity(word, m.name);
                if (sim > 0.8) similarity = Math.max(similarity, sim);
              }
            });
          }

          if (similarity > 0.8) {
            const pharmaciesWithStock = pharmacies.filter(p => 
              medicines.some(med => med.pharmacyId === p.id && med.name === m.original.name && med.quantity > 0)
            ).map(p => {
              const medInStock = medicines.find(med => med.pharmacyId === p.id && med.name === m.original.name);
              return {
                name: p.name,
                address: p.address,
                price: medInStock?.price || 0,
                quantity: medInStock?.quantity || 0,
                distance: p.wilaya === user.wilaya ? "À proximité" : p.wilaya
              };
            });

            const suggestedGenerics = medicines.filter(med => 
              med.genericName && m.original.genericName && 
              med.genericName.toLowerCase() === m.original.genericName.toLowerCase() && 
              med.name !== m.original.name &&
              med.quantity > 0
            ).map(med => {
              const p = pharmacies.find(pharm => pharm.id === med.pharmacyId);
              return {
                name: med.name,
                pharmacyName: p?.name || "Pharmacie",
                price: med.price,
                quantity: med.quantity,
                address: p?.address || ""
              };
            });

            detectedMeds.push({
              name: m.original.name,
              dosage: dosageMatch ? dosageMatch[0] : "Dose standard",
              quantity: "1 boite",
              found: pharmaciesWithStock.length > 0,
              genericName: m.original.genericName,
              generics: suggestedGenerics,
              pharmacies: pharmaciesWithStock,
              confidence: Math.round(similarity * 100)
            });
          }
        });

        // 2. If no high match, try to extract based on dosage pattern
        if (dosageMatch && !detectedMeds.some(dm => l.includes(dm.name.toLowerCase()))) {
          const dosageIdx = l.indexOf(dosageMatch[0].toLowerCase());
          const beforeDosage = l.substring(0, dosageIdx).trim().split(/\s+/).pop();
          
          if (beforeDosage && beforeDosage.length > 3 && !/^(dr|tel|fax|cite|le)/i.test(beforeDosage)) {
             detectedMeds.push({
               name: beforeDosage.toUpperCase(),
               dosage: dosageMatch[0],
               quantity: "1 boite",
               found: false,
               confidence: 70
             });
          }
        }
      });

      // Deduplicate and filter results
      const final = detectedMeds
        .filter((v, i, a) => a.findIndex(t => t.name === v.name) === i)
        .sort((a, b) => (b.confidence || 0) - (a.confidence || 0));

      if (final.length === 0) {
        toast.warning("Analyse terminée : Aucun médicament identifié avec certitude.");
      } else {
          setOcrResults(final);
          setIsOCRSummaryOpen(true);
          toast.success(`${final.length} médicament(s) identifié(s) avec succès !`);
          await updateOCRUsage();
        }
      } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'analyse OCR.");
    } finally {
      setOcrLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingFiles(true);
    const supabase = createClient();
    const urls: string[] = [...(newCourse.materialsUrls || [])];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('course-materials')
        .upload(filePath, file);

      if (uploadError) {
        toast.error(`Erreur upload: ${file.name}`);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('course-materials')
        .getPublicUrl(filePath);

      urls.push(publicUrl);
    }

    setNewCourse({ ...newCourse, materialsUrls: urls });
    setUploadingFiles(false);
    toast.success(`${files.length} fichier(s) téléversé(s) !`);
  };

  const handleCertificateUpload = async (enrollmentId: string, file: File) => {
    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${enrollmentId}-${Math.random()}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from('certificates')
      .upload(filePath, file);

    if (uploadError) {
      toast.error("Erreur lors de l'upload du certificat");
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('certificates')
      .getPublicUrl(filePath);

    await updateEnrollment(enrollmentId, { certificateUrl: publicUrl, status: 'completed' });
    toast.success("Diplôme envoyé à l'étudiant !");
  };

  const handleAddPrescription = async () => {
    const tempId = `presc-${Date.now()}`;
    const prescriptionData = { 
      ...newPrescription, 
      id: tempId,
      doctorId: user.id,
      createdAt: new Date().toISOString()
    };
    
    await addPrescription(prescriptionData);
    
    toast.success("Ordonnance signée et enregistrée !", {
      action: {
        label: "Imprimer",
        onClick: () => handlePrint(prescriptionData as Prescription)
      },
      duration: 10000,
    });

    setIsPrescriptionDialogOpen(false);
    setNewPrescription({
      patientId: "",
      patientCNAS: "",
      diagnosis: "",
      medications: [{ name: "", dosage: "", duration: "", instructions: "" }],
      cnasEligible: true,
      stamped: true,
      notes: "",
    });
  };

  const handleCreateJobOffer = async () => {
      if (user.plan === "free" || user.plan === "premium") {
        toast.error(language === "ar" 
          ? "نشر الوظائف متاح فقط للمشتركين في الخطة الاحترافية." 
          : "La publication d'offres d'emploi est réservée au plan Professional.");
        return;
      }

      if (editingJob) {
        await updateJobOffer(editingJob.id, newJobOffer);
        toast.success("Offre d'emploi mise à jour !");
      } else {
        await addJobOffer({
            ...newJobOffer,
            publisherId: user.id,
            roleType: user.role === 'doctor' ? 'doctor' : user.role === 'pharmacy' ? 'pharmacy' : user.role === 'factory' ? 'factory' : 'other',
        });
        toast.success("Offre d'emploi publiée !");
      }
      setIsJobOfferDialogOpen(false);
      setEditingJob(null);
      setNewJobOffer({ title: "", description: "", role: "", location: "", salary: "" });
  };

  const handleCreateCourse = async () => {
    if (editingCourse) {
      await updateCourse(editingCourse.id, newCourse);
      toast.success("Cours mis à jour !");
    } else {
      await addCourse({
        ...newCourse,
        id: `course-${Date.now()}`,
        trainerId: user.id,
      } as Course);
      toast.success("Nouveau cours créé !");
    }
    setIsCourseDialogOpen(false);
    setEditingCourse(null);
    setNewCourse({ title: "", description: "", price: 0, isFree: false, duration: "", modules: [], materialsUrls: [] });
  };

  const handleCreatePatient = async () => {
    // In a real app, this would call an API to create a user and a dossier
    const newId = `patient-${Date.now()}`;
    const newUserData: User = {
      id: newId,
      email: newPatient.email,
      fullName: newPatient.fullName,
      phone: newPatient.phone,
      role: 'patient',
      plan: 'free',
      wilaya: newPatient.wilaya,
      city: newPatient.city,
      address: newPatient.address,
      verified: true,
      isApproved: true,
      createdAt: new Date().toISOString()
    };
    addUser(newUserData);
    await addMedicalDossier({
      patientId: newId,
      bloodType: "A+",
      allergies: [],
      chronicDiseases: [],
      lastCheckup: new Date().toISOString(),
      history: [],
      notes: "Nouveau patient créé par Dr. " + user.fullName
    });
    toast.success("Nouveau patient et dossier médical créés !");
    setIsNewPatientDialogOpen(false);
  };

  useEffect(() => {
    if (user?.role === 'admin' && activeTab === 'overview') {
        setActiveTab("admin");
    }
  }, [user, activeTab]);

  useEffect(() => {
    if (user?.address) {
        setNewPatientOrder(prev => ({ ...prev, deliveryAddress: user.address }));
    }
    if (user?.role === 'pharmacy') {
        setNearbyFactories(allUsers.filter(u => u.role === 'factory' && u.wilaya === user.wilaya));
    }
  }, [user, allUsers]);

  useEffect(() => {
    if (isHydrated && !user) {
      router.push("/login");
    }
  }, [user, isHydrated, router]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  if (!user.isApproved && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Navbar />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-12 max-w-lg text-center border-t-8 border-primary"
        >
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <Shield className="w-12 h-12 text-primary animate-pulse" />
          </div>
          <h1 className="text-3xl font-black uppercase italic mb-4">Compte en Attente d'Approbation</h1>
          <p className="text-muted-foreground font-medium mb-8 leading-relaxed">
            Merci de votre inscription sur <span className="font-black italic text-primary">DAR AL-SHIFAA</span>. 
            Votre compte est actuellement en cours de vérification par nos administrateurs. 
            Vous recevrez un email dès que votre accès sera activé.
          </p>
          <div className="space-y-4">
            <div className="p-4 bg-secondary/30 rounded-2xl flex items-center gap-4 text-left">
              <Clock className="w-6 h-6 text-accent" />
              <div>
                <p className="font-bold text-sm uppercase italic">Délai estimé</p>
                <p className="text-xs opacity-70">Moins de 24 heures ouvrables</p>
              </div>
            </div>
            <Button variant="outline" className="w-full rounded-full h-12 font-black uppercase italic" onClick={() => setUser(null)}>
              Se Déconnecter
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const handlePrint = (p: Prescription) => {
    // Create a hidden iframe for printing to bypass popup blockers
    let iframe = document.getElementById('print-iframe') as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'print-iframe';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);
    }

    const patient = allUsers.find(u => u.id === p.patientId);
    const doctor = user;
    
    const content = `
        <html>
          <head>
            <title>Ordonnance - Dr. ${doctor.fullName}</title>
            <style>
              @page { size: A5; margin: 0; }
              body { 
                font-family: 'Times New Roman', serif; 
                padding: 40px; 
                line-height: 1.4; 
                color: #000;
                background: #fff;
              }
              .header { 
                display: flex; 
                justify-content: space-between; 
                border-bottom: 2px solid #000; 
                padding-bottom: 10px; 
                margin-bottom: 30px; 
              }
              .doctor-info { text-align: left; }
              .republic-info { text-align: center; font-size: 10px; font-weight: bold; margin-bottom: 10px; line-height: 1.2; }
              .doctor-name { font-size: 18px; font-weight: bold; text-transform: uppercase; }
              .specialty { font-size: 14px; font-style: italic; }
              .contact { font-size: 11px; margin-top: 5px; }
              
              .date-place { text-align: right; margin-bottom: 20px; font-weight: bold; }
              
              .patient-section { margin-bottom: 30px; font-size: 14px; }
              .patient-name { font-weight: bold; font-size: 16px; }
              
              .title { 
                text-align: center; 
                text-decoration: underline; 
                font-size: 24px; 
                font-weight: bold; 
                margin: 40px 0;
                letter-spacing: 2px;
              }
              
              .medications { 
                min-height: 250px; 
                margin-left: 20px;
              }
              .med-item { margin-bottom: 15px; }
              .med-name { font-weight: bold; font-size: 16px; text-transform: uppercase; }
              .med-details { font-size: 13px; margin-left: 15px; }
              
              .footer { 
                margin-top: 50px; 
                display: flex; 
                justify-content: flex-end; 
              }
              .stamp-area { 
                border: 1px dashed #ccc; 
                padding: 40px; 
                text-align: center; 
                width: 200px;
                font-size: 10px;
                color: #666;
              }
              .griffe {
                margin-top: 10px;
                font-weight: bold;
                border-top: 1px solid #000;
                padding-top: 5px;
              }
            </style>
          </head>
          <body>
            <div class="republic-info">
              الجمهورية الجزائرية الديمقراطية الشعبية<br/>
              REPUBLIQUE ALGERIENNE DEMOCRATIQUE ET POPULAIRE<br/>
              وزارة الصحة - MINISTERE DE LA SANTE
            </div>
            
            <div class="header">
              <div class="doctor-info">
                <div class="doctor-name">Dr. ${doctor.fullName}</div>
                <div class="specialty">${doctor.specialty || "Médecine Générale"}</div>
                <div class="contact">
                  ${doctor.address || ""}<br/>
                  ${doctor.wilaya || ""} - Algérie<br/>
                  Tél: ${doctor.phone || ""}<br/>
                  N° Inscription: ${doctor.licenseNumber || "En cours"}
                </div>
              </div>
            </div>

            <div class="date-place">
              Fait à ${doctor.wilaya || "Alger"}, le ${new Date(p.createdAt).toLocaleDateString('fr-FR')}
            </div>

            <div class="patient-section">
              Nom et Prénom: <span class="patient-name">${patient?.fullName || p.patientId}</span><br/>
              ${p.patientCNAS ? `NSS: <strong>${p.patientCNAS}</strong>` : ""}
            </div>

            <div class="title">ORDONNANCE</div>

            <div class="medications">
              ${p.medications.map(m => `
                <div class="med-item">
                  <div class="med-name">- ${m.name} ${m.dosage}</div>
                  <div class="med-details">
                    Pendant: ${m.duration}<br/>
                    ${m.instructions ? `<em>(${m.instructions})</em>` : ""}
                  </div>
                </div>
              `).join('')}
            </div>

            <div class="footer">
              <div class="stamp-area">
                Signature et Cachet
                <div class="griffe">Dr. ${doctor.fullName}</div>
              </div>
            </div>
          </body>
        </html>
    `;

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(content);
      doc.close();
      
      // Allow content to render
      setTimeout(() => {
        if (iframe.contentWindow) {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        }
      }, 500);
    }
  };

  const stats = {
    patient: [
      { icon: HistoryIcon, label: language === "ar" ? "الوصفات النشطة" : "Ordonnances Actives", value: prescriptions.filter(p => p.patientId === user.id).length, color: "from-blue-500 to-cyan-500" },
      { icon: Truck, label: language === "ar" ? "الطلبات الجارية" : "Commandes en cours", value: orders.filter(o => o.userId === user.id && o.status !== "delivered").length, color: "from-orange-500 to-amber-500" },
      { icon: Heart, label: language === "ar" ? "النقاط الصحية" : "Points Santé", value: "1250", color: "from-red-500 to-pink-500" },
      { icon: Shield, label: language === "ar" ? "الحالة" : "Plan", value: user.plan.toUpperCase(), color: "from-green-500 to-emerald-500" },
    ],
    doctor: [
      { icon: Users, label: language === "ar" ? "إجمالي المرضى" : "Total Patients", value: appointments.filter(a => a.doctorId === user.id).map(a => a.patientId).concat(medicalDossiers.filter(d => d.history.some(h => h.doctorId === user.id)).map(d => d.patientId)).filter((v, i, a) => a.indexOf(v) === i).length, color: "from-blue-500 to-cyan-500" },
      { icon: FileText, label: language === "ar" ? "الوصفات الطبية" : "Prescriptions", value: prescriptions.filter(p => p.doctorId === user.id).length, color: "from-orange-500 to-amber-500" },
      { icon: Calendar, label: language === "ar" ? "المواعيد" : "Rendez-vous", value: appointments.filter(a => a.doctorId === user.id && a.status === 'pending').length, color: "from-red-500 to-pink-500" },
      { icon: Briefcase, label: language === "ar" ? "عروض العمل" : "Offres d'emploi", value: jobOffers.filter(j => j.publisherId === user.id).length, color: "from-green-500 to-emerald-500" },
    ],
    pharmacy: [
      { icon: Package, label: language === "ar" ? "المخزون" : "Medicaments", value: medicines.filter(m => m.pharmacyId === userPharmacy?.id).length, color: "from-blue-500 to-cyan-500" },
      { icon: AlertTriangle, label: language === "ar" ? "نقص المخزون" : "Stock Bas", value: medicines.filter(m => m.pharmacyId === userPharmacy?.id && m.quantity < 50).length, color: "from-orange-500 to-amber-500" },
      { icon: ShoppingCart, label: language === "ar" ? "طلبات التسليم" : "Livraisons", value: orders.filter(o => o.pharmacyId === userPharmacy?.id && o.status === 'pending').length, color: "from-red-500 to-pink-500" },
      { icon: Shield, label: language === "ar" ? "CNAS" : "E-CHIFA", value: "Connecté", color: "from-green-500 to-emerald-500" },
    ],
    factory: [
      { icon: Factory, label: language === "ar" ? "خطوط الإنتاج" : "Production Lines", value: productionLines.filter(p => p.factoryId === user.id).length, color: "from-blue-500 to-cyan-500" },
      { icon: Building2, label: language === "ar" ? "طلبات الشراء" : "Preachas Orders", value: factoryOrders.filter(o => o.factoryId === user.id).length, color: "from-orange-500 to-amber-500" },
      { icon: Package, label: language === "ar" ? "المخزون" : "Stock", value: factoryInventory.filter(i => i.factoryId === user.id).length, color: "from-red-500 to-pink-500" },
      { icon: TrendingUp, label: language === "ar" ? "الأداء" : "Performance", value: "92%", color: "from-green-500 to-emerald-500" },
    ],
    trainer: [
      { icon: GraduationCap, label: language === "ar" ? "الدورات" : "Cours", value: courses.filter(c => c.trainerId === user.id).length, color: "from-blue-500 to-cyan-500" },
      { icon: Users, label: language === "ar" ? "الطلاب" : "Étudiants", value: enrollments.filter(e => courses.some(c => c.id === e.courseId && c.trainerId === user.id)).length, color: "from-orange-500 to-amber-500" },
      { icon: Award, label: language === "ar" ? "الشهادات" : "Diplômes", value: enrollments.filter(e => e.status === 'completed' && courses.some(c => c.id === e.courseId && c.trainerId === user.id)).length, color: "from-red-500 to-pink-500" },
      { icon: Video, label: language === "ar" ? "جلسات زوم" : "Sessions Zoom", value: 3, color: "from-green-500 to-emerald-500" },
    ],
    admin: [
        { icon: Shield, label: "Users Pending", value: allUsers.filter(u => !u.verified || !u.isApproved).length, color: "from-red-500 to-pink-500" },
        { icon: Users, label: "Total Users", value: allUsers.length, color: "from-blue-500 to-cyan-500" },
        { icon: TrendingUp, label: "Revenue", value: "450k DA", color: "from-green-500 to-emerald-500" },
        { icon: Settings, label: "System Health", value: "Optimal", color: "from-orange-500 to-amber-500" },
    ],
    cnas: [
      { icon: Shield, label: "Assurés", value: allUsers.filter(u => u.role === 'patient').length, color: "from-teal-500 to-emerald-500" },
      { icon: HistoryIcon, label: "Dossiers", value: medicalDossiers.length, color: "from-blue-500 to-cyan-500" },
      { icon: AlertTriangle, label: "Fraudes Detectées", value: "2", color: "from-red-500 to-orange-500" },
      { icon: CheckCircle, label: "Remboursements", value: "85%", color: "from-green-500 to-emerald-500" },
    ]
  }[user.role as keyof typeof stats] || [];

  const handleAddAppointment = async () => {
    await addAppointment({ ...newAppointment, doctorId: user.id, status: 'pending' });
    toast.success("Rendez-vous organisé");
    setIsAppointmentDialogOpen(false);
  };

  const handleDonateMedicine = async () => {
      toast.success("Médicament partagé pour don ! Merci.");
      setIsDonationDialogOpen(false);
  };

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          toast.info("Importation du fichier CSV en cours...");
          setTimeout(() => toast.success("150 médicaments importés avec succès!"), 1500);
      }
  };

  const quickActions = {
    patient: [
      { icon: MapIcon, label: "Pharmacies", action: () => setActiveTab("pharmacy-search") },
      { icon: CloudUpload, label: "Scanner Ordonnance", action: () => setIsOCRDialogOpen(true) },
      { icon: Heart, label: "Donner Médicaments", action: () => setIsDonationDialogOpen(true) },
      { icon: Shield, label: "S'abonner (CCP)", action: () => setIsSubscriptionDialogOpen(true) },
    ],
    doctor: [
        { icon: Plus, label: "Ordonnance", action: () => setIsPrescriptionDialogOpen(true) },
        { icon: UserPlus, label: "Nouveau Patient", action: () => setIsNewPatientDialogOpen(true) },
        { icon: Calendar, label: "Rendez-vous", action: () => setIsAppointmentDialogOpen(true) },
        { icon: Briefcase, label: "Recrutement", action: () => setIsJobOfferDialogOpen(true) },
    ],
    pharmacy: [
        { icon: Plus, label: "Ajout Manuel", action: () => setIsAddDialogOpen(true) },
        { icon: Upload, label: "Import CSV", action: () => document.getElementById('csv-import')?.click() },
        { icon: Building2, label: "Chercher Usines", action: () => setActiveTab("factory-search") },
        { icon: Briefcase, label: "Recrutement", action: () => setIsJobOfferDialogOpen(true) },
    ],
    factory: [
        { icon: Plus, label: "Ligne", action: () => setIsProductionLineDialogOpen(true) },
        { icon: Package, label: "Stock", action: () => setIsInventoryDialogOpen(true) },
        { icon: Briefcase, label: "Recrutement", action: () => setIsJobOfferDialogOpen(true) },
    ],
    trainer: [
        { icon: Plus, label: "Nouveau Cours", action: () => setIsCourseDialogOpen(true) },
        { icon: Video, label: "Zoom Session", action: () => setIsZoomDialogOpen(true) },
        { icon: Award, label: "Diplômes", action: () => setActiveTab("trainer-enrollments") },
    ],
    admin: [
        { icon: CheckCircle2, label: "Approbations", action: () => setActiveTab("admin") },
        { icon: Users, label: "Gérer Users", action: () => setActiveTab("user-management") },
        { icon: Shield, label: "Sécurité", action: () => toast.info("Système sécurisé") },
    ],
    cnas: [
      { icon: Search, label: "Chercher Assuré", action: () => setActiveTab("cnas-pro") },
      { icon: QrCode, label: "Vérifier Carte", action: () => setIsOCRDialogOpen(true) },
    ]
    }[user.role as keyof typeof quickActions]?.filter(a => {
      if (a.icon === Briefcase && (user.plan === 'free' || user.plan === 'premium')) return false;
      return true;
    }) || [];

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent uppercase italic">Dar Al-Shifaa</h1>
                <div className="flex items-center gap-2">
                  <p className="text-muted-foreground font-medium">{user.role.toUpperCase()} • {user.fullName} • {user.wilaya}, Algérie</p>
                  {hasEntity && ['pharmacy', 'factory', 'trainer', 'school'].includes(user.role) && (
                    <Button variant="link" size="sm" className="h-auto p-0 text-primary font-black uppercase italic text-xs" asChild>
                      <Link href={user.role === 'pharmacy' ? '/pharmacies' : user.role === 'factory' ? '/factories' : '/training'}>
                        <Eye className="w-3 h-3 mr-1" /> Voir Page Publique
                      </Link>
                    </Button>
                  )}
                </div>
            </div>
            <div className="flex flex-wrap gap-2">
                <input type="file" id="csv-import" className="hidden" accept=".csv" onChange={handleCSVImport} />
                {quickActions.map(action => (
                    <Button key={action.label} onClick={action.action} className="rounded-full shadow-lg hover:scale-105 transition-transform">
                        <action.icon className="w-4 h-4 mr-2" />
                        {action.label}
                    </Button>
                ))}
            </div>
          </header>
  
          {!hasEntity && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card className="border-2 border-primary bg-primary/5 rounded-[40px] overflow-hidden">
                <div className="p-8 flex flex-col md:flex-row items-center gap-8">
                  <div className="w-20 h-20 bg-primary rounded-[30px] flex items-center justify-center text-white shrink-0 shadow-2xl">
                    <Building2 className="w-10 h-10" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl font-black uppercase italic text-primary mb-2">
                      {user.role === 'pharmacy' ? "Enregistrez votre Pharmacie" : 
                       user.role === 'factory' ? "Enregistrez votre Usine" : 
                       "Enregistrez votre École/Centre de Formation"}
                    </h2>
                    <p className="font-medium text-muted-foreground">
                      {user.role === 'pharmacy' ? "Votre pharmacie n'est pas encore visible. Enregistrez-la pour apparaître dans la liste publique et permettre aux patients de vous trouver." :
                       user.role === 'factory' ? "Votre usine n'est pas encore enregistrée. Configurez-la pour gérer votre production et recevoir des commandes." :
                       "Votre établissement de formation n'est pas encore listé. Enregistrez-le pour proposer vos cours aux étudiants."}
                    </p>
                  </div>
                  <Button 
                    size="lg" 
                    className="rounded-full font-black uppercase italic px-8 h-14 shadow-xl"
                    onClick={() => setIsEntityRegistrationOpen(true)}
                  >
                    Configurer maintenant
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} className="glass-card p-6 border-l-4 border-primary">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 text-white shadow-xl`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <p className="text-3xl font-black">{stat.value}</p>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-tighter">{stat.label}</p>
            </motion.div>
          ))}
        </section>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-secondary/30 p-1 flex-wrap h-auto rounded-xl border border-white/10 backdrop-blur-md">
              <TabsTrigger value="overview" className="rounded-lg">Dashboard</TabsTrigger>
              
              {user.role === "doctor" && <TabsTrigger value="appointments">RDV & Patients</TabsTrigger>}
              {user.role === "doctor" && <TabsTrigger value="prescriptions">Historique Pro</TabsTrigger>}
              {user.role === "doctor" && <TabsTrigger value="doctor-profile">Profil Pro</TabsTrigger>}
              {user.role === "doctor" && <TabsTrigger value="doctor-jobs">Mes Offres</TabsTrigger>}
              
              {user.role === "pharmacy" && <TabsTrigger value="stock">Inventaire</TabsTrigger>}
              {user.role === "pharmacy" && <TabsTrigger value="deliveries">Commandes Patients</TabsTrigger>}
              {user.role === "pharmacy" && <TabsTrigger value="factory-search">Chercher Usines</TabsTrigger>}
              {user.role === "pharmacy" && <TabsTrigger value="pharmacy-cnas">Verification CHIFA</TabsTrigger>}
              {user.role === "pharmacy" && <TabsTrigger value="pharmacy-jobs">Mes Offres</TabsTrigger>}
              
              {user.role === "factory" && <TabsTrigger value="production">Lignes</TabsTrigger>}
              {user.role === "factory" && <TabsTrigger value="factory-sales">Offres d'Achat</TabsTrigger>}
              {user.role === "factory" && <TabsTrigger value="pharmacy-map">Régions Pharmacies</TabsTrigger>}
              {user.role === "factory" && <TabsTrigger value="factory-jobs">Mes Offres</TabsTrigger>}

                {user.role === "patient" && <TabsTrigger value="appointments">Prendre RDV</TabsTrigger>}
                {user.role === "patient" && <TabsTrigger value="pharmacy-search">Pharmacies Proches</TabsTrigger>}
              {user.role === "patient" && <TabsTrigger value="history">Journal de Santé</TabsTrigger>}
              {user.role === "patient" && <TabsTrigger value="patient-cnas">Ma Carte CHIFA</TabsTrigger>}
              {user.role === "patient" && <TabsTrigger value="patient-orders">Mes Commandes</TabsTrigger>}

              {user.role === "trainer" && <TabsTrigger value="trainer-courses">Mes Cours</TabsTrigger>}
              {user.role === "trainer" && <TabsTrigger value="trainer-enrollments">Étudiants & Diplômes</TabsTrigger>}

              {user.role === "admin" && <TabsTrigger value="admin">Approbations</TabsTrigger>}
              {user.role === "admin" && <TabsTrigger value="user-management">Utilisateurs</TabsTrigger>}
              {user.role === "admin" && <TabsTrigger value="entities-management">Gestion Entités</TabsTrigger>}
              {user.role === "admin" && <TabsTrigger value="system">Sécurité & Stats</TabsTrigger>}
              
              {user.role === "cnas" && <TabsTrigger value="cnas-pro">Gestion Assurance</TabsTrigger>}
              {user.role === "cnas" && <TabsTrigger value="cnas-benefits">Prestations & Droits</TabsTrigger>}
              {user.role === "cnas" && <TabsTrigger value="chifa-tech">Système CHIFA Tech</TabsTrigger>}
              
              <TabsTrigger value="jobs">Emploi & Stages</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid md:grid-cols-3 gap-6">
                  <Card className="md:col-span-2 glass-card relative overflow-hidden">
                      <CardHeader><CardTitle className="text-xl flex items-center gap-2 font-black uppercase"><TrendingUp className="w-6 h-6 text-primary" /> Performance & Monitoring</CardTitle></CardHeader>
                      <CardContent>
                          <div className="h-64 flex items-end gap-2 px-4 pb-4">
                              {[40, 60, 45, 90, 65, 80, 70].map((h, i) => (
                                  <div key={i} className="flex-1 bg-gradient-to-t from-primary/80 to-accent/80 rounded-t-lg shadow-lg" style={{ height: `${h}%` }} />
                              ))}
                          </div>
                          <div className="grid grid-cols-7 text-[10px] text-center font-bold text-muted-foreground pt-2">
                              <span>LUN</span><span>MAR</span><span>MER</span><span>JEU</span><span>VEN</span><span>SAM</span><span>DIM</span>
                          </div>
                      </CardContent>

                      {(user.plan === "free" || user.plan === "premium") && (
                        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center z-10">
                          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                            <Lock className="w-6 h-6 text-primary" />
                          </div>
                          <h4 className="font-black uppercase italic mb-2">Tableau de bord avancé</h4>
                          <p className="text-xs text-muted-foreground mb-4 max-w-[250px]">
                            {language === "ar" 
                              ? "التحليلات المتقدمة متاحة فقط للمشتركين في الخطة الاحترافية."
                              : "Les analyses avancées sont réservées aux membres Professional & Enterprise."}
                          </p>
                          <Button size="sm" variant="outline" className="rounded-full font-bold uppercase text-[10px]" asChild>
                            <Link href="/pricing">Passer au plan PRO</Link>
                          </Button>
                        </div>
                      )}
                  </Card>
                <div className="space-y-6">
                    <Card className="glass-card">
                        <CardHeader><CardTitle className="text-lg flex items-center gap-2 uppercase font-black"><Bell className="w-5 h-5 text-accent" /> Alertes</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {user.role === 'admin' ? (
                                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                    <p className="font-bold text-red-500">Validation Requise</p>
                                    <p className="text-xs">{allUsers.filter(u => !u.verified || !u.isApproved).length} nouveaux utilisateurs attendent votre approbation.</p>
                                </div>
                            ) : (
                                <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg">
                                    <p className="font-bold text-primary">Status Système</p>
                                    <p className="text-xs">Tous les services sont opérationnels (Supabase, Stripe, IA, OCR).</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    <Card className="glass-card bg-primary text-primary-foreground">
                        <CardHeader><CardTitle className="text-lg flex items-center gap-2 font-black uppercase"><QrCode className="w-5 h-5" /> Ma Carte Digitale</CardTitle></CardHeader>
                        <CardContent className="flex flex-col items-center py-4">
                            <div className="w-32 h-32 bg-white rounded-xl p-2 mb-4"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=DarAlShifaa-USER-${user.id}`} alt="QR" className="w-full h-full" /></div>
                            <p className="text-xs font-bold uppercase tracking-widest">{user.fullName}</p>
                            <p className="text-[10px] opacity-70 italic">Algérie • {user.role}</p>
                        </CardContent>
                    </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="appointments">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="font-black italic uppercase text-primary">
                    {user.role === "doctor" ? "Gestion des Rendez-vous" : "Prendre Rendez-vous"}
                  </CardTitle>
                  <CardDescription>
                    {user.role === "doctor" 
                      ? "Validez ou refusez les demandes de vos patients."
                      : "Sélectionnez un médecin et réservez votre créneau."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {user.role === "doctor" ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Patient</TableHead>
                          <TableHead>Date & Heure</TableHead>
                          <TableHead>Notes</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {appointments.filter(a => a.doctorId === user.id).map(a => (
                          <TableRow key={a.id}>
                            <TableCell className="font-bold">
                              {allUsers.find(u => u.id === a.patientId)?.fullName || "Patient Inconnu"}
                            </TableCell>
                            <TableCell>
                              {new Date(a.date).toLocaleDateString()} à {a.time}
                            </TableCell>
                            <TableCell className="text-xs italic">{a.notes}</TableCell>
                            <TableCell>
                              <Badge variant={a.status === 'confirmed' ? 'default' : a.status === 'pending' ? 'outline' : 'destructive'} className="uppercase font-black text-[8px]">
                                {a.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              {a.status === 'pending' && (
                                <>
                                  <Button size="sm" className="bg-green-600 rounded-full" onClick={() => updateAppointment(a.id, { status: 'confirmed' })}>
                                    Accepter
                                  </Button>
                                  <Button size="sm" variant="destructive" className="rounded-full" onClick={() => updateAppointment(a.id, { status: 'cancelled' })}>
                                    Refuser
                                  </Button>
                                </>
                              )}
                              <Button size="icon" variant="ghost" onClick={() => deleteAppointment(a.id)} className="text-red-500">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {appointments.filter(a => a.doctorId === user.id).length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-10 opacity-40 italic">
                              Aucun rendez-vous pour le moment
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {allUsers.filter(u => u.role === 'doctor').map(doctor => (
                          <Card key={doctor.id} className="p-6 bg-secondary/10 border-none rounded-[30px] hover:shadow-xl transition-all group">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-black text-xl shadow-lg">
                                {doctor.fullName.charAt(0)}
                              </div>
                              <div>
                                <p className="font-black text-lg">{doctor.fullName}</p>
                                <p className="text-xs opacity-70 font-bold uppercase tracking-widest">{doctor.specialty || "Médecin"}</p>
                              </div>
                            </div>
                            <div className="space-y-2 mb-6 text-sm">
                              <div className="flex items-center gap-2 opacity-60">
                                <MapPin className="w-4 h-4" />
                                <span>{doctor.wilaya}, {doctor.city}</span>
                              </div>
                              <div className="flex items-center gap-2 opacity-60">
                                <Stethoscope className="w-4 h-4" />
                                <span>{doctor.address}</span>
                              </div>
                            </div>
                            <Button className="w-full rounded-full font-black uppercase italic shadow-md" onClick={() => {
                              setSelectedDoctorForRDV(doctor);
                              setNewAppointment({ ...newAppointment, patientId: user.id });
                              setIsAppointmentDialogOpen(true);
                            }}>
                              Réserver un RDV
                            </Button>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cnas">
               <Card className="glass-card">
                   <CardHeader><CardTitle className="uppercase font-black italic text-primary">Dossier Médical & CNAS</CardTitle><CardDescription>Consultez les antécédents et vérifiez le status CHIFA du patient.</CardDescription></CardHeader>
                   <CardContent className="space-y-6">
                       <div className="flex gap-2">
                           <Input placeholder="Rechercher Patient par Nom ou ID..." value={selectedPatientId} onChange={e => setSelectedPatientId(e.target.value)} className="h-12" />
                           <Button className="h-12 px-6"><Search className="w-4 h-4 mr-2" /> Rechercher</Button>
                       </div>
                         <div className="grid md:grid-cols-2 gap-4">
                             {allUsers.filter(u => u.role === 'patient' && 
                               (appointments.some(a => a.patientId === u.id && a.doctorId === user.id) || 
                                medicalDossiers.some(d => d.patientId === u.id && d.history.some(h => h.doctorId === user.id))) &&
                               (u.fullName.toLowerCase().includes(selectedPatientId.toLowerCase()) || u.id === selectedPatientId)).map(p => {
                                 const dossier = medicalDossiers.find(d => d.patientId === p.id);
                                 return (
                               <Card key={p.id} className="p-6 bg-secondary/10 border-none rounded-[30px] hover:shadow-xl transition-all">
                                   <div className="flex items-center gap-4 mb-6">
                                       <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-black text-xl shadow-lg">{p.fullName.charAt(0)}</div>
                                       <div>
                                           <p className="font-black text-lg">{p.fullName}</p>
                                           <p className="text-xs opacity-70 font-bold uppercase tracking-widest">{p.wilaya}, Algérie</p>
                                       </div>
                                   </div>
                                   <div className="space-y-3">
                                       <div className="flex justify-between items-center p-3 bg-white/50 rounded-xl border border-white/20">
                                           <span className="text-sm font-bold uppercase opacity-60">Status CHIFA</span>
                                           <Badge variant={cnasStatuses[p.id]?.isInsured ? "default" : "destructive"} className="uppercase font-black">{cnasStatuses[p.id]?.isInsured ? "Assuré" : "Non-Assuré"}</Badge>
                                       </div>
                                       <div className="flex justify-between items-center p-3 bg-white/50 rounded-xl border border-white/20">
                                           <span className="text-sm font-bold uppercase opacity-60">Groupe Sanguin</span>
                                           <span className="font-black text-red-500">{dossier?.bloodType || "Inconnu"}</span>
                                       </div>
                                   </div>
                                     <Button className="w-full mt-6 rounded-full font-black uppercase italic shadow-md" variant="outline" onClick={() => { setSelectedDossierPatient(p); setIsDossierDialogOpen(true); }}>Voir Dossier Médical</Button>

                               </Card>
                           );})}
                       </div>
                   </CardContent>
               </Card>
            </TabsContent>

              <TabsContent value="patient-cnas">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="glass-card bg-gradient-to-br from-teal-500/10 to-blue-500/10 border-teal-500/30">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-teal-600 font-black italic uppercase text-xl">Ma Carte CHIFA Digitale</CardTitle>
                        <CNASStatusBadge status={cnasStatuses[user.id]?.isInsured ? "active" : "pending"} />
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center py-6">
                      <CHIFAQRCode 
                        hash={generateCHIFAHash(cnasStatuses[user.id]?.cnasNumber || "0000000000", "active")} 
                        status="Actif" 
                        expiresAt="2026-12-31" 
                      />
                      
                      <div className="mt-8 w-full p-6 bg-white/50 rounded-[30px] shadow-inner space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <p className="text-muted-foreground uppercase font-black tracking-tighter mb-1">Assuré</p>
                            <p className="font-bold">{user.fullName}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground uppercase font-black tracking-tighter mb-1">N° Sécurité Sociale</p>
                            <p className="font-mono font-bold">{cnasStatuses[user.id]?.cnasNumber || "Non défini"}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground uppercase font-black tracking-tighter mb-1">Valide jusqu'au</p>
                            <p className="font-bold">31/12/2026</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground uppercase font-black tracking-tighter mb-1">Taux</p>
                            <p className="font-bold text-teal-600">80% (Standard)</p>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full rounded-full h-10 text-[10px] font-black uppercase italic">
                          Exporter l'Attestation (PDF)
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-6">
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="font-black uppercase italic text-sm">Mise à jour Dossier CNAS</CardTitle>
                        <CardDescription>Scannez votre nouvelle carte ou téléversez votre attestation d'affiliation.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <CHIFAScanner onScanComplete={(data) => {
                          updateCNASStatus({
                            userId: user.id,
                            cnasNumber: data.nss,
                            isInsured: data.isValid,
                            updatedAt: new Date().toISOString()
                          });
                          toast.success("Dossier CNAS mis à jour !");
                        }} />
                      </CardContent>
                    </Card>

                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="font-black uppercase italic text-sm">Documents Justificatifs</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg"><FileText className="w-4 h-4 text-primary" /></div>
                            <div>
                              <p className="text-xs font-bold">Attestation_Affiliation.pdf</p>
                              <p className="text-[10px] opacity-60">Ajouté le 25/12/2025</p>
                            </div>
                          </div>
                          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Validé</Badge>
                        </div>
                        <Button variant="outline" className="w-full border-dashed rounded-xl h-12 gap-2">
                          <Plus className="w-4 h-4" />
                          Ajouter un document (Scan/PDF)
                        </Button>
                      </CardContent>
                    </Card>

                    <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex gap-3 italic">
                      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                      <p className="text-[10px] text-amber-700 leading-relaxed">
                        {CNAS_DISCLAIMER}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>


            <TabsContent value="cnas-benefits">
              <Card className="glass-card">
                <CardHeader><CardTitle className="uppercase font-black text-teal-700 italic">Prestations & Droits CNAS</CardTitle></CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-teal-50 rounded-2xl border-l-4 border-teal-500">
                      <h4 className="font-bold text-teal-900 mb-2">Soins Médicaux & Médicaments</h4>
                      <p className="text-sm">Taux de remboursement de 80% à 100% (maladies chroniques ALD).</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-2xl border-l-4 border-blue-500">
                      <h4 className="font-bold text-blue-900 mb-2">Arrêts de Travail</h4>
                      <p className="text-sm">50% du salaire pendant les 15 premiers jours, 100% ensuite. Durée max 3 ans.</p>
                    </div>
                    <div className="p-4 bg-pink-50 rounded-2xl border-l-4 border-pink-500">
                      <h4 className="font-bold text-pink-900 mb-2">Assurance Maternité</h4>
                      <p className="text-sm">Prise en charge à 100%. Congé de 98 jours.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-orange-50 rounded-2xl border-l-4 border-orange-500">
                      <h4 className="font-bold text-orange-900 mb-2">Invalidité & Décès</h4>
                      <p className="text-sm">Pension d'invalidité (75% du SNMG). Capital décès pour les ayants droit.</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-2xl border-l-4 border-red-500">
                      <h4 className="font-bold text-red-900 mb-2">Accidents de Travail</h4>
                      <p className="text-sm">Couverture à 100% des soins et arrêts. Rentes en cas de séquelles ou décès.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="chifa-tech">
              <Card className="glass-card">
                <CardHeader><CardTitle className="uppercase font-black text-primary italic">Spécifications Techniques Carte CHIFA</CardTitle></CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="font-black text-sm uppercase opacity-50">Caractéristiques Matérielles</h4>
                    <ul className="space-y-2 text-sm font-medium">
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Capacité: 32 Kilooctets</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Normes: ISO 7810, 7816</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Matériau: Plastique PET haute résistance</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Durée de vie: 5 ans minimum</li>
                    </ul>
                    <h4 className="font-black text-sm uppercase opacity-50 mt-6">Sécurité</h4>
                    <ul className="space-y-2 text-sm font-medium">
                      <li className="flex items-center gap-2"><Shield className="w-4 h-4 text-blue-500" /> Cryptage des données</li>
                      <li className="flex items-center gap-2"><Shield className="w-4 h-4 text-blue-500" /> Code PIN utilisateur requis</li>
                      <li className="flex items-center gap-2"><Shield className="w-4 h-4 text-blue-500" /> Signature électronique des factures</li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-black text-sm uppercase opacity-50">Usages du Système</h4>
                    <ul className="space-y-2 text-sm font-medium">
                      <li>• Contrôle des droits et validité</li>
                      <li>• Suivi de la consommation pharmaceutique</li>
                      <li>• Établissement automatique de la feuille de soins</li>
                      <li>• Télétransmission des factures au fonds CNAS</li>
                      <li>• Stockage des informations médicales d'urgence</li>
                    </ul>
                    <Card className="bg-primary/5 border-primary/20 mt-6">
                      <CardHeader className="p-4"><CardTitle className="text-xs font-black uppercase">Objectifs du Projet</CardTitle></CardHeader>
                      <CardContent className="p-4 pt-0 text-xs italic">
                        Amélioration de la qualité des prestations, simplification des procédures, lutte contre la fraude et modernisation du secteur social en Algérie.
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
               <div className="space-y-6">
                   <Card className="glass-card overflow-hidden">
                       <div className="h-1.5 w-full bg-gradient-to-r from-primary to-accent" />
                       <CardHeader><CardTitle className="font-black italic uppercase flex items-center gap-2"><HistoryIcon className="w-6 h-6 text-primary" /> Mon Journal de Santé</CardTitle></CardHeader>
                       <CardContent>
                           <div className="space-y-4">
                               {prescriptions.filter(p => p.patientId === user.id).length === 0 ? (
                                   <div className="flex flex-col items-center justify-center py-20 bg-secondary/5 rounded-[40px] border-4 border-dashed">
                                       <FileText className="w-16 h-16 text-muted-foreground mb-4 opacity-20" />
                                       <p className="text-xl font-black uppercase italic text-muted-foreground/40">Historique Vierge</p>
                                   </div>
                               ) : (
                                   prescriptions.filter(p => p.patientId === user.id).map(p => (
                                       <div key={p.id} className="p-6 bg-white/50 backdrop-blur-md border border-white/40 rounded-[30px] shadow-sm group">
                                           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                               <div>
                                                   <Badge className="mb-2 bg-primary/10 text-primary uppercase font-black italic tracking-widest">{new Date(p.createdAt).toLocaleDateString()}</Badge>
                                                   <p className="font-black text-2xl italic tracking-tighter">{p.diagnosis}</p>
                                                   <p className="text-xs font-bold uppercase opacity-60 tracking-widest">Prescrit par Dr. {allUsers.find(u => u.id === p.doctorId)?.fullName || "Inconnu"}</p>
                                               </div>
                                               <div className="flex gap-2">
                                                   <Button size="icon" variant="secondary" className="rounded-full shadow-lg" onClick={() => handlePrint(p)}><Printer className="w-4 h-4" /></Button>
                                               </div>
                                           </div>
                                       </div>
                                   ))
                               )}
                           </div>
                       </CardContent>
                   </Card>
               </div>
            </TabsContent>

            <TabsContent value="pharmacy-search">
              <Card className="glass-card">
                <CardHeader><CardTitle className="font-black italic uppercase">Rechercher une Pharmacie</CardTitle><CardDescription>Trouvez les officines les plus proches à {user.wilaya}.</CardDescription></CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex gap-2">
                    <Input placeholder="Nom, Wilaya, ou médicament recherché..." className="h-12" />
                    <Button className="h-12 px-6"><Search className="w-4 h-4 mr-2" /> Chercher</Button>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pharmacies.filter(p => p.wilaya === user.wilaya).map(p => (
                      <Card key={p.id} className="p-5 bg-secondary/10 border-none rounded-[30px] hover:shadow-xl transition-all">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-white font-black italic shadow-lg">Ph</div>
                          <div className="flex-1 overflow-hidden">
                            <p className="font-black text-sm uppercase truncate italic">{p.name}</p>
                            <p className="text-[10px] font-bold opacity-60 truncate">{p.address}</p>
                          </div>
                        </div>
                        <div className="space-y-1 mb-6">
                          <Badge variant="outline" className="text-[8px] uppercase">{p.isOpen24h ? "Ouvert 24h/24" : "Ferme à 20h"}</Badge>
                          <Badge variant="secondary" className="text-[8px] uppercase ml-1">{p.hasDelivery ? "Livraison Disponible" : "Retrait uniquement"}</Badge>
                        </div>
                        <Button className="w-full rounded-full font-black uppercase italic shadow-lg" onClick={() => { setNewPatientOrder({...newPatientOrder, pharmacyId: p.id}); setIsPatientOrderDialogOpen(true); }}>Passer Commande</Button>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

              <TabsContent value="patient-orders">
                <Card className="glass-card">
                  <CardHeader><CardTitle className="font-black italic uppercase text-primary">Mes Commandes & Demandes</CardTitle></CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Articles</TableHead><TableHead>Pharmacie</TableHead><TableHead>Status</TableHead><TableHead>Total</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {orders.filter(o => o.userId === user.id).map(o => (
                          <TableRow key={o.id}>
                            <TableCell className="font-mono text-[10px]">#{o.id.slice(0,8)}</TableCell>
                            <TableCell className="text-[10px] max-w-[200px] font-bold italic">
                              {o.items.map(i => {
                                const med = medicines.find(m => m.id === i.medicineId);
                                return `${med?.name || 'Inconnu'} (x${i.quantity})`;
                              }).join(', ')}
                            </TableCell>
                            <TableCell className="text-[10px] font-medium">{pharmacies.find(p => p.id === o.pharmacyId)?.name || "Officine"}</TableCell>
                            <TableCell><Badge className="uppercase font-black text-[8px]">{o.status}</Badge></TableCell>
                            <TableCell className="font-black text-primary">{o.totalAmount} DA</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="pharmacy-cnas">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="uppercase font-black text-teal-600 italic">Validation CHIFA</CardTitle>
                        <CardDescription>Vérifiez les droits de l'assuré et simulez le tiers payant.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <CHIFAScanner onScanComplete={(data) => {
                          setPharmacyVerificationData(data);
                          toast.success("Droits CHIFA chargés !");
                        }} />
                        
                        <div className="relative group">
                          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <Input 
                            placeholder="Recherche manuelle par NSS..." 
                            value={cnasCheckId} 
                            onChange={e => setCnasCheckId(e.target.value)} 
                            className="pl-12 h-14 rounded-full font-bold border-2 focus:border-teal-600 shadow-xl" 
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <div className="space-y-6">
                      {pharmacyVerificationData ? (
                        <Card className="glass-card animate-in fade-in slide-in-from-right-4 border-teal-500/30 bg-teal-500/5">
                          <CardHeader>
                            <div className="flex justify-between items-center">
                              <CardTitle className="font-black uppercase text-sm">Résultat Vérification</CardTitle>
                              <CNASStatusBadge status={pharmacyVerificationData.isValid ? "active" : "invalid"} />
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-xs p-4 bg-white/50 rounded-2xl">
                              <div>
                                <p className="text-muted-foreground uppercase font-black tracking-tighter mb-1">Assuré</p>
                                <p className="font-bold">{pharmacyVerificationData.fullName}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground uppercase font-black tracking-tighter mb-1">NSS</p>
                                <p className="font-mono font-bold">{pharmacyVerificationData.nss}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground uppercase font-black tracking-tighter mb-1">Validité</p>
                                <p className="font-bold">31/12/2026</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground uppercase font-black tracking-tighter mb-1">Taux</p>
                                <p className="font-bold text-teal-600">80%</p>
                              </div>
                            </div>
                            
                            <Button className="w-full rounded-full font-black uppercase italic h-12">
                              Lancer Simulation Facturation
                            </Button>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-secondary/10 rounded-[40px] border-4 border-dashed">
                          <ShieldCheck className="w-16 h-16 text-muted-foreground/20 mb-4" />
                          <p className="text-sm font-bold text-muted-foreground/40 uppercase">En attente de scan ou saisie</p>
                        </div>
                      )}
                      
                      <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex gap-3 italic">
                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                        <p className="text-[10px] text-amber-700 leading-relaxed">
                          {CNAS_DISCLAIMER}
                        </p>
                      </div>
                    </div>
                  </div>
              </TabsContent>


            <TabsContent value="cnas-pro">
                <Card className="glass-card bg-teal-600 text-white">
                    <CardHeader><CardTitle className="text-2xl font-black uppercase italic">Dashboard Administrateur CNAS</CardTitle><CardDescription className="text-white/70">Gestion des assurés sociaux et validation des dossiers de remboursement.</CardDescription></CardHeader>
                    <CardContent>
                        <Table className="text-white">
                            <TableHeader><TableRow className="border-white/20"><TableHead className="text-white">Assuré</TableHead><TableHead className="text-white">N° CHIFA</TableHead><TableHead className="text-white">Status</TableHead><TableHead className="text-white">Action</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {allUsers.filter(u => u.role === 'patient').map(u => (
                                    <TableRow key={u.id} className="border-white/10">
                                        <TableCell>{u.fullName}</TableCell>
                                        <TableCell className="font-mono">{cnasStatuses[u.id]?.cnasNumber || "N/A"}</TableCell>
                                        <TableCell><Badge className="bg-white text-teal-600">{cnasStatuses[u.id]?.isInsured ? "A JOUR" : "PENDING"}</Badge></TableCell>
                                        <TableCell><Button variant="secondary" size="sm" onClick={() => updateCNASStatus({userId: u.id, cnasNumber: cnasStatuses[u.id]?.cnasNumber || "1234567890", isInsured: true, updatedAt: new Date().toISOString()})}>Valider Droits</Button></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="stock">
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div><CardTitle className="font-black italic uppercase">Inventaire Global</CardTitle><CardDescription>Gérez vos références, prix et stocks en temps réel.</CardDescription></div>
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="rounded-full" onClick={() => document.getElementById('csv-import')?.click()}><FileSpreadsheet className="w-4 h-4 mr-2" /> CSV</Button>
                            <Button size="sm" className="rounded-full shadow-lg" onClick={() => { setEditingMedicine(null); setIsAddDialogOpen(true); }}><Plus className="w-4 h-4 mr-2" /> Nouveau</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input placeholder="Rechercher un médicament..." className="pl-10 h-11" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        <ScrollArea className="h-[500px] pr-4">
                            <Table>
                                <TableHeader><TableRow><TableHead>Designation</TableHead><TableHead>Générique (DCI)</TableHead><TableHead>Prix</TableHead><TableHead>Stock</TableHead><TableHead>Expiry</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {medicines.filter(m => m.pharmacyId === userPharmacy?.id && (m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.genericName.toLowerCase().includes(searchTerm.toLowerCase()))).map(m => (
                                        <TableRow key={m.id} className={m.quantity < 20 ? "bg-red-500/5" : ""}>
                                            <TableCell className="font-black italic">{m.name} <span className="text-[10px] opacity-40">{m.nameAr}</span></TableCell>
                                            <TableCell className="text-xs">{m.genericName}</TableCell>
                                            <TableCell className="font-bold">{m.price} DA</TableCell>
                                            <TableCell><Badge variant={m.quantity < 20 ? "destructive" : "secondary"}>{m.quantity} {m.unit}</Badge></TableCell>
                                            <TableCell className="text-xs">{new Date(m.expiryDate).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right space-x-1">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-500" onClick={() => { 
                                                    setEditingMedicine(m);
                                                    setNewMedicine({
                                                        name: m.name, nameAr: m.nameAr, genericName: m.genericName, category: m.category,
                                                        manufacturer: m.manufacturer, price: m.price.toString(), quantity: m.quantity.toString(),
                                                        unit: m.unit, expiryDate: m.expiryDate, batchNumber: m.batchNumber,
                                                        barcode: m.barcode, description: m.description, requiresPrescription: m.requiresPrescription,
                                                        isDonation: m.isDonation || false
                                                    });
                                                    setIsAddDialogOpen(true);
                                                }}><Edit className="w-4 h-4" /></Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => {
                                                    if(confirm("Supprimer ce médicament ?")) deleteMedicine(m.id);
                                                }}><Trash2 className="w-4 h-4" /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </TabsContent>

              <TabsContent value="factory-search">
                  <Card className="glass-card relative overflow-hidden min-h-[400px]">
                      <CardHeader><CardTitle className="font-black italic uppercase">Approvisionnement Industriel</CardTitle><CardDescription>Localisez les usines à {user.wilaya} et passez vos commandes directes.</CardDescription></CardHeader>
                      <CardContent className="space-y-6">
                           <div className="flex gap-2">
                               <Input placeholder="Médicament recherché chez l'usine..." value={searchMedsInNearby} onChange={e => setSearchMedsInNearby(e.target.value)} className="h-12" />
                           </div>
                           <div className="grid md:grid-cols-2 gap-4">
                               {nearbyFactories.map(f => (
                                   <Card key={f.id} className="p-6 bg-primary/5 hover:border-primary transition-all border-2 border-transparent rounded-[30px]">
                                       <div className="flex justify-between items-start mb-4">
                                           <div className="flex items-center gap-3">
                                               <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white"><Factory className="w-6 h-6" /></div>
                                               <div><p className="font-black uppercase italic">{f.fullName}</p><p className="text-[10px] font-bold opacity-60">Wilaya: {f.wilaya}</p></div>
                                           </div>
                                           <Badge variant="outline" className="border-primary text-primary">Industriel</Badge>
                                       </div>
                                       <Button className="w-full rounded-2xl font-black italic uppercase shadow-lg" onClick={() => { setNewFactoryOrder({...newFactoryOrder, factoryId: f.id}); setIsFactoryOrderDialogOpen(true); }}>Passer une Commande</Button>
                                   </Card>
                               ))}
                           </div>
                      </CardContent>

                      {user.plan !== "enterprise" && (
                        <div className="absolute inset-0 bg-background/60 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-10">
                          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                            <Lock className="w-8 h-8 text-primary" />
                          </div>
                          <h4 className="text-2xl font-black uppercase italic mb-2 text-primary">Accès Direct Usines</h4>
                          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                            {language === "ar" 
                              ? "الوصول المباشر للمصانع والأسعار الصناعية متاح فقط لمشتركي الخطة المؤسسية."
                              : "L'accès direct aux stocks d'usines et aux prix industriels est réservé exclusivement aux abonnés Enterprise."}
                          </p>
                          <Button size="lg" className="rounded-full font-black uppercase italic px-8 shadow-xl" asChild>
                            <Link href="/pricing">Passer au plan ENTERPRISE</Link>
                          </Button>
                        </div>
                      )}
                  </Card>
              </TabsContent>

              <TabsContent value="pharmacy-map">
                  <Card className="glass-card relative overflow-hidden min-h-[400px]">
                      <CardHeader><CardTitle className="font-black italic uppercase">Réseau des Pharmacies Clients</CardTitle><CardDescription>Contactez les pharmacies de votre région pour proposer vos produits.</CardDescription></CardHeader>
                      <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {pharmacies.filter(p => p.wilaya === user.wilaya).map(p => (
                                    <Card key={p.id} className="p-5 border-none bg-secondary/10 rounded-[25px] hover:shadow-xl transition-all">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white font-black italic shadow-lg">Ph</div>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="font-black text-sm uppercase truncate italic">{p.name}</p>
                                                <p className="text-[10px] font-bold opacity-60 truncate">{p.address}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2 mb-4">
                                            <div className="flex justify-between text-[10px] font-black uppercase opacity-50"><span>Tél:</span><span className="text-foreground">{p.phone}</span></div>
                                            <div className="flex justify-between text-[10px] font-black uppercase opacity-50"><span>Plan:</span><Badge variant="outline" className="h-4 text-[8px] uppercase">{p.plan}</Badge></div>
                                        </div>
                                        <Button size="sm" className="w-full rounded-full bg-accent font-black uppercase italic shadow-lg" onClick={() => toast.info(`Appel du télévendeur vers ${p.phone}...`)}>Appeler Télévendeur</Button>
                                    </Card>
                              ))}
                          </div>
                      </CardContent>

                      {user.plan !== "enterprise" && (
                        <div className="absolute inset-0 bg-background/60 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-10">
                          <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-6">
                            <Lock className="w-8 h-8 text-accent" />
                          </div>
                          <h4 className="text-2xl font-black uppercase italic mb-2 text-accent">Marketing Ciblé & CRM</h4>
                          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                            {language === "ar" 
                              ? "الوصول إلى شبكة الصيدليات وأدوات التسويق المستهدف متاح فقط لمشتركي الخطة المؤسسية."
                              : "La prospection des pharmacies et l'accès aux outils marketing sont réservés au plan Enterprise."}
                          </p>
                          <Button size="lg" variant="accent" className="rounded-full font-black uppercase italic px-8 shadow-xl" asChild>
                            <Link href="/pricing">Activer Enterprise</Link>
                          </Button>
                        </div>
                      )}
                  </Card>
              </TabsContent>

            <TabsContent value="deliveries">
                <Card className="glass-card">
                    <CardHeader><CardTitle className="font-black italic uppercase">Demandes de Livraison Patients</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                              <TableHeader><TableRow><TableHead>Client</TableHead><TableHead>Articles</TableHead><TableHead>Adresse</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                              <TableBody>
                                  {orders.filter(o => o.pharmacyId === userPharmacy?.id).map(o => (
                                      <TableRow key={o.id}>
                                          <TableCell className="font-bold">{allUsers.find(u => u.id === o.userId)?.fullName}</TableCell>
                                          <TableCell className="text-[10px] max-w-[200px]">
                                            {o.items.map(i => {
                                              const med = medicines.find(m => m.id === i.medicineId);
                                              return `${med?.name || 'Inconnu'} (x${i.quantity})`;
                                            }).join(', ')}
                                          </TableCell>
                                          <TableCell className="text-xs">{o.deliveryAddress}</TableCell>
                                          <TableCell className="font-bold text-primary">{o.totalAmount} DA</TableCell>
                                          <TableCell><Badge className="uppercase font-black text-[8px]">{o.status}</Badge></TableCell>
                                          <TableCell className="flex gap-2">
                                              {o.status === 'pending' && <Button size="sm" className="bg-green-600 rounded-full h-8" onClick={() => updateOrder(o.id, { status: 'confirmed' })}>Accepter</Button>}
                                              {o.status === 'confirmed' && <Button size="sm" className="bg-blue-600 rounded-full h-8" onClick={() => updateOrder(o.id, { status: 'shipped' })}>Expédier</Button>}
                                              {o.status === 'pending' && <Button size="sm" variant="destructive" className="rounded-full h-8" onClick={() => updateOrder(o.id, { status: 'cancelled' })}>Refuser</Button>}
                                          </TableCell>
                                      </TableRow>
                                  ))}
                              </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="factory-sales">
                <Card className="glass-card">
                    <CardHeader><CardTitle className="font-black italic uppercase">Offres d'Achat (Pharmacies)</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>Pharmacie</TableHead><TableHead>Items</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {factoryOrders.filter(o => o.factoryId === user.id).map(o => (
                                    <TableRow key={o.id}>
                                        <TableCell className="font-bold italic">{pharmacies.find(p => p.id === o.pharmacyId)?.name || "Officine"}</TableCell>
                                        <TableCell className="text-xs">{o.items.map(i => `${i.medicineName} (x${i.quantity})`).join(', ')}</TableCell>
                                        <TableCell className="font-black">{o.totalAmount} DA</TableCell>
                                        <TableCell><Badge className="uppercase font-black text-[8px]">{o.status}</Badge></TableCell>
                                        <TableCell>
                                          {o.status === 'pending' && <Button size="sm" onClick={() => updateFactoryOrder(o.id, { status: 'processing' })}>Accepter Commande</Button>}
                                          {o.status === 'processing' && <Button size="sm" onClick={() => updateFactoryOrder(o.id, { status: 'shipped' })}>Marquer Expédiée</Button>}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

              <TabsContent value="production">
                  <Card className="glass-card">
                      <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="font-black italic uppercase">Lignes de Production Industrielles</CardTitle><Button size="sm" className="rounded-full shadow-lg" onClick={() => { setEditingProductionLine(null); setIsProductionLineDialogOpen(true); }}><Plus className="w-4 h-4 mr-2" /> Nouvelle Ligne</Button></CardHeader>
                      <CardContent>
                          <div className="grid md:grid-cols-2 gap-4">
                              {productionLines.filter(l => l.factoryId === user.id).map(line => (
                                  <Card key={line.id} className="p-5 bg-secondary/10 border-none rounded-[30px] group">
                                      <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-black italic uppercase text-lg">{line.name}</h4>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-500" onClick={() => { setEditingProductionLine(line); setIsProductionLineDialogOpen(true); }}><Edit className="w-4 h-4" /></Button>
                                          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => { if(confirm("Supprimer cette ligne?")) deleteProductionLine(line.id); }}><Trash2 className="w-4 h-4" /></Button>
                                        </div>
                                      </div>
                                      <div className="flex justify-between items-center mb-4"><Badge variant={line.status === 'active' ? 'default' : 'destructive'} className="uppercase font-black">{line.status}</Badge></div>
                                      <p className="text-sm font-black opacity-70 mb-2">Produit: {line.medicineName}</p>
                                      <Progress value={line.progress} className="h-3 mb-3 bg-white/50" />
                                      <div className="flex justify-between text-[10px] font-black uppercase opacity-60"><span>Performance: {line.progress}%</span><span>Output: {line.dailyOutput}/jour</span></div>
                                  </Card>
                              ))}
                          </div>
                      </CardContent>
                  </Card>
              </TabsContent>

              <TabsContent value="pharmacy-map">
                  <Card className="glass-card">
                      <CardHeader><CardTitle className="font-black italic uppercase">Réseau des Pharmacies Clients</CardTitle><CardDescription>Contactez les pharmacies de votre région pour proposer vos produits.</CardDescription></CardHeader>
                      <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {pharmacies.filter(p => p.wilaya === user.wilaya).map(p => (
                                  <Card key={p.id} className="p-5 border-none bg-secondary/10 rounded-[25px] hover:shadow-xl transition-all">
                                      <div className="flex items-center gap-3 mb-4">
                                          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white font-black italic shadow-lg">Ph</div>
                                          <div className="flex-1 overflow-hidden">
                                              <p className="font-black text-sm uppercase truncate italic">{p.name}</p>
                                              <p className="text-[10px] font-bold opacity-60 truncate">{p.address}</p>
                                          </div>
                                      </div>
                                      <div className="space-y-2 mb-4">
                                          <div className="flex justify-between text-[10px] font-black uppercase opacity-50"><span>Tél:</span><span className="text-foreground">{p.phone}</span></div>
                                          <div className="flex justify-between text-[10px] font-black uppercase opacity-50"><span>Plan:</span><Badge variant="outline" className="h-4 text-[8px] uppercase">{p.plan}</Badge></div>
                                      </div>
                                      <Button size="sm" className="w-full rounded-full bg-accent font-black uppercase italic shadow-lg" onClick={() => toast.info(`Appel du télévendeur vers ${p.phone}...`)}>Appeler Télévendeur</Button>
                                  </Card>
                              ))}
                          </div>
                      </CardContent>
                  </Card>
              </TabsContent>

          <TabsContent value="prescriptions">
               <div className="grid gap-4">
                   {prescriptions.filter(p => p.doctorId === user.id).length === 0 ? (
                       <div className="flex flex-col items-center justify-center py-20 bg-secondary/5 rounded-[40px] border-4 border-dashed">
                           <FileText className="w-16 h-16 text-muted-foreground mb-4 opacity-20" />
                           <p className="text-xl font-black uppercase italic text-muted-foreground/40">Aucune ordonnance émise</p>
                       </div>
                   ) : (
                       prescriptions.filter(p => p.doctorId === user.id).map(p => (
                           <Card key={p.id} className="glass-card hover:border-primary transition-all group border-l-8 border-primary">
                               <CardHeader className="flex flex-row items-center justify-between">
                                   <div>
                                       <CardTitle className="font-black italic uppercase text-primary text-xl">{p.diagnosis}</CardTitle>
                                       <CardDescription className="font-bold flex flex-col gap-1 mt-1">
                                           <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Patient: {allUsers.find(u => u.id === p.patientId)?.fullName || p.patientId}</span>
                                           <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Date: {new Date(p.createdAt).toLocaleDateString()}</span>
                                       </CardDescription>
                                   </div>
                                   <div className="flex gap-2">
                                       <Button className="rounded-full bg-primary font-black uppercase italic shadow-lg" onClick={() => handlePrint(p)}>
                                           <Printer className="w-4 h-4 mr-2" /> Imprimer
                                       </Button>
                                       <Button variant="outline" size="icon" className="rounded-full shadow-md"><Eye className="w-4 h-4" /></Button>
                                   </div>
                               </CardHeader>
                               <CardContent>
                                   <div className="flex flex-wrap gap-2">
                                       {p.medications.map((m, i) => (
                                           <Badge key={i} variant="secondary" className="font-bold py-1 px-3 border border-primary/20 bg-primary/5">
                                               {m.name} <span className="text-[10px] ml-1 opacity-60">({m.dosage})</span>
                                           </Badge>
                                       ))}
                                   </div>
                               </CardContent>
                           </Card>
                       ))
                   )}
               </div>
          </TabsContent>

          <TabsContent value="doctor-profile">
              <Card className="glass-card">
                  <CardHeader>
                      <CardTitle className="text-2xl font-black uppercase italic text-primary">Configuration de l'Ordonnance & Profil Pro</CardTitle>
                      <CardDescription>Mettez à jour vos informations professionnelles pour qu'elles apparaissent correctement sur vos ordonnances.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                      <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                              <h3 className="font-black uppercase text-sm text-muted-foreground border-b pb-2">Informations Générales</h3>
                              <div className="space-y-2">
                                  <Label className="uppercase font-black text-[10px]">Nom Complet</Label>
                                  <Input value={user.fullName} readOnly className="bg-secondary/20" />
                              </div>
                              <div className="space-y-2">
                                  <Label className="uppercase font-black text-[10px]">Spécialité Médicale</Label>
                                  <Input 
                                      placeholder="Ex: Cardiologue, Médecin Généraliste..." 
                                      value={doctorInfo.specialty} 
                                      onChange={e => setDoctorInfo({...doctorInfo, specialty: e.target.value})}
                                      className="font-bold border-primary/30 focus:border-primary"
                                  />
                              </div>
                              <div className="space-y-2">
                                  <Label className="uppercase font-black text-[10px]">N° Inscription à l'Ordre</Label>
                                  <Input 
                                      placeholder="Votre numéro de licence..." 
                                      value={doctorInfo.licenseNumber} 
                                      onChange={e => setDoctorInfo({...doctorInfo, licenseNumber: e.target.value})}
                                      className="font-mono"
                                  />
                              </div>
                          </div>
                          
                          <div className="space-y-4">
                              <h3 className="font-black uppercase text-sm text-muted-foreground border-b pb-2">Coordonnées du Cabinet</h3>
                              <div className="space-y-2">
                                  <Label className="uppercase font-black text-[10px]">Téléphone Professionnel</Label>
                                  <Input 
                                      placeholder="05XX XX XX XX" 
                                      value={doctorInfo.phone} 
                                      onChange={e => setDoctorInfo({...doctorInfo, phone: e.target.value})}
                                      className="font-bold"
                                  />
                              </div>
                              <div className="space-y-2">
                                  <Label className="uppercase font-black text-[10px]">Adresse du Cabinet</Label>
                                  <Input 
                                      placeholder="Rue, Cité, N°..." 
                                      value={doctorInfo.address} 
                                      onChange={e => setDoctorInfo({...doctorInfo, address: e.target.value})}
                                  />
                              </div>
                              <div className="space-y-2">
                                  <Label className="uppercase font-black text-[10px]">Wilaya</Label>
                                  <Input 
                                      placeholder="Ex: Alger, Oran..." 
                                      value={doctorInfo.wilaya} 
                                      onChange={e => setDoctorInfo({...doctorInfo, wilaya: e.target.value})}
                                  />
                              </div>
                          </div>
                      </div>

                      <div className="flex justify-center pt-4">
                          <Button 
                              className="rounded-full font-black uppercase italic bg-accent hover:bg-accent/90 shadow-xl px-12 h-14 text-lg"
                              onClick={async () => {
                                  await updateUser(user.id, doctorInfo);
                                  toast.success("Profil professionnel mis à jour avec succès !");
                              }}
                          >
                              Enregistrer les modifications
                          </Button>
                      </div>

                      <div className="p-6 bg-primary/5 rounded-[30px] border-2 border-dashed border-primary/20 flex flex-col md:flex-row items-center gap-6">
                          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                              <Shield className="w-10 h-10" />
                          </div>
                          <div className="flex-1 text-center md:text-left">
                              <h4 className="font-black uppercase italic text-primary">Aperçu de l'Ordonnance</h4>
                              <p className="text-sm font-medium opacity-70">Toutes les modifications sont enregistrées automatiquement. Vos ordonnances utiliseront ces informations pour générer un document conforme aux normes algériennes.</p>
                          </div>
                          <Button 
                            className="rounded-full font-black uppercase italic bg-primary shadow-xl"
                            onClick={() => {
                                const dummyPresc: Prescription = {
                                    id: 'preview',
                                    doctorId: user.id,
                                    patientId: 'patient-preview',
                                    patientCNAS: '1234567890',
                                    diagnosis: 'Diagnostic de Test',
                                    medications: [
                                        { name: 'Médicament Test', dosage: '1 cp / jour', duration: '7 jours', instructions: 'Le matin' }
                                    ],
                                    cnasEligible: true,
                                    stamped: true,
                                    notes: '',
                                    createdAt: new Date().toISOString()
                                };
                                handlePrint(dummyPresc);
                            }}
                          >
                              <Printer className="w-4 h-4 mr-2" /> Tester Impression
                          </Button>
                      </div>
                  </CardContent>
              </Card>
          </TabsContent>

          <TabsContent value="trainer-courses">
              <Card className="glass-card">
                  <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="font-black italic uppercase">Mes Cours Professionnels</CardTitle><Button size="sm" className="rounded-full shadow-lg" onClick={() => { setEditingCourse(null); setIsCourseDialogOpen(true); }}><Plus className="w-4 h-4 mr-2" /> Créer un Cours</Button></CardHeader>
                  <CardContent>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {courses.filter(c => c.trainerId === user.id).map(course => (
                              <Card key={course.id} className={`overflow-hidden border-none bg-secondary/10 rounded-[40px] group shadow-lg hover:shadow-2xl transition-all ${course.zoomUrl ? 'ring-2 ring-sky-500 ring-offset-2 animate-pulse' : ''}`}>
                                  <div className="h-32 bg-gradient-to-br from-primary to-accent relative flex items-center justify-center">
                                      <BookOpen className="w-16 h-16 text-white/50" />
                                      {course.zoomUrl && (
                                          <div className="absolute top-4 left-4">
                                              <Badge className="bg-sky-500 text-white font-black animate-bounce flex items-center gap-1">
                                                  <Video className="w-3 h-3" /> LIVE
                                              </Badge>
                                          </div>
                                      )}
                                      <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={() => { setEditingCourse(course); setNewCourse(course); setIsCourseDialogOpen(true); }}><Edit className="w-4 h-4" /></Button>
                                          <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full" onClick={() => { if(confirm("Supprimer ce cours?")) deleteCourse(course.id); }}><Trash2 className="w-4 h-4" /></Button>
                                      </div>
                                  </div>
                                  <CardHeader>
                                      <CardTitle className="font-black uppercase italic truncate">{course.title}</CardTitle>
                                      <CardDescription className="line-clamp-2 text-xs font-bold">{course.description}</CardDescription>
                                  </CardHeader>
                                  <CardContent className="flex justify-between items-center">
                                      <Badge variant="outline" className="font-black uppercase">{course.price > 0 ? `${course.price} DA` : "Gratuit"}</Badge>
                                      <Button size="sm" className="rounded-full font-black uppercase italic" onClick={() => toast.info("Mode édition de contenu bientôt disponible...")}>Éditer Contenu</Button>
                                  </CardContent>
                              </Card>
                          ))}
                      </div>
                  </CardContent>
              </Card>
          </TabsContent>

          <TabsContent value="trainer-enrollments">
              <Card className="glass-card">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="font-black italic uppercase">Suivi des Étudiants & Diplômes</CardTitle>
                    <Button size="sm" className="rounded-full shadow-lg" onClick={() => setIsAddStudentDialogOpen(true)}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Inscrire un Étudiant
                    </Button>
                  </CardHeader>
                  <CardContent>
                      <Table>
                          <TableHeader><TableRow><TableHead>Étudiant</TableHead><TableHead>Cours</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                          <TableBody>
                              {enrollments.filter(e => courses.some(c => c.id === e.courseId && c.trainerId === user.id)).map(e => (
                                  <TableRow key={e.id}>
                                      <TableCell className="font-bold">{allUsers.find(u => u.id === e.userId)?.fullName}</TableCell>
                                      <TableCell className="font-medium italic">{courses.find(c => c.id === e.courseId)?.title}</TableCell>
                                      <TableCell><Badge className="uppercase font-black text-[8px]">{e.status}</Badge></TableCell>
                                      <TableCell className="text-right space-x-2">
                                          {e.status === 'pending' && <Button size="sm" className="rounded-full bg-green-600 font-bold" onClick={() => updateEnrollment(e.id, { status: 'approved' })}>Accepter</Button>}
                                          {e.status === 'approved' && (
                                            <div className="inline-flex gap-2">
                                              <input 
                                                type="file" 
                                                id={`cert-upload-${e.id}`} 
                                                className="hidden" 
                                                accept=".pdf"
                                                onChange={(ev) => ev.target.files?.[0] && handleCertificateUpload(e.id, ev.target.files[0])}
                                              />
                                              <Button 
                                                size="sm" 
                                                className="rounded-full bg-primary font-bold" 
                                                onClick={() => document.getElementById(`cert-upload-${e.id}`)?.click()}
                                              >
                                                <CloudUpload className="w-4 h-4 mr-2" />
                                                Uploader Diplôme
                                              </Button>
                                            </div>
                                          )}
                                          {e.status === 'completed' && (
                                            <div className="inline-flex gap-2">
                                              <Button size="sm" variant="outline" className="rounded-full font-bold" onClick={() => window.open(e.certificateUrl, '_blank')}>
                                                <Eye className="w-4 h-4 mr-2" />
                                                Voir Diplôme
                                              </Button>
                                              <Button size="sm" variant="outline" className="rounded-full font-bold" onClick={() => toast.success("Diplôme imprimé avec succès!")}>
                                                <Printer className="w-4 h-4 mr-2" />
                                                Imprimer
                                              </Button>
                                            </div>
                                          )}
                                      </TableCell>
                                  </TableRow>
                              ))}
                          </TableBody>
                      </Table>
                  </CardContent>
              </Card>
          </TabsContent>

            <TabsContent value="admin">
                <Card className="glass-card">
                    <CardHeader><CardTitle className="font-black italic uppercase">Approbations & Paiements CCP</CardTitle><CardDescription>Vérifiez les documents et les reçus CCP pour activer les abonnements.</CardDescription></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>Utilisateur</TableHead><TableHead>Plan / Rôle</TableHead><TableHead>Reçu CCP</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {allUsers.filter(u => (!u.isApproved || !u.verified) || u.ccpReceiptUrl).map(u => (
                                    <TableRow key={u.id}>
                                        <TableCell className="font-black italic">
                                          {u.fullName}
                                          <div className="flex flex-col text-[10px] opacity-50 font-normal">
                                            <span>{u.email}</span>
                                            <span className="font-bold text-primary">{u.wilaya}</span>
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex flex-col gap-1">
                                            <Badge variant="outline" className="uppercase font-black text-[8px] w-fit">{u.role}</Badge>
                                            <Badge className="bg-blue-500 text-white font-black text-[8px] uppercase w-fit">{u.plan}</Badge>
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          {u.ccpReceiptUrl ? (
                                            <Button 
                                              variant="link" 
                                              className="p-0 h-auto text-xs text-primary flex items-center gap-1"
                                              onClick={() => window.open(u.ccpReceiptUrl, '_blank')}
                                            >
                                              <Eye className="w-3 h-3" />
                                              Voir le reçu
                                            </Button>
                                          ) : (
                                            <span className="text-[10px] opacity-40 italic">Aucun reçu</span>
                                          )}
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button 
                                              size="sm" 
                                              className={`${u.isApproved ? "bg-green-500" : "bg-primary"} font-black uppercase italic rounded-full shadow-lg`} 
                                              onClick={() => updateUser(u.id, { isApproved: true, verified: true })}
                                              disabled={u.isApproved && u.verified}
                                            >
                                              {u.isApproved ? "Approuvé" : "Approuver"}
                                            </Button>
                                            <Button size="icon" variant="ghost" className="text-red-500" onClick={() => deleteUser(u.id)}><Trash2 className="w-4 h-4" /></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {allUsers.filter(u => (!u.isApproved || !u.verified) || u.ccpReceiptUrl).length === 0 && (
                                  <TableRow>
                                    <TableCell colSpan={4} className="text-center py-10 opacity-40 italic">
                                      Aucune demande en attente
                                    </TableCell>
                                  </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

          <TabsContent value="entities-management">
              <div className="space-y-6">
                  <Card className="glass-card">
                      <CardHeader><CardTitle className="font-black italic uppercase">Pharmacies & Officines</CardTitle></CardHeader>
                      <CardContent>
                          <Table>
                              <TableHeader><TableRow><TableHead>Nom / Wilaya</TableHead><TableHead>Propriétaire</TableHead><TableHead>Stocks</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                              <TableBody>
                                  {pharmacies.map(p => {
                                      const owner = allUsers.find(u => u.id === p.ownerId);
                                      return (
                                      <TableRow key={p.id}>
                                          <TableCell className="font-black italic">
                                              {p.name}
                                              <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">{p.wilaya}, {p.city}</p>
                                          </TableCell>
                                          <TableCell className="text-xs font-bold">{owner?.fullName || "Inconnu"}</TableCell>
                                          <TableCell>
                                              <div className="flex flex-col gap-1">
                                                  <Badge variant="secondary" className="text-[8px] w-fit">{medicines.filter(m => m.pharmacyId === p.id).length} Médicaments</Badge>
                                                  <Badge variant="outline" className="text-[8px] w-fit">{orders.filter(o => o.pharmacyId === p.id).length} Commandes</Badge>
                                              </div>
                                          </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button size="sm" variant="outline" className="rounded-full font-black uppercase italic text-[10px]" asChild>
                                                    <Link href="/pharmacies"><Eye className="w-3 h-3 mr-1" /> Voir</Link>
                                                </Button>
                                                <Button 
                                                  size="sm" 
                                                  variant="destructive" 
                                                  className="rounded-full font-black uppercase italic text-[10px]"
                                                  onClick={async () => {
                                                    if(confirm("Supprimer cette pharmacie et délier son propriétaire?")) {
                                                      await deletePharmacy(p.id);
                                                      toast.success("Pharmacie supprimée");
                                                    }
                                                  }}
                                                >
                                                  <Trash2 className="w-3 h-3 mr-1" /> Supprimer
                                                </Button>
                                            </TableCell>
                                      </TableRow>
                                  );})}
                              </TableBody>
                          </Table>
                      </CardContent>
                  </Card>

                  <Card className="glass-card">
                      <CardHeader><CardTitle className="font-black italic uppercase">Usines & Production Industrielle</CardTitle></CardHeader>
                      <CardContent>
                          <Table>
                              <TableHeader><TableRow><TableHead>Usine / Région</TableHead><TableHead>Propriétaire</TableHead><TableHead>Production</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                              <TableBody>
                                  {factories.map(f => {
                                      const owner = allUsers.find(u => u.id === f.ownerId);
                                      return (
                                      <TableRow key={f.id}>
                                          <TableCell className="font-black italic">
                                              {f.name}
                                              <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">{f.wilaya}, {f.city}</p>
                                          </TableCell>
                                          <TableCell className="text-xs font-bold">{owner?.fullName || "Inconnu"}</TableCell>
                                          <TableCell>
                                              <div className="flex flex-col gap-1">
                                                  <Badge className="bg-blue-500 text-white text-[8px] w-fit">{productionLines.filter(l => l.factoryId === f.ownerId).length} Lignes</Badge>
                                                  <Badge variant="outline" className="text-[8px] w-fit">{factoryInventory.filter(i => i.factoryId === f.ownerId).length} Items Stock</Badge>
                                              </div>
                                          </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button size="sm" variant="outline" className="rounded-full font-black uppercase italic text-[10px]" asChild>
                                                    <Link href="/factories"><Eye className="w-3 h-3 mr-1" /> Voir</Link>
                                                </Button>
                                                <Button 
                                                  size="sm" 
                                                  variant="destructive" 
                                                  className="rounded-full font-black uppercase italic text-[10px]"
                                                  onClick={async () => {
                                                    if(confirm("Supprimer cette usine et délier son propriétaire?")) {
                                                      await deleteFactory(f.id);
                                                      toast.success("Usine supprimée");
                                                    }
                                                  }}
                                                >
                                                  <Trash2 className="w-3 h-3 mr-1" /> Supprimer
                                                </Button>
                                            </TableCell>
                                      </TableRow>
                                  );})}
                              </TableBody>
                          </Table>
                      </CardContent>
                  </Card>

                  <Card className="glass-card">
                      <CardHeader><CardTitle className="font-black italic uppercase">Écoles & Centres de Formation</CardTitle></CardHeader>
                      <CardContent>
                          <Table>
                              <TableHeader><TableRow><TableHead>Établissement</TableHead><TableHead>Responsable</TableHead><TableHead>Activité</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                              <TableBody>
                                  {schools.map(s => {
                                      const owner = allUsers.find(u => u.id === s.ownerId);
                                      return (
                                      <TableRow key={s.id}>
                                          <TableCell className="font-black italic">
                                              {s.name}
                                              <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">{s.wilaya}, {s.city}</p>
                                          </TableCell>
                                          <TableCell className="text-xs font-bold">{owner?.fullName || "Inconnu"}</TableCell>
                                          <TableCell>
                                              <div className="flex flex-col gap-1">
                                                  <Badge className="bg-orange-500 text-white text-[8px] w-fit">{courses.filter(c => c.trainerId === s.ownerId).length} Formations</Badge>
                                                  <Badge variant="outline" className="text-[8px] w-fit">{enrollments.filter(e => courses.some(c => c.id === e.courseId && c.trainerId === s.ownerId)).length} Étudiants</Badge>
                                              </div>
                                          </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button size="sm" variant="outline" className="rounded-full font-black uppercase italic text-[10px]" asChild>
                                                    <Link href="/training"><Eye className="w-3 h-3 mr-1" /> Voir</Link>
                                                </Button>
                                                <Button 
                                                  size="sm" 
                                                  variant="destructive" 
                                                  className="rounded-full font-black uppercase italic text-[10px]"
                                                  onClick={async () => {
                                                    if(confirm("Supprimer cette école et délier son propriétaire?")) {
                                                      await deleteSchool(s.id);
                                                      toast.success("École supprimée");
                                                    }
                                                  }}
                                                >
                                                  <Trash2 className="w-3 h-3 mr-1" /> Supprimer
                                                </Button>
                                            </TableCell>
                                      </TableRow>
                                  );})}
                              </TableBody>
                          </Table>
                      </CardContent>
                  </Card>
              </div>
          </TabsContent>

            <TabsContent value="system">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="glass-card border-red-500/30">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-red-500" />
                        <CardTitle className="font-black uppercase italic text-sm">Contrôle Fraude (Anomalies NSS)</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-red-500/5 rounded-2xl space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold">NSS Suspects détectés</span>
                          <Badge variant="destructive">12</Badge>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold">Doublons d'Assurés</span>
                          <Badge variant="destructive">3</Badge>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold">Documents falsifiés (IA Flag)</span>
                          <Badge variant="destructive">1</Badge>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full text-[10px] font-black uppercase">Voir Rapport de Sécurité Complet</Button>
                    </CardContent>
                  </Card>

                  <Card className="glass-card border-teal-500/30">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-teal-600" />
                        <CardTitle className="font-black uppercase italic text-sm">Statistiques Centre CNAS (Anonymisé)</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="h-32 flex items-end gap-1 mb-4">
                        {[30, 45, 25, 60, 80, 55, 40].map((h, i) => (
                          <div key={i} className="flex-1 bg-teal-500/40 rounded-t-sm" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div className="p-2 bg-secondary/20 rounded-lg">
                          <p className="opacity-60">Volume Remboursements</p>
                          <p className="font-black">1.2M DZD</p>
                        </div>
                        <div className="p-2 bg-secondary/20 rounded-lg">
                          <p className="opacity-60">Taux Prise en Charge</p>
                          <p className="font-black">82.4%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="md:col-span-2 glass-card">
                    <CardHeader>
                      <CardTitle className="font-black uppercase italic text-sm">Audits & Conformité</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between p-2 border-b">
                          <span>Dernier Audit Système</span>
                          <span className="font-mono">30/12/2025 09:15</span>
                        </div>
                        <div className="flex items-center justify-between p-2 border-b">
                          <span>Conformité RGPD / Médico-légale</span>
                          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[8px]">Validé</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="md:col-span-2 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl italic">
                    <p className="text-[10px] text-amber-700 text-center">
                      {CNAS_DISCLAIMER}
                    </p>
                  </div>
                </div>
            </TabsContent>


          <TabsContent value="doctor-jobs" className="space-y-6">
              <Card className="glass-card">
                  <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="font-black italic uppercase text-primary">Mes Offres d'Emploi</CardTitle><Button size="sm" onClick={() => { setEditingJob(null); setIsJobOfferDialogOpen(true); }} className="rounded-full shadow-lg"><Plus className="w-4 h-4 mr-2" /> Publier</Button></CardHeader>
                  <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                          {jobOffers.filter(j => j.publisherId === user.id).map(offer => (
                              <Card key={offer.id} className="p-5 bg-secondary/10 border-none rounded-[30px] group">
                                  <div className="flex justify-between items-start mb-4">
                                      <h4 className="font-black italic uppercase text-lg text-primary">{offer.title}</h4>
                                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-500" onClick={() => { setEditingJob(offer); setNewJobOffer(offer); setIsJobOfferDialogOpen(true); }}><Edit className="w-4 h-4" /></Button>
                                          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => { if(confirm("Supprimer cette offre?")) deleteJobOffer(offer.id); }}><Trash2 className="w-4 h-4" /></Button>
                                      </div>
                                  </div>
                                  <p className="text-xs font-bold opacity-70 mb-4 line-clamp-2">{offer.description}</p>
                                  <div className="flex justify-between items-center"><span className="font-black text-accent">{offer.salary} DA</span><Badge variant="outline" className="font-bold border-primary text-primary uppercase">Cbn de candidats?</Badge></div>
                              </Card>
                          ))}
                      </div>
                  </CardContent>
              </Card>
          </TabsContent>

          <TabsContent value="jobs">
               <div className="grid md:grid-cols-3 gap-4">
                   {jobOffers.map(offer => (
                       <Card key={offer.id} className="glass-card group overflow-hidden border-none shadow-xl">
                           <div className="h-2 w-full bg-primary" />
                           <CardHeader>
                               <div className="flex justify-between items-start mb-2"><Badge className="bg-primary/20 text-primary hover:bg-primary/30 uppercase font-black text-[8px]">{offer.roleType}</Badge><span className="text-[10px] uppercase font-bold text-muted-foreground">{new Date(offer.createdAt).toLocaleDateString()}</span></div>
                               <CardTitle className="text-lg font-black italic uppercase">{offer.title}</CardTitle>
                               <CardDescription className="flex items-center gap-1 font-bold text-primary"><MapPin className="w-4 h-4" /> {offer.location}</CardDescription>
                           </CardHeader>
                           <CardContent className="space-y-4">
                               <p className="text-xs text-muted-foreground line-clamp-3 font-medium leading-relaxed">{offer.description}</p>
                               <div className="flex justify-between items-center pt-4 border-t border-dashed">
                                   <span className="text-xl font-black text-accent">{offer.salary} DA</span>
                                   <Button size="sm" className="rounded-full shadow-lg group-hover:bg-accent group-hover:text-white transition-colors uppercase font-black italic">Détails</Button>
                               </div>
                           </CardContent>
                       </Card>
                   ))}
               </div>
          </TabsContent>
        </Tabs>

        {/* DIALOGS */}
          <Dialog open={isDossierDialogOpen} onOpenChange={setIsDossierDialogOpen}>
             <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-white">
                 <DialogHeader>
                     <DialogTitle className="text-3xl font-black uppercase text-primary italic border-b-4 border-primary pb-2 flex justify-between items-center">
                         Dossier Médical Confidentiel
                         <Badge variant="outline" className="text-red-600 border-red-600">DR ONLY</Badge>
                     </DialogTitle>
                 </DialogHeader>
                 {selectedDossierPatient && (
                     <div className="py-6 space-y-8">
                         <div className="flex items-center gap-6 p-6 bg-secondary/5 rounded-[40px] border-2 border-dashed">
                             <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-4xl font-black shadow-2xl">{selectedDossierPatient.fullName.charAt(0)}</div>
                             <div>
                                 <h2 className="text-3xl font-black uppercase tracking-tighter">{selectedDossierPatient.fullName}</h2>
                                 <p className="text-sm font-bold opacity-60 uppercase">NSS: {cnasStatuses[selectedDossierPatient.id]?.cnasNumber || "N/A"}</p>
                                 <div className="flex gap-2 mt-2">
                                     <Badge className="bg-red-500 text-white font-black">{medicalDossiers.find(d => d.patientId === selectedDossierPatient.id)?.bloodType || "N/A"}</Badge>
                                     <Badge variant="secondary" className="font-bold">{selectedDossierPatient.wilaya}, Algérie</Badge>
                                 </div>
                             </div>
                         </div>

                         <div className="grid md:grid-cols-2 gap-6">
                             <Card className="rounded-[30px] shadow-sm border-none bg-orange-50/50">
                                 <CardHeader><CardTitle className="text-sm font-black uppercase tracking-widest text-orange-600 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Allergies & Contre-indications</CardTitle></CardHeader>
                                 <CardContent>
                                     <div className="flex flex-wrap gap-2">
                                         {medicalDossiers.find(d => d.patientId === selectedDossierPatient.id)?.allergies.map(a => (
                                             <Badge key={a} className="bg-orange-600 text-white font-bold">{a}</Badge>
                                         )) || <p className="text-xs italic opacity-50">Aucune allergie signalée</p>}
                                     </div>
                                 </CardContent>
                             </Card>
                             <Card className="rounded-[30px] shadow-sm border-none bg-blue-50/50">
                                 <CardHeader><CardTitle className="text-sm font-black uppercase tracking-widest text-blue-600 flex items-center gap-2"><Pill className="w-4 h-4" /> Maladies Chroniques</CardTitle></CardHeader>
                                 <CardContent>
                                     <div className="flex flex-wrap gap-2">
                                         {medicalDossiers.find(d => d.patientId === selectedDossierPatient.id)?.chronicDiseases.map(d => (
                                             <Badge key={d} className="bg-blue-600 text-white font-bold">{d}</Badge>
                                         )) || <p className="text-xs italic opacity-50">Aucune affection chronique</p>}
                                     </div>
                                 </CardContent>
                             </Card>
                         </div>

                         <div className="space-y-4">
                             <h3 className="font-black uppercase italic text-lg border-l-4 border-primary pl-3">Historique des Consultations</h3>
                             <Table>
                                 <TableHeader><TableRow className="bg-secondary/10"><TableHead className="font-black">DATE</TableHead><TableHead className="font-black">DIAGNOSTIC</TableHead><TableHead className="font-black">DOCTEUR</TableHead><TableHead className="font-black">NOTES</TableHead></TableRow></TableHeader>
                                 <TableBody>
                                     {medicalDossiers.find(d => d.patientId === selectedDossierPatient.id)?.history.map((h, i) => (
                                         <TableRow key={i} className="hover:bg-secondary/5">
                                             <TableCell className="font-bold">{new Date(h.date).toLocaleDateString()}</TableCell>
                                             <TableCell className="font-black italic">{h.diagnosis}</TableCell>
                                             <TableCell className="text-xs font-bold uppercase opacity-60">Dr. {allUsers.find(u => u.id === h.doctorId)?.fullName || "Inconnu"}</TableCell>
                                             <TableCell className="text-xs italic">{h.notes}</TableCell>
                                         </TableRow>
                                     )) || <TableRow><TableCell colSpan={4} className="text-center py-10 opacity-40">Aucun historique disponible</TableCell></TableRow>}
                                 </TableBody>
                             </Table>
                         </div>
                     </div>
                 )}
             </DialogContent>
          </Dialog>

          <Dialog open={isPrescriptionDialogOpen} onOpenChange={setIsPrescriptionDialogOpen}>

           <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
             <DialogHeader>
                <DialogTitle className="text-2xl font-black uppercase italic text-primary">Ordonnance Officielle - Algérie</DialogTitle>
             </DialogHeader>
             <div className="grid grid-cols-2 gap-6 py-6 border-y border-dashed my-4">
                <div className="space-y-2">
                    <Label className="uppercase font-black text-[10px] tracking-widest">Patient Concerné</Label>
                    <Select onValueChange={v => {
                        const u = allUsers.find(x => x.id === v);
                        setNewPrescription({...newPrescription, patientId: v, patientCNAS: cnasStatuses[v]?.cnasNumber || ""});
                    }}><SelectTrigger className="h-12 text-lg font-bold"><SelectValue placeholder="Choisir Patient..." /></SelectTrigger>
                        <SelectContent>{allUsers.filter(u => u.role === 'patient').map(u => <SelectItem key={u.id} value={u.id} className="h-12 text-lg">{u.fullName}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label className="uppercase font-black text-[10px] tracking-widest">Dossier / CNAS (Auto-load)</Label>
                    <Input className="h-12 text-lg font-mono bg-secondary/20" readOnly value={newPrescription.patientCNAS} placeholder="N° CHIFA" />
                </div>
                <div className="col-span-2 space-y-2">
                    <Label className="uppercase font-black text-[10px] tracking-widest">Motif de Consultation / Diagnostic</Label>
                    <Textarea className="font-bold text-lg" value={newPrescription.diagnosis} onChange={e => setNewPrescription({...newPrescription, diagnosis: e.target.value})} placeholder="Symptômes et diagnostic..." />
                </div>
             </div>
             <div className="space-y-4">
                <div className="flex justify-between items-center"><Label className="font-black uppercase italic">Traitement prescrit</Label><Button size="sm" variant="outline" onClick={() => setNewPrescription({...newPrescription, medications: [...newPrescription.medications, { name: "", dosage: "", duration: "", instructions: "" }]})}><Plus className="w-4 h-4 mr-1" /> Médicament</Button></div>
                            {newPrescription.medications.map((med, idx) => (
                                <div key={idx} className="p-4 bg-secondary/10 rounded-2xl space-y-3 animate-in fade-in slide-in-from-right-4">
                                      <div className="flex gap-4 items-end">
                                        <div className="flex-1 space-y-1">
                                          <Label className="text-[10px] font-black opacity-50 uppercase">Nom du médicament</Label>
                                          <MedicineAutocomplete 
                                            value={med.name} 
                                            onChange={(value, medicine) => { 
                                              const list = [...newPrescription.medications]; 
                                              list[idx].name = value; 
                                              if (medicine) {
                                                list[idx].dosage = medicine.dosage || list[idx].dosage;
                                              }
                                              setNewPrescription({...newPrescription, medications: list}); 
                                            }} 
                                            placeholder="Rechercher ou saisir un médicament..."
                                            className="font-bold border-none bg-white/50"
                                            language={language as "fr" | "ar" | "en"}
                                          />
                                        </div>
                                        {idx > 0 && <Button variant="ghost" size="icon" className="text-red-500 flex-shrink-0" onClick={() => { const list = [...newPrescription.medications]; list.splice(idx,1); setNewPrescription({...newPrescription, medications: list}); }}><Trash2 className="w-4 h-4" /></Button>}
                                      </div>
                                      <div className="flex gap-4">
                                        <div className="flex-1 space-y-1"><Label className="text-[10px] font-black opacity-50 uppercase">Posologie</Label><Input className="border-none bg-white/50" value={med.dosage} onChange={e => { const list = [...newPrescription.medications]; list[idx].dosage = e.target.value; setNewPrescription({...newPrescription, medications: list}); }} placeholder="Ex: 1 cp matin et soir" /></div>
                                        <div className="flex-1 space-y-1"><Label className="text-[10px] font-black opacity-50 uppercase">Durée</Label><Input className="border-none bg-white/50" value={med.duration} onChange={e => { const list = [...newPrescription.medications]; list[idx].duration = e.target.value; setNewPrescription({...newPrescription, medications: list}); }} placeholder="Ex: 7 jours" /></div>
                                      </div>
                                </div>
                            ))}
                         </div>
                         
                         {reimbursementData && (
                           <div className="mt-6 border-t pt-6">
                             <ReimbursementSummary 
                               totalAmount={reimbursementData.totalAmount}
                               reimbursedAmount={reimbursementData.reimbursedAmount}
                               remainingAmount={reimbursementData.remainingAmount}
                               rate={reimbursementData.rate}
                               category={reimbursementData.category}
                             />
                           </div>
                         )}

               <DialogFooter className="mt-8 border-t pt-6 gap-2">
                 <Button variant="outline" className="h-14 px-8 rounded-full font-black uppercase" onClick={() => setIsPrescriptionDialogOpen(false)}>Annuler</Button>
                 <Button className="h-14 px-8 rounded-full bg-primary text-lg font-black uppercase shadow-2xl hover:scale-105 active:scale-95 transition-all italic" onClick={handleAddPrescription}>Valider & Signer Ordonnance</Button>
             </DialogFooter>
           </DialogContent>
        </Dialog>

        <Dialog open={isOCRDialogOpen} onOpenChange={setIsOCRDialogOpen}>
            <DialogContent className="max-w-3xl">
                <DialogHeader><DialogTitle className="text-2xl font-black uppercase italic">Scanner & Analyser (OCR IA)</DialogTitle><DialogDescription>Extraire intelligemment les données médicales (Prescriptions, CHIFA, Dossiers).</DialogDescription></DialogHeader>
                <div className="flex flex-col items-center justify-center p-12 border-4 border-dashed rounded-[40px] gap-4 bg-secondary/5 mt-4 group hover:border-primary transition-all cursor-pointer relative overflow-hidden" onClick={() => !ocrLoading && document.getElementById('ocr-file')?.click()}>
                    <input type="file" id="ocr-file" className="hidden" accept="image/*" onChange={handleOCR} />
                    {ocrLoading ? (
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative w-24 h-24">
                          <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle className="text-secondary stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent"></circle>
                            <circle className="text-primary stroke-current" strokeWidth="8" strokeLinecap="round" cx="50" cy="50" r="40" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * ocrProgress) / 100} transform="rotate(-90 50 50)"></circle>
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xl font-black italic">{ocrProgress}%</span>
                          </div>
                        </div>
                        <p className="font-black uppercase italic animate-pulse">Analyse en cours...</p>
                      </div>
                    ) : (
                      <>
                        <ScanLine className="w-24 h-24 text-muted-foreground group-hover:text-primary transition-colors group-hover:scale-110 duration-500" />
                        <p className="font-black text-xl text-muted-foreground group-hover:text-primary uppercase italic">Glissez ou cliquez pour scanner</p>
                        <Badge variant="outline" className="animate-pulse">Mode Haute Précision Actif</Badge>
                      </>
                    )}
                </div>
                {ocrResults.length > 0 && (
                  <div className="mt-8 space-y-4">
                    <h4 className="font-black uppercase italic text-black border-l-4 border-primary pl-2">Résultats Organisés de l'Extraction</h4>
                    <div className="space-y-2">
                      {ocrResults.map((res, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white shadow-sm border rounded-2xl hover:shadow-md transition-shadow">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-black text-sm text-black">{res.name}</p>
                                {res.confidence && (
                                  <Badge variant="secondary" className="text-[8px] font-black uppercase bg-primary/10 text-primary">
                                    {res.confidence}% Confiance
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm font-bold text-black">Dosage: {res.dosage} | Quantité: {res.quantity}</p>
                            </div>

                          <div className="flex items-center gap-2">
                            {res.found ? <Badge className="bg-green-500 text-white font-black text-[8px] uppercase">En Stock</Badge> : <Badge className="bg-red-500 text-white font-black text-[8px] uppercase">Indisponible</Badge>}
                            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-md" onClick={() => { setOcrResults([res]); setIsOCRSummaryOpen(true); }}><Eye className="w-4 h-4" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button className="flex-1 h-12 rounded-full font-black uppercase italic bg-primary" onClick={() => setIsOCRSummaryOpen(true)}>Voir le Résumé Complet</Button>
                      <Button variant="outline" className="flex-1 h-12 rounded-full font-black uppercase italic" onClick={() => setOcrResults([])}>Nouveau Scan</Button>
                    </div>
                  </div>
                )}
            </DialogContent>
        </Dialog>

        <Dialog open={isOCRSummaryOpen} onOpenChange={setIsOCRSummaryOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-4 border-primary rounded-[40px]">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black uppercase italic text-black border-b-8 border-primary pb-2 flex justify-between items-center">
                Résumé de l'Analyse Médicale
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white"><FileText className="w-6 h-6" /></div>
              </DialogTitle>
            </DialogHeader>
            <div className="py-8 space-y-10">
              <div className="grid gap-6">
                {ocrResults.map((res, i) => (
                  <div key={i} className="p-8 bg-secondary/5 rounded-[40px] border-2 border-dashed border-primary/20 hover:border-primary/50 transition-all">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                      <div>
                        <h3 className="text-2xl font-black text-black uppercase italic tracking-tighter">{res.name}</h3>
                        <p className="text-sm font-bold text-black opacity-60">Dosage: {res.dosage} • État: {res.found ? "DISPONIBLE" : "À RECHERCHER"}</p>
                      </div>
                      <Badge className={`${res.found ? "bg-green-600" : "bg-red-600"} text-white font-black uppercase py-2 px-6 rounded-full text-xs`}>
                        {res.found ? "En Stock Réel" : "Rupture de Stock"}
                      </Badge>
                    </div>

                    {res.pharmacies && res.pharmacies.length > 0 && (
                      <div className="mt-6 space-y-4">
                        <h4 className="text-xs font-black uppercase text-primary italic tracking-widest flex items-center gap-2">
                          <MapPin className="w-4 h-4" /> Pharmacies de garde avec stock :
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          {res.pharmacies.map((p, idx) => (
                            <div key={idx} className="p-4 bg-white rounded-3xl shadow-sm border border-primary/10 flex justify-between items-center group hover:bg-primary transition-colors cursor-pointer">
                              <div>
                                <p className="font-black text-sm uppercase italic group-hover:text-white transition-colors">{p.name}</p>
                                <p className="text-[10px] font-bold opacity-60 group-hover:text-white/80 transition-colors">{p.address}</p>
                                <p className="text-[10px] font-black text-primary mt-1 group-hover:text-white transition-colors">{p.distance}</p>
                              </div>
                              <Button size="icon" className="rounded-full bg-primary group-hover:bg-white group-hover:text-primary shadow-lg"><Truck className="w-4 h-4" /></Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {!res.found && (
                      <div className="mt-4 p-4 bg-red-500/5 rounded-2xl border border-red-500/20">
                        <p className="text-xs font-bold text-red-600 uppercase italic">Recherche étendue activée : Nous cherchons dans les wilayas limitrophes...</p>
                      </div>
                    )}

                    {!res.found && res.generics && res.generics.length > 0 && (
                      <div className="mt-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-black uppercase text-black italic tracking-widest flex items-center gap-2">
                            <Pill className="w-5 h-5 text-primary" /> Alternatives Génériques (DCI: {res.genericName})
                          </h4>
                          <Badge variant="outline" className="border-black text-black font-black uppercase text-[10px]">Selon Historique Patient</Badge>
                        </div>
                        <div className="grid gap-3">
                          {res.generics.map((gen, idx) => (
                            <div key={idx} className="p-4 bg-white rounded-2xl border-2 border-black/5 hover:border-primary/30 transition-all flex justify-between items-center group">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center font-black text-black italic">{idx + 1}</div>
                                <div>
                                  <p className="font-black text-black uppercase text-sm">{gen.name}</p>
                                  <p className="text-[10px] font-bold text-black/60 uppercase">{gen.pharmacyName} • {gen.price} DA</p>
                                </div>
                              </div>
                              <Button size="sm" className="rounded-xl bg-black text-white hover:bg-primary transition-colors font-black uppercase italic text-[10px]">Commander Générique</Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-black text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl" />
                <h4 className="text-xl font-black uppercase italic mb-4 flex items-center gap-2"><CheckCircle2 className="w-6 h-6 text-primary" /> Actions Recommandées</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <Button className="h-16 rounded-[20px] bg-primary text-white font-black uppercase italic shadow-lg hover:scale-105 transition-transform">Commander Tout</Button>
                  <Button variant="outline" className="h-16 rounded-[20px] border-primary text-primary font-black uppercase italic hover:bg-primary hover:text-white">Réserver Stock</Button>
                  <Button variant="secondary" className="h-16 rounded-[20px] bg-white text-black font-black uppercase italic shadow-lg">Imprimer Liste</Button>
                </div>
              </div>
            </div>
            <DialogFooter className="border-t pt-6">
              <Button className="w-full h-14 rounded-full font-black uppercase italic bg-black text-white" onClick={() => setIsOCRSummaryOpen(false)}>Fermer le Résumé</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isSubscriptionDialogOpen} onOpenChange={setIsSubscriptionDialogOpen}>
            <DialogContent className="max-w-2xl bg-gradient-to-br from-primary/95 to-accent/95 text-white border-none rounded-[40px] shadow-2xl">
                <DialogHeader><DialogTitle className="text-3xl font-black text-center text-white italic uppercase">Plan d'Abonnement Professionnel</DialogTitle><DialogDescription className="text-center text-white/80">Activez toutes les fonctionnalités avancées (OCR illimité, Rapports, Réseau Pro).</DialogDescription></DialogHeader>
                <div className="grid grid-cols-2 gap-6 p-6">
                    <Card className="bg-white/10 border-none p-6 text-white flex flex-col justify-between hover:scale-105 transition-transform cursor-pointer group">
                        <div><h4 className="text-xl font-black border-b pb-2 mb-4 uppercase italic">PREMIUM</h4><p className="text-xs mb-4 opacity-70">Particulier & Patient</p><p className="text-4xl font-black">500 <span className="text-sm font-normal">DA/mois</span></p></div>
                        <Button className="w-full bg-white text-primary mt-6 rounded-full font-black italic group-hover:bg-accent group-hover:text-white transition-colors">S'abonner</Button>
                    </Card>
                    <Card className="bg-white/20 border-white/50 border-2 p-6 text-white flex flex-col justify-between hover:scale-105 transition-transform cursor-pointer group">
                        <div><h4 className="text-xl font-black border-b pb-2 mb-4 uppercase italic">PROFESSIONAL</h4><p className="text-xs mb-4 opacity-70">Médecins & Pharmacies</p><p className="text-4xl font-black">2500 <span className="text-sm font-normal">DA/mois</span></p></div>
                        <Button className="w-full bg-accent text-white mt-6 rounded-full font-black italic">Sélectionner</Button>
                    </Card>
                </div>
                <div className="p-8 bg-black/30 rounded-[35px] mx-6 mb-8 border border-white/20">
                    <div className="flex items-center gap-2 mb-4"><Receipt className="w-5 h-5" /><p className="text-xs font-black uppercase tracking-[3px]">Paiement par CCP - Algérie</p></div>
                    <div className="flex justify-between items-center text-sm font-mono p-4 bg-white/10 rounded-2xl mb-6">
                        <span className="opacity-60">RIB CCP:</span><span className="font-black tracking-widest">00799999 0012345678 99</span>
                    </div>
                    <div className="space-y-4">
                      <Label className="text-xs uppercase font-black opacity-70">Déposez votre reçu de virement pour activation</Label>
                      <div className="flex flex-col items-center p-6 border-2 border-dashed border-white/30 rounded-2xl hover:border-white transition-colors cursor-pointer" onClick={() => document.getElementById('receipt-upload')?.click()}>
                        <input type="file" id="receipt-upload" className="hidden" onChange={(e) => setCcpReceipt(e.target.files?.[0] || null)} />
                        {ccpReceipt ? (
                          <div className="flex items-center gap-2 text-green-400 font-bold"><CheckCircle className="w-5 h-5" /> {ccpReceipt.name}</div>
                        ) : (
                          <><CloudUpload className="w-8 h-8 mb-2 opacity-50" /><p className="text-[10px] font-black uppercase">Sélectionner Fichier (JPG/PDF)</p></>
                        )}
                      </div>
                      <Button variant="secondary" className="w-full h-12 rounded-full font-black uppercase italic shadow-lg" onClick={() => {
                        if(!ccpReceipt) { toast.error("Veuillez sélectionner votre reçu."); return; }
                        toast.success("Reçu envoyé ! Votre compte sera activé après vérification sous 2h.");
                        setIsSubscriptionDialogOpen(false);
                      }}>Envoyer pour Approbation</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent className="max-w-2xl">
                <DialogHeader><DialogTitle className="font-black italic uppercase">{editingMedicine ? "Modifier" : "Ajouter un"} Médicament</DialogTitle></DialogHeader>
                <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="space-y-1"><Label className="text-xs font-black uppercase">Nom Commercial (FR)</Label><Input value={newMedicine.name} onChange={e => setNewMedicine({...newMedicine, name: e.target.value})} className="font-bold" /></div>
                    <div className="space-y-1 text-right"><Label className="text-xs font-black uppercase">الاسم التجاري (عربي)</Label><Input dir="rtl" value={newMedicine.nameAr} onChange={e => setNewMedicine({...newMedicine, nameAr: e.target.value})} className="font-bold" /></div>
                    <div className="space-y-1"><Label className="text-xs font-black uppercase">DCI (Générique)</Label><Input value={newMedicine.genericName} onChange={e => setNewMedicine({...newMedicine, genericName: e.target.value})} /></div>
                    <div className="space-y-1">
                        <Label className="text-xs font-black uppercase">Catégorie</Label>
                        <Select value={newMedicine.category} onValueChange={v => setNewMedicine({...newMedicine, category: v})}><SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1"><Label className="text-xs font-black uppercase">Prix Vente (DA)</Label><Input type="number" value={newMedicine.price} onChange={e => setNewMedicine({...newMedicine, price: e.target.value})} className="font-mono font-bold" /></div>
                    <div className="space-y-1"><Label className="text-xs font-black uppercase">Quantité Actuelle</Label><Input type="number" value={newMedicine.quantity} onChange={e => setNewMedicine({...newMedicine, quantity: e.target.value})} /></div>
                    <div className="space-y-1"><Label className="text-xs font-black uppercase">Date d'Expiration</Label><Input type="date" value={newMedicine.expiryDate} onChange={e => setNewMedicine({...newMedicine, expiryDate: e.target.value})} /></div>
                    <div className="space-y-1"><Label className="text-xs font-black uppercase">Code Barre / Lot</Label><Input value={newMedicine.barcode} onChange={e => setNewMedicine({...newMedicine, barcode: e.target.value})} className="font-mono" /></div>
                    <div className="col-span-2 flex items-center gap-2 mt-2 p-3 bg-green-500/5 rounded-xl border border-green-500/20">
                      <input type="checkbox" checked={newMedicine.isDonation} onChange={e => setNewMedicine({...newMedicine, isDonation: e.target.checked})} className="w-5 h-5 accent-green-600" />
                      <Label className="font-black uppercase italic text-xs text-green-700 tracking-tighter">Marquer comme Don Gratuit pour les nécessiteux</Label>
                    </div>
                </div>
                <div className="mt-8 flex justify-end gap-2 border-t pt-6">
                    <Button variant="outline" className="rounded-full h-12 font-black uppercase italic" onClick={() => setIsAddDialogOpen(false)}>Annuler</Button>
                    <Button className="rounded-full h-12 px-8 font-black uppercase italic bg-primary shadow-xl" onClick={async () => {
                        const med: Medicine = {
                            id: editingMedicine?.id || `med-${Date.now()}`,
                            name: newMedicine.name, nameAr: newMedicine.nameAr, genericName: newMedicine.genericName,
                            category: newMedicine.category, manufacturer: newMedicine.manufacturer || "Exploitation Pharma",
                            price: parseFloat(newMedicine.price), quantity: parseInt(newMedicine.quantity),
                            unit: newMedicine.unit, expiryDate: newMedicine.expiryDate, batchNumber: newMedicine.batchNumber || "LOT-001",
                            barcode: newMedicine.barcode || "000000", description: newMedicine.description,
                            requiresPrescription: newMedicine.requiresPrescription,
                            pharmacyId: userPharmacy?.id || "pharm-1",
                            isDonation: newMedicine.isDonation
                        };
                        if (editingMedicine) await updateMedicine(editingMedicine.id, med); else await addMedicine(med);
                        setIsAddDialogOpen(false); setEditingMedicine(null);
                        setNewMedicine({ name: "", nameAr: "", genericName: "", category: "", manufacturer: "", price: "", quantity: "", unit: "tablets", expiryDate: "", batchNumber: "", barcode: "", description: "", requiresPrescription: false, isDonation: false });
                    }}>Valider le Stock</Button>
                </div>
            </DialogContent>
        </Dialog>

          <Dialog open={isAppointmentDialogOpen} onOpenChange={setIsAppointmentDialogOpen}>
              <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-black italic uppercase">
                      {user.role === 'patient' ? `RDV avec Dr. ${selectedDoctorForRDV?.fullName}` : "Planifier un Rendez-vous Patient"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                      {user.role === 'doctor' && (
                        <div className="space-y-1"><Label className="text-xs uppercase font-black opacity-50">Patient concerné</Label>
                            <Select onValueChange={v => setNewAppointment({...newAppointment, patientId: v})}>
                                <SelectTrigger className="h-12 font-bold"><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                                <SelectContent>{allUsers.filter(u => u.role === 'patient').map(u => <SelectItem key={u.id} value={u.id} className="font-bold">{u.fullName}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1"><Label className="text-xs uppercase font-black opacity-50">Date</Label><Input type="date" value={newAppointment.date} onChange={e => setNewAppointment({...newAppointment, date: e.target.value})} className="h-12 font-black" /></div>
                          <div className="space-y-1"><Label className="text-xs uppercase font-black opacity-50">Heure</Label><Input type="time" value={newAppointment.time} onChange={e => setNewAppointment({...newAppointment, time: e.target.value})} className="h-12 font-black" /></div>
                      </div>
                      <div className="space-y-1"><Label className="text-xs uppercase font-black opacity-50">Notes / Motif d'Urgence</Label><Textarea value={newAppointment.notes} onChange={e => setNewAppointment({...newAppointment, notes: e.target.value})} rows={3} placeholder="Symptômes, rappels, etc." className="font-medium" /></div>
                      <Button className="w-full h-14 rounded-full mt-6 bg-primary font-black uppercase italic shadow-2xl hover:scale-105 active:scale-95 transition-all" onClick={async () => {
                        const targetDoctorId = user.role === 'patient' ? selectedDoctorForRDV?.id : user.id;
                        if (!targetDoctorId || !newAppointment.patientId || !newAppointment.date || !newAppointment.time) {
                          toast.error("Veuillez remplir tous les champs");
                          return;
                        }
                        await addAppointment({ 
                          ...newAppointment, 
                          doctorId: targetDoctorId, 
                          status: 'pending' 
                        });
                        toast.success(user.role === 'patient' ? "Demande de RDV envoyée !" : "Rendez-vous organisé");
                        setIsAppointmentDialogOpen(false);
                      }}>
                        {user.role === 'patient' ? "Envoyer la Demande" : "Enregistrer le RDV"}
                      </Button>
                  </div>
              </DialogContent>
          </Dialog>

        <Dialog open={isInventoryDialogOpen} onOpenChange={setIsInventoryDialogOpen}>
            <DialogContent className="max-w-2xl">
                <DialogHeader><DialogTitle className="text-2xl font-black uppercase italic text-primary">Gestion du Stock Sortie Usine</DialogTitle></DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-6 border-y border-dashed my-4">
                    <div className="col-span-2 space-y-2"><Label className="text-xs font-black uppercase opacity-60">Désignation Industrielle</Label><Input className="h-12 text-lg font-black italic" value={newInventory.medicineName} onChange={e => setNewInventory({...newInventory, medicineName: e.target.value})} /></div>
                    <div className="space-y-2"><Label className="text-xs font-black uppercase opacity-60">Volume (Cartons/Packs)</Label><Input type="number" className="h-12 font-bold" value={newInventory.quantity} onChange={e => setNewInventory({...newInventory, quantity: parseInt(e.target.value)})} /></div>
                    <div className="space-y-2"><Label className="text-xs font-black uppercase opacity-60">Prix de Gros HT (DA)</Label><Input type="number" className="h-12 font-mono font-bold" value={newInventory.price} onChange={e => setNewInventory({...newInventory, price: parseFloat(e.target.value)})} /></div>
                    <div className="space-y-2"><Label className="text-xs font-black uppercase opacity-60">Référence Batch / Lot</Label><Input className="h-12 font-mono uppercase" value={newInventory.batchNumber} onChange={e => setNewInventory({...newInventory, batchNumber: e.target.value})} /></div>
                    <div className="space-y-2"><Label className="text-xs font-black uppercase opacity-60">Date Péremption</Label><Input type="date" className="h-12 font-bold" value={newInventory.expiryDate} onChange={e => setNewInventory({...newInventory, expiryDate: e.target.value})} /></div>
                </div>
                <Button className="w-full h-14 rounded-full bg-gradient-to-r from-primary to-accent font-black uppercase italic text-lg shadow-2xl" onClick={async () => {
                    await addFactoryInventory({ ...newInventory, factoryId: user.id });
                    toast.success("Inventaire industriel mis à jour !");
                    setIsInventoryDialogOpen(false);
                    setNewInventory({ medicineName: "", quantity: 0, price: 0, batchNumber: "", expiryDate: "" });
                }}>Finaliser l'Alimentation du Stock</Button>
            </DialogContent>
        </Dialog>

        <Dialog open={isFactoryOrderDialogOpen} onOpenChange={setIsFactoryOrderDialogOpen}>
            <DialogContent className="max-w-3xl">
                <DialogHeader><DialogTitle className="text-2xl font-black italic uppercase text-primary">Bon de Commande Industrielle</DialogTitle></DialogHeader>
                <div className="space-y-6 pt-4">
                    <div className="space-y-2">
                        <Label className="uppercase font-black text-[10px] tracking-widest">Usine Fournisseur</Label>
                        <div className="p-4 bg-primary/5 rounded-3xl border-2 border-primary/20 flex justify-between items-center">
                            <div className="flex items-center gap-3"><Factory className="w-8 h-8 text-primary" /><div><p className="text-lg font-black uppercase italic">{allUsers.find(u => u.id === newFactoryOrder.factoryId)?.fullName || "Usine Partenaire"}</p><p className="text-xs font-bold opacity-60">Wilaya de {allUsers.find(u => u.id === newFactoryOrder.factoryId)?.wilaya}</p></div></div>
                            <Button variant="ghost" className="text-[10px] uppercase font-black italic underline" onClick={() => setIsFactoryOrderDialogOpen(false)}>Changer</Button>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center"><Label className="font-black uppercase italic border-l-4 border-primary pl-2">Articles à Commander</Label><Button size="sm" variant="outline" className="rounded-full" onClick={() => setNewFactoryOrder({...newFactoryOrder, items: [...newFactoryOrder.items, { medicineName: "", quantity: 1, price: 0 }]})}><Plus className="w-3 h-3 mr-1" /> Ligne d'achat</Button></div>
                        {newFactoryOrder.items.map((item, idx) => (
                            <div key={idx} className="grid grid-cols-4 gap-4 items-end p-5 bg-secondary/10 rounded-3xl border border-white/40 shadow-inner group">
                                <div className="col-span-2 space-y-1"><Label className="text-[10px] font-black uppercase opacity-50">Désignation du Médicament</Label><Input className="font-black italic border-none bg-white shadow-sm h-11" value={item.medicineName} onChange={e => { const list = [...newFactoryOrder.items]; list[idx].medicineName = e.target.value; setNewFactoryOrder({...newFactoryOrder, items: list}); }} /></div>
                                <div className="space-y-1"><Label className="text-[10px] font-black uppercase opacity-50">Volume</Label><Input type="number" className="font-black border-none bg-white shadow-sm h-11" value={item.quantity} onChange={e => { const list = [...newFactoryOrder.items]; list[idx].quantity = parseInt(e.target.value); setNewFactoryOrder({...newFactoryOrder, items: list}); }} /></div>
                                <div className="flex justify-center mb-1">
                                  {idx > 0 && <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 rounded-full" onClick={() => { const list = [...newFactoryOrder.items]; list.splice(idx,1); setNewFactoryOrder({...newFactoryOrder, items: list}); }}><Trash2 className="w-5 h-5" /></Button>}
                                </div>
                            </div>
                        ))}
                    </div>
                    <DialogFooter className="mt-8 pt-6 border-t gap-2">
                        <Button variant="outline" className="h-14 px-8 rounded-full font-black uppercase italic" onClick={() => setIsFactoryOrderDialogOpen(false)}>Annuler</Button>
                        <Button className="h-14 px-8 rounded-full bg-primary font-black uppercase italic shadow-2xl hover:scale-105 transition-all" onClick={async () => {
                            await addFactoryOrder({ ...newFactoryOrder, pharmacyId: userPharmacy.id, status: 'pending', totalAmount: 0 });
                            toast.success("Commande transmise au télévendeur de l'usine.");
                            setIsFactoryOrderDialogOpen(false);
                            setNewFactoryOrder({ factoryId: "", items: [{ medicineName: "", quantity: 1, price: 0 }] });
                          }}>Transmettre l'Offre Ferme</Button>
                      </DialogFooter>
                  </div>
              </DialogContent>
          </Dialog>

          <Dialog open={isJobOfferDialogOpen} onOpenChange={setIsJobOfferDialogOpen}>
              <DialogContent className="max-w-2xl">
                  <DialogHeader><DialogTitle className="text-2xl font-black uppercase italic text-primary">{editingJob ? "Éditer l'Offre d'Emploi" : "Publier une Offre (Emploi / Stage)"}</DialogTitle></DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-6 border-y my-4 border-dashed">
                      <div className="col-span-2 space-y-1"><Label className="text-[10px] font-black uppercase opacity-50">Titre du Poste / Mission</Label><Input value={newJobOffer.title} onChange={e => setNewJobOffer({...newJobOffer, title: e.target.value})} className="h-12 font-black italic text-lg" /></div>
                      <div className="space-y-1"><Label className="text-[10px] font-black uppercase opacity-50">Localisation (Wilaya)</Label><Input value={newJobOffer.location} onChange={e => setNewJobOffer({...newJobOffer, location: e.target.value})} className="h-12 font-bold" /></div>
                      <div className="space-y-1"><Label className="text-[10px] font-black uppercase opacity-50">Rémunération Proposée (DA)</Label><Input value={newJobOffer.salary} onChange={e => setNewJobOffer({...newJobOffer, salary: e.target.value})} className="h-12 font-mono font-black" /></div>
                      <div className="col-span-2 space-y-1"><Label className="text-[10px] font-black uppercase opacity-50">Détails de l'offre & Profil recherché</Label><Textarea value={newJobOffer.description} onChange={e => setNewJobOffer({...newJobOffer, description: e.target.value})} rows={5} className="font-medium" placeholder="Missions, diplômes requis, avantages..." /></div>
                  </div>
                  <DialogFooter className="gap-2"><Button variant="outline" onClick={() => setIsJobOfferDialogOpen(false)} className="rounded-full h-12 font-black uppercase italic">Abandonner</Button><Button className="rounded-full h-12 px-8 font-black uppercase italic bg-primary shadow-xl" onClick={handleCreateJobOffer}>{editingJob ? "Enregistrer Modifications" : "Lancer le Recrutement"}</Button></DialogFooter>
              </DialogContent>
          </Dialog>

          <Dialog open={isCourseDialogOpen} onOpenChange={setIsCourseDialogOpen}>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle className="text-2xl font-black uppercase italic text-primary">{editingCourse ? "Éditer le Cours" : "Création de Cours Professionnel"}</DialogTitle></DialogHeader>
                  <div className="space-y-6 py-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 space-y-1"><Label className="text-[10px] font-black uppercase">Titre du Programme</Label><Input className="h-12 font-black italic text-lg" value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} /></div>
                      <div className="space-y-1"><Label className="text-[10px] font-black uppercase">Prix (0 pour gratuit)</Label><Input type="number" className="h-12 font-mono font-bold" value={newCourse.price} onChange={e => setNewCourse({...newCourse, price: parseFloat(e.target.value)})} /></div>
                      <div className="space-y-1"><Label className="text-[10px] font-black uppercase">Durée Totale (Heures/Semaines)</Label><Input className="h-12 font-bold" value={newCourse.duration} onChange={e => setNewCourse({...newCourse, duration: e.target.value})} /></div>
                    <div className="col-span-2 space-y-1"><Label className="text-[10px] font-black uppercase">Description du Curriculum</Label><Textarea rows={4} className="font-medium" value={newCourse.description} onChange={e => setNewCourse({...newCourse, description: e.target.value})} /></div>
                    <div className="col-span-2 space-y-2">
                      <Label className="text-[10px] font-black uppercase">Supports de cours (PDF, MP4, etc.)</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {newCourse.materialsUrls?.map((url, i) => (
                          <Badge key={i} variant="secondary" className="flex items-center gap-1 py-1 pr-1">
                            <FileText className="w-3 h-3" />
                            <span className="max-w-[100px] truncate text-[10px]">{url.split('/').pop()}</span>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-4 w-4 rounded-full hover:bg-destructive hover:text-white"
                              onClick={() => setNewCourse({...newCourse, materialsUrls: newCourse.materialsUrls?.filter((_, idx) => idx !== i)})}
                            >
                              <X className="w-2 h-2" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                      <div 
                        className={`p-6 bg-secondary/10 rounded-[30px] border-2 border-dashed ${uploadingFiles ? 'border-primary animate-pulse' : 'border-primary/20'} flex flex-col items-center cursor-pointer hover:border-primary/50 transition-colors`}
                        onClick={() => !uploadingFiles && document.getElementById('course-files')?.click()}
                      >
                        <input 
                          type="file" 
                          id="course-files" 
                          className="hidden" 
                          multiple 
                          accept=".pdf,.mp4,.doc,.docx,.zip" 
                          onChange={handleFileUpload}
                        />
                        {uploadingFiles ? (
                          <p className="text-xs font-black uppercase italic animate-pulse">Téléversement en cours...</p>
                        ) : (
                          <>
                            <CloudUpload className="w-10 h-10 mb-2 opacity-30" />
                            <p className="text-xs font-black uppercase italic opacity-50">Téléverser Supports (PDF/MP4) (Plusieurs)</p>
                            <Button variant="outline" className="mt-4 rounded-full text-[10px] font-black uppercase italic">Sélectionner Fichiers</Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  </div>
                  <DialogFooter className="gap-2 border-t pt-6"><Button variant="outline" onClick={() => setIsCourseDialogOpen(false)} className="rounded-full font-black uppercase">Annuler</Button><Button className="rounded-full bg-primary font-black uppercase italic shadow-xl px-10 h-12" onClick={handleCreateCourse}>{editingCourse ? "Actualiser" : "Publier le Cours"}</Button></DialogFooter>
              </DialogContent>
          </Dialog>

          <Dialog open={isNewPatientDialogOpen} onOpenChange={setIsNewPatientDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle className="text-2xl font-black uppercase italic text-primary">Enregistrer un Nouveau Patient</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-6">
                <div className="col-span-2 space-y-1"><Label className="text-[10px] font-black uppercase">Nom Complet</Label><Input className="h-12 font-black" value={newPatient.fullName} onChange={e => setNewPatient({...newPatient, fullName: e.target.value})} /></div>
                <div className="space-y-1"><Label className="text-[10px] font-black uppercase">Email</Label><Input className="h-12 font-mono" value={newPatient.email} onChange={e => setNewPatient({...newPatient, email: e.target.value})} /></div>
                <div className="space-y-1"><Label className="text-[10px] font-black uppercase">Téléphone</Label><Input className="h-12 font-bold" value={newPatient.phone} onChange={e => setNewPatient({...newPatient, phone: e.target.value})} /></div>
                <div className="space-y-1"><Label className="text-[10px] font-black uppercase">Wilaya</Label><Input className="h-12" value={newPatient.wilaya} onChange={e => setNewPatient({...newPatient, wilaya: e.target.value})} /></div>
                <div className="space-y-1"><Label className="text-[10px] font-black uppercase">Ville</Label><Input className="h-12" value={newPatient.city} onChange={e => setNewPatient({...newPatient, city: e.target.value})} /></div>
                <div className="col-span-2 space-y-1"><Label className="text-[10px] font-black uppercase">Adresse Précise</Label><Input className="h-12 font-medium" value={newPatient.address} onChange={e => setNewPatient({...newPatient, address: e.target.value})} /></div>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setIsNewPatientDialogOpen(false)} className="rounded-full">Annuler</Button><Button className="rounded-full bg-primary font-black uppercase italic shadow-xl px-10 h-12" onClick={handleCreatePatient}>Créer Fiche Patient</Button></DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isProductionLineDialogOpen} onOpenChange={setIsProductionLineDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle className="text-2xl font-black uppercase italic text-primary">{editingProductionLine ? "Éditer la Ligne" : "Déclarer une Nouvelle Ligne de Production"}</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-6">
                <div className="col-span-2 space-y-1"><Label className="text-[10px] font-black uppercase">Désignation de la Ligne</Label><Input className="h-12 font-black italic" value={editingProductionLine?.name || ""} onChange={e => setEditingProductionLine(prev => prev ? {...prev, name: e.target.value} : null)} /></div>
                <div className="space-y-1"><Label className="text-[10px] font-black uppercase">Médicament Produit</Label><Input className="h-12 font-bold" value={editingProductionLine?.medicineName || ""} onChange={e => setEditingProductionLine(prev => prev ? {...prev, medicineName: e.target.value} : null)} /></div>
                <div className="space-y-1"><Label className="text-[10px] font-black uppercase">Output Quotidien</Label><Input type="number" className="h-12 font-mono font-black" value={editingProductionLine?.dailyOutput || 0} onChange={e => setEditingProductionLine(prev => prev ? {...prev, dailyOutput: parseInt(e.target.value)} : null)} /></div>
                <div className="space-y-1"><Label className="text-[10px] font-black uppercase">Status Actuel</Label>
                  <Select value={editingProductionLine?.status || "active"} onValueChange={v => setEditingProductionLine(prev => prev ? {...prev, status: v as any} : null)}>
                    <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="active">ACTIVE</SelectItem><SelectItem value="maintenance">MAINTENANCE</SelectItem><SelectItem value="stopped">ARRÊTÉE</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setIsProductionLineDialogOpen(false)} className="rounded-full">Annuler</Button><Button className="rounded-full bg-primary font-black uppercase italic shadow-xl px-10 h-12" onClick={async () => {
                if (editingProductionLine) {
                  await updateProductionLine(editingProductionLine.id, editingProductionLine);
                  toast.success("Ligne mise à jour !");
                } else {
                  // handle add
                  toast.success("Ligne ajoutée !");
                }
                setIsProductionLineDialogOpen(false);
              }}>Enregistrer</Button></DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isZoomDialogOpen} onOpenChange={setIsZoomDialogOpen}>
              <DialogContent className="max-w-2xl rounded-[40px]">
                  <DialogHeader><DialogTitle className="text-3xl font-black uppercase italic text-sky-600 flex items-center gap-2"><Video className="w-8 h-8" /> Session Direct Zoom</DialogTitle></DialogHeader>
                  <div className="py-8 space-y-6">
                      <div className="p-8 bg-sky-50 rounded-[40px] border-2 border-sky-100 flex flex-col gap-6 shadow-inner">
                          <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase opacity-60">Sélectionner le Cours</Label>
                              <Select value={selectedZoomCourseId} onValueChange={setSelectedZoomCourseId}>
                                  <SelectTrigger className="h-14 rounded-2xl bg-white border-sky-200 font-bold"><SelectValue placeholder="Choisir un cours..." /></SelectTrigger>
                                  <SelectContent>
                                      {courses.filter(c => c.trainerId === user.id).map(c => (
                                          <SelectItem key={c.id} value={c.id} className="font-bold italic">{c.title}</SelectItem>
                                      ))}
                                  </SelectContent>
                              </Select>
                          </div>
                          
                          <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase opacity-60">Lien de la réunion Zoom</Label>
                              <Input 
                                placeholder="https://zoom.us/j/..." 
                                className="h-14 rounded-2xl bg-white border-sky-200 font-mono text-sm" 
                                value={zoomUrl}
                                onChange={e => setZoomUrl(e.target.value)}
                              />
                          </div>

                          <div className="flex gap-4 w-full pt-4">
                              <Button 
                                className="flex-1 h-16 bg-sky-600 hover:bg-sky-700 text-white rounded-3xl font-black uppercase italic shadow-xl shadow-sky-200"
                                onClick={async () => {
                                    if (!selectedZoomCourseId || !zoomUrl) {
                                        toast.error("Veuillez sélectionner un cours et entrer un lien.");
                                        return;
                                    }
                                    await updateCourse(selectedZoomCourseId, { zoomUrl: zoomUrl });
                                    toast.success("Session Zoom planifiée et notifiée aux étudiants !");
                                    setIsZoomDialogOpen(false);
                                    setZoomUrl("");
                                    setSelectedZoomCourseId("");
                                }}
                              >
                                Planifier Session
                              </Button>
                              <Button variant="outline" className="flex-1 h-16 border-sky-600 text-sky-600 hover:bg-sky-50 rounded-3xl font-black uppercase italic">Enregistrer Cloud</Button>
                          </div>
                          <p className="text-center text-[10px] font-bold text-sky-900/50 uppercase italic tracking-widest">Le lien sera visible instantanément pour tous les étudiants inscrits.</p>
                      </div>
                  </div>
              </DialogContent>
          </Dialog>

          <Dialog open={isDonationDialogOpen} onOpenChange={setIsDonationDialogOpen}>
              <DialogContent>
                  <DialogHeader><DialogTitle className="font-black italic uppercase text-green-700">Faire un Don de Médicament</DialogTitle><DialogDescription className="font-bold">Aidez les nécessiteux en partageant vos médicaments non utilisés (valides).</DialogDescription></DialogHeader>
                  <div className="space-y-4 py-4">
                      <div className="space-y-1"><Label className="text-[10px] font-black uppercase">Désignation Médicale</Label><Input value={newDonation.name} onChange={e => setNewDonation({...newDonation, name: e.target.value})} className="h-12 font-black italic" /></div>
                      <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1"><Label className="text-[10px] font-black uppercase">Quantité (Boîtes)</Label><Input type="number" value={newDonation.quantity} onChange={e => setNewDonation({...newDonation, quantity: parseInt(e.target.value)})} className="h-12" /></div>
                          <div className="space-y-1"><Label className="text-[10px] font-black uppercase">Péremption</Label><Input type="date" value={newDonation.expiryDate} onChange={e => setNewDonation({...newDonation, expiryDate: e.target.value})} className="h-12" /></div>
                      </div>
                      <div className="space-y-1"><Label className="text-[10px] font-black uppercase">Remarques (État de la boîte, scellée?)</Label><Textarea value={newDonation.description} onChange={e => setNewDonation({...newDonation, description: e.target.value})} rows={3} placeholder="Ex: Boite scellée, conservée au frais..." className="font-medium" /></div>
                      <Button className="w-full h-14 rounded-full mt-6 bg-green-600 hover:bg-green-700 text-white font-black uppercase italic shadow-2xl" onClick={handleDonateMedicine}>Diffuser le Don sur le Réseau</Button>
                  </div>
              </DialogContent>
          </Dialog>

          <Dialog open={isAddStudentDialogOpen} onOpenChange={setIsAddStudentDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle className="text-2xl font-black uppercase italic text-primary">Inscrire Manuellement un Étudiant</DialogTitle></DialogHeader>
              <div className="space-y-6 py-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase">Sélectionner l'Étudiant</Label>
                  <Select onValueChange={v => setNewStudentEnrollment({...newStudentEnrollment, userId: v})}>
                    <SelectTrigger className="h-12 font-bold"><SelectValue placeholder="Choisir un utilisateur..." /></SelectTrigger>
                    <SelectContent>
                      {allUsers.filter(u => u.role === 'patient').map(u => (
                        <SelectItem key={u.id} value={u.id} className="font-bold">{u.fullName} ({u.email})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase">Sélectionner le Cours</Label>
                  <Select onValueChange={v => setNewStudentEnrollment({...newStudentEnrollment, courseId: v})}>
                    <SelectTrigger className="h-12 font-bold"><SelectValue placeholder="Choisir un cours..." /></SelectTrigger>
                    <SelectContent>
                      {courses.filter(c => c.trainerId === user.id).map(c => (
                        <SelectItem key={c.id} value={c.id} className="font-bold italic">{c.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20">
                  <p className="text-xs font-bold text-primary italic uppercase text-center">L'étudiant sera automatiquement approuvé et pourra commencer le cours immédiatement.</p>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setIsAddStudentDialogOpen(false)} className="rounded-full">Annuler</Button>
                <Button 
                  className="rounded-full bg-primary font-black uppercase italic shadow-xl px-10 h-12" 
                  onClick={async () => {
                    if (!newStudentEnrollment.userId || !newStudentEnrollment.courseId) {
                      toast.error("Veuillez remplir tous les champs.");
                      return;
                    }
                    await addEnrollment({
                      userId: newStudentEnrollment.userId,
                      courseId: newStudentEnrollment.courseId,
                      status: 'approved'
                    });
                    toast.success("Étudiant inscrit avec succès !");
                    setIsAddStudentDialogOpen(false);
                    setNewStudentEnrollment({ userId: "", courseId: "" });
                  }}
                >
                  Confirmer l'Inscription
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isUserEditDialogOpen} onOpenChange={setIsUserEditDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle className="text-2xl font-black uppercase italic text-primary">Modifier l'Utilisateur</DialogTitle></DialogHeader>
              {selectedUserForEdit && (
                <div className="space-y-6 py-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-1">
                      <Label className="text-[10px] font-black uppercase opacity-50">Nom Complet</Label>
                      <Input value={selectedUserForEdit.fullName} onChange={e => setSelectedUserForEdit({...selectedUserForEdit, fullName: e.target.value})} className="h-12 font-black" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black uppercase opacity-50">Email (Non modifiable)</Label>
                      <Input value={selectedUserForEdit.email} readOnly className="h-12 font-mono bg-secondary/10" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black uppercase opacity-50">Téléphone</Label>
                      <Input value={selectedUserForEdit.phone} onChange={e => setSelectedUserForEdit({...selectedUserForEdit, phone: e.target.value})} className="h-12 font-bold" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black uppercase opacity-50">Rôle</Label>
                      <Select value={selectedUserForEdit.role} onValueChange={v => setSelectedUserForEdit({...selectedUserForEdit, role: v as UserRole})}>
                        <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="patient">PATIENT</SelectItem>
                          <SelectItem value="doctor">DOCTEUR</SelectItem>
                          <SelectItem value="pharmacy">PHARMACIE</SelectItem>
                          <SelectItem value="factory">USINE</SelectItem>
                          <SelectItem value="trainer">FORMATEUR</SelectItem>
                          <SelectItem value="admin">ADMIN</SelectItem>
                          <SelectItem value="cnas">CNAS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black uppercase opacity-50">Plan</Label>
                      <Select value={selectedUserForEdit.plan} onValueChange={v => setSelectedUserForEdit({...selectedUserForEdit, plan: v as SubscriptionPlan})}>
                        <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">FREE</SelectItem>
                          <SelectItem value="premium">PREMIUM</SelectItem>
                          <SelectItem value="professional">PROFESSIONAL</SelectItem>
                          <SelectItem value="enterprise">ENTERPRISE</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black uppercase opacity-50">Wilaya</Label>
                      <Input value={selectedUserForEdit.wilaya} onChange={e => setSelectedUserForEdit({...selectedUserForEdit, wilaya: e.target.value})} className="h-12" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black uppercase opacity-50">Ville</Label>
                      <Input value={selectedUserForEdit.city} onChange={e => setSelectedUserForEdit({...selectedUserForEdit, city: e.target.value})} className="h-12" />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-[10px] font-black uppercase opacity-50">Adresse</Label>
                      <Input value={selectedUserForEdit.address} onChange={e => setSelectedUserForEdit({...selectedUserForEdit, address: e.target.value})} className="h-12" />
                    </div>
                    <div className="flex items-center gap-4 col-span-2 p-4 bg-primary/5 rounded-2xl border border-primary/20">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="edit-verified" checked={selectedUserForEdit.verified} onChange={e => setSelectedUserForEdit({...selectedUserForEdit, verified: e.target.checked})} className="w-5 h-5 accent-primary" />
                        <Label htmlFor="edit-verified" className="text-[10px] font-black uppercase">Email Vérifié</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="edit-approved" checked={selectedUserForEdit.isApproved} onChange={e => setSelectedUserForEdit({...selectedUserForEdit, isApproved: e.target.checked})} className="w-5 h-5 accent-primary" />
                        <Label htmlFor="edit-approved" className="text-[10px] font-black uppercase">Compte Approuvé</Label>
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => setIsUserEditDialogOpen(false)} className="rounded-full">Annuler</Button>
                    <Button className="rounded-full bg-primary font-black uppercase italic shadow-xl px-10 h-12" onClick={async () => {
                      if (selectedUserForEdit) {
                        await updateUser(selectedUserForEdit.id, selectedUserForEdit);
                        toast.success("Utilisateur mis à jour !");
                        setIsUserEditDialogOpen(false);
                      }
                    }}>Enregistrer les Modifications</Button>
                  </DialogFooter>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={isEntityRegistrationOpen} onOpenChange={setIsEntityRegistrationOpen}>
            <DialogContent className="max-w-2xl rounded-[40px] p-10">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black italic uppercase text-primary">
                  {user.role === 'pharmacy' ? "Enregistrer ma Pharmacie" : 
                   user.role === 'factory' ? "Enregistrer mon Usine" : 
                   "Enregistrer mon École/Centre"}
                </DialogTitle>
                <DialogDescription>
                  Complétez ces informations pour rendre votre entité visible sur la plateforme.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-6 pt-6">
                <div className="col-span-2 space-y-2">
                  <Label className="text-[10px] font-black uppercase opacity-50">Nom de l'entité (Français)</Label>
                  <Input 
                    placeholder="Ex: Pharmacie de l'Espoir" 
                    className="h-12 font-bold" 
                    value={newEntity.name}
                    onChange={e => setNewEntity({...newEntity, name: e.target.value})}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label className="text-[10px] font-black uppercase opacity-50">Nom de l'entité (Arabe)</Label>
                  <Input 
                    placeholder="Ex: صيدلية الأمل" 
                    className="h-12 font-bold text-right" 
                    value={newEntity.nameAr}
                    onChange={e => setNewEntity({...newEntity, nameAr: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase opacity-50">Wilaya</Label>
                  <Input 
                    placeholder="Ex: Alger" 
                    className="h-12" 
                    value={newEntity.wilaya}
                    onChange={e => setNewEntity({...newEntity, wilaya: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase opacity-50">Ville / Commune</Label>
                  <Input 
                    placeholder="Ex: Kouba" 
                    className="h-12" 
                    value={newEntity.city}
                    onChange={e => setNewEntity({...newEntity, city: e.target.value})}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label className="text-[10px] font-black uppercase opacity-50">Adresse exacte</Label>
                  <Input 
                    placeholder="Rue, N°, Cité..." 
                    className="h-12" 
                    value={newEntity.address}
                    onChange={e => setNewEntity({...newEntity, address: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase opacity-50">Téléphone</Label>
                  <Input 
                    placeholder="05XX XX XX XX" 
                    className="h-12" 
                    value={newEntity.phone}
                    onChange={e => setNewEntity({...newEntity, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase opacity-50">Email professionnel</Label>
                  <Input 
                    type="email" 
                    placeholder="contact@entite.dz" 
                    className="h-12" 
                    value={newEntity.email}
                    onChange={e => setNewEntity({...newEntity, email: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter className="pt-8">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEntityRegistrationOpen(false)} 
                  className="rounded-full"
                >
                  Annuler
                </Button>
                <Button 
                  className="rounded-full bg-primary font-black uppercase italic shadow-xl px-10 h-12"
                  onClick={handleRegisterEntity}
                  disabled={!newEntity.name || !newEntity.wilaya}
                >
                  Confirmer l'enregistrement
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isPatientOrderDialogOpen} onOpenChange={setIsPatientOrderDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle className="text-2xl font-black uppercase italic text-primary">Passer Commande en Direct</DialogTitle></DialogHeader>
              <div className="space-y-6 py-6">
                <div className="p-4 bg-secondary/10 rounded-[30px] flex justify-between items-center border border-white/40">
                  <div className="flex items-center gap-3"><MapPin className="w-6 h-6 text-primary" /><div><p className="text-xs font-black uppercase opacity-60">Lieu de Livraison</p><p className="font-bold">{newPatientOrder.deliveryAddress || (language === "ar" ? "الجزائر" : "Algérie")}</p></div></div>
                  <Button variant="ghost" className="text-[10px] font-black underline uppercase" onClick={() => toast.info("Editer adresse dans profil...")}>Changer</Button>
                </div>

                <div className="space-y-4">
                  <Label className="font-black uppercase italic border-l-4 border-primary pl-2">Articles Disponibles</Label>
                  <ScrollArea className="h-48 rounded-2xl border p-2">
                    <div className="grid grid-cols-1 gap-2">
                      {medicines.filter(m => m.pharmacyId === newPatientOrder.pharmacyId && m.quantity > 0).map(m => (
                        <div key={m.id} className="flex justify-between items-center p-3 bg-secondary/5 rounded-xl">
                          <div>
                            <p className="font-bold text-sm">{m.name}</p>
                            <p className="text-[10px] opacity-60">{m.price} DA</p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 text-[10px] font-black uppercase"
                            onClick={() => {
                              const existing = newPatientOrder.items.find(i => i.medicineId === m.id);
                              if (existing) {
                                setNewPatientOrder({
                                  ...newPatientOrder,
                                  items: newPatientOrder.items.map(i => i.medicineId === m.id ? { ...i, quantity: i.quantity + 1 } : i)
                                });
                              } else {
                                setNewPatientOrder({
                                  ...newPatientOrder,
                                  items: [...newPatientOrder.items.filter(i => i.medicineId !== ""), { medicineId: m.id, quantity: 1, price: m.price }]
                                });
                              }
                            }}
                          >
                            Ajouter
                          </Button>
                        </div>
                      ))}
                      {medicines.filter(m => m.pharmacyId === newPatientOrder.pharmacyId && m.quantity > 0).length === 0 && (
                        <p className="text-center py-10 text-xs opacity-40 italic">Aucun médicament disponible en ligne pour cette pharmacie</p>
                      )}
                    </div>
                  </ScrollArea>
                </div>

                <div className="space-y-3">
                  <Label className="font-black uppercase italic border-l-4 border-primary pl-2">Mon Panier</Label>
                  <div className="p-4 bg-white rounded-3xl shadow-inner border min-h-20 flex flex-col gap-2">
                    {newPatientOrder.items.filter(i => i.medicineId !== "").map((item, idx) => {
                      const med = medicines.find(m => m.id === item.medicineId);
                      return (
                        <div key={idx} className="flex justify-between items-center bg-secondary/5 p-2 rounded-lg">
                          <span className="text-xs font-bold">{med?.name} (x{item.quantity})</span>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-black">{item.price * item.quantity} DA</span>
                            <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500" onClick={() => setNewPatientOrder({...newPatientOrder, items: newPatientOrder.items.filter((_, i) => i !== idx)})}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                    {newPatientOrder.items.filter(i => i.medicineId !== "").length === 0 && (
                      <p className="text-xs font-bold opacity-40 uppercase text-center py-4">Votre panier est vide</p>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black uppercase opacity-50">Total Estimé</p>
                    <p className="text-2xl font-black text-accent">
                      {newPatientOrder.items.filter(i => i.medicineId !== "").reduce((acc, i) => acc + (i.price * i.quantity), 0)} DA
                    </p>
                  </div>
                  <Button 
                    className="h-14 px-10 rounded-full bg-primary font-black uppercase italic shadow-2xl" 
                    disabled={newPatientOrder.items.filter(i => i.medicineId !== "").length === 0}
                    onClick={async () => {
                      const orderId = `order-${Date.now()}`;
                      await addOrder({
                        id: orderId,
                        userId: user.id,
                        pharmacyId: newPatientOrder.pharmacyId,
                        items: newPatientOrder.items.filter(i => i.medicineId !== ""),
                        status: 'pending',
                        totalAmount: newPatientOrder.items.reduce((acc, i) => acc + (i.price * i.quantity), 0),
                        deliveryFee: 0,
                        deliveryAddress: newPatientOrder.deliveryAddress || "Algérie",
                        paymentMethod: 'cash_on_delivery',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                      });
                      toast.success("Commande transmise avec succès !");
                      setIsPatientOrderDialogOpen(false);
                      setNewPatientOrder({ pharmacyId: "", items: [{ medicineId: "", quantity: 1, price: 0 }], deliveryAddress: user.address || "" });
                    }}
                  >
                    Confirmer la Demande
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }
