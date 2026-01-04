import { createClient } from './supabase';

export interface CNASStatus {
  isInsured: boolean;
  nss: string;
  fullName: string;
  validityDate: string;
  status: 'active' | 'pending' | 'invalid';
  isChronic: boolean;
  nssFormatValid: boolean;
}

export interface ReimbursementResult {
  totalAmount: number;
  reimbursedAmount: number;
  remainingAmount: number;
  rate: number;
  category: string;
}

/**
 * Validates Algerian Social Security Number (NSS) format
 * Format: 10 digits (YY MM SS WW NNN C) or similar variants
 */
export function validateNSS(nss: string): boolean {
  const regex = /^\d{10,12}$/;
  return regex.test(nss.replace(/\s/g, ''));
}

/**
 * Simulates CNAS/CASNOS reimbursement calculation
 */
export async function calculateReimbursement(
  medications: { publicPrice: number; isReimbursable: boolean }[],
  userCategory: string = 'Standard'
): Promise<ReimbursementResult> {
  const supabase = createClient();
  
  const { data: rules } = await supabase
    .from('cnas_reimbursement_rules')
    .select('*')
    .eq('category', userCategory)
    .single();

  const rate = rules ? rules.rate : 80;
  
  let totalAmount = 0;
  let reimbursedAmount = 0;

  medications.forEach(med => {
    totalAmount += med.publicPrice;
    if (med.isReimbursable) {
      reimbursedAmount += (med.publicPrice * rate) / 100;
    }
  });

  return {
    totalAmount,
    reimbursedAmount,
    remainingAmount: totalAmount - reimbursedAmount,
    rate,
    category: userCategory
  };
}

/**
 * Generates an internal secure hash for CHIFA QR
 */
export function generateCHIFAHash(nss: string, status: string): string {
  const timestamp = Date.now();
  // Simplified hash for demonstration
  return btoa(`${nss}|${status}|${timestamp}`).slice(0, 32);
}

export const CNAS_DISCLAIMER = "Ce service est une assistance numérique basée sur les documents fournis par l’assuré. Il ne remplace pas les systèmes officiels de la CNAS.";
