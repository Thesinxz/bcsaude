"use client";

import { useEffect, useState } from "react";
import { Users, Search, Loader2, Calendar, FileText, User } from "lucide-react";
import { formatDateBR, formatCpfCnpj } from "@/lib/formatters";

interface TrabalhadorItem {
  id: string;
  cpf: string;
  nome: string;
  funcao?: string;
  dataNascimento?: string;
  createdAt: string;
  agendamentos?: {
    protocolo: string;
    dataAgendada: string;
    tipoExame: string;
    statusAgendamento: string;
    empresaRazaoSocial: string;
  }[];
}

export default function AdminTrabalhadoresPage() {
  const [trabalhadores, setTrabalhadores] = useState<TrabalhadorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");

  const loadTrabalhadores = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/trabalhadores");
      if (res.ok) {
        const data = await res.json();
        setTrabalhadores(data.trabalhadores || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrabalhadores();
  }, []);

  const filtered = trabalhadores.filter(
    (t) =>
      t.nome.toLowerCase().includes(busca.toLowerCase()) ||
      t.cpf.includes(busca) ||
      (t.funcao && t.funcao.toLowerCase().includes(busca.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Cadastro de Trabalhadores & Histórico
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-normal">
          Pesquisa de colaboradores atendidos por CPF e histórico de exames realizados
        </p>
      </div>

      {/* Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por Nome do Colaborador, CPF ou Função..."
            value={busca}
            onChange={(e) => {
              const val = e.target.value;
              const hasLetters = /[a-zA-Z]/.test(val);
              if (!hasLetters && val.replace(/\D/g, "").length > 0) {
                setBusca(formatCpfCnpj(val));
              } else {
                setBusca(val);
              }
            }}
            className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-[#0F2C59] focus:outline-none transition"
          />
        </div>
      </div>

      {/* Grid de Trabalhadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 py-12 text-center text-slate-500">
            <Loader2 className="h-6 w-6 animate-spin text-[#0F2C59] mx-auto mb-2" />
            <span>Carregando trabalhadores...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-slate-500 rounded-xl border border-slate-200 bg-white p-8">
            Nenhum trabalhador encontrado.
          </div>
        ) : (
          filtered.map((trab) => (
            <div
              key={trab.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <User className="h-4 w-4 text-[#0F2C59]" />
                    {trab.nome}
                  </h3>
                  <span className="font-mono text-xs text-slate-500 font-medium">{formatCpfCnpj(trab.cpf)}</span>
                </div>
                {trab.funcao && (
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                    {trab.funcao}
                  </span>
                )}
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                {trab.dataNascimento && (
                  <p className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>Nascimento: {formatDateBR(trab.dataNascimento)}</span>
                  </p>
                )}

                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-700 block mb-1">
                    Histórico de Agendamentos ({(trab.agendamentos || []).length}):
                  </span>
                  {(trab.agendamentos || []).length === 0 ? (
                    <span className="text-slate-400 text-[11px]">Nenhum exame registrado</span>
                  ) : (
                    <div className="space-y-1">
                      {trab.agendamentos?.map((ag) => (
                        <div
                          key={ag.protocolo}
                          className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200 text-[11px]"
                        >
                          <span className="font-mono font-bold text-[#0F2C59]">
                            {ag.protocolo} ({ag.tipoExame})
                          </span>
                          <span className="text-slate-600">
                            {formatDateBR(ag.dataAgendada)} · <strong className="text-emerald-800">{ag.statusAgendamento}</strong>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
