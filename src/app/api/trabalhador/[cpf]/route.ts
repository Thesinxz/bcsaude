import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isValidCPF } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cpf: string }> }
) {
  try {
    const resolvedParams = await params;
    const rawCpf = decodeURIComponent(resolvedParams.cpf || "");
    const cleanCpf = rawCpf.replace(/\D/g, "");

    if (!cleanCpf || cleanCpf.length !== 11 || !isValidCPF(cleanCpf)) {
      return NextResponse.json(
        { sucesso: false, mensagem: "CPF inválido." },
        { status: 400 }
      );
    }

    // 1. Busca trabalhador na tabela de Trabalhadores
    let trabalhador = null;
    let agendamentosAnteriores: any[] = [];

    try {
      trabalhador = await prisma.trabalhador.findFirst({
        where: {
          OR: [
            { cpf: cleanCpf },
            { cpf: rawCpf },
          ],
        },
      });

      agendamentosAnteriores = await prisma.agendamento.findMany({
        where: {
          OR: [
            { trabalhadorCpf: cleanCpf },
            { trabalhadorCpf: rawCpf },
          ],
        },
        select: {
          id: true,
          protocolo: true,
          tipoExame: true,
          dataAgendada: true,
          empresaRazaoSocial: true,
          trabalhadorFuncao: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      });
    } catch (dbError) {
      console.warn("Aviso ao consultar trabalhador no banco:", dbError);
      return NextResponse.json({
        sucesso: false,
        cadastrado: false,
        mensagem: "Trabalhador novo ou banco de dados iniciando.",
      });
    }

    if (!trabalhador && agendamentosAnteriores.length === 0) {
      return NextResponse.json({
        sucesso: false,
        cadastrado: false,
        mensagem: "Trabalhador novo (não cadastrado anteriormente).",
      });
    }

    const ultimoAgendamento = agendamentosAnteriores[0];
    const funcaoFinal = trabalhador?.funcao || ultimoAgendamento?.trabalhadorFuncao || "";
    const nascFinal = trabalhador?.dataNascimento || "";

    return NextResponse.json({
      sucesso: true,
      cadastrado: true,
      cpf: cleanCpf,
      nome: trabalhador?.nome || "",
      dataNascimento: nascFinal,
      funcao: funcaoFinal,
      totalExamesAnteriores: agendamentosAnteriores.length,
      historicoRecente: agendamentosAnteriores,
    });
  } catch (error) {
    console.error("Erro na busca de trabalhador:", error);
    return NextResponse.json(
      { sucesso: false, cadastrado: false, mensagem: "Erro ao buscar trabalhador." },
      { status: 200 }
    );
  }
}
