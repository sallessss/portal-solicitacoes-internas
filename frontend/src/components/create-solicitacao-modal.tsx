import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, Select, Textarea } from "@/components/ui-kit";
import {
  DESCRICAO_MAX_LENGTH,
  solicitacaoSchema,
  type SolicitacaoFormData,
} from "@/schemas/solicitacao.schema";
import { ApiError } from "@/services/api";
import { createSolicitacao } from "@/services/solicitacao.service";
import { categoriaOptions } from "@/utils/labels";
import { cn } from "@/utils/utils";

type CreateSolicitacaoModalProps = {
  open: boolean;
  onClose: () => void;
};

export function CreateSolicitacaoModal({ open, onClose }: CreateSolicitacaoModalProps) {
  const [shouldRender, setShouldRender] = useState(open);
  const [visible, setVisible] = useState(false);
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<SolicitacaoFormData>({
    resolver: zodResolver(solicitacaoSchema),
    defaultValues: {
      titulo: "",
      descricao: "",
    },
  });
  const descricaoLength = watch("descricao")?.length ?? 0;

  const mutation = useMutation({
    mutationFn: createSolicitacao,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["solicitacoes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      reset();
      onClose();
    },
  });
  const resetMutation = mutation.reset;

  useEffect(() => {
    if (open) {
      setShouldRender(true);
      const timeout = window.setTimeout(() => setVisible(true), 20);

      return () => window.clearTimeout(timeout);
    }

    setVisible(false);
    const timeout = window.setTimeout(() => {
      setShouldRender(false);
      reset();
      resetMutation();
    }, 180);

    return () => window.clearTimeout(timeout);
  }, [open, reset, resetMutation]);

  if (!shouldRender) return null;

  function submit(data: SolicitacaoFormData) {
    mutation.mutate(data);
  }

  const errorMessage =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : "Não foi possível criar a solicitação.";

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
            <h2 className="font-display text-lg font-bold">Nova solicitação</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Registre uma demanda interna para acompanhamento.
            </p>
          </div>
          <Button variant="ghost" size="icon" type="button" onClick={onClose} aria-label="Fechar">
            <X className="size-4" />
          </Button>
        </div>
        {mutation.isError && (
          <div className="mx-5 mt-5 rounded-md border border-destructive/25 bg-danger-subtle p-3 text-sm text-destructive sm:mx-6">
            {errorMessage}
          </div>
        )}
        <div className="grid gap-6 p-5 sm:p-6">
          <Input
            label="Título *"
            placeholder="Resuma a sua solicitação"
            maxLength={120}
            {...register("titulo")}
            error={errors.titulo?.message}
          />
          <div className="grid gap-1.5">
            <Textarea
              label="Descrição *"
              placeholder="Descreva a necessidade com detalhes"
              maxLength={DESCRICAO_MAX_LENGTH}
              {...register("descricao")}
              error={errors.descricao?.message}
            />
            <p className="text-right text-xs text-muted-foreground">
              {descricaoLength}/{DESCRICAO_MAX_LENGTH} caracteres
            </p>
          </div>
          <Select label="Categoria *" defaultValue="" {...register("categoria")}>
            <option value="">Selecione uma categoria</option>
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
            {mutation.isPending ? "Enviando..." : "Criar solicitação"}
          </Button>
        </div>
      </form>
    </div>
  );
}
