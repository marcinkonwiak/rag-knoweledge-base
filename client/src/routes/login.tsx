import {
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { EventType, InteractionStatus } from "@azure/msal-browser";
import { loginRequest } from "../authConfig";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { z } from "zod";

const loginSearchSchema = z.object({
  redirect: z.string().optional().catch(""),
});

export const Route = createFileRoute("/login")({
  validateSearch: (search) => loginSearchSchema.parse(search),
  component: LoginComponent,
});

function LoginComponent() {
  const { instance, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate({ from: "/login" });
  const router = useRouter();

  const { redirect: redirectUrl } = Route.useSearch();

  useEffect(() => {
    if (isAuthenticated) {
      // If authenticated, redirect to the intended URL or home
      console.log("Authenticated, redirecting to:", redirectUrl || "/");
      navigate({ to: redirectUrl || "/", replace: true });
    }
  }, [isAuthenticated, navigate, redirectUrl]);
  useEffect(() => {
    const callbackId = instance.addEventCallback((message) => {
      if (message.eventType === EventType.LOGIN_SUCCESS) {
        // Ensure router is hydrated before navigating
        router.invalidate().finally(() => {
          navigate({ to: redirectUrl || "/", replace: true });
        });
      }
    });
    return () => {
      // Cleanup the callback when component unmounts
      if (callbackId) {
        instance.removeEventCallback(callbackId);
      }
    };
  }, [instance, navigate, redirectUrl, router]); // Add router to dependencies

  const handleLogin = () => {
    instance.loginRedirect(loginRequest).catch((e) => {
      console.error("Login redirect failed:", e);
    });
  };

  // Show loading indicator if MSAL is busy initializing or handling redirect
  if (
    inProgress === InteractionStatus.Startup ||
    inProgress === InteractionStatus.HandleRedirect
  ) {
    return (
      <div className="p-4 text-center">Initializing authentication...</div>
    );
  }

  // If somehow the user is authenticated and reaches here before the effect redirects
  if (isAuthenticated) {
    return (
      <div className="p-4 text-center">Already logged in. Redirecting...</div>
    );
  }

  // Render the login prompt
  return (
    <div className="flex h-screen flex-col items-center justify-center p-4">
      <h1 className="mb-4 text-2xl font-semibold">Login Required</h1>
      <p className="mb-6 text-center">
        Please log in with your Microsoft account to continue.
      </p>
      <Button
        onClick={handleLogin}
        disabled={inProgress !== InteractionStatus.None}
        size="lg"
      >
        {inProgress === InteractionStatus.Login
          ? "Processing Login..."
          : "Login with Microsoft"}
      </Button>
      {inProgress !== InteractionStatus.None && (
        <p className="mt-4 text-sm text-gray-500">
          Interaction Status: {inProgress}
        </p>
      )}
    </div>
  );
}
