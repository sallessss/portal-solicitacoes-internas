export type Role = "USER" | "ADMIN";

export type CategoriaSolicitacao = "TI" | "RH" | "COMPRAS" | "FINANCEIRO" | "INFRAESTRUTURA";

export type StatusSolicitacao = "ABERTO" | "EM_ATENDIMENTO" | "CONCLUIDO";

export type UsuarioResponse = {
  id: string;
  username: string;
  role: Role;
};

export type LoginResponse = {
  token: string;
  type: "Bearer";
  expiresIn: number;
  user: UsuarioResponse;
};

export type DashboardResponse = {
  total: number;
  abertas: number;
  emAtendimento: number;
  concluidas: number;
};

export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};

export type SolicitacaoResumoResponse = {
  id: string;
  codigo: string;
  titulo: string;
  categoria: CategoriaSolicitacao;
  status: StatusSolicitacao;
  solicitante: string;
  createdAt: string;
};

export type SolicitacaoResponse = SolicitacaoResumoResponse & {
  descricao: string;
  usuarioId: string;
  updatedAt: string;
};

export type SolicitacaoPayload = {
  titulo: string;
  descricao: string;
  categoria: CategoriaSolicitacao;
};

export type SolicitacaoFilters = {
  page?: number;
  size?: number;
  sort?: string;
  status?: StatusSolicitacao | "";
  categoria?: CategoriaSolicitacao | "";
  dataInicio?: string;
  dataFim?: string;
  titulo?: string;
};
