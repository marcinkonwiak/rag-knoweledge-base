import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar.tsx";
import { AppSidebar } from "@/components/app-sidebar.tsx";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  component: Authenticated,
});

export function Authenticated() {
  const { accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate({ from: Route.fullPath });

  useEffect(() => {
    if (inProgress === "none" && !isAuthenticated) {
      navigate({
        to: "/login",
      }).then();
    }
  }, [accounts, navigate, isAuthenticated, inProgress]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className={"flex h-screen w-screen overflow-hidden"}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Outlet />
        </SidebarInset>
      </SidebarProvider>
      <TanStackRouterDevtools position={"bottom-right"} />
    </div>
  );
}
