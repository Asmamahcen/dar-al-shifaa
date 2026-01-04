import type { Metadata } from "next";
import "./globals.css";
import { VisualEditsMessenger } from "orchids-visual-edits";
import { Toaster } from "sonner";
import { StoreInitializer } from "@/components/StoreInitializer";
import { Chatbot } from "@/components/Chatbot";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "DAR AL-SHIFAA | منصة الصحة الجزائرية",
  description: "Plateforme complète de gestion pharmaceutique et de santé en Algérie - Your Complete Health Platform in Algeria",
  keywords: ["pharmacy", "health", "Algeria", "CHIFA", "CNAS", "medicines", "صيدلية", "صحة", "الجزائر"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
        <body className="antialiased min-h-screen">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <StoreInitializer />
            {children}
            <Chatbot />
            <Toaster position="top-center" richColors />
          </ThemeProvider>

        <VisualEditsMessenger />
      </body>
    </html>
  );
}
