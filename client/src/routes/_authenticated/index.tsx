import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header.tsx";
import { DataTable } from "@/components/documents/data-table.tsx";
import { columns } from "@/components/documents/columns.tsx";
import type { Document } from "@/lib/api/documents";
import { useQuery } from "@tanstack/react-query";
import { fetchDocuments } from "@/lib/api/documents";
import { useApiClient } from "@/hooks/use-api-client.ts";

export const Route = createFileRoute("/_authenticated/")({ component: Index });

function Index() {
  const { apiClient, account } = useApiClient();

  const {
    data: documents,
    isLoading,
    isError,
  } = useQuery<Document[], Error>({
    queryKey: ["documents"],
    queryFn: () => fetchDocuments(apiClient!),
    enabled: !!apiClient && !!account,
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
