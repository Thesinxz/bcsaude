"use client";

import { useState } from "react";
import { Building2, Search, Loader2, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, Landmark, Package, Upload } from "lucide-react";
import { formatCpfCnpj } from "@/lib/formatters";
import { isValidDocEmpresa, isValidEmail } from "@/lib/validators";

interface Step3EmpresaProps {
  perfil?: string;
  empresaDoc: string;
  empresaRazaoSocial: string;
  empresaEmailAso: string;
  empresaEndereco: string;
  onChange: (fields: Partial<{
    empresaDoc: string;
    empresaRazaoSocial: string;
    empresaEmailAso: string;
    empresaEndereco: string;
  }>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step3Empresa({
  perfil = "EMPRESAS (COM CNPJ) / OU EMPREGADORES (CPF/CAEPF / CEI)",
  empresaDoc,
  empresaRazaoSocial,
  empresaEmailAso,
  empresaEndereco,
  onChange,
  onNext,
  onBack,
}: Step3EmpresaProps) {
  const isServidor = perfil.includes("SERVIDOR") || perfil.includes("CONCURSO");
  const isKit = perfil.includes("KIT");

  const [loadingCnpj, setLoadingCnpj] = useState(false);
  const [cnpjFeedback, setCnpjFeedback] = useState<{
    tipo: "success" | "error" | "info" | null;
    msg: string;
  }>({ tipo: null, msg: "" });
  const [errorMsg, setErrorMsg] = useState("");

  const buscarCnpj = async (docValue?: string) => {
    const valueToTest = docValue !== undefined ? docValue : empresaDoc;
    const clean = valueToTest.replace(/\D/g, "");

    if (clean.length < 11) {
      setCnpjFeedback({
        tipo: "info",
        msg: "Informe o CNPJ com 14 dígitos (ou CPF com 11 dígitos) para buscar.",
      });
      return;
    }

    setLoadingCnpj(true);
    setCnpjFeedback({ tipo: null, msg: "" });

    try {
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
          empresaEndereco: enderecoFormatado || empresaEndereco,
          empresaEmailAso: data.email && !empresaEmailAso ? data.email : empresaEmailAso,
        });

        setCnpjFeedback({
          tipo: "success",
          msg: `Empresa localizada: ${data.razao_social} (${data.situacao_cadastral || "ATIVA"})`,
        });
      } else {
        setCnpjFeedback({
          tipo: "error",
          msg: data.mensagem || "Não foi possível autopreencher. Preencha a Razão Social manualmente abaixo.",
        });
      }
    } catch {
      setCnpjFeedback({
        tipo: "error",
        msg: "Instabilidade na consulta da Receita Federal. Você pode preencher os dados manualmente.",
      });
    } finally {
      setLoadingCnpj(false);
    }
  };

  const handleDocChange = (val: string) => {
    const formatted = formatCpfCnpj(val);
    onChange({ empresaDoc: formatted });

    const clean = formatted.replace(/\D/g, "");
    if (clean.length === 14) {
      buscarCnpj(clean);
    } else {
      setCnpjFeedback({ tipo: null, msg: "" });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      buscarCnpj();
    }
  };

  const handleValidateAndNext = () => {
    setErrorMsg("");

    if (!isServidor) {
      if (!empresaDoc.trim() || !isValidDocEmpresa(empresaDoc)) {
        setErrorMsg("Informe um CNPJ ou CPF do empregador válido.");
        return;
      }
    }

    if (!empresaRazaoSocial.trim()) {
      setErrorMsg(
        isServidor
          ? "Informe o Órgão Convocador / Edital do Concurso."
          : "Informe a Razão Social ou Nome do Empregador."
      );
      return;
    }
    if (!empresaEmailAso.trim() || !isValidEmail(empresaEmailAso)) {
      setErrorMsg("Informe um e-mail válido para receber o ASO e documentos.");
      return;
    }

    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-800 border border-sky-200">
            {isServidor ? <Landmark className="h-5 w-5" /> : isKit ? <Package className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              {isServidor ? "Dados do Concurso / Órgão Público" : isKit ? "Dados do Kit / Empresa Coordenada" : "Dados da Empresa Contratante"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal">
              {isServidor
                ? "Informe o órgão convocador e o e-mail para envio do laudo de aptidão"
                : isKit
                ? "Identificação da empresa e orientações do kit de atendimento"
                : "Informe o CNPJ para busca automática na Receita Federal ou digite os dados"}
            </p>
          </div>
        </div>

        {isKit && (
          <div className="mb-5 rounded-lg bg-sky-50 border border-sky-200 p-3.5 text-xs text-sky-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <Package className="h-4 w-4 text-sky-700" />
              Atendimento Coordenado (Faturado em Contrato PJ)
            </p>
            <p className="text-sky-800 font-normal">
              Nenhuma cobrança é realizada nesta etapa. O atendimento será faturado diretamente pelo contrato da empresa/assessoria vinculada.
            </p>
          </div>
        )}

        {isServidor && (
          <div className="mb-5 rounded-lg bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <Landmark className="h-4 w-4 text-amber-700" />
              Tarifa Social de Concurso / Processo Seletivo (R$ 70,00)
            </p>
            <p className="text-amber-800 font-normal">
              Preço especial para candidatos convocados em editais públicos (SED, SEMED, Secretarias de Estado e Municípios).
            </p>
          </div>
        )}

        {errorMsg && (
          <div className="mb-5 flex items-center gap-2.5 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* CNPJ Input (apenas para Empresas ou opcional para Servidor) */}
          {!isServidor ? (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                CNPJ ou CPF do Empregador *
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="00.000.000/0001-00 ou CPF"
                    maxLength={18}
                    value={empresaDoc}
                    onChange={(e) => handleDocChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#0F2C59] focus:outline-none transition font-medium"
                  />
                  {loadingCnpj && (
                    <div className="absolute right-3 top-2.5">
                      <Loader2 className="h-5 w-5 animate-spin text-[#0F2C59]" />
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => buscarCnpj()}
                  disabled={loadingCnpj}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0F2C59] hover:bg-[#0c2448] text-xs sm:text-sm font-bold text-white shadow-xs px-5 py-2.5 transition disabled:opacity-50"
                >
                  {loadingCnpj ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Buscando na Receita...</span>
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      <span>Buscar CNPJ</span>
                    </>
                  )}
                </button>
              </div>

              {/* Feedback CNPJ */}
              {cnpjFeedback.msg && (
                <div
                  className={`mt-2.5 flex items-center gap-2 rounded-lg p-3 text-xs ${
                    cnpjFeedback.tipo === "success"
                      ? "bg-emerald-50 text-emerald-900 border border-emerald-300 font-semibold"
                      : cnpjFeedback.tipo === "error"
                      ? "bg-rose-50 text-rose-900 border border-rose-200"
                      : "bg-sky-50 text-sky-900 border border-sky-200"
                  }`}
                >
                  {cnpjFeedback.tipo === "success" ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0" />
                  )}
                  <span>{cnpjFeedback.msg}</span>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                CPF do Candidato Convocado (Opcional se já informado)
              </label>
              <input
                type="text"
                placeholder="000.000.000-00"
                maxLength={14}
                value={empresaDoc}
                onChange={(e) => onChange({ empresaDoc: formatCpfCnpj(e.target.value) })}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#0F2C59] focus:outline-none transition font-medium"
              />
            </div>
          )}

          {/* Razão Social / Órgão */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              {isServidor ? "Órgão Convocador / Edital do Concurso *" : "Razão Social / Nome do Empregador *"}
            </label>
            <input
              type="text"
              placeholder={isServidor ? "Ex: SED-MS (Edital 01/2026), SEMED, Polícia Civil, Prefeitura" : "Razão Social completa da empresa"}
              value={empresaRazaoSocial}
              onChange={(e) => onChange({ empresaRazaoSocial: e.target.value.toUpperCase() })}
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#0F2C59] focus:outline-none transition uppercase font-semibold"
            />
          </div>

          {/* E-mail para ASO / Laudo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {isServidor ? "E-mail para Receber o Laudo de Aptidão *" : "E-mail para Receber o ASO *"}
              </label>
              <input
                type="email"
                placeholder={isServidor ? "seu.email@exemplo.com" : "rh@empresa.com.br"}
                value={empresaEmailAso}
                onChange={(e) => onChange({ empresaEmailAso: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#0F2C59] focus:outline-none transition"
              />
              <p className="mt-1 text-[11px] text-slate-500 font-normal">
                {isServidor
                  ? "O laudo médico pericial será assinado digitalmente e enviado para este e-mail."
                  : "O ASO assinado digitalmente será enviado para este endereço."}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {isServidor ? "Município / Lotação (Opcional)" : "Endereço da Empresa (Opcional)"}
              </label>
              <input
                type="text"
                placeholder={isServidor ? "Ex: Campo Grande - MS" : "Logradouro, Bairro, Cidade/UF"}
                value={empresaEndereco}
                onChange={(e) => onChange({ empresaEndereco: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#0F2C59] focus:outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8 pt-5 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar</span>
          </button>

          <button
            type="button"
            onClick={handleValidateAndNext}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0F2C59] hover:bg-[#0c2448] px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition"
          >
            <span>Avançar para Trabalhador</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
