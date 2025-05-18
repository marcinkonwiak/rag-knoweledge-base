import type { PublicClientApplication, AccountInfo } from "@azure/msal-browser";

export interface ApiDocument {
  id: number;
  title: string;
  content: string;
  created_by_id: number;
}

export interface Document {
  id: number;
  title: string;
}

export async function fetchDocuments(
  instance: PublicClientApplication,
  account: AccountInfo,
): Promise<Document[]> {
  const { accessToken } = await instance.acquireTokenSilent({
    scopes: ["api://78637b4f-3088-4520-adba-bd9809392f9e/user_impersonation"],
    authority:
      "https://login.microsoftonline.com/d267408e-f179-4c25-a9f7-e52293bafeae",
    account,
  });
  const response = await fetch("http://localhost:8000/api/documents/", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch documents");
  }

  const apiDocs: ApiDocument[] = await response.json();
  return apiDocs.map(({ id, title }) => ({ id, title }));
}
