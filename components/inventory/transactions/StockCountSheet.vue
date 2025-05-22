<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-medium">Stock Count</h3>
        <p class="text-sm text-muted-foreground">Record physical inventory counts and reconcile discrepancies</p>
      </div>
      <Button variant="ghost" size="icon" @click="$emit('close')">
        <XIcon class="h-4 w-4" />
      </Button>
    </div>
    
    <Separator />
    
    <form @submit.prevent="handleSubmit" class="space-y-8">
      <!-- Count Details -->
      <div class="space-y-4">
        <h4 class="text-sm font-medium">Count Details</h4>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="transaction-date">Count Date *</Label>
            <Input 
              id="transaction-date" 
              v-model="form.transactionDate" 
              type="datetime-local" 
              required
            />
          </div>
          
          <div class="space-y-2">
            <Label for="reference">Reference #</Label>
            <Input 
              id="reference" 
              v-model="form.externalReference" 
              placeholder="Count reference #"
            />
          </div>
        </div>
        
        <div class="space-y-2">
          <Label for="location">Location *</Label>
          <Select 
            v-model="form.locationId" 
            required
            @update:modelValue="handleLocationChanged"
          >
            <SelectTrigger id="location">
              <SelectValue placeholder="Select location to count" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup v-for="group in locationGroups" :key="group.type">
                <SelectLabel>{{ formatLocationType(group.type) }}</SelectLabel>
                <SelectItem 
                  v-for="location in group.locations" 
                  :key="location.id" 
                  :value="location.id"
                >
                  {{ location.name }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        <div class="space-y-2">
          <Label for="notes">Notes</Label>
          <Textarea 
            id="notes" 
            v-model="form.notes" 
            placeholder="Enter any additional information about this count" 
            rows="3"
          />
        </div>
        
        <div class="flex items-center space-x-2">
          <Switch id="create-adjustments" v-model="form.createAdjustments" />
          <Label for="create-adjustments">Automatically create adjustment transactions for discrepancies</Label>
        </div>
      </div>
      
      <Separator />
      
      <!-- Count Items -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-medium">Counted Items</h4>
          <div class="flex space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              @click="importCountData"
              :disabled="!form.locationId"
            >
              <UploadIcon class="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              @click="addItemRow"
              :disabled="!form.locationId"
            >
              <PlusIcon class="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>
        
        <Alert v-if="!form.locationId" variant="warning">
          <AlertCircleIcon class="h-4 w-4" />
          <AlertTitle>Select location</AlertTitle>
          <AlertDescription>
            You need to select a location first to begin counting items.
          </AlertDescription>
        </Alert>
        
        <div v-else-if="form.items.length === 0" class="border rounded-md p-8 flex flex-col items-center justify-center bg-muted/40">
          <ClipboardCheckIcon class="h-8 w-8 text-muted-foreground mb-2" />
          <p class="text-muted-foreground">No items added yet.</p>
          <div class="flex space-x-2 mt-2">
            <Button 
              type="button"
              variant="outline" 
              size="sm"
              @click="showAllItemsInLocation"
            >
              <ListIcon class="h-4 w-4 mr-2" />
              Show All Items in Location
            </Button>
            <Button 
              type="button"
              variant="outline" 
              size="sm"
              @click="addItemRow"
            >
              <PlusIcon class="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>
        
        <div v-else>
          <div class="mb-4 flex items-center justify-between">
            <div class="text-sm text-muted-foreground">
              {{ form.items.length }} {{ form.items.length === 1 ? 'item' : 'items' }} 
            </div>
            <div class="space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                @click="showAllItemsInLocation"
              >
                <ListIcon class="h-4 w-4 mr-2" />
                Show All Items
              </Button>
              <Select v-model="sortOption">
                <SelectTrigger class="w-[180px]">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="variance">Sort by Variance</SelectItem>
                  <SelectItem value="bin">Sort by Bin Location</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Card v-for="(item, index) in sortedItems" :key="index" class="overflow-hidden mb-4">
            <CardHeader class="bg-muted/60 p-3 flex flex-row items-center justify-between">
              <CardTitle class="text-sm font-medium">
                {{ getItemName(item.itemId) }}
                <Badge v-if="hasVariance(item)" :variant="getVarianceType(item)">
                  {{ formatVariance(getVariance(item)) }}
                </Badge>
              </CardTitle>
              <Button 
                type="button"
                variant="ghost" 
                size="icon" 
                class="h-7 w-7" 
                @click="removeItemRow(index)"
              >
                <Trash2Icon class="h-4 w-4 text-muted-foreground" />
              </Button>
            </CardHeader>
            <CardContent class="p-4 space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="space-y-2">
                  <Label :for="`item-${index}`">Item *</Label>
                  <Select 
                    v-model="item.itemId" 
                    required
                    @update:modelValue="updateSystemQuantity(index)"
                  >
                    <SelectTrigger :id="`item-${index}`">
                      <SelectValue placeholder="Select item" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="inventoryItem in items" :key="inventoryItem.id" :value="inventoryItem.id">
                        {{ inventoryItem.name }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div class="space-y-2">
                  <Label :for="`counted-${index}`">Counted Qty *</Label>
                  <Input 
                    :id="`counted-${index}`" 
                    v-model.number="item.countedQuantity" 
                    type="number" 
                    min="0" 
                    step="1" 
                    required
                    class="bg-primary-foreground"
                  />
                </div>
                
                <div class="space-y-2">
                  <Label :for="`system-${index}`">System Qty</Label>
                  <Input 
                    :id="`system-${index}`" 
                    v-model.number="item.systemQuantity" 
                    type="number" 
                    disabled
                    class="bg-muted"
                  />
                  <div v-if="hasVariance(item)" class="text-xs" :class="getVarianceClass(item)">
                    Variance: {{ formatVariance(getVariance(item)) }}
                  </div>
                </div>
              </div>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label :for="`bin-${index}`">Bin Location</Label>
                  <Input 
                    :id="`bin-${index}`" 
                    v-model="item.binLocation" 
                    placeholder="Storage location"
                  />
                </div>
                
                <div class="space-y-2">
                  <Label :for="`lot-${index}`">Lot/Batch Number</Label>
                  <Input 
                    :id="`lot-${index}`" 
                    v-model="item.lot" 
                    placeholder="Optional"
                  />
                </div>
              </div>
              
              <div class="space-y-2">
                <Label :for="`notes-${index}`">Notes</Label>
                <Textarea 
                  :id="`notes-${index}`" 
                  v-model="item.notes" 
                  placeholder="Additional notes about this count"
                  rows="2"
                />
              </div>
            </CardContent>
          </Card>
          
          <div class="flex justify-between items-center rounded-md border p-4 bg-muted/20">
            <div>
              <div class="font-medium">Summary</div>
              <div class="text-sm text-muted-foreground mt-1">
                Items with discrepancies: {{ itemsWithVariance }}
              </div>
            </div>
            <div>
              <Badge v-if="totalVariance > 0" variant="success">
                +{{ totalVariance }} units
              </Badge>
              <Badge v-else-if="totalVariance < 0" variant="destructive">
                {{ totalVariance }} units
              </Badge>
              <Badge v-else variant="outline">
                No variance
              </Badge>
            </div>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <!-- Submit Buttons -->
      <div class="flex justify-end space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          @click="$emit('close')"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          :disabled="submitting || !isFormValid"
        >
          <Loader2Icon v-if="submitting" class="h-4 w-4 mr-2 animate-spin" />
          <span>{{ submitting ? 'Processing...' : 'Submit Count' }}</span>
        </Button>
      </div>
    </form>
    
    <!-- Import Dialog -->
    <Dialog v-model:open="showImportDialog">
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Count Data</DialogTitle>
          <DialogDescription>
            Upload a CSV file with your count data or paste data from a spreadsheet.
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4 py-2">
          <Tabs defaultValue="file">
            <TabsList class="grid w-full grid-cols-2">
              <TabsTrigger value="file">File Upload</TabsTrigger>
              <TabsTrigger value="paste">Paste Data</TabsTrigger>
            </TabsList>
            <TabsContent value="file" class="space-y-4">
              <div class="grid w-full max-w-sm items-center gap-1.5">
                <Label for="csv-file">CSV File</Label>
                <Input id="csv-file" type="file" accept=".csv" />
              </div>
              <div class="text-xs text-muted-foreground">
                CSV should have columns: Item Code/SKU, Counted Quantity, Bin Location (optional), Lot (optional)
              </div>
            </TabsContent>
            <TabsContent value="paste" class="space-y-4">
              <div class="grid w-full gap-1.5">
                <Label for="paste-data">Paste from Spreadsheet</Label>
                <Textarea
                  id="paste-data"
                  placeholder="Paste data here... (Tab or comma separated)"
                  rows="10"
                  class="font-mono text-sm"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showImportDialog = false">
            Cancel
          </Button>
          <Button @click="processImportedData">
            Import Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import {
  XIcon,
  PlusIcon,
  Trash2Icon,
  ClipboardCheckIcon,
  Loader2Icon,
  UploadIcon,
  ListIcon,
  AlertCircleIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Alert,
  AlertTitle,
  AlertDescription
} from '@/components/ui/alert'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs'

const props = defineProps({
  locations: {
    type: Array,
    default: () => []
  },
  items: {
    type: Array,
    default: () => []
  },
  // For pre-filling form with a scanned item
  scannedItem: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'transaction-created'])

// Form state
const form = reactive({
  transactionDate: formatCurrentDateTime(),
  locationId: '',
  externalReference: '',
  notes: '',
  type: 'count',
  createAdjustments: true,
  items: []
})

const submitting = ref(false)
const showImportDialog = ref(false)
const sortOption = ref('name')

// Computed properties
const locationGroups = computed(() => {
  // Filter active locations
  const filteredLocations = props.locations.filter(location => location.isActive)
  
  // Group locations by type
  const groups = {}
  filteredLocations.forEach(location => {
    const type = location.type || 'other'
    if (!groups[type]) {
      groups[type] = []
    }
    groups[type].push(location)
  })

  // Convert to array format for SelectGroup
  return Object.entries(groups).map(([type, locations]) => ({
    type,
    locations
  }))
})

const isFormValid = computed(() => {
  // Check basic count details
  if (!form.transactionDate || !form.locationId) {
    return false
  }
  
  // Check if we have at least one item
  if (form.items.length === 0) {
    return false
  }
  
  // Check that each item has required fields
  for (const item of form.items) {
    if (!item.itemId || item.countedQuantity === undefined || item.countedQuantity < 0) {
      return false
    }
  }
  
  return true
})

const sortedItems = computed(() => {
  if (!form.items.length) return []
  
  const items = [...form.items]
  
  switch (sortOption.value) {
    case 'name':
      return items.sort((a, b) => {
        const nameA = getItemName(a.itemId).toLowerCase()
        const nameB = getItemName(b.itemId).toLowerCase()
        return nameA.localeCompare(nameB)
      })
    case 'variance':
      return items.sort((a, b) => {
        const varianceA = Math.abs(getVariance(a))
        const varianceB = Math.abs(getVariance(b))
        return varianceB - varianceA // Sort by largest absolute variance first
      })
    case 'bin':
      return items.sort((a, b) => {
        const binA = (a.binLocation || '').toLowerCase()
        const binB = (b.binLocation || '').toLowerCase()
        return binA.localeCompare(binB)
      })
    default:
      return items
  }
})

const itemsWithVariance = computed(() => {
  return form.items.filter(item => hasVariance(item)).length
})

const totalVariance = computed(() => {
  return form.items.reduce((total, item) => {
    return total + getVariance(item)
  }, 0)
})

// Methods
function formatCurrentDateTime() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function formatLocationType(type) {
  switch (type) {
    case 'warehouse': return 'Warehouses'
    case 'store': return 'Stores'
    case 'zone': return 'Zones'
    case 'other': return 'Other Locations'
    default: return type.charAt(0).toUpperCase() + type.slice(1) + 's'
  }
}

function handleLocationChanged() {
  // Clear items when location changes
  form.items = []
}

function getItemName(itemId) {
  if (!itemId) return 'Unknown Item'
  const item = props.items.find(i => i.id === itemId)
  return item ? item.name : 'Unknown Item'
}

function addItemRow() {
  form.items.push({
    itemId: '',
    countedQuantity: 0,
    systemQuantity: 0,
    binLocation: '',
    lot: '',
    notes: ''
  })
}

function removeItemRow(index) {
  form.items.splice(index, 1)
}

function updateSystemQuantity(index) {
  const itemId = form.items[index].itemId
  if (!itemId || !form.locationId) return
  
  // Find the selected item
  const item = props.items.find(i => i.id === itemId)
  if (item) {
    // Get current stock quantity for this item at this location
    const locationStock = item.stock?.find(s => s.locationId === form.locationId)
    form.items[index].systemQuantity = locationStock?.quantity || 0
  }
}

function getVariance(item) {
  return (item.countedQuantity || 0) - (item.systemQuantity || 0)
}

function hasVariance(item) {
  return getVariance(item) !== 0
}

function getVarianceType(item) {
  const variance = getVariance(item)
  if (variance > 0) return 'success'
  if (variance < 0) return 'destructive'
  return 'outline'
}

function getVarianceClass(item) {
  const variance = getVariance(item)
  if (variance > 0) return 'text-green-600'
  if (variance < 0) return 'text-destructive'
  return 'text-muted-foreground'
}

function formatVariance(variance) {
  return variance > 0 ? `+${variance}` : variance
}

function importCountData() {
  showImportDialog.value = true
}

function processImportedData() {
  // This would process the imported data and add it to form.items
  // For now, just close the dialog
  showImportDialog.value = false
  
  // In a real implementation, you would:
  // 1. Parse the CSV file or pasted data
  // 2. Match SKUs/item codes to actual items
  // 3. Set counted quantities
  // 4. Add the items to the form.items array
}

function showAllItemsInLocation() {
  if (!form.locationId) return
  
  // Clear existing items
  form.items = []
  
  // Find all items that have stock at this location
  props.items.forEach(item => {
    const locationStock = item.stock?.find(s => s.locationId === form.locationId)
    if (locationStock) {
      form.items.push({
        itemId: item.id,
        countedQuantity: 0, // Start with 0 since it hasn't been counted yet
        systemQuantity: locationStock.quantity || 0,
        binLocation: locationStock.binLocation || '',
        lot: '',
        notes: ''
      })
    }
  })
  
  // Sort by name initially
  sortOption.value = 'name'
}

async function handleSubmit() {
  if (!isFormValid.value) return
  
  submitting.value = true
  
  try {
    // Create transaction payload
    const transaction = {
      type: 'count',
      locationId: form.locationId,
      transactionDate: new Date(form.transactionDate).toISOString(),
      externalReference: form.externalReference,
      notes: form.notes,
      createAdjustments: form.createAdjustments,
      items: form.items.map(item => ({
        itemId: item.itemId,
        countedQuantity: item.countedQuantity,
        systemQuantity: item.systemQuantity,
        variance: getVariance(item),
        binLocation: item.binLocation,
        lot: item.lot,
        notes: item.notes
      }))
    }
    
    // Emit the transaction to parent for API submission
    emit('transaction-created', transaction)
  } catch (error) {
    console.error('Error submitting count:', error)
    // Error handling would typically be done in the parent component
  } finally {
    submitting.value = false
  }
}

// Initialize component
watch(() => props.scannedItem, (newScannedItem) => {
  if (newScannedItem && form.locationId) {
    // Find the item in our items list
    const matchedItem = props.items.find(
      item => item.id === newScannedItem.id || 
             item.sku === newScannedItem.barcode ||
             item.barcode === newScannedItem.barcode
    )
    
    if (matchedItem) {
      // Check if this item is already in the count list
      const existingIndex = form.items.findIndex(item => item.itemId === matchedItem.id)
      
      if (existingIndex >= 0) {
        // Increment counted quantity for existing item
        form.items[existingIndex].countedQuantity = (form.items[existingIndex].countedQuantity || 0) + 1
      } else {
        // Add new count item
        const locationStock = matchedItem.stock?.find(s => s.locationId === form.locationId)
        form.items.push({
          itemId: matchedItem.id,
          countedQuantity: 1, // Start with 1 since we just counted it
          systemQuantity: locationStock?.quantity || 0,
          binLocation: locationStock?.binLocation || '',
          lot: '',
          notes: ''
        })
      }
    }
  }
}, { immediate: true })
</script>