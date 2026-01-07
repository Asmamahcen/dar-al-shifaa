"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pill, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlgerianMedicine {
  id: string;
  registration_number: string;
  brand_name: string;
  brand_name_ar: string;
  dci: string;
  dci_ar: string;
  dosage: string;
  form: string;
  form_ar: string;
  conditioning: string;
  laboratory: string;
  country: string;
  is_reimbursable: boolean;
  reimbursement_rate: number;
  price_public: number;
  therapeutic_class: string;
  therapeutic_class_ar: string;
  is_generic: boolean;
}

interface MedicineAutocompleteProps {
  value: string;
  onChange: (value: string, medicine?: AlgerianMedicine) => void;
  onSelectMedicine?: (medicine: AlgerianMedicine) => void;
  placeholder?: string;
  className?: string;
  language?: "fr" | "ar" | "en";
}

export function MedicineAutocomplete({
  value,
  onChange,
  onSelectMedicine,
  placeholder = "Rechercher un médicament...",
  className,
  language = "fr",
}: MedicineAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AlgerianMedicine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const searchMedicines = async () => {
      if (value.length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/medicines/search?q=${encodeURIComponent(value)}&limit=10`);
        const data = await res.json();
        setSuggestions(data.medicines || []);
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch (err) {
        console.error("Medicine search error:", err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchMedicines, 300);
    return () => clearTimeout(debounce);
  }, [value]);

  const handleSelect = (medicine: AlgerianMedicine) => {
    const displayName = language === "ar" && medicine.brand_name_ar 
      ? `${medicine.brand_name_ar} (${medicine.brand_name})` 
      : `${medicine.brand_name} ${medicine.dosage}`;
    onChange(displayName, medicine);
    onSelectMedicine?.(medicine);
    setIsOpen(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => value.length >= 2 && suggestions.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn("pr-10", className)}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-xl shadow-xl max-h-80 overflow-y-auto">
          {suggestions.map((med, index) => (
            <div
              key={med.id}
              onClick={() => handleSelect(med)}
              className={cn(
                "p-3 cursor-pointer border-b last:border-b-0 hover:bg-primary/5 transition-colors",
                selectedIndex === index && "bg-primary/10"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Pill className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="font-bold text-sm truncate">{med.brand_name}</span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {med.dosage}
                    </Badge>
                  </div>
                  {med.brand_name_ar && (
                    <p className="text-xs text-muted-foreground mt-0.5 mr-6" dir="rtl">
                      {med.brand_name_ar}
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-1">
                    <span className="font-semibold">DCI:</span> {med.dci} • {med.form}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {med.laboratory} ({med.country})
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-black text-primary text-sm">{med.price_public} DA</p>
                  <div className="flex gap-1 mt-1 justify-end">
                    {med.is_reimbursable && (
                      <Badge className="bg-green-500 text-white text-[8px] px-1 py-0">
                        CNAS {med.reimbursement_rate}%
                      </Badge>
                    )}
                    {med.is_generic && (
                      <Badge variant="outline" className="text-[8px] px-1 py-0 border-blue-500 text-blue-500">
                        Générique
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-1 flex items-center gap-1">
                <Badge variant="outline" className="text-[8px] px-1 py-0">
                  {med.therapeutic_class}
                </Badge>
              </div>
            </div>
          ))}
          <div className="p-2 bg-secondary/10 text-center">
            <p className="text-[10px] text-muted-foreground italic">
              Base de données des médicaments algériens • LNCPP
            </p>
          </div>
        </div>
      )}

      {isOpen && value.length >= 2 && suggestions.length === 0 && !loading && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-xl shadow-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Aucun médicament trouvé. Vous pouvez entrer le nom manuellement.
          </p>
        </div>
      )}
    </div>
  );
}
