"use client";

import { useState } from "react";
import {
  MapPin,
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  CalendarCheck,
} from "lucide-react";
import { UnidadeItem } from "@/types";
import { formatPhone, formatDateBR } from "@/lib/formatters";
import { isValidEmail, isValidPhone } from "@/lib/validators";

interface Step2AtendimentoProps {
  unidades: UnidadeItem[];
  unidadeId: string;
  unidadeNome: string;
  unidadeEndereco: string;
  dataAgendada: string;
  horaAgendada: string;
  responsavelNome: string;
  responsavelEmail: string;
  responsavelTelefone: string;
  onChange: (fields: Partial<{
    unidadeId: string;
    unidadeNome: string;
    unidadeEndereco: string;
    dataAgendada: string;
    horaAgendada: string;
    responsavelNome: string;
    responsavelEmail: string;
    responsavelTelefone: string;
  }>) => void;
  onNext: () => void;
  onBack: () => void;
}

const DIAS_SEMANA_ABREV = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

// Regras de dias de atendimento por unidade
function getDiasDisponiveisUnidade(unidadeNomeOrId: string): { dias: number[]; desc: string } {
  const lower = (unidadeNomeOrId || "").toLowerCase();
  if (lower.includes("bonito")) {
    return { dias: [2, 4, 5], desc: "Terças, Quintas e Sextas-feiras" }; // Ter, Qui, Sex
  }
  if (lower.includes("bela vista")) {
    return { dias: [1, 3, 5], desc: "Segundas, Quartas e Sextas-feiras" }; // Seg, Qua, Sex
  }
  // Jardim e Campo Grande (Seg a Sex)
  return { dias: [1, 2, 3, 4, 5], desc: "Segunda a Sexta-feira" };
}

export default function Step2Atendimento({
  unidades,
  unidadeId,
  unidadeNome,
  unidadeEndereco,
  dataAgendada,
  horaAgendada,
  responsavelNome,
  responsavelEmail,
  responsavelTelefone,
  onChange,
  onNext,
  onBack,
}: Step2AtendimentoProps) {
  const [errorMsg, setErrorMsg] = useState("");

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const selectedUnidade =
    unidades.find((u) => u.id === unidadeId || u.nome === unidadeNome) || unidades[0];

  const regrasUnidade = getDiasDisponiveisUnidade(selectedUnidade?.nome || "");

  const handleUnidadeChange = (u: UnidadeItem) => {
    const novasRegras = getDiasDisponiveisUnidade(u.nome);
    
    // Verifica se a data atual é válida para a nova unidade
    let novaData = dataAgendada;
    if (dataAgendada) {
      const parts = dataAgendada.split("-");
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        if (!novasRegras.dias.includes(d.getDay())) {
          novaData = ""; // reseta data se a nova unidade não atende nesse dia da semana
        }
      }
    }

    onChange({
      unidadeId: u.id,
      unidadeNome: u.nome,
      unidadeEndereco: `${u.endereco}, ${u.cidade} - ${u.uf}`,
      dataAgendada: novaData,
      horaAgendada: "", // reseta hora ao trocar unidade
    });
  };

  const handleValidateAndNext = () => {
    setErrorMsg("");

    if (!selectedUnidade) {
      setErrorMsg("Selecione a unidade de atendimento.");
      return;
    }
    if (!dataAgendada) {
      setErrorMsg("Selecione a data para o exame no calendário.");
      return;
    }
    if (!horaAgendada) {
      setErrorMsg("Selecione o horário de atendimento.");
      return;
    }
    if (!responsavelNome.trim()) {
      setErrorMsg("Informe o nome do responsável pelo agendamento.");
      return;
    }
    if (!responsavelEmail.trim() || !isValidEmail(responsavelEmail)) {
      setErrorMsg("Informe um e-mail válido para contato.");
      return;
    }
    if (!responsavelTelefone.trim() || !isValidPhone(responsavelTelefone)) {
      setErrorMsg("Informe um número de WhatsApp válido.");
      return;
    }

    onNext();
  };

  // Calendar logic
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Próximas datas dinâmicas específicas para os dias de atendimento da unidade selecionada
  const quickDates: { label: string; dateStr: string; dayName: string }[] = [];
  let d = new Date();
  let safetyLoop = 0;
  while (quickDates.length < 5 && safetyLoop < 40) {
    safetyLoop++;
    const dayOfWeek = d.getDay();
    if (regrasUnidade.dias.includes(dayOfWeek)) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateStr = `${y}-${m}-${day}`;
      
      const isToday = d.toDateString() === new Date().toDateString();
      const dayName = DIAS_SEMANA_ABREV[dayOfWeek];
      const label = isToday ? `Hoje (${dayName})` : `${dayName}, ${day}/${m}`;
      quickDates.push({ label, dateStr, dayName });
    }
    d.setDate(d.getDate() + 1);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-7 shadow-xs">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-800 border border-sky-200">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
              Unidade, Data & Horário de Atendimento
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
              Cada unidade possui sua própria grade de dias e horários clínicos disponíveis
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
          {/* 1. Seleção de Unidade */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
              1. Selecione a Unidade de Atendimento *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {unidades.map((u) => {
                const isSelected = selectedUnidade?.id === u.id || selectedUnidade?.nome === u.nome;
                const info = getDiasDisponiveisUnidade(u.nome);

                return (
                  <button
                    key={u.id || u.nome}
                    type="button"
                    onClick={() => handleUnidadeChange(u)}
                    className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all active:scale-[0.98] touch-manipulation cursor-pointer ${
                      isSelected
                        ? "bg-sky-50/60 border-[#0F2C59] ring-2 ring-[#0F2C59]/15 shadow-xs"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <MapPin className={`h-4 w-4 shrink-0 ${isSelected ? "text-[#0F2C59]" : "text-slate-400"}`} />
                        <span className={`text-xs font-bold truncate ${isSelected ? "text-[#0F2C59]" : "text-slate-800"}`}>
                          {u.nome}
                        </span>
                      </div>
                      <div
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                          isSelected
                            ? "bg-[#0F2C59] border-[#0F2C59] text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="h-3 w-3 text-white" />}
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-1 font-normal mb-2">
                      {u.endereco}
                    </p>

                    <div className="mt-auto pt-2 border-t border-slate-200/80 w-full flex items-center justify-between text-[10px]">
                      <span className="text-slate-600 font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span>{info.desc}</span>
                      </span>
                      <span className="text-sky-800 font-bold bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                        {u.horariosDisponiveis?.length || 0} horários
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-slate-200" />

          {/* 2. Seleção de Data Disponível (Calendário Interativo Personalizado por Unidade) */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                  2. Selecione a Data Disponível em {selectedUnidade?.cidade || "sua Unidade"} *
                </label>
                <p className="text-[11px] text-slate-500 font-normal">
                  Dias de atendimento nesta unidade: <strong className="text-slate-800">{regrasUnidade.desc}</strong>
                </p>
              </div>

              {dataAgendada && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F2C59] bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-md self-start sm:self-auto shrink-0">
                  <CalendarCheck className="h-3.5 w-3.5" />
                  <span>Data: {formatDateBR(dataAgendada)}</span>
                </span>
              )}
            </div>

            {/* Quick date buttons específicos da unidade */}
            <div className="my-3">
              <span className="block text-[11px] text-slate-500 mb-1.5 font-semibold">
                Próximos dias com vagas em {selectedUnidade?.cidade || "STA"}:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickDates.map((qd) => {
                  const isSelected = dataAgendada === qd.dateStr;
                  return (
                    <button
                      key={qd.dateStr}
                      type="button"
                      onClick={() => onChange({ dataAgendada: qd.dateStr })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer active:scale-[0.98] ${
                        isSelected
                          ? "bg-[#0F2C59] text-white border-[#0F2C59] shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-50"
                      }`}
                    >
                      {qd.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Visual Month Calendar */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              {/* Month Header Navigation */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition cursor-pointer"
                  title="Mês anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <span className="text-xs sm:text-sm font-bold text-slate-900">
                  {MESES[currentMonth]} de {currentYear}
                </span>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition cursor-pointer"
                  title="Próximo mês"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Day names */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] sm:text-xs font-bold uppercase text-slate-500 mb-1">
                {DIAS_SEMANA_ABREV.map((dia) => (
                  <div key={dia} className="py-1">{dia}</div>
                ))}
              </div>

              {/* Calendar Days Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells before month start */}
                {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="h-9 sm:h-10" />
                ))}

                {/* Month Days */}
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const dayDate = new Date(currentYear, currentMonth, dayNum);
                  const dayOfWeek = dayDate.getDay();
                  
                  // Verifica se a unidade atende neste dia da semana
                  const isUnitOpenDay = regrasUnidade.dias.includes(dayOfWeek);
                  
                  const todayAtMidnight = new Date();
                  todayAtMidnight.setHours(0, 0, 0, 0);
                  const isPast = dayDate < todayAtMidnight;

                  const y = currentYear;
                  const m = String(currentMonth + 1).padStart(2, "0");
                  const d = String(dayNum).padStart(2, "0");
                  const dateStr = `${y}-${m}-${d}`;

                  const isSelected = dataAgendada === dateStr;
                  const isAvailable = isUnitOpenDay && !isPast;

                  return (
                    <button
                      key={dayNum}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => isAvailable && onChange({ dataAgendada: dateStr })}
                      className={`h-9 sm:h-10 rounded-lg text-xs font-semibold flex flex-col items-center justify-center transition-all ${
                        isSelected
                          ? "bg-[#0F2C59] text-white font-bold shadow-xs ring-2 ring-[#0F2C59]/20"
                          : isAvailable
                          ? "bg-white border border-slate-200 text-slate-900 hover:border-[#0F2C59] hover:bg-sky-50/50 cursor-pointer"
                          : "bg-slate-100/50 text-slate-300 cursor-not-allowed border border-transparent"
                      }`}
                    >
                      <span>{dayNum}</span>
                      {isAvailable && (
                        <span className={`text-[8px] font-normal leading-none mt-0.5 ${isSelected ? "text-sky-200" : "text-emerald-700"}`}>
                          vagas
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-600 inline-block" />
                  <span>Dias com atendimento médico nesta unidade</span>
                </span>
                <span className="text-slate-400">Dias sem plantão desabilitados</span>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-200" />

          {/* 3. Horários Disponíveis Específicos da Unidade */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                3. Horários Disponíveis em {selectedUnidade?.nome?.split("/")[0] || "Unidade"} *
              </label>
              {horaAgendada && (
                <span className="text-xs text-[#0F2C59] font-bold flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {horaAgendada}
                </span>
              )}
            </div>

            {!dataAgendada ? (
              <div className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500 bg-slate-50">
                Selecione primeiro uma data no calendário acima para visualizar os horários disponíveis em {selectedUnidade?.cidade}.
              </div>
            ) : (
              <div>
                <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50">
                  {(selectedUnidade?.horariosDisponiveis || []).map((h) => {
                    const isSelected = horaAgendada === h;
                    return (
                      <button
                        key={h}
                        type="button"
                        onClick={() => onChange({ horaAgendada: h })}
                        className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-[0.97] ${
                          isSelected
                            ? "bg-[#0F2C59] text-white shadow-xs"
                            : "bg-white border border-slate-200 text-slate-700 hover:border-slate-400"
                        }`}
                      >
                        {h}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="h-px bg-slate-200" />

          {/* 4. Dados do Responsável */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-1.5">
              <User className="h-4 w-4 text-[#0F2C59]" />
              4. Responsável pelo Agendamento
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-700 mb-1 font-semibold">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  placeholder="Nome de quem está agendando"
                  value={responsavelNome}
                  onChange={(e) => onChange({ responsavelNome: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-[#0F2C59] focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-700 mb-1 font-semibold">
                  E-mail do Responsável *
                </label>
                <input
                  type="email"
                  placeholder="seu@empresa.com.br"
                  value={responsavelEmail}
                  onChange={(e) => onChange({ responsavelEmail: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-[#0F2C59] focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-700 mb-1 font-semibold">
                  Telefone / WhatsApp *
                </label>
                <input
                  type="text"
                  placeholder="(67) 98113-1076"
                  maxLength={15}
                  value={responsavelTelefone}
                  onChange={(e) => onChange({ responsavelTelefone: formatPhone(e.target.value) })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-[#0F2C59] focus:outline-none transition font-medium"
                />
              </div>
            </div>
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
            <span>Avançar para Empresa</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
