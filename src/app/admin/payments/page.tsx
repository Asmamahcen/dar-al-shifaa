"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
  User,
  Shield,
  Loader2,
  Search,
  Filter,
  ExternalLink,
  Smartphone,
  CreditCard,
  Calendar,
  DollarSign,
  Star,
  Crown,
  Building,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navbar } from "@/components/Navbar";
import { useAppStore } from "@/lib/store";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";

interface BaridiMobPayment {
  id: string;
  user_id: string;
  plan_key: string;
  amount: number;
  receipt_url: string;
  status: string;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  user?: {
    full_name: string;
    email: string;
    phone: string;
  };
}

const planIcons: Record<string, React.ElementType> = {
  premium: Star,
  professional: Crown,
  enterprise: Building,
};

const planLabels: Record<string, string> = {
  premium: "Premium",
  professional: "Professionnel",
  enterprise: "Entreprise",
};

const planPrices: Record<string, number> = {
  premium: 1500,
  professional: 4500,
  enterprise: 7500,
};

export default function AdminPaymentsPage() {
  const { user, language } = useAppStore();
  const [payments, setPayments] = useState<BaridiMobPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<BaridiMobPayment | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPayments();
  }, [filterStatus]);

  const fetchPayments = async () => {
    setLoading(true);
    const supabase = createClient();
    
    let query = supabase
      .from("baridimob_payments")
      .select(`
        *,
        user:users(full_name, email, phone)
      `)
      .order("created_at", { ascending: false });

    if (filterStatus !== "all") {
      query = query.eq("status", filterStatus);
    }

    const { data, error } = await query;

    if (error) {
      toast.error("Erreur lors du chargement des paiements");
      console.error(error);
    } else {
      setPayments(data || []);
    }
    setLoading(false);
  };

  const handleApprove = async (paymentId: string) => {
    setProcessing(true);
    const supabase = createClient();
    const payment = payments.find(p => p.id === paymentId);
    
    if (!payment) {
      toast.error("Paiement non trouvé");
      setProcessing(false);
      return;
    }

    const { error: paymentError } = await supabase
      .from("baridimob_payments")
      .update({
        status: "approved",
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", paymentId);

    if (paymentError) {
      toast.error("Erreur lors de l'approbation");
      setProcessing(false);
      return;
    }

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const { error: userError } = await supabase
      .from("users")
      .update({
        plan: payment.plan_key,
        is_approved: true,
        plan_expires_at: expiresAt.toISOString(),
      })
      .eq("id", payment.user_id);

    if (userError) {
      toast.error("Erreur lors de la mise à jour du compte");
    } else {
      toast.success("Paiement approuvé et compte activé");
      fetchPayments();
      setIsDetailOpen(false);
    }
    setProcessing(false);
  };

  const handleReject = async () => {
    if (!selectedPayment) return;

    setProcessing(true);
    const supabase = createClient();
    
    const { error } = await supabase
      .from("baridimob_payments")
      .update({
        status: "rejected",
        admin_notes: rejectionReason,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", selectedPayment.id);

    if (error) {
      toast.error("Erreur lors du rejet");
    } else {
      toast.success("Paiement rejeté");
      fetchPayments();
      setIsRejectDialogOpen(false);
      setIsDetailOpen(false);
      setRejectionReason("");
    }
    setProcessing(false);
  };

  const filteredPayments = payments.filter(p => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        p.user?.full_name?.toLowerCase().includes(query) ||
        p.user?.email?.toLowerCase().includes(query) ||
        p.user?.phone?.includes(query)
      );
    }
    return true;
  });

  const stats = {
    pending: payments.filter(p => p.status === "pending").length,
    approved: payments.filter(p => p.status === "approved").length,
    rejected: payments.filter(p => p.status === "rejected").length,
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
              <h1 className="text-3xl font-black uppercase italic text-primary mb-2 flex items-center gap-3">
                <Smartphone className="w-8 h-8" />
                Paiements BaridiMob
              </h1>
              <p className="text-muted-foreground">
                Vérifiez les reçus de transfert et activez les abonnements
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, email, téléphone..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
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
          ) : filteredPayments.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="py-20 text-center">
                <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-emerald-500/50" />
                <h3 className="text-lg font-bold mb-2">Aucun paiement</h3>
                <p className="text-muted-foreground">
                  {filterStatus === "pending" 
                    ? "Aucun paiement en attente de vérification"
                    : "Aucun paiement pour ces critères"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredPayments.map((payment) => {
                const PlanIcon = planIcons[payment.plan_key] || Star;
                return (
                  <motion.div
                    key={payment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="glass-card hover:border-amber-500/30 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              payment.status === "pending" 
                                ? "bg-amber-500/10" 
                                : payment.status === "approved"
                                ? "bg-emerald-500/10"
                                : "bg-red-500/10"
                            }`}>
                              <Smartphone className={`w-6 h-6 ${
                                payment.status === "pending" 
                                  ? "text-amber-500" 
                                  : payment.status === "approved"
                                  ? "text-emerald-500"
                                  : "text-red-500"
                              }`} />
                            </div>
                            <div>
                              <h3 className="font-bold">{payment.user?.full_name || "Utilisateur inconnu"}</h3>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span>{payment.user?.email}</span>
                                <span>{payment.user?.phone}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right hidden md:block">
                              <div className="flex items-center gap-2 mb-1">
                                <PlanIcon className="w-4 h-4 text-primary" />
                                <span className="font-bold">{planLabels[payment.plan_key]}</span>
                              </div>
                              <p className="text-lg font-black text-primary">{payment.amount} DA</p>
                            </div>

                            <div className="text-right hidden md:block">
                              <p className="text-xs text-muted-foreground">
                                {new Date(payment.created_at).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(payment.created_at).toLocaleTimeString()}
                              </p>
                            </div>

                            <Badge className={
                              payment.status === "pending"
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                                : payment.status === "approved"
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                : "bg-red-500/10 text-red-600 border-red-500/30"
                            }>
                              {payment.status === "pending" ? "En attente" : 
                               payment.status === "approved" ? "Approuvé" : "Rejeté"}
                            </Badge>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedPayment(payment);
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
        <DialogContent className="max-w-2xl">
          {selectedPayment && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-xl font-black uppercase italic">
                      Vérification du Paiement
                    </DialogTitle>
                    <DialogDescription>
                      Soumis le {new Date(selectedPayment.created_at).toLocaleString()}
                    </DialogDescription>
                  </div>
                  <Badge className={
                    selectedPayment.status === "pending"
                      ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                      : selectedPayment.status === "approved"
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                      : "bg-red-500/10 text-red-600 border-red-500/30"
                  }>
                    {selectedPayment.status === "pending" ? "En attente" : 
                     selectedPayment.status === "approved" ? "Approuvé" : "Rejeté"}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Client</label>
                    <p className="font-bold">{selectedPayment.user?.full_name}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Email</label>
                    <p className="font-medium">{selectedPayment.user?.email}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Téléphone</label>
                    <p className="font-medium">{selectedPayment.user?.phone}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Plan</label>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const PIcon = planIcons[selectedPayment.plan_key] || Star;
                        return <PIcon className="w-4 h-4 text-primary" />;
                      })()}
                      <p className="font-bold">{planLabels[selectedPayment.plan_key]}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">Montant déclaré</span>
                    <span className="text-2xl font-black text-amber-600">{selectedPayment.amount} DA</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Prix du plan</span>
                    <span className="font-medium">{planPrices[selectedPayment.plan_key]} DA/mois</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Reçu de transfert</label>
                  <a 
                    href={selectedPayment.receipt_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="aspect-video bg-muted rounded-xl overflow-hidden relative group cursor-pointer border-2 border-dashed border-border hover:border-primary/50 transition-colors">
                      <img 
                        src={selectedPayment.receipt_url} 
                        alt="Reçu BaridiMob"
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button variant="secondary" size="sm">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Voir en grand
                        </Button>
                      </div>
                    </div>
                  </a>
                </div>

                {selectedPayment.status === "rejected" && selectedPayment.admin_notes && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                    <div className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                      <div>
                        <p className="font-bold text-red-600 text-sm">Motif du rejet</p>
                        <p className="text-sm text-red-700">{selectedPayment.admin_notes}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedPayment.status === "pending" && (
                  <DialogFooter className="gap-2">
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
                      onClick={() => handleApprove(selectedPayment.id)}
                      disabled={processing}
                    >
                      {processing ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                      )}
                      Approuver et Activer
                    </Button>
                  </DialogFooter>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Rejeter le paiement</DialogTitle>
            <DialogDescription>
              Veuillez fournir un motif de rejet qui sera enregistré.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Motif du rejet (ex: reçu illisible, montant incorrect)..."
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
