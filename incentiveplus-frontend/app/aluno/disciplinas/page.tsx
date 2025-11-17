// Arquivo: code/app/aluno/disciplinas/page.tsx
"use client"; 

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api'; 
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Star, UserCheck } from 'lucide-react';
import Link from "next/link";
import { EnrollButton } from "@/components/enroll-button";
import { Skeleton } from '@/components/ui/skeleton'; 

// Tipos para nossos dados
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
  schedule_info: string | null;
}

export default function DisciplinasPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [allDisciplines, setAllDisciplines] = useState<Discipline[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<number[]>([]); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDisciplinesData() {
      try {
        // 3. Buscar todos os dados em paralelo
        const [user, disciplines, myIds] = await Promise.all([
          apiFetch("/users/me"),           // Dados do aluno logado
          apiFetch("/disciplines"),       // Lista de todas as disciplinas
          apiFetch("/disciplines/my-ids") // Lista de IDs que o aluno está matriculado
        ]);

        if (user.role !== 'aluno') {
          router.push('/auth/login');
          return;
        }

        setUserData(user);
        setAllDisciplines(disciplines);
        setEnrolledIds(myIds);

      } catch (error) {
        console.error("Erro ao carregar disciplinas:", error);
        router.push("/auth/login");
      } finally {
        setIsLoading(false);
      }
    }

    loadDisciplinesData();
  }, [router]);

  // Tela de Loading
  if (isLoading || !userData) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation userName="Carregando..." userRole="aluno" points={0} />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64" />
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
        points={userData.points_balance}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Disciplinas</h1>
          <p className="text-muted-foreground">Navegue e matricule-se nas disciplinas disponíveis</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allDisciplines && allDisciplines.length > 0 ? (
            allDisciplines.map((discipline) => {
              const isEnrolled = enrolledIds.includes(discipline.discipline_id);
              
              return (
                <Card key={discipline.discipline_id} className={isEnrolled ? 'border-primary' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <BookOpen className="h-8 w-8 text-primary" />
                      {isEnrolled && (
                        <span className="flex items-center gap-1 text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                          <UserCheck className="h-3 w-3" />
                          Matriculado
                        </span>
                      )}
                    </div>
                    <CardTitle className="mt-4">{discipline.name}</CardTitle>
                    <CardDescription>{discipline.teacher_name}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {discipline.schedule_info && (
                      <p className="text-sm text-muted-foreground">
                        {discipline.schedule_info}
                      </p>
                    )}
                    
                    <div className="flex gap-2">
                      {isEnrolled ? (
                        <>
                          <Button asChild className="flex-1">
                            {/* O link para o feedback já estava correto */}
                            <Link href={`/aluno/disciplinas/${discipline.discipline_id}/feedback`}>
                              <Star className="h-4 w-4 mr-2" />
                              Dar Feedback
                            </Link>
                          </Button>
                        </>
                      ) : (
                        <EnrollButton 
                          disciplineId={discipline.discipline_id}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">Nenhuma disciplina disponível no momento</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}