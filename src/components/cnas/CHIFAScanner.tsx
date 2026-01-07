"use client";

import { useState } from "react";
import { Camera, Upload, Loader2, CheckCircle2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { validateNSS } from "@/lib/cnas";
import { toast } from "sonner";

interface CHIFAScannerProps {
  onScanComplete: (data: { nss: string; fullName: string; validityDate: string; isValid: boolean }) => void;
}

export function CHIFAScanner({ onScanComplete }: CHIFAScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);

  const simulateScan = () => {
    setScanning(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          finishScan();
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const finishScan = () => {
    // Mock extracted data
    const mockData = {
      nss: "850412345678",
      fullName: "MOHAMED BENALI",
      validityDate: "2026-12-31",
      isValid: true
    };

    setScanning(false);
    toast.success("Extraction terminée avec succès");
    onScanComplete(mockData);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Button 
          variant="outline" 
          className="h-24 flex-col gap-2 border-dashed border-2 hover:border-primary/50"
          onClick={simulateScan}
          disabled={scanning}
        >
          <Camera className="w-6 h-6 text-primary" />
          <span className="text-xs">Scanner Carte CHIFA</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-24 flex-col gap-2 border-dashed border-2 hover:border-primary/50"
          onClick={simulateScan}
          disabled={scanning}
        >
          <Upload className="w-6 h-6 text-primary" />
          <span className="text-xs">Attestation (PDF)</span>
        </Button>
      </div>

      {scanning && (
        <div className="space-y-2 p-4 glass-card animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              OCR en cours...
            </span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      )}

      <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 px-1">
        <ShieldAlert className="w-3 h-3" />
        Les données sont traitées localement pour votre sécurité.
      </div>
    </div>
  );
}
