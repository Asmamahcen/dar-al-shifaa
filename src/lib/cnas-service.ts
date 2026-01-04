import { createClient } from "@supabase/supabase-js";

export const CNAS_CATEGORIES = {
  ESSENTIAL: "Essentiel",
  CHRONIC: "Chronique",
  COMFORT: "Confort",
};

export const CNAS_RATES = {
  [CNAS_CATEGORIES.ESSENTIAL]: 0.8,
  [CNAS_CATEGORIES.CHRONIC]: 1.0,
  [CNAS_CATEGORIES.COMFORT]: 0.0,
};

export interface CnasStatus {
  nss: string;
  fullName: string;
  validityDate: string;
  status: "active" | "to_confirm" | "invalid";
  isChronic: boolean;
  hasConsented: boolean;
}

export function validateNSS(nss: string): boolean {
  // Algerian NSS format: 10 or 12 digits usually
  const nssRegex = /^\d{10,12}$/;
  return nssRegex.test(nss);
}

export function calculateReimbursement(
  price: number,
  category: string,
  isChronic: boolean
): { cnasShare: number; patientShare: number; rate: number } {
  let rate = CNAS_RATES[category] || 0.8;
  
  if (isChronic) {
    rate = 1.0;
  }

  const cnasShare = price * rate;
  const patientShare = price - cnasShare;

  return { cnasShare, patientShare, rate };
}

export function generateCnasQrHash(nss: string, status: string): string {
  const timestamp = Date.now();
  return btoa(`${nss}|${status}|${timestamp}`);
}

export function getLegalDisclaimer(language: string): string {
  if (language === "ar") {
    return "هذه الخدمة هي مساعدة رقمية بناءً على المستندات المقدمة من المؤمن له. ولا تحل محل الأنظمة الرسمية للصندوق الوطني للتأمينات الاجتماعية (CNAS).";
  }
  if (language === "en") {
    return "This service is a digital assistance based on the documents provided by the insured. It does not replace the official systems of CNAS.";
  }
  return "Ce service est une assistance numérique basée sur les documents fournis par l'assuré. Il ne remplace pas les systèmes officiels de la CNAS.";
}
