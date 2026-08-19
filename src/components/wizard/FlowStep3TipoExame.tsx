"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";
import { TipoExameOcupacional } from "@/types";

interface FlowStep3TipoExameProps {
  tipoExame: string;
  isCoordinated?: boolean;
  onChange: (tipo: TipoExameOcupacional) => void;
  onNext: () => void;
  onBack: () => void;
}

const TIPOS_EXAME: { id: TipoExameOcupacional; label: string }[] = [
  { id: "ADMISSIONAL", label: "ADMISSIONAL" },
  { id: "DEMISSIONAL", label: "DEMISSIONAL" },
  { id: "PERIÓDICO", label: "PERIÓDICO" },
  { id: "MUDANÇA DE FUNÇÃO", label: "MUDANÇA DE FUNÇÃO" },
  { id: "RETORNO AO TRABALHO", label: "RETORNO AO TRABALHO" },
  { id: "RETORNO (15 DIAS)", label: "RETORNO (15 DIAS)" },
];

export default function FlowStep3TipoExame({
  tipoExame,
  isCoordinated = false,
  onChange,
  onNext,
  onBack,
}: FlowStep3TipoExameProps) {
  const [selected, setSelected] = useState(tipoExame || "ADMISSIONAL");
  const [errorMsg, setErrorMsg] = useState("");

  const handleContinue = () => {
    if (!selected) {
      setErrorMsg("Selecione um tipo de exame para continuar.");
      return;
    }
    onChange(selected as TipoExameOcupacional);
    onNext();
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
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

      {/* Card Principal */}
      <div className="rounded-2xl border border-sky-900/50 bg-[#0b162c]/90 backdrop-blur-md p-6 sm:p-8 shadow-[0_0_35px_rgba(0,180,216,0.08)] space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-sky-400/40 text-sky-400 text-xs font-bold">
            i
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-slate-100">
            Tipo de Exame
          </h2>
        </div>

        {/* Notificação informativa */}
        <div className="rounded-xl border border-sky-900/40 bg-[#071326]/90 p-4 text-xs text-sky-200">
          {isCoordinated
            ? "Coordenação ativa identificada com faturamento em contrato PJ."
            : "Não encontramos coordenação ativa. Você pode seguir pelo formulário Avulso."}
        </div>

        {errorMsg && (
          <div className="rounded-lg bg-rose-950/60 border border-rose-800/80 p-3 text-xs text-rose-300">
            {errorMsg}
          </div>
        )}

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            SELECIONE O TIPO DE EXAME
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value as TipoExameOcupacional)}
                className="w-full appearance-none rounded-xl border border-[#00d2ff]/80 bg-[#070e1c] px-4 py-3.5 text-sm font-semibold text-slate-100 focus:border-[#00d2ff] focus:outline-none focus:ring-1 focus:ring-[#00d2ff]/30 transition shadow-[0_0_15px_rgba(0,210,255,0.15)]"
              >
                <option value="" disabled>Selecionar...</option>
                {TIPOS_EXAME.map((t) => (
                  <option key={t.id} value={t.id} className="bg-[#070e1c] text-white">
                    {t.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-4 h-4 w-4 text-slate-400" />
            </div>

            <button
              type="button"
              onClick={handleContinue}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00d2ff] to-[#0077b6] hover:brightness-110 px-8 py-3.5 text-sm font-bold text-[#050b14] shadow-[0_0_25px_rgba(0,210,255,0.3)] transition-all duration-200 active:scale-[0.98]"
            >
              <span>Continuar</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
