"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { CheckCircle2, Printer, ArrowLeft, Calendar, Clock, MapPin, Building2, User, Stethoscope, AlertTriangle, QrCode, Share2 } from "lucide-react";
import { AgendamentoData } from "@/types";
import { formatCurrencyBRL, formatDateBR } from "@/lib/formatters";

export default function ComprovantePage({
  params,
}: {
  params: Promise<{ protocolo: string }>;
}) {
  const resolvedParams = use(params);
  const protocolo = decodeURIComponent(resolvedParams.protocolo);

  const [agendamento, setAgendamento] = useState<AgendamentoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/agendamentos/${protocolo}`);
        if (res.ok) {
          const data = await res.json();
          setAgendamento(data);

          const qrPayload = JSON.stringify({
            protocolo: data.protocolo,
            paciente: data.trabalhadorNome,
            cpf: data.trabalhadorCpf,
            data: data.dataAgendada,
            hora: data.horaAgendada,
            unidade: data.unidadeNome,
          });

          const qrDataUrl = await QRCode.toDataURL(qrPayload, {
            width: 200,
            margin: 1,
            color: {
              dark: "#0f2c59",
              light: "#ffffff",
            },
          });
          setQrCodeUrl(qrDataUrl);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [protocolo]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Comprovante de Agendamento - ${agendamento?.protocolo}`,
        text: `Agendamento confirmado para ${agendamento?.trabalhadorNome} na ${agendamento?.unidadeNome} em ${formatDateBR(agendamento?.dataAgendada || "")} às ${agendamento?.horaAgendada}. Protocolo: ${agendamento?.protocolo}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0F2C59] border-t-transparent mb-4" />
        <p className="text-sm text-slate-600">Carregando comprovante...</p>
      </div>
    );
  }

  if (!agendamento) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50">
        <AlertTriangle className="h-12 w-12 text-amber-600 mb-3" />
        <h2 className="text-xl font-bold text-slate-900 mb-1">Agendamento Não Localizado</h2>
        <p className="text-xs text-slate-600 max-w-md mb-6">
          Não encontramos nenhum agendamento com o protocolo <strong className="text-slate-900">{protocolo}</strong>.
        </p>
        <Link
          href="/"
          className="rounded-lg bg-[#0F2C59] px-6 py-2.5 text-xs font-semibold text-white hover:bg-[#0c2448] transition"
        >
          Novo Agendamento
        </Link>
      </div>
    );
  }

  const complementares = agendamento.examesComplementares || [];
  const instrucoes = complementares.filter((e) => e.instrucao && e.instrucao.trim().length > 0);

  return (
    <div className="flex-1 py-10 px-4 sm:px-6 lg:px-8 pb-16 bg-slate-50">
      <div className="mx-auto max-w-3xl">
        {/* Top actions bar */}
        <div className="flex items-center justify-between gap-3 mb-6 no-print">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar ao início</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <Share2 className="h-3.5 w-3.5 text-[#0F2C59]" />
              <span>{copied ? "Link Copiado!" : "Compartilhar"}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F2C59] hover:bg-[#0c2448] px-4 py-2 text-xs font-bold text-white shadow-xs transition"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Imprimir / Salvar PDF</span>
            </button>
          </div>
        </div>

        {/* Printable Voucher Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm printable-card">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0F2C59] font-mono font-black text-white text-base">
                B&C
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Comprovante de Agendamento
                </h1>
                <p className="text-xs text-slate-500">B&C Saúde Ocupacional · CRM/MS 955</p>
              </div>
            </div>

            <div className="flex flex-col sm:items-end">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                Número de Protocolo
              </span>
              <span className="text-lg sm:text-xl font-mono font-black text-[#0F2C59]">
                {agendamento.protocolo}
              </span>
              <span className="inline-flex items-center gap-1 rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800 mt-1">
                <CheckCircle2 className="h-3 w-3" /> {agendamento.statusAgendamento || "CONFIRMADO"}
              </span>
            </div>
          </div>

          {/* QR Code & Summary Banner */}
          <div className="my-6 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center p-5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="sm:col-span-2 space-y-3">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-[#0F2C59] shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">{agendamento.unidadeNome}</span>
                  <span className="text-[11px] text-slate-600">{agendamento.unidadeEndereco}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-1">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-sky-800" />
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">Data</span>
                    <span className="text-xs font-bold text-slate-900">{formatDateBR(agendamento.dataAgendada)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-teal-800" />
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">Horário</span>
                    <span className="text-xs font-bold text-slate-900">{agendamento.horaAgendada}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code Box */}
            <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-white border border-slate-200 shadow-xs">
              {qrCodeUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrCodeUrl} alt="QR Code de Check-in" className="h-28 w-28" />
              ) : (
                <div className="h-28 w-28 flex items-center justify-center">
                  <QrCode className="h-8 w-8 text-slate-400" />
                </div>
              )}
              <span className="text-[9px] font-mono font-bold tracking-wider uppercase text-slate-600 mt-1">
                Check-in na Recepção
              </span>
            </div>
          </div>

          {/* Patient & Company Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-4 border-y border-slate-200 text-xs">
            {/* Trabalhador */}
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-[#0F2C59]" />
                Dados do Trabalhador
              </h3>
              <div className="space-y-1 text-slate-700">
                <p><span className="text-slate-500">Nome:</span> <strong className="text-slate-900">{agendamento.trabalhadorNome}</strong></p>
                <p><span className="text-slate-500">CPF:</span> {agendamento.trabalhadorCpf}</p>
                <p><span className="text-slate-500">Função/Cargo:</span> {agendamento.trabalhadorFuncao}</p>
                <p><span className="text-slate-500">Nascimento:</span> {formatDateBR(agendamento.trabalhadorNasc)}</p>
                <p><span className="text-slate-500">Exame Clínico:</span> <strong className="text-[#0F2C59]">{agendamento.tipoExame}</strong></p>
              </div>
            </div>

            {/* Empresa & Responsável */}
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-sky-800" />
                Empresa Contratante
              </h3>
              <div className="space-y-1 text-slate-700">
                <p><span className="text-slate-500">Razão Social:</span> <strong className="text-slate-900">{agendamento.empresaRazaoSocial}</strong></p>
                <p><span className="text-slate-500">CNPJ / CPF:</span> {agendamento.empresaDoc}</p>
                <p><span className="text-slate-500">E-mail para ASO:</span> {agendamento.empresaEmailAso}</p>
                <p><span className="text-slate-500">Responsável:</span> {agendamento.responsavelNome} ({agendamento.responsavelTelefone})</p>
              </div>
            </div>
          </div>

          {/* Exames Complementares */}
          {complementares.length > 0 && (
            <div className="py-4 border-b border-slate-200 text-xs">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                <Stethoscope className="h-3.5 w-3.5 text-teal-800" />
                Exames Complementares Agendados ({complementares.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {complementares.map((e, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded bg-slate-100 px-2.5 py-1 text-xs text-slate-800 font-medium"
                  >
                    <span>{e.nome}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Instruções de Preparo */}
          {instrucoes.length > 0 && (
            <div className="my-5 rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs">
              <div className="flex items-center gap-2 text-amber-900 font-bold mb-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-700" />
                <span>Instruções Importantes de Preparo para o Paciente:</span>
              </div>
              <ul className="space-y-1.5 pl-5 list-disc text-amber-800 font-normal">
                {instrucoes.map((ins, i) => (
                  <li key={i}>
                    <strong className="text-amber-950">{ins.nome}:</strong> {ins.instrucao}
                  </li>
                ))}
                <li>O trabalhador deve comparecer com <strong>documento oficial com foto</strong> (RG ou CNH).</li>
              </ul>
            </div>
          )}

          {/* Valores & Condições */}
          <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="text-slate-600 space-y-0.5">
              <p>Condição: <strong className="text-slate-900">{agendamento.formaPagamento === "PIX_DESCONTO" ? "PIX com Desconto Antecipado" : agendamento.formaPagamento === "FATURADO" ? "Faturamento Mensal PJ" : "Padrão Balcão"}</strong></p>
              <p>Status Financeiro: <span className="font-bold text-emerald-800">{agendamento.statusPagamento || "PENDENTE"}</span></p>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-slate-600 font-medium">Valor Total:</span>
              <span className="text-2xl font-black text-[#0F2C59]">
                {formatCurrencyBRL(agendamento.valorTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
