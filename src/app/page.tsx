"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import FlowStep1Perfil from "@/components/wizard/FlowStep1Perfil";
import FlowStep2Identificacao from "@/components/wizard/FlowStep2Identificacao";
import FlowStep3TipoExame from "@/components/wizard/FlowStep3TipoExame";
import FlowStep4Formulario from "@/components/wizard/FlowStep4Formulario";
import { AgendamentoData, ExameItem, PerfilContratante, TipoExameOcupacional, UnidadeItem } from "@/types";
import { INITIAL_UNIDADES, INITIAL_EXAMES } from "@/lib/initialData";

export default function AgendamentoPage() {
  const router = useRouter();

  const [unidades, setUnidades] = useState<UnidadeItem[]>(INITIAL_UNIDADES);
  const [todosExames, setTodosExames] = useState<ExameItem[]>(INITIAL_EXAMES);
  const [valorBasePadrao, setValorBasePadrao] = useState(90.0);
  const [descontoPixReais, setDescontoPixReais] = useState(7.0);
  const [horasLimitePix, setHorasLimitePix] = useState(2);

  const [currentStep, setCurrentStep] = useState(1);
  const [isCoordinated, setIsCoordinated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<Partial<AgendamentoData>>({
    perfilContratante: "EMPRESAS (COM CNPJ) / OU EMPREGADORES (CPF/CAEPF / CEI)",
    unidadeId: INITIAL_UNIDADES[0].id,
    unidadeNome: INITIAL_UNIDADES[0].nome,
    unidadeEndereco: `${INITIAL_UNIDADES[0].endereco}, ${INITIAL_UNIDADES[0].cidade} - ${INITIAL_UNIDADES[0].uf}`,
    dataAgendada: "",
    horaAgendada: "",
    responsavelNome: "",
    responsavelEmail: "",
    responsavelTelefone: "(67) 9 8113-1076",
    empresaDoc: "",
    empresaRazaoSocial: "",
    empresaEmailAso: "",
    empresaEndereco: "",
    trabalhadorCpf: "",
    trabalhadorNome: "",
    trabalhadorFuncao: "",
    trabalhadorNasc: "",
    tipoExame: "ADMISSIONAL",
    examesComplementares: [],
    formaPagamento: "PIX_DESCONTO",
    lgpdAceite: true,
  });

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch("/api/config");
        if (res.ok) {
          const data = await res.json();
          if (data.unidades && data.unidades.length > 0) {
            setUnidades(data.unidades);
          }
          if (data.exames && data.exames.length > 0) {
            setTodosExames(data.exames);
          }
          if (data.config) {
            setValorBasePadrao(data.config.valorBasePadrao || 90.0);
            setDescontoPixReais(data.config.descontoPixReais || 7.0);
            setHorasLimitePix(data.config.horasLimitePix || 2);
          }
        }
      } catch (e) {
        console.warn("Usando configurações padrão locais:", e);
      }
    }
    loadConfig();
  }, []);

  const updateFormData = (fields: Partial<AgendamentoData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/agendamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.protocolo) {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
        });

        router.push(`/comprovante/${data.protocolo}`);
      } else {
        alert(data.error || "Erro ao salvar agendamento. Verifique os dados.");
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao conectar com o servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050b14] text-slate-100 relative overflow-x-hidden selection:bg-[#00d2ff]/30">
      {/* Luz ambiente de fundo (Glow) */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-[#00d2ff]/10 via-[#0f2c59]/20 to-transparent blur-[120px] -z-10" />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-20">
        {/* Top Header Pill Badge */}
        <div className="flex justify-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-3 rounded-full border border-sky-400/30 bg-[#0c1d38]/90 px-6 py-2.5 shadow-[0_0_35px_rgba(0,210,255,0.2)] backdrop-blur-md">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#00d2ff] to-[#0077b6] text-[11px] font-black text-[#050b14] shadow-[0_0_12px_#00d2ff]">
              B&C
            </div>
            <span className="text-sm font-semibold tracking-wider text-slate-100">
              Saúde Agendamentos
            </span>
          </div>
        </div>

        {/* STEP 1: Selecione o Perfil */}
        {currentStep === 1 && (
          <FlowStep1Perfil
            perfil={(formData.perfilContratante as PerfilContratante) || "EMPRESAS (COM CNPJ) / OU EMPREGADORES (CPF/CAEPF / CEI)"}
            onSelect={(perfil) => updateFormData({ perfilContratante: perfil })}
            onNext={() => setCurrentStep(2)}
          />
        )}

        {/* STEP 2: Identificação (CNPJ / CPF) */}
        {currentStep === 2 && (
          <FlowStep2Identificacao
            empresaDoc={formData.empresaDoc || ""}
            perfil={formData.perfilContratante || ""}
            onChange={updateFormData}
            onNext={(coordinated) => {
              setIsCoordinated(coordinated);
              setCurrentStep(3);
            }}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {/* STEP 3: Tipo de Exame */}
        {currentStep === 3 && (
          <FlowStep3TipoExame
            tipoExame={formData.tipoExame || "ADMISSIONAL"}
            isCoordinated={isCoordinated}
            onChange={(tipo) => updateFormData({ tipoExame: tipo })}
            onNext={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(2)}
          />
        )}

        {/* STEP 4: Formulário Detalhado Completo */}
        {currentStep === 4 && (
          <FlowStep4Formulario
            formData={formData}
            unidades={unidades}
            todosExames={todosExames}
            valorBasePadrao={valorBasePadrao}
            descontoPixReais={descontoPixReais}
            horasLimitePix={horasLimitePix}
            isSubmitting={isSubmitting}
            onChange={updateFormData}
            onSubmit={handleFinalSubmit}
            onBack={() => setCurrentStep(3)}
          />
        )}

        {/* Footer info */}
        <footer className="mt-16 text-center text-xs text-slate-500 font-normal">
          <p>© 2026 B&C Saúde · Ambiente para autoatendimento.</p>
        </footer>
      </main>
    </div>
  );
}
