import axiosInstance from "~/http/axios";
import type { DocumentFilters, DocumentUploadParams } from "@/types/inventory/documents";

export default {
  // Fetch documents with optional filters
  fetchDocuments(filters: DocumentFilters = {}) {
    return axiosInstance.get('/inventory/documents', { params: filters });
  },

  // Fetch a single document by ID
  fetchDocument(id: string) {
    return axiosInstance.get(`/inventory/documents/${id}`);
  },

  // Upload a new document with metadata
  uploadDocument(formData: FormData) {
    return axiosInstance.post('/inventory/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Update document metadata
  updateDocumentMetadata(id: string, metadata: any) {
    return axiosInstance.patch(`/inventory/documents/${id}`, metadata);
  },

  // Delete a document
  deleteDocument(id: string) {
    return axiosInstance.delete(`/inventory/documents/${id}`);
  },

  // Download a document file
  downloadDocument(id: string) {
    return axiosInstance.get(`/inventory/documents/${id}/download`, {
      responseType: 'blob'
    });
  },

  // Generate a thumbnail for a document
  generateThumbnail(id: string) {
    return axiosInstance.post(`/inventory/documents/${id}/thumbnail`);
  },

  // Bulk tag documents
  bulkTagDocuments(documentIds: string[], tags: string[]) {
    return axiosInstance.post('/inventory/documents/bulk/tag', { ids: documentIds, tags });
  },

  // Get documents for a specific transaction
  getDocumentsForTransaction(transactionId: string) {
    return axiosInstance.get(`/inventory/documents/transaction/${transactionId}`);
  },

  // Get documents for a specific location
  getDocumentsForLocation(locationId: string) {
    return axiosInstance.get(`/inventory/documents/location/${locationId}`);
  },

  // Export documents (filtered)
  exportDocuments(format: string, filters: DocumentFilters = {}) {
    return axiosInstance.get(`/inventory/documents/export/${format}`, { 
      params: filters,
      responseType: 'blob'
    });
  },

  // Mark document as confidential
  setDocumentProtection(id: string, protection: 'none' | 'read-only' | 'confidential') {
    return axiosInstance.patch(`/inventory/documents/${id}/protection`, { protection });
  },

  // Upload multiple documents in a batch
  batchUploadDocuments(formData: FormData) {
    return axiosInstance.post('/inventory/documents/batch-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
}