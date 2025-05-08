import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
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

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ context, location }) => {
    const { isAuthenticated } = context.auth;

    if (!isAuthenticated) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
        replace: true,
      });
    }
  },
  component: Authenticated,
});

export function Authenticated() {
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

// function RootComponent1() {

//   const { isAuthenticated, user, login, logout, isLoading } = useAuth();
//
//   return (
//     <>
//       <div style={{ padding: "1rem", borderBottom: "1px solid #ccc" }}>
//         <Link to="/" style={{ marginRight: "1rem" }}>
//           Home
//         </Link>
//         {isAuthenticated && (
//           <Link to="/dashboard" style={{ marginRight: "1rem" }}>
//             Dashboard (Protected)
//           </Link>
//         )}
//         <div style={{ float: "right" }}>
//           {isLoading ? (
//             <span>Loading...</span>
//           ) : isAuthenticated ? (
//             <>
//               <span style={{ marginRight: "0.5rem" }}>
//                 Hello, {user?.name || user?.username || "User"}!
//               </span>
//               <button onClick={() => logout()}>Logout</button>
//             </>
//           ) : (
//             <button onClick={() => login()}>Login</button>
//           )}
//         </div>
//       </div>
//       <hr />
//       <div style={{ padding: "1rem" }}>
//         <Outlet />
//       </div>
//       <TanStackRouterDevtools />
//     </>
//   );
// }
