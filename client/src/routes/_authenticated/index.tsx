import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header.tsx";
import { DataTable } from "@/components/documents/data-table.tsx";
import { columns } from "@/components/documents/columns.tsx";
import type { Document } from "@/lib/api/documents";
import { useMsal } from "@azure/msal-react";
import { useQuery } from "@tanstack/react-query";
import { fetchDocuments } from "@/lib/api/documents";
import type { PublicClientApplication, AccountInfo } from "@azure/msal-browser";

export const Route = createFileRoute("/_authenticated/")({ component: Index });

function Index() {
  const { instance, accounts } = useMsal();
  const account = instance.getActiveAccount() || accounts[0];
  const {
    data: documents,
    isLoading,
    isError,
  } = useQuery<Document[], Error>({
    queryKey: ["documents"],
    queryFn: () =>
      fetchDocuments(
        instance as PublicClientApplication,
        account as AccountInfo,
      ),
    enabled: !!account,
  });

  if (isLoading) return <div>Loading…</div>;
  if (isError) return <div>Error loading documents</div>;
  return (
    <>
      <AppHeader breadcrumbTitle={"Documents"} />
      <div className="p-6">
        <DataTable columns={columns} data={documents ?? []} />
      </div>
    </>
  );
}
