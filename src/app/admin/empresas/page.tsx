"use client";

import { useEffect, useState } from "react";
import { Building2, Search, Plus, Loader2, MapPin, Mail, Phone, CheckCircle2 } from "lucide-react";
import { formatCpfCnpj, formatPhone } from "@/lib/formatters";
import ToastContainer from "@/components/ui/Toast";

interface EmpresaItem {
  id: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  emailAso: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  uf?: string;
  tipoConvenio: string;
  createdAt: string;
}

export default function AdminEmpresasPage() {
  const [empresas, setEmpresas] = useState<EmpresaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");

  const [modalNovo, setModalNovo] = useState(false);
  const [novoCnpj, setNovoCnpj] = useState("");
  const [novoRazao, setNovoRazao] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [novoTelefone, setNovoTelefone] = useState("");
  const [novoConvenio, setNovoConvenio] = useState("AVULSO");
  const [saving, setSaving] = useState(false);
  const [consultandoCnpj, setConsultandoCnpj] = useState(false);

  const loadEmpresas = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/empresas");
      if (res.ok) {
        const data = await res.json();
        setEmpresas(data.empresas || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmpresas();
  }, []);

  const [toasts, setToasts] = useState<{ id: string; type: "success" | "error" | "warning" | "info"; message: string }[]>([]);
  const addToast = (type: "success" | "error" | "warning" | "info", message: string) => {
    setToasts((prev) => [...prev, { id: `${Date.now()}`, type, message }]);
  };
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleBuscarCnpj = async () => {
    const raw = novoCnpj.replace(/\D/g, "");
    if (raw.length !== 14) {
      addToast("warning", "Informe um CNPJ com 14 dígitos.");
      return;
    }

    setConsultandoCnpj(true);
    try {
      const res = await fetch(`/api/cnpj/${raw}`);
      const data = await res.json();
      if (res.ok && data.sucesso) {
        setNovoRazao(data.razao_social || "");
        if (data.email) setNovoEmail(data.email);
        if (data.telefone) setNovoTelefone(data.telefone);
        addToast("success", `Empresa localizada: ${data.razao_social}`);
      } else {
        addToast("error", "CNPJ não encontrado na Receita Federal.");
      }
    } catch {
      addToast("error", "Erro ao consultar CNPJ na Receita Federal.");
    } finally {
      setConsultandoCnpj(false);
    }
  };

  const handleSalvarEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoCnpj.trim() || !novoRazao.trim()) {
      addToast("warning", "Preencha o CNPJ e a Razão Social da empresa.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/empresas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cnpj: novoCnpj,
          razaoSocial: novoRazao,
          emailAso: novoEmail,
          telefone: novoTelefone,
          tipoConvenio: novoConvenio,
        }),
      });

      if (res.ok) {
        setModalNovo(false);
        setNovoCnpj("");
        setNovoRazao("");
        setNovoEmail("");
        setNovoTelefone("");
        addToast("success", "Empresa cadastrada com sucesso!");
        loadEmpresas();
      } else {
        addToast("error", "Erro ao cadastrar empresa.");
      }
    } catch {
      addToast("error", "Falha na conexão com o servidor.");
    } finally {
      setSaving(false);
    }
  };

  const filtered = empresas.filter(
    (e) =>
      e.razaoSocial.toLowerCase().includes(busca.toLowerCase()) ||
      e.cnpj.includes(busca)
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Cadastro de Empresas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            Base de clientes corporativos com CNPJ, contatos de RH e tipo de convênio
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalNovo(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F2C59] hover:bg-[#0c2448] px-4 py-2 text-xs font-bold text-white shadow-xs transition"
        >
          <Plus className="h-4 w-4" />
          <span>Cadastrar Nova Empresa</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por CNPJ ou Razão Social..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-[#0F2C59] focus:outline-none transition"
          />
        </div>
      </div>

      {/* Grid de Empresas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 py-12 text-center text-slate-500">
            <Loader2 className="h-6 w-6 animate-spin text-[#0F2C59] mx-auto mb-2" />
            <span>Carregando empresas...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-slate-500 rounded-xl border border-slate-200 bg-white p-8">
            Nenhuma empresa encontrada.
          </div>
        ) : (
          filtered.map((emp) => (
            <div
              key={emp.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{emp.razaoSocial}</h3>
                  <span className="font-mono text-xs text-slate-500 font-medium">{formatCpfCnpj(emp.cnpj)}</span>
                </div>
                <span className="rounded bg-sky-50 border border-sky-200 px-2 py-0.5 text-[10px] font-bold text-sky-900">
                  {emp.tipoConvenio}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <p className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span>{emp.emailAso || "E-mail não informado"}</span>
                </p>
                {emp.telefone && (
                  <p className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>{formatPhone(emp.telefone)}</span>
                  </p>
                )}
                {emp.endereco && (
                  <p className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{emp.endereco}</span>
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Nova Empresa */}
      {modalNovo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Cadastrar Empresa</h3>
              <button
                type="button"
                onClick={() => setModalNovo(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarEmpresa} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">CNPJ *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="00.000.000/0001-00"
                    value={novoCnpj}
                    onChange={(e) => setNovoCnpj(formatCpfCnpj(e.target.value))}
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:border-[#0F2C59] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleBuscarCnpj}
                    disabled={consultandoCnpj}
                    className="rounded-lg border border-slate-300 bg-slate-100 hover:bg-slate-200 px-3 py-2 text-[11px] font-semibold text-slate-800"
                  >
                    {consultandoCnpj ? "Buscando..." : "Buscar Receita"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Razão Social *</label>
                <input
                  type="text"
                  required
                  placeholder="Razão social completa"
                  value={novoRazao}
                  onChange={(e) => setNovoRazao(e.target.value.toUpperCase())}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 uppercase font-medium focus:border-[#0F2C59] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">E-mail para Receber ASO</label>
                <input
                  type="email"
                  placeholder="rh@empresa.com.br"
                  value={novoEmail}
                  onChange={(e) => setNovoEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:border-[#0F2C59] focus:outline-none"
                />
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

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tipo de Contrato</label>
                <select
                  value={novoConvenio}
                  onChange={(e) => setNovoConvenio(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:border-[#0F2C59] focus:outline-none"
                >
                  <option value="AVULSO">Avulso / Pagamento Pontual</option>
                  <option value="CONTRATO_MENSAL">Contrato Mensal / Faturado PJ</option>
                  <option value="KIT_PROPRIO">Kit Próprio / Assessoria Externa</option>
                </select>
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
                  {saving ? "Salvando..." : "Cadastrar Empresa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
