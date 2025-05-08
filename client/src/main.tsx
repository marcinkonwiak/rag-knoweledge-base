import { StrictMode } from "react";
import "./index.css";
import ReactDOM from "react-dom/client";
import { AuthProvider, AuthState } from "@/auth.tsx";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "@/routeTree.gen.ts";
import { useAuth } from "@/authHooks.ts";
import { ThemeProvider } from "@/components/theme-provider.tsx";

const router = createRouter({
  routeTree,
  context: {
    auth: undefined! as AuthState,
  },
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function App() {
  const auth = useAuth();

  return <RouterProvider router={router} context={{ auth }} />;
}

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <AuthProvider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <App />
        </ThemeProvider>
      </AuthProvider>
    </StrictMode>,
  );
}
