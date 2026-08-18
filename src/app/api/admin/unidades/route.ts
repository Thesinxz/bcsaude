import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const unidades = await prisma.unidade.findMany({
      orderBy: { nome: "asc" },
    });
    const formatted = unidades.map((u) => ({
      ...u,
      horariosDisponiveis: JSON.parse(u.horariosDisponiveis || "[]"),
    }));
    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Erro ao buscar unidades:", error);
    return NextResponse.json(
      { error: "Erro ao buscar unidades." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.nome || !body.endereco) {
      return NextResponse.json(
        { error: "Nome e endereço são obrigatórios." },
        { status: 400 }
      );
    }

    const horarios = Array.isArray(body.horariosDisponiveis)
      ? JSON.stringify(body.horariosDisponiveis)
      : body.horariosDisponiveis || "[]";

    const unidade = await prisma.unidade.create({
      data: {
        nome: body.nome,
        endereco: body.endereco,
        cidade: body.cidade || "Campo Grande",
        uf: body.uf || "MS",
        telefone: body.telefone || "",
        horariosDisponiveis: horarios,
        ativo: body.ativo ?? true,
      },
    });

    return NextResponse.json({
      ...unidade,
      horariosDisponiveis: JSON.parse(unidade.horariosDisponiveis),
    });
  } catch (error) {
    console.error("Erro ao criar unidade:", error);
    return NextResponse.json(
      { error: "Erro ao criar unidade." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json(
        { error: "ID da unidade é obrigatório." },
        { status: 400 }
      );
    }

    const dataToUpdate: Record<string, unknown> = {};
    if (body.nome !== undefined) dataToUpdate.nome = body.nome;
    if (body.endereco !== undefined) dataToUpdate.endereco = body.endereco;
    if (body.cidade !== undefined) dataToUpdate.cidade = body.cidade;
    if (body.uf !== undefined) dataToUpdate.uf = body.uf;
    if (body.telefone !== undefined) dataToUpdate.telefone = body.telefone;
    if (body.ativo !== undefined) dataToUpdate.ativo = body.ativo;
    if (body.horariosDisponiveis !== undefined) {
      dataToUpdate.horariosDisponiveis = Array.isArray(body.horariosDisponiveis)
        ? JSON.stringify(body.horariosDisponiveis)
        : body.horariosDisponiveis;
    }

    const atualizado = await prisma.unidade.update({
      where: { id: body.id },
      data: dataToUpdate,
    });

    return NextResponse.json({
      ...atualizado,
      horariosDisponiveis: JSON.parse(atualizado.horariosDisponiveis),
    });
  } catch (error) {
    console.error("Erro ao atualizar unidade:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar unidade." },
      { status: 500 }
    );
  }
}
