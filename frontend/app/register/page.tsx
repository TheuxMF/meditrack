'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmar: '' });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (form.password !== form.confirmar) {
      setErro('As senhas não coincidem.');
      return;
    }
    if (form.password.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setCarregando(true);
    try {
      const res = await api.post('/auth/register/', {
        username: form.username,
        email: form.email,
        password: form.password,
      });
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      router.push('/dashboard');
    } catch (err: any) {
      const data = err.response?.data;
      setErro(data?.erro || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="text-5xl mb-3">💊</div>
          <h1 className="text-3xl font-bold text-blue-800">MediTrack</h1>
          <p className="text-slate-500 mt-1">Crie sua conta gratuita</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-slate-700 mb-6">Criar nova conta</h2>

          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
              {erro}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Usuário</label>
              <input name="username" type="text" value={form.username} onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"               placeholder="seu_usuario" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">E-mail</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"               placeholder="seu@email.com" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Senha</label>
              <input name="password" type="password" value={form.password} onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"               placeholder="mínimo 6 caracteres" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Confirmar senha</label>
              <input name="confirmar" type="password" value={form.confirmar} onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"               placeholder="••••••••" required />
            </div>

            <button type="submit" disabled={carregando}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-lg py-2.5 text-sm transition-colors">
              {carregando ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}