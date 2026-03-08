'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function RotaProtegida({ children }: { children: React.ReactNode }) {
  const { isAutenticado, carregando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!carregando && !isAutenticado) {
      router.push('/login');
    }
  }, [isAutenticado, carregando, router]);

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500 text-lg animate-pulse">Carregando...</div>
      </div>
    );
  }

  if (!isAutenticado) return null;

  return <>{children}</>;
}