import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const exames = await prisma.exame.findMany({
      orderBy: { nome: "asc" },
    });
    return NextResponse.json(exames);
  } catch (error) {
    console.error("Erro ao listar exames admin:", error);
    return NextResponse.json(
      { error: "Erro ao buscar catálogo de exames." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.nome || body.preco === undefined) {
      return NextResponse.json(
        { error: "Nome e preço são obrigatórios." },
        { status: 400 }
      );
    }

    const codigo =
      body.codigo ||
      body.nome
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]/g, "_")
        .toUpperCase();

    const novo = await prisma.exame.create({
      data: {
        codigo,
        nome: body.nome.toUpperCase(),
        preco: parseFloat(body.preco),
        categoria: body.categoria || "COMPLEMENTAR",
        instrucaoPreparo: body.instrucaoPreparo || "",
        ativo: body.ativo ?? true,
      },
    });

    return NextResponse.json(novo);
  } catch (error) {
    console.error("Erro ao criar exame:", error);
    return NextResponse.json(
      { error: "Erro ao criar exame. Verifique se o código já existe." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json(
        { error: "ID do exame é obrigatório." },
        { status: 400 }
      );
    }

    const dataToUpdate: Record<string, unknown> = {};
    if (body.nome !== undefined) dataToUpdate.nome = body.nome.toUpperCase();
    if (body.preco !== undefined) dataToUpdate.preco = parseFloat(body.preco);
    if (body.categoria !== undefined) dataToUpdate.categoria = body.categoria;
    if (body.instrucaoPreparo !== undefined) dataToUpdate.instrucaoPreparo = body.instrucaoPreparo;
    if (body.ativo !== undefined) dataToUpdate.ativo = body.ativo;

    const atualizado = await prisma.exame.update({
      where: { id: body.id },
      data: dataToUpdate,
    });

    return NextResponse.json(atualizado);
  } catch (error) {
    console.error("Erro ao atualizar exame:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar exame." },
      { status: 500 }
    );
  }
}
