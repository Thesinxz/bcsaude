import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query")?.trim();

    const where: Record<string, unknown> = {};
    if (query) {
      const clean = query.replace(/\D/g, "");
      where.OR = [
        { razaoSocial: { contains: query } },
        { nomeFantasia: { contains: query } },
        { cnpj: { contains: clean.length > 0 ? clean : query } },
      ];
    }

    const empresas = await prisma.empresa.findMany({
      where,
      orderBy: { razaoSocial: "asc" },
    });

    return NextResponse.json(empresas);
  } catch (error) {
    console.error("Erro ao listar empresas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar empresas." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cleanCnpj = (body.cnpj || "").replace(/\D/g, "");

    if (!cleanCnpj || !body.razaoSocial) {
      return NextResponse.json(
        { error: "CNPJ e Razão Social são obrigatórios." },
        { status: 400 }
      );
    }

    const empresa = await prisma.empresa.upsert({
      where: { cnpj: cleanCnpj },
      update: {
        razaoSocial: body.razaoSocial,
        nomeFantasia: body.nomeFantasia || "",
        emailAso: body.emailAso || "",
        telefone: body.telefone || "",
        logradouro: body.logradouro || "",
        numero: body.numero || "",
        bairro: body.bairro || "",
        municipio: body.municipio || "",
        uf: body.uf || "",
        cep: body.cep || "",
        situacaoCadastral: body.situacaoCadastral || "ATIVA",
        tipoConvenio: body.tipoConvenio || "AVULSO",
      },
      create: {
        cnpj: cleanCnpj,
        razaoSocial: body.razaoSocial,
        nomeFantasia: body.nomeFantasia || "",
        emailAso: body.emailAso || "",
        telefone: body.telefone || "",
        logradouro: body.logradouro || "",
        numero: body.numero || "",
        bairro: body.bairro || "",
        municipio: body.municipio || "",
        uf: body.uf || "",
        cep: body.cep || "",
        situacaoCadastral: body.situacaoCadastral || "ATIVA",
        tipoConvenio: body.tipoConvenio || "AVULSO",
      },
    });

    return NextResponse.json(empresa);
  } catch (error) {
    console.error("Erro ao salvar empresa:", error);
    return NextResponse.json(
      { error: "Erro ao salvar empresa." },
      { status: 500 }
    );
  }
}
