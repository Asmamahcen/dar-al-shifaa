"use client";

import { useEffect, useState, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Phone, Star, Filter, Navigation, Trophy, Clock as ClockIcon } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { createClient } from "@/lib/supabase";
import { StarRating } from "@/components/reviews/StarRating";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { ReviewList } from "@/components/reviews/ReviewList";
import { AppointmentBooking } from "@/components/AppointmentBooking";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Doctor {
  id: string;
  full_name: string;
  specialty: string | null;
  phone: string | null;
  wilaya: string | null;
  latitude: number | null;
  longitude: number | null;
  rating?: number;
  reviewCount?: number;
  distance?: number;
  waitTime?: string;
  isElite?: boolean;
}

function DoctorCard({ doc }: { doc: Doctor }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl">{doc.full_name}</CardTitle>
              {doc.isElite && (
                <Badge className="bg-amber-100 text-amber-700 border-amber-200 gap-1">
                  <Trophy className="h-3 w-3" /> Expert
                </Badge>
              )}
            </div>
            <Badge variant="secondary">{doc.specialty || "Généraliste"}</Badge>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center text-yellow-500">
              <Star className="h-4 w-4 fill-current mr-1" />
              <span className="font-bold">{doc.rating?.toFixed(1) || "0.0"}</span>
              <span className="text-xs text-muted-foreground ml-1">
                ({doc.reviewCount || 0})
              </span>
            </div>
            {doc.waitTime && (
              <div className="flex items-center text-[10px] text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                <ClockIcon className="h-3 w-3 mr-1" />
                Attente: {doc.waitTime}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-2" />
          {doc.wilaya || "Algérie"}
          {doc.distance && doc.distance !== Infinity && (
            <span className="ml-2 text-primary font-medium">
              • {doc.distance.toFixed(1)} km
            </span>
          )}
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Phone className="h-4 w-4 mr-2" />
          {doc.phone || "Non renseigné"}
        </div>
        
        <div className="pt-4 flex flex-col gap-2">
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1">
                  Profil & Avis
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{doc.full_name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-secondary rounded-lg">
                      <p className="text-sm text-muted-foreground">Spécialité</p>
                      <p className="font-semibold">{doc.specialty || "Généraliste"}</p>
                    </div>
                    <div className="p-4 bg-secondary rounded-lg">
                      <p className="text-sm text-muted-foreground">Note moyenne</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold">{doc.rating?.toFixed(1) || "0.0"}</span>
                        <StarRating rating={Math.round(doc.rating || 0)} readonly />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Donner votre avis</h3>
                    <ReviewForm targetId={doc.id} targetType="doctor" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Avis des patients</h3>
                    <ReviewList targetId={doc.id} targetType="doctor" />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" className="flex-1" asChild>
              <a href={`tel:${doc.phone}`}>Appeler</a>
            </Button>
          </div>

          <AppointmentBooking 
            doctorId={doc.id} 
            doctorName={doc.full_name} 
            specialty={doc.specialty || "Généraliste"} 
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default function DoctorsPage() {
  const { language } = useAppStore();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"rating" | "distance" | "name">("name");
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const specialties = [
    "Généraliste",
    "Cardiologue",
    "Dentiste",
    "Ophtalmologue",
    "Pédiatre",
    "Gynécologue",
    "Dermatologue",
    "Psychiatre"
  ];

  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: users, error: usersError } = await supabase
          .from("users")
          .select("*")
          .eq("role", "doctor");

        if (usersError) throw usersError;

        const { data: reviews, error: reviewsError } = await supabase
          .from("reviews")
          .select("target_id, rating")
          .eq("target_type", "doctor");

        if (reviewsError) throw reviewsError;

        const doctorsWithRatings = users.map((doc: any) => {
          const docReviews = reviews.filter((r) => r.target_id === doc.id);
          const avgRating =
            docReviews.length > 0
              ? docReviews.reduce((acc, r) => acc + r.rating, 0) / docReviews.length
              : 0;

          // Mocking wait time and elite status for the "Best Specialist" requirement
          const waitTimes = ["5 min", "15 min", "45 min", "1h", "Pas d'attente"];
          const randomWait = waitTimes[Math.floor(Math.random() * waitTimes.length)];
          const isElite = avgRating >= 4.7 && docReviews.length >= 2;

          return {
            ...doc,
            rating: avgRating,
            reviewCount: docReviews.length,
            waitTime: randomWait,
            isElite: isElite
          };
        });

        setDoctors(doctorsWithRatings);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const filteredAndSortedDoctors = useMemo(() => {
    let result = doctors.filter((doc) => {
      const matchesSearch = doc.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.specialty && doc.specialty.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesSpecialty = !selectedSpecialty || 
        (doc.specialty && doc.specialty.toLowerCase() === selectedSpecialty.toLowerCase());
      
      return matchesSearch && matchesSpecialty;
    });

    if (userLocation) {
      result = result.map((doc) => ({
        ...doc,
        distance:
          doc.latitude && doc.longitude
            ? calculateDistance(userLocation.lat, userLocation.lng, doc.latitude, doc.longitude)
            : Infinity,
      }));
    }

    result.sort((a, b) => {
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sortBy === "distance") return (a.distance || Infinity) - (b.distance || Infinity);
      return a.full_name.localeCompare(b.full_name);
    });

    return result;
  }, [doctors, searchTerm, sortBy, userLocation, selectedSpecialty]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 pt-32 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              {t(language, "doctors")}
            </h1>
            <p className="text-muted-foreground">
              Trouvez les meilleurs spécialistes proches de chez vous
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <Button
              variant="outline"
              onClick={getUserLocation}
              className={userLocation ? "text-primary border-primary" : ""}
            >
              <Navigation className="mr-2 h-4 w-4" />
              {userLocation ? "Localisé" : "Me localiser"}
            </Button>
            
            <div className="flex bg-secondary rounded-lg p-1">
              <Button
                variant={sortBy === "name" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setSortBy("name")}
              >
                Nom
              </Button>
              <Button
                variant={sortBy === "rating" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setSortBy("rating")}
              >
                Populaires
              </Button>
              <Button
                variant={sortBy === "distance" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setSortBy("distance")}
                disabled={!userLocation}
              >
                Proximité
              </Button>
            </div>
          </div>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            placeholder="Rechercher par nom ou spécialité..."
            className="pl-10 h-12 text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant={selectedSpecialty === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedSpecialty(null)}
            className="rounded-full"
          >
            Tous
          </Button>
          {specialties.map((specialty) => (
            <Button
              key={specialty}
              variant={selectedSpecialty === specialty ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSpecialty(specialty)}
              className="rounded-full"
            >
              {specialty}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-secondary rounded-t-lg" />
                <CardContent className="p-6">
                  <div className="h-6 w-3/4 bg-secondary rounded mb-4" />
                  <div className="h-4 w-1/2 bg-secondary rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : selectedSpecialty === null ? (
          <div className="space-y-10">
            {specialties.map((specialty) => {
              const doctorsInCategory = filteredAndSortedDoctors.filter(
                (doc) => (doc.specialty || "Généraliste").toLowerCase() === specialty.toLowerCase()
              );
              if (doctorsInCategory.length === 0) return null;
              return (
                <div key={specialty}>
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-2xl font-bold text-primary">{specialty}</h2>
                    <Badge variant="secondary">{doctorsInCategory.length} médecin(s)</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {doctorsInCategory.map((doc) => (
                      <DoctorCard key={doc.id} doc={doc} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedDoctors.map((doc) => (
              <DoctorCard key={doc.id} doc={doc} />
            ))}
          </div>
        )}

        {!isLoading && selectedSpecialty === null && filteredAndSortedDoctors.length > 0 && 
          specialties.every((s) => filteredAndSortedDoctors.filter((d) => (d.specialty || "Généraliste").toLowerCase() === s.toLowerCase()).length === 0) && (
          <div className="text-center py-20">
            <div className="bg-secondary w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-10 w-10 text-muted-foreground" />
            </div>
              <h3 className="text-xl font-semibold mb-2">Aucun médecin trouvé dans ces catégories</h3>
              <p className="text-muted-foreground">
                Les médecins disponibles n&apos;ont pas de spécialité définie.
              </p>
          </div>
        )}

        {!isLoading && filteredAndSortedDoctors.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-secondary w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Aucun médecin trouvé</h3>
            <p className="text-muted-foreground">
              Essayez de modifier vos critères de recherche.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
