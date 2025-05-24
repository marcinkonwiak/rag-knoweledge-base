import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button.tsx";
import { Pencil, Trash } from "lucide-react";
import type { Document } from "@/lib/api/documents";

interface ColumnsProps {
  onEdit: (document: Document) => void;
  onDelete: (document: Document) => void;
}

export const createColumns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<Document>[] => [
  {
    accessorKey: "title",
    header: () => "Title",
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => {
      const document = row.original;
      
      return (
        <div className="flex justify-center gap-1">
          <Button 
            variant="ghost" 
            className="h-8 w-8 p-0"
            onClick={() => onEdit(document)}
            title="Edit document"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            onClick={() => onDelete(document)}
            title="Delete document"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      );
    },
    size: 120,
  },
];
