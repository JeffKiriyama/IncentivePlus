// Arquivo: code/app/admin/page.tsx
"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api'; 
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Award, ShoppingCart, TrendingUp, MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Tipos
interface UserData {
  name: string;
  role: string;
}
interface Transaction {
  tx_id: number;
  tx_type: 'credito' | 'debito';
  points_delta: number;
  reason: string;
  created_at: string;
  users: { name: string }; 
}

export default function AdminDashboard() {
  const router = useRouter();
  const [adminData, setAdminData] = useState<UserData | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDisciplines: 0,
    totalRewards: 0,
    pendingRedemptions: 0,
    totalFeedbacks: 0,
    totalPointsDistributed: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAdminDashboard() {
      try {
        const admin = await apiFetch("/users/me");
        if (admin.role !== 'admin') {
          router.push('/auth/login');
          return;
        }
        setAdminData(admin);

        const [
          usersData, 
          disciplinesData, 
          rewardsData, 
          redemptionsData,
        ] = await Promise.all([
          apiFetch("/users"),       // Rota de Admin
          apiFetch("/disciplines"), // Rota Geral
          apiFetch("/rewards"),     // Rota Geral
          apiFetch("/redemptions"), // Rota de Admin

        ]);

        setStats({
          totalUsers: usersData.length,
          totalDisciplines: disciplinesData.length,
          totalRewards: rewardsData.length,
          pendingRedemptions: redemptionsData.filter((r: any) => r.status === 'pendente').length,
          totalFeedbacks: 0, // Simulado
          totalPointsDistributed: 0, // Simulado
        });
        
        setRecentTransactions([]); // Simulado

      } catch (error) {
        console.error("Erro ao carregar dashboard do admin:", error);
        router.push("/auth/login");
      } finally {
        setIsLoading(false);
      }
    }

    loadAdminDashboard();
  }, [router]);

  // Tela de Loading
  if (isLoading || !adminData) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation userName="Carregando..." userRole="admin" />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Skeleton className="h-9 w-72 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Card>
            <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
            <CardContent><Skeleton className="h-40 w-full" /></CardContent>
          </Card>
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
          <h1 className="text-3xl font-bold mb-2">Painel Administrativo</h1>
          <p className="text-muted-foreground">Visão geral do sistema Incentive+</p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Usuários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-8 w-8 text-primary" />
                <div className="text-3xl font-bold">{stats.totalUsers}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Disciplinas Ativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <BookOpen className="h-8 w-8 text-secondary" />
                <div className="text-3xl font-bold">{stats.totalDisciplines}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Recompensas Ativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Award className="h-8 w-8 text-accent" />
                <div className="text-3xl font-bold">{stats.totalRewards}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Resgates Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-8 w-8 text-orange-600" />
                <div className="text-3xl font-bold text-orange-600">{stats.pendingRedemptions}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Feedbacks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-8 w-8 text-blue-600" />
                <div className="text-3xl font-bold">{stats.totalFeedbacks}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pontos Distribuídos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="text-3xl font-bold text-green-600">{stats.totalPointsDistributed}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transações Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Transações Recentes (Simulado)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions && recentTransactions.length > 0 ? (
                recentTransactions.map((tx) => (
                  <div key={tx.tx_id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{tx.users.name}</p>
                      <p className="text-xs text-muted-foreground">{tx.reason}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className={`font-semibold ${
                      tx.tx_type === 'credito' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {tx.tx_type === 'credito' ? '+' : ''}{tx.points_delta} pts
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma transação recente (ou rota não implementada)
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}