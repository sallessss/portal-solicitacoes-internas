import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { EditSolicitacaoModal } from "@/components/edit-solicitacao-modal";
import { formatDateTime, nextStatus, statusLabel } from "@/utils/labels";
import type { SolicitacaoResumoResponse, StatusSolicitacao } from "@/types/api";
import { Button, CategoryBadge, Modal, Pagination, StatusBadge } from "./ui-kit";

type PaginationConfig = {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

type RequestTableProps = {
  requests: SolicitacaoResumoResponse[];
  pagination?: PaginationConfig;
  onDelete?: (id: string) => void;
  canMutate?: (item: SolicitacaoResumoResponse) => boolean;
  onStatusChange?: (id: string, status: StatusSolicitacao) => void;
  canChangeStatus?: (item: SolicitacaoResumoResponse) => boolean;
};

export function RequestTable({
  requests,
  pagination = false,
  onDelete,
  canMutate = () => false,
  onStatusChange,
  canChangeStatus = () => false,
}: RequestTableProps) {
  const tableRef = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<SolicitacaoResumoResponse | null>(null);

  useEffect(() => {
    if (!menu) return;

    function closeOnOutsideClick(event: PointerEvent) {
      const target = event.target;
      if (target instanceof Node && !tableRef.current?.contains(target)) {
        setMenu(null);
      }
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);

    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [menu]);

  function confirmDelete() {
    if (deleting) {
      onDelete?.(deleting.id);
      setDeleting(null);
    }
  }

  return (
    <>
      <div ref={tableRef} className="hidden overflow-visible md:block">
        <table className="w-full table-fixed border-collapse text-left">
          <thead>
            <tr className="border-b border-border text-xs font-semibold uppercase text-muted-foreground">
              <th className="w-28 px-4 py-3">Código</th>
              <th className="px-4 py-3">Título</th>
              <th className="w-36 px-4 py-3">Categoria</th>
              <th className="w-36 px-4 py-3">Solicitante</th>
              <th className="w-40 px-4 py-3">Data</th>
              <th className="w-36 px-4 py-3">Status</th>
              <th className="w-20 px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((item) => {
              const mutable = canMutate(item);
              const next = nextStatus(item.status);
              const manageable = Boolean(next && onStatusChange && canChangeStatus(item));
              return (
                <tr
                  key={item.id}
                  className="border-b border-border/70 last:border-0 hover:bg-muted/50"
                >
                  <td className="whitespace-nowrap px-4 py-4 text-xs font-semibold text-primary">
                    <Link
                      to="/solicitacoes/$requestId"
                      params={{ requestId: item.id }}
                      className="cursor-pointer hover:underline"
                    >
                      {item.codigo}
                    </Link>
                  </td>
                  <td className="truncate px-4 py-4 text-sm font-medium" title={item.titulo}>
                    {item.titulo}
                  </td>
                  <td className="px-4 py-4">
                    <CategoryBadge category={item.categoria} />
                  </td>
                  <td className="truncate px-4 py-4 text-sm text-muted-foreground">
                    {item.solicitante}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-muted-foreground">
                    {formatDateTime(item.createdAt)}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="relative px-4 py-4 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Ações de ${item.codigo}`}
                      onClick={() => setMenu(menu === item.id ? null : item.id)}
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                    {menu === item.id && (
                      <div className="absolute right-5 top-12 z-10 w-48 rounded-md border border-border bg-popover p-1 text-left shadow-lg">
                        <Link
                          to="/solicitacoes/$requestId"
                          params={{ requestId: item.id }}
                          className="flex items-center gap-2 rounded px-2 py-2 text-sm hover:bg-muted"
                        >
                          <Eye className="size-4" />
                          Visualizar
                        </Link>
                        {manageable && next && (
                          <label
                            className="grid gap-1 rounded px-2 py-2 text-xs text-muted-foreground hover:bg-muted"
                            onClick={(event) => event.stopPropagation()}
                          >
                            Alterar status
                            <select
                              className="h-8 cursor-pointer rounded border border-input bg-card px-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                              value={item.status}
                              onChange={(event) => {
                                const status = event.target.value as StatusSolicitacao;
                                if (status !== item.status) {
                                  onStatusChange(item.id, status);
                                  setMenu(null);
                                }
                              }}
                            >
                              <option value={item.status}>{statusLabel(item.status)}</option>
                              <option value={next}>{statusLabel(next)}</option>
                            </select>
                          </label>
                        )}
                        {mutable && (
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 rounded px-2 py-2 text-sm hover:bg-muted"
                            onClick={() => {
                              setEditing(item.id);
                              setMenu(null);
                            }}
                          >
                            <Pencil className="size-4" />
                            Editar
                          </button>
                        )}
                        {mutable && (
                          <button
                            type="button"
                            onClick={() => {
                              setDeleting(item);
                              setMenu(null);
                            }}
                            className="flex w-full items-center gap-2 rounded px-2 py-2 text-sm text-destructive hover:bg-danger-subtle"
                          >
                            <Trash2 className="size-4" />
                            Excluir
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid min-w-0 gap-3 overflow-hidden md:hidden">
        {requests.map((item) => {
          const mutable = canMutate(item);
          const next = nextStatus(item.status);
          const manageable = Boolean(next && onStatusChange && canChangeStatus(item));
          return (
            <article
              key={item.id}
              className="min-w-0 overflow-hidden rounded-lg border border-border bg-card p-4"
            >
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0 flex-1 overflow-hidden">
                  <Link
                    to="/solicitacoes/$requestId"
                    params={{ requestId: item.id }}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    {item.codigo}
                  </Link>
                  <h3
                    className="mt-1 block w-full max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold"
                    title={item.titulo}
                  >
                    {item.titulo}
                  </h3>
                </div>
                <div className="shrink-0">
                  <StatusBadge status={item.status} />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Categoria</p>
                  <div className="mt-1">
                    <CategoryBadge category={item.categoria} />
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground">Abertura</p>
                  <p className="mt-1 font-medium">{formatDateTime(item.createdAt)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Solicitante</p>
                  <p className="mt-1 font-medium">{item.solicitante}</p>
                </div>
              </div>
              <div className="mt-4 flex min-w-0 gap-2 overflow-hidden border-t border-border pt-3">
                <Link
                  to="/solicitacoes/$requestId"
                  params={{ requestId: item.id }}
                  className="inline-flex h-9 min-w-0 flex-1 items-center justify-center gap-2 overflow-hidden rounded-md border border-border px-2 text-xs font-semibold"
                >
                  <Eye className="size-4 shrink-0" />
                  <span className="truncate">Visualizar</span>
                </Link>
                {manageable && next && (
                  <select
                    className="h-9 max-w-36 cursor-pointer rounded-md border border-border bg-card px-2 text-xs font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                    value={item.status}
                    aria-label="Alterar status"
                    onChange={(event) => {
                      const status = event.target.value as StatusSolicitacao;
                      if (status !== item.status) {
                        onStatusChange(item.id, status);
                      }
                    }}
                  >
                    <option value={item.status}>{statusLabel(item.status)}</option>
                    <option value={next}>{statusLabel(next)}</option>
                  </select>
                )}
                {mutable && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Editar"
                    onClick={() => setEditing(item.id)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                )}
                {mutable && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Excluir"
                    onClick={() => setDeleting(item)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {pagination && pagination.totalPages > 0 && (
        <div className="mt-4">
          <Pagination {...pagination} />
        </div>
      )}
      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Excluir solicitação?"
        description="Esta ação remove a solicitação da listagem ativa."
      >
        <Button variant="secondary" onClick={() => setDeleting(null)}>
          Cancelar
        </Button>
        <Button variant="destructive" onClick={confirmDelete}>
          Excluir
        </Button>
      </Modal>
      <EditSolicitacaoModal
        requestId={editing}
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
      />
    </>
  );
}
