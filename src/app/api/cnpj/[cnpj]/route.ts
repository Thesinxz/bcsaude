import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isValidCNPJ, isValidCPF } from "@/lib/validators";
import { CnpjResponse } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cnpj: string }> }
) {
  try {
    const resolvedParams = await params;
    const rawCnpj = decodeURIComponent(resolvedParams.cnpj || "");
    const cleanDoc = rawCnpj.replace(/\D/g, "");

    if (!cleanDoc) {
      return NextResponse.json(
        {
          cnpj: "",
          razao_social: "",
          sucesso: false,
          mensagem: "Documento não informado.",
        } as CnpjResponse,
        { status: 400 }
      );
    }

    // 1. Busca primeiro na base de dados local do sistema (por CNPJ limpo ou formatado)
    try {
      const localEmpresa = await prisma.empresa.findFirst({
        where: {
          OR: [
            { cnpj: cleanDoc },
            { cnpj: rawCnpj },
            { cnpj: { contains: cleanDoc } },
          ],
        },
      });

      if (localEmpresa && localEmpresa.razaoSocial) {
        return NextResponse.json({
          cnpj: cleanDoc,
          razao_social: localEmpresa.razaoSocial,
          nome_fantasia: localEmpresa.nomeFantasia || "",
          situacao_cadastral: localEmpresa.situacaoCadastral || "ATIVA (Cadastro Local)",
          logradouro: localEmpresa.logradouro || "",
          numero: localEmpresa.numero || "",
          bairro: localEmpresa.bairro || "",
          municipio: localEmpresa.municipio || "",
          uf: localEmpresa.uf || "",
          cep: localEmpresa.cep || "",
          telefone: localEmpresa.telefone || "",
          email: localEmpresa.emailAso || "",
          sucesso: true,
        } as CnpjResponse);
      }
    } catch (e) {
      console.warn("Aviso ao buscar empresa no banco local:", e);
    }

    // Se for CPF (11 dígitos de empregador físico/rural)
    if (cleanDoc.length === 11) {
      if (isValidCPF(cleanDoc)) {
        return NextResponse.json({
          cnpj: cleanDoc,
          razao_social: "EMPREGADOR PESSOA FÍSICA / PRODUTOR RURAL (CPF/CAEPF)",
          nome_fantasia: "",
          situacao_cadastral: "REGULAR",
          logradouro: "",
          numero: "",
          bairro: "",
          municipio: "",
          uf: "",
          cep: "",
          telefone: "",
          email: "",
          sucesso: true,
        } as CnpjResponse);
      }
    }

    // Valida se tem 14 dígitos para consulta na Receita Federal
    if (cleanDoc.length !== 14) {
      return NextResponse.json(
        {
          cnpj: cleanDoc,
          razao_social: "",
          sucesso: false,
          mensagem: "CNPJ deve conter 14 dígitos.",
        } as CnpjResponse,
        { status: 400 }
      );
    }

    let empresaData: Partial<CnpjResponse> | null = null;

    // 2. Consulta Provedor 1: MinhaReceita (Espelho Direto da Receita Federal em Nuvem)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`https://minhareceita.org/${cleanDoc}`, {
        signal: controller.signal,
        headers: {
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.razao_social) {
          empresaData = {
            cnpj: cleanDoc,
            razao_social: data.razao_social,
            nome_fantasia: data.nome_fantasia || "",
            situacao_cadastral: data.descricao_situacao_cadastral || "ATIVA",
            logradouro: data.logradouro || "",
            numero: data.numero || "",
            bairro: data.bairro || "",
            municipio: data.municipio || "",
            uf: data.uf || "",
            cep: data.cep || "",
            telefone: data.ddd_telefone_1 || data.telefone || "",
            email: data.email || "",
            sucesso: true,
          };
        }
      }
    } catch (err) {
      console.warn("MinhaReceita falhou, tentando fallback BrasilAPI:", err);
    }

    // 3. Consulta Provedor 2: BrasilAPI
    if (!empresaData) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanDoc}`, {
          signal: controller.signal,
          headers: {
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data.razao_social || data.nome) {
            empresaData = {
              cnpj: cleanDoc,
              razao_social: data.razao_social || data.nome || "",
              nome_fantasia: data.nome_fantasia || data.fantasia || "",
              situacao_cadastral: data.descricao_situacao_cadastral || "ATIVA",
              logradouro: data.logradouro || "",
              numero: data.numero || "",
              bairro: data.bairro || "",
              municipio: data.municipio || "",
              uf: data.uf || "",
              cep: data.cep || "",
              telefone: data.ddd_telefone_1 || "",
              email: data.email || "",
              sucesso: true,
            };
          }
        }
      } catch (err) {
        console.warn("BrasilAPI falhou, tentando fallback ReceitaWS:", err);
      }
    }

    // 4. Consulta Provedor 3: ReceitaWS
    if (!empresaData) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(`https://receitaws.com.br/v1/cnpj/${cleanDoc}`, {
          signal: controller.signal,
          headers: {
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data.status !== "ERROR" && data.nome) {
            empresaData = {
              cnpj: cleanDoc,
              razao_social: data.nome || "",
              nome_fantasia: data.fantasia || "",
              situacao_cadastral: data.situacao || "ATIVA",
              logradouro: data.logradouro || "",
              numero: data.numero || "",
              bairro: data.bairro || "",
              municipio: data.municipio || "",
              uf: data.uf || "",
              cep: data.cep?.replace(/\D/g, "") || "",
              telefone: data.telefone || "",
              email: data.email || "",
              sucesso: true,
            };
          }
        }
      } catch (err) {
        console.warn("ReceitaWS falhou:", err);
      }
    }

    if (!empresaData) {
      return NextResponse.json(
        {
          cnpj: cleanDoc,
          razao_social: "",
          sucesso: false,
          mensagem: "CNPJ não localizado na Receita Federal. Digite a Razão Social manualmente.",
        } as CnpjResponse,
        { status: 404 }
      );
    }

    // Salva ou atualiza no banco local para consultas subsequentes instantâneas
    try {
      await prisma.empresa.upsert({
        where: { cnpj: cleanDoc },
        update: {
          razaoSocial: empresaData.razao_social || "",
          nomeFantasia: empresaData.nome_fantasia || "",
          logradouro: empresaData.logradouro || "",
          numero: empresaData.numero || "",
          bairro: empresaData.bairro || "",
          municipio: empresaData.municipio || "",
          uf: empresaData.uf || "",
          cep: empresaData.cep || "",
          situacaoCadastral: empresaData.situacao_cadastral || "ATIVA",
        },
        create: {
          cnpj: cleanDoc,
          razaoSocial: empresaData.razao_social || "",
          nomeFantasia: empresaData.nome_fantasia || "",
          logradouro: empresaData.logradouro || "",
          numero: empresaData.numero || "",
          bairro: empresaData.bairro || "",
          municipio: empresaData.municipio || "",
          uf: empresaData.uf || "",
          cep: empresaData.cep || "",
          situacaoCadastral: empresaData.situacao_cadastral || "ATIVA",
          tipoConvenio: "AVULSO",
        },
      });
    } catch {
      // continua mesmo se der erro no cache
    }

    return NextResponse.json(empresaData);
  } catch (error) {
    console.error("Erro na rota de CNPJ:", error);
    return NextResponse.json(
      {
        cnpj: "",
        razao_social: "",
        sucesso: false,
        mensagem: "Erro ao consultar CNPJ.",
      } as CnpjResponse,
      { status: 500 }
    );
  }
}
