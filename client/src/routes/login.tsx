import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Loader2 } from "lucide-react";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";

export const Route = createFileRoute("/login")({
  component: LoginComponent,
});

function LoginComponent() {
  const navigate = useNavigate({ from: Route.fullPath });
  const isAuthenticated = useIsAuthenticated();

  const { instance, accounts, inProgress } = useMsal();

  const handleLogin = () => {
    instance.loginPopup().then();
  };

  useEffect(() => {
    if (accounts.length > 0) {
      console.log("User is already logged in:", accounts[0]);
      navigate({ to: "/", replace: true }).then();
    }
  }, [accounts, navigate, isAuthenticated]);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle className="text-xl">Login</CardTitle>
        </CardHeader>
        <CardContent>
          {inProgress === "login" ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <Button onClick={handleLogin}>Login with Microsoft</Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
