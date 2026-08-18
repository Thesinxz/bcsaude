"use client";

import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
}

const steps = [
  { step: 1, title: "Perfil", desc: "Tipo de Contratante" },
  { step: 2, title: "Atendimento", desc: "Unidade & Horário" },
  { step: 3, title: "Empresa", desc: "Dados do Contratante" },
  { step: 4, title: "Tipo de Exame", desc: "ASO & Trabalhador" },
  { step: 5, title: "Pagamento", desc: "Confirmação & LGPD" },
];

export default function StepIndicator({
  currentStep,
  totalSteps,
  onStepClick,
}: StepIndicatorProps) {
  return (
    <div className="w-full mb-6">
      {/* Mobile Step Bar */}
      <div className="flex sm:hidden flex-col gap-2 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#0F2C59]">
            Etapa {currentStep} de {totalSteps}
          </span>
          <span className="text-slate-600 font-medium">
            {steps[currentStep - 1]?.title}: {steps[currentStep - 1]?.desc}
          </span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0F2C59] transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop Stepper */}
      <div className="hidden sm:grid grid-cols-5 gap-2.5">
        {steps.map((s) => {
          const isCompleted = s.step < currentStep;
          const isCurrent = s.step === currentStep;

          return (
            <button
              key={s.step}
              type="button"
              disabled={!isCompleted}
              onClick={() => isCompleted && onStepClick?.(s.step)}
              className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                isCurrent
                  ? "bg-white border-[#0F2C59] shadow-sm ring-1 ring-[#0F2C59]"
                  : isCompleted
                  ? "bg-slate-50 border-slate-200 text-slate-700 hover:bg-white cursor-pointer"
                  : "bg-slate-50/50 border-slate-200 text-slate-400 cursor-not-allowed opacity-60"
              }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                  isCompleted
                    ? "bg-emerald-600 text-white"
                    : isCurrent
                    ? "bg-[#0F2C59] text-white"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {isCompleted ? <Check className="h-4 w-4 stroke-[3]" /> : s.step}
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className={`text-xs font-bold truncate ${
                    isCurrent
                      ? "text-[#0F2C59]"
                      : isCompleted
                      ? "text-slate-800"
                      : "text-slate-400"
                  }`}
                >
                  {s.title}
                </p>
                <p className="text-[11px] text-slate-500 truncate font-normal">
                  {s.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
