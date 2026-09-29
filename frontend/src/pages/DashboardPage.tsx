import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, CircleDot, Clock3, ListChecks, Plus } from "lucide-react";
import { CreateSolicitacaoModal } from "@/components/create-solicitacao-modal";
import { AppShell } from "@/layouts/app-shell";
import {
  Breadcrumb,
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
  PageTitle,
} from "@/components/ui-kit";
import { RequestTable } from "@/components/request-table";
import { getDashboard } from "@/services/dashboard.service";
import { deleteSolicitacao, listSolicitacoes } from "@/services/solicitacao.service";
import { useAuth } from "@/contexts/auth.context";
import type { SolicitacaoResumoResponse } from "@/types/api";

export function DashboardPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const dashboardQuery = useQuery({ queryKey: ["dashboard"], queryFn: getDashboard });
  const recentQuery = useQuery({
    queryKey: ["solicitacoes", "recentes"],
    queryFn: () => listSolicitacoes({ page: 0, size: 10 }),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteSolicitacao,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["solicitacoes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
  const data = dashboardQuery.data;
  const total = data?.total ?? 0;
  const recentRequests = useMemo(
    () =>
      [...(recentQuery.data?.content ?? [])].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [recentQuery.data?.content],
  );

  const stats = [
    {
      label: "Total",
      value: total,
      icon: ListChecks,
    },
    {
      label: "Abertas",
      value: data?.abertas ?? 0,
      icon: CircleDot,
    },
    {
      label: "Em atendimento",
      value: data?.emAtendimento ?? 0,
      icon: Clock3,
    },
    {
      label: "Concluidas",
      value: data?.concluidas ?? 0,
      icon: CheckCircle2,
    },
  ];

  const distribution = [
    ["Abertas", data?.abertas ?? 0, "bg-info"],
    ["Em atendimento", data?.emAtendimento ?? 0, "bg-warning"],
    ["Concluidas", data?.concluidas ?? 0, "bg-success"],
  ] as const;
  const abertasEnd = total > 0 ? ((data?.abertas ?? 0) / total) * 100 : 0;
  const atendimentoEnd =
    total > 0 ? (((data?.abertas ?? 0) + (data?.emAtendimento ?? 0)) / total) * 100 : 0;
  const distributionGradient =
    total > 0
      ? `conic-gradient(var(--color-info) 0% ${abertasEnd}%, var(--color-warning) ${abertasEnd}% ${atendimentoEnd}%, var(--color-success) ${atendimentoEnd}% 100%)`
      : "conic-gradient(var(--color-muted) 0% 100%)";

  function canMutate(item: SolicitacaoResumoResponse) {
    return item.status === "ABERTO" && item.solicitante === user?.username;
  }

  return (
    <AppShell>
      <Breadcrumb items={[{ label: "Dashboard" }]} />
      <PageTitle
        title="Dashboard"
        subtitle="Visão geral das solicitações internas"
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Nova solicitação
          </Button>
        }
      />
      {dashboardQuery.isLoading ? (
        <LoadingState />
      ) : dashboardQuery.isError ? (
        <ErrorState onRetry={() => dashboardQuery.refetch()} />
      ) : (
        <>
          <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(({ label, value, icon: Icon }) => (
              <article
                key={label}
                className="rounded-lg border border-border bg-card p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-base font-semibold text-foreground">{label}</p>
                    <p className="mt-3 font-display text-3xl font-bold">{value}</p>
                  </div>
                  <span className="grid size-10 place-items-center text-muted-foreground">
                    <Icon className="size-5" />
                  </span>
                </div>
              </article>
            ))}
          </section>
          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <article className="min-w-0 overflow-hidden rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg font-bold">Solicitações recentes</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Últimas movimentações registradas
                  </p>
                </div>
                <Link
                  to="/solicitacoes"
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  Ver todas
                </Link>
              </div>
              {recentQuery.isLoading ? (
                <LoadingState />
              ) : recentQuery.isError ? (
                <ErrorState onRetry={() => recentQuery.refetch()} />
              ) : recentRequests.length ? (
                <div className="max-h-[365px] min-w-0 overflow-y-auto overflow-x-hidden pr-1">
                  <RequestTable
                    requests={recentRequests}
                    canMutate={canMutate}
                    onDelete={(id) => deleteMutation.mutate(id)}
                  />
                </div>
              ) : (
                <EmptyState />
              )}
            </article>
            <article className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <h2 className="font-display text-lg font-bold">Distribuição por status</h2>
              <p className="mt-1 text-xs text-muted-foreground">Total de {total} solicitações</p>
              <div className="mt-8 grid place-items-center">
                <div
                  className="relative grid size-44 place-items-center rounded-full"
                  style={{ background: distributionGradient }}
                >
                  <div className="grid size-28 place-items-center rounded-full bg-card text-center">
                    <div>
                      <p className="text-3xl font-bold">{total}</p>
                      <p className="text-xs text-muted-foreground">total</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8 grid gap-3">
                {distribution.map(([label, value, color]) => (
                  <div key={label} className="flex items-center text-sm">
                    <span className={`mr-2 size-2 rounded-full ${color}`} />
                    <span className="text-muted-foreground">{label}</span>
                    <strong className="ml-auto">{value}</strong>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </>
      )}
      <CreateSolicitacaoModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </AppShell>
  );
}
