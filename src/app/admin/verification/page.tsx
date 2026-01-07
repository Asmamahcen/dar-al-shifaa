"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
  User,
  Building2,
  Stethoscope,
  GraduationCap,
  Factory,
  Shield,
  FileText,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Award,
  Briefcase,
  AlertTriangle,
  Loader2,
  Search,
  Filter,
  ChevronDown,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/Navbar";
import { useAppStore } from "@/lib/store";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";

interface PendingUser {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  wilaya: string;
  city: string;
  address: string;
  birth_date: string;
  national_id_number: string;
  cnas_number: string;
  specialty: string;
  years_experience: number;
  order_number: string;
  order_wilaya: string;
  license_number: string;
  agrément_number: string;
  establishment_name: string;
  establishment_address: string;
  commercial_register_number: string;
  tax_id: string;
  cnas_employer_number: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  id_card_front_url: string;
  id_card_back_url: string;
  diploma_url: string;
  license_document_url: string;
  cnas_attestation_url: string;
  commercial_register_url: string;
  employer_attestation_url: string;
  verification_status: string;
  submission_date: string;
  rejection_reason: string;
  created_at: string;
}

const roleIcons: Record<string, React.ElementType> = {
  patient: User,
  doctor: Stethoscope,
  pharmacy: Building2,
  school: GraduationCap,
  trainer: GraduationCap,
  factory: Factory,
  creator: Shield,
};

const roleLabels: Record<string, string> = {
  patient: "Patient",
  doctor: "Médecin",
  pharmacy: "Pharmacie",
  school: "École",
  trainer: "Formateur",
  factory: "Laboratoire",
  creator: "Administrateur",
};

export default function AdminVerificationPage() {
  const { user, language } = useAppStore();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPendingUsers();
  }, [filterRole, filterStatus]);

  const fetchPendingUsers = async () => {
    setLoading(true);
    const supabase = createClient();
    
    let query = supabase.from("users").select("*").order("submission_date", { ascending: false });

    if (filterStatus !== "all") {
      query = query.eq("verification_status", filterStatus);
    }

    if (filterRole !== "all") {
      query = query.eq("role", filterRole);
    }

    const { data, error } = await query;

    if (error) {
      toast.error("Erreur lors du chargement des demandes");
      console.error(error);
    } else {
      setPendingUsers(data || []);
    }
    setLoading(false);
  };

  const handleApprove = async (userId: string) => {
    setProcessing(true);
    const supabase = createClient();
    
    const { error } = await supabase.from("users").update({
      verification_status: "approved",
      is_approved: true,
      verified: true,
      verified_at: new Date().toISOString(),
      verified_by: user?.id,
    }).eq("id", userId);

    if (error) {
      toast.error("Erreur lors de l'approbation");
    } else {
      toast.success("Compte approuvé avec succès");
      fetchPendingUsers();
      setIsDetailOpen(false);
    }
    setProcessing(false);
  };

  const handleReject = async () => {
    if (!selectedUser || !rejectionReason.trim()) {
      toast.error("Veuillez fournir un motif de rejet");
      return;
    }

    setProcessing(true);
    const supabase = createClient();
    
    const { error } = await supabase.from("users").update({
      verification_status: "rejected",
      is_approved: false,
      rejection_reason: rejectionReason,
      verified_at: new Date().toISOString(),
      verified_by: user?.id,
    }).eq("id", selectedUser.id);

    if (error) {
      toast.error("Erreur lors du rejet");
    } else {
      toast.success("Demande rejetée");
      fetchPendingUsers();
      setIsRejectDialogOpen(false);
      setIsDetailOpen(false);
      setRejectionReason("");
    }
    setProcessing(false);
  };

  const filteredUsers = pendingUsers.filter(u => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        u.full_name?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query) ||
        u.phone?.includes(query) ||
        u.national_id_number?.includes(query)
      );
    }
    return true;
  });

  const stats = {
    pending: pendingUsers.filter(u => u.verification_status === "pending").length,
    approved: pendingUsers.filter(u => u.verification_status === "approved").length,
    rejected: pendingUsers.filter(u => u.verification_status === "rejected").length,
  };

  if (user?.role !== "creator") {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="glass-card max-w-md">
            <CardContent className="pt-6 text-center">
              <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <h2 className="text-xl font-bold mb-2">Accès Refusé</h2>
              <p className="text-muted-foreground">
                Cette page est réservée aux administrateurs.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-black uppercase italic text-primary mb-2">
                Vérification des Comptes
              </h1>
              <p className="text-muted-foreground">
                Gérez les demandes d'inscription des professionnels de santé
              </p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 px-4 py-2">
                <Clock className="w-4 h-4 mr-2" />
                {stats.pending} En attente
              </Badge>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 px-4 py-2">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {stats.approved} Approuvés
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, email, téléphone, N° ID..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="doctor">Médecins</SelectItem>
                <SelectItem value="pharmacy">Pharmacies</SelectItem>
                <SelectItem value="factory">Laboratoires</SelectItem>
                <SelectItem value="school">Écoles</SelectItem>
                <SelectItem value="trainer">Formateurs</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="approved">Approuvés</SelectItem>
                <SelectItem value="rejected">Rejetés</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="py-20 text-center">
                <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-emerald-500/50" />
                <h3 className="text-lg font-bold mb-2">Aucune demande</h3>
                <p className="text-muted-foreground">
                  {filterStatus === "pending" 
                    ? "Toutes les demandes ont été traitées"
                    : "Aucun résultat pour ces critères"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredUsers.map((pendingUser) => {
                const RoleIcon = roleIcons[pendingUser.role] || User;
                return (
                  <motion.div
                    key={pendingUser.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="glass-card hover:border-primary/30 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              pendingUser.verification_status === "pending" 
                                ? "bg-amber-500/10" 
                                : pendingUser.verification_status === "approved"
                                ? "bg-emerald-500/10"
                                : "bg-red-500/10"
                            }`}>
                              <RoleIcon className={`w-6 h-6 ${
                                pendingUser.verification_status === "pending" 
                                  ? "text-amber-500" 
                                  : pendingUser.verification_status === "approved"
                                  ? "text-emerald-500"
                                  : "text-red-500"
                              }`} />
                            </div>
                            <div>
                              <h3 className="font-bold">{pendingUser.full_name}</h3>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {pendingUser.email}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {pendingUser.phone}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right hidden md:block">
                              <Badge variant="outline" className="mb-1">
                                {roleLabels[pendingUser.role]}
                              </Badge>
                              <p className="text-[10px] text-muted-foreground">
                                {new Date(pendingUser.submission_date || pendingUser.created_at).toLocaleDateString()}
                              </p>
                            </div>

                            <Badge className={
                              pendingUser.verification_status === "pending"
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                                : pendingUser.verification_status === "approved"
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                : "bg-red-500/10 text-red-600 border-red-500/30"
                            }>
                              {pendingUser.verification_status === "pending" ? "En attente" : 
                               pendingUser.verification_status === "approved" ? "Approuvé" : "Rejeté"}
                            </Badge>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(pendingUser);
                                setIsDetailOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Examiner
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedUser && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-xl font-black uppercase italic">
                      Demande de Vérification
                    </DialogTitle>
                    <DialogDescription>
                      Soumis le {new Date(selectedUser.submission_date || selectedUser.created_at).toLocaleString()}
                    </DialogDescription>
                  </div>
                  <Badge className={
                    selectedUser.verification_status === "pending"
                      ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                      : selectedUser.verification_status === "approved"
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                      : "bg-red-500/10 text-red-600 border-red-500/30"
                  }>
                    {selectedUser.verification_status === "pending" ? "En attente" : 
                     selectedUser.verification_status === "approved" ? "Approuvé" : "Rejeté"}
                  </Badge>
                </div>
              </DialogHeader>

              <Tabs defaultValue="personal" className="mt-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="personal">Infos Personnelles</TabsTrigger>
                  <TabsTrigger value="professional">Infos Professionnelles</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground">Nom Complet</label>
                      <p className="font-medium">{selectedUser.full_name}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground">Rôle</label>
                      <p className="font-medium">{roleLabels[selectedUser.role]}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground">Email</label>
                      <p className="font-medium">{selectedUser.email}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground">Téléphone</label>
                      <p className="font-medium">{selectedUser.phone}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground">Date de Naissance</label>
                      <p className="font-medium">{selectedUser.birth_date ? new Date(selectedUser.birth_date).toLocaleDateString() : "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground">N° Carte Nationale</label>
                      <p className="font-medium font-mono">{selectedUser.national_id_number || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground">Wilaya</label>
                      <p className="font-medium">{selectedUser.wilaya}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground">Ville</label>
                      <p className="font-medium">{selectedUser.city}</p>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground">Adresse</label>
                      <p className="font-medium">{selectedUser.address}</p>
                    </div>
                  </div>

                  {(selectedUser.emergency_contact_name || selectedUser.emergency_contact_phone) && (
                    <div className="p-4 bg-secondary/30 rounded-xl">
                      <h4 className="font-bold text-sm mb-2">Contact d'Urgence</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Nom</label>
                          <p className="font-medium">{selectedUser.emergency_contact_name || "-"}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Téléphone</label>
                          <p className="font-medium">{selectedUser.emergency_contact_phone || "-"}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="professional" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    {selectedUser.cnas_number && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground">N° CNAS</label>
                        <p className="font-medium font-mono">{selectedUser.cnas_number}</p>
                      </div>
                    )}
                    {selectedUser.specialty && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground">Spécialité</label>
                        <p className="font-medium">{selectedUser.specialty}</p>
                      </div>
                    )}
                    {selectedUser.years_experience && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground">Années d'Expérience</label>
                        <p className="font-medium">{selectedUser.years_experience} ans</p>
                      </div>
                    )}
                    {selectedUser.order_number && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground">N° Inscription à l'Ordre</label>
                        <p className="font-medium font-mono">{selectedUser.order_number}</p>
                      </div>
                    )}
                    {selectedUser.order_wilaya && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground">Wilaya de l'Ordre</label>
                        <p className="font-medium">{selectedUser.order_wilaya}</p>
                      </div>
                    )}
                    {selectedUser.license_number && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground">N° d'Autorisation</label>
                        <p className="font-medium font-mono">{selectedUser.license_number}</p>
                      </div>
                    )}
                    {selectedUser.agrément_number && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground">N° d'Agrément</label>
                        <p className="font-medium font-mono">{selectedUser.agrément_number}</p>
                      </div>
                    )}
                  </div>

                  {selectedUser.establishment_name && (
                    <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                      <h4 className="font-bold text-sm mb-3">Établissement</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Nom</label>
                          <p className="font-medium">{selectedUser.establishment_name}</p>
                        </div>
                        <div className="col-span-2 space-y-1">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Adresse</label>
                          <p className="font-medium">{selectedUser.establishment_address}</p>
                        </div>
                        {selectedUser.commercial_register_number && (
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground">N° Registre de Commerce</label>
                            <p className="font-medium font-mono">{selectedUser.commercial_register_number}</p>
                          </div>
                        )}
                        {selectedUser.tax_id && (
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground">NIF</label>
                            <p className="font-medium font-mono">{selectedUser.tax_id}</p>
                          </div>
                        )}
                        {selectedUser.cnas_employer_number && (
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground">N° Employeur CNAS</label>
                            <p className="font-medium font-mono">{selectedUser.cnas_employer_number}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="documents" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedUser.id_card_front_url && (
                      <a href={selectedUser.id_card_front_url} target="_blank" rel="noopener noreferrer" className="group">
                        <div className="aspect-video bg-secondary/50 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2 p-4">
                          <FileText className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="text-xs font-medium">Carte d'identité (Recto)</span>
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </a>
                    )}
                    {selectedUser.id_card_back_url && (
                      <a href={selectedUser.id_card_back_url} target="_blank" rel="noopener noreferrer" className="group">
                        <div className="aspect-video bg-secondary/50 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2 p-4">
                          <FileText className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="text-xs font-medium">Carte d'identité (Verso)</span>
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </a>
                    )}
                    {selectedUser.diploma_url && (
                      <a href={selectedUser.diploma_url} target="_blank" rel="noopener noreferrer" className="group">
                        <div className="aspect-video bg-secondary/50 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2 p-4">
                          <GraduationCap className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="text-xs font-medium">Diplôme</span>
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </a>
                    )}
                    {selectedUser.license_document_url && (
                      <a href={selectedUser.license_document_url} target="_blank" rel="noopener noreferrer" className="group">
                        <div className="aspect-video bg-secondary/50 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2 p-4">
                          <Award className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="text-xs font-medium">Licence d'exercice</span>
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </a>
                    )}
                    {selectedUser.cnas_attestation_url && (
                      <a href={selectedUser.cnas_attestation_url} target="_blank" rel="noopener noreferrer" className="group">
                        <div className="aspect-video bg-secondary/50 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2 p-4">
                          <Shield className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="text-xs font-medium">Attestation CNAS</span>
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </a>
                    )}
                    {selectedUser.commercial_register_url && (
                      <a href={selectedUser.commercial_register_url} target="_blank" rel="noopener noreferrer" className="group">
                        <div className="aspect-video bg-secondary/50 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2 p-4">
                          <Building2 className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="text-xs font-medium">Registre de Commerce</span>
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </a>
                    )}
                    {selectedUser.employer_attestation_url && (
                      <a href={selectedUser.employer_attestation_url} target="_blank" rel="noopener noreferrer" className="group">
                        <div className="aspect-video bg-secondary/50 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2 p-4">
                          <Briefcase className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="text-xs font-medium">Attestation Employeur</span>
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </a>
                    )}
                  </div>

                  {!selectedUser.id_card_front_url && !selectedUser.id_card_back_url && (
                    <div className="p-8 text-center bg-secondary/30 rounded-xl">
                      <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-amber-500" />
                      <p className="font-bold">Aucun document fourni</p>
                      <p className="text-sm text-muted-foreground">
                        L'utilisateur n'a pas téléchargé de documents de vérification.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              {selectedUser.verification_status === "rejected" && selectedUser.rejection_reason && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl mt-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                    <div>
                      <p className="font-bold text-red-600 text-sm">Motif du rejet</p>
                      <p className="text-sm text-red-700">{selectedUser.rejection_reason}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedUser.verification_status === "pending" && (
                <DialogFooter className="mt-6 gap-2">
                  <Button
                    variant="outline"
                    className="border-red-500/30 text-red-600 hover:bg-red-500/10"
                    onClick={() => setIsRejectDialogOpen(true)}
                    disabled={processing}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Rejeter
                  </Button>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => handleApprove(selectedUser.id)}
                    disabled={processing}
                  >
                    {processing ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                    )}
                    Approuver le compte
                  </Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Rejeter la demande</DialogTitle>
            <DialogDescription>
              Veuillez fournir un motif de rejet qui sera communiqué à l'utilisateur.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Motif du rejet (obligatoire)..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing || !rejectionReason.trim()}
            >
              {processing ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              Confirmer le rejet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
