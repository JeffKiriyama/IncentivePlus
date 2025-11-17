// Arquivo: code/app/admin/noticias/page.tsx
"use client"; 

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api'; 
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Tipos
interface AdminData {
  name: string;
  role: string;
}
interface NewsItem {
  news_id: number;
  title: string;
  category: string | null;
  content: string | null;
  published_at: string;
}
interface TipItem {
  tip_id: number;
  title: string;
  content: string | null;
  published_at: string;
}

export default function AdminNoticiasPage() {
  const router = useRouter();
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [tips, setTips] = useState<TipItem[]>([]); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      try {
        // 3. Buscar dados
        const admin = await apiFetch("/users/me");
        
        if (admin.role !== 'admin') {
          router.push('/auth/login');
          return;
        }
        setAdminData(admin);

        const newsData = await apiFetch("/news");
        setNews(newsData);
        
        setTips([]); 

      } catch (error) {
        console.error("Erro ao carregar notícias:", error);
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
            <Skeleton className="h-9 w-72 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
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
          <h1 className="text-3xl font-bold mb-2">Notícias e Dicas</h1>
          <p className="text-muted-foreground">Gerencie o conteúdo informativo do sistema</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Notícias */}
          <Card>
            <CardHeader>
              <CardTitle>Notícias</CardTitle>
              <CardDescription>Últimas notícias publicadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {news && news.length > 0 ? (
                  news.map((item) => (
                    <div key={item.news_id} className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Newspaper className="h-5 w-5 text-primary mt-0.5" />
                        <div className="flex-1">
                          <h4 className="text-sm font-medium mb-1">{item.title}</h4>
                          {item.category && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              {item.category}
                            </span>
                          )}
                          {item.content && (
                            <p className="text-xs text-muted-foreground mt-2">{item.content}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(item.published_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma notícia publicada
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Dicas */}
          <Card>
            <CardHeader>
              <CardTitle>Dicas</CardTitle>
              <CardDescription>Dicas de estudo publicadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tips && tips.length > 0 ? (
                  tips.map((tip) => (
                    <div key={tip.tip_id} className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="text-sm font-medium mb-1">{tip.title}</h4>
                      <p className="text-xs text-muted-foreground">{tip.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(tip.published_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma dica publicada
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