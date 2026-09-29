import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Filter, Plus, Search, X } from "lucide-react";
import { CreateSolicitacaoModal } from "@/components/create-solicitacao-modal";
import { AppShell } from "@/layouts/app-shell";
import { RequestTable } from "@/components/request-table";
import {
  Breadcrumb,
  Button,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  PageTitle,
  Select,
} from "@/components/ui-kit";
import { categoriaOptions, statusOptions } from "@/utils/labels";
import {
  changeSolicitacaoStatus,
  deleteSolicitacao,
  listSolicitacoes,
} from "@/services/solicitacao.service";
import { useAuth } from "@/contexts/auth.context";
import type {
  CategoriaSolicitacao,
  SolicitacaoFilters,
  SolicitacaoResumoResponse,
  StatusSolicitacao,
} from "@/types/api";

const initialFilters: SolicitacaoFilters = {
  page: 0,
  size: 10,
  sort: "createdAt,desc",
  dataInicio: "",
  dataFim: "",
  categoria: "",
  status: "",
  titulo: "",
};

export function SolicitacoesPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [draft, setDraft] = useState<SolicitacaoFilters>(initialFilters);
  const [filters, setFilters] = useState<SolicitacaoFilters>(initialFilters);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["solicitacoes", filters],
    queryFn: () => listSolicitacoes(filters),
  });
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: StatusSolicitacao }) =>
      changeSolicitacaoStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["solicitacoes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteSolicitacao,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["solicitacoes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setFilters({ ...draft, page: 0, size: 10 });
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [draft]);

  function clear() {
    setDraft(initialFilters);
    setFilters(initialFilters);
  }

  function canChangeStatus() {
    return user?.role === "ADMIN";
  }

  function canMutate(item: SolicitacaoResumoResponse) {
    return item.status === "ABERTO" && item.solicitante === user?.username;
  }

  return (
    <AppShell>
      <Breadcrumb items={[{ label: "Solicitações" }]} />
      <PageTitle
        title="Solicitações"
        subtitle="Gerencie e acompanhe as solicitações internas"
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Nova solicitação
          </Button>
        }
      />
      <section className="mt-7 rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-bold">Filtros</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Input
            label="Periodo inicial"
            type="date"
            value={draft.dataInicio ?? ""}
            onChange={(e) => setDraft((current) => ({ ...current, dataInicio: e.target.value }))}
          />
          <Input
            label="Periodo final"
            type="date"
            value={draft.dataFim ?? ""}
            onChange={(e) => setDraft((current) => ({ ...current, dataFim: e.target.value }))}
          />
          <Select
            label="Categoria"
            value={draft.categoria ?? ""}
            onChange={(e) =>
              setDraft((current) => ({
                ...current,
                categoria: e.target.value as CategoriaSolicitacao | "",
              }))
            }
          >
            <option value="">Todas</option>
            {categoriaOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
          <Select
            label="Status"
            value={draft.status ?? ""}
            onChange={(e) =>
              setDraft((current) => ({
                ...current,
                status: e.target.value as StatusSolicitacao | "",
              }))
            }
          >
            <option value="">Todos</option>
            {statusOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
          <div className="relative">
            <Input
              label="Buscar por titulo"
              placeholder="Digite um termo"
              value={draft.titulo ?? ""}
              onChange={(e) => setDraft((current) => ({ ...current, titulo: e.target.value }))}
              className="pl-9"
            />
            <Search className="absolute bottom-3 left-3 size-4 text-muted-foreground" />
          </div>
        </div>
        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={clear}>
            <X className="size-4" />
            Limpar filtros
          </Button>
        </div>
      </section>
      <section className="mt-6 rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-lg font-bold">Lista de solicitações</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {query.data?.totalElements ?? 0} registros encontrados
            </p>
          </div>
          {statusMutation.isError && (
            <p className="text-sm text-destructive">
              Não foi possível alterar o status da solicitação.
            </p>
          )}
        </div>
        {query.isLoading ? (
          <LoadingState />
        ) : query.isError ? (
          <ErrorState onRetry={() => query.refetch()} />
        ) : query.data?.content.length ? (
          <RequestTable
            requests={query.data.content}
            pagination={{
              page: query.data.number,
              size: query.data.size,
              totalElements: query.data.totalElements,
              totalPages: query.data.totalPages,
              onPageChange: (page) => setFilters((current) => ({ ...current, page, size: 10 })),
            }}
            canChangeStatus={canChangeStatus}
            onStatusChange={(id, status) => statusMutation.mutate({ id, status })}
            canMutate={canMutate}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
        ) : (
          <EmptyState />
        )}
      </section>
      <CreateSolicitacaoModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </AppShell>
  );
}
