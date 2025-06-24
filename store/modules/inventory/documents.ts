import { defineStore } from 'pinia';
import { mockDocuments } from '@/mock/mockInventoryData';
import documentsApi from '~/http/requests/app/inventory/documents';
import type { Document, DocumentState, DocumentFilters } from '@/types/inventory/documents';

// Determine if we're in development environment
const config = useRuntimeConfig() 
const environment = config.public.nodeEnv
const isDev = environment === 'development';

export const useDocumentsStore = defineStore('documents', {
  state: (): DocumentState => ({
    documents: [],
    isLoading: false,
    error: null,
    useMockData: isDev,
    hasMoreDocuments: true,
    currentPage: 1,
    pageSize: 20
  }),
  
  getters: {
    getDocuments: (state) => state.documents,
    getDocumentById: (state) => (id: string) => state.documents.find(document => document.id === id),
    getIsLoading: (state) => state.isLoading,
    getError: (state) => state.error,
    getDocumentsByType: (state) => (type: string) => 
      state.documents.filter(document => document.type === type),
    getDocumentsByTransactionId: (state) => (transactionId: string) => 
      state.documents.filter(document => document.transactionId === transactionId),
    getDocumentsByDate: (state) => (startDate: string, endDate: string) => {
      return state.documents.filter(document => {
        const documentDate = new Date(document.createdAt);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return documentDate >= start && documentDate <= end;
      });
    },    getDocumentsByLocation: (state) => (locationId: string) => 
      state.documents.filter(document => document.locationId === locationId),
    getDocumentsGroupedByType: (state) => {
      // Group documents by their type
      const groupedDocuments: Record<string, Document[]> = {};
      
      // Initialize common document types
      const commonTypes = ['invoice', 'receipt', 'packing_slip', 'bill_of_lading', 'purchase_order'];
      commonTypes.forEach(type => {
        groupedDocuments[type] = [];
      });
      
      // Add documents to their respective groups
      state.documents.forEach(doc => {
        if (!groupedDocuments[doc.type]) {
          groupedDocuments[doc.type] = [];
        }
        groupedDocuments[doc.type].push(doc);
      });
      
      return groupedDocuments;
    }
  },
  
  actions: {
    setUseMockData(useMock: boolean) {
      this.useMockData = useMock;
    },
    
    async fetchDocuments(filters: DocumentFilters = {}) {
      this.isLoading = true;
      this.error = null;
      this.currentPage = 1;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Filter mock documents based on the provided filters
          let filteredDocuments = [...mockDocuments];
          
          if (filters.type && filters.type !== 'all') {
            filteredDocuments = filteredDocuments.filter(
              d => d.type === filters.type
            );
          }
          
          if (filters.transactionId) {
            filteredDocuments = filteredDocuments.filter(
              d => d.transactionId === filters.transactionId
            );
          }
          
          if (filters.locationId) {
            filteredDocuments = filteredDocuments.filter(
              d => d.locationId === filters.locationId
            );
          }
          
          if (filters.dateRange && filters.dateRange !== 'all') {
            const now = new Date();
            let startDate = new Date();
            
            // Set start date based on range
            switch (filters.dateRange) {
              case 'today':
                startDate.setHours(0, 0, 0, 0);
                break;
              case 'yesterday':
                startDate.setDate(now.getDate() - 1);
                startDate.setHours(0, 0, 0, 0);
                break;
              case 'thisWeek':
                startDate.setDate(now.getDate() - now.getDay());
                startDate.setHours(0, 0, 0, 0);
                break;
              case 'thisMonth':
                startDate.setDate(1);
                startDate.setHours(0, 0, 0, 0);
                break;
              case 'lastMonth':
                startDate.setMonth(now.getMonth() - 1);
                startDate.setDate(1);
                startDate.setHours(0, 0, 0, 0);
                break;
              default:
                // Custom date range would be handled here
                break;
            }
            
            filteredDocuments = filteredDocuments.filter(d => {
              const documentDate = new Date(d.createdAt);
              return documentDate >= startDate && documentDate <= now;
            });
          }
          
          if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            filteredDocuments = filteredDocuments.filter(
              d => d.name.toLowerCase().includes(query) || 
                   d.description?.toLowerCase().includes(query)
            );
          }
          
          // Implement pagination
          const start = 0;
          const end = Math.min(this.pageSize, filteredDocuments.length);
          const paginatedDocuments = filteredDocuments.slice(start, end);
          
          // Check if there are more documents
          this.hasMoreDocuments = filteredDocuments.length > this.pageSize;
          
          response = { 
            success: true, 
            documents: paginatedDocuments, 
            total: filteredDocuments.length,
            hasMore: this.hasMoreDocuments
          };
        } else {
          // Real API call
          response = await documentsApi.fetchDocuments({
            ...filters,
            page: this.currentPage,
            pageSize: this.pageSize
          });
          
          this.hasMoreDocuments = response.hasMore;
        }
        
        if (response.success) {
          this.documents = response.documents;
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to fetch documents';
        throw error;
      }
    },
    
    async fetchMoreDocuments() {
      if (!this.hasMoreDocuments || this.isLoading) return;
      
      this.isLoading = true;
      this.currentPage += 1;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Get next page of documents from mock data
          const start = (this.currentPage - 1) * this.pageSize;
          const end = Math.min(start + this.pageSize, mockDocuments.length);
          
          if (start >= mockDocuments.length) {
            this.hasMoreDocuments = false;
            this.isLoading = false;
            return;
          }
          
          const nextPageDocuments = mockDocuments.slice(start, end);
          this.hasMoreDocuments = end < mockDocuments.length;
          
          response = { 
            success: true, 
            documents: nextPageDocuments,
            hasMore: this.hasMoreDocuments
          };
        } else {
          // Real API call
          response = await documentsApi.fetchDocuments({
            page: this.currentPage,
            pageSize: this.pageSize
          });
          
          this.hasMoreDocuments = response.hasMore;
        }
        
        if (response.success) {
          this.documents = [...this.documents, ...response.documents];
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to fetch more documents';
        throw error;
      }
    },
    
    async fetchDocument(id: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          await new Promise(resolve => setTimeout(resolve, 300));
          const document = mockDocuments.find(document => document.id === id);
          
          if (!document) {
            throw new Error(`Document with ID ${id} not found`);
          }
          
          response = { success: true, document };
        } else {
          response = await documentsApi.fetchDocument(id);
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || `Failed to fetch document with ID ${id}`;
        throw error;
      }
    },
    
    async uploadDocument(document: any, file: File) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1200));
          
          // Generate new ID and add timestamps
          const id = `doc-${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`;
          const now = new Date();
          
          // Create mock URL for document preview
          let thumbnailUrl = null;
          if (file.type.startsWith('image/')) {
            thumbnailUrl = 'https://placehold.co/400x600';
          }
          
          const newDocument = {
            ...document,
            id,
            name: document.name || file.name,
            size: file.size,
            fileType: file.type,
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
            url: `https://example.com/documents/${id}`,
            thumbnail: thumbnailUrl
          };
          
          response = { success: true, document: newDocument };
          
          // Add to mock data
          mockDocuments.unshift(newDocument);
        } else {
          // Create FormData for file upload
          const formData = new FormData();
          formData.append('file', file);
          
          // Add other document metadata
          Object.keys(document).forEach(key => {
            formData.append(key, document[key]);
          });
          
          response = await documentsApi.uploadDocument(formData);
        }
        
        // Add the new document to our state
        if (response.success && response.document) {
          this.documents = [response.document, ...this.documents];
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to upload document';
        throw error;
      }
    },
    
    async deleteDocument(id: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 600));
          
          // Remove from mock data
          const index = mockDocuments.findIndex(d => d.id === id);
          if (index === -1) throw new Error('Document not found');
          
          mockDocuments.splice(index, 1);
          response = { success: true };
        } else {
          response = await documentsApi.deleteDocument(id);
        }
        
        // Remove the document from our state
        this.documents = this.documents.filter(d => d.id !== id);
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to delete document';
        throw error;
      }
    },
    
    async updateDocumentMetadata(id: string, metadata: any) {
      this.isLoading = true;
      this.error = null;
      
      try {
        let response;
        if (this.useMockData) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Find and update the document
          const index = mockDocuments.findIndex(d => d.id === id);
          if (index === -1) throw new Error('Document not found');
          
          const updatedDocument = {
            ...mockDocuments[index],
            ...metadata,
            updatedAt: new Date().toISOString()
          };
          
          mockDocuments[index] = updatedDocument;
          response = { success: true, document: updatedDocument };
        } else {
          response = await documentsApi.updateDocumentMetadata(id, metadata);
        }
        
        // Update the document in our state
        const index = this.documents.findIndex(d => d.id === id);
        if (index !== -1 && response.document) {
          this.documents[index] = response.document;
        }
        
        this.isLoading = false;
        return response;
      } catch (error: any) {
        this.isLoading = false;
        this.error = error.response?.data?.message || 'Failed to update document metadata';
        throw error;
      }
    }
  }
});