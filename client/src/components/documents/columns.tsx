import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button.tsx";
import { Trash } from "lucide-react";
import type { Document } from "@/lib/api/documents";

export const columns: ColumnDef<Document>[] = [
  {
    accessorKey: "title",
    header: () => "Title",
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: () => (
      <div className="flex justify-center">
        <Button variant="ghost" className="h-8 w-8 p-0">
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    ),
    size: 10,
  },
];
