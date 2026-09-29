import { apiFetch, toQueryString } from "./api";
import type {
  PageResponse,
  SolicitacaoFilters,
  SolicitacaoPayload,
  SolicitacaoResponse,
  SolicitacaoResumoResponse,
  StatusSolicitacao,
} from "@/types/api";

export function listSolicitacoes(filters: SolicitacaoFilters = {}) {
  const size = Math.min(filters.size ?? 10, 20);

  return apiFetch<PageResponse<SolicitacaoResumoResponse>>(
    `/solicitacoes${toQueryString({
      page: filters.page ?? 0,
      size,
      sort: filters.sort ?? "createdAt,desc",
      status: filters.status,
      categoria: filters.categoria,
      dataInicio: filters.dataInicio,
      dataFim: filters.dataFim,
      titulo: filters.titulo,
    })}`,
  );
}

export function getSolicitacao(id: string) {
  return apiFetch<SolicitacaoResponse>(`/solicitacoes/${id}`);
}

export function createSolicitacao(payload: SolicitacaoPayload) {
  return apiFetch<SolicitacaoResponse>("/solicitacoes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateSolicitacao(id: string, payload: SolicitacaoPayload) {
  return apiFetch<SolicitacaoResponse>(`/solicitacoes/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteSolicitacao(id: string) {
  return apiFetch<void>(`/solicitacoes/${id}`, {
    method: "DELETE",
  });
}

export function changeSolicitacaoStatus(id: string, status: StatusSolicitacao) {
  return apiFetch<SolicitacaoResponse>(`/solicitacoes/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
