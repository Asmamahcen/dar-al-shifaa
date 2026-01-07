import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CRITICAL_TABLES = [
  "users",
  "prescriptions", 
  "medical_dossiers",
  "orders",
  "baridimob_payments",
  "appointments",
  "verification_documents",
  "cnas_documents",
  "cnas_status",
];

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { data: userData } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userData?.role !== "creator") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { data: backup, error: backupError } = await supabaseAdmin
      .from("data_backups")
      .insert({
        backup_type: "manual",
        tables_included: CRITICAL_TABLES,
        status: "in_progress",
        created_by: user.id,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (backupError) throw backupError;

    const backupData: Record<string, unknown[]> = {};
    
    for (const table of CRITICAL_TABLES) {
      const { data, error } = await supabaseAdmin.from(table).select("*");
      if (!error && data) {
        backupData[table] = data;
      }
    }

    const backupJson = JSON.stringify(backupData, null, 2);
    const fileName = `backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("receipts")
      .upload(`backups/${fileName}`, new Blob([backupJson], { type: "application/json" }));

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from("receipts")
      .getPublicUrl(`backups/${fileName}`);

    await supabaseAdmin
      .from("data_backups")
      .update({
        status: "completed",
        file_url: publicUrl,
        file_size_bytes: backupJson.length,
        completed_at: new Date().toISOString(),
      })
      .eq("id", backup.id);

    await supabaseAdmin.from("audit_logs").insert({
      table_name: "data_backups",
      operation: "INSERT",
      record_id: backup.id,
      new_data: { backup_type: "manual", tables: CRITICAL_TABLES.length },
      user_id: user.id,
    });

    return NextResponse.json({
      success: true,
      backupId: backup.id,
      tablesBackedUp: CRITICAL_TABLES.length,
      fileUrl: publicUrl,
    });
  } catch (error) {
    console.error("Backup error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la sauvegarde" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { data: userData } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userData?.role !== "creator") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { data: backups, error } = await supabaseAdmin
      .from("data_backups")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    return NextResponse.json({ backups });
  } catch (error) {
    console.error("Get backups error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des sauvegardes" },
      { status: 500 }
    );
  }
}
