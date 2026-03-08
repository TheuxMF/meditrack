'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';

interface DoseHoje {
  id: number;
  horario_previsto: string;
  data_hora_tomada: string;
  quantidade_tomada: string;
}

interface MedicamentoHoje {
  id: number;
  nome: string;
  dosagem: string;
  horarios: string[];
  estoque_baixo: boolean;
  quantidade_estoque: number;
  doses_hoje: DoseHoje[];
}

export default function DashboardPage() {
  const { usuario } = useAuth();
  const [medicamentos, setMedicamentos] = useState<MedicamentoHoje[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [registrando, setRegistrando] = useState<number | null>(null);

  const hoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  const buscarDados = async () => {
    try {
      const res = await api.get('/medicamentos/hoje/');
      setMedicamentos(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { buscarDados(); }, []);

  const registrarDose = async (medId: number, horario: string) => {
    setRegistrando(medId);
    try {
      await api.post('/doses/', {
        medicamento: medId,
        data_hora_tomada: new Date().toISOString(),
        horario_previsto: horario,
        quantidade_tomada: 1,
      });
      await buscarDados(); // Atualiza os dados após registrar
    } catch (err) {
      console.error(err);
    } finally {
      setRegistrando(null);
    }
  };

  // Estatísticas rápidas
  const totalHorarios = medicamentos.reduce((acc, m) => acc + m.horarios.length, 0);
  const totalTomados  = medicamentos.reduce((acc, m) => acc + m.doses_hoje.length, 0);
  const alertasEstoque = medicamentos.filter((m) => m.estoque_baixo).length;
  const adesao = totalHorarios > 0 ? Math.round((totalTomados / totalHorarios) * 100) : 0;

  if (carregando) {
    return <div className="text-slate-400 animate-pulse">Carregando...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">

      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">
          Olá, {usuario?.username}! 👋
        </h1>
        <p className="text-slate-500 capitalize mt-1">{hoje}</p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Doses hoje</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">
            {totalTomados}<span className="text-slate-300 text-xl">/{totalHorarios}</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">tomadas / previstas</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Adesão hoje</p>
          <p className={`text-3xl font-bold mt-1 ${adesao >= 80 ? 'text-green-600' : adesao >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
            {adesao}%
          </p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div className="bg-green-500 h-1.5 rounded-full transition-all"
              style={{ width: `${adesao}%` }} />
          </div>
        </div>

        <div className={`rounded-xl border p-5 ${alertasEstoque > 0 ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-200'}`}>
          <p className="text-sm text-slate-500">Estoque baixo</p>
          <p className={`text-3xl font-bold mt-1 ${alertasEstoque > 0 ? 'text-orange-500' : 'text-slate-300'}`}>
            {alertasEstoque}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {alertasEstoque > 0 ? 'remédio(s) para repor' : 'estoques ok'}
          </p>
        </div>
      </div>

      {/* Alertas de estoque baixo */}
      {alertasEstoque > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <span className="text-orange-400 text-xl">⚠️</span>
          <div>
            <p className="text-sm font-medium text-orange-700">Estoque baixo!</p>
            <p className="text-sm text-orange-600 mt-0.5">
              {medicamentos.filter(m => m.estoque_baixo).map(m => m.nome).join(', ')} — lembre de repor.
            </p>
          </div>
        </div>
      )}

      {/* Remédios do dia */}
      <h2 className="text-lg font-semibold text-slate-700 mb-4">Remédios de hoje</h2>

      {medicamentos.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <p className="text-4xl mb-3">💊</p>
          <p className="text-slate-500">Nenhum remédio cadastrado ainda.</p>
          <a href="/medicamentos" className="inline-block mt-4 text-sm text-blue-600 hover:underline">
            Cadastrar primeiro remédio →
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {medicamentos.map((med) => (
            <div key={med.id} className="bg-white rounded-xl border border-slate-200 p-5">
              {/* Header do card */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-800">{med.nome}</h3>
                  <p className="text-sm text-slate-400">{med.dosagem}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full
                    ${med.estoque_baixo
                      ? 'bg-orange-100 text-orange-600'
                      : 'bg-green-100 text-green-600'}`}>
                    {med.quantidade_estoque} unidades
                  </span>
                </div>
              </div>

              {/* Horários */}
              <div className="flex flex-wrap gap-2">
                {med.horarios.map((horario) => {
                  const jaFoi = med.doses_hoje.some(d => d.horario_previsto === horario);
                  return (
                    <button key={horario}
                      onClick={() => !jaFoi && registrarDose(med.id, horario)}
                      disabled={jaFoi || registrando === med.id}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                        ${jaFoi
                          ? 'bg-green-50 text-green-600 border border-green-200 cursor-default'
                          : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 cursor-pointer'
                        }`}>
                      {jaFoi ? '✅' : '⏰'} {horario}
                      {jaFoi ? ' Tomado' : ' Registrar'}
                    </button>
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