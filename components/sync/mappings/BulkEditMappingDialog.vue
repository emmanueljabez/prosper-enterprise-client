<template>
  <DialogContent class="sm:max-w-[900px]">
    <DialogHeader>
      <DialogTitle>Bulk Edit Mappings</DialogTitle>
      <DialogDescription>
        Edit multiple mappings at once. Changes will apply to all {{ selectedMappings.length }} selected mappings.
      </DialogDescription>
    </DialogHeader>

    <div class="py-4 space-y-6">
      <!-- Selected Mappings Summary -->
      <div class="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="selectedMappings.length === 0">
              <TableCell colSpan="4" class="text-center py-4">
                No mappings selected
              </TableCell>
            </TableRow>
            <TableRow 
              v-for="mapping in paginatedMappings" 
              :key="mapping.id"
            >
              <TableCell>
                <div class="font-medium">{{ mapping.itemName }}</div>
                <div class="text-xs text-muted-foreground">{{ mapping.itemSku }}</div>
              </TableCell>
              <TableCell>
                <div class="font-medium">{{ mapping.productName }}</div>
                <div class="text-xs text-muted-foreground">{{ mapping.productSku }}</div>
              </TableCell>
              <TableCell>
                <Badge :variant="mapping.mappingType === 'manual' ? 'outline' : 'secondary'">
                  {{ formatMappingType(mapping.mappingType) }}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge :variant="getSyncStatusVariant(mapping.syncStatus)">
                  {{ formatSyncStatus(mapping.syncStatus) }}
                </Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      
      <!-- Pagination if many items selected -->
      <div v-if="selectedMappings.length > maxPerPage" class="flex items-center justify-center gap-2 text-sm">
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage <= 1"
          @click="currentPage--"
        >
          Previous
        </Button>
        <span class="text-muted-foreground">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage >= totalPages"
          @click="currentPage++"
        >
          Next
        </Button>
      </div>
      
      <Separator />
      
      <!-- Bulk Edit Form -->
      <div class="space-y-5">
        <div class="text-lg font-medium">Edit Properties</div>
        
        <!-- Mapping Type -->
        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <Checkbox 
              id="edit-mapping-type" 
              v-model="editFields.mappingType.enabled"
            />
            <Label for="edit-mapping-type">Mapping Type</Label>
          </div>
          
          <div v-if="editFields.mappingType.enabled" class="ml-6">
            <RadioGroup v-model="editFields.mappingType.value" class="flex space-x-4">
              <div class="flex items-center space-x-2">
                <RadioGroupItem value="manual" id="bulk-manual" />
                <Label for="bulk-manual">Manual Mapping</Label>
              </div>
              <div class="flex items-center space-x-2">
                <RadioGroupItem value="automatic" id="bulk-automatic" />
                <Label for="bulk-automatic">Automatic Mapping</Label>
              </div>
            </RadioGroup>
            <p class="text-xs text-muted-foreground mt-1">
              Manual mappings are maintained by users, automatic mappings can be updated by the system.
            </p>
          </div>
        </div>
        
        <!-- Sync Schedule -->
        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <Checkbox 
              id="edit-sync-schedule" 
              v-model="editFields.syncSchedule.enabled"
            />
            <Label for="edit-sync-schedule">Sync Schedule</Label>
          </div>
          
          <div v-if="editFields.syncSchedule.enabled" class="ml-6">
            <Select v-model="editFields.syncSchedule.value">
              <SelectTrigger>
                <SelectValue placeholder="Select sync frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="realtime">Real-time</SelectItem>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="manual">Manual Only</SelectItem>
              </SelectContent>
            </Select>
            <p class="text-xs text-muted-foreground mt-1">
              How often should these mappings be synchronized automatically.
            </p>
          </div>
        </div>
        
        <!-- Sync Options -->
        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <Checkbox 
              id="edit-sync-options" 
              v-model="editFields.syncOptions.enabled"
            />
            <Label for="edit-sync-options">Sync Options</Label>
          </div>
          
          <div v-if="editFields.syncOptions.enabled" class="ml-6">
            <Card>
              <CardContent class="pt-6 space-y-4">
                <div class="flex items-center justify-between">
                  <div class="space-y-0.5">
                    <Label for="bulk-inventory">Inventory Levels</Label>
                    <p class="text-xs text-muted-foreground">Sync stock quantities between inventory and catalog</p>
                  </div>
                  <Switch
                    id="bulk-inventory"
                    v-model="editFields.syncOptions.value.inventory"
                  />
                </div>
                
                <Separator />
                
                <div class="flex items-center justify-between">
                  <div class="space-y-0.5">
                    <Label for="bulk-pricing">Pricing</Label>
                    <p class="text-xs text-muted-foreground">Sync prices between inventory and catalog</p>
                  </div>
                  <Switch
                    id="bulk-pricing"
                    v-model="editFields.syncOptions.value.pricing"
                  />
                </div>
                
                <Separator />
                
                <div class="flex items-center justify-between">
                  <div class="space-y-0.5">
                    <Label for="bulk-metadata">Metadata</Label>
                    <p class="text-xs text-muted-foreground">Sync descriptions, attributes, and other metadata</p>
                  </div>
                  <Switch
                    id="bulk-metadata"
                    v-model="editFields.syncOptions.value.metadata"
                  />
                </div>
                
                <Separator />
                
                <div class="flex items-center justify-between">
                  <div class="space-y-0.5">
                    <Label for="bulk-bidirectional">Bidirectional Sync</Label>
                    <p class="text-xs text-muted-foreground">Changes in either system will update the other</p>
                  </div>
                  <Switch
                    id="bulk-bidirectional"
                    v-model="editFields.syncOptions.value.bidirectional"
                  />
                </div>
              </CardContent>
            </Card>
            
            <p v-if="errors.syncOptions" class="text-sm text-destructive mt-2">{{ errors.syncOptions }}</p>
          </div>
        </div>
      </div>
      
      <!-- Notes Field -->
      <div class="space-y-2">
        <div class="flex items-center space-x-2">
          <Checkbox 
            id="edit-notes" 
            v-model="editFields.notes.enabled"
          />
          <Label for="edit-notes">Notes</Label>
        </div>
        
        <div v-if="editFields.notes.enabled" class="ml-6">
          <Textarea
            v-model="editFields.notes.value"
            placeholder="Add notes to all selected mappings..."
            rows="3"
          />
          <p class="text-xs text-muted-foreground mt-1">
            This will overwrite any existing notes in the selected mappings.
          </p>
        </div>
      </div>
      
      <!-- Warning if no fields selected -->
      <Alert v-if="!hasSelectedFields" variant="warning">
        <AlertTriangleIcon class="h-4 w-4" />
        <AlertTitle>No changes selected</AlertTitle>
        <AlertDescription>
          Please select at least one field to update.
        </AlertDescription>
      </Alert>
    </div>

    <DialogFooter>
      <Button
        variant="outline"
        @click="emit('close')"
      >
        Cancel
      </Button>
      <Button
        @click="applyChanges"
        :disabled="isSubmitting || !hasSelectedFields"
      >
        <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
        Apply to {{ selectedMappings.length }} Mappings
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2Icon, AlertTriangleIcon } from 'lucide-vue-next'

const props = defineProps({
  selectedMappings: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['mappings-updated', 'close'])

// Form state
const editFields = reactive({
  mappingType: {
    enabled: false,
    value: 'manual'
  },
  syncSchedule: {
    enabled: false,
    value: 'realtime'
  },
  syncOptions: {
    enabled: false,
    value: {
      inventory: true,
      pricing: true,
      metadata: false,
      bidirectional: false
    }
  },
  notes: {
    enabled: false,
    value: ''
  }
})

const errors = reactive({})
const isSubmitting = ref(false)

// Pagination for large numbers of selected mappings
const maxPerPage = 5
const currentPage = ref(1)

const totalPages = computed(() => {
  return Math.ceil(props.selectedMappings.length / maxPerPage)
})

const paginatedMappings = computed(() => {
  const start = (currentPage.value - 1) * maxPerPage
  const end = start + maxPerPage
  return props.selectedMappings.slice(start, end)
})

const hasSelectedFields = computed(() => {
  return (
    editFields.mappingType.enabled ||
    editFields.syncSchedule.enabled ||
    editFields.syncOptions.enabled ||
    editFields.notes.enabled
  )
})

// Helper functions
function formatMappingType(type) {
  if (type === 'manual') return 'Manual'
  if (type === 'automatic') return 'Automatic'
  return type
}

function formatSyncStatus(status) {
  const statusMap = {
    'synced': 'Synced',
    'out_of_sync': 'Out of Sync',
    'pending': 'Pending',
    'error': 'Error'
  }
  return statusMap[status] || status
}

function getSyncStatusVariant(status) {
  const variantMap = {
    'synced': 'success',
    'out_of_sync': 'warning',
    'pending': 'secondary',
    'error': 'destructive'
  }
  return variantMap[status] || 'outline'
}

function validateForm() {
  Object.keys(errors).forEach(key => {
    delete errors[key]
  })
  
  // If sync options are enabled, validate that at least one is selected
  if (editFields.syncOptions.enabled) {
    const options = editFields.syncOptions.value
    if (!options.inventory && !options.pricing && !options.metadata) {
      errors.syncOptions = 'At least one sync option must be enabled'
      return false
    }
  }
  
  return true
}

async function applyChanges() {
  if (!validateForm() || !hasSelectedFields.value) return
  
  isSubmitting.value = true
  
  try {
    // Create an object with only the fields to update
    const updates = {}
    
    if (editFields.mappingType.enabled) {
      updates.mappingType = editFields.mappingType.value
    }
    
    if (editFields.syncSchedule.enabled) {
      updates.syncSchedule = editFields.syncSchedule.value
    }
    
    if (editFields.syncOptions.enabled) {
      updates.syncOptions = { ...editFields.syncOptions.value }
    }
    
    if (editFields.notes.enabled) {
      updates.notes = editFields.notes.value
    }
    
    // Set status to pending for re-sync
    updates.syncStatus = 'pending'
    
    emit('mappings-updated', props.selectedMappings, updates)
  } catch (error) {
    console.error('Error updating mappings:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>