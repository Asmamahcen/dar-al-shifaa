"use client";

import { useState } from "react";
import { StarRating } from "./StarRating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface ReviewFormProps {
  targetId: string;
  targetType: "doctor" | "pharmacy";
  onSuccess?: () => void;
}

export function ReviewForm({ targetId, targetType, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Veuillez donner une note");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetId,
          targetType,
          rating,
          comment,
        }),
      });

      if (!response.ok) throw new Error("Erreur lors de l'envoi");

      toast.success("Merci pour votre retour !");
      setRating(0);
      setComment("");
      onSuccess?.();
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-card">
      <h3 className="font-semibold">Laisser un avis</h3>
      <div className="flex items-center gap-4">
        <span>Votre note :</span>
        <StarRating rating={rating} onRatingChange={setRating} />
      </div>
      <Textarea
        placeholder="Votre commentaire..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="min-h-[100px]"
      />
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Envoi..." : "Publier l'avis"}
      </Button>
    </form>
  );
}
