// Arquivo: code/app/aluno/historico/page.tsx
"use client"; 

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api'; 
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from '@/components/ui/skeleton';

// Tipos de dados
interface UserData {
  name: string;
  role: string;
  points_balance: number;
}
interface Transaction {
  tx_id: number;
  reason: string;
  created_at: string;
  tx_type: 'credito' | 'debito';
  points_delta: number;
}
interface RedemptionItem {
  reward_name: string;
  quantity: number;
  points_spent: number;
}
interface Redemption {
  redemption_id: number;
  status: string;
  requested_at: string;
  admin_notes: string | null;
  items: RedemptionItem[];
}

export default function HistoricoPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHistoricoData() {
      try {
        // 3. Busca todos os dados em paralelo
        const [user, transData, redemptData] = await Promise.all([
          apiFetch("/users/me"),
          apiFetch("/users/me/transactions"),
          apiFetch("/users/me/redemptions") 
        ]);

        if (user.role !== 'aluno') {
          router.push('/auth/login');
          return;
        }

        setUserData(user);
        setTransactions(transData);
        setRedemptions(redemptData);

      } catch (error) {
        console.error("Erro ao carregar histórico:", error);
        router.push("/auth/login");
      } finally {
        setIsLoading(false);
      }
    }

    loadHistoricoData();
  }, [router]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pendente: 'secondary',
      aprovado: 'default',
      negado: 'destructive',
      cancelado: 'outline',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  if (isLoading || !userData) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation userName="Carregando..." userRole="aluno" points={0} />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <Card>
            <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
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
          <h1 className="text-3xl font-bold mb-2">Histórico</h1>
          <p className="text-muted-foreground">Acompanhe suas transações e resgates</p>
        </div>

        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="transactions">Transações de Pontos</TabsTrigger>
            <TabsTrigger value="redemptions">Resgates</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Transações de Pontos</CardTitle>
                <CardDescription>Histórico completo de movimentações</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions && transactions.length > 0 ? (
                    transactions.map((tx) => (
                      <div key={tx.tx_id} className="flex items-center justify-between py-3 border-b last:border-0">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{tx.reason}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(tx.created_at).toLocaleDateString('pt-BR')} às{' '}
                            {new Date(tx.created_at).toLocaleTimeString('pt-BR')}
                          </p>
                        </div>
                        <div className={`text-lg font-semibold ${
                          tx.tx_type === 'credito' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {tx.tx_type === 'credito' ? '+' : ''}{tx.points_delta} pts
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Nenhuma transação encontrada
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="redemptions">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Resgates</CardTitle>
                <CardDescription>Suas solicitações de recompensas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {redemptions && redemptions.length > 0 ? (
                    redemptions.map((redemption) => (
                      <div key={redemption.redemption_id} className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-sm font-medium">
                              Resgate #{redemption.redemption_id}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Solicitado em {new Date(redemption.requested_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          {getStatusBadge(redemption.status)}
                        </div>
                        
                        <div className="space-y-2">
                          {redemption.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <span>{item.reward_name} x{item.quantity}</span>
                              <span className="font-medium">{item.points_spent} pts</span>
                            </div>
                          ))}
                        </div>

                        {redemption.admin_notes && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs text-muted-foreground">
                              <strong>Observações:</strong> {redemption.admin_notes}
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Nenhum resgate encontrado
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}