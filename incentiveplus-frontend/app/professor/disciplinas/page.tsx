// Arquivo: code/app/professor/disciplinas/page.tsx
"use client"; 

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api'; 
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Star } from 'lucide-react';
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
  student_count: number; 
}
interface Feedback {
  rating: number; 
}

export default function ProfessorDisciplinasPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [disciplinesWithStats, setDisciplinesWithStats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProfessorData() {
      try {
        const [user, disciplines, allFeedbacks] = await Promise.all([
          apiFetch("/users/me"),
          apiFetch("/disciplines/professor/my-taught"),
          apiFetch("/feedbacks/professor/my-disciplines")
        ]);

        if (user.role !== 'professor') {
          router.push('/auth/login');
          return;
        }
        setUserData(user);

        const stats = disciplines.map((discipline: Discipline) => {
          const feedbacksForThis = allFeedbacks.filter(
            (f: any) => f.discipline_name === discipline.name
          );
          
          const avgRating = feedbacksForThis.length > 0
            ? (feedbacksForThis.reduce((sum: number, f: Feedback) => sum + f.rating, 0) / feedbacksForThis.length).toFixed(1)
            : null;

          return {
            ...discipline,
            studentCount: discipline.student_count || 0,
            feedbackCount: feedbacksForThis.length,
            avgRating,
          };
        });

        setDisciplinesWithStats(stats);

      } catch (error) {
        console.error("Erro ao carregar disciplinas:", error);
        router.push("/auth/login");
      } finally {
        setIsLoading(false);
      }
    }

    loadProfessorData();
  }, [router]);

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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-80" />
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Minhas Disciplinas</h1>
          <p className="text-muted-foreground">Gerencie suas disciplinas e veja estatísticas</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {disciplinesWithStats && disciplinesWithStats.length > 0 ? (
            disciplinesWithStats.map((discipline) => (
              <Card key={discipline.discipline_id}>
                <CardHeader>
                  <BookOpen className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>{discipline.name}</CardTitle>
                  <CardDescription>{discipline.schedule_info || 'Sem horário definido'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Alunos matriculados</span>
                      <span className="font-medium flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {discipline.studentCount}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Feedbacks recebidos</span>
                      <span className="font-medium">{discipline.feedbackCount}</span>
                    </div>
                    
                    {discipline.avgRating && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Avaliação média</span>
                        <span className="font-medium flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          {discipline.avgRating}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <Button asChild className="w-full">
                    <Link href={`/professor/disciplinas/${discipline.discipline_id}`}>
                      Ver Detalhes
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">Você ainda não tem disciplinas cadastradas</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}