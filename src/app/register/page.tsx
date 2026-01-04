"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Building2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Users,
  Stethoscope,
  GraduationCap,
  Factory,
  Shield,
  Upload,
  FileText,
  Calendar,
  CreditCard,
  Briefcase,
  Award,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/Navbar";
import { useAppStore, type UserRole } from "@/lib/store";
import { t } from "@/lib/i18n";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase";

const wilayas = [
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar",
  "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger",
  "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma",
  "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla", "Oran", "El Bayadh",
  "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued",
  "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent",
  "Ghardaïa", "Relizane",
];

const doctorSpecialties = [
  "Médecine Générale",
  "Cardiologie",
  "Dermatologie",
  "Gastro-entérologie",
  "Gynécologie-Obstétrique",
  "Neurologie",
  "Ophtalmologie",
  "ORL",
  "Pédiatrie",
  "Pneumologie",
  "Psychiatrie",
  "Radiologie",
  "Rhumatologie",
  "Urologie",
  "Chirurgie Générale",
  "Chirurgie Orthopédique",
  "Anesthésie-Réanimation",
  "Médecine Interne",
  "Endocrinologie",
  "Néphrologie",
];

const roleOptions: { value: UserRole; icon: React.ElementType; label: { ar: string; fr: string; en: string }; requiresVerification: boolean }[] = [
  { value: "patient", icon: Users, label: { ar: "مريض", fr: "Patient", en: "Patient" }, requiresVerification: false },
  { value: "doctor", icon: Stethoscope, label: { ar: "طبيب", fr: "Médecin", en: "Doctor" }, requiresVerification: true },
  { value: "pharmacy", icon: Building2, label: { ar: "صيدلية", fr: "Pharmacie", en: "Pharmacy" }, requiresVerification: true },
  { value: "school", icon: GraduationCap, label: { ar: "مدرسة", fr: "École", en: "School" }, requiresVerification: true },
  { value: "trainer", icon: GraduationCap, label: { ar: "مكون / مدرب", fr: "Formateur", en: "Trainer" }, requiresVerification: true },
  { value: "factory", icon: Factory, label: { ar: "مصنع", fr: "Laboratoire", en: "Laboratory" }, requiresVerification: true },
  { value: "creator", icon: Shield, label: { ar: "مسؤول", fr: "Administrateur", en: "Administrator" }, requiresVerification: true },
];

export default function RegisterPage() {
  const router = useRouter();
  const { language, setUser, fetchInitialData } = useAppStore();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    wilaya: "",
    city: "",
    address: "",
    role: "patient" as UserRole,
    birthDate: "",
    nationalIdNumber: "",
    cnasNumber: "",
    specialty: "",
    yearsExperience: "",
    orderNumber: "",
    orderWilaya: "",
    licenseNumber: "",
    agrementNumber: "",
    establishmentName: "",
    establishmentAddress: "",
    commercialRegisterNumber: "",
    taxId: "",
    cnasEmployerNumber: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    idCardFrontUrl: "",
    idCardBackUrl: "",
    diplomaUrl: "",
    licenseDocumentUrl: "",
    cnasAttestationUrl: "",
    commercialRegisterUrl: "",
    employerAttestationUrl: "",
  });

  const fileInputRefs = {
    idCardFront: useRef<HTMLInputElement>(null),
    idCardBack: useRef<HTMLInputElement>(null),
    diploma: useRef<HTMLInputElement>(null),
    license: useRef<HTMLInputElement>(null),
    cnasAttestation: useRef<HTMLInputElement>(null),
    commercialRegister: useRef<HTMLInputElement>(null),
    employerAttestation: useRef<HTMLInputElement>(null),
  };

  const totalSteps = formData.role === "patient" ? 2 : 4;
  const requiresVerification = roleOptions.find(r => r.value === formData.role)?.requiresVerification;

  const handleFileUpload = async (file: File, fieldName: string) => {
    setUploadingFile(fieldName);
    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `verification-documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, [fieldName]: publicUrl }));
      toast.success(language === "ar" ? "تم رفع الملف بنجاح" : language === "en" ? "File uploaded successfully" : "Fichier téléchargé avec succès");
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(language === "ar" ? "فشل رفع الملف" : language === "en" ? "Failed to upload file" : "Échec du téléchargement");
    }
    setUploadingFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      if (formData.password !== formData.confirmPassword) {
        toast.error(language === "ar" ? "كلمات المرور غير متطابقة" : language === "en" ? "Passwords don't match" : "Les mots de passe ne correspondent pas");
        return;
      }
      if (formData.password.length < 8) {
        toast.error(language === "ar" ? "كلمة المرور يجب أن تكون 8 أحرف على الأقل" : language === "en" ? "Password must be at least 8 characters" : "Le mot de passe doit comporter au moins 8 caractères");
        return;
      }
      setStep(2);
      return;
    }

    if (step < totalSteps) {
      setStep(step + 1);
      return;
    }

    if (requiresVerification) {
      if (!formData.idCardFrontUrl || !formData.idCardBackUrl) {
        toast.error(language === "ar" ? "يرجى تحميل صور بطاقة الهوية" : language === "en" ? "Please upload ID card images" : "Veuillez télécharger les images de la carte d'identité");
        return;
      }
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          phone: formData.phone,
          role: formData.role,
          wilaya: formData.wilaya,
          city: formData.city,
          address: formData.address,
          birthDate: formData.birthDate,
          nationalIdNumber: formData.nationalIdNumber,
          cnasNumber: formData.cnasNumber,
          specialty: formData.specialty,
          yearsExperience: formData.yearsExperience ? parseInt(formData.yearsExperience) : null,
          orderNumber: formData.orderNumber,
          orderWilaya: formData.orderWilaya,
          licenseNumber: formData.licenseNumber,
          agrementNumber: formData.agrementNumber,
          establishmentName: formData.establishmentName,
          establishmentAddress: formData.establishmentAddress,
          commercialRegisterNumber: formData.commercialRegisterNumber,
          taxId: formData.taxId,
          cnasEmployerNumber: formData.cnasEmployerNumber,
          emergencyContactName: formData.emergencyContactName,
          emergencyContactPhone: formData.emergencyContactPhone,
          idCardFrontUrl: formData.idCardFrontUrl,
          idCardBackUrl: formData.idCardBackUrl,
          diplomaUrl: formData.diplomaUrl,
          licenseDocumentUrl: formData.licenseDocumentUrl,
          cnasAttestationUrl: formData.cnasAttestationUrl,
          commercialRegisterUrl: formData.commercialRegisterUrl,
          employerAttestationUrl: formData.employerAttestationUrl,
          verificationStatus: requiresVerification ? "pending" : "approved",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Error creating account");
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (loginError) {
        toast.error(loginError.message);
        setLoading(false);
        return;
      }

      setUser({
        id: data.user.id,
        email: formData.email,
        fullName: formData.fullName,
        phone: formData.phone,
        role: formData.role,
        plan: "free",
        wilaya: formData.wilaya,
        city: formData.city,
        address: formData.address,
        verified: false,
        pharmacyId: formData.role === 'pharmacy' ? data.establishmentId : undefined,
        factoryId: formData.role === 'factory' ? data.establishmentId : undefined,
        createdAt: new Date().toISOString(),
        isApproved: !requiresVerification,
      });

      await fetchInitialData();

      if (requiresVerification) {
        toast.success(
          language === "ar"
            ? "تم إنشاء الحساب. في انتظار التحقق من قبل المسؤول."
            : language === "en"
            ? "Account created. Awaiting admin verification."
            : "Compte créé. En attente de vérification par l'administrateur."
        );
      } else {
        toast.success(
          language === "ar"
            ? "تم إنشاء الحساب بنجاح"
            : language === "en"
            ? "Account created successfully"
            : "Compte créé avec succès"
        );
      }

      router.push("/dashboard");
    } catch {
      toast.error(language === "ar" ? "حدث خطأ" : language === "en" ? "An error occurred" : "Une erreur s'est produite");
    }

    setLoading(false);
  };

  const FileUploadButton = ({ 
    label, 
    fieldName, 
    refKey,
    accept = "image/*,.pdf"
  }: { 
    label: string; 
    fieldName: keyof typeof formData; 
    refKey: keyof typeof fileInputRefs;
    accept?: string;
  }) => {
    const isUploaded = !!formData[fieldName];
    const isUploading = uploadingFile === fieldName;

    return (
      <div className="space-y-2">
        <Label className="text-xs font-medium">{label}</Label>
        <input
          type="file"
          ref={fileInputRefs[refKey]}
          className="hidden"
          accept={accept}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file, fieldName);
          }}
        />
        <Button
          type="button"
          variant={isUploaded ? "default" : "outline"}
          className={`w-full h-20 flex-col gap-2 border-dashed ${isUploaded ? "bg-emerald-500/10 border-emerald-500 text-emerald-600" : ""}`}
          onClick={() => fileInputRefs[refKey].current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isUploaded ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <Upload className="w-5 h-5" />
          )}
          <span className="text-[10px]">
            {isUploading 
              ? (language === "ar" ? "جاري الرفع..." : language === "en" ? "Uploading..." : "Téléchargement...")
              : isUploaded 
              ? (language === "ar" ? "تم الرفع ✓" : language === "en" ? "Uploaded ✓" : "Téléchargé ✓")
              : (language === "ar" ? "اضغط للرفع" : language === "en" ? "Click to upload" : "Cliquez pour télécharger")}
          </span>
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="min-h-screen flex items-center justify-center pt-20 pb-10 px-4 hero-pattern">
        <div className="absolute inset-0 mesh-gradient" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-2xl"
        >
          <div className="glass-card p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-foreground">د</span>
              </div>
              <h1 className="text-2xl font-bold mb-2">{t(language, "register")}</h1>
              <p className="text-muted-foreground text-sm">
                {language === "ar" ? `الخطوة ${step} من ${totalSteps}` : language === "en" ? `Step ${step} of ${totalSteps}` : `Étape ${step} sur ${totalSteps}`}
              </p>
              <div className="flex gap-2 justify-center mt-4">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div key={i} className={`w-12 h-1 rounded-full transition-colors ${step > i ? "bg-primary" : "bg-muted"}`} />
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="fullName">{t(language, "fullName")} *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        placeholder={language === "ar" ? "الاسم الكامل" : language === "en" ? "Full name" : "Nom complet"}
                        className="pl-10"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{t(language, "email")} *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@example.com"
                        className="pl-10"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">{t(language, "password")} *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">{t(language, "confirmPassword")} *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label>{t(language, "selectRole")} *</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {roleOptions.map((role) => (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, role: role.value })}
                          className={`p-3 rounded-lg border text-left flex items-center gap-2 transition-colors ${
                            formData.role === role.value
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <role.icon className="w-4 h-4" />
                          <div>
                            <span className="text-sm font-medium">{role.label[language]}</span>
                            {role.requiresVerification && (
                              <p className="text-[9px] text-amber-600">
                                {language === "ar" ? "يتطلب التحقق" : language === "en" ? "Requires verification" : "Vérification requise"}
                              </p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t(language, "phone")} *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="0XX XX XX XX"
                          className="pl-10"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="birthDate">
                        {language === "ar" ? "تاريخ الميلاد" : language === "en" ? "Date of Birth" : "Date de naissance"} *
                      </Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="birthDate"
                          type="date"
                          className="pl-10"
                          value={formData.birthDate}
                          onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="wilaya">{t(language, "wilaya")} *</Label>
                      <Select
                        value={formData.wilaya}
                        onValueChange={(value) => setFormData({ ...formData, wilaya: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={language === "ar" ? "اختر الولاية" : language === "en" ? "Select wilaya" : "Sélectionner"} />
                        </SelectTrigger>
                        <SelectContent>
                          {wilayas.map((wilaya) => (
                            <SelectItem key={wilaya} value={wilaya}>
                              {wilaya}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">{t(language, "city")} *</Label>
                      <Input
                        id="city"
                        placeholder={language === "ar" ? "المدينة" : language === "en" ? "City" : "Ville"}
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">{t(language, "address")} *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="address"
                        placeholder={language === "ar" ? "العنوان الكامل" : language === "en" ? "Full address" : "Adresse complète"}
                        className="pl-10"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && requiresVerification && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                    <div className="text-xs text-amber-700">
                      <p className="font-bold mb-1">
                        {language === "ar" ? "معلومات مهنية مطلوبة" : language === "en" ? "Professional Information Required" : "Informations professionnelles requises"}
                      </p>
                      <p>
                        {language === "ar" 
                          ? "هذه المعلومات ضرورية للتحقق من حسابك من قبل المسؤول"
                          : language === "en"
                          ? "This information is required for admin verification of your account"
                          : "Ces informations sont nécessaires pour la vérification de votre compte par l'administrateur"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nationalIdNumber">
                        {language === "ar" ? "رقم بطاقة الهوية" : language === "en" ? "National ID Number" : "N° Carte Nationale"} *
                      </Label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="nationalIdNumber"
                          placeholder="123456789"
                          className="pl-10"
                          value={formData.nationalIdNumber}
                          onChange={(e) => setFormData({ ...formData, nationalIdNumber: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cnasNumber">
                        {language === "ar" ? "رقم CNAS" : language === "en" ? "CNAS Number" : "N° CNAS"}
                      </Label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="cnasNumber"
                          placeholder="XXX XXX XXX XXX"
                          className="pl-10"
                          value={formData.cnasNumber}
                          onChange={(e) => setFormData({ ...formData, cnasNumber: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {(formData.role === "doctor" || formData.role === "pharmacy") && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        {formData.role === "doctor" && (
                          <div className="space-y-2">
                            <Label htmlFor="specialty">
                              {language === "ar" ? "التخصص" : language === "en" ? "Specialty" : "Spécialité"} *
                            </Label>
                            <Select
                              value={formData.specialty}
                              onValueChange={(value) => setFormData({ ...formData, specialty: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={language === "ar" ? "اختر التخصص" : language === "en" ? "Select specialty" : "Sélectionner"} />
                              </SelectTrigger>
                              <SelectContent>
                                {doctorSpecialties.map((spec) => (
                                  <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="yearsExperience">
                            {language === "ar" ? "سنوات الخبرة" : language === "en" ? "Years of Experience" : "Années d'expérience"}
                          </Label>
                          <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="yearsExperience"
                              type="number"
                              min="0"
                              className="pl-10"
                              value={formData.yearsExperience}
                              onChange={(e) => setFormData({ ...formData, yearsExperience: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="orderNumber">
                            {language === "ar" ? "رقم التسجيل في الهيئة" : language === "en" ? "Order Registration Number" : "N° Inscription à l'Ordre"} *
                          </Label>
                          <div className="relative">
                            <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="orderNumber"
                              className="pl-10"
                              value={formData.orderNumber}
                              onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="orderWilaya">
                            {language === "ar" ? "ولاية الهيئة" : language === "en" ? "Order Wilaya" : "Wilaya de l'Ordre"} *
                          </Label>
                          <Select
                            value={formData.orderWilaya}
                            onValueChange={(value) => setFormData({ ...formData, orderWilaya: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={language === "ar" ? "اختر" : language === "en" ? "Select" : "Sélectionner"} />
                            </SelectTrigger>
                            <SelectContent>
                              {wilayas.map((wilaya) => (
                                <SelectItem key={wilaya} value={wilaya}>{wilaya}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="licenseNumber">
                            {language === "ar" ? "رقم الترخيص" : language === "en" ? "License Number" : "N° d'Autorisation"} *
                          </Label>
                          <Input
                            id="licenseNumber"
                            value={formData.licenseNumber}
                            onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="agrementNumber">
                            {language === "ar" ? "رقم الاعتماد" : language === "en" ? "Agrément Number" : "N° d'Agrément"}
                          </Label>
                          <Input
                            id="agrementNumber"
                            value={formData.agrementNumber}
                            onChange={(e) => setFormData({ ...formData, agrementNumber: e.target.value })}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {(formData.role === "pharmacy" || formData.role === "factory" || formData.role === "school") && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="establishmentName">
                          {language === "ar" ? "اسم المؤسسة" : language === "en" ? "Establishment Name" : "Nom de l'établissement"} *
                        </Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="establishmentName"
                            className="pl-10"
                            value={formData.establishmentName}
                            onChange={(e) => setFormData({ ...formData, establishmentName: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="establishmentAddress">
                          {language === "ar" ? "عنوان المؤسسة" : language === "en" ? "Establishment Address" : "Adresse de l'établissement"} *
                        </Label>
                        <Textarea
                          id="establishmentAddress"
                          value={formData.establishmentAddress}
                          onChange={(e) => setFormData({ ...formData, establishmentAddress: e.target.value })}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="commercialRegisterNumber">
                            {language === "ar" ? "رقم السجل التجاري" : language === "en" ? "Commercial Register N°" : "N° Registre de Commerce"} *
                          </Label>
                          <Input
                            id="commercialRegisterNumber"
                            value={formData.commercialRegisterNumber}
                            onChange={(e) => setFormData({ ...formData, commercialRegisterNumber: e.target.value })}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="taxId">
                            {language === "ar" ? "الرقم الجبائي (NIF)" : language === "en" ? "Tax ID (NIF)" : "NIF"} *
                          </Label>
                          <Input
                            id="taxId"
                            value={formData.taxId}
                            onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cnasEmployerNumber">
                          {language === "ar" ? "رقم صاحب العمل CNAS" : language === "en" ? "CNAS Employer Number" : "N° Employeur CNAS"}
                        </Label>
                        <Input
                          id="cnasEmployerNumber"
                          value={formData.cnasEmployerNumber}
                          onChange={(e) => setFormData({ ...formData, cnasEmployerNumber: e.target.value })}
                        />
                      </div>
                    </>
                  )}

                  <div className="pt-4 border-t">
                    <Label className="text-sm font-bold mb-3 block">
                      {language === "ar" ? "جهة اتصال للطوارئ" : language === "en" ? "Emergency Contact" : "Contact d'urgence"}
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="emergencyContactName" className="text-xs">
                          {language === "ar" ? "الاسم" : language === "en" ? "Name" : "Nom"}
                        </Label>
                        <Input
                          id="emergencyContactName"
                          value={formData.emergencyContactName}
                          onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergencyContactPhone" className="text-xs">
                          {language === "ar" ? "الهاتف" : language === "en" ? "Phone" : "Téléphone"}
                        </Label>
                        <Input
                          id="emergencyContactPhone"
                          type="tel"
                          value={formData.emergencyContactPhone}
                          onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 4 && requiresVerification && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl flex gap-3">
                    <Info className="w-5 h-5 text-primary shrink-0" />
                    <div className="text-xs">
                      <p className="font-bold mb-1">
                        {language === "ar" ? "المستندات المطلوبة للتحقق" : language === "en" ? "Required Documents for Verification" : "Documents requis pour la vérification"}
                      </p>
                      <p>
                        {language === "ar"
                          ? "يرجى تحميل صور واضحة ومقروءة. ستتم مراجعتها من قبل المسؤول خلال 24-48 ساعة."
                          : language === "en"
                          ? "Please upload clear and readable images. They will be reviewed by admin within 24-48 hours."
                          : "Veuillez télécharger des images claires et lisibles. Elles seront examinées par l'admin sous 24-48h."}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FileUploadButton
                      label={language === "ar" ? "بطاقة الهوية (الوجه) *" : language === "en" ? "ID Card (Front) *" : "Carte d'identité (Recto) *"}
                      fieldName="idCardFrontUrl"
                      refKey="idCardFront"
                    />
                    <FileUploadButton
                      label={language === "ar" ? "بطاقة الهوية (الخلف) *" : language === "en" ? "ID Card (Back) *" : "Carte d'identité (Verso) *"}
                      fieldName="idCardBackUrl"
                      refKey="idCardBack"
                    />
                  </div>

                  {(formData.role === "doctor" || formData.role === "pharmacy" || formData.role === "trainer") && (
                    <div className="grid grid-cols-2 gap-4">
                      <FileUploadButton
                        label={language === "ar" ? "الشهادة / الدبلوم *" : language === "en" ? "Diploma / Certificate *" : "Diplôme / Certificat *"}
                        fieldName="diplomaUrl"
                        refKey="diploma"
                      />
                      <FileUploadButton
                        label={language === "ar" ? "رخصة الممارسة *" : language === "en" ? "Practice License *" : "Licence d'exercice *"}
                        fieldName="licenseDocumentUrl"
                        refKey="license"
                      />
                    </div>
                  )}

                  {formData.cnasNumber && (
                    <FileUploadButton
                      label={language === "ar" ? "شهادة الانتساب للضمان الاجتماعي" : language === "en" ? "CNAS Affiliation Certificate" : "Attestation d'affiliation CNAS"}
                      fieldName="cnasAttestationUrl"
                      refKey="cnasAttestation"
                    />
                  )}

                  {(formData.role === "pharmacy" || formData.role === "factory" || formData.role === "school") && (
                    <div className="grid grid-cols-2 gap-4">
                      <FileUploadButton
                        label={language === "ar" ? "السجل التجاري *" : language === "en" ? "Commercial Register *" : "Registre de commerce *"}
                        fieldName="commercialRegisterUrl"
                        refKey="commercialRegister"
                      />
                      <FileUploadButton
                        label={language === "ar" ? "شهادة صاحب العمل" : language === "en" ? "Employer Certificate" : "Attestation employeur"}
                        fieldName="employerAttestationUrl"
                        refKey="employerAttestation"
                      />
                    </div>
                  )}

                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <div className="text-xs text-emerald-700">
                        <p className="font-bold mb-1">
                          {language === "ar" ? "الخطوة الأخيرة!" : language === "en" ? "Final Step!" : "Dernière étape !"}
                        </p>
                        <p>
                          {language === "ar"
                            ? "بعد الإرسال، سيراجع المسؤول طلبك وسيتم إعلامك بالقرار عبر البريد الإلكتروني."
                            : language === "en"
                            ? "After submission, an admin will review your request and you'll be notified by email."
                            : "Après soumission, un admin examinera votre demande et vous serez notifié par email."}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="flex gap-3 pt-4">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep(step - 1)}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {language === "ar" ? "السابق" : language === "en" ? "Back" : "Retour"}
                  </Button>
                )}
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  disabled={loading || uploadingFile !== null}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {step < totalSteps
                        ? (language === "ar" ? "التالي" : language === "en" ? "Next" : "Suivant")
                        : (language === "ar" ? "إرسال الطلب" : language === "en" ? "Submit Application" : "Soumettre la demande")}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                {language === "ar" ? "لديك حساب بالفعل؟" : language === "en" ? "Already have an account?" : "Déjà un compte?"}{" "}
              </span>
              <Link href="/login" className="text-primary hover:underline font-medium">
                {t(language, "login")}
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
