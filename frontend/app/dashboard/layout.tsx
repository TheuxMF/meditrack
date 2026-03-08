'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

const navLinks = [
  { href: '/dashboard',     label: 'Início',     icon: '🏠' },
  { href: '/medicamentos',  label: 'Remédios',   icon: '💊' },
  { href: '/historico',     label: 'Histórico',  icon: '📋' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { usuario, carregando, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!carregando && !usuario) router.push('/login');
  }, [usuario, carregando, router]);

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-400 animate-pulse text-lg">Carregando...</div>
      </div>
    );
  }

  if (!usuario) return null;

  return (
    <div className="min-h-screen flex bg-slate-50">

      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-slate-200 flex flex-col fixed h-full">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-slate-100">
          <span className="text-xl font-bold text-blue-700">💊 MediTrack</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navLinks.map((link) => {
            const ativo = pathname === link.href;
            return (
              <Link key={link.href} href={link.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${ativo
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }`}>
                <span>{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Usuário + Logout */}
        <div className="px-4 py-4 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
              {usuario.username[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-700 truncate">{usuario.username}</p>
              <p className="text-xs text-slate-400 truncate">{usuario.email}</p>
            </div>
          </div>
          <button onClick={logout}
            className="w-full text-sm text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg py-2 transition-colors">
            Sair da conta
          </button>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 ml-60 p-8">
        {children}
      </main>
    </div>
  );
}