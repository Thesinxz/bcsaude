import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { AgendamentoData } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query")?.trim();
    const status = searchParams.get("status")?.trim();
    const unidadeId = searchParams.get("unidadeId")?.trim();
    const data = searchParams.get("data")?.trim();
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const where: Record<string, unknown> = {};

    if (status) {
      where.statusAgendamento = status;
    }

    if (unidadeId) {
      where.unidadeId = unidadeId;
    }

    if (data) {
      where.dataAgendada = data;
    }

    if (query) {
      const cleanDigits = query.replace(/\D/g, "");
      where.OR = [
        { protocolo: { contains: query, mode: "insensitive" } },
        { trabalhadorNome: { contains: query, mode: "insensitive" } },
        { empresaRazaoSocial: { contains: query, mode: "insensitive" } },
        { trabalhadorCpf: { contains: cleanDigits.length > 0 ? cleanDigits : query } },
        { trabalhadorCpf: { contains: query } },
        { empresaDoc: { contains: cleanDigits.length > 0 ? cleanDigits : query } },
        { empresaDoc: { contains: query } },
      ];
    }

    const [agendamentos, total] = await Promise.all([
      prisma.agendamento.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.agendamento.count({ where }),
    ]);

    const formatted = agendamentos.map((ag) => ({
      ...ag,
      examesComplementares: JSON.parse(ag.examesComplementares || "[]"),
    }));

    return NextResponse.json({
      agendamentos: formatted,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Erro ao listar agendamentos:", error);
    return NextResponse.json(
      { error: "Erro ao listar agendamentos." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: AgendamentoData = await request.json();

    // Validações mínimas de backend
    if (
      !body.unidadeNome ||
      !body.dataAgendada ||
      !body.horaAgendada ||
      !body.responsavelNome ||
      !body.responsavelEmail ||
      !body.responsavelTelefone ||
      !body.empresaDoc ||
      !body.empresaRazaoSocial ||
      !body.trabalhadorCpf ||
      !body.trabalhadorNome ||
      !body.trabalhadorFuncao ||
      !body.trabalhadorNasc ||
      !body.tipoExame
    ) {
      return NextResponse.json(
        { error: "Todos os campos obrigatórios devem ser preenchidos." },
        { status: 400 }
      );
    }

    // Busca configurações de preço vigentes com fallback
    const configs = await prisma.configuracao.findMany().catch(() => []);
    const configMap = configs.reduce((acc, curr) => {
      acc[curr.chave] = curr.valor;
      return acc;
    }, {} as Record<string, string>);

    const valorBasePadrao = parseFloat(configMap["VALOR_BASE_PADRAO"] || "90.00");
    const descontoPixReais = parseFloat(configMap["DESCONTO_PIX_REAIS"] || "7.00");

    // Calcula valores baseado no perfil do contratante
    const perfil = body.perfilContratante || "EMPRESAS (COM CNPJ) / OU EMPREGADORES (CPF/CAEPF / CEI)";
    const isServidor = perfil.includes("SERVIDOR") || perfil.includes("CONCURSO");
    const isKit = perfil.includes("KIT");

    const adicionais = body.examesComplementares || [];
    const valorAdicionais = isKit ? 0 : adicionais.reduce((acc, item) => acc + (item.preco || 0), 0);

    let valorBase = valorBasePadrao;
    let valorDesconto = 0;

    if (isKit) {
      valorBase = 0;
      valorDesconto = 0;
    } else if (isServidor) {
      valorBase = 70.0;
      valorDesconto = 0;
    } else {
      const isPix = body.formaPagamento === "PIX_DESCONTO" || !body.formaPagamento;
      valorDesconto = isPix ? descontoPixReais : 0;
    }

    const valorTotal = Math.max(0, valorBase + valorAdicionais - valorDesconto);

    // Gera protocolo único BC-ANO-NUM
    const ano = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const protocolo = `BC-${ano}-${randomNum}`;

    // Cria ou atualiza Trabalhador
    const cleanCpf = body.trabalhadorCpf.replace(/\D/g, "");
    try {
      await prisma.trabalhador.upsert({
        where: { cpf: cleanCpf },
        update: {
          nome: body.trabalhadorNome,
          dataNascimento: body.trabalhadorNasc,
          funcao: body.trabalhadorFuncao,
          empresaCnpj: body.empresaDoc.replace(/\D/g, ""),
        },
        create: {
          cpf: cleanCpf,
          nome: body.trabalhadorNome,
          dataNascimento: body.trabalhadorNasc,
          funcao: body.trabalhadorFuncao,
          empresaCnpj: body.empresaDoc.replace(/\D/g, ""),
        },
      });
    } catch {
      // continua se erro de worker
    }

    // Salva Agendamento
    const novoAgendamento = await prisma.agendamento.create({
      data: {
        protocolo,
        perfilContratante: body.perfilContratante || "EMPRESAS (COM CNPJ) / OU EMPREGADORES (CPF/CAEPF / CEI)",
        unidadeId: body.unidadeId || "unidade-principal",
        unidadeNome: body.unidadeNome,
        unidadeEndereco: body.unidadeEndereco || "",
        dataAgendada: body.dataAgendada,
        horaAgendada: body.horaAgendada,
        responsavelNome: body.responsavelNome,
        responsavelEmail: body.responsavelEmail,
        responsavelTelefone: body.responsavelTelefone,
        empresaDoc: body.empresaDoc,
        empresaRazaoSocial: body.empresaRazaoSocial,
        empresaEmailAso: body.empresaEmailAso,
        empresaEndereco: body.empresaEndereco || "",
        trabalhadorCpf: body.trabalhadorCpf,
        trabalhadorNome: body.trabalhadorNome,
        trabalhadorFuncao: body.trabalhadorFuncao,
        trabalhadorNasc: body.trabalhadorNasc,
        tipoExame: body.tipoExame,
        examesComplementares: JSON.stringify(adicionais),
        formaPagamento: body.formaPagamento || "PIX_DESCONTO",
        valorBase,
        valorAdicionais,
        valorDesconto,
        valorTotal,
        statusPagamento: isKit ? "FATURADO" : (body.formaPagamento === "FATURADO" ? "FATURADO" : "PENDENTE"),
        statusAgendamento: "AGENDADO",
        observacoes: body.observacoes || "",
        lgpdAceite: body.lgpdAceite ?? true,
      },
    });

    return NextResponse.json({
      ...novoAgendamento,
      examesComplementares: adicionais,
      sucesso: true,
      mensagem: "Agendamento criado com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar agendamento." },
      { status: 500 }
    );
  }
}
