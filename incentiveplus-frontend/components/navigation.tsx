// Arquivo: code/components/navigation.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
// 1. REMOVER a linha do Supabase
// import { createClient } from "@/lib/supabase/client"; 
import { GraduationCap, LogOut } from 'lucide-react';

interface NavigationProps {
  userName?: string;
  userRole?: string;
  points?: number;
}

export function Navigation({ userName, userRole, points }: NavigationProps) {
  const pathname = usePathname();
  const router = useRouter();

  // 2. ATUALIZAR a função handleLogout
  const handleLogout = () => {
    // Em vez de chamar o Supabase, nós limpamos o localStorage
    // onde salvamos nosso token e dados do usuário.
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // E então redirecionamos para o login.
    router.push("/auth/login");
  };

  const getNavLinks = () => {
    if (userRole === 'admin') {
      return [
        { href: '/admin', label: 'Dashboard' },
        { href: '/admin/usuarios', label: 'Usuários' },
        { href: '/admin/recompensas', label: 'Recompensas' },
        { href: '/admin/resgates', label: 'Resgates' },
        { href: '/admin/noticias', label: 'Notícias' },
      ];
    } else if (userRole === 'professor') {
      return [
        { href: '/professor', label: 'Dashboard' },
        { href: '/professor/disciplinas', label: 'Disciplinas' },
        { href: '/professor/feedbacks', label: 'Feedbacks' },
      ];
    } else {
      // Links do Aluno (já devem estar corretos)
      return [
        { href: '/aluno', label: 'Dashboard' },
        { href: '/aluno/disciplinas', label: 'Disciplinas' },
        { href: '/aluno/loja', label: 'Loja' },
        { href: '/aluno/historico', label: 'Histórico' },
      ];
    }
  };

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-primary">Incentive+</span>
            </Link>
            
            <div className="hidden md:flex gap-4">
              {getNavLinks().map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname === link.href
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {points !== undefined && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                <span className="text-sm font-semibold text-primary">{points} pts</span>
              </div>
            )}
            
            <div className="hidden sm:flex items-center gap-2">
              <div className="text-sm">
                <div className="font-medium">{userName}</div>
                <div className="text-xs text-muted-foreground capitalize">{userRole}</div>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Sair"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}