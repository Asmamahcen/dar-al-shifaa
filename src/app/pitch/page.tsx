"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Video, Monitor, X, Settings
} from "lucide-react";
import { useAppStore } from "@/lib/store";

const scriptSteps = [];

export default function PitchPage() {
  const { language } = useAppStore();
  const [showTeleprompter, setShowTeleprompter] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(2);
  const teleprompterRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showTeleprompter && isScrolling && teleprompterRef.current) {
      interval = setInterval(() => {
        if (teleprompterRef.current) {
          teleprompterRef.current.scrollTop += scrollSpeed;
        }
      }, 50);
    }
    return () => clearInterval(interval);
  }, [showTeleprompter, isScrolling, scrollSpeed]);

  return (
    <div className="min-h-screen bg-background">
      <div className="no-print">
        <Navbar />
      </div>
      
      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/30 no-print">
            <Video className="w-4 h-4 mr-2" />
            Pitch Masterclass
          </Badge>
          <h1 className="text-4xl font-bold mb-4">Votre Pitch Vidéo Dar Al-Shifaa</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto no-print">
            Regardez la présentation officielle de Dar Al-Shifaa.
          </p>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-12 glass-card overflow-hidden aspect-video relative group border-2 border-primary/20"
            >
                <video 
                  controls 
                  className="w-full h-full object-cover"
                  poster="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/image-1766707620528.png"
                >
                  <source src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/18f5819c-e84c-4e19-9886-c1c5a7ff2b4b/dar_al_shifa_pitch_video-1767803401231.mp4" type="video/mp4" />
                  {language === "ar" ? "متصفحك لا يدعم تشغيل الفيديو" : "Your browser does not support the video tag."}
                </video>
            </motion.div>
        </motion.div>
      </main>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          .glass-card { 
            background: white !important; 
            border: 1px solid #eee !important;
            box-shadow: none !important;
            break-inside: avoid;
            margin-bottom: 2rem;
          }
          body { background: white !important; }
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

