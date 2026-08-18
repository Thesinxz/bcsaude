import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query")?.trim();

    const where: Record<string, unknown> = {};
    if (query) {
      const cleanCpf = query.replace(/\D/g, "");
      where.OR = [
        { nome: { contains: query } },
        { funcao: { contains: query } },
        { cpf: { contains: cleanCpf.length > 0 ? cleanCpf : query } },
      ];
    }

    const trabalhadores = await prisma.trabalhador.findMany({
      where,
      orderBy: { nome: "asc" },
      take: 100,
    });

    return NextResponse.json(trabalhadores);
  } catch (error) {
    console.error("Erro ao listar trabalhadores:", error);
    return NextResponse.json(
      { error: "Erro ao buscar trabalhadores." },
      { status: 500 }
    );
  }
}
