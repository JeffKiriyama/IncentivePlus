// Arquivo: code/components/enroll-button.tsx
"use client";

import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api"; // 1. Importar nosso apiFetch
import { useRouter } from 'next/navigation';
import { useState } from "react";
// 2. Remover import do Supabase

interface EnrollButtonProps {
  disciplineId: number;
  // 3. Remover o 'userId'. O back-end sabe quem é pelo token.
}

export function EnrollButton({ disciplineId }: EnrollButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleEnroll = async () => {
    setIsLoading(true);

    try {
      // 4. Usar o apiFetch para chamar a nova rota do back-end
      await apiFetch(`/disciplines/${disciplineId}/enroll`, {
        method: "POST",
      });

      // Se a chamada deu certo, o back-end nos matriculou.
      // Apenas atualizamos a página para mostrar o novo status.
      router.refresh();

    } catch (error: any) {
      console.error('Erro ao matricular:', error);
      
      // O apiFetch já deve mostrar um toast de erro.
      // Se for um erro 409 (conflito), o back-end avisará.
      if (error.message.includes("Você já está matriculado")) {
        alert("Você já está matriculado nesta disciplina.");
      } else {
        alert("Erro ao realizar matrícula. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleEnroll} disabled={isLoading} className="w-full">
      {isLoading ? 'Matriculando...' : 'Matricular-se'}
    </Button>
  );
}