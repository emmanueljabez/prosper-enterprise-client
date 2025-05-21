<template>
  <DialogContent class="sm:max-w-[650px]">
    <DialogHeader>
      <DialogTitle>Bulk Edit Bundles</DialogTitle>
      <DialogDescription>
        Apply changes to {{ selectedBundles.length }} selected bundles
      </DialogDescription>
    </DialogHeader>

    <div class="py-4 space-y-6">
      <!-- Selected Bundles List -->
      <div>
        <h3 class="text-sm font-medium mb-2">Selected Bundles</h3>
        <div class="border rounded-md p-2 max-h-[120px] overflow-y-auto">
          <div class="flex flex-wrap gap-2">
            <Badge 
              v-for="bundle in selectedBundles" 
              :key="bundle.id"
              variant="secondary"
              class="py-1"
            >
              {{ bundle.name }}
            </Badge>
          </div>
        </div>
      </div>

      <!-- Bulk Edit Form -->
      <div class="space-y-6">
        <div class="grid grid-cols-1 gap-6">
          <!-- Status -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <Label>Status</Label>
              <div class="flex items-center space-x-2">
                <Checkbox id="apply-status" v-model:checked="applyStatus" />
                <Label for="apply-status" class="text-xs">Apply changes</Label>
              </div>
            </div>
            <Select 
              v-model="form.status"
              :disabled="!applyStatus"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Categories -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <Label>Categories</Label>
              <div class="flex items-center space-x-2">
                <Checkbox id="apply-categories" v-model:checked="applyCategories" />
                <Label for="apply-categories" class="text-xs">Apply changes</Label>
              </div>
            </div>
            <div class="space-y-2">
              <Select 
                v-model="form.categoryAction"
                :disabled="!applyCategories"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="replace">Replace with selected</SelectItem>
                  <SelectItem value="add">Add selected</SelectItem>
                  <SelectItem value="remove">Remove selected</SelectItem>
                </SelectContent>
              </Select>
              
              <!-- Vue Multiselect for categories -->
              <Multiselect
                v-model="form.categories"
                :options="categoriesOptions"
                :multiple="true"
                :close-on-select="false"
                :clear-on-select="false"
                :preserve-search="true"
                placeholder="Select categories"
                label="label"
                track-by="value"
                :disabled="!applyCategories"
                :internal-search="true"
                :show-labels="false"
                class="multiselect-custom"
              >
                <template #tag="{ option, remove }">
                  <span class="multiselect__tag">
                    <span>{{ option.label }}</span>
                    <i class="multiselect__tag-icon" @click="remove(option)"></i>
                  </span>
                </template>
                <template #option="{ option }">
                  <span>{{ option.label }}</span>
                </template>
              </Multiselect>
            </div>
          </div>

          <!-- Visibility -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <Label>Visibility</Label>
              <div class="flex items-center space-x-2">
                <Checkbox id="apply-visibility" v-model:checked="applyVisibility" />
                <Label for="apply-visibility" class="text-xs">Apply changes</Label>
              </div>
            </div>
            <div class="space-y-2 pl-1" :class="{ 'opacity-50': !applyVisibility }">
              <div class="flex items-center space-x-2">
                <Checkbox 
                  id="webstore-visibility" 
                  v-model="form.visibility.webstore" 
                  :disabled="!applyVisibility"
                  :indeterminate="!form.visibility.setWebstore"
                  @update:checked="form.visibility.setWebstore = true"
                />
                <Label 
                  for="webstore-visibility" 
                  class="cursor-pointer"
                  @click="handleVisibilityClick('webstore')"
                >
                  Web Store
                </Label>
              </div>
              
              <div class="flex items-center space-x-2">
                <Checkbox 
                  id="b2b-visibility" 
                  v-model="form.visibility.b2bPortal" 
                  :disabled="!applyVisibility"
                  :indeterminate="!form.visibility.setB2bPortal"
                  @update:checked="form.visibility.setB2bPortal = true"
                />
                <Label 
                  for="b2b-visibility" 
                  class="cursor-pointer"
                  @click="handleVisibilityClick('b2bPortal')"
                >
                  B2B Portal
                </Label>
              </div>
              
              <div class="flex items-center space-x-2">
                <Checkbox 
                  id="marketplace-visibility" 
                  v-model="form.visibility.marketplace" 
                  :disabled="!applyVisibility"
                  :indeterminate="!form.visibility.setMarketplace"
                  @update:checked="form.visibility.setMarketplace = true"
                />
                <Label 
                  for="marketplace-visibility" 
                  class="cursor-pointer"
                  @click="handleVisibilityClick('marketplace')"
                >
                  Marketplace
                </Label>
              </div>
            </div>
          </div>

          <!-- Inventory Settings -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <Label>Inventory Settings</Label>
              <div class="flex items-center space-x-2">
                <Checkbox id="apply-inventory" v-model:checked="applyInventory" />
                <Label for="apply-inventory" class="text-xs">Apply changes</Label>
              </div>
            </div>
            <div class="space-y-4 pl-1" :class="{ 'opacity-50': !applyInventory }">
              <div class="flex items-center space-x-2">
                <Checkbox 
                  id="dynamic-stock" 
                  v-model="form.inventory.dynamicStock" 
                  :disabled="!applyInventory"
                />
                <Label for="dynamic-stock">Use dynamic stock calculation</Label>
              </div>
              
              <div v-if="form.inventory.dynamicStock" class="space-y-4">
                <div class="space-y-2">
                  <Label for="min-component-quantity">Minimum Component Quantity</Label>
                  <Input 
                    id="min-component-quantity" 
                    v-model="form.inventory.minComponentQuantity" 
                    type="number" 
                    min="1"
                    :disabled="!applyInventory"
                  />
                </div>
                
                <div class="space-y-2">
                  <Label for="low-stock-threshold">Low Stock Threshold</Label>
                  <Input 
                    id="low-stock-threshold" 
                    v-model="form.inventory.lowStockThreshold" 
                    type="number" 
                    min="1"
                    :disabled="!applyInventory"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Warning if no changes are selected -->
      <Alert v-if="!hasChanges" variant="warning">
        <AlertCircleIcon class="h-4 w-4" />
        <AlertTitle>No changes selected</AlertTitle>
        <AlertDescription>
          Enable at least one field to apply changes
        </AlertDescription>
      </Alert>
      
      <!-- Success Message -->
      <Alert v-if="showSuccessAlert" variant="success">
        <CheckCircleIcon class="h-4 w-4" />
        <AlertTitle>Changes Applied</AlertTitle>
        <AlertDescription>
          Successfully updated {{ selectedBundles.length }} bundle{{ selectedBundles.length !== 1 ? 's' : '' }}.
        </AlertDescription>
      </Alert>
      
      <!-- Error Message -->
      <Alert v-if="showErrorAlert" variant="destructive">
        <XCircleIcon class="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{{ errorMessage }}</AlertDescription>
      </Alert>
    </div>

    <DialogFooter>
      <Button variant="outline" @click="$emit('close')" :disabled="isSubmitting">
        Cancel
      </Button>
      <Button 
        @click="applyChanges" 
        :disabled="isSubmitting || !hasChanges"
      >
        <Loader2Icon v-if="isSubmitting" class="h-4 w-4 mr-2 animate-spin" />
        Apply to {{ selectedBundles.length }} Bundles
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  Loader2Icon, 
  AlertCircleIcon, 
  CheckCircleIcon,
  XCircleIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.css'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const props = defineProps({
  selectedBundles: {
    type: Array,
    required: true
  },
  categories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['bundles-updated', 'close'])

// Which fields to apply
const applyStatus = ref(false)
const applyCategories = ref(false)
const applyVisibility = ref(false)
const applyInventory = ref(false)

// Form state
const form = ref({
  status: 'active',
  categoryAction: 'replace',
  categories: [],
  visibility: {
    webstore: true,
    b2bPortal: true,
    marketplace: false,
    setWebstore: false,
    setB2bPortal: false,
    setMarketplace: false
  },
  inventory: {
    dynamicStock: true,
    minComponentQuantity: 1,
    lowStockThreshold: 5
  }
})

// UI state
const isSubmitting = ref(false)
const showSuccessAlert = ref(false)
const showErrorAlert = ref(false)
const errorMessage = ref('')

// Computed
const categoriesOptions = computed(() => {
  return props.categories.map(category => ({
    value: category.id,
    label: category.name
  }))
})

const hasChanges = computed(() => {
  return applyStatus.value || applyCategories.value || applyVisibility.value || applyInventory.value
})

// Methods
function handleVisibilityClick(field) {
  if (!applyVisibility.value) return
  
  if (field === 'webstore') {
    form.value.visibility.setWebstore = true
    form.value.visibility.webstore = !form.value.visibility.webstore
  } else if (field === 'b2bPortal') {
    form.value.visibility.setB2bPortal = true
    form.value.visibility.b2bPortal = !form.value.visibility.b2bPortal
  } else if (field === 'marketplace') {
    form.value.visibility.setMarketplace = true
    form.value.visibility.marketplace = !form.value.visibility.marketplace
  }
}

function resetAlerts() {
  showSuccessAlert.value = false
  showErrorAlert.value = false
  errorMessage.value = ''
}

function applyChanges() {
  if (!hasChanges.value) return
  
  isSubmitting.value = true
  resetAlerts()
  
  // Prepare updates object
  const updates = {}
  
  if (applyStatus.value) {
    updates.status = form.value.status
  }
  
  if (applyCategories.value) {
    if (form.value.categoryAction === 'replace') {
      // Extract values from the selected options objects
      updates.categories = form.value.categories.map(option => option.value)
    } else {
      // For add/remove, we'll need to process per bundle
      updates.categoryAction = {
        action: form.value.categoryAction,
        categories: form.value.categories.map(option => option.value)
      }
    }
  }
  
  if (applyVisibility.value) {
    updates.visibility = {}
    
    if (form.value.visibility.setWebstore) {
      updates.visibility.webstore = form.value.visibility.webstore
    }
    
    if (form.value.visibility.setB2bPortal) {
      updates.visibility.b2bPortal = form.value.visibility.b2bPortal
    }
    
    if (form.value.visibility.setMarketplace) {
      updates.visibility.marketplace = form.value.visibility.marketplace
    }
  }
  
  if (applyInventory.value) {
    updates.inventory = {
      dynamicStock: form.value.inventory.dynamicStock,
      minComponentQuantity: parseInt(form.value.inventory.minComponentQuantity) || 1,
      lowStockThreshold: parseInt(form.value.inventory.lowStockThreshold) || 5
    }
  }
  
  // Process any per-bundle changes
  if (updates.categoryAction) {
    const { action, categories } = updates.categoryAction
    delete updates.categoryAction
    
    // Apply category changes to each bundle
    const processedBundles = props.selectedBundles.map(bundle => {
      const bundleCopy = { ...bundle }
      
      if (action === 'add') {
        // Add categories that aren't already in the bundle
        bundleCopy.categories = [...new Set([...bundleCopy.categories, ...categories])]
      } else if (action === 'remove') {
        // Remove selected categories
        bundleCopy.categories = bundleCopy.categories.filter(
          cat => !categories.includes(cat)
        )
      }
      
      return bundleCopy
    })
    
    // Emit specific bundle updates for add/remove categories
    setTimeout(() => {
      emit('bundles-updated', processedBundles, updates)
      isSubmitting.value = false
      showSuccessAlert.value = true
    }, 1000)
  } else {
    // For standard updates, just pass the updates object
    setTimeout(() => {
      emit('bundles-updated', props.selectedBundles, updates)
      isSubmitting.value = false
      showSuccessAlert.value = true
    }, 1000)
  }
}
</script>

<style>
/* Custom styles for vue-multiselect to match your UI */
.multiselect-custom {
  border-radius: 0.375rem;
  min-height: 38px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.multiselect-custom.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #f8fafc;
}

.multiselect-custom .multiselect__tags {
  min-height: 38px;
  padding: 6px 40px 0 8px;
  border-radius: 0.375rem;
  border: none;
  background: transparent;
}

.multiselect-custom .multiselect__tag {
  background: #e2e8f0;
  color: #334155;
  margin-bottom: 4px;
  padding: 4px 26px 4px 10px;
  border-radius: 4px;
}

.multiselect-custom .multiselect__tag-icon {
  line-height: 1.8;
}

.multiselect-custom .multiselect__tag-icon:after {
  color: #64748b;
}

.multiselect-custom .multiselect__tag-icon:hover {
  background: #cbd5e1;
}

.multiselect-custom .multiselect__tag-icon:hover:after {
  color: #334155;
}

.multiselect-custom .multiselect__placeholder {
  color: #94a3b8;
  margin-bottom: 6px;
  padding-top: 0;
  padding-left: 2px;
}

.multiselect-custom .multiselect__input,
.multiselect-custom .multiselect__single {
  background: transparent;
  margin-bottom: 6px;
}

.multiselect-custom .multiselect__content-wrapper {
  border: 1px solid #e2e8f0;
  border-top: none;
  border-bottom-left-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.multiselect-custom .multiselect__option {
  padding: 10px 12px;
}

.multiselect-custom .multiselect__option--highlight {
  background: #f1f5f9;
  color: #0f172a;
}

.multiselect-custom .multiselect__option--selected {
  background: #dbeafe;
  color: #1e40af;
  font-weight: 500;
}

.multiselect-custom .multiselect__option--selected.multiselect__option--highlight {
  background: #bfdbfe;
  color: #1e40af;
}
</style>