"use client";

import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CNASStatusBadgeProps {
  status: 'active' | 'pending' | 'invalid';
  className?: string;
}

export function CNASStatusBadge({ status, className }: CNASStatusBadgeProps) {
  const configs = {
    active: {
      label: "CNAS actif",
      icon: CheckCircle2,
      color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    },
    pending: {
      label: "CNAS à confirmer",
      icon: AlertTriangle,
      color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    },
    invalid: {
      label: "CNAS invalide",
      icon: XCircle,
      color: "bg-red-500/10 text-red-500 border-red-500/20",
    }
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn("gap-1.5 py-1 px-3 font-medium", config.color, className)}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </Badge>
  );
}
