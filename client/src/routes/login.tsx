import { useEffect } from "react";
import { createFileRoute, useRouter, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../auth"; // Use our custom auth hook

interface LoginSearch {
  redirect?: string;
}

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => {
    return {
      redirect: typeof search.redirect === "string" ? search.redirect : "/",
    };
  },
  component: LoginComponent,
});

function LoginComponent() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate({ from: Route.fullPath });
  const search = Route.useSearch();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      console.log("Already authenticated, redirecting to:", search.redirect);
      navigate({ to: search.redirect || "/", replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, search.redirect, router.history]);

  const handleLogin = () => {
    login(search.redirect);
  };

  if (isLoading || isAuthenticated) {
    return <div>Loading authentication status...</div>;
  }

  return (
      <div>
        <h2>Login Required</h2>
        <p>You must log in to access the requested page.</p>
        <button onClick={handleLogin} disabled={isLoading}>
          {isLoading ? "Logging in..." : "Log In with Microsoft"}
        </button>
      </div>
  );
}
