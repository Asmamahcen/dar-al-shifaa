"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Clock,
  CheckCircle,
  Play,
  Award,
  BookOpen,
  ChevronRight,
  Download,
  Star,
  Lock,
  Plus,
  Trash2,
  Edit,
  X,
  Video,
  FileBadge,
  Search,
  Building2,
  Phone,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/Navbar";
import { useAppStore, type Course, type TrainingEnrollment } from "@/lib/store";
import { t } from "@/lib/i18n";
import { toast } from "sonner";

export default function TrainingPage() {
  const { language, user, courses, userProgress, enrollments, schools, updateProgress, addCourse, addEnrollment, updateEnrollment, isHydrated } = useAppStore();
  const router = useRouter();
  
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWilaya, setSelectedWilaya] = useState("all");
  const [viewMode, setViewMode] = useState<'courses' | 'schools'>('courses');
  const [currentModule, setCurrentModule] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
    const [showCertificate, setShowCertificate] = useState(false);
    const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
    const [isPaymentInfoOpen, setIsPaymentInfoOpen] = useState(false);
    const [selectedCourseForPayment, setSelectedCourseForPayment] = useState<Course | null>(null);
    const [newCourse, setNewCourse] = useState({ title: "", description: "", price: 0, duration: "10 hours" });

  const filteredCourses = courses.filter(course => {
    const school = schools.find(s => s.ownerId === course.trainerId);
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (course.titleAr && course.titleAr.includes(searchTerm));
    const matchesWilaya = selectedWilaya === "all" || (school && school.wilaya === selectedWilaya);
    return matchesSearch && matchesWilaya;
  });

  const wilayas = [...new Set(schools.map(s => s.wilaya))];

  useEffect(() => {
    if (isHydrated && !user) {
        router.push("/login");
    }
  }, [user, isHydrated, router]);

  const getProgress = (courseId: string) => {
    const progress = userProgress[courseId];
    if (!progress) return 0;
    const course = courses.find(c => c.id === courseId);
    if (!course || !course.modules.length) return 0;
    return Math.round((progress.completed.length / course.modules.length) * 100);
  };

  const getEnrollmentStatus = (courseId: string) => {
      if (user?.role === 'trainer') return 'approved';
      return enrollments.find(e => e.courseId === courseId && e.userId === user?.id)?.status || 'none';
  };

    const handleStartCourse = async (course: Course) => {
      if (!user) return;
      const status = getEnrollmentStatus(course.id);
      
      if (status === 'none' && !course.isFree) {
          if (user.plan === "free" || user.plan === "premium") {
              toast.error(language === "ar" 
                ? "الدورات المدفوعة متاحة فقط للمشتركين في الخطة الاحترافية وما فوق." 
                : "Les formations payantes sont réservées aux membres Professional & Enterprise.");
              return;
          }
          // Show payment info
          setSelectedCourseForPayment(course);
          setIsPaymentInfoOpen(true);
          return;
      }

    if (status === 'pending') {
        toast.warning("Votre inscription est en attente de validation par le formateur.");
        return;
    }

    if (status === 'rejected') {
        toast.error("Votre inscription a été refusée.");
        return;
    }

    if (course.modules.length === 0) {
        toast.info("Ce cours n'a pas encore de modules.");
        return;
    }
    setSelectedCourse(course);
    setCurrentModule(0);
  };

  const handleCompleteModule = () => {
    if (!selectedCourse) return;
    const module = selectedCourse.modules[currentModule];
    if (module.quiz && module.quiz.length > 0) {
      setShowQuiz(true);
    } else {
      updateProgress(selectedCourse.id, currentModule);
      if (currentModule < selectedCourse.modules.length - 1) {
        setCurrentModule(currentModule + 1);
      } else {
        toast.success("Cours terminé !");
        setShowCertificate(true);
        const enrollment = enrollments.find(e => e.courseId === selectedCourse.id && e.userId === user?.id);
        if (enrollment) updateEnrollment(enrollment.id, { status: 'completed' });
      }
    }
  };

  const handleSubmitQuiz = () => {
    if (!selectedCourse) return;
    const module = selectedCourse.modules[currentModule];
    if (!module.quiz) return;

    let correct = 0;
    module.quiz.forEach((q, i) => { if (quizAnswers[i] === q.correctAnswer) correct++; });

    const score = Math.round((correct / module.quiz.length) * 100);
    updateProgress(selectedCourse.id, currentModule, score);
    setShowQuiz(false);
    setQuizAnswers({});

    if (score >= 70) {
      toast.success(`Félicitations ! Score: ${score}%`);
      if (currentModule < selectedCourse.modules.length - 1) setCurrentModule(currentModule + 1);
      else {
          setShowCertificate(true);
          const enrollment = enrollments.find(e => e.courseId === selectedCourse.id && e.userId === user?.id);
          if (enrollment) updateEnrollment(enrollment.id, { status: 'completed' });
      }
    } else {
      toast.error(`Échec. Score: ${score}%. Réessayez !`);
    }
  };

  if (!isHydrated) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h1 className="text-4xl font-black mb-2 italic uppercase">Campus Dar Al-Shifaa</h1>
                <p className="text-muted-foreground font-medium">Expertise pharmaceutique et médicale pour les professionnels algériens</p>
                
                {(user?.role === 'trainer' || user?.role === 'school') && !user.schoolId && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-medium">
                        {language === "ar" 
                          ? "هل أنت مؤسسة تعليمية؟ سجل مركزك ليظهر هنا." 
                          : "Vous êtes une école ? Enregistrez votre centre pour apparaître ici."}
                      </p>
                    </div>
                    <Button size="sm" className="rounded-full font-bold uppercase italic" asChild>
                      <Link href="/dashboard">S'enregistrer maintenant</Link>
                    </Button>
                  </motion.div>
                )}
              </div>
            <div className="flex gap-2">
              <div className="bg-secondary/50 p-1 rounded-full flex">
                <Button 
                  variant={viewMode === 'courses' ? 'default' : 'ghost'} 
                  size="sm" 
                  className="rounded-full font-bold uppercase text-[10px] italic"
                  onClick={() => setViewMode('courses')}
                >
                  Formations
                </Button>
                <Button 
                  variant={viewMode === 'schools' ? 'default' : 'ghost'} 
                  size="sm" 
                  className="rounded-full font-bold uppercase text-[10px] italic"
                  onClick={() => setViewMode('schools')}
                >
                  Écoles & Centres
                </Button>
              </div>
              {user?.role === 'trainer' && (
                <Button onClick={() => setIsAddCourseOpen(true)} className="rounded-full h-10 px-6 shadow-xl">
                  <Plus className="w-4 h-4 mr-2" /> Créer Formation
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder={viewMode === 'courses' ? "Rechercher une formation..." : "Rechercher une école..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 rounded-2xl"
              />
            </div>
            <Select value={selectedWilaya} onValueChange={setSelectedWilaya}>
              <SelectTrigger className="w-full md:w-64 h-12 rounded-2xl">
                <MapPin className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Toutes wilayas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes wilayas</SelectItem>
                {wilayas.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

        {!selectedCourse ? (
          viewMode === 'courses' ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course, i) => {
                const progress = getProgress(course.id);
                const status = getEnrollmentStatus(course.id);
                const school = schools.find(s => s.ownerId === course.trainerId);
                return (
                  <motion.div key={course.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-6 flex flex-col group border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:shadow-primary/5 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all transform group-hover:rotate-6">
                        <GraduationCap className="w-7 h-7" />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                          <Badge variant={course.isFree ? "default" : "outline"} className="rounded-full px-4">{course.isFree ? "Gratuit" : `${course.price} DA`}</Badge>
                          {status !== 'none' && <Badge className="text-[10px] uppercase font-black" variant="secondary">{status}</Badge>}
                      </div>
                    </div>
                    <h3 className="text-xl font-black italic mb-1 tracking-tight">{language === "ar" ? course.titleAr : course.title}</h3>
                    {school && <p className="text-[10px] font-bold text-primary uppercase italic mb-4">{school.name} • {school.wilaya}</p>}
                    <p className="text-sm text-muted-foreground mb-6 line-clamp-2 font-medium">{language === "ar" ? course.descriptionAr : course.description}</p>
                    
                    <div className="flex items-center gap-4 mb-6 text-[10px] uppercase font-black text-muted-foreground mt-auto border-t pt-4 border-dashed">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-primary" /> {course.duration}</span>
                      <span className="flex items-center gap-1"><BookOpen className="w-3 h-3 text-primary" /> {course.modules.length} Modules</span>
                    </div>
                    
                    {progress > 0 && <div className="mb-4"><Progress value={progress} className="h-2 rounded-full mb-2 shadow-inner" /><p className="text-[10px] font-black text-right tracking-widest">{progress}% COMPLÉTÉ</p></div>}
                    
                    <Button className="w-full rounded-xl h-12 font-black uppercase italic tracking-widest transition-all" variant={status === 'approved' ? 'default' : 'outline'} onClick={() => handleStartCourse(course)}>
                        {status === 'none' ? (course.isFree ? "Commencer" : "S'inscrire") : status === 'pending' ? "En attente..." : status === 'approved' ? "Continuer" : "Terminé"}
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {schools.filter(s => selectedWilaya === 'all' || s.wilaya === selectedWilaya).map((school, i) => (
                <motion.div key={school.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-6 border-t-4 border-primary">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
                      <Building2 className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black italic uppercase tracking-tighter">{school.name}</h3>
                      <p className="text-xs font-bold text-muted-foreground">{school.wilaya}, {school.city}</p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-6 text-sm font-medium opacity-70">
                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {school.address}</div>
                    <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {school.phone}</div>
                    <div className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-500" /> {courses.filter(c => c.trainerId === school.ownerId).length} Formations actives</div>
                  </div>
                  <Button className="w-full rounded-full font-black uppercase italic" variant="outline" onClick={() => {
                    setSearchTerm("");
                    setSelectedWilaya(school.wilaya);
                    setViewMode('courses');
                  }}>
                    Voir les formations
                  </Button>
                </motion.div>
              ))}
            </div>
          )
        ) : (
          <div className="grid lg:grid-cols-4 gap-8 animate-in fade-in duration-500">
            <div className="lg:col-span-1">
              <div className="glass-card p-6 sticky top-24 rounded-[32px] border-none shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white"><BookOpen className="w-5 h-5" /></div>
                    <h3 className="font-black italic text-lg uppercase tracking-tighter">Sommaire</h3>
                </div>
                <div className="space-y-3">
                  {selectedCourse.modules.map((module, i) => (
                    <button key={module.id} onClick={() => setCurrentModule(i)} className={`w-full p-4 rounded-2xl text-left flex items-center gap-3 transition-all ${i === currentModule ? "bg-primary text-white shadow-xl shadow-primary/20 scale-105" : "hover:bg-secondary/50"}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${userProgress[selectedCourse.id]?.completed.includes(i) ? "bg-green-500 text-white" : i === currentModule ? "bg-white text-primary" : "bg-secondary text-muted-foreground"}`}>
                        {userProgress[selectedCourse.id]?.completed.includes(i) ? <CheckCircle className="w-5 h-5" /> : i + 1}
                      </div>
                      <span className="text-sm font-bold truncate tracking-tight">{module.title}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-8 pt-6 border-t border-dashed">
                    <Button variant="ghost" className="w-full text-muted-foreground font-black uppercase text-xs tracking-widest" onClick={() => setSelectedCourse(null)}><X className="w-4 h-4 mr-2" /> Quitter le cours</Button>
                </div>
              </div>
            </div>
            <div className="lg:col-span-3 space-y-6">
                <div className="glass-card p-10 rounded-[40px] border-none shadow-2xl min-h-[600px] flex flex-col">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <Badge className="mb-2 bg-primary/20 text-primary uppercase font-black px-4 h-8 rounded-full">Module {currentModule + 1}</Badge>
                          <h2 className="text-4xl font-black italic tracking-tighter">{selectedCourse.modules[currentModule].title}</h2>
                          </div>
                            <Button 
                              variant="outline" 
                              size="lg" 
                              className={`rounded-full h-14 w-14 shadow-lg transition-all ${selectedCourse.zoomUrl ? "bg-sky-500 text-white border-sky-500 animate-bounce ring-4 ring-sky-300" : ""}`}
                              onClick={() => {
                                  if (selectedCourse.zoomUrl) {
                                      window.open(selectedCourse.zoomUrl, '_blank');
                                      toast.success("Ouverture de la session Zoom Direct...");
                                  } else {
                                      toast.info("Aucune session Zoom active pour le moment.");
                                  }
                              }}
                            >
                              <Video className={`w-6 h-6 ${selectedCourse.zoomUrl ? "animate-pulse" : ""}`} />
                            </Button>

                      </div>
                    
                    <div className="prose prose-invert max-w-none text-muted-foreground font-medium text-lg leading-relaxed mb-12 flex-1">
                        {selectedCourse.modules[currentModule].content}
                    </div>

                    {selectedCourse.modules[currentModule].videoUrl && (
                        <div className="aspect-video bg-black/40 rounded-[32px] flex flex-col items-center justify-center mb-12 border-4 border-white/5 group hover:border-primary/20 transition-all cursor-pointer relative overflow-hidden shadow-2xl">
                             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160550-2173bdb999ef?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20 group-hover:scale-110 transition-transform duration-700"></div>
                             <Button size="lg" className="rounded-full h-24 w-24 shadow-2xl z-10 scale-110 group-hover:scale-125 transition-transform"><Play className="w-10 h-10 ml-1" /></Button>
                             <p className="mt-4 font-black uppercase tracking-widest text-white/50 z-10 text-xs">Regarder la session enregistrée</p>
                        </div>
                    )}

                    <div className="flex justify-between items-center pt-8 border-t border-dashed mt-auto">
                        <div className="flex gap-2">
                           <Button variant="outline" className="rounded-full h-12" onClick={() => setCurrentModule(Math.max(0, currentModule - 1))} disabled={currentModule === 0}>Précédent</Button>
                        </div>
                        <Button className="rounded-full h-14 px-10 font-black shadow-2xl hover:scale-105 active:scale-95 transition-all" onClick={handleCompleteModule}>
                            {selectedCourse.modules[currentModule].quiz ? "Passer l'évaluation" : "Terminer le module"} <ChevronRight className="w-5 h-5 ml-2" />
                        </Button>
                    </div>
                </div>
            </div>
          </div>
        )}

        <Dialog open={showQuiz} onOpenChange={setShowQuiz}><DialogContent className="max-w-2xl rounded-[40px] p-10"><DialogHeader><DialogTitle className="text-2xl font-black italic uppercase text-primary">Évaluation de validation</DialogTitle></DialogHeader>
            {selectedCourse && selectedCourse.modules[currentModule].quiz && (
                <div className="space-y-8 pt-6">
                    {selectedCourse.modules[currentModule].quiz.map((q, i) => (
                        <div key={i} className="space-y-4 p-6 bg-secondary/20 rounded-[24px]">
                            <p className="font-black text-lg tracking-tight italic">{i + 1}. {q.question}</p>
                            <RadioGroup value={quizAnswers[i]?.toString()} onValueChange={(v) => setQuizAnswers({ ...quizAnswers, [i]: parseInt(v) })} className="grid gap-3">
                                {q.options.map((opt, j) => (
                                    <div key={j} className={`flex items-center space-x-3 p-4 rounded-xl transition-all border ${quizAnswers[i] === j ? "bg-primary text-white border-primary shadow-lg" : "bg-white/5 border-white/10 hover:bg-white/10"}`}>
                                        <RadioGroupItem value={j.toString()} id={`q${i}-o${j}`} className="hidden" />
                                        <Label htmlFor={`q${i}-o${j}`} className="text-md font-bold cursor-pointer flex-1">{opt}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                    ))}
                    <Button className="w-full h-16 rounded-full text-xl font-black shadow-2xl" onClick={handleSubmitQuiz}>Soumettre mes réponses</Button>
                </div>
            )}
        </DialogContent></Dialog>

        <Dialog open={showCertificate} onOpenChange={setShowCertificate}><DialogContent className="max-w-3xl rounded-[50px] p-0 overflow-hidden border-none shadow-[0_0_100px_rgba(0,0,0,0.5)]">
            <div className="bg-gradient-to-br from-[#1a1c2c] to-[#4a192c] p-12 text-center text-white relative">
                <div className="absolute top-10 left-10 opacity-20 w-32 h-32 border-8 border-white rounded-full"></div>
                <div className="absolute bottom-10 right-10 opacity-20 w-32 h-32 border-8 border-white rounded-full"></div>
                
                <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-yellow-400 flex items-center justify-center text-[#1a1c2c] shadow-[0_0_50px_rgba(251,191,36,0.5)]"><Award className="w-12 h-12" /></div>
                
                <h2 className="text-4xl font-black italic tracking-tighter mb-4">DIPLÔME DE RÉUSSITE</h2>
                <p className="text-white/60 font-bold uppercase tracking-[1em] text-[10px] mb-12">Dar Al-Shifaa Academy • Algérie</p>
                
                <div className="border-2 border-white/20 p-10 bg-white/5 rounded-3xl backdrop-blur-md mb-12">
                    <p className="text-sm font-medium text-white/50 mb-4">Ce certificat est fièrement décerné à</p>
                    <h3 className="text-5xl font-black italic text-yellow-400 mb-6 font-serif">{user?.fullName}</h3>
                    <p className="text-white/50 font-medium mb-12">Pour avoir complété avec succès et brio la formation de</p>
                    <h4 className="text-2xl font-black italic uppercase tracking-widest">{selectedCourse?.title}</h4>
                </div>
                
                <div className="flex justify-between items-end px-10">
                    <div className="text-left"><p className="text-[10px] font-black uppercase opacity-50">Date d'obtention</p><p className="font-bold">{new Date().toLocaleDateString()}</p></div>
                    <div className="flex gap-4">
                        <Button className="rounded-full bg-white text-black font-black uppercase tracking-widest px-8" onClick={() => toast.success("Certificat archivé")}>Télécharger PDF</Button>
                        <Button className="rounded-full bg-yellow-400 text-[#1a1c2c] font-black uppercase tracking-widest px-8" onClick={() => setSelectedCourse(null)}>Fermer</Button>
                    </div>
                </div>
            </div>
        </DialogContent></Dialog>

        <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
            <DialogContent className="max-w-2xl rounded-[40px] p-10">
                <DialogHeader><DialogTitle className="text-2xl font-black italic uppercase bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Déployer un nouveau cursus</DialogTitle></DialogHeader>
                <div className="space-y-6 pt-6">
                    <div className="space-y-2"><Label className="text-xs font-black uppercase tracking-widest opacity-50">Titre de la formation</Label><Input className="h-14 text-xl font-black italic border-2" value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} placeholder="ex: Pharmacologie Clinique II" /></div>
                    <div className="space-y-2"><Label className="text-xs font-black uppercase tracking-widest opacity-50">Missions & Objectifs</Label><Textarea rows={4} className="rounded-2xl border-2 font-medium" value={newCourse.description} onChange={e => setNewCourse({...newCourse, description: e.target.value})} /></div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2"><Label className="text-xs font-black uppercase tracking-widest opacity-50">Frais d'inscription (DA)</Label><Input type="number" className="h-14 font-black text-xl" value={newCourse.price} onChange={e => setNewCourse({...newCourse, price: parseInt(e.target.value)})} /></div>
                        <div className="space-y-2"><Label className="text-xs font-black uppercase tracking-widest opacity-50">Volume Horaire</Label><Input className="h-14 font-black text-xl" value={newCourse.duration} onChange={e => setNewCourse({...newCourse, duration: e.target.value})} placeholder="ex: 24 Heures" /></div>
                    </div>
                    <Button className="w-full h-16 rounded-full mt-6 bg-gradient-to-r from-primary to-accent text-white font-black text-xl shadow-2xl hover:scale-105 transition-all" onClick={async () => {
                        await addCourse({
                            id: `course-${Date.now()}`, trainerId: user!.id, title: newCourse.title, titleAr: newCourse.title,
                            description: newCourse.description, descriptionAr: newCourse.description,
                            duration: newCourse.duration, price: newCourse.price, isFree: newCourse.price === 0,
                            modules: [
                                { id: 'm1', title: 'Introduction', content: 'Contenu du module 1...', quiz: [{ question: 'Q1?', options: ['A','B','C'], correctAnswer: 0 }] }
                            ], 
                            certificateTemplate: 'default'
                        });
                        toast.success("Formation publiée avec succès sur le campus."); setIsAddCourseOpen(false);
                        setNewCourse({ title: "", description: "", price: 0, duration: "10 hours" });
                    }}>Propulser le cours</Button>
                </div>
            </DialogContent>
        </Dialog>

        <Dialog open={isPaymentInfoOpen} onOpenChange={setIsPaymentInfoOpen}>
            <DialogContent className="max-w-md rounded-[40px] p-10">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black italic uppercase text-primary">Informations de Paiement</DialogTitle>
                </DialogHeader>
                {selectedCourseForPayment && (
                    <div className="space-y-6 pt-6">
                        <div className="p-6 bg-secondary/10 rounded-[30px] border-2 border-dashed">
                            <p className="text-sm font-bold opacity-60 uppercase mb-4 text-center">Veuillez effectuer le virement vers :</p>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-black uppercase text-primary">Compte CCP</Label>
                                    <p className="text-xl font-black font-mono bg-white p-3 rounded-xl border">{schools.find(s => s.ownerId === selectedCourseForPayment.trainerId)?.ccp || "Non configuré"}</p>
                                </div>
                                {schools.find(s => s.ownerId === selectedCourseForPayment.trainerId)?.baridimob && (
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-black uppercase text-accent">ID BaridiMob</Label>
                                        <p className="text-xl font-black font-mono bg-white p-3 rounded-xl border">{schools.find(s => s.ownerId === selectedCourseForPayment.trainerId)?.baridimob}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                            <p className="text-xs font-medium text-amber-700 italic">Une fois le virement effectué, cliquez sur le bouton ci-dessous. Le formateur validera votre accès dès réception du paiement.</p>
                        </div>
                        <Button className="w-full h-14 rounded-full bg-primary font-black uppercase italic shadow-xl" onClick={async () => {
                            await addEnrollment({ courseId: selectedCourseForPayment.id, userId: user!.id, status: 'pending' });
                            toast.success("Demande d'inscription envoyée !");
                            setIsPaymentInfoOpen(false);
                        }}>J'ai effectué le paiement</Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
