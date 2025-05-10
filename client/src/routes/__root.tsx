import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { RouterContext } from "@/routerContext.ts";

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

export function RootComponent() {
  return (
    <>
      <Outlet />
    </>
  );
}
