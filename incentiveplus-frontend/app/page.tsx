// Arquivo: code/app/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, BookOpen, GraduationCap, TrendingUp } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 text-balance">
              Incentive+
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-blue-100 text-pretty">
              Sua jornada educacional gamificada. Participe, ganhe pontos e resgate recompensas incríveis!
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
                <Link href="/auth/login">Entrar</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                <Link href="/auth/sign-up">Criar Conta</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Como Funciona</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <GraduationCap className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Participe</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Participe ativamente das aulas e atividades educacionais
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-10 w-10 mb-2 text-secondary" />
                <CardTitle>Ganhe Pontos</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Acumule pontos através de feedbacks e engajamento nas disciplinas
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Award className="h-10 w-10 mb-2 text-accent" />
                <CardTitle>Resgate Prêmios</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Troque seus pontos por mentorias, cursos e benefícios educacionais
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BookOpen className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Aprenda Mais</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Acesse dicas, notícias e conteúdo exclusivo para potencializar seus estudos
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 to-blue-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-[#1e293b]">Pronto para começar?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Junte-se a centenas de alunos que já estão aproveitando o sistema de recompensas educacionais
          </p>
          <Button asChild size="lg">
            <Link href="/auth/sign-up">Criar Conta Gratuita</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 Incentive+. Sistema de gamificação educacional.</p>
        </div>
      </footer>
    </div>
  );
}