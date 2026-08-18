"use client";

import { useState } from "react";
import { QrCode, CreditCard, Building, ShieldCheck, AlertTriangle, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { FormaPagamento } from "@/types";
import { formatCurrencyBRL } from "@/lib/formatters";

interface Step5PagamentoProps {
  formaPagamento: FormaPagamento;
  valorBase: number;
  valorDescontoPix: number;
  horasLimitePix: number;
  lgpdAceite: boolean;
  isSubmitting: boolean;
  onChange: (fields: Partial<{
    formaPagamento: FormaPagamento;
    lgpdAceite: boolean;
  }>) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export default function Step5Pagamento({
  formaPagamento,
  valorBase,
  valorDescontoPix,
  horasLimitePix,
  lgpdAceite,
  isSubmitting,
  onChange,
  onSubmit,
  onBack,
}: Step5PagamentoProps) {
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = () => {
    setErrorMsg("");
    if (!lgpdAceite) {
      setErrorMsg("Você precisa aceitar os termos de LGPD e políticas de cancelamento para finalizar.");
      return;
    }
    onSubmit();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-800 border border-sky-200">
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Forma de Pagamento & Termos Legais
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal">
              Escolha a condição de pagamento e confirme o aceite das normas regulamentadoras
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-5 flex items-center gap-2.5 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Opções de Pagamento */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              Condição de Pagamento *
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* PIX com Desconto */}
              <div
                onClick={() => onChange({ formaPagamento: "PIX_DESCONTO" })}
                className={`relative rounded-xl border p-4 cursor-pointer transition-all ${
                  formaPagamento === "PIX_DESCONTO"
                    ? "bg-slate-50 border-[#0F2C59] ring-2 ring-[#0F2C59]/10 shadow-xs"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-[#0F2C59] font-bold text-xs sm:text-sm">
                    <QrCode className="h-4 w-4" />
                    <span>PIX com Desconto</span>
                  </div>
                  <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                    -{formatCurrencyBRL(valorDescontoPix)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-normal">
                  Pagamento antecipado em até {horasLimitePix}h para garantir a vaga e o desconto especial.
                </p>
              </div>

              {/* Padrão */}
              <div
                onClick={() => onChange({ formaPagamento: "PADRAO" })}
                className={`relative rounded-xl border p-4 cursor-pointer transition-all ${
                  formaPagamento === "PADRAO"
                    ? "bg-slate-50 border-[#0F2C59] ring-2 ring-[#0F2C59]/10 shadow-xs"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm">
                    <CreditCard className="h-4 w-4 text-slate-700" />
                    <span>Padrão / Balcão</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 font-normal">
                  Pagamento no balcão da clínica no dia do atendimento via Cartão de Débito, Crédito ou Dinheiro.
                </p>
              </div>

              {/* Faturado PJ */}
              <div
                onClick={() => onChange({ formaPagamento: "FATURADO" })}
                className={`relative rounded-xl border p-4 cursor-pointer transition-all ${
                  formaPagamento === "FATURADO"
                    ? "bg-slate-50 border-[#0F2C59] ring-2 ring-[#0F2C59]/10 shadow-xs"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm">
                    <Building className="h-4 w-4 text-slate-700" />
                    <span>Faturado PJ</span>
                  </div>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                    Convênio
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-normal">
                  Para empresas com contrato mensal e faturamento via boleto corporativo pós-atendimento.
                </p>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-200" />

          {/* Avisos Legais, LGPD e No-Show */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5 space-y-3.5">
            <div className="flex items-center gap-2 text-slate-900 text-xs sm:text-sm font-bold">
              <ShieldCheck className="h-4 w-4 text-[#0F2C59]" />
              <span>Termos de Conformidade Ocupacional & LGPD</span>
            </div>

            <div className="space-y-2 text-xs text-slate-600 font-normal leading-relaxed">
              <p>
                • <strong>Emissão e eSocial:</strong> Este formulário coleta dados estritamente necessários para a emissão do Atestado de Saúde Ocupacional (ASO) e transmissão dos eventos de SST ao eSocial conforme a Norma Regulamentadora NR-7 do Ministério do Trabalho e Emprego.
              </p>
              <p>
                • <strong>Sigilo Médico:</strong> Todos os registros e prontuários médicos são confidenciais e protegidos pelo Código de Ética Médica e Resoluções do CFM.
              </p>
              <p>
                • <strong>Política de Cancelamento & No-Show:</strong> Cancelamentos ou reagendamentos devem ser solicitados com no mínimo <strong>1 dia útil de antecedência</strong>. Em caso de não comparecimento sem aviso prévio (no-show), o valor pago não será ressarcido, permanecendo como crédito para utilização futura pelo contratante pagador.
              </p>
            </div>

            {/* Checkbox de Aceite */}
            <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition">
              <input
                type="checkbox"
                checked={lgpdAceite}
                onChange={(e) => onChange({ lgpdAceite: e.target.checked })}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0F2C59] focus:ring-[#0F2C59]"
              />
              <span className="text-xs text-slate-800 font-medium leading-tight">
                Li e estou ciente das regras, instruções de preparo dos exames, termos da LGPD e política de no-show.
              </span>
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8 pt-5 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0F2C59] hover:bg-[#0c2448] px-8 py-3 text-sm font-bold text-white shadow-xs transition disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Finalizando Agendamento...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Confirmar e Finalizar Agendamento</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
