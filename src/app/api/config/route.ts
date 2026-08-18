import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [configs, exames, unidades] = await Promise.all([
      prisma.configuracao.findMany(),
      prisma.exame.findMany({
        where: { ativo: true },
        orderBy: { nome: "asc" },
      }),
      prisma.unidade.findMany({
        where: { ativo: true },
        orderBy: { nome: "asc" },
      }),
    ]);

    const configMap = configs.reduce((acc, curr) => {
      acc[curr.chave] = curr.valor;
      return acc;
    }, {} as Record<string, string>);

    const formattedUnidades = unidades.map((u) => ({
      ...u,
      horariosDisponiveis: JSON.parse(u.horariosDisponiveis || "[]"),
    }));

    return NextResponse.json({
      config: {
        valorBasePadrao: parseFloat(configMap["VALOR_BASE_PADRAO"] || "90.00"),
        valorBasePix: parseFloat(configMap["VALOR_BASE_PIX"] || "83.00"),
        descontoPixReais: parseFloat(configMap["DESCONTO_PIX_REAIS"] || "7.00"),
        horasLimitePix: parseInt(configMap["HORAS_LIMITE_PIX"] || "2", 10),
        avisoNoShow: configMap["AVISO_NO_SHOW"] || "",
        whatsappSuporte: configMap["WHATSAPP_SUPORTE"] || "(67) 98113-1076",
      },
      exames,
      unidades: formattedUnidades,
    });
  } catch (error) {
    console.error("Erro ao buscar configurações:", error);
    return NextResponse.json(
      { error: "Erro ao carregar configurações." },
      { status: 500 }
    );
  }
}
