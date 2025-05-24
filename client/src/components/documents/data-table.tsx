"use client";

import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DocumentModal } from "./document-modal";
import { useApiClient } from "@/hooks/use-api-client";
import { 
  createDocument, 
  updateDocument, 
  deleteDocument,
  fetchDocument,
  type Document,
  type ApiDocument 
} from "@/lib/api/documents";
import { createColumns } from "./columns";

interface DataTableProps<TData, TValue> {
  columns?: ColumnDef<TData, TValue>[];
  data: TData[];
  onDataChange: () => void;
}

export function DataTable<TData, TValue>({
  columns: providedColumns,
  data,
  onDataChange,
}: DataTableProps<TData, TValue>) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<ApiDocument | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { apiClient } = useApiClient();

  const handleEdit = async (document: Document) => {
    if (!apiClient) return;
    
    try {
      setIsLoading(true);
      const fullDocument = await fetchDocument(apiClient, document.id);
      setEditingDocument(fullDocument);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch document:", error);
      alert("Failed to load document. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (document: Document) => {
    if (!apiClient) return;
    
    if (confirm("Are you sure you want to delete this document?")) {
      try {
        setIsLoading(true);
        await deleteDocument(apiClient, document.id);
        onDataChange();
      } catch (error) {
        console.error("Failed to delete document:", error);
        alert("Failed to delete document. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Use provided columns or create default columns with handlers
  const columns = providedColumns || createColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
  }) as ColumnDef<TData, TValue>[];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleAdd = () => {
    setEditingDocument(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: { title: string; content: string }) => {
    if (!apiClient) return;
    
    try {
      setIsLoading(true);
      if (editingDocument) {
        await updateDocument(apiClient, editingDocument.id, data);
      } else {
        await createDocument(apiClient, data);
      }
      onDataChange();
    } catch (error) {
      console.error("Failed to save document:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Documents</h2>
        <Button onClick={handleAdd} disabled={isLoading}>
          <Plus className="h-4 w-4 mr-2" />
          Add Document
        </Button>
      </div>

      <div className="rounded-md border">
        <Table className="table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{
                        width: header.getSize(),
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{
                        width: cell.column.getSize(),
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No documents found. Click "Add Document" to create your first document.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DocumentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        document={editingDocument}
        isLoading={isLoading}
      />
    </div>
  );
}
