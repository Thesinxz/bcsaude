export type PerfilContratante =
  | "EMPRESAS (COM CNPJ) / OU EMPREGADORES (CPF/CAEPF / CEI)"
  | "SERVIDOR PÚBLICO / PROCESSOS SELETIVOS (SED, SEMED) OU CONCURSO"
  | "EMPRESAS COM KIT DE ATENDIMENTO PRÓPRIO";

export type TipoExame =
  | "ADMISSIONAL"
  | "DEMISSIONAL"
  | "PERIÓDICO"
  | "MUDANÇA DE FUNÇÃO"
  | "RETORNO AO TRABALHO"
  | "RETORNO (15 DIAS)";

export type TipoExameOcupacional = TipoExame;

export type FormaPagamento =
  | "PIX_DESCONTO"
  | "PADRAO"
  | "FATURADO";

export type StatusAgendamento =
  | "AGENDADO"
  | "CONFIRMADO"
  | "CONCLUIDO"
  | "CANCELADO"
  | "NO_SHOW";

export type StatusPagamento =
  | "PENDENTE"
  | "PAGO"
  | "FATURADO"
  | "ISENTO";

export interface ExameItem {
  id?: string;
  codigo?: string;
  nome: string;
  preco: number;
  categoria?: string;
  instrucao?: string;
  instrucaoPreparo?: string;
  ativo?: boolean;
}

export interface UnidadeItem {
  id: string;
  nome: string;
  endereco: string;
  cidade: string;
  uf: string;
  telefone?: string | null;
  horariosDisponiveis: string[];
  diasSemanaDisponiveis?: number[];
  diasAtendimentoDesc?: string;
  ativo: boolean;
}

export interface AgendamentoData {
  id?: string;
  protocolo?: string;
  perfilContratante: string;
  unidadeId: string;
  unidadeNome: string;
  unidadeEndereco?: string;
  dataAgendada: string;
  horaAgendada: string;
  responsavelNome: string;
  responsavelEmail: string;
  responsavelTelefone: string;
  empresaDoc: string;
  empresaRazaoSocial: string;
  empresaEmailAso: string;
  empresaEndereco?: string;
  trabalhadorCpf: string;
  trabalhadorNome: string;
  trabalhadorFuncao: string;
  trabalhadorNasc: string;
  tipoExame: string;
  examesComplementares: ExameItem[];
  formaPagamento: FormaPagamento;
  valorBase: number;
  valorAdicionais: number;
  valorDesconto: number;
  valorTotal: number;
  statusPagamento?: StatusPagamento;
  statusAgendamento?: StatusAgendamento;
  observacoes?: string;
  lgpdAceite: boolean;
  createdAt?: string | Date;
}

export interface EmpresaData {
  id?: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string | null;
  emailAso?: string | null;
  telefone?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  bairro?: string | null;
  municipio?: string | null;
  uf?: string | null;
  cep?: string | null;
  situacaoCadastral?: string | null;
  tipoConvenio?: string;
}

export interface CnpjResponse {
  cnpj: string;
  razao_social: string;
  nome_fantasia?: string;
  situacao_cadastral?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  sucesso: boolean;
  mensagem?: string;
}
