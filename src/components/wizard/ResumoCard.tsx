"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, FileText } from "lucide-react";
import { AgendamentoData, FormaPagamento } from "@/types";
import { formatCurrencyBRL, formatDateBR } from "@/lib/formatters";

interface ResumoCardProps {
  data: Partial<AgendamentoData>;
  valorBasePadrao: number;
  descontoPixReais: number;
  onConfirmStep?: () => void;
}

export default function ResumoCard({
  data,
  valorBasePadrao,
  descontoPixReais,
}: ResumoCardProps) {
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const examesCompl = data.examesComplementares || [];
  const valorAdicionais = examesCompl.reduce((acc, curr) => acc + (curr.preco || 0), 0);
  const isPix = data.formaPagamento === "PIX_DESCONTO" || !data.formaPagamento;
  const valorDesconto = isPix ? descontoPixReais : 0;
  const valorBase = valorBasePadrao;
  const valorFinal = valorBase + valorAdicionais - valorDesconto;

  const formaPagamentoLabels: Record<FormaPagamento, string> = {
    PIX_DESCONTO: "PIX com desconto (2h)",
    PADRAO: "Padrão / Balcão",
    FATURADO: "Faturamento Mensal PJ",
  };

  return (
    <>
      {/* Desktop Sticky Card */}
      <div className="hidden lg:block w-80 xl:w-96 shrink-0">
        <div className="sticky top-20 rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <FileText className="h-4 w-4 text-[#0F2C59]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Resumo do Agendamento
            </h3>
          </div>

          {/* Details List */}
          <div className="space-y-3 text-xs">
            {/* Unidade */}
            <div>
              <span className="text-slate-500 block text-[11px]">Unidade</span>
              <span className="font-semibold text-slate-900">
                {data.unidadeNome || "Selecione a unidade"}
              </span>
            </div>

            {/* Data & Hora */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500 block text-[11px]">Data</span>
                <span className="font-semibold text-slate-900">
                  {data.dataAgendada ? formatDateBR(data.dataAgendada) : "Defina a data"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Horário</span>
                <span className="font-semibold text-slate-900">
                  {data.horaAgendada || "Defina o horário"}
                </span>
              </div>
            </div>

            {/* Trabalhador */}
            <div>
              <span className="text-slate-500 block text-[11px]">Trabalhador</span>
              <span className="font-semibold text-slate-900 block truncate">
                {data.trabalhadorNome || "Preencha o trabalhador"}
              </span>
              {data.trabalhadorFuncao && (
                <span className="text-[11px] text-slate-600">{data.trabalhadorFuncao}</span>
              )}
            </div>

            {/* Tipo de Exame */}
            <div>
              <span className="text-slate-500 block text-[11px]">Tipo de Exame (ASO)</span>
              {data.tipoExame ? (
                <span className="inline-block rounded bg-sky-50 border border-sky-200 px-2 py-0.5 font-bold text-sky-900 text-[11px] mt-0.5">
                  {data.tipoExame}
                </span>
              ) : (
                <span className="inline-block rounded bg-slate-100 border border-slate-200 px-2 py-0.5 font-normal text-slate-500 text-[11px] mt-0.5">
                  Não selecionado ainda
                </span>
              )}
            </div>

            {/* Exames Complementares */}
            <div>
              <span className="text-slate-500 block text-[11px]">
                Exames Complementares ({examesCompl.length})
              </span>
              {examesCompl.length === 0 ? (
                <span className="text-slate-400 text-[11px]">Nenhum exame complementar</span>
              ) : (
                <div className="flex flex-wrap gap-1 mt-1">
                  {examesCompl.map((e, idx) => (
                    <span
                      key={idx}
                      className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-700 font-medium"
                    >
                      {e.nome}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Responsável & Contato */}
            <div className="border-t border-slate-200 pt-2 grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500 block text-[11px]">Responsável</span>
                <span className="font-medium text-slate-800 truncate block">
                  {data.responsavelNome || "—"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Contato</span>
                <span className="font-medium text-slate-800 truncate block">
                  {data.responsavelTelefone || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="border-t border-slate-200 pt-3 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Valor Exame Clínico</span>
              <span className="font-medium text-slate-900">{formatCurrencyBRL(valorBase)}</span>
            </div>

            {valorAdicionais > 0 && (
              <div className="flex items-center justify-between text-slate-700">
                <span>Adicionais ({examesCompl.length})</span>
                <span className="font-medium text-slate-900">+{formatCurrencyBRL(valorAdicionais)}</span>
              </div>
            )}

            {isPix && (
              <div className="flex items-center justify-between text-emerald-700 font-semibold">
                <span>Desconto PIX Antecipado</span>
                <span>-{formatCurrencyBRL(valorDesconto)}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-slate-500 pt-1 text-[11px]">
              <span>Forma de Pagamento:</span>
              <span className="text-slate-800 font-semibold">
                {formaPagamentoLabels[data.formaPagamento || "PIX_DESCONTO"]}
              </span>
            </div>

            <div className="border-t border-slate-200 pt-2.5 flex items-baseline justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Valor Final
              </span>
              <span className="text-2xl font-black text-[#0F2C59]">
                {formatCurrencyBRL(valorFinal)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Floating Bar - Compact & Non-obstructive */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 py-2.5 shadow-lg">
        <div className="max-w-md mx-auto">
          {/* Drawer Expandable Details */}
          {mobileExpanded && (
            <div className="mb-3 max-h-52 overflow-y-auto space-y-2 border-b border-slate-200 pb-3 text-xs">
              <div className="flex justify-between text-slate-700">
                <span className="text-slate-500">Unidade:</span>
                <span className="font-semibold">{data.unidadeNome || "Não selecionada"}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span className="text-slate-500">Data / Horário:</span>
                <span>{data.dataAgendada ? formatDateBR(data.dataAgendada) : "—"} {data.horaAgendada ? `às ${data.horaAgendada}` : ""}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span className="text-slate-500">Trabalhador:</span>
                <span className="font-semibold">{data.trabalhadorNome || "—"}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span className="text-slate-500">Exame Clínico:</span>
                <span className={`font-bold ${data.tipoExame ? "text-[#0F2C59]" : "text-slate-400"}`}>
                  {data.tipoExame || "Não selecionado"}
                </span>
              </div>
              {examesCompl.length > 0 && (
                <div className="flex justify-between text-slate-700">
                  <span className="text-slate-500">Complementares:</span>
                  <span>{examesCompl.length} adicionados (+{formatCurrencyBRL(valorAdicionais)})</span>
                </div>
              )}
            </div>
          )}

          {/* Bar Header & Price */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setMobileExpanded(!mobileExpanded)}
              className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold py-1"
            >
              <span>Resumo do Pedido</span>
              {mobileExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </button>

            <div className="flex items-baseline gap-1.5">
              <span className="text-[10px] text-slate-500 font-medium">Total:</span>
              <span className="text-lg font-black text-[#0F2C59]">
                {formatCurrencyBRL(valorFinal)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
