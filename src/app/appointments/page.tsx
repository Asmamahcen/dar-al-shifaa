"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Stethoscope,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  MessageSquare,
  Search,
  ChevronRight,
  Filter,
  Lock,
  Trash2,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/Navbar";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const DAYS = [
  "Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"
];

export default function AppointmentsPage() {
  const { 
    language, user, users, appointments, addAppointment, updateAppointment, 
    doctorAvailability, addAvailability, deleteAvailability, fetchInitialData 
  } = useAppStore();
  
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
  
  // Booking state
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  
  // Availability state
  const [newDay, setNewDay] = useState("1");
  const [newStart, setNewStart] = useState("09:00");
  const [newEnd, setNewEnd] = useState("17:00");
  
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const doctors = users.filter((u) => u.role === "doctor" && u.isApproved);
  
  const myAppointments = user?.role === "patient" 
    ? appointments.filter(a => a.patientId === user.id)
    : appointments.filter(a => a.doctorId === user?.id);

  const filteredAppointments = myAppointments
    .filter(a => filterStatus === "all" || a.status === filterStatus)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const myAvailability = doctorAvailability.filter(a => a.doctorId === user?.id);

  const handleBook = async () => {
    if (!selectedDoctor || !date || !time) {
      toast.error(t(language, "appointmentError"));
      return;
    }

    try {
      await addAppointment({
        doctorId: selectedDoctor,
        patientId: user!.id,
        date,
        time,
        status: "pending",
        notes,
      });
      toast.success(t(language, "appointmentSuccess"));
      setIsBookingOpen(false);
      setSelectedDoctor("");
      setDate("");
      setTime("");
      setNotes("");
    } catch (error) {
      toast.error(t(language, "appointmentError"));
    }
  };

  const handleStatusUpdate = async (id: string, status: 'confirmed' | 'cancelled') => {
    try {
      await updateAppointment(id, { status });
      toast.success(status === 'confirmed' ? t(language, "confirmed") : t(language, "cancelled"));
    } catch (error) {
      toast.error("Error updating status");
    }
  };

  const handleAddAvailability = async () => {
    if (!user) return;
    try {
      await addAvailability({
        doctorId: user.id,
        dayOfWeek: parseInt(newDay),
        startTime: newStart,
        endTime: newEnd,
        slotDuration: 30,
      });
      toast.success("Disponibilité ajoutée");
      setIsAvailabilityOpen(false);
    } catch (error) {
      toast.error("Erreur lors de l'ajout");
    }
  };

  const handleDeleteAvailability = async (id: string) => {
    try {
      await deleteAvailability(id);
      toast.success("Disponibilité supprimée");
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  // Helper to get available slots for a doctor on a specific date
  const getAvailableSlots = (doctorId: string, selectedDate: string) => {
    if (!selectedDate) return [];
    const dayOfWeek = new Date(selectedDate).getDay();
    const doctorAvail = doctorAvailability.filter(a => a.doctorId === doctorId && a.dayOfWeek === dayOfWeek);
    
    if (doctorAvail.length === 0) return [];

    const slots: string[] = [];
    doctorAvail.forEach(avail => {
      let current = new Date(`1970-01-01T${avail.startTime}`);
      const end = new Date(`1970-01-01T${avail.endTime}`);
      
      while (current < end) {
        const timeStr = current.toTimeString().slice(0, 5);
        // Check if slot is already taken
        const isTaken = appointments.some(a => 
          a.doctorId === doctorId && 
          a.date === selectedDate && 
          a.time.slice(0, 5) === timeStr &&
          a.status !== 'cancelled'
        );
        
        if (!isTaken) {
          slots.push(timeStr);
        }
        current = new Date(current.getTime() + avail.slotDuration * 60000);
      }
    });

    return slots;
  };

  const availableSlots = selectedDoctor ? getAvailableSlots(selectedDoctor, date) : [];

  if (!user) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 flex flex-col items-center justify-center px-4 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Lock className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-4">{t(language, "loginRequired" as any) || "Connexion requise"}</h1>
          <p className="text-muted-foreground mb-8">Veuillez vous connecter pour gérer vos rendez-vous.</p>
          <div className="flex gap-4">
            <Button asChild><Link href="/login">{t(language, "login")}</Link></Button>
            <Button variant="outline" asChild><Link href="/register">{t(language, "register")}</Link></Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">{t(language, "appointments")}</h1>
            <p className="text-muted-foreground">
              {user.role === "doctor" 
                ? "Gérez vos consultations et disponibilités"
                : "Consultez et réservez vos rendez-vous médicaux"}
            </p>
          </div>

          <div className="flex gap-2">
            {user.role === "doctor" && (
              <Dialog open={isAvailabilityOpen} onOpenChange={setIsAvailabilityOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Clock className="w-4 h-4 mr-2" />
                    Mes Disponibilités
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Gérer mes disponibilités</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-7 gap-2">
                        {myAvailability.sort((a,b) => a.dayOfWeek - b.dayOfWeek).map((avail) => (
                          <div key={avail.id} className="col-span-7 flex items-center justify-between p-3 glass-card bg-secondary/20">
                            <div className="flex items-center gap-4">
                              <Badge variant="outline" className="w-24 justify-center">
                                {DAYS[avail.dayOfWeek]}
                              </Badge>
                              <span className="text-sm font-medium">
                                {avail.startTime.slice(0, 5)} - {avail.endTime.slice(0, 5)}
                              </span>
                            </div>
                            <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDeleteAvailability(avail.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      <div className="pt-4 border-t space-y-4">
                        <h4 className="text-sm font-semibold">Ajouter un créneau</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-medium uppercase text-muted-foreground">Jour</label>
                            <Select onValueChange={setNewDay} value={newDay}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {DAYS.map((day, i) => (
                                  <SelectItem key={i} value={i.toString()}>{day}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium uppercase text-muted-foreground">Début</label>
                            <Input type="time" value={newStart} onChange={(e) => setNewStart(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium uppercase text-muted-foreground">Fin</label>
                            <Input type="time" value={newEnd} onChange={(e) => setNewEnd(e.target.value)} />
                          </div>
                        </div>
                        <Button className="w-full" onClick={handleAddAvailability}>
                          <Plus className="w-4 h-4 mr-2" />
                          Ajouter la disponibilité
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {user.role === "patient" && (
              <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-primary to-accent">
                    <Plus className="w-4 h-4 mr-2" />
                    {t(language, "bookAppointment")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>{t(language, "bookAppointment")}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t(language, "doctor")}</label>
                      <Select onValueChange={setSelectedDoctor} value={selectedDoctor}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir un médecin" />
                        </SelectTrigger>
                        <SelectContent>
                          {doctors.map((doc) => (
                            <SelectItem key={doc.id} value={doc.id}>
                              <div className="flex items-center gap-2">
                                <Stethoscope className="w-4 h-4 text-primary" />
                                <span>{doc.fullName} - {doc.specialty || "Médecin généraliste"}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">{t(language, "appointmentDate")}</label>
                        <Input 
                          type="date" 
                          min={new Date().toISOString().split('T')[0]} 
                          value={date} 
                          onChange={(e) => setDate(e.target.value)} 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Heures Disponibles</label>
                        <Select onValueChange={setTime} value={time} disabled={!selectedDoctor || !date}>
                          <SelectTrigger>
                            <SelectValue placeholder={!selectedDoctor || !date ? "Sélectionnez médecin/date" : "Choisir un créneau"} />
                          </SelectTrigger>
                          <SelectContent>
                            {availableSlots.length > 0 ? (
                              availableSlots.map((slot) => (
                                <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                              ))
                            ) : (
                              <div className="p-2 text-sm text-center text-muted-foreground italic">
                                Aucun créneau disponible
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t(language, "notes")}</label>
                      <Textarea 
                        placeholder="Raisons de la consultation..." 
                        value={notes} 
                        onChange={(e) => setNotes(e.target.value)} 
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsBookingOpen(false)}>
                      {t(language, "cancel")}
                    </Button>
                    <Button onClick={handleBook} disabled={!selectedDoctor || !date || !time}>
                      {t(language, "bookAppointment")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtres
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase">Statut</label>
                  <Select onValueChange={setFilterStatus} value={filterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les rendez-vous</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="confirmed">Confirmés</SelectItem>
                      <SelectItem value="completed">Terminés</SelectItem>
                      <SelectItem value="cancelled">Annulés</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 bg-primary/5 border-primary/20">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-primary" />
                Important
              </h3>
              <p className="text-sm text-muted-foreground">
                Veuillez arriver 15 minutes avant l'heure de votre rendez-vous muni de votre carte CHIFA.
              </p>
            </div>
          </div>

          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {filteredAppointments.length > 0 ? (
                <div className="space-y-4">
                  {filteredAppointments.map((appt) => {
                    const otherUser = user.role === "patient" 
                      ? users.find(u => u.id === appt.doctorId)
                      : users.find(u => u.id === appt.patientId);

                    return (
                      <motion.div
                        key={appt.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                            appt.status === 'confirmed' ? 'bg-green-500/10 text-green-500' :
                            appt.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                            'bg-red-500/10 text-red-500'
                          }`}>
                            {user.role === 'patient' ? <Stethoscope className="w-6 h-6" /> : <User className="w-6 h-6" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold">{otherUser?.fullName || "Utilisateur inconnu"}</h4>
                              <Badge variant={
                                appt.status === 'confirmed' ? 'default' :
                                appt.status === 'pending' ? 'secondary' :
                                'destructive'
                              } className="text-[10px] uppercase py-0 px-2">
                                {t(language, appt.status as any)}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="w-3.5 h-3.5" />
                                {appt.date}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {appt.time.slice(0, 5)}
                              </div>
                              {otherUser?.specialty && (
                                <div className="flex items-center gap-1">
                                  <Stethoscope className="w-3.5 h-3.5" />
                                  {otherUser.specialty}
                                </div>
                              )}
                            </div>
                            {appt.notes && (
                              <p className="mt-3 text-sm text-muted-foreground border-l-2 border-border pl-3 italic">
                                "{appt.notes}"
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-4 md:mt-0">
                          {user.role === 'doctor' && appt.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => handleStatusUpdate(appt.id, 'confirmed')}
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                                {t(language, "approve")}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleStatusUpdate(appt.id, 'cancelled')}
                              >
                                <XCircle className="w-4 h-4 mr-1.5" />
                                {t(language, "reject")}
                              </Button>
                            </>
                          )}
                          {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                            <Button size="sm" variant="ghost" className="text-muted-foreground">
                              <MessageSquare className="w-4 h-4 mr-1.5" />
                              Message
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card p-12 text-center"
                >
                  <CalendarIcon className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{t(language, "noAppointments")}</h3>
                  <p className="text-muted-foreground mb-6">
                    {user.role === 'patient' 
                      ? "Vous n'avez pas encore de rendez-vous. Commencez par en réserver un."
                      : "Vous n'avez pas de demandes de rendez-vous pour le moment."}
                  </p>
                  {user.role === 'patient' && (
                    <Button onClick={() => setIsBookingOpen(true)} className="bg-primary/10 text-primary hover:bg-primary/20">
                      Prendre mon premier rendez-vous
                    </Button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
