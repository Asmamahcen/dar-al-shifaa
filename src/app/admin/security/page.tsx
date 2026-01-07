"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Database,
  Download,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FileJson,
  HardDrive,
  Lock,
  Eye,
  Activity,
  Server,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { useAppStore } from "@/lib/store";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";

interface Backup {
  id: string;
  backup_type: string;
  tables_included: string[];
  file_url: string | null;
  file_size_bytes: number | null;
  status: string;
  created_at: string;
  completed_at: string | null;
}

interface SecurityStats {
  totalTables: number;
  tablesWithRLS: number;
  totalIndexes: number;
  auditLogsCount: number;
  securityEventsCount: number;
}

export default function AdminSecurityPage() {
  const { user } = useAppStore();
  const [backups, setBackups] = useState<Backup[]>([]);
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [backingUp, setBackingUp] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (user?.role === "creator") {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);

    const { data: backupData } = await supabase
      .from("data_backups")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    setBackups(backupData || []);

    const { count: auditCount } = await supabase
      .from("audit_logs")
      .select("*", { count: "exact", head: true });

    const { count: securityCount } = await supabase
      .from("security_events")
      .select("*", { count: "exact", head: true });

    setStats({
      totalTables: 33,
      tablesWithRLS: 31,
      totalIndexes: 45,
      auditLogsCount: auditCount || 0,
      securityEventsCount: securityCount || 0,
    });

    setLoading(false);
  };

  const handleBackup = async () => {
    setBackingUp(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch("/api/admin/backup", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session?.access_token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Sauvegarde réussie! ${data.tablesBackedUp} tables sauvegardées`);
        fetchData();
      } else {
        toast.error(data.error || "Erreur lors de la sauvegarde");
      }
    } catch {
      toast.error("Erreur de connexion");
    }
    setBackingUp(false);
  };

  const formatBytes = (bytes: number | null) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
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
                <Shield className="w-8 h-8" />
                Sécurité & Sauvegardes
              </h1>
              <p className="text-muted-foreground">
                Gérez la sécurité de la base de données et les sauvegardes
              </p>
            </div>
            <Button
              onClick={handleBackup}
              disabled={backingUp}
              className="mt-4 md:mt-0 bg-gradient-to-r from-emerald-500 to-green-600"
            >
              {backingUp ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Database className="w-4 h-4 mr-2" />
              )}
              Nouvelle Sauvegarde
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <Card className="glass-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Server className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-black">{stats?.totalTables}</p>
                        <p className="text-xs text-muted-foreground">Tables</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <Lock className="w-6 h-6 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-black">{stats?.tablesWithRLS}</p>
                        <p className="text-xs text-muted-foreground">RLS Activé</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <Activity className="w-6 h-6 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-black">{stats?.totalIndexes}</p>
                        <p className="text-xs text-muted-foreground">Index</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
                        <Eye className="w-6 h-6 text-violet-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-black">{stats?.auditLogsCount}</p>
                        <p className="text-xs text-muted-foreground">Audit Logs</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-black">{stats?.securityEventsCount}</p>
                        <p className="text-xs text-muted-foreground">Alertes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-emerald-500" />
                      État de la Sécurité
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span>Row Level Security (RLS)</span>
                      </div>
                      <Badge className="bg-emerald-500">Activé</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span>Validation des données</span>
                      </div>
                      <Badge className="bg-emerald-500">Activé</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span>Logs d'audit</span>
                      </div>
                      <Badge className="bg-emerald-500">Activé</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span>Indexes optimisés</span>
                      </div>
                      <Badge className="bg-emerald-500">45 index</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-blue-500" />
                        <span>Sauvegardes automatiques</span>
                      </div>
                      <Badge className="bg-blue-500">Supabase</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HardDrive className="w-5 h-5 text-primary" />
                      Historique des Sauvegardes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {backups.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Aucune sauvegarde manuelle</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {backups.map((backup) => (
                          <div
                            key={backup.id}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                backup.status === "completed"
                                  ? "bg-emerald-500/10"
                                  : backup.status === "in_progress"
                                  ? "bg-amber-500/10"
                                  : "bg-red-500/10"
                              }`}>
                                {backup.status === "completed" ? (
                                  <FileJson className="w-5 h-5 text-emerald-500" />
                                ) : backup.status === "in_progress" ? (
                                  <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                                ) : (
                                  <AlertTriangle className="w-5 h-5 text-red-500" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-sm">
                                  {backup.tables_included.length} tables
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(backup.created_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {formatBytes(backup.file_size_bytes)}
                              </span>
                              {backup.file_url && (
                                <a href={backup.file_url} target="_blank" rel="noopener noreferrer">
                                  <Button size="sm" variant="ghost">
                                    <Download className="w-4 h-4" />
                                  </Button>
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
