import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { INITIAL_UNIDADES, INITIAL_EXAMES } from "@/lib/initialData";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [configs, exames, unidades] = await Promise.all([
      prisma.configuracao.findMany().catch(() => []),
      prisma.exame.findMany({
        where: { ativo: true },
        orderBy: { nome: "asc" },
      }).catch(() => []),
      prisma.unidade.findMany({
        where: { ativo: true },
        orderBy: { nome: "asc" },
      }).catch(() => []),
    ]);

    const configMap = configs.reduce((acc, curr) => {
      acc[curr.chave] = curr.valor;
      return acc;
    }, {} as Record<string, string>);

    const formattedUnidades = (unidades.length > 0 ? unidades : INITIAL_UNIDADES).map((u) => ({
      ...u,
      horariosDisponiveis: typeof u.horariosDisponiveis === "string" 
        ? JSON.parse(u.horariosDisponiveis || "[]") 
        : (u.horariosDisponiveis || []),
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
      exames: exames.length > 0 ? exames : INITIAL_EXAMES,
      unidades: formattedUnidades,
    });
  } catch (error) {
    console.warn("Aviso ao buscar configurações no banco (usando fallback inicial):", error);
    return NextResponse.json({
      config: {
        valorBasePadrao: 90.0,
        valorBasePix: 83.0,
        descontoPixReais: 7.0,
        horasLimitePix: 2,
        avisoNoShow: "",
        whatsappSuporte: "(67) 98113-1076",
      },
      exames: INITIAL_EXAMES,
      unidades: INITIAL_UNIDADES,
    });
  }
}
