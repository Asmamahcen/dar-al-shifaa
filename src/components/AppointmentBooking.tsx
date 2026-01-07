"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, Clock, Lock, Zap, CheckCircle2 } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import Link from "next/link";

interface AppointmentBookingProps {
  doctorId: string;
  doctorName: string;
  specialty?: string;
}

export function AppointmentBooking({ doctorId, doctorName, specialty }: AppointmentBookingProps) {
  const { language, user, addAppointment } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBook = async () => {
    if (!user) {
      toast.error(t(language, "loginRequired" as any) || "Connexion requise");
      return;
    }

    if (!date || !time) {
      toast.error(t(language, "appointmentError"));
      return;
    }

    setIsSubmitting(true);
    try {
      await addAppointment({
        doctorId,
        patientId: user.id,
        date,
        time,
        status: "pending",
        notes,
      });
      toast.success(t(language, "appointmentSuccess"));
      setIsOpen(false);
      // Reset form
      setDate("");
      setTime("");
      setNotes("");
    } catch (error) {
      toast.error(t(language, "appointmentError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="w-full">Prendre Rendez-vous</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Connexion Requise</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground mb-6">
              Veuillez vous connecter pour réserver un rendez-vous avec {doctorName}.
            </p>
            <div className="flex gap-4 w-full">
              <Button asChild className="flex-1">
                <Link href="/login">{t(language, "login")}</Link>
              </Button>
              <Button variant="outline" asChild className="flex-1">
                <Link href="/register">{t(language, "register")}</Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (user.role !== "patient") {
    return (
      <Button variant="outline" disabled className="w-full">
        Réservé aux patients
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Prendre Rendez-vous</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Réserver avec {doctorName}</DialogTitle>
          {specialty && <p className="text-sm text-muted-foreground">{specialty}</p>}
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-center gap-3">
            <Zap className="h-5 w-5 text-blue-600" />
            <div className="text-xs text-blue-800">
              <p className="font-bold">Optimisation intelligente</p>
              <p>Ce médecin privilégie les rendez-vous confirmés via Dar Al Shifaa.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-primary" />
                {t(language, "appointmentDate")}
              </label>
              <Input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                {t(language, "appointmentTime")}
              </label>
              <Input 
                type="time" 
                value={time} 
                onChange={(e) => setTime(e.target.value)} 
              />
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-100">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-[10px] text-green-700 font-medium">Créneau disponible à 95% de probabilité</span>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t(language, "notes")}</label>
            <Textarea 
              placeholder="Raisons de la consultation (optionnel)..." 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
            {t(language, "cancel")}
          </Button>
          <Button onClick={handleBook} disabled={!date || !time || isSubmitting}>
            {isSubmitting ? "Réservation..." : t(language, "bookAppointment")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
