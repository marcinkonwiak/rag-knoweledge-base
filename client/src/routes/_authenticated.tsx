import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar.tsx";
import { AppSidebar } from "@/components/app-sidebar.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb.tsx";
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
          <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
      <TanStackRouterDevtools position={"bottom-right"} />
    </div>
  );
}
