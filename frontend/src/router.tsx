import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { ErrorComponent, NotFoundComponent, RootComponent } from "@/components/router-boundary";
import { DashboardPage } from "@/pages/DashboardPage";
import { DetalheSolicitacaoPage } from "@/pages/DetalheSolicitacaoPage";
import { LoginPage } from "@/pages/LoginPage";
import { SolicitacoesPage } from "@/pages/SolicitacoesPage";

const rootRoute = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LoginPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "dashboard",
  component: DashboardPage,
});

const solicitacoesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "solicitacoes",
  component: SolicitacoesPage,
});

const detalheSolicitacaoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "solicitacoes/$requestId",
  component: function DetalheSolicitacaoRoute() {
    const { requestId } = detalheSolicitacaoRoute.useParams();
    return <DetalheSolicitacaoPage requestId={requestId} />;
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  solicitacoesRoute,
  detalheSolicitacaoRoute,
]);

export const router = createRouter({
  routeTree,
  scrollRestoration: true,
  defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
