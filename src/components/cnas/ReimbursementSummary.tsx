"use client";

import { Info, Calculator, TrendingDown, Receipt } from "lucide-react";
import { CNAS_DISCLAIMER } from "@/lib/cnas";

interface ReimbursementSummaryProps {
  totalAmount: number;
  reimbursedAmount: number;
  remainingAmount: number;
  rate: number;
  category: string;
}

export function ReimbursementSummary({ 
  totalAmount, 
  reimbursedAmount, 
  remainingAmount, 
  rate,
  category 
}: ReimbursementSummaryProps) {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-sm">Simulation Tiers Payant</h3>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Médicaments</span>
            <span className="font-medium">{totalAmount.toLocaleString()} DZD</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <div className="flex flex-col">
              <span className="text-emerald-600 font-medium">Pris en charge CNAS</span>
              <span className="text-[10px] text-emerald-600/70 uppercase font-bold tracking-wider">
                Taux: {rate}% ({category})
              </span>
            </div>
            <span className="text-emerald-600 font-bold">-{reimbursedAmount.toLocaleString()} DZD</span>
          </div>

          <div className="pt-2 border-t border-primary/10 flex justify-between items-center">
            <span className="font-bold">Reste à charge</span>
            <span className="text-lg font-black text-primary">{remainingAmount.toLocaleString()} DZD</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 p-3 bg-secondary/30 rounded-xl">
        <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-[10px] text-muted-foreground leading-relaxed italic">
          {CNAS_DISCLAIMER}
        </p>
      </div>
    </div>
  );
}
