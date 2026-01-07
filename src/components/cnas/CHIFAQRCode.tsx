"use client";

import { QrCode, ShieldCheck, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface CHIFAQRCodeProps {
  hash: string;
  status: string;
  expiresAt: string;
}

export function CHIFAQRCode({ hash, status, expiresAt }: CHIFAQRCodeProps) {
  return (
    <div className="flex flex-col items-center p-6 glass-card border-primary/20">
      <div className="relative mb-4">
        <div className="w-48 h-48 bg-white p-4 rounded-xl shadow-inner flex items-center justify-center">
          <QrCode className="w-40 h-40 text-primary" strokeWidth={1.5} />
          <div className="absolute inset-0 border-2 border-dashed border-primary/30 rounded-xl animate-pulse" />
        </div>
        <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground p-1.5 rounded-lg shadow-lg">
          <ShieldCheck className="w-4 h-4" />
        </div>
      </div>
      
      <div className="text-center space-y-1">
        <p className="font-bold text-lg">QR CHIFA Sécurisé</p>
        <p className="text-xs text-muted-foreground font-mono">{hash}</p>
      </div>

      <div className="mt-4 flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-full text-[10px] uppercase tracking-wider font-bold">
        <Clock className="w-3 h-3" />
        Expire le: {new Date(expiresAt).toLocaleDateString()}
      </div>

      <p className="mt-6 text-[10px] text-center text-muted-foreground italic max-w-[200px]">
        Ce QR code est généré à titre déclaratif pour faciliter vos démarches internes.
      </p>
    </div>
  );
}
