import { createClient } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetId = searchParams.get("targetId");
  const targetType = searchParams.get("targetType");

  const supabase = await createClient();

  let query = supabase
    .from("reviews")
    .select(`
      *,
      users (
        full_name
      )
    `)
    .order("created_at", { ascending: false });

  if (targetId) {
    query = query.eq("target_id", targetId);
  }
  if (targetType) {
    query = query.eq("target_type", targetType);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { targetId, targetType, rating, comment } = await request.json();

  if (!targetId || !targetType || !rating) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      reviewer_id: user.id,
      target_id: targetId,
      target_type: targetType,
      rating,
      comment,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
