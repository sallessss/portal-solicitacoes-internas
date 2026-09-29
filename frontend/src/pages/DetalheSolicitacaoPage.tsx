import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { CalendarDays, Clock3, Settings, Tag, Trash2, UserRound } from "lucide-react";
import { EditSolicitacaoModal } from "@/components/edit-solicitacao-modal";
import { AppShell } from "@/layouts/app-shell";
import {
  Breadcrumb,
  Button,
  CategoryBadge,
  ErrorState,
  LoadingState,
  Modal,
  StatusBadge,
} from "@/components/ui-kit";
import { formatDateTime, nextStatus, statusLabel } from "@/utils/labels";
import {
  changeSolicitacaoStatus,
  deleteSolicitacao,
  getSolicitacao,
} from "@/services/solicitacao.service";
import { useAuth } from "@/contexts/auth.context";

export function DetalheSolicitacaoPage({ requestId }: { requestId: string }) {
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["solicitacao", requestId],
    queryFn: () => getSolicitacao(requestId),
  });
  const deleteMutation = useMutation({
    mutationFn: () => deleteSolicitacao(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["solicitacoes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      navigate({ to: "/solicitacoes" });
    },
  });
  const statusMutation = useMutation({
    mutationFn: () => {
      const next = query.data ? nextStatus(query.data.status) : null;
      if (!next) throw new Error("Status finalizado.");
      return changeSolicitacaoStatus(requestId, next);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["solicitacao", requestId] });
      queryClient.invalidateQueries({ queryKey: ["solicitacoes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  if (query.isLoading)
    return (
      <AppShell>
        <LoadingState />
      </AppShell>
    );

  if (query.isError || !query.data)
    return (
      <AppShell>
        <ErrorState onRetry={() => query.refetch()} />
      </AppShell>
    );

  const request = query.data;
  const next = nextStatus(request.status);
  const canEdit = user?.id === request.usuarioId && request.status === "ABERTO";
  const canManageStatus = user?.role === "ADMIN" && Boolean(next);

  return (
    <AppShell>
      <Breadcrumb
        items={[{ label: "Solicitações", to: "/solicitacoes" }, { label: request.codigo }]}
      />

      <div className="border-b border-border pb-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Detalhes da solicitação
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm">
              <span className="font-semibold text-primary">Código {request.codigo}</span>
              <Link
                to="/solicitacoes"
                className="font-semibold text-muted-foreground hover:text-primary"
              >
                Voltar para solicitações
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            {canEdit && (
              <Button variant="ghost" onClick={() => setEditing(true)}>
                <Settings className="size-4" />
                Editar
              </Button>
            )}
            {canEdit && (
              <Button variant="ghost" onClick={() => setDeleting(true)}>
                <Trash2 className="size-4 text-destructive" />
                Excluir
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="grid min-w-0 gap-6">
          <section className="min-w-0 rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <CategoryBadge category={request.categoria} />
                  <StatusBadge status={request.status} />
                </div>
                <h2 className="mt-3 max-w-full break-words font-display text-2xl font-bold [overflow-wrap:anywhere]">
                  {request.titulo}
                </h2>
              </div>
            </div>
            <h3 className="mt-6 text-sm font-bold">Descrição</h3>
            <p className="mt-3 max-w-full break-words text-sm leading-7 text-muted-foreground [overflow-wrap:anywhere]">
              {request.descricao}
            </p>
          </section>

          <section className="min-w-0 rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
            <h2 className="font-display text-lg font-bold">Informações</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {[
                [UserRound, "Solicitante", request.solicitante],
                [Tag, "Categoria", request.categoria],
                [CalendarDays, "Data de abertura", formatDateTime(request.createdAt)],
                [Clock3, "Última atualização", formatDateTime(request.updatedAt)],
              ].map(([Icon, label, value]) => {
                const ItemIcon = Icon as typeof UserRound;
                return (
                  <div key={String(label)} className="flex min-w-0 gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-md bg-muted">
                      <ItemIcon className="size-4 text-muted-foreground" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">{String(label)}</p>
                      <p className="mt-1 break-words text-sm font-semibold [overflow-wrap:anywhere]">
                        {String(value)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="min-w-0 space-y-6">
          {canManageStatus && (
            <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-bold">Gerenciar status</h2>
                <span className="rounded bg-info-subtle px-2 py-1 text-[10px] font-bold text-info">
                  ADMIN
                </span>
              </div>
              {statusMutation.isError && (
                <p className="mt-3 text-xs text-destructive">
                  Não foi possível atualizar o status.
                </p>
              )}
              <Button
                className="mt-4 w-full"
                disabled={!next || statusMutation.isPending}
                onClick={() => statusMutation.mutate()}
              >
                {next ? `Avançar para ${statusLabel(next)}` : "Status finalizado"}
              </Button>
            </section>
          )}
        </aside>
      </div>

      <EditSolicitacaoModal
        requestId={requestId}
        open={editing}
        onClose={() => setEditing(false)}
      />
      <Modal
        open={deleting}
        onClose={() => setDeleting(false)}
        title="Excluir solicitação?"
        description="Esta ação remove a solicitação da listagem ativa."
      >
        <Button variant="secondary" onClick={() => setDeleting(false)}>
          Cancelar
        </Button>
        <Button
          variant="destructive"
          disabled={deleteMutation.isPending}
          onClick={() => deleteMutation.mutate()}
        >
          Excluir
        </Button>
      </Modal>
    </AppShell>
  );
}
