'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

export default function EditarMedicamentoPage() {
  const router = useRouter();
  const { id } = useParams();
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [horarioInput, setHorarioInput] = useState('');

  const [form, setForm] = useState({
    nome: '', dosagem: '', unidade_estoque: 'comprimidos',
    quantidade_estoque: '', alerta_estoque_minimo: '5',
    frequencia_diaria: '1', horarios: [] as string[],
    observacoes: '', data_inicio: '', data_fim: '',
  });

  useEffect(() => {
    api.get(`/medicamentos/${id}/`).then((res) => {
      const d = res.data;
      setForm({
        nome: d.nome, dosagem: d.dosagem,
        unidade_estoque: d.unidade_estoque,
        quantidade_estoque: String(d.quantidade_estoque),
        alerta_estoque_minimo: String(d.alerta_estoque_minimo),
        frequencia_diaria: String(d.frequencia_diaria),
        horarios: d.horarios, observacoes: d.observacoes || '',
        data_inicio: d.data_inicio || '', data_fim: d.data_fim || '',
      });
    }).catch(() => setErro('Remédio não encontrado.'))
      .finally(() => setCarregando(false));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const adicionarHorario = () => {
    if (!horarioInput || form.horarios.includes(horarioInput)) return;
    setForm({ ...form, horarios: [...form.horarios, horarioInput].sort() });
    setHorarioInput('');
  };

  const removerHorario = (h: string) => {
    setForm({ ...form, horarios: form.horarios.filter(x => x !== h) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.horarios.length === 0) { setErro('Adicione pelo menos um horário.'); return; }
    setSalvando(true);
    try {
      await api.put(`/medicamentos/${id}/`, {
        ...form,
        quantidade_estoque: Number(form.quantidade_estoque),
        alerta_estoque_minimo: Number(form.alerta_estoque_minimo),
        frequencia_diaria: Number(form.frequencia_diaria),
        data_inicio: form.data_inicio || null,
        data_fim: form.data_fim || null,
      });
      router.push('/medicamentos');
    } catch {
      setErro('Erro ao salvar. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  const inputClass = "w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400";

  if (carregando) return <div className="text-slate-400 animate-pulse">Carregando...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/medicamentos" className="text-slate-400 hover:text-slate-600">←</Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Editar Remédio</h1>
          <p className="text-slate-500 mt-0.5 text-sm">{form.nome}</p>
        </div>
      </div>

      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">{erro}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-slate-700">Informações básicas</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-600 mb-1">Nome *</label>
              <input name="nome" value={form.nome} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Dosagem *</label>
              <input name="dosagem" value={form.dosagem} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Frequência diária *</label>
              <input name="frequencia_diaria" type="number" min="1" max="24"
                value={form.frequencia_diaria} onChange={handleChange} className={inputClass} required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Observações</label>
            <textarea name="observacoes" value={form.observacoes} onChange={handleChange}
              className={inputClass + ' resize-none'} rows={2} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-slate-700">Estoque</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Unidade</label>
              <select name="unidade_estoque" value={form.unidade_estoque} onChange={handleChange} className={inputClass}>
                <option value="comprimidos">Comprimidos</option>
                <option value="capsulas">Cápsulas</option>
                <option value="ml">ml</option>
                <option value="gotas">Gotas</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Quantidade atual</label>
              <input name="quantidade_estoque" type="number" min="0" step="0.5"
                value={form.quantidade_estoque} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Alerta abaixo de</label>
              <input name="alerta_estoque_minimo" type="number" min="1"
                value={form.alerta_estoque_minimo} onChange={handleChange} className={inputClass} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-slate-700">Horários</h2>
          <div className="flex gap-2">
            <input type="time" value={horarioInput} onChange={(e) => setHorarioInput(e.target.value)}
              className={inputClass + ' flex-1'} />
            <button type="button" onClick={adicionarHorario}
              className="px-4 py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
              Adicionar
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.horarios.map((h) => (
              <span key={h} className="flex items-center gap-2 bg-blue-50 text-blue-700 text-sm px-3 py-1.5 rounded-lg border border-blue-200">
                ⏰ {h}
                <button type="button" onClick={() => removerHorario(h)}
                  className="text-blue-400 hover:text-red-500 font-bold">×</button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-3 justify-end pb-8">
          <Link href="/medicamentos"
            className="px-6 py-2.5 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
            Cancelar
          </Link>
          <button type="submit" disabled={salvando}
            className="px-6 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors font-medium">
            {salvando ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      </form>
    </div>
  );
}