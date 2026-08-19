import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/bcsaude?schema=public";

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const defaultExames = [
  { codigo: "ACIDO_HIPURICO", nome: "ÁCIDO HIPÚRICO", preco: 37, categoria: "LABORATORIAL", instrucaoPreparo: "Coleta de urina no final da jornada de trabalho." },
  { codigo: "ACIDO_MANDELICO", nome: "ÁCIDO MANDÉLICO", preco: 40, categoria: "LABORATORIAL", instrucaoPreparo: "Coleta de urina no final da jornada de trabalho." },
  { codigo: "ACIDO_METIL_HIPURICO", nome: "ÁCIDO METIL-HIPÚRICO", preco: 37, categoria: "LABORATORIAL", instrucaoPreparo: "Coleta de urina no final da jornada de trabalho." },
  { codigo: "ACIDO_TRANS_MUCONICO", nome: "ÁCIDO TRANS-MUCÔNICO (URINA)", preco: 72, categoria: "LABORATORIAL", instrucaoPreparo: "Coleta de urina no final da jornada de trabalho." },
  { codigo: "ACIDO_TRICLORO_ACETICO", nome: "ÁCIDO TRICLORO ACÉTICO", preco: 55, categoria: "LABORATORIAL", instrucaoPreparo: "Coleta de urina no final da jornada de trabalho." },
  { codigo: "ACUIDADE_VISUAL", nome: "ACUIDADE VISUAL", preco: 35, categoria: "CLINICO", instrucaoPreparo: "Trazer óculos corretivos, caso utilize." },
  { codigo: "AUDIOMETRIA", nome: "AUDIOMETRIA", preco: 55, categoria: "GRAFICO", instrucaoPreparo: "Realizar repouso acústico de 8 horas antes do exame." },
  { codigo: "AVALIACAO_PERICIAL", nome: "AVALIAÇÃO PERICIAL E/OU ASSISTENCIAL", preco: 250, categoria: "CLINICO", instrucaoPreparo: "Trazer laudos e exames médicos anteriores se houver." },
  { codigo: "AVALIACAO_PSICOSSOCIAL", nome: "AVALIAÇÃO PSICOSSOCIAL (NR35/NR33)", preco: 75, categoria: "CLINICO", instrucaoPreparo: "Estar descansado e comparecer com documento com foto." },
  { codigo: "BHCG", nome: "BHCG", preco: 23, categoria: "LABORATORIAL", instrucaoPreparo: "Não necessita de jejum obrigatório." },
  { codigo: "BRUCELOSE", nome: "BRUCELOSE", preco: 22, categoria: "LABORATORIAL", instrucaoPreparo: "Jejum de 4 horas recomendado." },
  { codigo: "BRUCELOSE_IGG", nome: "BRUCELOSE IGG", preco: 80, categoria: "LABORATORIAL", instrucaoPreparo: "Jejum de 4 horas recomendado." },
  { codigo: "BRUCELOSE_IGM", nome: "BRUCELOSE IGM", preco: 80, categoria: "LABORATORIAL", instrucaoPreparo: "Jejum de 4 horas recomendado." },
  { codigo: "CADMIO_URINA", nome: "CADMIO (URINA)", preco: 50, categoria: "LABORATORIAL", instrucaoPreparo: "Coletar a primeira urina da manhã ou após retenção de 4 horas." },
  { codigo: "COLESTEROL_TOTAL", nome: "COLESTEROL TOTAL", preco: 18, categoria: "LABORATORIAL", instrucaoPreparo: "Jejum de 8 a 12 horas." },
  { codigo: "COLINESTERASE", nome: "COLINESTERASE", preco: 35, categoria: "LABORATORIAL", instrucaoPreparo: "Jejum de 4 horas." },
  { codigo: "COPROCULTURA", nome: "COPROCULTURA DE FEZES", preco: 53, categoria: "LABORATORIAL", instrucaoPreparo: "A amostra deve ser entregue no dia da avaliação médica em frasco estéril." },
  { codigo: "CREATININA", nome: "CREATININA", preco: 50, categoria: "LABORATORIAL", instrucaoPreparo: "Jejum de 4 horas." },
  { codigo: "CROMO_URINA", nome: "CROMO (URINA)", preco: 33, categoria: "LABORATORIAL", instrucaoPreparo: "Coletar urina no final da jornada de trabalho." },
  { codigo: "ECG", nome: "ELETROCARDIOGRAMA (ECG)", preco: 77, categoria: "GRAFICO", instrucaoPreparo: "Não fumar ou ingerir bebidas estimulantes (café, energético) 2 horas antes." },
  { codigo: "EEG", nome: "ELETROENCEFALOGRAMA (EEG)", preco: 138, categoria: "GRAFICO", instrucaoPreparo: "Os cabelos devem estar lavados e secos no dia do exame, sem gel, creme, laquê ou qualquer outro produto." },
  { codigo: "ESPIROMETRIA", nome: "ESPIROMETRIA", preco: 55, categoria: "GRAFICO", instrucaoPreparo: "O exame não pode ser realizado em caso de gripe, resfriado ou febre. Evitar refeições pesadas antes." },
  { codigo: "DALTONISMO", nome: "EXAME DE DALTONISMO", preco: 31, categoria: "CLINICO", instrucaoPreparo: "Trazer óculos ou lentes corretivas se utilizar." },
  { codigo: "FENOL_URINARIO", nome: "FENOL URINÁRIO", preco: 41, categoria: "LABORATORIAL", instrucaoPreparo: "Coleta de urina no término da jornada de trabalho." },
  { codigo: "FERRITINA", nome: "FERRITINA", preco: 33, categoria: "LABORATORIAL", instrucaoPreparo: "Jejum de 4 a 8 horas." },
  { codigo: "GAMA_GT", nome: "GAMA GT", preco: 24, categoria: "LABORATORIAL", instrucaoPreparo: "Jejum de 8 horas e não ingerir bebidas alcoólicas nas 48h anteriores." },
  { codigo: "GLICEMIA_CAPILAR", nome: "GLICEMIA CAPILAR", preco: 17, categoria: "LABORATORIAL", instrucaoPreparo: "Jejum de no mínimo 4 horas. Para exames à tarde, refeição leve até as 11h." },
  { codigo: "GLICOSE", nome: "GLICOSE", preco: 22, categoria: "LABORATORIAL", instrucaoPreparo: "Jejum de 8 a 12 horas." },
  { codigo: "TIPO_SANGUINEO", nome: "GRUPO SANGUÍNEO + FATOR RH (ABO + RH)", preco: 22, categoria: "LABORATORIAL", instrucaoPreparo: "Não necessita de jejum." },
  { codigo: "HEMOGRAMA", nome: "HEMOGRAMA COMPLETO", preco: 30, categoria: "LABORATORIAL", instrucaoPreparo: "Jejum de 4 a 8 horas recomendado." },
  { codigo: "HEPATITE_A", nome: "HEPATITE A (HAV IGG)", preco: 40, categoria: "LABORATORIAL", instrucaoPreparo: "Jejum de 4 horas." },
  { codigo: "HEPATITE_B_HBSAG", nome: "HEPATITE B (HBSAG)", preco: 44, categoria: "LABORATORIAL", instrucaoPreparo: "Jejum de 4 horas." },
  { codigo: "HEPATITE_B_ANTI_HBS", nome: "HEPATITE B (ANTI-HBS)", preco: 46, categoria: "LABORATORIAL", instrucaoPreparo: "Jejum de 4 horas." },
  { codigo: "HEPATITE_C", nome: "HEPATITE C (ANTI HCV)", preco: 66, categoria: "LABORATORIAL", instrucaoPreparo: "Jejum de 4 horas." },
  { codigo: "TSH", nome: "HORMÔNIO TIREOESTIMULANTE (TSH)", preco: 33, categoria: "LABORATORIAL", instrucaoPreparo: "Jejum de 4 horas." },
  { codigo: "MANGANES_URINA", nome: "MANGANÊS (URINA)", preco: 66, categoria: "LABORATORIAL", instrucaoPreparo: "Coletar urina com higiene prévia." },
  { codigo: "PPF", nome: "PARASITOLÓGICO DE FEZES (PPF)", preco: 22, categoria: "LABORATORIAL", instrucaoPreparo: "A amostra deve ser entregue no dia da avaliação médica. O coletor pode ser retirado 1 dia antes." },
  { codigo: "RX_1_INCIDENCIA", nome: "RAIO X (1 INCIDÊNCIA)", preco: 110, categoria: "GRAFICO", instrucaoPreparo: "Retirar adornos metálicos (brincos, correntes, piercings) da região examinada." },
  { codigo: "RX_COLUNA_CERVICAL", nome: "RAIO X DE COLUNA CERVICAL", preco: 110, categoria: "GRAFICO", instrucaoPreparo: "Retirar colares, brincos e objetos metálicos." },
  { codigo: "RX_COLUNA_DORSAL", nome: "RAIO X DE COLUNA DORSAL PA+P", preco: 154, categoria: "GRAFICO", instrucaoPreparo: "Vestir roupas confortáveis sem botões metálicos." },
  { codigo: "RX_COLUNA_LOMBO_SACRA", nome: "RAIO X DE COLUNA LOMBO SACRA PA", preco: 110, categoria: "GRAFICO", instrucaoPreparo: "Estar com bexiga vazia e sem adornos metálicos." },
  { codigo: "RX_COLUNA_LOMBO_SACRA_PAP", nome: "RAIO X DE COLUNA LOMBO/SACRA PA+P", preco: 154, categoria: "GRAFICO", instrucaoPreparo: "Vestir roupas sem zíperes ou botões de metal." },
  { codigo: "RX_PUNHO", nome: "RAIO X DE PUNHO", preco: 110, categoria: "GRAFICO", instrucaoPreparo: "Retirar anéis, relógios e pulseiras." },
  { codigo: "RX_TORAX_PA", nome: "RAIO X DE TÓRAX PA", preco: 110, categoria: "GRAFICO", instrucaoPreparo: "Retirar roupas da cintura para cima e colocar avental da clínica." },
  { codigo: "RX_TORAX_PAP", nome: "RAIO X DE TÓRAX PA+P", preco: 154, categoria: "GRAFICO", instrucaoPreparo: "Retirar correntes, sutiã com aro metálico e acessórios." },
  { codigo: "RETICULOCITOS", nome: "RETICULÓCITOS", preco: 26, categoria: "LABORATORIAL", instrucaoPreparo: "Jejum de 4 horas." },
  { codigo: "T3_LIVRE", nome: "T3 LIVRE", preco: 33, categoria: "LABORATORIAL", instrucaoPreparo: "Jejum de 4 horas." },
  { codigo: "T4_LIVRE", nome: "T4 LIVRE", preco: 33, categoria: "LABORATORIAL", instrucaoPreparo: "Jejum de 4 horas." },
  { codigo: "TESTE_ROMBERG", nome: "TESTE DE ROMBERG", preco: 44, categoria: "CLINICO", instrucaoPreparo: "Comparecer com calçado confortável e seguro." },
  { codigo: "TGO", nome: "TRANSAMINASE OXALACÉTICA (TGO)", preco: 20, categoria: "LABORATORIAL", instrucaoPreparo: "Jejum de 4 a 8 horas." },
  { codigo: "TGP", nome: "TRANSAMINASE PIRÚVICA (TGP)", preco: 20, categoria: "LABORATORIAL", instrucaoPreparo: "Jejum de 4 a 8 horas." },
  { codigo: "TRIGLICERIDEOS", nome: "TRIGLICERÍDEOS", preco: 13, categoria: "LABORATORIAL", instrucaoPreparo: "Jejum de 12 horas obrigatório." },
  { codigo: "UREIA", nome: "URÉIA", preco: 13, categoria: "LABORATORIAL", instrucaoPreparo: "Jejum de 4 horas." },
  { codigo: "URINA_TIPO_1", nome: "URINA TIPO I (EAS)", preco: 31, categoria: "LABORATORIAL", instrucaoPreparo: "Coletar a primeira urina da manhã (jato médio) após higiene íntima." },
  { codigo: "VDRL", nome: "VDRL (SOROLOGIA)", preco: 19, categoria: "LABORATORIAL", instrucaoPreparo: "Jejum de 4 horas." },
  { codigo: "TOXICOLOGICO", nome: "EXAME TOXICOLÓGICO (QUERATINA)", preco: 160, categoria: "LABORATORIAL", instrucaoPreparo: "Cabelos ou pelos com no mínimo 3cm de comprimento, sem tintura recente." }
];

const defaultUnidades = [
  {
    nome: "Unidade Jardim / MS (Matriz Regional)",
    endereco: "Rua Sete de Setembro, 772 - Centro",
    cidade: "Jardim",
    uf: "MS",
    telefone: "(67) 98113-1076",
    horariosDisponiveis: JSON.stringify([
      "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00",
      "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
    ]),
    ativo: true
  },
  {
    nome: "Unidade Bela Vista / MS",
    endereco: "Rua Visconde de Taunay, 555 - Centro",
    cidade: "Bela Vista",
    uf: "MS",
    telefone: "(67) 98113-1076",
    horariosDisponiveis: JSON.stringify([
      "08:00", "08:40", "09:20", "10:00", "10:40",
      "13:30", "14:10", "14:50", "15:30", "16:10"
    ]),
    ativo: true
  },
  {
    nome: "Unidade Bonito / MS",
    endereco: "Rua Pércio Schamann, 374 - Vila Donária",
    cidade: "Bonito",
    uf: "MS",
    telefone: "(67) 98113-1076",
    horariosDisponiveis: JSON.stringify([
      "07:30", "08:15", "09:00", "09:45", "10:30",
      "13:30", "14:15", "15:00", "15:45", "16:15"
    ]),
    ativo: true
  },
  {
    nome: "Unidade Campo Grande / MS",
    endereco: "Av. Afonso Pena, 3200 - Centro",
    cidade: "Campo Grande",
    uf: "MS",
    telefone: "(67) 98113-1076",
    horariosDisponiveis: JSON.stringify([
      "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00",
      "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
    ]),
    ativo: true
  }
];

const defaultConfigs = [
  { chave: "VALOR_BASE_PADRAO", valor: "90.00", descricao: "Valor base do exame clínico ASO (sem desconto)" },
  { chave: "VALOR_BASE_PIX", valor: "83.00", descricao: "Valor base do exame clínico ASO com desconto PIX antecipado" },
  { chave: "DESCONTO_PIX_REAIS", valor: "7.00", descricao: "Valor em reais de desconto para pagamento PIX em até 2h" },
  { chave: "HORAS_LIMITE_PIX", valor: "2", descricao: "Tempo limite em horas para garantia do desconto via PIX" },
  { chave: "AVISO_NO_SHOW", valor: "Cancelamentos devem ser informados com no mínimo 1 dia útil de antecedência. Em caso de não comparecimento sem aviso prévio (no-show), o valor pago não será ressarcido, permanecendo como crédito futuro.", descricao: "Regra e aviso de no-show" },
  { chave: "WHATSAPP_SUPORTE", valor: "(67) 98113-1076", descricao: "WhatsApp de suporte da clínica" }
];

async function main() {
  console.log("Iniciando Seed do Banco PostgreSQL...");

  // Configurações
  for (const cfg of defaultConfigs) {
    await prisma.configuracao.upsert({
      where: { chave: cfg.chave },
      update: { valor: cfg.valor, descricao: cfg.descricao },
      create: cfg
    });
  }
  console.log("✓ Configurações cadastradas");

  // Exames
  for (const ex of defaultExames) {
    await prisma.exame.upsert({
      where: { codigo: ex.codigo },
      update: {
        nome: ex.nome,
        preco: ex.preco,
        categoria: ex.categoria,
        instrucaoPreparo: ex.instrucaoPreparo,
        ativo: true
      },
      create: ex
    });
  }
  console.log(`✓ ${defaultExames.length} exames cadastrados`);

  // Unidades
  for (const un of defaultUnidades) {
    const existing = await prisma.unidade.findFirst({ where: { nome: un.nome } });
    if (!existing) {
      await prisma.unidade.create({ data: un });
    }
  }
  console.log(`✓ ${defaultUnidades.length} unidades cadastradas`);

  console.log("✓ Seed PostgreSQL finalizado com sucesso!");
}

main()
  .catch((e) => {
    console.error("Erro no Seed PostgreSQL:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
