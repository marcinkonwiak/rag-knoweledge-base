import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header.tsx";
import { DataTable } from "@/components/documents/data-table.tsx";
import { columns, Document } from "@/components/documents/columns.tsx";

export const Route = createFileRoute("/_authenticated/")({
  component: Index,
});

function getData(): Document[] {
  return [
    {
      id: "728ed52f",
      title: "Document 1",
    },
    {
      id: "728ed52f",
      title: "Document 2",
    },
    {
      id: "728ed52f",
      title: "Document 3",
    },
    {
      id: "728ed52f",
      title: "Document 4",
    },
    {
      id: "728ed52f",
      title: "Document 5",
    },
    {
      id: "728ed52f",
      title: "Document 6",
    },
  ];
}

function Index() {
  const data = getData();

  return (
    <>
      <AppHeader breadcrumbTitle={"Documents"} />
      <div className="p-6">
        <DataTable columns={columns} data={data} />
      </div>
    </>
  );
}
