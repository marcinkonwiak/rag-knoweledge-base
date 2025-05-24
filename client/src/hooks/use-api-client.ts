import { useMsal } from "@azure/msal-react";
import { useMemo } from "react";
import { ApiClient } from "@/lib/api/client";

export function useApiClient() {
  const { instance, accounts } = useMsal();
  const account = instance.getActiveAccount() || accounts[0];

  const apiClient = useMemo(() => {
    if (!account) return null;
    return new ApiClient(instance, account);
  }, [instance, account]);

  return { apiClient, account };
}
