"use client";

import { useEffect, useState } from "react";
import { StarRating } from "./StarRating";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  users?: {
    full_name: string;
  };
}

interface ReviewListProps {
  targetId: string;
  targetType: "doctor" | "pharmacy";
  refreshTrigger?: number;
}

export function ReviewList({ targetId, targetType, refreshTrigger }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const response = await fetch(`/api/reviews?targetId=${targetId}&targetType=${targetType}`);
        const data = await response.json();
        setReviews(data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchReviews();
  }, [targetId, targetType, refreshTrigger]);

  if (isLoading) return <div>Chargement des avis...</div>;

  if (reviews.length === 0) return <div className="text-muted-foreground italic">Aucun avis pour le moment.</div>;

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="p-4 border rounded-lg bg-card/50">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-medium">{review.users?.full_name || "Utilisateur anonyme"}</p>
              <StarRating rating={review.rating} readonly />
            </div>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: fr })}
            </span>
          </div>
          <p className="text-sm text-foreground/80">{review.comment}</p>
        </div>
      ))}
    </div>
  );
}
