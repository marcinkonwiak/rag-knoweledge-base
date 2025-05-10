import { useEffect } from "react";
import {
  createFileRoute,
  useRouter,
  useNavigate,
} from "@tanstack/react-router";
import { useAuth } from "@/authHooks.ts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Loader2 } from "lucide-react";

interface LoginSearch {
  redirect?: string;
}

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => {
    return {
      redirect:
        typeof search.redirect === "string" ? search.redirect : "/login",
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

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle className="text-xl">Login</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading || isAuthenticated ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <Button onClick={handleLogin}>Login with Microsoft</Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
