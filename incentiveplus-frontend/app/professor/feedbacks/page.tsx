// Arquivo: code/app/professor/feedbacks/page.tsx
"use client"; 

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api'; 
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';

// Tipos
interface UserData {
  name: string;
  role: string;
}
interface Feedback {
  feedback_id: number;
  rating: number;
  comment: string | null;
  discipline_name: string; 
  user_name: string;
  created_at: string;
}

export default function ProfessorFeedbacksPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [allFeedbacks, setAllFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProfessorData() {
      try {
        const [user, feedbacksData] = await Promise.all([
          apiFetch("/users/me"),
          apiFetch("/feedbacks/professor/my-disciplines") 
        ]);

        if (user.role !== 'professor') {
          router.push('/auth/login');
          return;
        }

        setUserData(user);
        setAllFeedbacks(feedbacksData);

      } catch (error) {
        console.error("Erro ao carregar feedbacks:", error);
        router.push("/auth/login");
      } finally {
        setIsLoading(false);
      }
    }

    loadProfessorData();
  }, [router]);

  const positiveFeedbacks = allFeedbacks.filter(f => f.rating >= 4);
  const neutralFeedbacks = allFeedbacks.filter(f => f.rating === 3);
  const negativeFeedbacks = allFeedbacks.filter(f => f.rating <= 2);

  const FeedbackList = ({ feedbacks }: { feedbacks: Feedback[] }) => (
    <div className="space-y-4">
      {feedbacks.length > 0 ? (
        feedbacks.map((feedback) => (
          <div key={feedback.feedback_id} className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium">{feedback.discipline_name}</p>
                <p className="text-xs text-muted-foreground">{feedback.user_name}</p>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`text-sm ${
                      i < feedback.rating ? 'text-yellow-500' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
            {feedback.comment && (
              <p className="text-sm text-muted-foreground mb-2">{feedback.comment}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {new Date(feedback.created_at).toLocaleDateString('pt-BR')} às{' '}
              {new Date(feedback.created_at).toLocaleTimeString('pt-BR')}
            </p>
          </div>
        ))
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8">
          Nenhum feedback nesta categoria
        </p>
      )}
    </div>
  );

  // Tela de Loading
  if (isLoading || !userData) {
     return (
      <div className="min-h-screen bg-background">
        <Navigation userName="Carregando..." userRole="professor" />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <Skeleton className="h-10 w-96 mb-6" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-72 mt-1" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
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
      />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Feedbacks</h1>
          <p className="text-muted-foreground">Veja todos os feedbacks das suas disciplinas</p>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">
              Todos ({allFeedbacks.length})
            </TabsTrigger>
            <TabsTrigger value="positive">
              Positivos ({positiveFeedbacks.length})
            </TabsTrigger>
            <TabsTrigger value="neutral">
              Neutros ({neutralFeedbacks.length})
            </TabsTrigger>
            <TabsTrigger value="negative">
              Negativos ({negativeFeedbacks.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>Todos os Feedbacks</CardTitle>
                <CardDescription>Visualize todos os feedbacks recebidos</CardDescription>
              </CardHeader>
              <CardContent>
                <FeedbackList feedbacks={allFeedbacks} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="positive">
            <Card>
              <CardHeader>
                <CardTitle>Feedbacks Positivos</CardTitle>
                <CardDescription>Avaliações com 4 ou 5 estrelas</CardDescription>
              </CardHeader>
              <CardContent>
                <FeedbackList feedbacks={positiveFeedbacks} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="neutral">
            <Card>
              <CardHeader>
                <CardTitle>Feedbacks Neutros</CardTitle>
                <CardDescription>Avaliações com 3 estrelas</CardDescription>
              </CardHeader>
              <CardContent>
                <FeedbackList feedbacks={neutralFeedbacks} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="negative">
            <Card>
              <CardHeader>
                <CardTitle>Feedbacks Negativos</CardTitle>
                <CardDescription>Avaliações com 1 ou 2 estrelas</CardDescription>
              </CardHeader>
              <CardContent>
                <FeedbackList feedbacks={negativeFeedbacks} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}