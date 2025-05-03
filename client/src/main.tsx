import { StrictMode } from "react";
import "./index.css";
import { msalInstance } from "./authConfig.ts";
import { MsalProvider } from "@azure/msal-react";
import { routeTree } from "./routeTree.gen";
import ReactDOM from "react-dom/client";
import { createRouter, RouterProvider } from "@tanstack/react-router";

const router = createRouter({
  routeTree,
  context: { msalInstance: msalInstance },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
  interface RouterContext {
    msalInstance: typeof msalInstance;
  }
}

const rootElement = document.getElementById("root")!;

msalInstance
  .initialize()
  .then(() => {
    return msalInstance.handleRedirectPromise();
  })
  .then((response) => {
    if (response && response.account) {
      msalInstance.setActiveAccount(response.account);
    }

    if (!rootElement.innerHTML) {
      const root = ReactDOM.createRoot(rootElement);
      root.render(
        <StrictMode>
          <MsalProvider instance={msalInstance}>
            <RouterProvider router={router} />
          </MsalProvider>
        </StrictMode>,
      );
    }
  })
  .catch((error) => {
    console.error("MSAL Redirect Error:", error);
    if (!rootElement.innerHTML) {
      rootElement.innerHTML = "Error during authentication redirect.";
    }
  });
