"use client";

import { Building2, Landmark, Package, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { PerfilContratante } from "@/types";

interface Step1PerfilProps {
  perfil: PerfilContratante;
  onSelect: (perfil: PerfilContratante) => void;
  onNext: () => void;
}

const perfis = [
  {
    id: "EMPRESAS (COM CNPJ) / OU EMPREGADORES (CPF/CAEPF / CEI)" as PerfilContratante,
    title: "EMPRESAS (COM CNPJ) / OU EMPREGADORES (CPF/CAEPF / CEI)",
    desc: "Para empresas com CNPJ ativo, empregadores rurais, pessoas físicas com CAEPF ou CEI que necessitam de emissão de ASO e envio dos eventos de SST ao eSocial.",
    icon: Building2,
    badge: "Mais Utilizado",
    disponivel: true,
  },
  {
    id: "SERVIDOR PÚBLICO / PROCESSOS SELETIVOS (SED, SEMED) OU CONCURSO" as PerfilContratante,
    title: "SERVIDOR PÚBLICO / PROCESSOS SELETIVOS (SED, SEMED) OU CONCURSO",
    desc: "Para candidatos convocados em concursos públicos, processos seletivos simplificados (SED, SEMED, Secretarias de Estado) e órgãos municipais/estaduais.",
    icon: Landmark,
    badge: "Processo Seletivo",
    disponivel: true,
  },
  {
    id: "EMPRESAS COM KIT DE ATENDIMENTO PRÓPRIO" as PerfilContratante,
    title: "EMPRESAS COM KIT DE ATENDIMENTO PRÓPRIO",
    desc: "Empresas conveniadas que possuem kit de exames e orientações específicas fornecidas pela sua assessoria de medicina ocupacional externa.",
    icon: Package,
    badge: "Kit Próprio",
    disponivel: true,
    aviso: "Caso selecione este perfil, certifique-se de que o trabalhador trará o kit físico e as guias impressas no dia da consulta.",
  },
];

export default function Step1Perfil({ perfil, onSelect, onNext }: Step1PerfilProps) {
  const handleCardClick = (id: PerfilContratante) => {
    onSelect(id);
    // Ao tocar no card, seleciona e avança suavemente para a etapa 2
    setTimeout(() => {
      onNext();
    }, 150);
  };

  return (
    <div className="space-y-6 w-full pb-10">
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-7 shadow-xs">
        <div className="flex items-center gap-3 mb-5 sm:mb-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-800 border border-sky-200">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-xl font-bold text-slate-900 leading-tight">
              Selecione o Perfil do Contratante
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
              Toque no perfil desejado para continuar o agendamento
            </p>
          </div>
        </div>

        {/* Profile cards com seleção e avanço no clique */}
        <div className="space-y-3">
          {perfis.map((item) => {
            const isSelected = perfil === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleCardClick(item.id)}
                className={`w-full text-left relative rounded-xl border p-4 sm:p-5 transition-all cursor-pointer select-none active:scale-[0.98] touch-manipulation block ${
                  isSelected
                    ? "bg-sky-50/50 border-[#0F2C59] ring-2 ring-[#0F2C59]/20 shadow-xs"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div
                    className={`flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      isSelected
                        ? "bg-[#0F2C59] text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                      <span
                        className={`text-xs sm:text-sm font-bold tracking-wide leading-snug ${
                          isSelected ? "text-[#0F2C59]" : "text-slate-900"
                        }`}
                      >
                        {item.title}
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold border ${
                          isSelected
                            ? "bg-sky-100 text-sky-900 border-sky-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {item.badge}
                      </span>
                    </div>

                    <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed font-normal">
                      {item.desc}
                    </p>

                    {item.aviso && isSelected && (
                      <div className="mt-2.5 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-[11px] text-amber-900">
                        <AlertCircle className="h-4 w-4 shrink-0 text-amber-700" />
                        <span>{item.aviso}</span>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 pt-0.5">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full border transition-all ${
                        isSelected
                          ? "border-[#0F2C59] bg-[#0F2C59] text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isSelected ? (
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      ) : (
                        <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Continue button */}
        <div className="mt-6 pt-5 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onNext}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#0F2C59] hover:bg-[#0c2448] active:bg-[#091b37] px-8 py-3.5 text-sm font-bold text-white shadow-xs transition active:scale-[0.98] touch-manipulation cursor-pointer"
          >
            <span>Continuar para Atendimento</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
