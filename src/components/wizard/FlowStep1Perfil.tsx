"use client";

import { Building2, FileText, Package, Check, ArrowRight } from "lucide-react";
import { PerfilContratante } from "@/types";

interface FlowStep1PerfilProps {
  perfil: PerfilContratante;
  onSelect: (p: PerfilContratante) => void;
  onNext: () => void;
}

const PERFIS: {
  id: PerfilContratante;
  label: string;
  icon: typeof Building2;
}[] = [
  {
    id: "EMPRESAS (COM CNPJ) / OU EMPREGADORES (CPF/CAEPF / CEI)",
    label: "EMPRESAS (COM CNPJ) / OU EMPREGADORES (CPF/CAEPF / CEI)",
    icon: Building2,
  },
  {
    id: "SERVIDOR PÚBLICO / PROCESSOS SELETIVOS (SED, SEMED) OU CONCURSO",
    label: "SERVIDOR PÚBLICO / PROCESSOS SELETIVOS (SED, SEMED) OU CONCURSO",
    icon: FileText,
  },
  {
    id: "EMPRESAS COM KIT DE ATENDIMENTO PRÓPRIO",
    label: "EMPRESAS COM KIT DE ATENDIMENTO PRÓPRIO",
    icon: Package,
  },
];

export default function FlowStep1Perfil({
  perfil,
  onSelect,
  onNext,
}: FlowStep1PerfilProps) {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="rounded-2xl border border-sky-900/50 bg-[#0b162c]/90 backdrop-blur-md p-6 sm:p-8 shadow-[0_0_35px_rgba(0,180,216,0.08)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-sky-400/40 text-sky-400 text-xs font-bold">
            i
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-slate-100">
            Selecione o Perfil do Contratante
          </h2>
        </div>

        <div className="space-y-3">
          {PERFIS.map((item) => {
            const isSelected = perfil === item.id;
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`group flex items-center justify-between rounded-xl border p-4 sm:p-5 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "border-[#00d2ff] bg-[#0c2242]/90 shadow-[0_0_20px_rgba(0,210,255,0.15)] ring-1 ring-[#00d2ff]/40"
                    : "border-sky-950/70 bg-[#070e1c]/80 hover:border-sky-800 hover:bg-[#0c1830]"
                }`}
              >
                <div className="flex items-center gap-3.5 sm:gap-4 pr-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                      isSelected
                        ? "border-[#00d2ff]/40 bg-[#00d2ff]/10 text-[#00d2ff]"
                        : "border-sky-950 bg-sky-950/40 text-slate-400 group-hover:text-slate-200"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span
                    className={`text-xs sm:text-sm font-semibold tracking-wide transition-colors ${
                      isSelected ? "text-slate-100" : "text-slate-300 group-hover:text-white"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>

                {/* Radio Indicator */}
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                    isSelected
                      ? "border-[#00d2ff] bg-[#00d2ff] shadow-[0_0_10px_#00d2ff]"
                      : "border-slate-600 bg-transparent"
                  }`}
                >
                  {isSelected && <div className="h-2 w-2 rounded-full bg-[#070e1c]" />}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8">
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00d2ff] to-[#0077b6] hover:brightness-110 px-8 py-3.5 text-sm font-bold text-[#050b14] shadow-[0_0_25px_rgba(0,210,255,0.3)] transition-all duration-200 active:scale-[0.98]"
          >
            <span>Continuar</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
