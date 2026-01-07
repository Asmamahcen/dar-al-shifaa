"use client";

import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";

export function Footer() {
  const { language } = useAppStore();

  return (
    <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center mb-4">
              <img 
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/image-1766707620528.png?width=8000&height=8000&resize=contain" 
                alt="Logo" 
                className="h-24 w-auto" 
              />
            </div>
            <p className="text-sm text-muted-foreground">{t(language, "tagline")}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t(language, "features")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/medicines" className="hover:text-foreground transition-colors">{t(language, "medicines")}</Link></li>
              <li><Link href="/pharmacies" className="hover:text-foreground transition-colors">{t(language, "pharmacies")}</Link></li>
              <li><Link href="/training" className="hover:text-foreground transition-colors">{t(language, "training")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t(language, "about")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/pricing" className="hover:text-foreground transition-colors">{t(language, "pricing")}</Link></li>
              <li><Link href="/contact" className="hover:text-foreground transition-colors">{t(language, "contact")}</Link></li>
              <li><Link href="/pitch" className="hover:text-foreground transition-colors">{language === "ar" ? "عرض الفيديو" : "Video Pitch"}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t(language, "contact")}</h4>
            <p className="text-sm text-muted-foreground">Daralshifaa25@gmail.com</p>
            <p className="text-sm text-muted-foreground">0558536192</p>
            <p className="text-sm text-muted-foreground">Constantine, Algerie</p>
          </div>
        </div>
        <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
          © 2024 DAR AL-SHIFAA. {language === "ar" ? "جميع الحقوق محفوظة" : language === "en" ? "All rights reserved" : "Tous droits réservés"}.
        </div>
      </div>
    </footer>
  );
}
