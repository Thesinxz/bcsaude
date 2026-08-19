"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Download,
  Calendar,
  Eye,
  Edit,
  Loader2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { AgendamentoData, StatusAgendamento, StatusPagamento } from "@/types";
import { formatCurrencyBRL, formatDateBR, formatCpfCnpj, formatPhone } from "@/lib/formatters";
import ToastContainer from "@/components/ui/Toast";

export default function AdminAgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState<AgendamentoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [selectedAgendamento, setSelectedAgendamento] = useState<AgendamentoData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const loadAgendamentos = async () => {
    setLoading(true);
    try {
      let url = `/api/agendamentos?limit=100`;
      if (query.trim()) url += `&query=${encodeURIComponent(query.trim())}`;
      if (statusFilter) url += `&status=${encodeURIComponent(statusFilter)}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setAgendamentos(data.agendamentos || []);
      }
    } catch (e) {
      console.error("Erro ao carregar agendamentos:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgendamentos();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadAgendamentos();
  };

  const [toasts, setToasts] = useState<{ id: string; type: "success" | "error" | "warning" | "info"; message: string }[]>([]);
  const addToast = (type: "success" | "error" | "warning" | "info", message: string) => {
    setToasts((prev) => [...prev, { id: `${Date.now()}`, type, message }]);
  };
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleUpdateStatus = async (
    statusAgendamento: StatusAgendamento,
    statusPagamento: StatusPagamento
  ) => {
    if (!selectedAgendamento) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/agendamentos/${selectedAgendamento.protocolo}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statusAgendamento, statusPagamento }),
      });

      if (res.ok) {
        setModalOpen(false);
        addToast("success", "Status atualizado com sucesso!");
        loadAgendamentos();
      } else {
        addToast("error", "Erro ao atualizar status.");
      }
    } catch {
      addToast("error", "Falha na conexão com o servidor.");
    } finally {
      setUpdating(false);
    }
  };

  const exportCSV = () => {
    if (agendamentos.length === 0) return;

    const headers = [
      "Protocolo",
      "Data",
      "Horario",
      "Unidade",
      "Trabalhador Nome",
      "Trabalhador CPF",
      "Funcao",
      "Empresa Razao Social",
      "Empresa CNPJ",
      "Exame ASO",
      "Valor Total",
      "Forma Pagamento",
      "Status Atendimento",
      "Status Pagamento",
    ];

    const rows = agendamentos.map((a) => [
      a.protocolo,
      a.dataAgendada,
      a.horaAgendada,
      `"${a.unidadeNome}"`,
      `"${a.trabalhadorNome}"`,
      a.trabalhadorCpf,
      `"${a.trabalhadorFuncao}"`,
      `"${a.empresaRazaoSocial}"`,
      a.empresaDoc,
      a.tipoExame,
      a.valorTotal.toFixed(2),
      a.formaPagamento,
      a.statusAgendamento,
      a.statusPagamento,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `agendamentos_bcsaude_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Gestão de Agendamentos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            Controle de filas, alteração de status de atendimento e confirmação de pagamentos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition"
          >
            <Download className="h-4 w-4 text-[#0F2C59]" />
            <span>Exportar CSV</span>
          </button>

          <button
            type="button"
            onClick={loadAgendamentos}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F2C59] hover:bg-[#0c2448] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por Protocolo, Nome do Trabalhador, CPF, CNPJ ou Razão Social..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-[#0F2C59] focus:outline-none transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-[#0F2C59] focus:outline-none transition"
            >
              <option value="">Todos os Status</option>
              <option value="CONFIRMADO">Confirmado</option>
              <option value="AGENDADO">Agendado (Pendente)</option>
              <option value="CONCLUIDO">Concluído</option>
              <option value="NO_SHOW">No-Show</option>
              <option value="CANCELADO">Cancelado</option>
            </select>

            <button
              type="submit"
              className="rounded-lg bg-[#0F2C59] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0c2448] transition"
            >
              Filtrar
            </button>
          </div>
        </form>
      </div>

      {/* Main Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Protocolo</th>
                <th className="py-3 px-4">Data/Hora</th>
                <th className="py-3 px-4">Trabalhador</th>
                <th className="py-3 px-4">Empresa</th>
                <th className="py-3 px-4">Unidade</th>
                <th className="py-3 px-4">Exame</th>
                <th className="py-3 px-4">Valor Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    <Loader2 className="h-6 w-6 animate-spin text-[#0F2C59] mx-auto mb-2" />
                    <span>Carregando agendamentos...</span>
                  </td>
                </tr>
              ) : agendamentos.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    Nenhum agendamento encontrado com os filtros informados.
                  </td>
                </tr>
              ) : (
                agendamentos.map((ag) => (
                  <tr key={ag.protocolo} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-[#0F2C59]">
                      {ag.protocolo}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-900 block">{formatDateBR(ag.dataAgendada)}</span>
                      <span className="text-[11px] text-slate-500">{ag.horaAgendada}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block truncate max-w-xs">{ag.trabalhadorNome}</span>
                      <span className="text-[11px] text-slate-500 font-mono">{formatCpfCnpj(ag.trabalhadorCpf)} · {ag.trabalhadorFuncao}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="truncate block max-w-xs text-slate-900 font-medium">{ag.empresaRazaoSocial}</span>
                      <span className="text-[11px] text-slate-500 font-mono">{formatCpfCnpj(ag.empresaDoc)}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 truncate max-w-xs">
                      {ag.unidadeNome}
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded bg-sky-50 border border-sky-200 px-2 py-0.5 text-[10px] font-semibold text-sky-900">
                        {ag.tipoExame}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {formatCurrencyBRL(ag.valorTotal)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        {ag.statusAgendamento}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAgendamento(ag);
                          setModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 rounded bg-slate-100 hover:bg-slate-200 px-2.5 py-1 text-[11px] font-semibold text-[#0F2C59] border border-slate-300 transition"
                      >
                        <Edit className="h-3 w-3" />
                        <span>Alterar Status</span>
                      </button>

                      <Link
                        href={`/comprovante/${ag.protocolo}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 rounded bg-sky-50 hover:bg-sky-100 px-2 py-1 text-[11px] font-semibold text-sky-900 border border-sky-200 transition"
                      >
                        <Eye className="h-3 w-3" />
                        <span>Voucher</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Alterar Status */}
      {modalOpen && selectedAgendamento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Gerenciar Atendimento: {selectedAgendamento.protocolo}
                </h3>
                <p className="text-[11px] text-slate-500">{selectedAgendamento.trabalhadorNome}</p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Status do Agendamento:</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["CONFIRMADO", "CONCLUIDO", "NO_SHOW", "CANCELADO"] as StatusAgendamento[]).map(
                    (st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() =>
                          handleUpdateStatus(
                            st,
                            selectedAgendamento.statusPagamento as StatusPagamento
                          )
                        }
                        disabled={updating}
                        className={`p-2 rounded-lg border font-semibold text-center transition ${
                          selectedAgendamento.statusAgendamento === st
                            ? "bg-[#0F2C59] text-white border-[#0F2C59]"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Status do Pagamento:</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["PAGO", "PENDENTE", "FATURADO", "ISENTO"] as StatusPagamento[]).map(
                    (pg) => (
                      <button
                        key={pg}
                        type="button"
                        onClick={() =>
                          handleUpdateStatus(
                            selectedAgendamento.statusAgendamento as StatusAgendamento,
                            pg
                          )
                        }
                        disabled={updating}
                        className={`p-2 rounded-lg border font-semibold text-center transition ${
                          selectedAgendamento.statusPagamento === pg
                            ? "bg-emerald-700 text-white border-emerald-700"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {pg}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
