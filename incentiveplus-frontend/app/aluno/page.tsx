// Arquivo: code/app/aluno/page.tsx
"use client"; 

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from "@/lib/api"; 
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, BookOpen, TrendingUp, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton'; 

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
interface NewsItem {
  news_id: number;
  title: string;
  category: string;
  published_at: string;
}

export default function AlunoDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [stats, setStats] = useState({ totalDisciplines: 0, totalFeedbacks: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const user = await apiFetch("/users/me");
        setUserData(user);

        if (user.role !== 'aluno') {
          router.push('/auth/login');
          return;
        }
        
        setStats({ totalDisciplines: 0, totalFeedbacks: 0 });

        const newsData = await apiFetch("/news");
        setNews(newsData.slice(0, 3)); 

        setTransactions([]); 

      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
        router.push("/auth/login"); 
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, [router]);

  // Tela de Loading
  if (isLoading || !userData) {
    return (
      <div className="min-h-screen bg-background">
        {/* Mostra uma navegação "falsa" enquanto carrega */}
        <Navigation userName="Carregando..." userRole="aluno" points={0} />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-80" />
          </div>
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </main>
      </div>
    );
  }

  // Tela Principal (quando os dados carregaram)
  const totalPoints = userData.points_balance || 0;
  const totalFeedbacks = stats.totalFeedbacks;
  const totalDisciplines = stats.totalDisciplines;

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        userName={userData.name} 
        userRole={userData.role}
        points={totalPoints}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Bem-vindo, {userData.name}!</h1>
          <p className="text-muted-foreground">Acompanhe seu progresso e conquistas</p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pontos Totais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Award className="h-8 w-8 text-primary" />
                <div className="text-3xl font-bold text-primary">{totalPoints}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Disciplinas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <BookOpen className="h-8 w-8 text-secondary" />
                <div className="text-3xl font-bold">{totalDisciplines}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Feedbacks Enviados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Star className="h-8 w-8 text-accent" />
                <div className="text-3xl font-bold">{totalFeedbacks}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Atividade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="text-3xl font-bold">+{transactions.filter(t => t.tx_type === 'credito').length || 0}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Transações Recentes */}
          <Card>
            <CardHeader>
              <CardTitle>Transações Recentes</CardTitle>
              <CardDescription>Suas últimas movimentações de pontos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions && transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <div key={tx.tx_id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="text-sm font-medium">{tx.reason}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className={`font-semibold ${tx.tx_type === 'credito' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.tx_type === 'credito' ? '+' : ''}{tx.points_delta} pts
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma transação ainda
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notícias */}
          <Card>
            <CardHeader>
              <CardTitle>Notícias</CardTitle>
              <CardDescription>Fique por dentro das novidades</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {news && news.length > 0 ? (
                  news.map((item) => (
                    <div key={item.news_id} className="py-2 border-b last:border-0">
                      <h4 className="text-sm font-medium mb-1">{item.title}</h4>
                      {item.category && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {item.category}
                        </span>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(item.published_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma notícia disponível
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}