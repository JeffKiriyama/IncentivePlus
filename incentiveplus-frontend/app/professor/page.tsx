// Arquivo: code/app/professor/page.tsx
"use client"; 

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api'; 
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, MessageSquare, Star, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Tipos
interface UserData {
  name: string;
  role: string;
}
interface Discipline {
  discipline_id: number;
  name: string;
  schedule_info: string | null;
  student_count: number; 
}
interface Feedback {
  feedback_id: number;
  rating: number;
  comment: string | null;
  discipline_name: string; 
  user_name: string;
  created_at: string;
}

export default function ProfessorDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProfessorData() {
      try {
   
        const [user, disciplinesData, feedbacksData] = await Promise.all([
          apiFetch("/users/me"),
          apiFetch("/disciplines/professor/my-taught"), 
          apiFetch("/feedbacks/professor/my-disciplines") 
        ]);

        if (user.role !== 'professor') {
          router.push('/auth/login');
          return;
        }

        setUserData(user);
        setDisciplines(disciplinesData);
        setFeedbacks(feedbacksData);

      } catch (error) {
        console.error("Erro ao carregar dashboard do professor:", error);
        router.push("/auth/login");
      } finally {
        setIsLoading(false);
      }
    }

    loadProfessorData();
  }, [router]);

  const totalDisciplines = disciplines.length;
  const totalStudents = disciplines.reduce((sum, d) => sum + d.student_count, 0);
  const totalFeedbacks = feedbacks.length;
  const avgRating = feedbacks.length > 0
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : '0.0';

  // Tela de Loading
  if (isLoading || !userData) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation userName="Carregando..." userRole="professor" />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Skeleton className="h-9 w-72 mb-2" />
            <Skeleton className="h-5 w-96" />
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        userName={userData.name} 
        userRole={userData.role}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Bem-vindo, Prof. {userData.name}!</h1>
          <p className="text-muted-foreground">Gerencie suas disciplinas e acompanhe o feedback dos alunos</p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Disciplinas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <BookOpen className="h-8 w-8 text-primary" />
                <div className="text-3xl font-bold">{totalDisciplines}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Alunos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-8 w-8 text-secondary" />
                <div className="text-3xl font-bold">{totalStudents}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Feedbacks Recebidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-8 w-8 text-accent" />
                <div className="text-3xl font-bold">{totalFeedbacks}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avaliação Média
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Star className="h-8 w-8 text-yellow-500" />
                <div className="text-3xl font-bold">{avgRating}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Minhas Disciplinas */}
          <Card>
            <CardHeader>
              <CardTitle>Minhas Disciplinas</CardTitle>
              <CardDescription>Disciplinas que você leciona</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {disciplines && disciplines.length > 0 ? (
                  disciplines.map((discipline) => (
                    <div key={discipline.discipline_id} className="flex items-start justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">{discipline.name}</h4>
                        {discipline.schedule_info && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {discipline.schedule_info}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {discipline.student_count || 0}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Você ainda não tem disciplinas cadastradas
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Feedbacks Recentes */}
          <Card>
            <CardHeader>
              <CardTitle>Feedbacks Recentes</CardTitle>
              <CardDescription>Últimas avaliações dos alunos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedbacks && feedbacks.length > 0 ? (
                  feedbacks.slice(0, 5).map((feedback) => (
                    <div key={feedback.feedback_id} className="p-3 bg-muted/50 rounded-lg">
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
                        <p className="text-xs text-muted-foreground">{feedback.comment}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(feedback.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum feedback recebido ainda
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