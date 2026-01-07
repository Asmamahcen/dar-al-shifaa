import { NextResponse } from "next/server";
import Tesseract from "tesseract.js";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Utilisation de Tesseract.js pour l'OCR (Français + Arabe)
    const { data: { text } } = await Tesseract.recognize(buffer, 'fra+ara');

    // Extraction basique des médicaments (on prend les premières lignes significatives)
    const lines = text.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 3 && !l.toLowerCase().includes('docteur') && !l.toLowerCase().includes('patient'));
    
    const medicines = lines.slice(0, 3).map(line => ({
      name: line,
      dosage: "Vérifier l'ordonnance",
      duration: "Selon prescription",
      confidence: 90
    }));

    const analysis = {
      medicines: medicines.length > 0 ? medicines : [{ name: "Médicament non détecté", dosage: "-", duration: "-", confidence: 50 }],
      instructions: text.length > 10 ? text : "Veuillez lire attentivement l'ordonnance originale."
    };

    return NextResponse.json({ analysis });
  } catch (error: any) {
    console.error("OCR Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
