"use client";

import { useEffect, useState } from "react";
import { MapPin, Phone, Clock, Plus, Loader2 } from "lucide-react";
import { UnidadeItem } from "@/types";
import { formatPhone } from "@/lib/formatters";
import ToastContainer from "@/components/ui/Toast";

export default function AdminUnidadesPage() {
  const [unidades, setUnidades] = useState<UnidadeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalNovo, setModalNovo] = useState(false);

  const [toasts, setToasts] = useState<{ id: string; type: "success" | "error" | "warning" | "info"; message: string }[]>([]);
  const addToast = (type: "success" | "error" | "warning" | "info", message: string) => {
    setToasts((prev) => [...prev, { id: `${Date.now()}`, type, message }]);
  };
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const [novoNome, setNovoNome] = useState("");
  const [novoEndereco, setNovoEndereco] = useState("");
  const [novoCidade, setNovoCidade] = useState("");
  const [novoUf, setNovoUf] = useState("MS");
  const [novoTelefone, setNovoTelefone] = useState("(67) 98113-1076");
  const [saving, setSaving] = useState(false);

  const loadUnidades = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/unidades");
      if (res.ok) {
        const data = await res.json();
        setUnidades(data || []);
      }
    } catch {
      console.error("Erro ao carregar unidades");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnidades();
  }, []);

  const handleSalvarUnidade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim() || !novoEndereco.trim()) {
      addToast("warning", "Preencha o nome e o endereço da unidade.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/unidades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: novoNome.trim(),
          endereco: novoEndereco.trim(),
          cidade: novoCidade.trim(),
          uf: novoUf.trim(),
          telefone: novoTelefone.trim(),
          horariosDisponiveis: [
            "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
            "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
          ],
        }),
      });

      if (res.ok) {
        setModalNovo(false);
        setNovoNome("");
        setNovoEndereco("");
        setNovoCidade("");
        addToast("success", "Unidade cadastrada com sucesso!");
        loadUnidades();
      } else {
        addToast("error", "Erro ao cadastrar unidade.");
      }
    } catch {
      addToast("error", "Falha na conexão com o servidor.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Unidades de Atendimento & Horários
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            Gestão das clínicas físicas oficiais no Mato Grosso do Sul
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalNovo(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F2C59] hover:bg-[#0c2448] px-4 py-2 text-xs font-bold text-white shadow-xs transition"
        >
          <Plus className="h-4 w-4" />
          <span>Cadastrar Nova Unidade</span>
        </button>
      </div>

      {/* Grid de Unidades */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 py-12 text-center text-slate-500">
            <Loader2 className="h-6 w-6 animate-spin text-[#0F2C59] mx-auto mb-2" />
            <span>Carregando unidades...</span>
          </div>
        ) : (
          unidades.map((u) => (
            <div
              key={u.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-[#0F2C59]">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{u.nome}</h3>
                    <span className="text-[11px] text-slate-500">{u.cidade} - {u.uf}</span>
                  </div>
                </div>
                <span className="rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  {u.ativo ? "Ativa" : "Inativa"}
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <p><span className="text-slate-500">Endereço:</span> <strong className="text-slate-800">{u.endereco}</strong></p>
                <p className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <span>{u.telefone}</span>
                </p>

                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-700 block mb-1.5 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-[#0F2C59]" />
                    Horários Disponíveis ({(u.horariosDisponiveis || []).length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(u.horariosDisponiveis || []).map((h) => (
                      <span
                        key={h}
                        className="rounded bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] text-slate-700 font-semibold"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Nova Unidade */}
      {modalNovo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Cadastrar Unidade</h3>
              <button
                type="button"
                onClick={() => setModalNovo(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarUnidade} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nome da Unidade *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Unidade Jardim / MS"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:border-[#0F2C59] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Endereço Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Rua, número e bairro"
                  value={novoEndereco}
                  onChange={(e) => setNovoEndereco(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:border-[#0F2C59] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Cidade *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Jardim"
                    value={novoCidade}
                    onChange={(e) => setNovoCidade(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:border-[#0F2C59] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">UF *</label>
                  <input
                    type="text"
                    required
                    value={novoUf}
                    onChange={(e) => setNovoUf(e.target.value.toUpperCase())}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 uppercase font-bold focus:border-[#0F2C59] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Telefone / WhatsApp</label>
                <input
                  type="text"
                  maxLength={15}
                  placeholder="(67) 98113-1076"
                  value={novoTelefone}
                  onChange={(e) => setNovoTelefone(formatPhone(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:border-[#0F2C59] focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalNovo(false)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-[#0F2C59] hover:bg-[#0c2448] px-5 py-2 font-bold text-white shadow-xs"
                >
                  {saving ? "Salvando..." : "Cadastrar Unidade"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
