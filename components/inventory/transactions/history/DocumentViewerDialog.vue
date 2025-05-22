<template>
  <DialogContent class="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
    <DialogHeader class="flex-shrink-0">
      <DialogTitle class="truncate">{{ document.name }}</DialogTitle>
      <DialogDescription v-if="document.description" class="text-xs">
        {{ document.description }}
      </DialogDescription>
    </DialogHeader>
    
    <div class="overflow-y-auto flex-grow" v-if="document">
      <!-- Document metadata -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <span class="font-semibold text-sm">Type:</span>
            <Badge variant="outline" class="capitalize">{{ document.type.replace(/_/g, ' ') }}</Badge>
          </div>
          <div class="flex items-center gap-2">
            <span class="font-semibold text-sm">Uploaded:</span>
            <span class="text-sm">{{ formatDate(document.createdAt) }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="font-semibold text-sm">Size:</span>
            <span class="text-sm">{{ formatSize(document.size) }}</span>
          </div>
          <div class="flex items-center gap-2" v-if="document.fileType">
            <span class="font-semibold text-sm">Format:</span>
            <span class="text-sm">{{ document.fileType }}</span>
          </div>
        </div>
        
        <div class="space-y-2" v-if="document.transactionReference || document.locationId">
          <div class="flex items-center gap-2" v-if="document.transactionReference">
            <span class="font-semibold text-sm">Transaction:</span>
            <span class="text-sm">{{ document.transactionReference }}</span>
          </div>
          <div class="flex items-center gap-2" v-if="document.locationId">
            <span class="font-semibold text-sm">Location:</span>
            <span class="text-sm">{{ document.locationId }}</span>
          </div>
          <div class="flex items-center gap-2" v-if="document.createdBy">
            <span class="font-semibold text-sm">Added by:</span>
            <span class="text-sm">{{ document.createdBy }}</span>
          </div>
          <div v-if="document.tags && document.tags.length > 0" class="flex flex-wrap gap-1 mt-2">
            <Badge 
              v-for="tag in document.tags" 
              :key="tag" 
              variant="secondary"
              class="text-xs"
            >
              {{ tag }}
            </Badge>
          </div>
        </div>
      </div>
      
      <!-- Preview section -->
      <div class="mt-4">
        <div class="font-semibold text-sm mb-2">Preview:</div>
        
        <!-- Document preview based on type -->
        <div class="rounded border bg-muted/30 min-h-[150px] flex items-center justify-center">
          <!-- Image preview -->
          <img 
            v-if="isImage && document.url" 
            :src="document.url" 
            alt="Document preview" 
            class="max-w-full max-h-[50vh] object-contain rounded"
          />
          
          <!-- PDF preview with thumbnail -->
          <div v-else-if="isPdf && document.thumbnail" class="text-center p-4">
            <img 
              :src="document.thumbnail" 
              alt="PDF preview" 
              class="max-w-full max-h-[40vh] object-contain mx-auto rounded"
            />
            <div class="mt-2">
              <Button size="sm" asChild class="mr-2">
                <a :href="document.url" target="_blank" rel="noopener">Open PDF</a>
              </Button>
            </div>
          </div>
          
          <!-- Generic file with thumbnail -->
          <div v-else-if="document.thumbnail" class="text-center p-4">
            <img 
              :src="document.thumbnail" 
              alt="Document thumbnail" 
              class="max-w-full max-h-[40vh] object-contain mx-auto rounded"
            />
          </div>
          
          <!-- No preview available -->
          <div v-else class="text-center p-8">
            <FileIcon class="h-12 w-12 mb-2 mx-auto text-muted-foreground" />
            <p class="text-muted-foreground text-sm">No preview available for this document type</p>
            <Button size="sm" asChild class="mt-2">
              <a :href="document.url" target="_blank" rel="noopener">Open in new tab</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
    
    <DialogFooter class="flex-shrink-0 mt-4">
      <Button variant="outline" @click="$emit('close')">Close</Button>
      <Button @click="$emit('download', document)">
        <DownloadIcon class="mr-2 h-4 w-4" />Download
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { computed } from 'vue'
import { format } from 'date-fns'
import { 
  FileIcon, 
  DownloadIcon 
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'

const props = defineProps({
  document: { type: Object, required: true }
})

const emit = defineEmits(['close', 'download'])

// Determine file type for preview handling
const isImage = computed(() => {
  const fileType = props.document.fileType?.toLowerCase() || '';
  return fileType.includes('image') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(props.document.name);
});

const isPdf = computed(() => {
  const fileType = props.document.fileType?.toLowerCase() || '';
  return fileType.includes('pdf') || props.document.name.toLowerCase().endsWith('.pdf');
});

function formatDate(date) {
  if (!date) return '—'
  return format(new Date(date), 'yyyy-MM-dd HH:mm')
}

function formatSize(size) {
  if (!size) return '—'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`
  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`
}
</script>