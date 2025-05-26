"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
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
      setErrorMessage("Failed to load document. Please try again.");
      setErrorDialogOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (document: Document) => {
    setDocumentToDelete(document);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!apiClient || !documentToDelete) return;
    
    try {
      setIsLoading(true);
      await deleteDocument(apiClient, documentToDelete.id);
      onDataChange();
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    } catch (error) {
      console.error("Failed to delete document:", error);
      setErrorMessage("Failed to delete document. Please try again.");
      setErrorDialogOpen(true);
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    } finally {
      setIsLoading(false);
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
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Documents</h2>
        <Button onClick={handleAdd} disabled={isLoading}>
          <Plus className="h-4 w-4 mr-2" />
          Add Document
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        <DataTable columns={columns} data={data} />
      </div>

      <DocumentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        document={editingDocument}
        isLoading={isLoading}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the document
              "{documentToDelete?.title}" and remove it from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Error Dialog */}
      <AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>
              {errorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorDialogOpen(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
