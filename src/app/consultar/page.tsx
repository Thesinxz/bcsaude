"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Loader2, Calendar, Clock, MapPin, User, Building2, AlertCircle, Eye, ArrowRight } from "lucide-react";
import { AgendamentoData } from "@/types";
import { formatCurrencyBRL, formatDateBR, formatCpfCnpj } from "@/lib/formatters";

export default function ConsultarPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [resultados, setResultados] = useState<AgendamentoData[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) {
      setErrorMsg("Informe um Protocolo, CPF do Trabalhador ou CNPJ da Empresa.");
      return;
    }

    setErrorMsg("");
    setLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/agendamentos?query=${encodeURIComponent(query.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setResultados(data.agendamentos || []);
      } else {
        setErrorMsg("Erro ao consultar agendamentos.");
      }
    } catch {
      setErrorMsg("Falha na conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMADO":
        return "bg-emerald-50 text-emerald-900 border-emerald-300";
      case "AGENDADO":
        return "bg-sky-50 text-sky-900 border-sky-300";
      case "CONCLUIDO":
        return "bg-teal-50 text-teal-900 border-teal-300";
      case "CANCELADO":
        return "bg-rose-50 text-rose-900 border-rose-300";
      case "NO_SHOW":
        return "bg-amber-50 text-amber-900 border-amber-300";
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  return (
    <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8 pb-20 bg-slate-50">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Title */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3.5 py-1 text-xs font-bold text-[#0F2C59] border border-sky-200 mb-3">
            <Search className="h-3.5 w-3.5 text-[#0F2C59]" />
            <span>Portal de Autoatendimento</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Consultar Agendamento de Exames
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-md mx-auto font-normal">
            Localize seu agendamento, reimprima o comprovante com QR Code ou verifique o status do atendimento.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Digite o Protocolo (ex: BC-2026-1001), CPF ou CNPJ..."
                value={query}
                onChange={(e) => {
                  const val = e.target.value;
                  const hasLetters = /[a-zA-Z]/.test(val);
                  if (!hasLetters && val.replace(/\D/g, "").length > 0) {
                    setQuery(formatCpfCnpj(val));
                  } else {
                    setQuery(val);
                  }
                }}
                className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm font-mono sm:font-sans text-slate-900 placeholder-slate-400 focus:border-[#0F2C59] focus:outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0F2C59] hover:bg-[#0c2448] px-6 py-3 text-sm font-semibold text-white shadow-xs transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Consultando...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>Buscar Agendamento</span>
                </>
              )}
            </button>
          </form>

          {errorMsg && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Search Results */}
        {hasSearched && !loading && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Resultados Encontrados ({resultados.length})
              </h2>
            </div>

            {resultados.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
                <AlertCircle className="mx-auto h-10 w-10 text-slate-400 mb-2" />
                <h3 className="text-sm font-bold text-slate-900">Nenhum agendamento encontrado</h3>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto font-normal">
                  Verifique se o protocolo ou CPF/CNPJ digitado está correto. Caso precise de ajuda, entre em contato via WhatsApp.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {resultados.map((item) => (
                  <div
                    key={item.protocolo}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-bold text-[#0F2C59]">
                          {item.protocolo}
                        </span>
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold border ${getStatusBadge(
                            item.statusAgendamento || "AGENDADO"
                          )}`}
                        >
                          {item.statusAgendamento}
                        </span>
                      </div>

                      <span className="text-xs text-slate-500 font-normal">
                        Agendado em: {new Date(item.createdAt || "").toLocaleDateString("pt-BR")}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[11px] flex items-center gap-1">
                          <User className="h-3.5 w-3.5 text-[#0F2C59]" /> Trabalhador
                        </span>
                        <strong className="text-slate-900 block truncate">{item.trabalhadorNome}</strong>
                        <span className="text-slate-600 font-mono">{formatCpfCnpj(item.trabalhadorCpf)} · {item.trabalhadorFuncao}</span>
                      </div>

                      <div>
                        <span className="text-slate-500 block text-[11px] flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5 text-sky-800" /> Empresa Contratante
                        </span>
                        <strong className="text-slate-900 block truncate">{item.empresaRazaoSocial}</strong>
                        <span className="text-slate-600 font-mono">{formatCpfCnpj(item.empresaDoc)}</span>
                      </div>

                      <div>
                        <span className="text-slate-500 block text-[11px] flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-teal-800" /> Data & Unidade
                        </span>
                        <strong className="text-slate-900 block">
                          {formatDateBR(item.dataAgendada)} às {item.horaAgendada}
                        </strong>
                        <span className="text-slate-600 truncate block">{item.unidadeNome}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Exame:</span>
                        <span className="rounded bg-sky-50 border border-sky-200 px-2 py-0.5 text-xs font-semibold text-sky-900">
                          {item.tipoExame}
                        </span>
                        <span className="text-xs text-slate-500">Total:</span>
                        <span className="text-xs font-bold text-slate-900">
                          {formatCurrencyBRL(item.valorTotal)}
                        </span>
                      </div>

                      <Link
                        href={`/comprovante/${item.protocolo}`}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-[#0F2C59] border border-slate-300 px-4 py-2 transition"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Ver Comprovante com QR Code</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
