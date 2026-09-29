import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";
import { Button } from "@/components/ui-kit";
import { cn } from "@/utils/utils";
import { useAuth } from "@/contexts/auth.context";

const nav = [
  { to: "/dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
  { to: "/solicitacoes" as const, label: "Solicitações", icon: ClipboardList },
];

const roleLabels = {
  ADMIN: "Administrador",
  USER: "Usuário",
} as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/" });
    }
  }, [loading, user, navigate]);

  const initials = useMemo(() => {
    if (!user?.username) return "--";
    return user.username.slice(0, 2).toUpperCase();
  }, [user?.username]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-sm font-medium text-muted-foreground">
        Carregando...
      </div>
    );
  }

  if (!user) return null;

  function logout() {
    setUserMenuOpen(false);
    signOut();
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {mobileOpen && (
        <button
          className="fixed inset-0 z-30 bg-overlay lg:hidden"
          aria-label="Fechar menu"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform lg:translate-x-0",
          !mobileOpen && "-translate-x-full",
          collapsed && "lg:w-20",
        )}
      >
        <div className="flex h-16 items-center justify-end border-b border-sidebar-border px-5">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X className="size-5" />
          </Button>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {nav.map(({ to, label, icon: Icon }) => {
            const active =
              pathname === to || (to === "/solicitacoes" && pathname.startsWith("/solicitacoes/"));
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                )}
              >
                <Icon className="size-5 shrink-0" />
                {!collapsed && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className={cn("transition-[padding] lg:pl-64", collapsed && "lg:pl-20")}>
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:inline-flex"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-5" />
            ) : (
              <PanelLeftClose className="size-5" />
            )}
          </Button>
          <h1 className="font-display text-base font-bold sm:text-lg">Portal de solicitações</h1>
          <div className="relative ml-auto flex items-center gap-3">
            <span className="hidden text-sm font-semibold text-foreground sm:inline">
              Olá, {user.username}!
            </span>
            <button
              type="button"
              className="grid size-9 cursor-pointer place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => setUserMenuOpen((current) => !current)}
              aria-label="Abrir menu do usuário"
              aria-expanded={userMenuOpen}
            >
              {initials}
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 top-12 z-30 w-56 rounded-md border border-border bg-popover p-2 shadow-lg">
                <div className="px-2 py-2">
                  <p className="truncate text-sm font-semibold">{user.username}</p>
                  <p className="text-xs text-muted-foreground">{roleLabels[user.role]}</p>
                </div>
                <button
                  type="button"
                  className="mt-1 flex h-9 w-full cursor-pointer items-center gap-2 rounded px-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={logout}
                >
                  <LogOut className="size-4" />
                  Sair
                </button>
              </div>
            )}
          </div>
        </header>
        <main className="mx-auto max-w-[1480px] p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
