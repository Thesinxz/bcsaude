"use client";

import { useState, useMemo } from "react";
import { 
  ArrowLeft, Check, Plus, Trash2, Loader2, ChevronDown, CheckCircle2, 
  FileText, ShieldCheck, HelpCircle, Building2, User
} from "lucide-react";
import { AgendamentoData, ExameItem, PerfilContratante, TipoExameOcupacional, UnidadeItem } from "@/types";
import { formatCpfCnpj, formatPhone, formatCurrencyBRL, formatDateBR } from "@/lib/formatters";
import { isValidCPF, isValidEmail } from "@/lib/validators";

interface FlowStep4FormularioProps {
  formData: Partial<AgendamentoData>;
  unidades: UnidadeItem[];
  todosExames: ExameItem[];
  valorBasePadrao: number;
  descontoPixReais: number;
  horasLimitePix: number;
  isSubmitting: boolean;
  onChange: (fields: Partial<AgendamentoData>) => void;
  onSubmit: () => void;
  onBack: () => void;
}

const TIPOS_EXAME_OPTIONS: TipoExameOcupacional[] = [
  "ADMISSIONAL",
  "DEMISSIONAL",
  "PERIÓDICO",
  "MUDANÇA DE FUNÇÃO",
  "RETORNO AO TRABALHO",
  "RETORNO (15 DIAS)",
];

const PERFIL_OPTIONS: { id: PerfilContratante; label: string }[] = [
  { id: "EMPRESAS (COM CNPJ) / OU EMPREGADORES (CPF/CAEPF / CEI)", label: "EMPRESAS / EMPREGADORES" },
  { id: "SERVIDOR PÚBLICO / PROCESSOS SELETIVOS (SED, SEMED) OU CONCURSO", label: "SERVIDOR PÚBLICO / CONCURSOS" },
  { id: "EMPRESAS COM KIT DE ATENDIMENTO PRÓPRIO", label: "EMPRESAS COM KIT PRÓPRIO" },
];

export default function FlowStep4Formulario({
  formData,
  unidades,
  todosExames,
  valorBasePadrao,
  descontoPixReais,
  horasLimitePix,
  isSubmitting,
  onChange,
  onSubmit,
  onBack,
}: FlowStep4FormularioProps) {
  const [desejaComplementares, setDesejaComplementares] = useState(
    (formData.examesComplementares && formData.examesComplementares.length > 0) || false
  );
  const [loadingTrabalhador, setLoadingTrabalhador] = useState(false);
  const [trabalhadorEncontrado, setTrabalhadorEncontrado] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const perfil = formData.perfilContratante || "EMPRESAS (COM CNPJ) / OU EMPREGADORES (CPF/CAEPF / CEI)";
  const isServidor = perfil.includes("SERVIDOR") || perfil.includes("CONCURSO");
  const isKit = perfil.includes("KIT");

  // Unidade selecionada atual
  const selectedUnidade = useMemo(() => {
    return unidades.find((u) => u.id === formData.unidadeId || u.nome === formData.unidadeNome) || unidades[0];
  }, [unidades, formData.unidadeId, formData.unidadeNome]);

  // Lista de horários disponíveis da unidade
  const horariosDisponiveis = useMemo(() => {
    if (!selectedUnidade) return ["07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "13:30", "14:00", "14:30", "15:00"];
    try {
      if (typeof selectedUnidade.horariosDisponiveis === "string") {
        return JSON.parse(selectedUnidade.horariosDisponiveis);
      }
      return selectedUnidade.horariosDisponiveis || ["07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "13:30", "14:00", "14:30", "15:00"];
    } catch {
      return ["07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "13:30", "14:00", "14:30", "15:00"];
    }
  }, [selectedUnidade]);

  // Gera opções combinadas de Dia e Horário para os próximos 14 dias válidos
  const diaHorarioOptions = useMemo(() => {
    const options: { value: string; label: string; data: string; hora: string }[] = [];
    const diasPermitidos = selectedUnidade?.diasSemanaDisponiveis || [1, 2, 3, 4, 5];

    let count = 0;
    const now = new Date();
    let d = 1;

    while (count < 6 && d < 20) {
      const testDate = new Date();
      testDate.setDate(now.getDate() + d);
      const dayOfWeek = testDate.getDay();

      if (diasPermitidos.includes(dayOfWeek) && dayOfWeek !== 0 && dayOfWeek !== 6) {
        const yyyy = testDate.getFullYear();
        const mm = String(testDate.getMonth() + 1).padStart(2, "0");
        const dd = String(testDate.getDate()).padStart(2, "0");
        const dataFormatadaIso = `${yyyy}-${mm}-${dd}`;
        const dataFormatadaBR = `${dd}/${mm}/${yyyy}`;

        // Adiciona horários chave
        horariosDisponiveis.forEach((hora: string) => {
          options.push({
            value: `${dataFormatadaIso}|${hora}`,
            label: `${dataFormatadaBR} às ${hora}`,
            data: dataFormatadaIso,
            hora: hora,
          });
        });
        count++;
      }
      d++;
    }
    return options;
  }, [selectedUnidade, horariosDisponiveis]);

  // Cálculos de Preço
  const examesComplementares = formData.examesComplementares || [];
  const totalComplementares = isKit ? 0 : examesComplementares.reduce((acc, curr) => acc + (curr.preco || 0), 0);

  let valorBase = valorBasePadrao;
  let valorDesconto = 0;

  if (isKit) {
    valorBase = 0;
    valorDesconto = 0;
  } else if (isServidor) {
    valorBase = 70.0;
    valorDesconto = 0;
  } else {
    valorDesconto = descontoPixReais;
  }

  const totalEstimadoPadrao = valorBase + totalComplementares;
  const totalEstimadoPix = Math.max(0, valorBase + totalComplementares - valorDesconto);

  // Busca do trabalhador por CPF
  const handleCpfBlur = async () => {
    const raw = formData.trabalhadorCpf || "";
    const clean = raw.replace(/\D/g, "");
    if (clean.length === 11 && isValidCPF(clean)) {
      setLoadingTrabalhador(true);
      try {
        const res = await fetch(`/api/trabalhador/${clean}`);
        const data = await res.json();
        if (res.ok && data.sucesso && data.cadastrado) {
          onChange({
            trabalhadorNome: data.nome || formData.trabalhadorNome,
            trabalhadorFuncao: data.funcao || formData.trabalhadorFuncao,
            trabalhadorNasc: data.dataNascimento || formData.trabalhadorNasc,
          });
          setTrabalhadorEncontrado(true);
        } else {
          setTrabalhadorEncontrado(false);
        }
      } catch {
        setTrabalhadorEncontrado(false);
      } finally {
        setLoadingTrabalhador(false);
      }
    }
  };

  // Manipulação de Exames Complementares
  const handleAddExame = () => {
    const firstExame = todosExames[0] || { id: "1", codigo: "ACUIDADE", nome: "ACUIDADE VISUAL", preco: 35 };
    const current = [...examesComplementares, firstExame];
    onChange({ examesComplementares: current });
  };

  const handleRemoveExame = (index: number) => {
    const current = examesComplementares.filter((_, i) => i !== index);
    onChange({ examesComplementares: current });
  };

  const handleExameSelect = (index: number, codigo: string) => {
    const found = todosExames.find((e) => e.codigo === codigo);
    if (found) {
      const current = [...examesComplementares];
      current[index] = found;
      onChange({ examesComplementares: current });
    }
  };

  const handleValidateAndSubmit = () => {
    setErrorMsg("");

    if (!formData.responsavelEmail?.trim() || !isValidEmail(formData.responsavelEmail)) {
      setErrorMsg("Informe um e-mail válido para o agendamento.");
      return;
    }
    if (!formData.responsavelNome?.trim()) {
      setErrorMsg("Informe o nome do responsável pelo agendamento.");
      return;
    }
    if (!formData.dataAgendada || !formData.horaAgendada) {
      setErrorMsg("Selecione a data e o horário do agendamento.");
      return;
    }
    if (!formData.empresaRazaoSocial?.trim()) {
      setErrorMsg("Informe a Razão Social ou Nome do Empregador.");
      return;
    }
    if (!formData.empresaEmailAso?.trim() || !isValidEmail(formData.empresaEmailAso)) {
      setErrorMsg("Informe um e-mail válido para receber o ASO.");
      return;
    }
    if (!formData.trabalhadorCpf?.trim()) {
      setErrorMsg("Informe o CPF do trabalhador.");
      return;
    }
    if (!formData.trabalhadorNome?.trim()) {
      setErrorMsg("Informe o nome completo do trabalhador.");
      return;
    }
    if (!formData.trabalhadorFuncao?.trim()) {
      setErrorMsg("Informe a função/cargo do trabalhador.");
      return;
    }
    if (!formData.trabalhadorNasc?.trim()) {
      setErrorMsg("Informe a data de nascimento do trabalhador.");
      return;
    }

    onSubmit();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-20">
      {/* Botão Voltar */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-xl border border-sky-900/60 bg-[#070e1c]/80 hover:bg-[#0c1830] px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Voltar</span>
        </button>
      </div>

      {/* Banner Informativo Superior */}
      <div className="rounded-xl border border-amber-900/40 bg-[#161208]/90 p-3.5 text-xs text-amber-300/90 shadow-sm">
        {isKit
          ? "Atendimento Coordenado: Este agendamento será faturado diretamente em contrato com a assessoria."
          : "Não encontramos coordenação ativa. Você pode seguir pelo formulário Avulso."}
      </div>

      {errorMsg && (
        <div className="rounded-xl bg-rose-950/70 border border-rose-800 p-4 text-xs font-medium text-rose-300">
          {errorMsg}
        </div>
      )}

      {/* CARD 1: Dados e Confirmação */}
      <div className="rounded-2xl border border-sky-900/50 bg-[#0b162c]/90 backdrop-blur-md p-6 sm:p-7 shadow-[0_0_30px_rgba(0,180,216,0.06)] space-y-5">
        <div className="flex items-center gap-3 border-b border-sky-950/80 pb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-sky-500/30 bg-[#00d2ff]/10 text-[#00d2ff]">
            <FileText className="h-4 w-4" />
          </div>
          <h2 className="text-base font-semibold text-slate-100">
            Dados e confirmação
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* E-mail */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              E-MAIL *
            </label>
            <input
              type="email"
              placeholder="seu@exemplo.com"
              value={formData.responsavelEmail || ""}
              onChange={(e) => onChange({ responsavelEmail: e.target.value })}
              className="w-full rounded-xl border border-sky-950/80 bg-[#070e1c] px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-[#00d2ff] focus:outline-none transition"
            />
          </div>

          {/* Responsável pelo Agendamento */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              RESPONSÁVEL PELO AGENDAMENTO *
            </label>
            <input
              type="text"
              placeholder="Nome de quem está realizando"
              value={formData.responsavelNome || ""}
              onChange={(e) => onChange({ responsavelNome: e.target.value })}
              className="w-full rounded-xl border border-sky-950/80 bg-[#070e1c] px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-[#00d2ff] focus:outline-none transition"
            />
          </div>

          {/* Unidade */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              UNIDADE *
            </label>
            <div className="relative">
              <select
                value={formData.unidadeId || selectedUnidade?.id}
                onChange={(e) => {
                  const un = unidades.find((u) => u.id === e.target.value);
                  if (un) {
                    onChange({
                      unidadeId: un.id,
                      unidadeNome: un.nome,
                      unidadeEndereco: `${un.endereco}, ${un.cidade} - ${un.uf}`,
                      dataAgendada: "",
                      horaAgendada: "",
                    });
                  }
                }}
                className="w-full appearance-none rounded-xl border border-sky-950/80 bg-[#070e1c] px-3.5 py-2.5 text-sm text-slate-100 focus:border-[#00d2ff] focus:outline-none transition pr-10 font-medium"
              >
                {unidades.map((u) => (
                  <option key={u.id} value={u.id} className="bg-[#070e1c] text-slate-100">
                    {u.cidade.toUpperCase()} — {u.nome}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-3 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Dia e Horário */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              DIA E HORÁRIO *
            </label>
            <div className="relative">
              <select
                value={
                  formData.dataAgendada && formData.horaAgendada
                    ? `${formData.dataAgendada}|${formData.horaAgendada}`
                    : ""
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    const [data, hora] = val.split("|");
                    onChange({ dataAgendada: data, horaAgendada: hora });
                  }
                }}
                className="w-full appearance-none rounded-xl border border-sky-950/80 bg-[#070e1c] px-3.5 py-2.5 text-sm text-slate-100 focus:border-[#00d2ff] focus:outline-none transition pr-10 font-medium"
              >
                <option value="">Selecione o dia e horário</option>
                {diaHorarioOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[#070e1c] text-slate-100">
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-3 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Telefone WhatsApp */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              TELEFONE (WHATSAPP) *
            </label>
            <input
              type="text"
              placeholder="(67) 9 8113-1076"
              value={formData.responsavelTelefone || ""}
              onChange={(e) => onChange({ responsavelTelefone: formatPhone(e.target.value) })}
              className="w-full rounded-xl border border-sky-950/80 bg-[#070e1c] px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-[#00d2ff] focus:outline-none transition"
            />
          </div>

          {/* Perfil do Contratante */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              PERFIL DO CONTRATANTE *
            </label>
            <div className="relative">
              <select
                value={formData.perfilContratante || PERFIL_OPTIONS[0].id}
                onChange={(e) => onChange({ perfilContratante: e.target.value as PerfilContratante })}
                className="w-full appearance-none rounded-xl border border-sky-950/80 bg-[#070e1c] px-3.5 py-2.5 text-sm text-slate-100 focus:border-[#00d2ff] focus:outline-none transition pr-10 font-medium"
              >
                {PERFIL_OPTIONS.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#070e1c] text-slate-100">
                    {p.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-3 h-4 w-4 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* CARD 2: Dados da Empresa */}
      <div className="rounded-2xl border border-sky-900/50 bg-[#0b162c]/90 backdrop-blur-md p-6 sm:p-7 shadow-[0_0_30px_rgba(0,180,216,0.06)] space-y-5">
        <div className="flex items-center gap-3 border-b border-sky-950/80 pb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-sky-500/30 bg-[#00d2ff]/10 text-[#00d2ff]">
            <Building2 className="h-4 w-4" />
          </div>
          <h2 className="text-base font-semibold text-slate-100">
            Dados da empresa
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* CNPJ ou CPF do Empregador */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              CNPJ OU CPF DO EMPREGADOR *
            </label>
            <input
              type="text"
              placeholder="00.000.000/0001-00"
              value={formData.empresaDoc || ""}
              onChange={(e) => onChange({ empresaDoc: formatCpfCnpj(e.target.value) })}
              className="w-full rounded-xl border border-sky-950/80 bg-[#070e1c] px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-[#00d2ff] focus:outline-none transition font-medium"
            />
          </div>

          {/* Razão Social / Nome do Empregador */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                RAZÃO SOCIAL / NOME DO EMPREGADOR *
              </label>
              {!formData.empresaRazaoSocial && (
                <span className="text-[10px] text-rose-400 font-medium">Obrigatório</span>
              )}
            </div>
            <input
              type="text"
              placeholder="Razão Social completa"
              value={formData.empresaRazaoSocial || ""}
              onChange={(e) => onChange({ empresaRazaoSocial: e.target.value.toUpperCase() })}
              className="w-full rounded-xl border border-sky-950/80 bg-[#070e1c] px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-[#00d2ff] focus:outline-none transition uppercase font-semibold"
            />
          </div>

          {/* E-mail para Receber o ASO */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              E-MAIL PARA RECEBER O ASO *
            </label>
            <input
              type="email"
              placeholder="rh@empresa.com.br"
              value={formData.empresaEmailAso || ""}
              onChange={(e) => onChange({ empresaEmailAso: e.target.value })}
              className="w-full rounded-xl border border-sky-950/80 bg-[#070e1c] px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-[#00d2ff] focus:outline-none transition"
            />
          </div>
        </div>
      </div>

      {/* CARD 3: Dados do Trabalhador */}
      <div className="rounded-2xl border border-sky-900/50 bg-[#0b162c]/90 backdrop-blur-md p-6 sm:p-7 shadow-[0_0_30px_rgba(0,180,216,0.06)] space-y-5">
        <div className="flex items-center gap-3 border-b border-sky-950/80 pb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-sky-500/30 bg-[#00d2ff]/10 text-[#00d2ff]">
            <User className="h-4 w-4" />
          </div>
          <h2 className="text-base font-semibold text-slate-100">
            Dados do trabalhador
          </h2>
        </div>

        {trabalhadorEncontrado && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-950/70 border border-emerald-800/80 p-3 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>Colaborador localizado no histórico da B&C Saúde (dados preenchidos automaticamente).</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* CPF */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              CPF *
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="000.000.000-00"
                maxLength={14}
                value={formData.trabalhadorCpf || ""}
                onChange={(e) => onChange({ trabalhadorCpf: formatCpfCnpj(e.target.value) })}
                onBlur={handleCpfBlur}
                className="w-full rounded-xl border border-sky-950/80 bg-[#070e1c] px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-[#00d2ff] focus:outline-none transition font-medium"
              />
              {loadingTrabalhador && (
                <div className="absolute right-3 top-2.5">
                  <Loader2 className="h-4 w-4 animate-spin text-[#00d2ff]" />
                </div>
              )}
            </div>
          </div>

          {/* Nome Completo */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              NOME COMPLETO *
            </label>
            <input
              type="text"
              placeholder="Nome do colaborador"
              value={formData.trabalhadorNome || ""}
              onChange={(e) => onChange({ trabalhadorNome: e.target.value.toUpperCase() })}
              className="w-full rounded-xl border border-sky-950/80 bg-[#070e1c] px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-[#00d2ff] focus:outline-none transition uppercase font-semibold"
            />
          </div>

          {/* Função */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              FUNÇÃO *
            </label>
            <input
              type="text"
              placeholder="Ex: Operador de Máquinas, Vendedor, etc."
              value={formData.trabalhadorFuncao || ""}
              onChange={(e) => onChange({ trabalhadorFuncao: e.target.value.toUpperCase() })}
              className="w-full rounded-xl border border-sky-950/80 bg-[#070e1c] px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-[#00d2ff] focus:outline-none transition uppercase"
            />
          </div>

          {/* Data de Nascimento */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              DATA DE NASCIMENTO *
            </label>
            <input
              type="text"
              placeholder="dd/mm/aaaa"
              maxLength={10}
              value={formData.trabalhadorNasc || ""}
              onChange={(e) => {
                let v = e.target.value.replace(/\D/g, "");
                if (v.length > 8) v = v.slice(0, 8);
                if (v.length > 4) v = `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
                else if (v.length > 2) v = `${v.slice(0, 2)}/${v.slice(2)}`;
                onChange({ trabalhadorNasc: v });
              }}
              className="w-full rounded-xl border border-sky-950/80 bg-[#070e1c] px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-[#00d2ff] focus:outline-none transition"
            />
          </div>

          {/* Tipo de Exame */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              TIPO DE EXAME *
            </label>
            <div className="relative">
              <select
                value={formData.tipoExame || "ADMISSIONAL"}
                onChange={(e) => onChange({ tipoExame: e.target.value as TipoExameOcupacional })}
                className="w-full appearance-none rounded-xl border border-sky-950/80 bg-[#070e1c] px-3.5 py-2.5 text-sm text-slate-100 focus:border-[#00d2ff] focus:outline-none transition pr-10 font-semibold"
              >
                {TIPOS_EXAME_OPTIONS.map((t) => (
                  <option key={t} value={t} className="bg-[#070e1c] text-slate-100">
                    {t}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-3 h-4 w-4 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* CARD 4: Exames Complementares */}
      <div className="rounded-2xl border border-sky-900/50 bg-[#0b162c]/90 backdrop-blur-md p-6 sm:p-7 shadow-[0_0_30px_rgba(0,180,216,0.06)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-950/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-sky-400/40 text-sky-400 text-xs font-bold">
              i
            </div>
            <h2 className="text-base font-semibold text-slate-100">
              Exames complementares (opcional)
            </h2>
          </div>

          {/* Badge de Preços */}
          <div className="text-xs text-slate-400 font-medium">
            {isKit ? (
              <span className="text-sky-300">Faturado em Contrato PJ</span>
            ) : isServidor ? (
              <span>Tarifa Concurso: <strong className="text-[#00d2ff]">R$ 70,00</strong></span>
            ) : (
              <span>
                Valor base (PIX em 2h): <strong className="text-[#00d2ff]">R$ 83,00</strong> · Padrão sem PIX antecipado: <strong className="text-slate-200">R$ 90,00</strong>
              </span>
            )}
          </div>
        </div>

        {/* Checkbox Deseja Complementares */}
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={desejaComplementares}
            onChange={(e) => {
              const checked = e.target.checked;
              setDesejaComplementares(checked);
              if (!checked) {
                onChange({ examesComplementares: [] });
              } else if (examesComplementares.length === 0) {
                handleAddExame();
              }
            }}
            className="h-4 w-4 rounded border-sky-800 bg-[#070e1c] text-[#00d2ff] focus:ring-[#00d2ff]/40"
          />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            DESEJA INCLUIR EXAMES COMPLEMENTARES?
          </span>
        </label>

        {desejaComplementares && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                ADICIONAR EXAME
              </span>
              <button
                type="button"
                onClick={handleAddExame}
                className="inline-flex items-center gap-1.5 rounded-xl border border-sky-900/60 bg-[#070e1c] hover:bg-[#0c1830] px-3.5 py-1.5 text-xs font-bold text-[#00d2ff] transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Adicionar exame</span>
              </button>
            </div>

            {/* Lista de Linhas de Exames */}
            <div className="space-y-3">
              {examesComplementares.map((exame, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Select Exame */}
                  <div className="relative flex-1">
                    <select
                      value={exame.codigo}
                      onChange={(e) => handleExameSelect(idx, e.target.value)}
                      className="w-full appearance-none rounded-xl border border-sky-950/80 bg-[#070e1c] px-3.5 py-2.5 text-xs font-medium text-slate-100 focus:border-[#00d2ff] focus:outline-none transition pr-10"
                    >
                      {todosExames.map((item) => (
                        <option key={item.codigo} value={item.codigo} className="bg-[#070e1c] text-slate-100">
                          {item.nome}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-3 h-3.5 w-3.5 text-slate-400" />
                  </div>

                  {/* Preço (R$) */}
                  <div className="w-24">
                    <input
                      type="text"
                      readOnly
                      value={isKit ? "0" : exame.preco}
                      className="w-full rounded-xl border border-sky-950/80 bg-[#070e1c] px-3 py-2.5 text-xs text-center font-bold text-slate-200"
                    />
                  </div>

                  {/* Botão Remover */}
                  <button
                    type="button"
                    onClick={() => handleRemoveExame(idx)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 px-4 py-2.5 text-xs font-bold text-white transition active:scale-95"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Remover</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Caixa de Resumo de Totais */}
            <div className="rounded-xl border border-sky-950 bg-[#070e1c]/90 p-4 space-y-1 text-right text-xs">
              <div className="text-sm font-bold text-slate-200">
                Total estimado: <strong className="text-white text-base">{formatCurrencyBRL(isKit ? 0 : totalEstimadoPadrao)}</strong>
              </div>
              <div className="text-[11px] text-slate-400">
                {isKit
                  ? "Faturado em Contrato PJ"
                  : `Padrão ${formatCurrencyBRL(valorBase)} + Complementares ${formatCurrencyBRL(totalComplementares)}`}
              </div>
              {!isKit && (
                <div className="text-xs font-bold text-[#00d2ff] pt-1">
                  PIX antecipado: {formatCurrencyBRL(totalEstimadoPix)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CARD 5: Termos & Botão de Envio */}
      <div className="rounded-2xl border border-sky-900/50 bg-[#0b162c]/90 backdrop-blur-md p-6 sm:p-7 shadow-[0_0_30px_rgba(0,180,216,0.06)] space-y-5">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={formData.lgpdAceite ?? true}
            onChange={(e) => onChange({ lgpdAceite: e.target.checked })}
            className="mt-0.5 h-4 w-4 rounded border-sky-800 bg-[#070e1c] text-[#00d2ff] focus:ring-[#00d2ff]/40"
          />
          <span className="text-xs text-slate-300 font-normal leading-relaxed">
            Declaro que li e concordo com os termos da LGPD, normas regulamentadoras do MTE (NR-7) e a política de cancelamento/no-show da clínica.
          </span>
        </label>

        <div className="pt-3 border-t border-sky-950 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            <span>Valor final com PIX: </span>
            <strong className="text-lg font-black text-[#00d2ff]">
              {isKit ? "R$ 0,00" : formatCurrencyBRL(totalEstimadoPix)}
            </strong>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleValidateAndSubmit}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00d2ff] to-[#0077b6] hover:brightness-110 px-8 py-3.5 text-sm font-bold text-[#050b14] shadow-[0_0_25px_rgba(0,210,255,0.3)] transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Confirmando Agendamento...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Confirmar e Gerar Agendamento</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
