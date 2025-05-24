"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DataTable } from "./data-table";
import { DocumentModal } from "./document-modal";
import { createColumns } from "./columns";
import { useApiClient } from "@/hooks/use-api-client";
import { 
  createDocument, 
  updateDocument, 
  deleteDocument,
  fetchDocument,
  type Document,
  type ApiDocument 
} from "@/lib/api/documents";

interface DocumentsTableProps {
  data: Document[];
  onDataChange: () => void;
}

export function DocumentsTable({ data, onDataChange }: DocumentsTableProps) {
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
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save document:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const columns = createColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Documents</h2>
        <Button onClick={handleAdd} disabled={isLoading}>
          <Plus className="h-4 w-4 mr-2" />
          Add Document
        </Button>
      </div>

      <DataTable columns={columns} data={data} />

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
