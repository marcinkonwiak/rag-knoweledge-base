import { loginRequest } from "@/authConfig";
import { Button } from "@/components/ui/button";
import { PublicClientApplication } from "@azure/msal-browser";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import {
  createRootRouteWithContext,
  Link,
  Outlet,
  redirect,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

interface RouterContext {
  msalInstance: PublicClientApplication;
}

export const Route = createRootRouteWithContext()<RouterContext>({
  beforeLoad: ({ context, location }) => {
    const isAuthenticated = context.msalInstance.getActiveAccount() !== null;
    if (!isAuthenticated && location.pathname !== "/login") {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
        replace: true,
      });
    }
    if (isAuthenticated && location.pathname === "/login") {
      throw redirect({
        to: "/",
        replace: true,
      });
    }
  },
  component: RootComponent,
});

function AuthStatus() {
  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const account = instance.getActiveAccount();

  const handleLogin = () => {
    instance.loginRedirect(loginRequest).catch((e) => {
      console.error("Login redirect failed:", e);
    });
  };

  const handleLogout = () => {
    instance.logoutRedirect({ postLogoutRedirectUri: "/" }).catch((e) => {
      console.error("Logout redirect failed:", e);
    });
  };

  return (
    <div className="p-2 flex gap-2 items-center">
      {isAuthenticated ? (
        <>
          <span>Welcome, {account?.name ?? account?.username ?? "User"}!</span>
          <Button onClick={handleLogout} variant="outline" size="sm">
            Sign Out
          </Button>
        </>
      ) : (
        <Button onClick={handleLogin} variant="outline" size="sm">
          Sign In
        </Button>
      )}
    </div>
  );
}

function RootComponent() {
  const isLoading = useRouterState({ select: (s) => s.status === "pending" });

  return (
    <>
      <div className="p-2 flex gap-2 justify-between items-center">
        <nav className="flex gap-2">
          <Link to="/" className="[&.active]:font-bold">
            Home
          </Link>{" "}
        </nav>
        <AuthStatus />
      </div>
      <hr />
      {isLoading && <div className="p-2">Loading...</div>}
      <Outlet />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}
