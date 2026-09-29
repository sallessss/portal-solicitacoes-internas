import type { CategoriaSolicitacao, StatusSolicitacao } from "@/types/api";

export const categoriaOptions: { value: CategoriaSolicitacao; label: string }[] = [
  { value: "TI", label: "TI" },
  { value: "RH", label: "RH" },
  { value: "COMPRAS", label: "Compras" },
  { value: "FINANCEIRO", label: "Financeiro" },
  { value: "INFRAESTRUTURA", label: "Infraestrutura" },
];

export const statusOptions: { value: StatusSolicitacao; label: string }[] = [
  { value: "ABERTO", label: "Aberto" },
  { value: "EM_ATENDIMENTO", label: "Em atendimento" },
  { value: "CONCLUIDO", label: "Concluído" },
];

export function categoriaLabel(value: CategoriaSolicitacao) {
  return categoriaOptions.find((item) => item.value === value)?.label ?? value;
}

export function statusLabel(value: StatusSolicitacao) {
  return statusOptions.find((item) => item.value === value)?.label ?? value;
}

export function nextStatus(value: StatusSolicitacao): StatusSolicitacao | null {
  if (value === "ABERTO") return "EM_ATENDIMENTO";
  if (value === "EM_ATENDIMENTO") return "CONCLUIDO";
  return null;
}

export function formatDateTime(value: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
