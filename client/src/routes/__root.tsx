import { createRootRoute, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootComponent,
});

export function RootComponent() {
  return (
    <>
      <Outlet />
    </>
  );
}
