<!-- Demo component showing image upload functionality for inventory items -->
<template>
  <div class="p-6 max-w-2xl mx-auto space-y-6">
    <div class="text-center">
      <h2 class="text-2xl font-bold mb-2">Inventory Item Image Upload Demo</h2>
      <p class="text-muted-foreground">
        Demonstrates the image upload functionality integrated with inventory item forms
      </p>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Upload Item Image</CardTitle>
        <CardDescription>
          Select an image file to upload and get a URL that would be saved with the inventory item
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <!-- Current Image Display -->
        <div v-if="imageUrl" class="space-y-3">
          <div class="relative inline-block">
            <img 
              :src="imageUrl" 
              alt="Uploaded item image" 
              class="w-48 h-48 object-cover rounded-lg border border-border"
            />
            <Button
              variant="outline"
              size="sm"
              class="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
              @click="removeImage"
            >
              <X class="h-3 w-3" />
            </Button>
          </div>
          
          <div class="space-y-2 p-3 bg-muted rounded-lg">
            <Label class="text-sm font-medium">Generated Image URL:</Label>
            <div class="flex items-center space-x-2">
              <Input 
                :value="imageUrl" 
                readonly 
                class="font-mono text-xs"
              />
              <Button
                variant="outline"
                size="sm"
                @click="copyToClipboard"
              >
                <Copy class="h-3 w-3" />
              </Button>
            </div>
            <p class="text-xs text-muted-foreground">
              This URL would be saved in the inventory item's imageUrl field
            </p>
          </div>
        </div>
        
        <!-- Upload Interface -->
        <div class="space-y-3">
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleImageSelect"
          />
          <Button
            type="button"
            variant="outline"
            class="w-full"
            :disabled="fileUploadStore.getIsUploading"
            @click="$refs.fileInput?.click()"
          >
            <Upload class="h-4 w-4 mr-2" />
            {{ imageUrl ? 'Change Image' : 'Upload Image' }}
          </Button>
          
          <!-- Upload Progress/Status -->
          <div v-if="fileUploadStore.getIsUploading" class="space-y-2">
            <div class="flex items-center space-x-2">
              <Loader2 class="h-4 w-4 animate-spin" />
              <span class="text-sm text-muted-foreground">Uploading image...</span>
            </div>
          </div>
          
          <!-- Upload Error -->
          <div v-if="fileUploadStore.getError" class="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div class="flex items-center justify-between">
              <p class="text-sm text-destructive">{{ fileUploadStore.getError }}</p>
              <Button
                variant="ghost"
                size="sm"
                @click="fileUploadStore.clearError()"
              >
                <X class="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <!-- Success Message -->
          <div v-if="uploadSuccess" class="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p class="text-sm text-green-700">✅ Image uploaded successfully!</p>
          </div>
        </div>
        
        <!-- Upload Guidelines -->
        <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 class="text-sm font-medium text-blue-900 mb-2">Upload Guidelines:</h4>
          <ul class="text-xs text-blue-700 space-y-1">
            <li>• Supported formats: JPG, PNG, GIF</li>
            <li>• Maximum file size: 5MB</li>
            <li>• Recommended size: 400x400 pixels or larger</li>
            <li>• Images will be automatically optimized for web use</li>
          </ul>
        </div>
      </CardContent>
    </Card>

    <!-- Integration Status -->
    <Card>
      <CardHeader>
        <CardTitle>Integration Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-3">
          <div class="flex items-center space-x-2">
            <CheckCircle class="h-4 w-4 text-green-500" />
            <span class="text-sm">File upload store implemented</span>
          </div>
          <div class="flex items-center space-x-2">
            <CheckCircle class="h-4 w-4 text-green-500" />
            <span class="text-sm">Image upload UI added to ItemEditorSheet</span>
          </div>
          <div class="flex items-center space-x-2">
            <CheckCircle class="h-4 w-4 text-green-500" />
            <span class="text-sm">Image upload UI added to ItemCreationWizard</span>
          </div>
          <div class="flex items-center space-x-2">
            <AlertCircle class="h-4 w-4 text-yellow-500" />
            <span class="text-sm">Backend imageUrl field support pending</span>
          </div>
          <div class="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p class="text-xs text-yellow-700">
              <strong>Note:</strong> The imageUrl field is currently commented out in the form submission 
              until the backend API is updated to support image URLs for inventory items.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Upload, X, Copy, Loader2, CheckCircle, AlertCircle } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useFileUploadStore } from '@/store/modules/utility/file-upload/upload'

// Stores
const fileUploadStore = useFileUploadStore()

// State
const fileInput = ref(null)
const imageUrl = ref('')
const uploadSuccess = ref(false)

// Methods
const handleImageSelect = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  uploadSuccess.value = false
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    fileUploadStore.error = 'Please select a valid image file'
    return
  }

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    fileUploadStore.error = 'Image size must be less than 5MB'
    return
  }

  try {
    const result = await fileUploadStore.uploadFile(file)
    if (result.success && result.data?.url) {
      imageUrl.value = result.data.url
      uploadSuccess.value = true
      // Reset file input
      if (fileInput.value) {
        fileInput.value.value = ''
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        uploadSuccess.value = false
      }, 3000)
    }
  } catch (error) {
    console.error('Error uploading image:', error)
  }
}

const removeImage = () => {
  imageUrl.value = ''
  uploadSuccess.value = false
  fileUploadStore.clearError()
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(imageUrl.value)
    // Could add a toast notification here
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
  }
}

// Clear errors when component unmounts
watch(() => fileUploadStore.getError, (error) => {
  if (error) {
    uploadSuccess.value = false
  }
})
</script>
