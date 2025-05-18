import { Configuration } from "@azure/msal-browser";

export const msalConfig: Configuration = {
  auth: {
    clientId: "78637b4f-3088-4520-adba-bd9809392f9e",
    authority:
      "https://login.microsoftonline.com/d267408e-f179-4c25-a9f7-e52293bafeae",
    redirectUri: "http://localhost:5173/",
    postLogoutRedirectUri: "/",
  },
  cache: {
    cacheLocation: "localStorage",
  },
};

export const loginRequest = {
  scopes: ["user_impersonation"],
};
