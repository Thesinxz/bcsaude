"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import StepIndicator from "@/components/wizard/StepIndicator";
import Step1Perfil from "@/components/wizard/Step1Perfil";
import Step2Atendimento from "@/components/wizard/Step2Atendimento";
import Step3Empresa from "@/components/wizard/Step3Empresa";
import Step4Trabalhador from "@/components/wizard/Step4Trabalhador";
import Step5Pagamento from "@/components/wizard/Step5Pagamento";
import ResumoCard from "@/components/wizard/ResumoCard";
import { AgendamentoData, ExameItem, FormaPagamento, PerfilContratante, UnidadeItem } from "@/types";
import { INITIAL_UNIDADES, INITIAL_EXAMES } from "@/lib/initialData";
import { Calendar } from "lucide-react";

export default function AgendamentoPage() {
  const router = useRouter();

  const [unidades, setUnidades] = useState<UnidadeItem[]>(INITIAL_UNIDADES);
  const [todosExames, setTodosExames] = useState<ExameItem[]>(INITIAL_EXAMES);
  const [valorBasePadrao, setValorBasePadrao] = useState(90.0);
  const [descontoPixReais, setDescontoPixReais] = useState(7.0);
  const [horasLimitePix, setHorasLimitePix] = useState(2);

  const [currentStep, setCurrentStep] = useState(1);
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
    responsavelTelefone: "",
    empresaDoc: "",
    empresaRazaoSocial: "",
    empresaEmailAso: "",
    empresaEndereco: "",
    trabalhadorCpf: "",
    trabalhadorNome: "",
    trabalhadorFuncao: "",
    trabalhadorNasc: "",
    tipoExame: "",
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
          particleCount: 80,
          spread: 70,
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
    <div className="flex-1 py-6 sm:py-10 px-3.5 sm:px-6 lg:px-8 pb-36 lg:pb-12 bg-slate-50 w-full max-w-full overflow-x-hidden">
      <div className="mx-auto max-w-6xl w-full">
        {/* Main Banner */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3.5 py-1 text-xs font-bold text-[#0F2C59] border border-sky-200 mb-2.5">
            <Calendar className="h-3.5 w-3.5 text-[#0F2C59]" />
            <span>Autoatendimento B&C Saúde Ocupacional</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Agendamento de Exames Ocupacionais & ASO
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-xl mx-auto font-normal">
            Validação de dados na Receita Federal, catálogo de exames complementares e emissão de comprovante seguro.
          </p>
        </div>

        {/* Stepper Indicator */}
        <StepIndicator
          currentStep={currentStep}
          totalSteps={5}
          onStepClick={(step) => setCurrentStep(step)}
        />

        {/* Main 2-column layout */}
        <div className="flex flex-col lg:flex-row items-start gap-6">
          <div className="w-full flex-1 min-w-0">
            {currentStep === 1 && (
              <Step1Perfil
                perfil={(formData.perfilContratante as PerfilContratante) || "EMPRESAS (COM CNPJ) / OU EMPREGADORES (CPF/CAEPF / CEI)"}
                onSelect={(perfil) => updateFormData({ perfilContratante: perfil })}
                onNext={() => setCurrentStep(2)}
              />
            )}

            {currentStep === 2 && (
              <Step2Atendimento
                unidades={unidades}
                unidadeId={formData.unidadeId || ""}
                unidadeNome={formData.unidadeNome || ""}
                unidadeEndereco={formData.unidadeEndereco || ""}
                dataAgendada={formData.dataAgendada || ""}
                horaAgendada={formData.horaAgendada || ""}
                responsavelNome={formData.responsavelNome || ""}
                responsavelEmail={formData.responsavelEmail || ""}
                responsavelTelefone={formData.responsavelTelefone || ""}
                onChange={updateFormData}
                onNext={() => setCurrentStep(3)}
                onBack={() => setCurrentStep(1)}
              />
            )}

            {currentStep === 3 && (
              <Step3Empresa
                empresaDoc={formData.empresaDoc || ""}
                empresaRazaoSocial={formData.empresaRazaoSocial || ""}
                empresaEmailAso={formData.empresaEmailAso || ""}
                empresaEndereco={formData.empresaEndereco || ""}
                onChange={updateFormData}
                onNext={() => setCurrentStep(4)}
                onBack={() => setCurrentStep(2)}
              />
            )}

            {currentStep === 4 && (
              <Step4Trabalhador
                trabalhadorCpf={formData.trabalhadorCpf || ""}
                trabalhadorNome={formData.trabalhadorNome || ""}
                trabalhadorFuncao={formData.trabalhadorFuncao || ""}
                trabalhadorNasc={formData.trabalhadorNasc || ""}
                tipoExame={formData.tipoExame || "ADMISSIONAL"}
                examesComplementares={formData.examesComplementares || []}
                todosExamesDisponiveis={todosExames}
                onChange={updateFormData}
                onNext={() => setCurrentStep(5)}
                onBack={() => setCurrentStep(3)}
              />
            )}

            {currentStep === 5 && (
              <Step5Pagamento
                formaPagamento={(formData.formaPagamento as FormaPagamento) || "PIX_DESCONTO"}
                valorBase={valorBasePadrao}
                valorDescontoPix={descontoPixReais}
                horasLimitePix={horasLimitePix}
                lgpdAceite={formData.lgpdAceite ?? true}
                isSubmitting={isSubmitting}
                onChange={updateFormData}
                onSubmit={handleFinalSubmit}
                onBack={() => setCurrentStep(4)}
              />
            )}
          </div>

          {/* Dynamic Summary Card */}
          <ResumoCard
            data={formData}
            valorBasePadrao={valorBasePadrao}
            descontoPixReais={descontoPixReais}
          />
        </div>
      </div>
    </div>
  );
}
