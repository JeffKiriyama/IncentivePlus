// Arquivo: code/app/admin/resgates/page.tsx
"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api'; 
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApproveRedemptionButton } from "@/components/approve-redemption-button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from '@/components/ui/skeleton';

// Tipos
interface UserData {
  name: string;
  role: string;
}
interface RedemptionUser {
  user_id: number;
  name: string;
  email: string;
}
interface RedemptionItem {
  item_id: number;
  reward_name: string;
  quantity: number;
  points_spent: number;
}
interface Redemption {
  redemption_id: number;
  status: string;
  requested_at: string;
  approved_at: string | null;
  admin_notes: string | null;
  user: RedemptionUser;
  total_points_spent: number; 
  items: RedemptionItem[];
}

export default function AdminResgatesPage() {
  const router = useRouter();
  const [adminData, setAdminData] = useState<UserData | null>(null);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [admin, redemptionsData] = await Promise.all([
          apiFetch("/users/me"),
          apiFetch("/redemptions") 
        ]);
        
        if (admin.role !== 'admin') {
          router.push('/auth/login');
          return;
        }
        setAdminData(admin);
        setRedemptions(redemptionsData);

      } catch (error) {
        console.error("Erro ao carregar resgates:", error);
        router.push("/auth/login");
      } finally {
        setIsLoading(false);
      }
    }
    loadAdminData();
  }, [router]);

  const pendingRedemptions = redemptions.filter(r => r.status === 'pendente');
  const approvedRedemptions = redemptions.filter(r => r.status === 'aprovado');
  const rejectedRedemptions = redemptions.filter(r => r.status === 'negado');

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pendente: 'secondary',
      aprovado: 'default',
      negado: 'destructive',
      cancelado: 'outline',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const RedemptionList = ({ redemptions }: { redemptions: Redemption[] }) => (
    <div className="space-y-4">
      {redemptions.length > 0 ? (
        redemptions.map((redemption) => (
          <Card key={redemption.redemption_id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    Resgate #{redemption.redemption_id}
                  </CardTitle>
                  <CardDescription>
                    {redemption.user.name} ({redemption.user.email})
                  </CardDescription>
                </div>
                {getStatusBadge(redemption.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Itens:</p>
                <div className="space-y-1">
                  {redemption.items.map((item: RedemptionItem) => (
                    <div key={item.item_id} className="flex items-center justify-between text-sm">
                      <span>{item.reward_name} x{item.quantity}</span>
                      <span className="font-medium">{item.points_spent} pts</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t flex items-center justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-primary">{redemption.total_points_spent} pts</span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                <p>Solicitado em: {new Date(redemption.requested_at).toLocaleString('pt-BR')}</p>
                {redemption.approved_at && (
                  <p>Processado em: {new Date(redemption.approved_at).toLocaleString('pt-BR')}</p>
                )}
              </div>

              {redemption.status === 'pendente' && (
                <ApproveRedemptionButton
                  redemptionId={redemption.redemption_id}
                  userId={redemption.user.user_id}
                  pointsSpent={redemption.total_points_spent}
                />
              )}

              {redemption.admin_notes && (
                <div className="p-3 bg-muted/50 rounded">
                  <p className="text-xs font-medium mb-1">Observações do Admin:</p>
                  <p className="text-xs text-muted-foreground">{redemption.admin_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8">
          Nenhum resgate nesta categoria
        </p>
      )}
    </div>
  );

  // Tela de Loading
  if (isLoading || !adminData) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation userName="Carregando..." userRole="admin" />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-80" />
          </div>
          <Skeleton className="h-10 w-80 mb-6" />
          <Card>
            <CardHeader>
              <Skeleton className="h-20 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full" />
            </CardContent>
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
          <h1 className="text-3xl font-bold mb-2">Resgates</h1>
          <p className="text-muted-foreground">Gerencie as solicitações de resgate</p>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">
              Pendentes ({pendingRedemptions.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Aprovados ({approvedRedemptions.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Negados ({rejectedRedemptions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <RedemptionList redemptions={pendingRedemptions} />
          </TabsContent>

          <TabsContent value="approved">
            <RedemptionList redemptions={approvedRedemptions} />
          </TabsContent>

          <TabsContent value="rejected">
            <RedemptionList redemptions={rejectedRedemptions} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}