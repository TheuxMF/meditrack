'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Dose {
  id: number;
  medicamento: number;
  medicamento_nome: string;
  data_hora_tomada: string;
  horario_previsto: string;
  quantidade_tomada: string;
  no_horario: boolean;
  observacao: string;
  criado_em: string;
}

interface Medicamento {
  id: number;
  nome: string;
}

export default function HistoricoPage() {
  const [doses, setDoses] = useState<Dose[]>([]);
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [excluindo, setExcluindo] = useState<number | null>(null);

  // Filtros
  const [filtroMed, setFiltroMed] = useState('');
  const [filtroData, setFiltroData] = useState('');

  const buscar = async () => {
    setCarregando(true);
    try {
      const params = new URLSearchParams();
      if (filtroMed)  params.append('medicamento', filtroMed);
      if (filtroData) params.append('data', filtroData);

      const [dosesRes, medsRes] = await Promise.all([
        api.get(`/doses/?${params.toString()}`),
        api.get('/medicamentos/'),
      ]);
      setDoses(dosesRes.data);
      setMedicamentos(medsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { buscar(); }, [filtroMed, filtroData]);

  const excluir = async (id: number) => {
    if (!confirm('Excluir este registro? O estoque será restaurado automaticamente.')) return;
    setExcluindo(id);
    try {
      await api.delete(`/doses/${id}/`);
      setDoses(doses.filter(d => d.id !== id));
    } catch (err: any) {
      const msg = err.response?.data?.erro || 'Não foi possível excluir.';
      alert(msg);
    } finally {
      setExcluindo(null);
    }
  };

  const limparFiltros = () => {
    setFiltroMed('');
    setFiltroData('');
  };

  const formatarDataHora = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const formatarData = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Agrupa doses por data
  const dosesAgrupadas = doses.reduce((grupos, dose) => {
    const data = new Date(dose.data_hora_tomada).toLocaleDateString('pt-BR', {
      weekday: 'long', day: 'numeric', month: 'long'
    });
    if (!grupos[data]) grupos[data] = [];
    grupos[data].push(dose);
    return grupos;
  }, {} as Record<string, Dose[]>);

  const temFiltro = filtroMed || filtroData;

  return (
    <div className="max-w-3xl mx-auto">

      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Histórico de Doses</h1>
        <p className="text-slate-500 mt-1">{doses.length} registro(s) encontrado(s)</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-40">
          <label className="block text-xs font-medium text-slate-500 mb-1">Remédio</label>
          <select value={filtroMed} onChange={(e) => setFiltroMed(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="">Todos</option>
            {medicamentos.map((m) => (
              <option key={m.id} value={m.id}>{m.nome}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-40">
          <label className="block text-xs font-medium text-slate-500 mb-1">Data</label>
          <input type="date" value={filtroData} onChange={(e) => setFiltroData(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>

        {temFiltro && (
          <button onClick={limparFiltros}
            className="px-4 py-2 text-sm text-slate-500 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
            Limpar filtros
          </button>
        )}
      </div>

      {/* Conteúdo */}
      {carregando ? (
        <div className="text-slate-400 animate-pulse text-center py-10">Carregando...</div>
      ) : doses.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-slate-500">
            {temFiltro ? 'Nenhuma dose encontrada com esses filtros.' : 'Nenhuma dose registrada ainda.'}
          </p>
          {temFiltro && (
            <button onClick={limparFiltros}
              className="mt-4 text-sm text-blue-600 hover:underline">
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(dosesAgrupadas).map(([data, dosesDoGrupo]) => (
            <div key={data}>
              {/* Separador de data */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-medium text-slate-500 capitalize">{data}</span>
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400">{dosesDoGrupo.length} dose(s)</span>
              </div>

              {/* Doses do grupo */}
              <div className="space-y-2">
                {dosesDoGrupo.map((dose) => {
                  const dentroUltas24h = (new Date().getTime() - new Date(dose.criado_em).getTime()) < 86400000;

                  return (
                    <div key={dose.id}
                      className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">

                      {/* Ícone de status */}
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0
                        ${dose.no_horario ? 'bg-green-50' : 'bg-yellow-50'}`}>
                        {dose.no_horario ? '✅' : '⏱️'}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 text-sm">{dose.medicamento_nome}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {formatarDataHora(dose.data_hora_tomada)}
                          {dose.horario_previsto && (
                            <span className="ml-2 text-slate-300">· previsto {dose.horario_previsto}</span>
                          )}
                        </p>
                        {dose.observacao && (
                          <p className="text-xs text-slate-400 mt-0.5 italic">"{dose.observacao}"</p>
                        )}
                      </div>

                      {/* Quantidade */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold text-slate-700">{dose.quantidade_tomada}</p>
                        <p className="text-xs text-slate-400">unidade(s)</p>
                      </div>

                      {/* Badge horário */}
                      <div className="flex-shrink-0">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium
                          ${dose.no_horario
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'}`}>
                          {dose.no_horario ? 'No horário' : 'Fora do horário'}
                        </span>
                      </div>

                      {/* Excluir (só nas últimas 24h) */}
                      {dentroUltas24h && (
                        <button onClick={() => excluir(dose.id)}
                          disabled={excluindo === dose.id}
                          className="text-slate-300 hover:text-red-400 transition-colors text-lg flex-shrink-0"
                          title="Excluir registro">
                          {excluindo === dose.id ? '...' : '×'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}