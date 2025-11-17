// Arquivo: code/app/admin/usuarios/page.tsx
"use client"; 

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api'; 
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface User {
  id: string; 
  user_id: number;
  name: string;
  email: string;
  role: 'admin' | 'professor' | 'aluno';
  points_balance: number;
}
interface AdminData {
  name: string;
  role: string;
}

export default function AdminUsuariosPage() {
  const router = useRouter();
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
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

        const usersList = await apiFetch("/users"); 
        setAllUsers(usersList);

      } catch (error) {
        console.error("Erro ao carregar dados de admin:", error);
        router.push("/auth/login");
      } finally {
        setIsLoading(false);
      }
    }
    loadAdminData();
  }, [router]);

  const getRoleBadge = (role: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      admin: 'default',
      professor: 'secondary',
      aluno: 'outline',
    };
    return <Badge variant={variants[role] || 'outline'}>{role}</Badge>;
  };

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
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-72 mt-1" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
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
          <h1 className="text-3xl font-bold mb-2">Usuários</h1>
          <p className="text-muted-foreground">Gerencie todos os usuários do sistema</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuários</CardTitle>
            <CardDescription>Todos os usuários cadastrados no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allUsers && allUsers.length > 0 ? (
                allUsers.map((u) => (
                  <div key={u.user_id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3 flex-1">
                      <Users className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {getRoleBadge(u.role)}
                      <div className="text-sm font-medium text-primary">
                        {u.points_balance} pts
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum usuário cadastrado
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}