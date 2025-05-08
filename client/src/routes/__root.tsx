import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { RouterContext } from "@/routerContext.ts";

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

export function RootComponent() {
  return (
    <>
      <Outlet />
      <TanStackRouterDevtools position={"bottom-right"} />
    </>
  );
}
