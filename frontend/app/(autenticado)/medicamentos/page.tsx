'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

interface Medicamento {
  id: number;
  nome: string;
  dosagem: string;
  unidade_estoque: string;
  quantidade_estoque: number;
  alerta_estoque_minimo: number;
  frequencia_diaria: number;
  horarios: string[];
  observacoes: string;
  ativo: boolean;
  estoque_baixo: boolean;
}

export default function MedicamentosPage() {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [desativando, setDesativando] = useState<number | null>(null);

  const buscar = async () => {
    try {
      const res = await api.get('/medicamentos/');
      setMedicamentos(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { buscar(); }, []);

  const desativar = async (id: number, nome: string) => {
    if (!confirm(`Desativar "${nome}"? O histórico de doses será preservado.`)) return;
    setDesativando(id);
    try {
      await api.delete(`/medicamentos/${id}/`);
      await buscar();
    } catch (err) {
      console.error(err);
    } finally {
      setDesativando(null);
    }
  };

  const ativos   = medicamentos.filter(m => m.ativo);
  const inativos = medicamentos.filter(m => !m.ativo);

  if (carregando) return <div className="text-slate-400 animate-pulse">Carregando...</div>;

  return (
    <div className="max-w-4xl mx-auto">

      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Meus Remédios</h1>
          <p className="text-slate-500 mt-1">{ativos.length} ativo(s)</p>
        </div>
        <Link href="/medicamentos/novo"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
          + Novo remédio
        </Link>
      </div>

      {/* Lista de ativos */}
      {ativos.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <p className="text-4xl mb-3">💊</p>
          <p className="text-slate-500 mb-4">Nenhum remédio cadastrado ainda.</p>
          <Link href="/medicamentos/novo"
            className="inline-block bg-blue-600 text-white text-sm px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors">
            Cadastrar primeiro remédio
          </Link>
        </div>
      ) : (
        <div className="space-y-3 mb-8">
          {ativos.map((med) => (
            <div key={med.id} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">

              {/* Ícone */}
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-xl flex-shrink-0">
                💊
              </div>

              {/* Info principal */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-800">{med.nome}</h3>
                  {med.estoque_baixo && (
                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                      ⚠️ Estoque baixo
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-400 mt-0.5">
                  {med.dosagem} · {med.frequencia_diaria}x ao dia · {med.horarios.join(', ')}
                </p>
              </div>

              {/* Estoque */}
              <div className="text-right flex-shrink-0">
                <p className={`text-lg font-bold ${med.estoque_baixo ? 'text-orange-500' : 'text-slate-700'}`}>
                  {med.quantidade_estoque}
                </p>
                <p className="text-xs text-slate-400">{med.unidade_estoque}</p>
              </div>

              {/* Ações */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link href={`/medicamentos/${med.id}`}
                  className="text-sm text-blue-600 hover:underline px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                  Editar
                </Link>
                <button onClick={() => desativar(med.id, med.nome)}
                  disabled={desativando === med.id}
                  className="text-sm text-slate-400 hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                  {desativando === med.id ? '...' : 'Desativar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inativos */}
      {inativos.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-3">
            Inativos ({inativos.length})
          </h2>
          <div className="space-y-2">
            {inativos.map((med) => (
              <div key={med.id}
                className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex items-center gap-4 opacity-60">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-lg">
                  💊
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-500 line-through">{med.nome}</p>
                  <p className="text-xs text-slate-400">{med.dosagem}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}