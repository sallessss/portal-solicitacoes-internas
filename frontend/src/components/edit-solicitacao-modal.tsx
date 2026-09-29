import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, LoaderCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Button,
  ErrorState,
  Input,
  LoadingState,
  Select,
  StatusBadge,
  Textarea,
} from "@/components/ui-kit";
import {
  DESCRICAO_MAX_LENGTH,
  solicitacaoSchema,
  type SolicitacaoFormData,
} from "@/schemas/solicitacao.schema";
import { ApiError } from "@/services/api";
import { getSolicitacao, updateSolicitacao } from "@/services/solicitacao.service";
import { categoriaOptions } from "@/utils/labels";
import { cn } from "@/utils/utils";

type EditSolicitacaoModalProps = {
  requestId: string | null;
  open: boolean;
  onClose: () => void;
};

export function EditSolicitacaoModal({ requestId, open, onClose }: EditSolicitacaoModalProps) {
  const [shouldRender, setShouldRender] = useState(open);
  const [visible, setVisible] = useState(false);
  const [saved, setSaved] = useState(false);
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<SolicitacaoFormData>({
    resolver: zodResolver(solicitacaoSchema),
  });
  const descricaoLength = watch("descricao")?.length ?? 0;

  const query = useQuery({
    queryKey: ["solicitacao", requestId],
    queryFn: () => getSolicitacao(requestId ?? ""),
    enabled: open && Boolean(requestId),
  });

  const mutation = useMutation({
    mutationFn: (data: SolicitacaoFormData) => updateSolicitacao(requestId ?? "", data),
    onSuccess: () => {
      setSaved(true);
      queryClient.invalidateQueries({ queryKey: ["solicitacao", requestId] });
      queryClient.invalidateQueries({ queryKey: ["solicitacoes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      window.setTimeout(onClose, 450);
    },
  });
  const resetMutation = mutation.reset;

  useEffect(() => {
    if (open) {
      setShouldRender(true);
      setSaved(false);
      const frame = window.requestAnimationFrame(() => setVisible(true));

      return () => window.cancelAnimationFrame(frame);
    }

    setVisible(false);
    const timeout = window.setTimeout(() => {
      setShouldRender(false);
      setSaved(false);
      reset();
      resetMutation();
    }, 180);

    return () => window.clearTimeout(timeout);
  }, [open, reset, resetMutation]);

  useEffect(() => {
    if (query.data) {
      reset({
        titulo: query.data.titulo,
        descricao: query.data.descricao,
        categoria: query.data.categoria,
      });
    }
  }, [query.data, reset]);

  if (!shouldRender) return null;

  function submit(data: SolicitacaoFormData) {
    setSaved(false);
    mutation.mutate(data);
  }

  const errorMessage =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : "Não foi possível salvar as alterações.";

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 grid place-items-center bg-overlay p-4 transition-opacity duration-200 ease-out",
        visible ? "opacity-100" : "opacity-0",
      )}
      role="dialog"
      aria-modal="true"
    >
      <form
        onSubmit={handleSubmit(submit)}
        className={cn(
          "w-full max-w-2xl rounded-lg border border-border bg-card shadow-xl transition-all duration-200 ease-out",
          visible ? "translate-y-0 scale-100 opacity-100" : "translate-y-3 scale-[0.98] opacity-0",
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5 sm:p-6">
          <div>
            <h2 className="font-display text-lg font-bold">Editar solicitação</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Atualize as informações da solicitação aberta.
            </p>
          </div>
          <Button variant="ghost" size="icon" type="button" onClick={onClose} aria-label="Fechar">
            <X className="size-4" />
          </Button>
        </div>
        {query.isLoading ? (
          <div className="p-5 sm:p-6">
            <LoadingState />
          </div>
        ) : query.isError || !query.data ? (
          <div className="p-5 sm:p-6">
            <ErrorState onRetry={() => query.refetch()} />
          </div>
        ) : (
          <>
            <div className="flex flex-col justify-between gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:p-6">
              <div>
                <p className="text-xs text-muted-foreground">Código da solicitação</p>
                <p className="mt-1 text-sm font-bold text-primary">{query.data.codigo}</p>
              </div>
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Status atual</p>
                <StatusBadge status={query.data.status} />
              </div>
            </div>
            {saved && (
              <div className="mx-5 mt-5 flex items-center gap-2 rounded-md bg-success-subtle p-3 text-sm font-medium text-success sm:mx-6">
                <CheckCircle2 className="size-4" />
                Alterações salvas com sucesso.
              </div>
            )}
            {mutation.isError && (
              <div className="mx-5 mt-5 rounded-md border border-destructive/25 bg-danger-subtle p-3 text-sm text-destructive sm:mx-6">
                {errorMessage}
              </div>
            )}
            <div className="grid gap-6 p-5 sm:p-6">
              <Input label="Título *" {...register("titulo")} error={errors.titulo?.message} />
              <div className="grid gap-1.5">
                <Textarea
                  label="Descrição *"
                  maxLength={DESCRICAO_MAX_LENGTH}
                  {...register("descricao")}
                  error={errors.descricao?.message}
                />
                <p className="text-right text-xs text-muted-foreground">
                  {descricaoLength}/{DESCRICAO_MAX_LENGTH} caracteres
                </p>
              </div>
              <Select label="Categoria *" {...register("categoria")}>
                {categoriaOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Select>
              {errors.categoria && (
                <p className="-mt-4 text-xs text-destructive">{errors.categoria.message}</p>
              )}
            </div>
            <div className="flex flex-col-reverse gap-2 border-t border-border bg-muted/40 p-5 sm:flex-row sm:justify-end sm:p-6">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <LoaderCircle className="size-4 animate-spin" />}
                {mutation.isPending ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
