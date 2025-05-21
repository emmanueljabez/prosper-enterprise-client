<template>
  <DialogContent>
    <DialogHeader>
      <DialogTitle class="text-destructive">Delete Bundle</DialogTitle>
      <DialogDescription>
        Are you sure you want to delete this bundle? This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    
    <div class="py-4">
      <!-- Bundle Info -->
      <div class="flex items-start gap-4 p-4 border rounded-lg mb-4">
        <div class="h-14 w-14 rounded-md border bg-muted flex items-center justify-center overflow-hidden">
          <img
            v-if="getBundleImage()"
            :src="getBundleImage()"
            :alt="bundle.name"
            class="h-full w-full object-cover"
          />
          <PackageIcon v-else class="h-6 w-6 text-muted-foreground" />
        </div>
        
        <div class="flex-1">
          <h3 class="font-semibold">{{ bundle.name }}</h3>
          <p class="text-sm text-muted-foreground">SKU: {{ bundle.sku }}</p>
          <div class="mt-1 flex items-center gap-2">
            <Badge>{{ bundle.bundleItems?.length || 0 }} components</Badge>
            <Badge variant="outline">{{ formatPrice(bundle.price) }}</Badge>
            <Badge :variant="getStatusVariant(bundle.status)">
              {{ formatStatus(bundle.status) }}
            </Badge>
          </div>
        </div>
      </div>
      
      <!-- Warning Message -->
      <Alert variant="destructive">
        <AlertCircleIcon class="h-4 w-4" />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>
          Deleting this bundle will remove it from all sales channels and catalogs.
          Customer orders containing this bundle will not be affected.
        </AlertDescription>
      </Alert>
      
      <!-- Confirmation Checkbox -->
      <div class="flex items-center space-x-2 mt-4">
        <Checkbox 
          id="confirm-delete" 
          v-model="confirmDelete"
          :disabled="isDeleting"
        />
        <Label 
          for="confirm-delete" 
          class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          I understand this action cannot be undone
        </Label>
      </div>
    </div>
    
    <DialogFooter>
      <Button 
        variant="outline" 
        @click="$emit('close')"
        :disabled="isDeleting"
      >
        Cancel
      </Button>
      <Button 
        variant="destructive" 
        @click="handleDelete"
        :disabled="!confirmDelete || isDeleting"
      >
        <Loader2Icon v-if="isDeleting" class="mr-2 h-4 w-4 animate-spin" />
        Delete Bundle
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref } from 'vue'
import { 
  AlertCircleIcon,
  Loader2Icon,
  PackageIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Alert,
  AlertTitle,
  AlertDescription
} from '@/components/ui/alert'

const props = defineProps({
  bundle: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['delete', 'close'])

const confirmDelete = ref(false)
const isDeleting = ref(false)

// Methods
function formatPrice(price) {
  if (price === undefined || price === null) return '-'
  return `$${parseFloat(price).toFixed(2)}`
}

function formatStatus(status) {
  if (!status) return 'Unknown'
  
  const statusMap = {
    'active': 'Active',
    'inactive': 'Inactive',
    'draft': 'Draft',
    'archived': 'Archived'
  }
  
  return statusMap[status] || status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function getStatusVariant(status) {
  const variants = {
    'active': 'success',
    'inactive': 'warning',
    'draft': 'secondary',
    'archived': 'outline'
  }
  return variants[status] || 'default'
}

function getBundleImage() {
  if (!props.bundle.images || !Array.isArray(props.bundle.images) || props.bundle.images.length === 0) {
    return null
  }
  
  const defaultImage = props.bundle.images.find(img => img.isDefault)
  return defaultImage ? defaultImage.url : props.bundle.images[0].url
}

function handleDelete() {
  if (!confirmDelete.value) return
  
  isDeleting.value = true
  
  // Simulate API call delay
  setTimeout(() => {
    emit('delete', props.bundle)
    isDeleting.value = false
  }, 1000)
}
</script>