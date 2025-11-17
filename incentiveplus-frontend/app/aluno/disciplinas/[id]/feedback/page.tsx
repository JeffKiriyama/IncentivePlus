// Arquivo: code/app/aluno/disciplinas/[id]/feedback/page.tsx
"use client"; 

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api'; 
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FeedbackForm } from "@/components/feedback-form";
import { ArrowLeft } from 'lucide-react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from '@/components/ui/skeleton';

// Tipos
interface UserData {
  name: string;
  role: string;
  points_balance: number;
  user_id: number;
}
interface Discipline {
  discipline_id: number;
  name: string;
  teacher_name: string;
}
interface Feedback {
  feedback_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
}

export default function FeedbackPage() {
  const router = useRouter();
  const params = useParams(); 
  const id = params.id as string; 

  const [userData, setUserData] = useState<UserData | null>(null);
  const [discipline, setDiscipline] = useState<Discipline | null>(null);
  const [previousFeedbacks, setPreviousFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return; 

    async function loadFeedbackPageData() {
      try {
        const [user, disciplineData, feedbacksData] = await Promise.all([
          apiFetch("/users/me"),
          apiFetch(`/disciplines/${id}`), 
          apiFetch(`/feedbacks/discipline/${id}/my-feedbacks`)
        ]);

        if (user.role !== 'aluno') {
          router.push('/auth/login');
          return;
        }

        setUserData(user);
        setDiscipline(disciplineData);
        setPreviousFeedbacks(feedbacksData);

      } catch (error) {
        console.error("Erro ao carregar página de feedback:", error);
        router.push("/aluno/disciplinas"); 
      } finally {
        setIsLoading(false);
      }
    }

    loadFeedbackPageData();
  }, [id, router]); 

  // Tela de Loading
  if (isLoading || !userData || !discipline) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation userName="Carregando..." userRole="aluno" points={0} />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-9 w-24 mb-4" />
          <div className="mb-8">
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-48" />
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <Skeleton className="h-96" />
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
        points={userData.points_balance}
      />

      <main className="container mx-auto px-4 py-8">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/aluno/disciplinas">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{discipline.name}</h1>
          <p className="text-muted-foreground">{discipline.teacher_name}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Formulário de Feedback */}
          <Card>
            <CardHeader>
              <CardTitle>Enviar Feedback</CardTitle>
              <CardDescription>
                Avalie sua experiência com esta disciplina e ganhe pontos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* 4. Passar os IDs corretos para o formulário */}
              <FeedbackForm 
                userId={userData.user_id} 
                disciplineId={discipline.discipline_id}
              />
            </CardContent>
          </Card>

          {/* Feedbacks Anteriores */}
          <Card>
            <CardHeader>
              <CardTitle>Seus Feedbacks Anteriores</CardTitle>
              <CardDescription>Histórico de avaliações enviadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {previousFeedbacks && previousFeedbacks.length > 0 ? (
                  previousFeedbacks.map((feedback) => (
                    <div key={feedback.feedback_id} className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className={`text-lg ${
                              i < feedback.rating ? 'text-yellow-500' : 'text-gray-300'
                            }`}
                          >
                            ★
                          </span>
                        ))}
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
                    Você ainda não enviou nenhum feedback para esta disciplina
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