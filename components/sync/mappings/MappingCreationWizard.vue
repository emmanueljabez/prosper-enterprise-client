<template>
  <SheetContent class="sm:max-w-lg flex flex-col h-full overflow-hidden">
    <SheetHeader class="flex-shrink-0">
      <SheetTitle>{{ isLastStep ? 'Review Mapping' : `New Mapping - ${currentStepTitle}` }}</SheetTitle>
      <SheetDescription>
        Create a new link between an inventory item and a catalog product.
        Required fields are marked with an asterisk (*).
      </SheetDescription>
    </SheetHeader>

    <div class="flex-1 overflow-y-auto py-6 px-1">
      <div v-if="!isLastStep" class="mb-6">
        <div class="w-full">
          <!-- Stepper header with step titles -->
          <div class="flex justify-between mb-2">
            <div
              v-for="(step, index) in steps"
              :key="step.id"
              class="text-center flex-1 relative"
              :class="{ 'cursor-pointer': index <= currentStep }"
              @click="index <= currentStep && goToStep(index)"
            >
              <span
                class="text-sm font-medium"
                :class="
                  index === currentStep
                    ? 'text-primary'
                    : index < currentStep
                    ? 'text-muted-foreground'
                    : 'text-muted-foreground/50'
                "
              >
                {{ step.title }}
              </span>
            </div>
          </div>

          <!-- Stepper progress bar -->
          <div class="relative flex items-center w-full">
            <!-- Step indicators -->
            <div class="flex w-full justify-between">
              <div
                v-for="(step, index) in steps"
                :key="`indicator-${step.id}`"
                class="flex flex-col items-center"
              >
                <!-- Step indicator circle -->
                <div
                  class="rounded-full h-8 w-8 flex items-center justify-center border transition-colors z-10"
                  :class="{
                    'bg-primary border-primary text-primary-foreground': index === currentStep,
                    'bg-primary-foreground border-primary text-primary': index < currentStep,
                    'bg-background border-muted text-muted-foreground': index > currentStep
                  }"
                  :aria-current="index === currentStep ? 'step' : null"
                >
                  <span v-if="index < currentStep" class="text-xs">✓</span>
                  <span v-else class="text-xs">{{ index + 1 }}</span>
                </div>

                <!-- Step description (only show for current step) -->
                <span
                  v-if="index === currentStep"
                  class="text-xs text-muted-foreground mt-1 absolute top-full whitespace-nowrap"
                >
                  {{ step.description }}
                </span>
              </div>
            </div>

            <!-- Connecting lines -->
            <div class="absolute top-4 left-0 w-full transform -translate-y-1/2">
              <div class="h-0.5 bg-muted"></div>
            </div>

            <!-- Active progress bar -->
            <div class="absolute top-4 left-0 transform -translate-y-1/2">
              <div
                class="h-0.5 bg-primary transition-all"
                :style="`width: ${(currentStep / (steps.length - 1)) * 100}%`"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <form @submit.prevent="nextStep" class="space-y-6">
        <!-- Step 1: Select Item and Product -->
        <div v-if="currentStep === 0">
          <div class="space-y-6">
            <!-- Item Selection -->
            <div class="space-y-3">
              <Label for="item-select">Inventory Item <span class="text-destructive">*</span></Label>
              <div class="space-y-2">
                <div class="flex space-x-2">
                  <div class="flex-1">
                    <Combobox 
                      v-model="mappingData.itemId"
                      :options="items.map(item => ({ label: `${item.name} (${item.sku})`, value: item.id }))"
                      :filter="true"
                      :clearable="true"
                      placeholder="Search and select an item..."
                      :disabled="items.length === 0"
                      :class="{ 'border-destructive': errors.itemId }"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    type="button" 
                    size="icon"
                    title="Show all unmapped items"
                    @click="showItemBrowser = true"
                  >
                    <BoxesIcon class="h-4 w-4" />
                  </Button>
                </div>
                <p v-if="errors.itemId" class="text-sm text-destructive">{{ errors.itemId }}</p>
              </div>
              
              <div v-if="selectedItem" class="rounded-md border p-3 bg-muted/20">
                <div class="flex items-start space-x-3">
                  <div class="h-12 w-12 rounded flex items-center justify-center bg-background border">
                    <PackageIcon class="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div class="flex-1 space-y-1 min-w-0">
                    <p class="font-medium text-sm">{{ selectedItem.name }}</p>
                    <div class="flex flex-wrap gap-2">
                      <Badge variant="outline">SKU: {{ selectedItem.sku }}</Badge>
                      <Badge variant="secondary">Stock: {{ selectedItem.stockOnHand }}</Badge>
                    </div>
                    <p class="text-xs text-muted-foreground truncate">{{ selectedItem.description }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Product Selection -->
            <div class="space-y-3">
              <Label for="product-select">Catalog Product <span class="text-destructive">*</span></Label>
              <div class="space-y-2">
                <div class="flex space-x-2">
                  <div class="flex-1">
                    <Combobox 
                      v-model="mappingData.productId"
                      :options="products.map(product => ({ label: `${product.name} (${product.sku})`, value: product.id }))"
                      :filter="true"
                      :clearable="true"
                      placeholder="Search and select a product..."
                      :disabled="products.length === 0"
                      :class="{ 'border-destructive': errors.productId }"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    type="button" 
                    size="icon"
                    title="Show all unmapped products"
                    @click="showProductBrowser = true"
                  >
                    <ShoppingBagIcon class="h-4 w-4" />
                  </Button>
                </div>
                <p v-if="errors.productId" class="text-sm text-destructive">{{ errors.productId }}</p>
              </div>
              
              <div v-if="selectedProduct" class="rounded-md border p-3 bg-muted/20">
                <div class="flex items-start space-x-3">
                  <div class="h-12 w-12 rounded overflow-hidden bg-background border">
                    <img v-if="selectedProduct.imageUrl" :src="selectedProduct.imageUrl" class="h-full w-full object-cover" />
                    <ShoppingBagIcon v-else class="h-6 w-6 m-3 text-muted-foreground" />
                  </div>
                  <div class="flex-1 space-y-1 min-w-0">
                    <p class="font-medium text-sm">{{ selectedProduct.name }}</p>
                    <div class="flex flex-wrap gap-2">
                      <Badge variant="outline">SKU: {{ selectedProduct.sku }}</Badge>
                      <Badge variant="secondary">${{ formatPrice(selectedProduct.price) }}</Badge>
                    </div>
                    <p class="text-xs text-muted-foreground truncate">{{ selectedProduct.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: Mapping Configuration -->
        <div v-if="currentStep === 1">
          <div class="space-y-6">
            <!-- Mapping Type -->
            <div class="space-y-3">
              <Label>Mapping Type <span class="text-destructive">*</span></Label>
              <RadioGroup v-model="mappingData.mappingType" class="flex space-x-4">
                <div class="flex items-center space-x-2">
                  <RadioGroupItem value="manual" id="manual" />
                  <Label for="manual">Manual Mapping</Label>
                </div>
                <div class="flex items-center space-x-2">
                  <RadioGroupItem value="automatic" id="automatic" />
                  <Label for="automatic">Automatic Mapping</Label>
                </div>
              </RadioGroup>
              <p class="text-xs text-muted-foreground">
                Manual mappings are maintained by users, automatic mappings can be updated by the system.
              </p>
            </div>

            <!-- Sync Options -->
            <div class="space-y-3">
              <Label>Sync Options <span class="text-destructive">*</span></Label>
              
              <Card>
                <CardContent class="pt-6 space-y-4">
                  <div class="flex items-center justify-between">
                    <div class="space-y-0.5">
                      <Label for="sync-inventory">Inventory Levels</Label>
                      <p class="text-xs text-muted-foreground">Sync stock quantities between inventory and catalog</p>
                    </div>
                    <Switch
                      id="sync-inventory"
                      v-model="mappingData.syncOptions.inventory"
                    />
                  </div>
                  
                  <Separator />
                  
                  <div class="flex items-center justify-between">
                    <div class="space-y-0.5">
                      <Label for="sync-pricing">Pricing</Label>
                      <p class="text-xs text-muted-foreground">Sync prices between inventory and catalog</p>
                    </div>
                    <Switch
                      id="sync-pricing"
                      v-model="mappingData.syncOptions.pricing"
                    />
                  </div>
                  
                  <Separator />
                  
                  <div class="flex items-center justify-between">
                    <div class="space-y-0.5">
                      <Label for="sync-metadata">Metadata</Label>
                      <p class="text-xs text-muted-foreground">Sync descriptions, attributes, and other metadata</p>
                    </div>
                    <Switch
                      id="sync-metadata"
                      v-model="mappingData.syncOptions.metadata"
                    />
                  </div>
                  
                  <Separator />
                  
                  <div class="flex items-center justify-between">
                    <div class="space-y-0.5">
                      <Label for="bidirectional">Bidirectional Sync</Label>
                      <p class="text-xs text-muted-foreground">Changes in either system will update the other</p>
                    </div>
                    <Switch
                      id="bidirectional"
                      v-model="mappingData.syncOptions.bidirectional"
                    />
                  </div>
                </CardContent>
              </Card>
              
              <p v-if="errors.syncOptions" class="text-sm text-destructive">{{ errors.syncOptions }}</p>
            </div>

            <!-- Sync Schedule -->
            <div class="space-y-3">
              <Label>Sync Schedule</Label>
              <Select v-model="mappingData.syncSchedule">
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
              <Label for="notes">Notes</Label>
              <Textarea
                id="notes"
                v-model="mappingData.notes"
                placeholder="Add any notes about this mapping..."
                rows="3"
              />
            </div>
          </div>
        </div>

        <!-- Review Step -->
        <div v-if="isLastStep">
          <div class="space-y-6">
            <!-- Mapping Summary -->
            <div class="rounded-lg border p-4 bg-muted/30">
              <h4 class="font-medium mb-2">Mapping Details</h4>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p class="text-muted-foreground">Mapping Type:</p>
                  <p>{{ formatMappingType(mappingData.mappingType) }}</p>
                </div>
                <div>
                  <p class="text-muted-foreground">Sync Schedule:</p>
                  <p>{{ formatSyncSchedule(mappingData.syncSchedule) }}</p>
                </div>
              </div>
            </div>

            <!-- Item Summary -->
            <div class="rounded-lg border p-4 bg-muted/30">
              <h4 class="font-medium mb-2">Inventory Item</h4>
              <div class="flex items-start space-x-3">
                <div class="h-12 w-12 rounded flex items-center justify-center bg-background border">
                  <PackageIcon class="h-6 w-6 text-muted-foreground" />
                </div>
                <div class="flex-1 space-y-1">
                  <p class="font-medium">{{ selectedItem?.name || 'No item selected' }}</p>
                  <div class="flex flex-wrap gap-2">
                    <Badge variant="outline">SKU: {{ selectedItem?.sku || 'N/A' }}</Badge>
                    <Badge variant="secondary">Stock: {{ selectedItem?.stockOnHand || '0' }}</Badge>
                  </div>
                  <p class="text-xs text-muted-foreground">{{ selectedItem?.description || 'No description' }}</p>
                </div>
              </div>
            </div>

            <!-- Product Summary -->
            <div class="rounded-lg border p-4 bg-muted/30">
              <h4 class="font-medium mb-2">Catalog Product</h4>
              <div class="flex items-start space-x-3">
                <div class="h-12 w-12 rounded overflow-hidden bg-background border">
                  <img v-if="selectedProduct?.imageUrl" :src="selectedProduct.imageUrl" class="h-full w-full object-cover" />
                  <ShoppingBagIcon v-else class="h-6 w-6 m-3 text-muted-foreground" />
                </div>
                <div class="flex-1 space-y-1">
                  <p class="font-medium">{{ selectedProduct?.name || 'No product selected' }}</p>
                  <div class="flex flex-wrap gap-2">
                    <Badge variant="outline">SKU: {{ selectedProduct?.sku || 'N/A' }}</Badge>
                    <Badge variant="secondary">${{ formatPrice(selectedProduct?.price) }}</Badge>
                  </div>
                  <p class="text-xs text-muted-foreground">{{ selectedProduct?.description || 'No description' }}</p>
                </div>
              </div>
            </div>

            <!-- Sync Options Summary -->
            <div class="rounded-lg border p-4 bg-muted/30">
              <h4 class="font-medium mb-2">Synchronization Options</h4>
              <div class="space-y-2">
                <div class="flex items-center">
                  <CheckIcon 
                    v-if="mappingData.syncOptions.inventory" 
                    class="h-4 w-4 mr-2 text-green-500" 
                  />
                  <XIcon 
                    v-else
                    class="h-4 w-4 mr-2 text-muted-foreground" 
                  />
                  <span>Inventory Levels</span>
                </div>
                <div class="flex items-center">
                  <CheckIcon 
                    v-if="mappingData.syncOptions.pricing" 
                    class="h-4 w-4 mr-2 text-green-500" 
                  />
                  <XIcon 
                    v-else
                    class="h-4 w-4 mr-2 text-muted-foreground" 
                  />
                  <span>Pricing</span>
                </div>
                <div class="flex items-center">
                  <CheckIcon 
                    v-if="mappingData.syncOptions.metadata" 
                    class="h-4 w-4 mr-2 text-green-500" 
                  />
                  <XIcon 
                    v-else
                    class="h-4 w-4 mr-2 text-muted-foreground" 
                  />
                  <span>Metadata (descriptions, attributes)</span>
                </div>
                <div class="flex items-center">
                  <CheckIcon 
                    v-if="mappingData.syncOptions.bidirectional" 
                    class="h-4 w-4 mr-2 text-green-500" 
                  />
                  <XIcon 
                    v-else
                    class="h-4 w-4 mr-2 text-muted-foreground" 
                  />
                  <span>Bidirectional Sync</span>
                </div>
              </div>
            </div>

            <!-- Notes Summary -->
            <div v-if="mappingData.notes" class="rounded-lg border p-4 bg-muted/30">
              <h4 class="font-medium mb-2">Notes</h4>
              <p class="text-sm">{{ mappingData.notes }}</p>
            </div>
          </div>
        </div>
      </form>
    </div>

    <SheetFooter class="flex-shrink-0 border-t pt-4">
      <div class="flex justify-between w-full">
        <Button
          v-if="!isFirstStep"
          variant="outline"
          @click="prevStep"
        >
          Back
        </Button>
        <div v-else></div>

        <div>
          <Button
            variant="outline"
            class="mr-2"
            @click="emit('close')"
          >
            Cancel
          </Button>
          <Button
            v-if="!isLastStep"
            type="submit"
            @click="nextStep"
          >
            Continue
          </Button>
          <Button
            v-else
            type="submit"
            @click="createMapping"
            :disabled="isSubmitting"
          >
            <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
            Create Mapping
          </Button>
        </div>
      </div>
    </SheetFooter>

    <!-- Item Browser Dialog -->
    <Dialog v-model:open="showItemBrowser">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select an Inventory Item</DialogTitle>
          <DialogDescription>
            Browse and select an unmapped inventory item.
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4 py-4">
          <Input 
            v-model="itemSearchQuery"
            placeholder="Search items..."
          />
          <div class="max-h-[300px] overflow-y-auto border rounded-md">
            <div v-if="filteredItems.length === 0" class="p-4 text-center text-muted-foreground">
              No unmapped items found
            </div>
            <div 
              v-for="item in filteredItems" 
              :key="item.id"
              class="p-3 border-b last:border-b-0 hover:bg-muted cursor-pointer"
              @click="selectItemAndClose(item.id)"
            >
              <div class="font-medium">{{ item.name }}</div>
              <div class="text-xs text-muted-foreground">SKU: {{ item.sku }} • Stock: {{ item.stockOnHand }}</div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showItemBrowser = false">Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Product Browser Dialog -->
    <Dialog v-model:open="showProductBrowser">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select a Catalog Product</DialogTitle>
          <DialogDescription>
            Browse and select an unmapped catalog product.
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4 py-4">
          <Input 
            v-model="productSearchQuery"
            placeholder="Search products..."
          />
          <div class="max-h-[300px] overflow-y-auto border rounded-md">
            <div v-if="filteredProducts.length === 0" class="p-4 text-center text-muted-foreground">
              No unmapped products found
            </div>
            <div 
              v-for="product in filteredProducts" 
              :key="product.id"
              class="p-3 border-b last:border-b-0 hover:bg-muted cursor-pointer"
              @click="selectProductAndClose(product.id)"
            >
              <div class="font-medium">{{ product.name }}</div>
              <div class="text-xs text-muted-foreground">SKU: {{ product.sku }} • Price: ${{ formatPrice(product.price) }}</div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showProductBrowser = false">Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </SheetContent>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import {
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Combobox } from '@/components/ui/combobox'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  PackageIcon,
  ShoppingBagIcon,
  BoxesIcon,
  CheckIcon,
  XIcon,
  Loader2Icon
} from 'lucide-vue-next'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  products: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['mapping-created', 'close'])

// Wizard steps
const steps = [
  {
    id: 'selection',
    title: 'Select Items',
    description: 'Choose inventory item and product',
    isValid: false
  },
  {
    id: 'configuration',
    title: 'Configure Mapping',
    description: 'Set sync options',
    isValid: false
  },
  {
    id: 'review',
    title: 'Review & Create',
    description: 'Confirm mapping details',
    isValid: true
  }
]

// Form data
const mappingData = reactive({
  itemId: '',
  productId: '',
  mappingType: 'manual',
  syncSchedule: 'realtime',
  syncOptions: {
    inventory: true,
    pricing: true,
    metadata: false,
    bidirectional: false
  },
  notes: ''
})

// UI state
const currentStep = ref(0)
const errors = reactive({})
const isSubmitting = ref(false)
const showItemBrowser = ref(false)
const showProductBrowser = ref(false)
const itemSearchQuery = ref('')
const productSearchQuery = ref('')

// Computed properties
const isFirstStep = computed(() => currentStep.value === 0)
const isLastStep = computed(() => currentStep.value === steps.length - 1)

const currentStepTitle = computed(() => {
  return steps[currentStep.value]?.title || ''
})

const selectedItem = computed(() => {
  if (!mappingData.itemId) return null
  return props.items.find(item => item.id === mappingData.itemId)
})

const selectedProduct = computed(() => {
  if (!mappingData.productId) return null
  return props.products.find(product => product.id === mappingData.productId)
})

const filteredItems = computed(() => {
  let filtered = props.items
  
  if (itemSearchQuery.value) {
    const search = itemSearchQuery.value.toLowerCase()
    filtered = filtered.filter(item => 
      item.name.toLowerCase().includes(search) || 
      item.sku.toLowerCase().includes(search)
    )
  }
  
  return filtered
})

const filteredProducts = computed(() => {
  let filtered = props.products
  
  if (productSearchQuery.value) {
    const search = productSearchQuery.value.toLowerCase()
    filtered = filtered.filter(product => 
      product.name.toLowerCase().includes(search) || 
      product.sku.toLowerCase().includes(search)
    )
  }
  
  return filtered
})

// Helper functions
function formatMappingType(type) {
  if (type === 'manual') return 'Manual'
  if (type === 'automatic') return 'Automatic'
  return type
}

function formatSyncSchedule(schedule) {
  const scheduleMap = {
    'realtime': 'Real-time',
    'hourly': 'Hourly',
    'daily': 'Daily',
    'manual': 'Manual Only'
  }
  return scheduleMap[schedule] || schedule
}

function formatPrice(price) {
  if (!price) return '0.00'
  return parseFloat(price).toFixed(2)
}

function goToStep(index) {
  // Only allow navigation to completed steps or current step
  if (index <= currentStep.value) {
    currentStep.value = index
  }
}

function selectItemAndClose(itemId) {
  mappingData.itemId = itemId
  showItemBrowser.value = false
}

function selectProductAndClose(productId) {
  mappingData.productId = productId
  showProductBrowser.value = false
}

function validateStep() {
  Object.keys(errors).forEach(key => {
    delete errors[key]
  })
  
  if (currentStep.value === 0) {
    if (!mappingData.itemId) {
      errors.itemId = 'Please select an inventory item'
    }
    if (!mappingData.productId) {
      errors.productId = 'Please select a catalog product'
    }
  } else if (currentStep.value === 1) {
    // Check that at least one sync option is enabled
    if (!mappingData.syncOptions.inventory && 
        !mappingData.syncOptions.pricing && 
        !mappingData.syncOptions.metadata) {
      errors.syncOptions = 'At least one sync option must be enabled'
    }
  }
  
  return Object.keys(errors).length === 0
}

function nextStep() {
  if (!validateStep()) return
  
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

async function createMapping() {
  if (!validateStep()) return
  
  isSubmitting.value = true
  
  try {
    // Prepare mapping data object
    const newMapping = {
      itemId: mappingData.itemId,
      productId: mappingData.productId,
      mappingType: mappingData.mappingType,
      syncSchedule: mappingData.syncSchedule,
      syncOptions: { ...mappingData.syncOptions },
      notes: mappingData.notes
    }
    
    // Send back to parent component
    emit('mapping-created', newMapping)
  } catch (error) {
    console.error('Error creating mapping:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>