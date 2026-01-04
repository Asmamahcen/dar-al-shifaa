import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      email, 
      password, 
      fullName, 
      phone, 
      role, 
      wilaya, 
      city, 
      address,
      birthDate,
      nationalIdNumber,
      cnasNumber,
      specialty,
      yearsExperience,
      orderNumber,
      orderWilaya,
      licenseNumber,
      agrementNumber,
      establishmentName,
      establishmentAddress,
      commercialRegisterNumber,
      taxId,
      cnasEmployerNumber,
      emergencyContactName,
      emergencyContactPhone,
      idCardFrontUrl,
      idCardBackUrl,
      diplomaUrl,
      licenseDocumentUrl,
      cnasAttestationUrl,
      commercialRegisterUrl,
      employerAttestationUrl,
      verificationStatus,
    } = body;

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    let establishmentId = null;

    if (role === "pharmacy") {
      const { data: pharmData, error: pharmError } = await supabaseAdmin.from("pharmacies").insert({
        name: establishmentName || fullName,
        owner_id: authData.user.id,
        wilaya,
        city,
        address: establishmentAddress || address,
        phone,
        email,
        is_open_24h: false,
        has_delivery: false,
        plan: "free",
        verified: false,
      }).select().single();
      
      if (!pharmError && pharmData) {
        establishmentId = pharmData.id;
      }
    } else if (role === "factory") {
      const { data: factData, error: factError } = await supabaseAdmin.from("factories").insert({
        name: establishmentName || fullName,
        owner_id: authData.user.id,
        wilaya,
        city,
        address: establishmentAddress || address,
        phone,
        email,
      }).select().single();

      if (!factError && factData) {
        establishmentId = factData.id;
      }
    }

    const requiresVerification = ["doctor", "pharmacy", "factory", "school", "trainer", "creator"].includes(role);

    const { error: insertError } = await supabaseAdmin.from("users").insert({
      id: authData.user.id,
      email,
      full_name: fullName,
      phone,
      role,
      plan: "free",
      wilaya,
      city,
      address,
      verified: false,
      is_approved: !requiresVerification,
      pharmacy_id: role === "pharmacy" ? establishmentId : null,
      factory_id: role === "factory" ? establishmentId : null,
      birth_date: birthDate || null,
      national_id_number: nationalIdNumber || null,
      cnas_number: cnasNumber || null,
      specialty: specialty || null,
      years_experience: yearsExperience || null,
      order_number: orderNumber || null,
      order_wilaya: orderWilaya || null,
      license_number: licenseNumber || null,
      agrément_number: agrementNumber || null,
      establishment_name: establishmentName || null,
      establishment_address: establishmentAddress || null,
      commercial_register_number: commercialRegisterNumber || null,
      tax_id: taxId || null,
      cnas_employer_number: cnasEmployerNumber || null,
      emergency_contact_name: emergencyContactName || null,
      emergency_contact_phone: emergencyContactPhone || null,
      id_card_front_url: idCardFrontUrl || null,
      id_card_back_url: idCardBackUrl || null,
      diploma_url: diplomaUrl || null,
      license_document_url: licenseDocumentUrl || null,
      cnas_attestation_url: cnasAttestationUrl || null,
      commercial_register_url: commercialRegisterUrl || null,
      employer_attestation_url: employerAttestationUrl || null,
      verification_status: requiresVerification ? "pending" : "approved",
      submission_date: new Date().toISOString(),
    });

    if (insertError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    return NextResponse.json({ 
      user: authData.user,
      establishmentId,
      requiresVerification,
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
