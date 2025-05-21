<template>
  <DialogContent class="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Update Bundle Status</DialogTitle>
      <DialogDescription>
        Change the status of "{{ bundle.name }}" to control its visibility and availability.
      </DialogDescription>
    </DialogHeader>
    
    <div class="py-4 space-y-4">
      <!-- Bundle Info Summary -->
      <div class="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
        <div class="h-12 w-12 rounded-md border bg-muted flex items-center justify-center overflow-hidden">
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
          <Badge :variant="getStatusVariant(bundle.status)">
            {{ formatStatus(bundle.status) }}
          </Badge>
        </div>
      </div>
      
      <!-- Status Options -->
      <div class="space-y-3">
        <Label class="text-base">New Status</Label>
        
        <RadioGroup v-model="selectedStatus" class="grid grid-cols-1 gap-2">
          <div
            v-for="status in statusOptions" 
            :key="status.value"
            class="flex items-center space-x-2 border rounded-md p-3 cursor-pointer"
            :class="{
              'bg-muted/50 border-primary': selectedStatus === status.value,
              'hover:bg-muted/30': selectedStatus !== status.value
            }"
            @click="selectedStatus = status.value"
          >
            <RadioGroupItem 
              :value="status.value" 
              :id="`status-${status.value}`"
            />
            <div class="grid gap-0.5">
              <Label :for="`status-${status.value}`" class="font-medium cursor-pointer">
                <Badge :variant="getStatusVariant(status.value)" class="mr-2">
                  {{ status.label }}
                </Badge>
              </Label>
              <p class="text-sm text-muted-foreground">{{ status.description }}</p>
            </div>
          </div>
        </RadioGroup>
      </div>
      
      <!-- Status Change Warning -->
      <Alert v-if="showWarning" variant="warning">
        <AlertCircleIcon class="h-4 w-4" />
        <AlertTitle>Status Change Warning</AlertTitle>
        <AlertDescription>
          {{ warningMessage }}
        </AlertDescription>
      </Alert>
    </div>
    
    <DialogFooter>
      <Button variant="outline" @click="$emit('close')" :disabled="isUpdating">
        Cancel
      </Button>
      <Button 
        @click="updateStatus" 
        :disabled="selectedStatus === bundle.status || isUpdating"
      >
        <Loader2Icon v-if="isUpdating" class="mr-2 h-4 w-4 animate-spin" />
        Update Status
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  AlertCircleIcon,
  Loader2Icon,
  PackageIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import {
  RadioGroup,
  RadioGroupItem
} from '@/components/ui/radio-group'

const props = defineProps({
  bundle: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['status-updated', 'close'])

// State
const selectedStatus = ref(props.bundle.status || 'draft')
const isUpdating = ref(false)

// Status options
const statusOptions = [
  {
    value: 'active',
    label: 'Active',
    description: 'Bundle is visible and available for purchase'
  },
  {
    value: 'inactive',
    label: 'Inactive',
    description: 'Bundle is hidden but can be reactivated easily'
  },
  {
    value: 'draft',
    label: 'Draft',
    description: 'Bundle is not ready and hidden from all channels'
  },
  {
    value: 'archived',
    label: 'Archived',
    description: 'Bundle is no longer sold but kept for reference'
  }
]

// Computed
const showWarning = computed(() => {
  return selectedStatus.value !== props.bundle.status && 
         (props.bundle.status === 'active' || selectedStatus.value === 'archived')
})

const warningMessage = computed(() => {
  if (props.bundle.status === 'active' && selectedStatus.value !== 'active') {
    return 'Changing from Active status will hide this bundle from customers and may affect current sales.'
  }
  
  if (selectedStatus.value === 'archived') {
    return 'Archiving this bundle will remove it from all sales channels. This is typically done for discontinued items.'
  }
  
  return ''
})

// Methods
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

function updateStatus() {
  if (selectedStatus.value === props.bundle.status) return
  
  isUpdating.value = true
  
  // Create an updated bundle object
  const updatedBundle = {
    ...props.bundle,
    status: selectedStatus.value
  }
  
  // Simulate API call
  setTimeout(() => {
    emit('status-updated', updatedBundle)
    isUpdating.value = false
  }, 800)
}
</script>