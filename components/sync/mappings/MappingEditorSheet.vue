<template>
  <SheetContent class="sm:max-w-lg flex flex-col h-full overflow-hidden">
    <SheetHeader class="flex-shrink-0">
      <SheetTitle>Edit Mapping</SheetTitle>
      <SheetDescription>
        Update the connection between inventory item and catalog product
      </SheetDescription>
    </SheetHeader>

    <div class="flex-1 overflow-y-auto py-6 px-1">
      <form @submit.prevent="saveMapping" class="space-y-6">
        <!-- Mapping Info (Read-only) -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium">Mapping Details</h3>
            <Badge :variant="getSyncStatusVariant(mapping.syncStatus)">
              {{ formatSyncStatus(mapping.syncStatus) }}
            </Badge>
          </div>
          
          <div class="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/20">
            <div class="space-y-1">
              <p class="text-sm font-medium">Item</p>
              <p class="text-sm">{{ mapping.itemName }}</p>
              <p class="text-xs text-muted-foreground">{{ mapping.itemSku }}</p>
            </div>
            <div class="space-y-1">
              <p class="text-sm font-medium">Product</p>
              <p class="text-sm">{{ mapping.productName }}</p>
              <p class="text-xs text-muted-foreground">{{ mapping.productSku }}</p>
            </div>
          </div>
          
          <div class="text-xs text-muted-foreground">
            <p>Items and products cannot be changed. Delete this mapping and create a new one instead.</p>
          </div>
        </div>

        <!-- Mapping Type -->
        <div class="space-y-3">
          <Label>Mapping Type</Label>
          <RadioGroup v-model="formData.mappingType" class="flex space-x-4">
            <div class="flex items-center space-x-2">
              <RadioGroupItem value="manual" id="edit-manual" />
              <Label for="edit-manual">Manual Mapping</Label>
            </div>
            <div class="flex items-center space-x-2">
              <RadioGroupItem value="automatic" id="edit-automatic" />
              <Label for="edit-automatic">Automatic Mapping</Label>
            </div>
          </RadioGroup>
          <p class="text-xs text-muted-foreground">
            Manual mappings are maintained by users, automatic mappings can be updated by the system.
          </p>
        </div>

        <!-- Sync Options -->
        <div class="space-y-3">
          <Label>Sync Options</Label>
          
          <Card>
            <CardContent class="pt-6 space-y-4">
              <div class="flex items-center justify-between">
                <div class="space-y-0.5">
                  <Label for="edit-inventory">Inventory Levels</Label>
                  <p class="text-xs text-muted-foreground">Sync stock quantities between inventory and catalog</p>
                </div>
                <Switch
                  id="edit-inventory"
                  v-model="formData.syncOptions.inventory"
                />
              </div>
              
              <Separator />
              
              <div class="flex items-center justify-between">
                <div class="space-y-0.5">
                  <Label for="edit-pricing">Pricing</Label>
                  <p class="text-xs text-muted-foreground">Sync prices between inventory and catalog</p>
                </div>
                <Switch
                  id="edit-pricing"
                  v-model="formData.syncOptions.pricing"
                />
              </div>
              
              <Separator />
              
              <div class="flex items-center justify-between">
                <div class="space-y-0.5">
                  <Label for="edit-metadata">Metadata</Label>
                  <p class="text-xs text-muted-foreground">Sync descriptions, attributes, and other metadata</p>
                </div>
                <Switch
                  id="edit-metadata"
                  v-model="formData.syncOptions.metadata"
                />
              </div>
              
              <Separator />
              
              <div class="flex items-center justify-between">
                <div class="space-y-0.5">
                  <Label for="edit-bidirectional">Bidirectional Sync</Label>
                  <p class="text-xs text-muted-foreground">Changes in either system will update the other</p>
                </div>
                <Switch
                  id="edit-bidirectional"
                  v-model="formData.syncOptions.bidirectional"
                />
              </div>
            </CardContent>
          </Card>
          
          <p v-if="errors.syncOptions" class="text-sm text-destructive">{{ errors.syncOptions }}</p>
        </div>

        <!-- Sync Schedule -->
        <div class="space-y-3">
          <Label>Sync Schedule</Label>
          <Select v-model="formData.syncSchedule">
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
          <p class="text-xs text-muted-foreground">
            How often should this mapping be synchronized automatically.
          </p>
        </div>

        <!-- Notes -->
        <div class="space-y-3">
          <Label for="edit-notes">Notes</Label>
          <Textarea
            id="edit-notes"
            v-model="formData.notes"
            placeholder="Add any notes about this mapping..."
            rows="3"
          />
        </div>
      </form>
    </div>

    <SheetFooter class="flex-shrink-0 border-t pt-4">
      <div class="flex justify-between w-full">
        <Button
          variant="outline"
          class="text-destructive border-destructive hover:bg-destructive/10"
          @click="confirmDelete"
        >
          <TrashIcon class="h-4 w-4 mr-2" />
          Delete
        </Button>
        
        <div>
          <Button
            variant="outline"
            class="mr-2"
            @click="emit('close')"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            @click="saveMapping"
            :disabled="isSubmitting || !hasChanges"
          >
            <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
            Save Changes
          </Button>
        </div>
      </div>
    </SheetFooter>
    
    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="showDeleteConfirm">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Mapping</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this mapping? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div class="py-4">
          <div class="rounded-lg border p-3 bg-muted/20">
            <p><strong>{{ mapping.itemName }}</strong> ↔ <strong>{{ mapping.productName }}</strong></p>
            <p class="text-sm text-muted-foreground">{{ mapping.itemSku }} ↔ {{ mapping.productSku }}</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showDeleteConfirm = false">
            Cancel
          </Button>
          <Button variant="destructive" @click="deleteMapping">
            <TrashIcon class="h-4 w-4 mr-2" />
            Delete Mapping
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </SheetContent>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import {
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Loader2Icon, TrashIcon } from 'lucide-vue-next'

const props = defineProps({
  mapping: {
    type: Object,
    required: true
  },
  items: {
    type: Array,
    default: () => []
  },
  products: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['mapping-updated', 'mapping-deleted', 'close'])

// Form state
const formData = reactive({
  mappingType: props.mapping.mappingType || 'manual',
  syncSchedule: props.mapping.syncSchedule || 'realtime',
  syncOptions: {
    inventory: props.mapping.syncOptions?.inventory ?? true,
    pricing: props.mapping.syncOptions?.pricing ?? true,
    metadata: props.mapping.syncOptions?.metadata ?? false,
    bidirectional: props.mapping.syncOptions?.bidirectional ?? false
  },
  notes: props.mapping.notes || ''
})

const errors = reactive({})
const isSubmitting = ref(false)
const showDeleteConfirm = ref(false)

// Computed properties
const hasChanges = computed(() => {
  // Check if any form data differs from the original mapping
  if (formData.mappingType !== props.mapping.mappingType) return true
  if (formData.syncSchedule !== props.mapping.syncSchedule) return true
  if (formData.notes !== props.mapping.notes) return true
  
  // Check sync options
  const originalOptions = props.mapping.syncOptions || {}
  if (formData.syncOptions.inventory !== originalOptions.inventory) return true
  if (formData.syncOptions.pricing !== originalOptions.pricing) return true
  if (formData.syncOptions.metadata !== originalOptions.metadata) return true
  if (formData.syncOptions.bidirectional !== originalOptions.bidirectional) return true
  
  return false
})

// Helper functions
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

// Event handlers
function validateForm() {
  errors = {}
  
  // Check that at least one sync option is enabled
  if (!formData.syncOptions.inventory && 
      !formData.syncOptions.pricing && 
      !formData.syncOptions.metadata) {
    errors.syncOptions = 'At least one sync option must be enabled'
    return false
  }
  
  return true
}

async function saveMapping() {
  if (!validateForm()) return
  
  isSubmitting.value = true
  
  try {
    const updatedMapping = {
      ...props.mapping,
      mappingType: formData.mappingType,
      syncSchedule: formData.syncSchedule,
      syncOptions: { ...formData.syncOptions },
      notes: formData.notes,
      // When updating, set status to pending for re-sync
      syncStatus: 'pending'
    }
    
    emit('mapping-updated', updatedMapping)
  } catch (error) {
    console.error('Error updating mapping:', error)
  } finally {
    isSubmitting.value = false
  }
}

function confirmDelete() {
  showDeleteConfirm.value = true
}

function deleteMapping() {
  emit('mapping-deleted', props.mapping)
  showDeleteConfirm.value = false
}
</script>