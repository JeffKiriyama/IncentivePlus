// Arquivo: code/components/reward-card.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award } from 'lucide-react';
import { apiFetch } from "@/lib/api"; // 1. Importar apiFetch
import { useRouter } from 'next/navigation';
import { useState } from "react";
// 2. Remover import do Supabase

interface RewardCardProps {
  reward: {
    reward_id: number;
    name: string;
    description: string | null;
    points_cost: number;
    image_url: string | null;
  };
  userPoints: number;
  userId: string;
}

export function RewardCard({ reward, userPoints, userId }: RewardCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const canRedeem = userPoints >= reward.points_cost;

  const handleRedeem = async () => {
    if (!canRedeem) {
      alert('Pontos insuficientes para este resgate');
      return;
    }

    if (!confirm(`Deseja resgatar ${reward.name} por ${reward.points_cost} pontos?`)) {
      return;
    }

    setIsLoading(true);

    try {
      // 3. Substituir toda a lógica do Supabase por UMA chamada à nossa API
      const data = await apiFetch("/rewards/redeem", {
        method: "POST",
        body: JSON.stringify({
          items: [
            {
              reward_id: reward.reward_id,
              quantity: 1,
            },
          ],
        }),
      });

      // O back-end já cuida de verificar saldo, criar resgate,
      // criar item de resgate, atualizar pontos do usuário e
      // registrar a transação. TUDO em uma só chamada.
      
      alert(`Resgate solicitado com sucesso! Seu novo saldo é: ${data.new_balance} pontos.`);
      router.refresh(); // Recarrega a página para atualizar o saldo
      
    } catch (error) {
      console.error('Erro ao resgatar:', error);
      // O apiFetch já mostra um toast de erro
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <Award className="h-10 w-10 text-accent mb-2" />
        <CardTitle>{reward.name}</CardTitle>
        <CardDescription>{reward.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary">
            {reward.points_cost} pts
          </span>
          {!canRedeem && (
            <span className="text-xs text-muted-foreground">
              Faltam {reward.points_cost - userPoints} pts
            </span>
          )}
        </div>
        
        <Button
          onClick={handleRedeem}
          disabled={!canRedeem || isLoading}
          className="w-full"
        >
          {isLoading ? 'Resgatando...' : canRedeem ? 'Resgatar' : 'Pontos insuficientes'}
        </Button>
      </CardContent>
    </Card>
  );
}