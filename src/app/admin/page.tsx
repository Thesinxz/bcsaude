"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  DollarSign,
  Users,
  Building2,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { AgendamentoData } from "@/types";
import { formatCurrencyBRL, formatDateBR, formatCpfCnpj } from "@/lib/formatters";

interface StatsData {
  totalAgendamentos: number;
  agendamentosHoje: number;
  confirmados: number;
  concluidos: number;
  cancelados: number;
  noShow: number;
  totalEmpresas: number;
  totalTrabalhadores: number;
  faturamentoTotal: number;
  faturamentoPix: number;
  faturamentoPendente: number;
  tipoExameCount: Record<string, number>;
  totalExamesCadastrados: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [recentes, setRecentes] = useState<AgendamentoData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [statsRes, agendRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/agendamentos?limit=6"),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (agendRes.ok) {
        const agendData = await agendRes.json();
        setRecentes(agendData.agendamentos || []);
      }
    } catch (e) {
      console.error("Erro ao carregar dados do dashboard:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Dashboard Administrativo
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            Visão geral de atendimentos, faturamento e fluxo de exames ocupacionais
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          className="inline-flex items-center gap-2 rounded-lg bg-white border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-[#0F2C59]" : ""}`} />
          <span>Atualizar Indicadores</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Agendamentos */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Agendamentos</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-[#0F2C59]">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {stats?.totalAgendamentos || 0}
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">
            {stats?.agendamentosHoje || 0} para hoje
          </p>
        </div>

        {/* Faturamento Total */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Faturamento Total</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#0F2C59]">
            {formatCurrencyBRL(stats?.faturamentoTotal || 0)}
          </div>
          <p className="text-[11px] text-slate-500 font-normal mt-1">
            {formatCurrencyBRL(stats?.faturamentoPix || 0)} via PIX Antecipado
          </p>
        </div>

        {/* Empresas Cadastradas */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Empresas (CNPJ)</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-800">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {stats?.totalEmpresas || 0}
          </div>
          <p className="text-[11px] text-slate-500 font-normal mt-1">
            Base ativa de clientes PJ
          </p>
        </div>

        {/* Trabalhadores Cadastrados */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Trabalhadores</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {stats?.totalTrabalhadores || 0}
          </div>
          <p className="text-[11px] text-slate-500 font-normal mt-1">
            Pacientes atendidos no sistema
          </p>
        </div>
      </div>

      {/* Distribution Status & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Status dos Agendamentos
          </h2>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
              <span className="flex items-center gap-2 text-emerald-900 font-semibold">
                <CheckCircle className="h-4 w-4 text-emerald-700" /> Confirmados / Concluídos
              </span>
              <strong className="text-emerald-950 font-bold">
                {(stats?.confirmados || 0) + (stats?.concluidos || 0)}
              </strong>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-sky-50 border border-sky-200">
              <span className="flex items-center gap-2 text-sky-900 font-semibold">
                <Clock className="h-4 w-4 text-sky-700" /> Aguardando / Agendado
              </span>
              <strong className="text-sky-950 font-bold">
                {(stats?.totalAgendamentos || 0) - ((stats?.confirmados || 0) + (stats?.concluidos || 0) + (stats?.cancelados || 0) + (stats?.noShow || 0))}
              </strong>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50 border border-amber-200">
              <span className="flex items-center gap-2 text-amber-900 font-semibold">
                <AlertTriangle className="h-4 w-4 text-amber-700" /> No-Show (Não Compareceu)
              </span>
              <strong className="text-amber-950 font-bold">{stats?.noShow || 0}</strong>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-rose-50 border border-rose-200">
              <span className="flex items-center gap-2 text-rose-900 font-semibold">
                <AlertTriangle className="h-4 w-4 text-rose-700" /> Cancelados
              </span>
              <strong className="text-rose-950 font-bold">{stats?.cancelados || 0}</strong>
            </div>
          </div>
        </div>

        {/* Tipos de Exame mais solicitados */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Tipos de Exame Mais Solicitados (ASO)
            </h2>
            <Link
              href="/admin/exames"
              className="text-xs text-[#0F2C59] hover:underline flex items-center gap-1 font-bold"
            >
              Configurar Preços <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            {Object.entries(stats?.tipoExameCount || {}).map(([tipo, count]) => (
              <div
                key={tipo}
                className="rounded-lg border border-slate-200 bg-slate-50 p-3 flex flex-col justify-between"
              >
                <span className="text-[11px] font-semibold text-slate-600 truncate">{tipo}</span>
                <span className="text-xl font-bold text-slate-900 mt-1">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Appointments Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Últimos Agendamentos Recebidos
            </h2>
            <p className="text-xs text-slate-500 font-normal">
              Acompanhe as solicitações mais recentes em tempo real
            </p>
          </div>

          <Link
            href="/admin/agendamentos"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F2C59] hover:underline transition"
          >
            <span>Ver Todos</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Protocolo</th>
                <th className="py-2.5 px-3">Trabalhador</th>
                <th className="py-2.5 px-3">Empresa</th>
                <th className="py-2.5 px-3">Data/Hora</th>
                <th className="py-2.5 px-3">Exame</th>
                <th className="py-2.5 px-3">Total</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recentes.map((ag) => (
                <tr key={ag.protocolo} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3 font-mono font-bold text-[#0F2C59]">
                    {ag.protocolo}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-900 block">{ag.trabalhadorNome}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{formatCpfCnpj(ag.trabalhadorCpf)}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="truncate block max-w-xs">{ag.empresaRazaoSocial}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{formatCpfCnpj(ag.empresaDoc)}</span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    {formatDateBR(ag.dataAgendada)} às {ag.horaAgendada}
                  </td>
                  <td className="py-3 px-3">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-700">
                      {ag.tipoExame}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900">
                    {formatCurrencyBRL(ag.valorTotal)}
                  </td>
                  <td className="py-3 px-3">
                    <span className="rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      {ag.statusAgendamento}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      href={`/comprovante/${ag.protocolo}`}
                      className="text-[#0F2C59] hover:underline font-semibold"
                      target="_blank"
                    >
                      Ver Voucher
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
