"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api"; 
import { useRouter } from 'next/navigation';
import { useState } from "react";
import { Star } from 'lucide-react';

interface FeedbackFormProps {
  userId: number; // Corrigido de string para number
  disciplineId: number;
}

export function FeedbackForm({ userId, disciplineId }: FeedbackFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Por favor, selecione uma avaliação');
      return;
    }
    setIsLoading(true);

    try {
      const data = await apiFetch("/feedbacks", {
        method: "POST",
        body: JSON.stringify({
          discipline_id: disciplineId,
          rating: rating,
          comment: comment || null,
        }),
      });

      alert(data.message || 'Feedback enviado com sucesso!');
      setRating(0);
      setComment("");
      router.refresh(); 

    } catch (error: any) {
      console.error('Erro ao enviar feedback:', error);
      alert(error.message || 'Erro ao enviar feedback. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label className="mb-3 block">Avaliação *</Label>
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => {
            const value = i + 1;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoveredRating(value)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 ${
                    value <= (hoveredRating || rating)
                      ? 'fill-yellow-500 text-yellow-500'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <Label htmlFor="comment">Comentário (opcional)</Label>
        <Textarea
          id="comment"
          placeholder="Compartilhe sua experiência com esta disciplina..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="mt-2"
        />
      </div>
      <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
        <span className="text-sm font-medium text-primary">
          Você ganhará 10 pontos por este feedback!
        </span>
      </div>
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Enviando...' : 'Enviar Feedback'}
      </Button>
    </form>
  );
}