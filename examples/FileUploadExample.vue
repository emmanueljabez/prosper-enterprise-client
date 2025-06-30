// Example usage of the simplified file upload store
// This can be used in any Vue component

<template>
  <div class="file-upload-example">
    <input 
      type="file" 
      @change="handleFileSelect" 
      :disabled="fileUploadStore.getIsUploading"
    />
    
    <Button 
      @click="uploadSelectedFile" 
      :disabled="!selectedFile || fileUploadStore.getIsUploading"
      :loading="fileUploadStore.getIsUploading"
    >
      {{ fileUploadStore.getIsUploading ? 'Uploading...' : 'Upload File' }}
    </Button>

    <div v-if="fileUploadStore.getError" class="error-message">
      {{ fileUploadStore.getError }}
      <Button @click="fileUploadStore.clearError()" variant="ghost" size="sm">
        Clear
      </Button>
    </div>

    <div v-if="uploadResult" class="upload-result">
      Upload successful! File URL: {{ uploadResult.url }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useFileUploadStore } from '~/store/modules/utility/file-upload/upload';
import { Button } from '~/components/ui/button';

const fileUploadStore = useFileUploadStore();
const selectedFile = ref<File | null>(null);
const uploadResult = ref<any>(null);

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  selectedFile.value = target.files?.[0] || null;
  uploadResult.value = null;
  fileUploadStore.clearError();
};

const uploadSelectedFile = async () => {
  if (!selectedFile.value) return;

  const result = await fileUploadStore.uploadFile(selectedFile.value);
  
  if (result.success) {
    uploadResult.value = result.data;
    selectedFile.value = null;
    // Reset the input
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (input) input.value = '';
  }
};
</script>

<style scoped>
.file-upload-example {
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  max-width: 400px;
}

.error-message {
  color: #ef4444;
  background: #fef2f2;
  padding: 0.5rem;
  border-radius: 0.25rem;
  margin-top: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.upload-result {
  color: #16a34a;
  background: #f0fdf4;
  padding: 0.5rem;
  border-radius: 0.25rem;
  margin-top: 0.5rem;
}
</style>
