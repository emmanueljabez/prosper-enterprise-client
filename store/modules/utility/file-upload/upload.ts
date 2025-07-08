import { defineStore } from 'pinia';
import uploadFileApi from '~/http/requests/utility/file-upload';
import encryptionUtil from '@/utils/crypto';

export interface FileUploadState {
  isUploading: boolean;
  error: string | null;
  uploadedUrl: string | null; // Added for storing uploaded image URL
}

export const useFileUploadStore = defineStore('fileUpload', {
  state: (): FileUploadState => ({
    isUploading: false,
    error: null,
    uploadedUrl: null // Added
  }),

  getters: {
    getIsUploading: (state) => state.isUploading,
    getError: (state) => state.error,
    getUploadedUrl: (state) => state.uploadedUrl // Added
  },

  actions: {
    // Upload a single file
    async uploadFile(file: File): Promise<{ success: boolean; data?: any; error?: string }> {
      try {
        this.isUploading = true;
        this.error = null;

        const response = await uploadFileApi.uploadFile(file);
        const decryptedResponse = encryptionUtil.decrypt(response.data);
        console.log('Upload response:', decryptedResponse);
        // Optionally set uploadedUrl here if you want auto-update
        // this.uploadedUrl = decryptedResponse.url || null;
        this.isUploading = false;
        return {
          success: true,
          data: decryptedResponse
        };
      } catch (error: any) {
        this.isUploading = false;
        this.error = error.response?.data?.message || error.message || 'Upload failed';
        return {
          success: false,
          error: this.error || 'Upload failed'
        };
      }
    },

    // Set uploaded image URL (for creation wizard)
    setUploadedUrl(url: string | null) {
      this.uploadedUrl = url;
    },

    clearUploadedUrl() {
      this.uploadedUrl = null;
    },

    // Clear error
    clearError() {
      this.error = null;
    }
  }
});