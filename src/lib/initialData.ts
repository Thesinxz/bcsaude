import { ExameItem, UnidadeItem } from "@/types";

export const INITIAL_UNIDADES: UnidadeItem[] = [
  {
    id: "jardim",
    nome: "Unidade Jardim / MS (Matriz Regional)",
    endereco: "Rua Sete de Setembro, 772 - Centro, Jardim - MS",
    cidade: "Jardim",
    uf: "MS",
    telefone: "(67) 98113-1076",
    diasSemanaDisponiveis: [1, 2, 3, 4, 5], // Seg a Sex
    diasAtendimentoDesc: "Segunda a Sexta-feira",
    horariosDisponiveis: [
      "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00",
      "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
    ],
    ativo: true,
  },
  {
    id: "bela-vista",
    nome: "Unidade Bela Vista / MS",
    endereco: "Rua Visconde de Taunay, 555 - Centro, Bela Vista - MS",
    cidade: "Bela Vista",
    uf: "MS",
    telefone: "(67) 98113-1076",
    diasSemanaDisponiveis: [1, 3, 5], // Seg, Qua, Sex
    diasAtendimentoDesc: "Segundas, Quartas e Sextas-feiras",
    horariosDisponiveis: [
      "08:00", "08:40", "09:20", "10:00", "10:40",
      "13:30", "14:10", "14:50", "15:30", "16:10"
    ],
    ativo: true,
  },
  {
    id: "bonito",
    nome: "Unidade Bonito / MS",
    endereco: "Rua Pércio Schamann, 374 - Vila Donária, Bonito - MS",
    cidade: "Bonito",
    uf: "MS",
    telefone: "(67) 98113-1076",
    diasSemanaDisponiveis: [2, 4, 5], // Ter, Qui, Sex
    diasAtendimentoDesc: "Terças, Quintas e Sextas-feiras",
    horariosDisponiveis: [
      "07:30", "08:15", "09:00", "09:45", "10:30",
      "13:30", "14:15", "15:00", "15:45", "16:15"
    ],
    ativo: true,
  },
  {
    id: "campo-grande",
    nome: "Unidade Campo Grande / MS",
    endereco: "Av. Afonso Pena, 3200 - Centro, Campo Grande - MS",
    cidade: "Campo Grande",
    uf: "MS",
    telefone: "(67) 98113-1076",
    diasSemanaDisponiveis: [1, 2, 3, 4, 5], // Seg a Sex
    diasAtendimentoDesc: "Segunda a Sexta-feira",
    horariosDisponiveis: [
      "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00",
      "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
    ],
    ativo: true,
  },
];

export const INITIAL_EXAMES: ExameItem[] = [
  { nome: "ACUIDADE VISUAL", preco: 35.0, instrucao: "Trazer óculos de grau ou lentes de contato se utilizar." },
  { nome: "AUDIOMETRIA", preco: 55.0, instrucao: "Necessário repouso acústico absoluto de 8 horas (evitar fones de ouvido e trânsito ruidoso)." },
  { nome: "AVALIAÇÃO PSICOSSOCIAL", preco: 120.0, instrucao: "Trazer documento de identificação com foto." },
  { nome: "ELETROCARDIOGRAMA (ECG)", preco: 60.0, instrucao: "Vir com camisa de botão na frente; homens depilar/raspar pelos do tórax se excessivos." },
  { nome: "ELETROENCEFALOGRAMA (EEG)", preco: 90.0, instrucao: "Cabelos lavados e secos apenas com xampu neutro, sem condicionador, creme ou gel." },
  { nome: "ESPIROMETRIA", preco: 70.0, instrucao: "Não realizar em caso de gripe, resfriado ou crise asmática recente; não fumar 2h antes." },
  { nome: "GLICEMIA DE JEJUM", preco: 25.0, instrucao: "Jejum obrigatório de 4 horas." },
  { nome: "HEMOGRAMA COMPLETO", preco: 30.0, instrucao: "Jejum recomendado de 4 horas." },
  { nome: "RAIO-X DE TÓRAX (PA)", preco: 85.0, instrucao: "Mulheres: informar suspeita de gravidez; evitar roupas com botões ou zíperes metálicos." },
  { nome: "TOXICOLÓGICO LARGA JANELA", preco: 150.0, instrucao: "Coleta de queratina (cabelos/pelos) com mínimo de 3cm." },
];
