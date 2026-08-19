"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import StepIndicator from "@/components/wizard/StepIndicator";
import Step1Perfil from "@/components/wizard/Step1Perfil";
import Step2Atendimento from "@/components/wizard/Step2Atendimento";
import Step3Empresa from "@/components/wizard/Step3Empresa";
import Step4Trabalhador from "@/components/wizard/Step4Trabalhador";
import Step5Pagamento from "@/components/wizard/Step5Pagamento";
import ResumoCard from "@/components/wizard/ResumoCard";
import ToastContainer, { ToastMessage, ToastType } from "@/components/ui/Toast";
import { AgendamentoData, ExameItem, FormaPagamento, PerfilContratante, UnidadeItem } from "@/types";
import { INITIAL_UNIDADES, INITIAL_EXAMES } from "@/lib/initialData";
import { Calendar } from "lucide-react";
import { isValidCPF, isValidDocEmpresa, isValidEmail } from "@/lib/validators";

export default function AgendamentoPage() {
  const router = useRouter();

  const [unidades, setUnidades] = useState<UnidadeItem[]>(INITIAL_UNIDADES);
  const [todosExames, setTodosExames] = useState<ExameItem[]>(INITIAL_EXAMES);
  const [valorBasePadrao, setValorBasePadrao] = useState(90.0);
  const [descontoPixReais, setDescontoPixReais] = useState(7.0);
  const [horasLimitePix, setHorasLimitePix] = useState(2);

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastType, title: string, message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const [formData, setFormData] = useState<Partial<AgendamentoData>>({
    perfilContratante: "EMPRESAS (COM CNPJ) / OU EMPREGADORES (CPF/CAEPF / CEI)",
    unidadeId: INITIAL_UNIDADES[0].id,
    unidadeNome: INITIAL_UNIDADES[0].nome,
    unidadeEndereco: `${INITIAL_UNIDADES[0].endereco}, ${INITIAL_UNIDADES[0].cidade} - ${INITIAL_UNIDADES[0].uf}`,
    dataAgendada: "",
    horaAgendada: "",
    responsavelNome: "",
    responsavelEmail: "",
    responsavelTelefone: "(67) 98113-1076",
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

  const validateAllFieldsAndGoToError = (): boolean => {
    const isServidor = formData.perfilContratante?.includes("SERVIDOR") || formData.perfilContratante?.includes("CONCURSO");

    // 1. Validação da Etapa 2 (Atendimento & Responsável)
    if (!formData.dataAgendada || !formData.horaAgendada) {
      setCurrentStep(2);
      addToast("warning", "Etapa 2: Data & Horário", "Selecione o dia e o horário de atendimento desejados.");
      return false;
    }
    if (!formData.responsavelNome?.trim()) {
      setCurrentStep(2);
      addToast("warning", "Etapa 2: Responsável", "Informe o nome do responsável pelo agendamento.");
      return false;
    }
    if (!formData.responsavelEmail?.trim() || !isValidEmail(formData.responsavelEmail)) {
      setCurrentStep(2);
      addToast("warning", "Etapa 2: E-mail", "Informe um e-mail de contato válido.");
      return false;
    }
    if (!formData.responsavelTelefone?.trim() || formData.responsavelTelefone.length < 10) {
      setCurrentStep(2);
      addToast("warning", "Etapa 2: WhatsApp", "Informe o telefone/WhatsApp para envio do comprovante.");
      return false;
    }

    // 2. Validação da Etapa 3 (Empresa)
    if (!isServidor && (!formData.empresaDoc?.trim() || !isValidDocEmpresa(formData.empresaDoc))) {
      setCurrentStep(3);
      addToast("warning", "Etapa 3: Empresa", "Informe um CNPJ ou CPF do empregador válido.");
      return false;
    }
    if (!formData.empresaRazaoSocial?.trim()) {
      setCurrentStep(3);
      addToast(
        "warning",
        "Etapa 3: Identificação",
        isServidor ? "Informe o Órgão Convocador / Edital do Concurso." : "Informe a Razão Social da empresa."
      );
      return false;
    }
    if (!formData.empresaEmailAso?.trim() || !isValidEmail(formData.empresaEmailAso)) {
      setCurrentStep(3);
      addToast("warning", "Etapa 3: E-mail do ASO", "Informe um e-mail válido para envio do ASO assinado.");
      return false;
    }

    // 3. Validação da Etapa 4 (Trabalhador & Tipo de Exame)
    if (!formData.tipoExame) {
      setCurrentStep(4);
      addToast("warning", "Etapa 4: Tipo de Exame", "Selecione o tipo de exame clínico (Admissional, Demissional, Periódico, etc.).");
      return false;
    }
    if (!formData.trabalhadorCpf?.trim() || !isValidCPF(formData.trabalhadorCpf)) {
      setCurrentStep(4);
      addToast("warning", "Etapa 4: CPF do Trabalhador", "Informe um CPF válido para o colaborador.");
      return false;
    }
    if (!formData.trabalhadorNome?.trim()) {
      setCurrentStep(4);
      addToast("warning", "Etapa 4: Nome do Trabalhador", "Informe o nome completo do colaborador.");
      return false;
    }
    if (!formData.trabalhadorFuncao?.trim()) {
      setCurrentStep(4);
      addToast("warning", "Etapa 4: Cargo/Função", "Informe a função que o colaborador exerce ou exercerá.");
      return false;
    }
    if (!formData.trabalhadorNasc?.trim() || formData.trabalhadorNasc.length < 8) {
      setCurrentStep(4);
      addToast("warning", "Etapa 4: Nascimento", "Informe a data de nascimento do trabalhador (DD/MM/AAAA).");
      return false;
    }

    // 4. Validação da Etapa 5 (LGPD)
    if (!formData.lgpdAceite) {
      setCurrentStep(5);
      addToast("warning", "Etapa 5: Termos & LGPD", "Você precisa declarar ciência dos termos da LGPD e políticas para finalizar.");
      return false;
    }

    return true;
  };

  const handleFinalSubmit = async () => {
    if (!validateAllFieldsAndGoToError()) {
      return;
    }

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

        addToast("success", "Agendamento Criado!", `Protocolo ${data.protocolo} gerado com sucesso.`);
        setTimeout(() => {
          router.push(`/comprovante/${data.protocolo}`);
        }, 300);
      } else {
        addToast("error", "Não foi possível finalizar", data.error || "Verifique os dados informados e tente novamente.");
      }
    } catch (e) {
      console.error(e);
      addToast("error", "Falha de Conexão", "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 py-6 sm:py-10 px-3.5 sm:px-6 lg:px-8 pb-36 lg:pb-12 bg-slate-50 w-full max-w-full overflow-x-hidden">
      {/* Toast Notifications Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

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
                perfil={formData.perfilContratante}
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
                perfil={formData.perfilContratante}
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
