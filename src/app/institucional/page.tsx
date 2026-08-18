"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Stethoscope,
  Building2,
  FileCheck,
  Scale,
  Cloud,
  MapPin,
  Phone,
  Clock,
  ArrowRight,
  CheckCircle,
  Send,
  Loader2,
  Award,
} from "lucide-react";
import { formatPhone, formatCpfCnpj } from "@/lib/formatters";

export default function InstitucionalPage() {
  const [orcamentoForm, setOrcamentoForm] = useState({
    nome: "",
    empresa: "",
    cnpj: "",
    email: "",
    telefone: "",
    numVidas: "",
    servicosInteresse: [] as string[],
    mensagem: "",
  });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const toggleServico = (serv: string) => {
    if (orcamentoForm.servicosInteresse.includes(serv)) {
      setOrcamentoForm({
        ...orcamentoForm,
        servicosInteresse: orcamentoForm.servicosInteresse.filter((s) => s !== serv),
      });
    } else {
      setOrcamentoForm({
        ...orcamentoForm,
        servicosInteresse: [...orcamentoForm.servicosInteresse, serv],
      });
    }
  };

  const handleEnviarOrcamento = (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setTimeout(() => {
      setEnviando(false);
      setEnviado(true);
    }, 1000);
  };

  return (
    <div className="flex-1 bg-slate-50 text-slate-900 font-sans w-full max-w-full overflow-x-hidden">
      {/* Hero Section com Imagem */}
      <section className="border-b border-slate-200 bg-white py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 border border-sky-200 px-3.5 py-1 text-xs font-bold text-[#0F2C59]">
                <Award className="h-4 w-4 text-[#0F2C59]" />
                <span>15 Anos no Apoio às Empresas · Fundada em 2011</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Medicina do Trabalho com inteligência pericial para decisões melhores
              </h1>

              <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
                A segurança previne. A medicina acompanha. A perícia transforma sinais em decisões. 
                Ajudamos sua empresa a gerir riscos ocupacionais, controlar afastamentos, atender 100% ao eSocial e reduzir custos com passivos trabalhistas.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0F2C59] hover:bg-[#0c2448] px-6 py-3 text-sm font-bold text-white shadow-xs transition"
                >
                  <span>Agendar Exame Online</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <a
                  href="#orcamento"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 shadow-xs transition"
                >
                  <span>Solicitar Orçamento</span>
                </a>

                <a
                  href="https://api.whatsapp.com/send?phone=5567981131076&text=Olá,%20gostaria%20de%20informações%20sobre%20atendimento%20ocupacional"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 px-4 py-3 text-sm font-bold text-emerald-900 transition"
                >
                  <Phone className="h-4 w-4 text-emerald-700" />
                  <span>WhatsApp: (67) 9 8113-1076</span>
                </a>
              </div>
            </div>

            {/* Imagem Hero */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md">
                <Image
                  src="/images/hero_clinic.jpg"
                  alt="Clínica B&C Saúde - Atendimento Ocupacional"
                  width={720}
                  height={480}
                  className="w-full h-auto object-cover"
                  priority
                />
                <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 backdrop-blur-xs p-3 text-center text-white text-xs font-semibold">
                  B&C Saúde · Atendimento ágil e acolhedor para seus colaboradores
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resultados de Exames Callout */}
      <section className="border-b border-slate-200 bg-slate-100/60 py-8 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-xl border border-slate-200 bg-white shadow-xs">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Consulta de Resultados e Agendamentos</h2>
            <p className="text-xs sm:text-sm text-slate-600 font-normal">
              Acesse seu comprovante com QR Code ou verifique o andamento do seu ASO pelo protocolo.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/consultar"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#0F2C59] hover:bg-[#0c2448] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs transition"
            >
              <span>Consultar Agendamento</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Áreas de Atuação / Serviços com Imagens Reais */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F2C59]">
              Soluções Integradas
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Serviços Especializados para Empresas
            </h2>
            <p className="text-sm text-slate-600 mt-2 font-normal">
              Atendimento completo em conformidade com as Normas Regulamentadoras do Ministério do Trabalho.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Serviço 1: Medicina do Trabalho */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shadow-xs flex flex-col justify-between">
              <div className="relative h-48 w-full">
                <Image
                  src="/images/medicina_trabalho.jpg"
                  alt="Medicina do Trabalho e PCMSO"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Stethoscope className="h-4 w-4 text-[#0F2C59]" />
                    <h3 className="text-sm font-bold text-slate-900">Medicina do Trabalho & PCMSO</h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    Exames clínicos (admissional, demissional, periódico) e complementares com emissão ágil de ASO e coordenação médica registrada no CRM/MS.
                  </p>
                </div>
                <ul className="text-[11px] text-slate-700 space-y-1 pt-2 border-t border-slate-200">
                  <li className="flex items-center gap-1.5"><CheckCircle className="h-3 w-3 text-emerald-600" /> ASO com assinatura digital</li>
                  <li className="flex items-center gap-1.5"><CheckCircle className="h-3 w-3 text-emerald-600" /> Mais de 50 exames complementares</li>
                </ul>
              </div>
            </div>

            {/* Serviço 2: Segurança do Trabalho */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shadow-xs flex flex-col justify-between">
              <div className="relative h-48 w-full">
                <Image
                  src="/images/seguranca_trabalho.jpg"
                  alt="Segurança do Trabalho e PGR"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-4 w-4 text-sky-800" />
                    <h3 className="text-sm font-bold text-slate-900">Segurança do Trabalho & PGR</h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    Mapeamento completo de riscos ambientais (GRO/PGR - NR-1), laudos LTCAT, Insalubridade (NR-15) e Periculosidade (NR-16).
                  </p>
                </div>
                <ul className="text-[11px] text-slate-700 space-y-1 pt-2 border-t border-slate-200">
                  <li className="flex items-center gap-1.5"><CheckCircle className="h-3 w-3 text-sky-700" /> PGR e LTCAT Previdenciário</li>
                  <li className="flex items-center gap-1.5"><CheckCircle className="h-3 w-3 text-sky-700" /> Avaliações ambientais in loco</li>
                </ul>
              </div>
            </div>

            {/* Serviço 3: Perícias Médicas */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shadow-xs flex flex-col justify-between">
              <div className="relative h-48 w-full">
                <Image
                  src="/images/pericias_medicas.jpg"
                  alt="Perícias Médicas e Assistência Técnica"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Scale className="h-4 w-4 text-teal-800" />
                    <h3 className="text-sm font-bold text-slate-900">Perícias Médicas & Assistência</h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    Inteligência pericial com formulação de quesitos estratégicos, acompanhamento presencial de perícias judiciais e impugnação técnica de laudos.
                  </p>
                </div>
                <ul className="text-[11px] text-slate-700 space-y-1 pt-2 border-t border-slate-200">
                  <li className="flex items-center gap-1.5"><CheckCircle className="h-3 w-3 text-teal-700" /> Defesa médica em ações trabalhistas</li>
                  <li className="flex items-center gap-1.5"><CheckCircle className="h-3 w-3 text-teal-700" /> Gestão do FAP e Nexo Técnico (NTEP)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Diferenciais Estratégicos */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F2C59]">
              Nossa Metodologia
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              O que diferencia a B&C Saúde
            </h2>
            <p className="text-sm text-slate-600 mt-2 font-normal">
              Não vendemos apenas papéis e laudos. Oferecemos segurança jurídica e suporte médico contínuo para sua gestão corporativa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-50 border border-sky-200 text-[#0F2C59]">
                <Scale className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Inteligência Pericial Aplicada
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Nossa atuação integra medicina do trabalho e perícia médica judicial. Essa visão estratégica protege sua empresa contra passivos, contesta nexos causais indevidos e qualifica o nexo técnico previdenciário (NTEP).
              </p>
            </div>

            {/* Card 2 */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-50 border border-sky-200 text-sky-800">
                <Cloud className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Adequação Completa ao eSocial SST
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Tecnologia em nuvem para geração e transmissão dos eventos de Saúde e Segurança do Trabalho (S-2210, S-2220 e S-2240) diretamente ao ambiente do Governo Federal, sem retrabalho para o seu RH.
              </p>
            </div>

            {/* Card 3 */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-50 border border-teal-200 text-teal-800">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Gestão de Absenteísmo & FAP
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Controle estruturado de afastamentos previdenciários, investigações de acidentes (CAT), gestão de nexo e ações preventivas que impactam diretamente na redução da alíquota do FAP.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Unidades de Atendimento no MS */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F2C59]">
              Rede de Atendimento
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Unidades Físicas no Mato Grosso do Sul
            </h2>
            <p className="text-sm text-slate-600 mt-2 font-normal">
              Clínicas estruturadas para receber seus colaboradores com agilidade e pontualidade.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Unidade Jardim */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 space-y-3 shadow-xs">
              <div className="flex items-center gap-2 text-[#0F2C59] font-bold text-sm">
                <MapPin className="h-4 w-4" />
                <span>Jardim / MS</span>
              </div>
              <p className="text-xs text-slate-700">
                Rua Sete de Setembro, 772 — Centro<br />
                CEP 79240-000
              </p>
              <div className="pt-2 border-t border-slate-200 text-xs text-slate-600 space-y-1">
                <p className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-500" />
                  <span>(67) 9 8113-1076</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  <span>Segunda a Sexta: 07:30 às 17:00</span>
                </p>
              </div>
              <Link
                href="/"
                className="mt-3 block text-center rounded-lg bg-white hover:bg-slate-100 py-2 text-xs font-bold text-[#0F2C59] border border-slate-300 transition"
              >
                Agendar nesta unidade
              </Link>
            </div>

            {/* Unidade Bela Vista */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 space-y-3 shadow-xs">
              <div className="flex items-center gap-2 text-[#0F2C59] font-bold text-sm">
                <MapPin className="h-4 w-4" />
                <span>Bela Vista / MS</span>
              </div>
              <p className="text-xs text-slate-700">
                Rua Visconde de Taunay, 555 — Centro<br />
                Bela Vista - MS
              </p>
              <div className="pt-2 border-t border-slate-200 text-xs text-slate-600 space-y-1">
                <p className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-500" />
                  <span>(67) 9 8113-1076</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  <span>Segunda a Sexta: 08:00 às 17:00</span>
                </p>
              </div>
              <Link
                href="/"
                className="mt-3 block text-center rounded-lg bg-white hover:bg-slate-100 py-2 text-xs font-bold text-[#0F2C59] border border-slate-300 transition"
              >
                Agendar nesta unidade
              </Link>
            </div>

            {/* Unidade Bonito */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 space-y-3 shadow-xs">
              <div className="flex items-center gap-2 text-[#0F2C59] font-bold text-sm">
                <MapPin className="h-4 w-4" />
                <span>Bonito / MS</span>
              </div>
              <p className="text-xs text-slate-700">
                Rua Pércio Schamann, 374 — Vila Donária<br />
                Bonito - MS
              </p>
              <div className="pt-2 border-t border-slate-200 text-xs text-slate-600 space-y-1">
                <p className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-500" />
                  <span>(67) 9 8113-1076</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  <span>Segunda a Sexta: 07:30 às 16:30</span>
                </p>
              </div>
              <Link
                href="/"
                className="mt-3 block text-center rounded-lg bg-white hover:bg-slate-100 py-2 text-xs font-bold text-[#0F2C59] border border-slate-300 transition"
              >
                Agendar nesta unidade
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Responsável Técnico & Registro Médico */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-200 bg-slate-100/60">
        <div className="mx-auto max-w-4xl text-center space-y-2">
          <p className="text-sm font-bold text-slate-900">
            Dr. Marcos Cortes de Carvalho — Responsável Técnico
          </p>
          <p className="text-xs font-mono font-bold text-[#0F2C59]">
            CRM/MS 5773 · RQE 4675
          </p>
          <p className="text-xs text-slate-600">
            Bento & Carvalho LTDA · CRM/MS Jurídico: 955 · Sede: R. Sete de Setembro, 772, Jardim/MS
          </p>
          <blockquote className="text-xs italic text-slate-500 pt-3 border-t border-slate-200 max-w-md mx-auto">
            &ldquo;Direi do Senhor: Ele é o meu Deus, o meu refúgio, a minha fortaleza, e nele confiarei.&rdquo; — Salmos 91:2
          </blockquote>
        </div>
      </section>

      {/* Formulário de Orçamento Corporativo */}
      <section id="orcamento" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-xs">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0F2C59]">
                Atendimento Corporativo
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                Solicite uma Proposta para sua Empresa
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 font-normal">
                Preencha os dados abaixo e receba um orçamento personalizado para gestão de PCMSO, PGR, eSocial e exames ocupacionais.
              </p>
            </div>

            {enviado ? (
              <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-6 text-center space-y-2">
                <CheckCircle className="h-10 w-10 text-emerald-700 mx-auto" />
                <h3 className="text-base font-bold text-emerald-950">Solicitação Recebida com Sucesso!</h3>
                <p className="text-xs text-emerald-800">
                  Nossa equipe técnica entrará em contato em até 1 dia útil pelo WhatsApp/E-mail informado.
                </p>
              </div>
            ) : (
              <form onSubmit={handleEnviarOrcamento} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Seu Nome *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nome e Sobrenome"
                      value={orcamentoForm.nome}
                      onChange={(e) => setOrcamentoForm({ ...orcamentoForm, nome: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 focus:border-[#0F2C59] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Nome da Empresa *</label>
                    <input
                      type="text"
                      required
                      placeholder="Razão Social ou Nome Fantasia"
                      value={orcamentoForm.empresa}
                      onChange={(e) => setOrcamentoForm({ ...orcamentoForm, empresa: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 focus:border-[#0F2C59] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">CNPJ da Empresa</label>
                    <input
                      type="text"
                      maxLength={18}
                      placeholder="00.000.000/0001-00"
                      value={orcamentoForm.cnpj}
                      onChange={(e) => setOrcamentoForm({ ...orcamentoForm, cnpj: formatCpfCnpj(e.target.value) })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 focus:border-[#0F2C59] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Número Aproximado de Funcionários</label>
                    <input
                      type="text"
                      placeholder="Ex: 15 vidas"
                      value={orcamentoForm.numVidas}
                      onChange={(e) => setOrcamentoForm({ ...orcamentoForm, numVidas: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 focus:border-[#0F2C59] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">E-mail Corporativo *</label>
                    <input
                      type="email"
                      required
                      placeholder="rh@empresa.com.br"
                      value={orcamentoForm.email}
                      onChange={(e) => setOrcamentoForm({ ...orcamentoForm, email: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 focus:border-[#0F2C59] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Telefone / WhatsApp *</label>
                    <input
                      type="text"
                      required
                      maxLength={15}
                      placeholder="(67) 98113-1076"
                      value={orcamentoForm.telefone}
                      onChange={(e) => setOrcamentoForm({ ...orcamentoForm, telefone: formatPhone(e.target.value) })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 focus:border-[#0F2C59] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-2">Serviços de Interesse:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      "PCMSO (NR-7)",
                      "PGR / GRO (NR-1)",
                      "LTCAT Previdenciário",
                      "Exames Ocupacionais / ASO",
                      "Envio ao eSocial SST",
                      "Perícias Judiciais",
                    ].map((serv) => {
                      const isSel = orcamentoForm.servicosInteresse.includes(serv);
                      return (
                        <button
                          key={serv}
                          type="button"
                          onClick={() => toggleServico(serv)}
                          className={`p-2.5 rounded-lg border text-left transition ${
                            isSel
                              ? "bg-sky-50 border-[#0F2C59] text-[#0F2C59] font-bold"
                              : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          <span className="text-[11px]">{serv}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Mensagem ou Observações Adicionais</label>
                  <textarea
                    rows={3}
                    placeholder="Descreva detalhes sobre sua empresa, unidades ou necessidades específicas..."
                    value={orcamentoForm.mensagem}
                    onChange={(e) => setOrcamentoForm({ ...orcamentoForm, mensagem: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 focus:border-[#0F2C59] focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={enviando}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#0F2C59] hover:bg-[#0c2448] px-8 py-3 text-sm font-bold text-white shadow-xs transition disabled:opacity-50"
                  >
                    {enviando ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Enviando Proposta...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Enviar Solicitação de Orçamento</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
