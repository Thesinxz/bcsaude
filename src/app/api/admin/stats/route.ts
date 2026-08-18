import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalAgendamentos,
      agendamentosHoje,
      confirmados,
      concluidos,
      cancelados,
      noShow,
      totalEmpresas,
      totalTrabalhadores,
      todosAgendamentos,
      exames,
    ] = await Promise.all([
      prisma.agendamento.count(),
      prisma.agendamento.count({
        where: {
          dataAgendada: new Date().toISOString().split("T")[0],
        },
      }),
      prisma.agendamento.count({ where: { statusAgendamento: "CONFIRMADO" } }),
      prisma.agendamento.count({ where: { statusAgendamento: "CONCLUIDO" } }),
      prisma.agendamento.count({ where: { statusAgendamento: "CANCELADO" } }),
      prisma.agendamento.count({ where: { statusAgendamento: "NO_SHOW" } }),
      prisma.empresa.count(),
      prisma.trabalhador.count(),
      prisma.agendamento.findMany({
        select: {
          valorTotal: true,
          statusPagamento: true,
          statusAgendamento: true,
          formaPagamento: true,
          tipoExame: true,
          examesComplementares: true,
          createdAt: true,
        },
      }),
      prisma.exame.findMany({ where: { ativo: true } }),
    ]);

    // Faturamento
    let faturamentoTotal = 0;
    let faturamentoPix = 0;
    let faturamentoPendente = 0;

    const tipoExameCount: Record<string, number> = {};

    todosAgendamentos.forEach((ag) => {
      if (ag.statusAgendamento !== "CANCELADO") {
        faturamentoTotal += ag.valorTotal;
        if (ag.statusPagamento === "PAGO") {
          if (ag.formaPagamento === "PIX_DESCONTO") {
            faturamentoPix += ag.valorTotal;
          }
        } else if (ag.statusPagamento === "PENDENTE") {
          faturamentoPendente += ag.valorTotal;
        }
      }

      tipoExameCount[ag.tipoExame] = (tipoExameCount[ag.tipoExame] || 0) + 1;
    });

    return NextResponse.json({
      totalAgendamentos,
      agendamentosHoje,
      confirmados,
      concluidos,
      cancelados,
      noShow,
      totalEmpresas,
      totalTrabalhadores,
      faturamentoTotal,
      faturamentoPix,
      faturamentoPendente,
      tipoExameCount,
      totalExamesCadastrados: exames.length,
    });
  } catch (error) {
    console.error("Erro nas estatísticas admin:", error);
    return NextResponse.json(
      { error: "Erro ao carregar métricas administrativas." },
      { status: 500 }
    );
  }
}
