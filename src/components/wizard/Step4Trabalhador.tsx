"use client";

import { useState } from "react";
import {
  UserCheck,
  Stethoscope,
  Search,
  Trash2,
  AlertCircle,
  Info,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  FileCheck,
  Loader2,
  History,
} from "lucide-react";
import { ExameItem, TipoExame } from "@/types";
import { formatCPF, formatCurrencyBRL } from "@/lib/formatters";
import { isValidCPF } from "@/lib/validators";

interface Step4TrabalhadorProps {
  trabalhadorCpf: string;
  trabalhadorNome: string;
  trabalhadorFuncao: string;
  trabalhadorNasc: string;
  tipoExame: string;
  examesComplementares: ExameItem[];
  todosExamesDisponiveis: ExameItem[];
  onChange: (fields: Partial<{
    trabalhadorCpf: string;
    trabalhadorNome: string;
    trabalhadorFuncao: string;
    trabalhadorNasc: string;
    tipoExame: string;
    examesComplementares: ExameItem[];
  }>) => void;
  onNext: () => void;
  onBack: () => void;
}

const tiposExameDetalhes: { id: TipoExame; title: string; desc: string; badge: string }[] = [
  {
    id: "ADMISSIONAL",
    title: "ADMISSIONAL",
    desc: "Exame obrigatório antes de o colaborador iniciar as atividades na empresa.",
    badge: "Contratação",
  },
  {
    id: "DEMISSIONAL",
    title: "DEMISSIONAL",
    desc: "Exame realizado no desligamento do trabalhador para comprovar aptidão física/mental.",
    badge: "Desligamento",
  },
  {
    id: "PERIÓDICO",
    title: "PERIÓDICO",
    desc: "Acompanhamento anual da saúde do trabalhador conforme o PCMSO (NR-7).",
    badge: "Rotina Anual",
  },
  {
    id: "MUDANÇA DE FUNÇÃO",
    title: "MUDANÇA DE FUNÇÃO / RISCO",
    desc: "Realizado quando há alteração de cargo com exposição a novos riscos ambientais.",
    badge: "Novo Cargo",
  },
  {
    id: "RETORNO AO TRABALHO",
    title: "RETORNO AO TRABALHO",
    desc: "Após afastamento por doença, acidente ou licença superior a 30 dias.",
    badge: "Pós-Afastamento",
  },
  {
    id: "RETORNO (15 DIAS)",
    title: "RETORNO (15 DIAS)",
    desc: "Avaliação clínica ocupacional para atestados ou afastamentos curtos.",
    badge: "Atestado Curto",
  },
];

export default function Step4Trabalhador({
  trabalhadorCpf,
  trabalhadorNome,
  trabalhadorFuncao,
  trabalhadorNasc,
  tipoExame,
  examesComplementares,
  todosExamesDisponiveis,
  onChange,
  onNext,
  onBack,
}: Step4TrabalhadorProps) {
  const [desejaComplementares, setDesejaComplementares] = useState(examesComplementares.length > 0);
  const [buscaExame, setBuscaExame] = useState("");
  const [loadingCpf, setLoadingCpf] = useState(false);
  const [cpfFeedback, setCpfFeedback] = useState<{ tipo: "success" | "info" | null; msg: string }>({
    tipo: null,
    msg: "",
  });
  const [errorMsg, setErrorMsg] = useState("");

  const buscarHistoricoTrabalhador = async (cleanCpf: string) => {
    if (cleanCpf.length !== 11 || !isValidCPF(cleanCpf)) return;

    setLoadingCpf(true);
    try {
      const res = await fetch(`/api/trabalhador/${cleanCpf}`);
      const data = await res.json();

      if (res.ok && data.cadastrado) {
        onChange({
          trabalhadorNome: data.nome || trabalhadorNome,
          trabalhadorNasc: data.dataNascimento || trabalhadorNasc,
          trabalhadorFuncao: data.funcao && !trabalhadorFuncao ? data.funcao : trabalhadorFuncao,
        });

        setCpfFeedback({
          tipo: "success",
          msg: `Trabalhador localizado na base B&C Saúde: ${data.nome}. Dados preenchidos automaticamente.`,
        });
      } else {
        setCpfFeedback({
          tipo: null,
          msg: "",
        });
      }
    } catch {
      // silencioso
    } finally {
      setLoadingCpf(false);
    }
  };

  const handleCpfChange = (val: string) => {
    const formatted = formatCPF(val);
    onChange({ trabalhadorCpf: formatted });

    const clean = formatted.replace(/\D/g, "");
    if (clean.length === 11) {
      buscarHistoricoTrabalhador(clean);
    } else {
      setCpfFeedback({ tipo: null, msg: "" });
    }
  };

  const handleToggleExame = (exame: ExameItem) => {
    const exists = examesComplementares.some((e) => e.nome === exame.nome || e.id === exame.id);
    if (exists) {
      onChange({
        examesComplementares: examesComplementares.filter(
          (e) => e.nome !== exame.nome && e.id !== exame.id
        ),
      });
    } else {
      onChange({
        examesComplementares: [
          ...examesComplementares,
          {
            id: exame.id,
            nome: exame.nome,
            preco: exame.preco,
            instrucao: exame.instrucaoPreparo || exame.instrucao || "",
          },
        ],
      });
    }
  };

  const filteredExames = todosExamesDisponiveis.filter((e) =>
    e.nome.toLowerCase().includes(buscaExame.toLowerCase())
  );

  const instrucoesAtivas = examesComplementares.filter(
    (e) => e.instrucao && e.instrucao.trim().length > 0
  );

  const handleValidateAndNext = () => {
    setErrorMsg("");

    if (!tipoExame) {
      setErrorMsg("Selecione o tipo de exame clínico ocupacional (Admissional, Demissional, etc.).");
      return;
    }
    if (!trabalhadorCpf.trim() || !isValidCPF(trabalhadorCpf)) {
      setErrorMsg("Informe um CPF válido para o trabalhador.");
      return;
    }
    if (!trabalhadorNome.trim()) {
      setErrorMsg("Informe o nome completo do trabalhador.");
      return;
    }
    if (!trabalhadorFuncao.trim()) {
      setErrorMsg("Informe a função/cargo do trabalhador.");
      return;
    }
    if (!trabalhadorNasc.trim()) {
      setErrorMsg("Informe a data de nascimento do trabalhador.");
      return;
    }

    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-7 shadow-xs">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-800 border border-sky-200">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
              Tipo de Exame Clínico (ASO) & Dados do Trabalhador
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
              Defina o tipo de exame ocupacional e informe os dados do colaborador
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-5 flex items-center gap-2.5 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* 1. SELEÇÃO DO TIPO DE EXAME CLÍNICO (ASO) - DESTAQUE NO TOPO */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5 flex items-center gap-1.5">
              <FileCheck className="h-4 w-4 text-[#0F2C59]" />
              1. Qual o Tipo de Exame Clínico (ASO)? *
            </label>
            <p className="text-xs text-slate-500 mb-3 font-normal">
              Selecione o motivo da consulta ocupacional:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {tiposExameDetalhes.map((opt) => {
                const isSelected = tipoExame === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChange({ tipoExame: opt.id })}
                    className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all active:scale-[0.98] touch-manipulation cursor-pointer ${
                      isSelected
                        ? "bg-sky-50/60 border-[#0F2C59] ring-2 ring-[#0F2C59]/20 shadow-xs"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span
                        className={`text-xs font-bold tracking-wide ${
                          isSelected ? "text-[#0F2C59]" : "text-slate-900"
                        }`}
                      >
                        {opt.title}
                      </span>
                      <div
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                          isSelected
                            ? "bg-[#0F2C59] border-[#0F2C59] text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2 font-normal leading-snug">
                      {opt.desc}
                    </p>

                    <span
                      className={`mt-2 inline-block rounded px-1.5 py-0.5 text-[9px] font-semibold border ${
                        isSelected
                          ? "bg-sky-100 text-sky-900 border-sky-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {opt.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            {tipoExame && (
              <div className="mt-2.5 flex items-center gap-1.5 text-xs text-[#0F2C59] font-bold bg-sky-50 border border-sky-200 px-3 py-1.5 rounded-lg">
                <CheckCircle2 className="h-4 w-4" />
                <span>Exame Selecionado: {tipoExame}</span>
              </div>
            )}
          </div>

          <div className="h-px bg-slate-200" />

          {/* 2. DADOS DO TRABALHADOR COM BUSCA INTELIGENTE DE HISTÓRICO */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <UserCheck className="h-4 w-4 text-[#0F2C59]" />
                2. Dados do Trabalhador
              </label>

              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <History className="h-3.5 w-3.5 text-sky-700" />
                <span>Histórico persistido por CPF</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-700 font-semibold mb-1">
                  CPF do Trabalhador *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    maxLength={14}
                    value={trabalhadorCpf}
                    onChange={(e) => handleCpfChange(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#0F2C59] focus:outline-none transition font-medium"
                  />
                  {loadingCpf && (
                    <div className="absolute right-3 top-2.5">
                      <Loader2 className="h-4 w-4 animate-spin text-[#0F2C59]" />
                    </div>
                  )}
                </div>

                {cpfFeedback.msg && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-2 rounded-lg font-medium">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{cpfFeedback.msg}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs text-slate-700 font-semibold mb-1">
                  Nome Completo do Trabalhador *
                </label>
                <input
                  type="text"
                  placeholder="Nome completo do colaborador"
                  value={trabalhadorNome}
                  onChange={(e) => onChange({ trabalhadorNome: e.target.value.toUpperCase() })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#0F2C59] focus:outline-none transition uppercase font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-700 font-semibold mb-1">
                  Função / Cargo *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Motorista, Auxiliar Administrativo, Operador"
                  value={trabalhadorFuncao}
                  onChange={(e) => onChange({ trabalhadorFuncao: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#0F2C59] focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-700 font-semibold mb-1">
                  Data de Nascimento *
                </label>
                <input
                  type="date"
                  value={trabalhadorNasc}
                  onChange={(e) => onChange({ trabalhadorNasc: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#0F2C59] focus:outline-none transition font-medium"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-200" />

          {/* 3. EXAMES COMPLEMENTARES */}
          <div>
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100 text-sky-800 shrink-0">
                  <Stethoscope className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    3. Deseja incluir exames complementares?
                  </h3>
                  <p className="text-xs text-slate-500 font-normal">
                    Audiometria, Acuidade, Espirometria, ECG, EEG, Toxicológico, Laboratório, RX, etc.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const next = !desejaComplementares;
                  setDesejaComplementares(next);
                  if (!next) onChange({ examesComplementares: [] });
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  desejaComplementares ? "bg-[#0F2C59]" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                    desejaComplementares ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Lista e Seletor de Exames Complementares */}
            {desejaComplementares && (
              <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
                {/* Search bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Pesquisar exames por nome (ex: Audiometria, ECG, Raio X)..."
                    value={buscaExame}
                    onChange={(e) => setBuscaExame(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-[#0F2C59] focus:outline-none transition"
                  />
                </div>

                {/* Exames Selecionados Badge List */}
                {examesComplementares.length > 0 && (
                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-[#0F2C59] mb-2">
                      Exames Selecionados ({examesComplementares.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {examesComplementares.map((ex) => (
                        <span
                          key={ex.nome}
                          className="inline-flex items-center gap-1.5 rounded-md bg-sky-50 border border-sky-200 px-2.5 py-1 text-xs text-sky-950 font-medium"
                        >
                          <span>{ex.nome} ({formatCurrencyBRL(ex.preco)})</span>
                          <button
                            type="button"
                            onClick={() => handleToggleExame(ex)}
                            className="hover:text-rose-600 transition cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grid de Seleção de Exames */}
                <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                  {filteredExames.map((ex) => {
                    const isSelected = examesComplementares.some((e) => e.nome === ex.nome);
                    return (
                      <button
                        key={ex.nome}
                        type="button"
                        onClick={() => handleToggleExame(ex)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-slate-50 border-[#0F2C59] text-[#0F2C59] font-semibold"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                              isSelected
                                ? "bg-[#0F2C59] border-[#0F2C59] text-white"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <span className="text-xs truncate">{ex.nome}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-900 shrink-0 ml-2">
                          {formatCurrencyBRL(ex.preco)}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Box de Instruções Clínicas */}
                {instrucoesAtivas.length > 0 && (
                  <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3.5 space-y-2">
                    <div className="flex items-center gap-2 text-amber-900 text-xs font-bold">
                      <Info className="h-4 w-4 shrink-0 text-amber-700" />
                      <span>Instruções de Preparo para os Exames Selecionados:</span>
                    </div>
                    <ul className="space-y-1 pl-5 list-disc text-[11px] text-amber-800 leading-relaxed font-normal">
                      {instrucoesAtivas.map((ins, i) => (
                        <li key={i}>
                          <strong className="text-amber-950">{ins.nome}:</strong> {ins.instrucao}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8 pt-5 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar</span>
          </button>

          <button
            type="button"
            onClick={handleValidateAndNext}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0F2C59] hover:bg-[#0c2448] px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition cursor-pointer"
          >
            <span>Avançar para Pagamento</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
