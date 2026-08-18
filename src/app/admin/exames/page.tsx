"use client";

import { useEffect, useState } from "react";
import {
  Stethoscope,
  DollarSign,
  Plus,
  Save,
  Loader2,
  Search,
  CheckCircle,
  AlertCircle,
  Trash2,
  Edit2,
} from "lucide-react";
import { ExameItem } from "@/types";
import { formatCurrencyBRL } from "@/lib/formatters";

export default function AdminExamesPage() {
  const [loading, setLoading] = useState(true);
  const [savingBase, setSavingBase] = useState(false);
  const [savingExame, setSavingExame] = useState(false);
  const [feedback, setFeedback] = useState("");

  const [valorBasePadrao, setValorBasePadrao] = useState(90.0);
  const [descontoPixReais, setDescontoPixReais] = useState(7.0);
  const [horasLimitePix, setHorasLimitePix] = useState(2);

  const [exames, setExames] = useState<ExameItem[]>([]);
  const [busca, setBusca] = useState("");

  const [novoExameNome, setNovoExameNome] = useState("");
  const [novoExamePreco, setNovoExamePreco] = useState("");
  const [novoExameInstrucao, setNovoExameInstrucao] = useState("");
  const [showNovoForm, setShowNovoForm] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/exames");
      if (res.ok) {
        const data = await res.json();
        setExames(data.exames || []);
        if (data.config) {
          setValorBasePadrao(data.config.valorBasePadrao || 90.0);
          setDescontoPixReais(data.config.descontoPixReais || 7.0);
          setHorasLimitePix(data.config.horasLimitePix || 2);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveConfigBase = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBase(true);
    setFeedback("");
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          valorBasePadrao: Number(valorBasePadrao),
          descontoPixReais: Number(descontoPixReais),
          horasLimitePix: Number(horasLimitePix),
        }),
      });

      if (res.ok) {
        setFeedback("Valores base e desconto PIX atualizados com sucesso!");
        setTimeout(() => setFeedback(""), 4000);
      } else {
        alert("Erro ao salvar valores.");
      }
    } catch {
      alert("Falha na conexão.");
    } finally {
      setSavingBase(false);
    }
  };

  const handleCriarExame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoExameNome.trim() || !novoExamePreco) {
      alert("Informe o nome e o preço do exame.");
      return;
    }

    setSavingExame(true);
    try {
      const res = await fetch("/api/admin/exames", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: novoExameNome.trim().toUpperCase(),
          preco: parseFloat(novoExamePreco.replace(",", ".")),
          instrucaoPreparo: novoExameInstrucao.trim(),
        }),
      });

      if (res.ok) {
        setNovoExameNome("");
        setNovoExamePreco("");
        setNovoExameInstrucao("");
        setShowNovoForm(false);
        loadData();
      } else {
        alert("Erro ao cadastrar novo exame.");
      }
    } catch {
      alert("Falha na conexão.");
    } finally {
      setSavingExame(false);
    }
  };

  const handleUpdateExamePreco = async (id: string, preco: number) => {
    try {
      await fetch(`/api/admin/exames`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, preco }),
      });
      loadData();
    } catch {
      alert("Erro ao atualizar exame.");
    }
  };

  const filtered = exames.filter((ex) =>
    ex.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Tabela de Preços & Catálogo de Exames
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-normal">
          Ajuste os valores do ASO clínico padrão, descontos do PIX e mais de 50 exames complementares
        </p>
      </div>

      {feedback && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-900">
          <CheckCircle className="h-4 w-4 text-emerald-700" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Editor de Preço Base ASO */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <DollarSign className="h-4 w-4 text-[#0F2C59]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Valores Base do Exame Clínico (ASO)
          </h2>
        </div>

        <form onSubmit={handleSaveConfigBase} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Valor Base Padrão (Sem Desconto) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-bold">R$</span>
              <input
                type="number"
                step="0.5"
                value={valorBasePadrao}
                onChange={(e) => setValorBasePadrao(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-slate-900 font-bold text-sm focus:border-[#0F2C59] focus:outline-none transition"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Ex: Balcão ou pagamento a prazo</p>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Desconto para PIX Antecipado (R$) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-bold">R$</span>
              <input
                type="number"
                step="0.5"
                value={descontoPixReais}
                onChange={(e) => setDescontoPixReais(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-emerald-800 font-bold text-sm focus:border-[#0F2C59] focus:outline-none transition"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Valor líquido no PIX: <strong>{formatCurrencyBRL(valorBasePadrao - descontoPixReais)}</strong>
            </p>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Prazo Limite PIX (Horas) *
            </label>
            <input
              type="number"
              value={horasLimitePix}
              onChange={(e) => setHorasLimitePix(parseInt(e.target.value) || 2)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 font-bold text-sm focus:border-[#0F2C59] focus:outline-none transition"
            />
            <p className="text-[11px] text-slate-500 mt-1">Tempo para confirmação do PIX</p>
          </div>

          <div className="sm:col-span-3 pt-2 flex justify-end">
            <button
              type="submit"
              disabled={savingBase}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0F2C59] hover:bg-[#0c2448] px-6 py-2.5 text-xs font-bold text-white shadow-xs transition disabled:opacity-50"
            >
              {savingBase ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>Salvar Alterações de Preço Base</span>
            </button>
          </div>
        </form>
      </div>

      {/* Catálogo de Exames Complementares */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-[#0F2C59]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Exames Complementares ({exames.length})
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setShowNovoForm(!showNovoForm)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 text-sky-900 border border-sky-200 px-3.5 py-1.5 text-xs font-semibold hover:bg-sky-100 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Adicionar Novo Exame</span>
          </button>
        </div>

        {/* Form para novo exame */}
        {showNovoForm && (
          <form onSubmit={handleCriarExame} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3 text-xs">
            <h3 className="font-bold text-slate-900">Cadastrar Novo Exame Complementar</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 mb-1">Nome do Exame *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: POLISSONOGRAFIA"
                  value={novoExameNome}
                  onChange={(e) => setNovoExameNome(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 uppercase font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Preço (R$) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 120.00"
                  value={novoExamePreco}
                  onChange={(e) => setNovoExamePreco(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Instrução de Preparo</label>
                <input
                  type="text"
                  placeholder="Ex: Jejum de 8 horas"
                  value={novoExameInstrucao}
                  onChange={(e) => setNovoExameInstrucao(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNovoForm(false)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={savingExame}
                className="rounded-lg bg-[#0F2C59] px-4 py-1.5 text-xs font-bold text-white shadow-xs"
              >
                {savingExame ? "Salvando..." : "Salvar Exame"}
              </button>
            </div>
          </form>
        )}

        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filtrar exames por nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-[#0F2C59] focus:outline-none transition"
          />
        </div>

        {/* Tabela de Exames */}
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] sticky top-0">
              <tr>
                <th className="py-2.5 px-3">Nome do Exame</th>
                <th className="py-2.5 px-3">Instruções de Preparo</th>
                <th className="py-2.5 px-3">Preço Atual</th>
                <th className="py-2.5 px-3 text-right">Alterar Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((ex) => (
                <tr key={ex.id || ex.nome} className="hover:bg-slate-50 transition">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    {ex.nome}
                  </td>
                  <td className="py-2.5 px-3 text-[11px] text-slate-500 max-w-sm truncate">
                    {ex.instrucaoPreparo || ex.instrucao || "—"}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-[#0F2C59]">
                    {formatCurrencyBRL(ex.preco)}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        const novo = prompt(`Novo preço para ${ex.nome}:`, ex.preco.toString());
                        if (novo !== null && !isNaN(parseFloat(novo))) {
                          handleUpdateExamePreco(ex.id!, parseFloat(novo));
                        }
                      }}
                      className="inline-flex items-center gap-1 rounded bg-slate-100 hover:bg-slate-200 px-2 py-1 text-[11px] text-[#0F2C59] font-semibold border border-slate-300 transition"
                    >
                      <Edit2 className="h-3 w-3" />
                      <span>Editar</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
