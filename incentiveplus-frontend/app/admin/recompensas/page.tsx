// Arquivo: code/app/admin/recompensas/page.tsx
"use client"; 

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api'; 
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Tipos para nossos dados
interface AdminData {
  name: string;
  role: string;
}
interface Reward {
  reward_id: number;
  name: string;
  description: string | null;
  points_cost: number;
  is_active: boolean;
}

export default function AdminRecompensasPage() {
  const router = useRouter();
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const admin = await apiFetch("/users/me");
        
        if (admin.role !== 'admin') {
          router.push('/auth/login');
          return;
        }
        setAdminData(admin);

        const rewardsData = await apiFetch("/rewards");
        setRewards(rewardsData);

      } catch (error) {
        console.error("Erro ao carregar recompensas:", error);
        router.push("/auth/login");
      } finally {
        setIsLoading(false);
      }
    }
    loadAdminData();
  }, [router]);

  // Tela de Loading
  if (isLoading || !adminData) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation userName="Carregando..." userRole="admin" />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-60" />
            <Skeleton className="h-60" />
            <Skeleton className="h-60" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        userName={adminData.name} 
        userRole={adminData.role}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Recompensas</h1>
          <p className="text-muted-foreground">Gerencie as recompensas disponíveis na loja</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards && rewards.length > 0 ? (
            rewards.map((reward) => (
              <Card key={reward.reward_id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Award className="h-10 w-10 text-accent" />
                    <Badge variant={reward.is_active ? 'default' : 'secondary'}>
                      {reward.is_active ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </div>
                  <CardTitle className="mt-4">{reward.name}</CardTitle>
                  <CardDescription>{reward.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {reward.points_cost} pontos
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">Nenhuma recompensa cadastrada</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}