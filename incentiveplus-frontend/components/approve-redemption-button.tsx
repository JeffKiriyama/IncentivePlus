"use client";

import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api"; 
import { useRouter } from 'next/navigation';
import { useState } from "react";
import { Check, X } from 'lucide-react';

interface ApproveRedemptionButtonProps {
  redemptionId: number;
  userId: number; // Corrigido de string para number
  pointsSpent: number;
}

export function ApproveRedemptionButton({ redemptionId, userId, pointsSpent }: ApproveRedemptionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleApprove = async () => {
    if (!confirm('Deseja aprovar este resgate?')) return;
    setIsLoading(true);
    
    try {
      await apiFetch(`/redemptions/${redemptionId}/approve`, {
        method: 'POST',
      });
      alert('Resgate aprovado com sucesso!');
      router.refresh();
    } catch (error) {
      console.error('Erro ao aprovar resgate:', error);
      alert('Erro ao aprovar resgate. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt('Digite o motivo da negação (obrigatório para reembolso):');
    if (!reason) {
      alert('O motivo é obrigatório para negar o resgate.');
      return;
    }
    setIsLoading(true);

    try {
      await apiFetch(`/redemptions/${redemptionId}/reject`, {
        method: 'POST',
        body: JSON.stringify({
          reason: reason,
          user_id: userId,
          points_spent: pointsSpent,
        }),
      });
      alert('Resgate negado e pontos devolvidos ao usuário.');
      router.refresh();
    } catch (error) {
      console.error('Erro ao negar resgate:', error);
      alert('Erro ao negar resgate. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleApprove}
        disabled={isLoading}
        className="flex-1"
        variant="default"
      >
        <Check className="h-4 w-4 mr-2" />
        Aprovar
      </Button>
      <Button
        onClick={handleReject}
        disabled={isLoading}
        className="flex-1"
        variant="destructive"
      >
        <X className="h-4 w-4 mr-2" />
        Negar
      </Button>
    </div>
  );
}