import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ protocolo: string }> }
) {
  try {
    const { protocolo } = await params;
    const cleanProtocolo = decodeURIComponent(protocolo).trim();

    const agendamento = await prisma.agendamento.findFirst({
      where: {
        OR: [
          { protocolo: cleanProtocolo },
          { id: cleanProtocolo },
        ],
      },
    });

    if (!agendamento) {
      return NextResponse.json(
        { error: "Agendamento não encontrado para o protocolo informado." },
        { status: 404 }
      );
    }

    const complementares = JSON.parse(agendamento.examesComplementares || "[]");

    return NextResponse.json({
      ...agendamento,
      examesComplementares: complementares,
    });
  } catch (error) {
    console.error("Erro ao buscar agendamento:", error);
    return NextResponse.json(
      { error: "Erro ao buscar detalhes do agendamento." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ protocolo: string }> }
) {
  try {
    const { protocolo } = await params;
    const cleanProtocolo = decodeURIComponent(protocolo).trim();
    const body = await request.json();

    const agendamento = await prisma.agendamento.findFirst({
      where: {
        OR: [
          { protocolo: cleanProtocolo },
          { id: cleanProtocolo },
        ],
      },
    });

    if (!agendamento) {
      return NextResponse.json(
        { error: "Agendamento não encontrado." },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (body.statusAgendamento) {
      updateData.statusAgendamento = body.statusAgendamento;
    }
    if (body.statusPagamento) {
      updateData.statusPagamento = body.statusPagamento;
    }
    if (body.observacoes !== undefined) {
      updateData.observacoes = body.observacoes;
    }
    if (body.dataAgendada) {
      updateData.dataAgendada = body.dataAgendada;
    }
    if (body.horaAgendada) {
      updateData.horaAgendada = body.horaAgendada;
    }

    const atualizado = await prisma.agendamento.update({
      where: { id: agendamento.id },
      data: updateData,
    });

    return NextResponse.json({
      ...atualizado,
      examesComplementares: JSON.parse(atualizado.examesComplementares || "[]"),
      sucesso: true,
      mensagem: "Agendamento atualizado com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao atualizar agendamento:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar agendamento." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ protocolo: string }> }
) {
  try {
    const { protocolo } = await params;
    const cleanProtocolo = decodeURIComponent(protocolo).trim();

    const agendamento = await prisma.agendamento.findFirst({
      where: {
        OR: [
          { protocolo: cleanProtocolo },
          { id: cleanProtocolo },
        ],
      },
    });

    if (!agendamento) {
      return NextResponse.json(
        { error: "Agendamento não encontrado." },
        { status: 404 }
      );
    }

    const cancelado = await prisma.agendamento.update({
      where: { id: agendamento.id },
      data: { statusAgendamento: "CANCELADO" },
    });

    return NextResponse.json({
      sucesso: true,
      mensagem: "Agendamento cancelado com sucesso.",
      agendamento: cancelado,
    });
  } catch (error) {
    console.error("Erro ao cancelar agendamento:", error);
    return NextResponse.json(
      { error: "Erro ao cancelar agendamento." },
      { status: 500 }
    );
  }
}
