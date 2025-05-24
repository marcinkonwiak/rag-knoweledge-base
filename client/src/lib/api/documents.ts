import type { ApiClient } from "./client";

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
  apiClient: ApiClient,
): Promise<Document[]> {
  const apiDocs = await apiClient.get<ApiDocument[]>("/documents/");
  return apiDocs.map(({ id, title }) => ({ id, title }));
}

export async function fetchDocument(
  apiClient: ApiClient,
  id: number,
): Promise<ApiDocument> {
  return apiClient.get<ApiDocument>(`/documents/${id}/`);
}

export async function createDocument(
  apiClient: ApiClient,
  data: Omit<ApiDocument, "id" | "created_by_id">,
): Promise<ApiDocument> {
  return apiClient.post<ApiDocument>("/documents/", data);
}

export async function updateDocument(
  apiClient: ApiClient,
  id: number,
  data: Partial<Omit<ApiDocument, "id" | "created_by_id">>,
): Promise<ApiDocument> {
  return apiClient.put<ApiDocument>(`/documents/${id}/`, data);
}

export async function deleteDocument(
  apiClient: ApiClient,
  id: number,
): Promise<void> {
  return apiClient.delete<void>(`/documents/${id}/`);
}
