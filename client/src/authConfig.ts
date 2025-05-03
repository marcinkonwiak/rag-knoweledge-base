import { Configuration, PublicClientApplication } from "@azure/msal-browser";

const msalConfig: Configuration = {
  auth: {
    clientId: "2d337173-e679-4f1a-85b1-94c60107ab45",
    authority:
      "https://login.microsoftonline.com/d267408e-f179-4c25-a9f7-e52293bafeae",
    redirectUri: "http://localhost:5173",
    postLogoutRedirectUri: "/",
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);

export const loginRequest = {
  scopes: ["User.Read"],
};
