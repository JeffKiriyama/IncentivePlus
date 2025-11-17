// Arquivo: code/app/aluno/loja/page.tsx
"use client"; 

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api'; 
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RewardCard } from "@/components/reward-card";
import { Skeleton } from '@/components/ui/skeleton'; 

// Tipos para nossos dados
interface UserData {
  name: string;
  role: string;
  points_balance: number;
  id: string; // Adicionado ID do usuário
}
interface Reward {
  reward_id: number;
  name: string;
  description: string | null;
  points_cost: number;
  image_url: string | null;
}

export default function LojaPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLojaData() {
      try {
        const user = await apiFetch("/users/me");
        const rewardsData = await apiFetch("/rewards");
        
        setUserData(user);
        setRewards(rewardsData);

      } catch (error) {
        console.error("Erro ao carregar loja:", error);
        router.push("/auth/login"); // Se falhar (token expirado), manda pro login
      } finally {
        setIsLoading(false);
      }
    }

    loadLojaData();
  }, [router]);

  // Tela de Loading
  if (isLoading || !userData) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation userName="Carregando..." userRole="aluno" points={0} />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Skeleton className="h-9 w-72" />
            <Skeleton className="h-5 w-96 mt-2" />
          </div>
          <Skeleton className="h-40 mb-8" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        userName={userData.name} 
        userRole={userData.role}
        points={userData.points_balance}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Loja de Recompensas</h1>
          <p className="text-muted-foreground">
            Troque seus pontos por recompensas incríveis
          </p>
        </div>

        <Card className="mb-8 bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardHeader>
            <CardTitle>Seu Saldo</CardTitle>
            <CardDescription>Pontos disponíveis para resgatar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{userData.points_balance || 0} pontos</div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards && rewards.length > 0 ? (
            rewards.map((reward) => (
              <RewardCard
                key={reward.reward_id}
                reward={reward}
                userPoints={userData.points_balance || 0}
                userId={userData.id} // Passando o ID do usuário
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">Nenhuma recompensa disponível no momento</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}