// Arquivo: code/lib/api.ts
import { toast } from '@/hooks/use-toast'; 

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface ApiErrorData {
  message: string;
}

export async function apiFetch(
  path: string,
  options: RequestInit = {}
) {
  let token: string | null = null;
  
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token');
  }

  const headers = new Headers(options.headers as HeadersInit);

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });

    const data = await res.json();

    if (!res.ok) {
      // Se a API retornar um erro (ex: "Credenciais inválidas"):
      throw new Error((data as ApiErrorData).message || 'Algo deu errado na API');
    }

    return data;

  } catch (error) {
    console.error(`Erro na chamada API [${options.method || 'GET'} ${path}]:`, error);
    
    // Mostra o erro para o usuário usando o sistema de toast
    toast({
      title: 'Erro',
      description: error instanceof Error ? error.message : 'Erro de conexão',
      variant: 'destructive',
    });

    throw error; // Propaga o erro para quem chamou
  }
}