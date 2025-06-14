import { StrictMode } from "react";
import "./index.css";
import ReactDOM from "react-dom/client";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "@/routeTree.gen.ts";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import {
  AuthenticationResult,
  AuthError,
  EventType,
  PublicClientApplication,
} from "@azure/msal-browser";
import { msalConfig } from "@/authConfig.ts";
import { MsalProvider } from "@azure/msal-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

const queryClient = new QueryClient();

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const msalInstance = new PublicClientApplication(msalConfig);

msalInstance.addEventCallback((event) => {
  if (
    event.payload &&
    (event.eventType === EventType.LOGIN_SUCCESS ||
      event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS ||
      event.eventType === EventType.SSO_SILENT_SUCCESS)
  ) {
    const payload = event.payload as AuthenticationResult;
    if (payload.account) {
      msalInstance.setActiveAccount(payload.account);
    }
  }
});

msalInstance
  .initialize()
  .then(() => {
    return msalInstance.handleRedirectPromise();
  })
  .then((response: AuthenticationResult | null) => {
    if (response && response.account) {
      msalInstance.setActiveAccount(response.account);
      if (response.state) {
        console.log("Redirect state received:", response.state);
      }
    }
  })
  .catch((error: AuthError | unknown) => {
    console.error("MSAL initialize or handleRedirectPromise error:", error);
  })
  .finally(() => {
    if (
      !msalInstance.getActiveAccount() &&
      msalInstance.getAllAccounts().length > 0
    ) {
      msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
    }

    const rootElement = document.getElementById("root")!;
    if (!rootElement.innerHTML) {
      const root = ReactDOM.createRoot(rootElement);
      root.render(
        <StrictMode>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
              <MsalProvider instance={msalInstance}>
                <App />
              </MsalProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </StrictMode>,
      );
    }
  });

export function App() {
  return <RouterProvider router={router} />;
}
