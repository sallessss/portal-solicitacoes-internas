import * as React from "react";
import { Link } from "@tanstack/react-router";
import { AlertCircle, ChevronLeft, ChevronRight, Inbox, LoaderCircle, X } from "lucide-react";
import { cn } from "@/utils/utils";
import { categoriaLabel, statusLabel } from "@/utils/labels";
import type { CategoriaSolicitacao, StatusSolicitacao } from "@/types/api";

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "icon";
}) {
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "border border-border bg-card text-foreground hover:bg-muted",
    ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  };
  const sizes = { sm: "h-8 px-3 text-xs", md: "h-10 px-4 text-sm", icon: "size-9" };
  return (
    <button
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md font-semibold transition-colors disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}

export function Input({
  label,
  error,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string | undefined }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-foreground">
      {label}
      <input
        className={cn(
          "h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15",
          error && "border-destructive focus:border-destructive",
          className,
        )}
        {...props}
      />
      {error && <span className="text-xs font-normal text-destructive">{error}</span>}
    </label>
  );
}

export function Textarea({
  label,
  error,
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string | undefined;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-foreground">
      {label}
      <textarea
        className={cn(
          "min-h-36 w-full resize-y rounded-md border border-input bg-card px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15",
          error && "border-destructive",
          className,
        )}
        {...props}
      />
      {error && <span className="text-xs font-normal text-destructive">{error}</span>}
    </label>
  );
}

export function Select({
  label,
  children,
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-foreground">
      {label}
      <select
        className={cn(
          "h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "blue" | "amber" | "green" | "red";
}) {
  const tones = {
    neutral: "bg-muted text-muted-foreground",
    blue: "bg-info-subtle text-info",
    amber: "bg-warning-subtle text-warning",
    green: "bg-success-subtle text-success",
    red: "bg-danger-subtle text-destructive",
  };
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded px-2.5 py-1 text-xs font-semibold",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}
export function StatusBadge({ status }: { status: StatusSolicitacao }) {
  return (
    <Badge tone={status === "ABERTO" ? "blue" : status === "EM_ATENDIMENTO" ? "amber" : "green"}>
      {statusLabel(status)}
    </Badge>
  );
}
export function CategoryBadge({ category }: { category: CategoriaSolicitacao }) {
  return <Badge>{categoriaLabel(category)}</Badge>;
}

export function PageTitle({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">{subtitle}</p>
      </div>
      {actions}
    </div>
  );
}
type BreadcrumbItem = {
  label: string;
  to?: "/dashboard" | "/solicitacoes";
};

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
      <Link to="/dashboard" className="hover:text-primary">
        Início
      </Link>
      {items.map((item) => (
        <React.Fragment key={item.label}>
          <span>/</span>
          {item.to ? (
            <Link to={item.to} className="hover:text-primary">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export function Pagination({
  page,
  size,
  totalElements,
  totalPages,
  onPageChange,
}: {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const first = totalElements === 0 ? 0 : page * size + 1;
  const last = Math.min((page + 1) * size, totalElements);
  const start = Math.max(0, Math.min(page - 2, Math.max(totalPages - 5, 0)));
  const pages = Array.from({ length: totalPages }, (_, index) => index).slice(start, start + 5);

  return (
    <div className="flex flex-col gap-3 border-t border-border px-1 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-xs text-muted-foreground">
        {first}-{last} de {totalElements} solicitações
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="secondary"
          size="icon"
          aria-label="Página anterior"
          disabled={page <= 0}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="size-4" />
        </Button>
        {pages.map((item) => (
          <Button
            key={item}
            variant={item === page ? "primary" : "ghost"}
            size="icon"
            aria-label={`Página ${item + 1}`}
            onClick={() => onPageChange(item)}
          >
            {item + 1}
          </Button>
        ))}
        <Button
          variant="secondary"
          size="icon"
          aria-label="Próxima página"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export function EmptyState() {
  return (
    <div className="grid min-h-64 place-items-center text-center">
      <div>
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-muted">
          <Inbox className="size-5 text-muted-foreground" />
        </span>
        <h3 className="mt-4 font-semibold">Nenhuma solicitação encontrada</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Ajuste os filtros ou crie uma nova solicitação.
        </p>
      </div>
    </div>
  );
}
export function LoadingState() {
  return (
    <div className="grid min-h-64 place-items-center text-center">
      <div>
        <LoaderCircle className="mx-auto size-6 animate-spin text-primary" />
        <p className="mt-3 text-sm font-medium">Carregando solicitações...</p>
      </div>
    </div>
  );
}
export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="grid min-h-64 place-items-center text-center">
      <div>
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-danger-subtle">
          <AlertCircle className="size-5 text-destructive" />
        </span>
        <h3 className="mt-4 font-semibold">Não foi possível carregar</h3>
        <p className="mt-1 text-sm text-muted-foreground">Tente novamente em alguns instantes.</p>
        {onRetry && (
          <Button variant="secondary" className="mt-4" onClick={onRetry}>
            Tentar novamente
          </Button>
        )}
      </div>
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const [shouldRender, setShouldRender] = React.useState(open);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setShouldRender(true);
      const timeout = window.setTimeout(() => setVisible(true), 20);

      return () => window.clearTimeout(timeout);
    }

    setVisible(false);
    const timeout = window.setTimeout(() => setShouldRender(false), 180);

    return () => window.clearTimeout(timeout);
  }, [open]);

  if (!shouldRender) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 grid place-items-center bg-overlay p-4 transition-opacity duration-200 ease-out",
        visible ? "opacity-100" : "opacity-0",
      )}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn(
          "w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl transition-all duration-200 ease-out",
          visible ? "translate-y-0 scale-100 opacity-100" : "translate-y-3 scale-[0.98] opacity-0",
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar">
            <X className="size-4" />
          </Button>
        </div>
        <div className="mt-6 flex justify-end gap-2">{children}</div>
      </div>
    </div>
  );
}
