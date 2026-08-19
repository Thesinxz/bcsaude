"use client";

import { useState } from "react";
import { ArrowLeft, Loader2, ArrowRight } from "lucide-react";
import { formatCpfCnpj } from "@/lib/formatters";
import { isValidDocEmpresa } from "@/lib/validators";

interface FlowStep2IdentificacaoProps {
  empresaDoc: string;
  perfil: string;
  onChange: (fields: Partial<{
    empresaDoc: string;
    empresaRazaoSocial: string;
    empresaEndereco: string;
    empresaEmailAso: string;
  }>) => void;
  onNext: (isCoordinated: boolean) => void;
  onBack: () => void;
}

export default function FlowStep2Identificacao({
  empresaDoc,
  perfil,
  onChange,
  onNext,
  onBack,
}: FlowStep2IdentificacaoProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isServidor = perfil.includes("SERVIDOR") || perfil.includes("CONCURSO");

  const handleVerify = async () => {
    setErrorMsg("");

    if (!empresaDoc.trim()) {
      setErrorMsg("Informe o documento para prosseguir.");
      return;
    }

    const clean = empresaDoc.replace(/\D/g, "");
    if (!isServidor && clean.length !== 14 && clean.length !== 11) {
      setErrorMsg("Informe um CNPJ (14 dígitos) ou CPF/CAEPF (11 dígitos) válido.");
      return;
    }

    setLoading(true);

    try {
      if (clean.length === 14) {
        // Busca na Receita Federal
        const res = await fetch(`/api/cnpj/${clean}`);
        const data = await res.json();

        if (res.ok && data.sucesso && data.razao_social) {
          let enderecoFormatado = "";
          if (data.logradouro) {
            enderecoFormatado = `${data.logradouro}${data.numero ? `, ${data.numero}` : ""}${
              data.bairro ? ` - ${data.bairro}` : ""
            }${data.municipio ? `, ${data.municipio}` : ""}${data.uf ? `/${data.uf}` : ""}`;
          }

          onChange({
            empresaRazaoSocial: data.razao_social,
            empresaEndereco: enderecoFormatado,
            empresaEmailAso: data.email || "",
          });
        }
      }
    } catch (e) {
      console.warn("Erro ao buscar dados na receita:", e);
    } finally {
      setLoading(false);
      // Avança para o passo 3 (Tipo de Exame) indicando formulário avulso por padrão
      onNext(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleVerify();
    }
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

      <div className="rounded-2xl border border-sky-900/50 bg-[#0b162c]/90 backdrop-blur-md p-6 sm:p-8 shadow-[0_0_35px_rgba(0,180,216,0.08)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-sky-400/40 text-sky-400 text-xs font-bold">
            i
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-slate-100">
            Identificação
          </h2>
        </div>

        {errorMsg && (
          <div className="mb-5 rounded-lg bg-rose-950/60 border border-rose-800/80 p-3 text-xs text-rose-300">
            {errorMsg}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              {isServidor
                ? "CPF DO CANDIDATO OU EDITAL DO CONCURSO"
                : "CPF / CAEPF OU CNPJ DO EMPREGADOR"}
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder={isServidor ? "000.000.000-00" : "00.000.000/0001-00 ou CPF"}
                value={empresaDoc}
                onChange={(e) => onChange({ empresaDoc: formatCpfCnpj(e.target.value) })}
                onKeyDown={handleKeyDown}
                className="flex-1 rounded-xl border border-sky-950/80 bg-[#070e1c] px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-[#00d2ff] focus:outline-none focus:ring-1 focus:ring-[#00d2ff]/30 transition font-medium"
              />

              <button
                type="button"
                onClick={handleVerify}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00d2ff] to-[#0077b6] hover:brightness-110 px-8 py-3 text-sm font-bold text-[#050b14] shadow-[0_0_25px_rgba(0,210,255,0.3)] transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verificando...</span>
                  </>
                ) : (
                  <span>Verificar</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
