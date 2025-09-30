<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/toast'
import { 
  Upload, 
  Camera, 
  X, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Check,
  AlertTriangle,
  Image as ImageIcon
} from 'lucide-vue-next'

interface Props {
  currentPhoto?: string | null
  userName?: string
  userId?: string
  maxSize?: number // in MB
  allowedTypes?: string[]
  cropAspectRatio?: number
  showCropper?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  maxSize: 5,
  allowedTypes: () => ['image/jpeg', 'image/png', 'image/webp'],
  cropAspectRatio: 1, // 1:1 for square
  showCropper: false
})

const emit = defineEmits<{
  photoUploaded: [file: File, preview: string]
  photoRemoved: []
  uploadComplete: [url: string]
  uploadError: [error: string]
}>()

const { toast } = useToast()

// Component state
const isDragging = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const showPreview = ref(false)

// File input ref
const fileInputRef = ref<HTMLInputElement>()

// Computed
const userInitials = computed(() => {
  if (!props.userName) return 'U'
  return props.userName.split(' ').map(n => n.charAt(0)).join('').toUpperCase()
})

const currentPhotoUrl = computed(() => {
  return previewUrl.value || props.currentPhoto
})

const maxSizeBytes = computed(() => {
  return props.maxSize * 1024 * 1024
})

// Drag and drop handlers
const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = true
}

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false
  
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    handleFileSelection(files[0])
  }
}

// File selection
const handleFileInput = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    handleFileSelection(file)
  }
}

const handleFileSelection = (file: File) => {
  // Validate file type
  if (!props.allowedTypes.includes(file.type)) {
    toast({
      title: 'Invalid File Type',
      description: `Please select a valid image file (${props.allowedTypes.join(', ')})`,
      variant: 'destructive'
    })
    return
  }

  // Validate file size
  if (file.size > maxSizeBytes.value) {
    toast({
      title: 'File Too Large',
      description: `Please select an image smaller than ${props.maxSize}MB`,
      variant: 'destructive'
    })
    return
  }

  selectedFile.value = file
  createPreview(file)
}

// Create preview
const createPreview = (file: File) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    previewUrl.value = e.target?.result as string
    showPreview.value = true
    
    emit('photoUploaded', file, previewUrl.value)
  }
  reader.readAsDataURL(file)
}

// Upload photo
const uploadPhoto = async () => {
  if (!selectedFile.value || !props.userId) return

  isUploading.value = true
  uploadProgress.value = 0

  try {
    const formData = new FormData()
    formData.append('photo', selectedFile.value)
    formData.append('userId', props.userId)

    // Simulate progress for demo
    const progressInterval = setInterval(() => {
      uploadProgress.value = Math.min(uploadProgress.value + 10, 90)
    }, 200)

    const response = await fetch('/api/profile/upload-photo', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    })

    clearInterval(progressInterval)
    uploadProgress.value = 100

    if (!response.ok) {
      throw new Error('Upload failed')
    }

    const data = await response.json()
    
    emit('uploadComplete', data.photoUrl)
    
    toast({
      title: 'Photo Uploaded',
      description: 'Your profile photo has been updated successfully',
      variant: 'success'
    })

    showPreview.value = false
  } catch (error: any) {
    console.error('Upload error:', error)
    
    emit('uploadError', error.message)
    
    toast({
      title: 'Upload Failed',
      description: error.message || 'Failed to upload photo. Please try again.',
      variant: 'destructive'
    })
  } finally {
    isUploading.value = false
    uploadProgress.value = 0
  }
}

// Remove photo
const removePhoto = () => {
  selectedFile.value = null
  previewUrl.value = null
  showPreview.value = false
  
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
  
  emit('photoRemoved')
  
  toast({
    title: 'Photo Removed',
    description: 'Profile photo has been removed',
    variant: 'success'
  })
}

// Cancel preview
const cancelPreview = () => {
  selectedFile.value = null
  previewUrl.value = null
  showPreview.value = false
  
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

// Trigger file input
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

// Format file size
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<template>
  <div class="space-y-4">
    <!-- Current Photo Display -->
    <div class="flex items-center justify-center">
      <div class="relative">
        <Avatar class="h-32 w-32">
          <AvatarImage 
            :src="currentPhotoUrl || undefined" 
            :alt="userName || 'Profile photo'" 
          />
          <AvatarFallback class="text-2xl">
            {{ userInitials }}
          </AvatarFallback>
        </Avatar>
        
        <!-- Remove Photo Button -->
        <Button
          v-if="currentPhotoUrl && !showPreview"
          @click="removePhoto"
          size="sm"
          variant="destructive"
          class="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0"
        >
          <X class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <!-- Upload Area -->
    <Card 
      v-if="!showPreview"
      class="border-dashed transition-colors duration-200"
      :class="{
        'border-primary bg-primary/5': isDragging,
        'border-gray-300 dark:border-gray-600': !isDragging
      }"
    >
      <CardContent 
        class="p-8"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
        @drop="handleDrop"
      >
        <div class="text-center space-y-4">
          <div class="flex justify-center">
            <div class="p-4 rounded-full bg-muted">
              <Upload class="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          
          <div class="space-y-2">
            <h3 class="font-medium">Upload Profile Photo</h3>
            <p class="text-sm text-muted-foreground">
              Drag and drop your photo here, or click to browse
            </p>
          </div>
          
          <div class="space-y-2">
            <Button 
              @click="triggerFileInput"
              variant="outline"
              class="flex items-center gap-2"
            >
              <Camera class="h-4 w-4" />
              Choose Photo
            </Button>
            
            <p class="text-xs text-muted-foreground">
              Supported formats: JPEG, PNG, WebP (max {{ maxSize }}MB)
            </p>
          </div>
        </div>
        
        <!-- Hidden file input -->
        <input
          ref="fileInputRef"
          type="file"
          :accept="allowedTypes.join(',')"
          class="hidden"
          @change="handleFileInput"
        />
      </CardContent>
    </Card>

    <!-- Photo Preview -->
    <Card v-if="showPreview && selectedFile">
      <CardContent class="p-6 space-y-4">
        <div class="text-center space-y-4">
          <h3 class="font-medium">Preview New Photo</h3>
          
          <!-- Preview Image -->
          <div class="flex justify-center">
            <div class="relative">
              <img 
                :src="previewUrl || undefined"
                :alt="selectedFile.name"
                class="h-48 w-48 object-cover rounded-full border-4 border-primary"
              />
            </div>
          </div>
          
          <!-- File Info -->
          <div class="space-y-1 text-sm text-muted-foreground">
            <p><strong>File:</strong> {{ selectedFile.name }}</p>
            <p><strong>Size:</strong> {{ formatFileSize(selectedFile.size) }}</p>
            <p><strong>Type:</strong> {{ selectedFile.type }}</p>
          </div>
          
          <!-- Upload Progress -->
          <div v-if="isUploading" class="space-y-2">
            <div class="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div 
                class="bg-primary h-2 rounded-full transition-all duration-300"
                :style="`width: ${uploadProgress}%`"
              ></div>
            </div>
            <p class="text-sm text-muted-foreground">
              Uploading... {{ uploadProgress }}%
            </p>
          </div>
          
          <!-- Action Buttons -->
          <div class="flex justify-center gap-2">
            <Button 
              @click="uploadPhoto"
              :disabled="isUploading"
              class="flex items-center gap-2"
            >
              <Check class="h-4 w-4" />
              {{ isUploading ? 'Uploading...' : 'Confirm Upload' }}
            </Button>
            <Button 
              @click="cancelPreview"
              variant="outline"
              :disabled="isUploading"
            >
              Cancel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Upload Guidelines -->
    <Alert>
      <ImageIcon class="h-4 w-4" />
      <AlertDescription>
        <strong>Photo Guidelines:</strong> Use a clear, professional headshot with good lighting. 
        Square images work best. Avoid group photos or images with text overlays.
      </AlertDescription>
    </Alert>

    <!-- Error State -->
    <Alert v-if="!currentPhotoUrl && !showPreview" variant="destructive">
      <AlertTriangle class="h-4 w-4" />
      <AlertDescription>
        <strong>No profile photo:</strong> Adding a professional photo increases your profile visibility 
        and helps build trust with potential mentees.
      </AlertDescription>
    </Alert>
  </div>
</template>

<style scoped>
.drag-over {
  @apply border-primary bg-primary/10;
}
</style> 