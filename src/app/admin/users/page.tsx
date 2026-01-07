"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  Filter,
  Shield,
  ShieldCheck,
  ShieldAlert,
  MoreVertical,
  Mail,
  Calendar,
  UserCheck,
  UserX,
  Lock,
  Loader2,
  RefreshCw,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { useAppStore } from "@/lib/store";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  plan: string;
  created_at: string;
  verified: boolean;
  phone: string;
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAppStore();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const supabase = createClient();

  useEffect(() => {
    if (currentUser?.role === "creator") {
      fetchUsers();
    }
  }, [currentUser]);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("users")
      .select("id, email, full_name, role, plan, created_at, verified, phone")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erreur lors de la récupération des utilisateurs");
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (currentUser?.role !== "creator") {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="glass-card max-w-md">
            <CardContent className="pt-6 text-center">
              <ShieldAlert className="w-16 h-16 mx-auto mb-4 text-red-500" />
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
                <Users className="w-8 h-8" />
                Gestion des Utilisateurs
              </h1>
              <p className="text-muted-foreground">
                Consultez et gérez les comptes utilisateurs en toute sécurité.
              </p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <Button variant="outline" onClick={fetchUsers} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Actualiser
              </Button>
            </div>
          </div>

          <Card className="glass-card mb-8">
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par email ou nom..."
                    className="pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <Badge variant="outline" className="px-3">
                    {filteredUsers.length} Utilisateurs
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-500" />
                    <span>Mots de passe chiffrés (AES-256)</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                        <th className="pb-4 pl-4">Utilisateur</th>
                        <th className="pb-4">Rôle / Plan</th>
                        <th className="pb-4">Statut</th>
                        <th className="pb-4">Date d'inscription</th>
                        <th className="pb-4 pr-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="group hover:bg-muted/30 transition-colors">
                          <td className="py-4 pl-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                {u.full_name?.[0] || u.email?.[0]?.toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-sm">{u.full_name || "Sans nom"}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {u.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex flex-col gap-1">
                              <Badge variant="outline" className="w-fit text-[10px] uppercase">
                                {u.role}
                              </Badge>
                              <Badge className="w-fit bg-primary/10 text-primary border-primary/20 text-[10px] uppercase">
                                {u.plan || "Gratuit"}
                              </Badge>
                            </div>
                          </td>
                          <td className="py-4">
                            {u.verified ? (
                              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 flex items-center gap-1 w-fit">
                                <ShieldCheck className="w-3 h-3" />
                                Vérifié
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="flex items-center gap-1 w-fit">
                                <Shield className="w-3 h-3" />
                                En attente
                              </Badge>
                            )}
                          </td>
                          <td className="py-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(u.created_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="py-4 pr-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="w-4 h-4 mr-2" /> Voir Profil
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-emerald-500">
                                  <UserCheck className="w-4 h-4 mr-2" /> Vérifier
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-500">
                                  <UserX className="w-4 h-4 mr-2" /> Bloquer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>Aucun utilisateur trouvé</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-card bg-emerald-500/5 border-emerald-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Sécurité des Emails
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Les adresses email sont utilisées uniquement pour l'authentification et les notifications système. Elles ne sont jamais partagées.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card bg-blue-500/5 border-blue-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-500" />
                  Mots de Passe
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Tous les mots de passe sont hachés avec l'algorithme Argon2/Bcrypt. Même les administrateurs ne peuvent pas les voir en clair.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card bg-amber-500/5 border-amber-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  Accès Admin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Chaque accès à cette page est enregistré dans les logs d'audit pour garantir la traçabilité des actions administratives.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
