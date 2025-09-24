'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// Este é o componente HomePage, a raiz do seu site.
export default function HomePage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Não faça nada enquanto a autenticação estiver carregando
    if (loading) {
      return;
    }

    // Se estiver autenticado, vai para o feed. Senão, vai para o login.
    if (isAuthenticated) {
      router.replace('/feed');
    } else {
      router.replace('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Mostra um spinner de carregamento enquanto a verificação acontece
  return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-600"></div>
      </div>
  );
}