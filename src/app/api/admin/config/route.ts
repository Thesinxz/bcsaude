import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const configs = await prisma.configuracao.findMany({
      orderBy: { chave: "asc" },
    });
    return NextResponse.json(configs);
  } catch (error) {
    console.error("Erro ao listar configs:", error);
    return NextResponse.json(
      { error: "Erro ao buscar configurações." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chave, valor, descricao } = body;

    if (!chave || valor === undefined) {
      return NextResponse.json(
        { error: "Chave e valor são obrigatórios." },
        { status: 400 }
      );
    }

    const config = await prisma.configuracao.upsert({
      where: { chave },
      update: { valor: String(valor), descricao },
      create: { chave, valor: String(valor), descricao },
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error("Erro ao salvar config:", error);
    return NextResponse.json(
      { error: "Erro ao salvar configuração." },
      { status: 500 }
    );
  }
}
