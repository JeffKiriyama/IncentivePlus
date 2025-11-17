// Arquivo: code/app/professor/disciplinas/[id]/page.tsx
"use client";

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api'; 
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Star } from 'lucide-react';
import Link from "next/link";
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
}
interface Enrollment {
  user_id: number;
  name: string;
  email: string;
  points_balance: number;
}
interface Feedback {
  feedback_id: number;
  rating: number;
  comment: string | null;
  user_name: string;
  created_at: string;
}

export default function DisciplineDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [userData, setUserData] = useState<UserData | null>(null);
  const [discipline, setDiscipline] = useState<Discipline | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function loadDetailData() {
      try {
        const [user, disciplineData, enrollmentsData, feedbacksData] = await Promise.all([
          apiFetch("/users/me"),
          apiFetch(`/disciplines/${id}`),              
          apiFetch(`/disciplines/${id}/enrollments`),
          apiFetch(`/feedbacks/discipline/${id}`) 
        ]);

        if (user.role !== 'professor' && user.role !== 'admin') {
          router.push('/auth/login');
          return;
        }

        setUserData(user);
        setDiscipline(disciplineData);
        setEnrollments(enrollmentsData);
        setFeedbacks(feedbacksData);

      } catch (error) {
        console.error("Erro ao carregar detalhes da disciplina:", error);
        router.push("/professor");
      } finally {
        setIsLoading(false);
      }
    }
    loadDetailData();
  }, [id, router]);

  const avgRating = feedbacks.length > 0
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : null;

  // Tela de Loading
  if (isLoading || !userData || !discipline) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation userName="Carregando..." userRole="professor" />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-9 w-24 mb-4" />
          <div className="mb-8">
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-48" />
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
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
        userName={userData.name} 
        userRole={userData.role}
      />

      <main className="container mx-auto px-4 py-8">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/professor/disciplinas">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{discipline.name}</h1>
          <p className="text-muted-foreground">{discipline.schedule_info}</p>
        </div>

        {/* Estatísticas */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Alunos Matriculados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{enrollments.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Feedbacks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{feedbacks.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avaliação Média
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {avgRating || 'N/A'}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Alunos Matriculados */}
          <Card>
            <CardHeader>
              <CardTitle>Alunos Matriculados</CardTitle>
              <CardDescription>Lista de alunos nesta disciplina</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {enrollments && enrollments.length > 0 ? (
                  enrollments.map((enrollment) => (
                    <div key={enrollment.user_id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">{enrollment.name}</p>
                          <p className="text-xs text-muted-foreground">{enrollment.email}</p>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {enrollment.points_balance} pts
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum aluno matriculado ainda
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Feedbacks */}
          <Card>
            <CardHeader>
              <CardTitle>Feedbacks dos Alunos</CardTitle>
              <CardDescription>Avaliações e comentários</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedbacks && feedbacks.length > 0 ? (
                  feedbacks.map((feedback) => (
                    <div key={feedback.feedback_id} className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">{feedback.user_name}</p>
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