<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-4xl max-h-[90vh] overflow-hidden">
      <DialogHeader>
        <DialogTitle class="flex items-center space-x-2">
          <PackageIcon class="h-5 w-5" />
          <span>{{ item?.name || 'Item Details' }}</span>
        </DialogTitle>
        <DialogDescription>
          View complete information for {{ item?.itemCode }}
        </DialogDescription>
      </DialogHeader>

      <div v-if="item" class="grid grid-cols-1 lg:grid-cols-3 gap-6 max-h-[70vh] overflow-auto p-1">
        <!-- Left Column: Basic Info -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Basic Information -->
          <Card>
            <CardHeader>
              <CardTitle class="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <Label class="text-sm font-medium text-muted-foreground">Item Code</Label>
                  <p class="font-medium">{{ item.itemCode }}</p>
                </div>
                <div>
                  <Label class="text-sm font-medium text-muted-foreground">Status</Label>
                  <Badge :variant="item.isActive ? 'default' : 'secondary'">
                    {{ item.isActive ? 'Active' : 'Inactive' }}
                  </Badge>
                </div>
              </div>
              
              <div v-if="item.barcode">
                <Label class="text-sm font-medium text-muted-foreground">Barcode</Label>
                <p class="font-medium">{{ item.barcode }}</p>
              </div>

              <div>
                <Label class="text-sm font-medium text-muted-foreground">Name</Label>
                <p class="font-medium">{{ item.name }}</p>
              </div>

              <div v-if="item.description">
                <Label class="text-sm font-medium text-muted-foreground">Description</Label>
                <p class="text-sm">{{ item.description }}</p>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <Label class="text-sm font-medium text-muted-foreground">Category</Label>
                  <Badge variant="outline">{{ getCategoryName(item.categoryId) }}</Badge>
                </div>
                <div>
                  <Label class="text-sm font-medium text-muted-foreground">Unit of Measure</Label>
                  <Badge variant="secondary">{{ getUnitName(item.baseUnitOfMeasureId || item.unitOfMeasureId) }}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Pricing Information -->
          <Card>
            <CardHeader>
              <CardTitle class="text-lg">Pricing & Costs</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label class="text-sm font-medium text-muted-foreground">Standard Cost</Label>
                  <p class="text-lg font-semibold">{{ formatCurrency(item.standardCost) }}</p>
                </div>
                <div>
                  <Label class="text-sm font-medium text-muted-foreground">Average Cost</Label>
                  <p class="text-lg font-semibold">{{ formatCurrency(item.averageCost) }}</p>
                </div>
                <div>
                  <Label class="text-sm font-medium text-muted-foreground">Last Cost</Label>
                  <p class="text-lg font-semibold">{{ formatCurrency(item.lastCost) }}</p>
                </div>
                <div>
                  <Label class="text-sm font-medium text-muted-foreground">List Price</Label>
                  <p class="text-lg font-semibold">{{ formatCurrency(item.listPrice) }}</p>
                </div>
              </div>
              
              <div class="mt-4 pt-4 border-t">
                <div class="grid grid-cols-2 gap-4">
                  <div class="flex items-center space-x-2">
                    <Checkbox :checked="item.isTaxable" disabled />
                    <Label class="text-sm">Taxable Item</Label>
                  </div>
                  <div class="flex items-center space-x-2">
                    <Checkbox :checked="item.priceIncludesTax" disabled />
                    <Label class="text-sm">Price Includes Tax</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Physical Properties -->
          <Card v-if="hasPhysicalProperties">
            <CardHeader>
              <CardTitle class="text-lg">Physical Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div v-if="item.weight">
                  <Label class="text-sm font-medium text-muted-foreground">Weight</Label>
                  <p>{{ item.weight }} {{ item.weightUnit || 'kg' }}</p>
                </div>
                <div v-if="item.length">
                  <Label class="text-sm font-medium text-muted-foreground">Length</Label>
                  <p>{{ item.length }} {{ item.dimensionUnit || 'cm' }}</p>
                </div>
                <div v-if="item.width">
                  <Label class="text-sm font-medium text-muted-foreground">Width</Label>
                  <p>{{ item.width }} {{ item.dimensionUnit || 'cm' }}</p>
                </div>
                <div v-if="item.height">
                  <Label class="text-sm font-medium text-muted-foreground">Height</Label>
                  <p>{{ item.height }} {{ item.dimensionUnit || 'cm' }}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Additional Information -->
          <Card v-if="item.notes">
            <CardHeader>
              <CardTitle class="text-lg">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-sm whitespace-pre-wrap">{{ item.notes }}</p>
            </CardContent>
          </Card>
        </div>

        <!-- Right Column: Stock & Actions -->
        <div class="space-y-6">
          <!-- Item Image -->
          <Card>
            <CardContent class="p-6">
              <div class="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden mb-4">
                <img 
                  v-if="item.imageUrl" 
                  :src="item.imageUrl" 
                  :alt="item.name"
                  class="w-full h-full object-cover"
                />
                <PackageIcon v-else class="h-16 w-16 text-muted-foreground" />
              </div>
              
              <!-- Upload Interface -->
              <div class="space-y-2">
                <div v-if="item.imageUrl">
                  <!-- Change Image Button -->
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
                    size="sm"
                    class="w-full"
                    :disabled="isUploading"
                    @click="$refs.fileInput?.click()"
                  >
                    <Upload class="mr-2 h-4 w-4" />
                    Change Image
                  </Button>
                  <Loader2 v-if="isUploading" class="h-5 w-5 animate-spin text-muted-foreground mx-auto mt-2" />
                  <!-- Remove Image Button -->
                  <Button 
                    v-if="!isUploading"
                    variant="outline" 
                    size="sm" 
                    class="w-full mt-2"
                    @click="removeImage"
                  >
                    <X class="mr-2 h-4 w-4" />
                    Remove Image
                  </Button>
                </div>
                <div v-else class="flex items-center space-x-2">
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
                    size="sm"
                    class="w-full"
                    :disabled="isUploading"
                    @click="$refs.fileInput?.click()"
                  >
                    <Upload class="mr-2 h-4 w-4" />
                    Upload Image
                  </Button>
                  <Loader2 v-if="isUploading" class="h-5 w-5 animate-spin text-muted-foreground mx-auto" />
                </div>
                
                <!-- Upload Error -->
                <div v-if="uploadError" class="text-xs text-red-500 text-center">
                  {{ uploadError }}
                </div>
                
                <!-- Upload Success -->
                <div v-if="uploadSuccess" class="text-xs text-green-600 text-center">
                  ✅ Image updated successfully!
                </div>
                
                <!-- Help Text -->
                <p class="text-xs text-muted-foreground text-center mt-2">
                  Supported formats: JPG, PNG, GIF. Max size: 5MB.
                </p>
              </div>
            </CardContent>
          </Card>

          <!-- Stock Information -->
          <Card>
            <CardHeader>
              <CardTitle class="text-lg flex items-center">
                <Package class="mr-2 h-5 w-5" />
                Stock Information
              </CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="text-center p-4 bg-muted rounded-lg">
                <div class="text-3xl font-bold mb-1">{{ formatNumber(getTotalStock(item)) }}</div>
                <div class="text-sm text-muted-foreground">
                  Units on Hand
                  <span v-if="getLocationCount(item) > 1" class="text-xs ml-1">
                    ({{ getLocationCount(item) }} locations)
                  </span>
                </div>
                <div v-if="isLowStock(item)" class="text-sm text-orange-600 font-medium mt-1">
                  Low Stock Alert
                </div>
                <div v-else-if="isOutOfStock(item)" class="text-sm text-red-600 font-medium mt-1">
                  Out of Stock
                </div>
              </div>

              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-sm text-muted-foreground">Available:</span>
                  <span class="font-medium">{{ formatNumber(getTotalStock(item)) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-muted-foreground">Reserved:</span>
                  <span class="font-medium">{{ formatNumber(getTotalReserved(item)) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-muted-foreground">Allocated:</span>
                  <span class="font-medium">{{ formatNumber(getTotalAllocated(item)) }}</span>
                </div>
                <div class="flex justify-between border-t pt-2">
                  <span class="text-sm text-muted-foreground">Reorder Point:</span>
                  <span class="font-medium">{{ formatNumber(item.reorderPoint || 0) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-muted-foreground">Reorder Qty:</span>
                  <span class="font-medium">{{ formatNumber(item.reorderQuantity || 0) }}</span>
                </div>
              </div>

              <!-- Stock by Location -->
              <div v-if="item.inventoryStocks && item.inventoryStocks.length > 1" class="pt-4 border-t">
                <div class="text-sm font-medium text-muted-foreground mb-2">Stock by Location:</div>
                <div class="space-y-1 max-h-32 overflow-y-auto">
                  <div 
                    v-for="stock in item.inventoryStocks" 
                    :key="stock.id"
                    class="flex justify-between text-xs"
                  >
                    <span class="truncate mr-2">{{ stock.location.name }}</span>
                    <span>{{ formatNumber(stock.quantityAvailable) }}</span>
                  </div>
                </div>
              </div>

              <div class="pt-4 border-t">
                <div class="text-center">
                  <div class="text-lg font-semibold">{{ formatCurrency(totalValue) }}</div>
                  <div class="text-sm text-muted-foreground">Total Stock Value</div>
                </div>
              </div>

              <!-- Stock Tracking Options -->
              <div class="space-y-2 pt-4 border-t">
                <div class="flex items-center space-x-2">
                  <Checkbox :checked="item.trackStock" disabled />
                  <Label class="text-sm">Track Stock</Label>
                </div>
                <div class="flex items-center space-x-2">
                  <Checkbox :checked="item.isSerialTracked" disabled />
                  <Label class="text-sm">Serial Tracking</Label>
                </div>
                <div class="flex items-center space-x-2">
                  <Checkbox :checked="item.isLotTracked" disabled />
                  <Label class="text-sm">Lot Tracking</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Quick Actions -->
          <Card>
            <CardHeader>
              <CardTitle class="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent class="space-y-2">
              <Button class="w-full" @click="$emit('edit', item)">
                <Pencil class="mr-2 h-4 w-4" />
                Edit Item
              </Button>
              <Button variant="outline" class="w-full" @click="$emit('adjust-stock', item)">
                <Package class="mr-2 h-4 w-4" />
                Adjust Stock
              </Button>
              <Button variant="outline" class="w-full" @click="$emit('duplicate', item)">
                <Copy class="mr-2 h-4 w-4" />
                Duplicate Item
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" class="w-full">
                    <MoreHorizontal class="mr-2 h-4 w-4" />
                    More Actions
                    <ChevronDown class="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent class="w-56">
                  <DropdownMenuItem>
                    <History class="mr-2 h-4 w-4" />
                    View Stock History
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <BarChart3 class="mr-2 h-4 w-4" />
                    View Analytics
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileText class="mr-2 h-4 w-4" />
                    Generate Report
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Download class="mr-2 h-4 w-4" />
                    Export Data
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share class="mr-2 h-4 w-4" />
                    Share Item
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="$emit('update:open', false)">
          Close
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { 
  PackageIcon, Package, Pencil, Copy, MoreHorizontal, ChevronDown, 
  History, BarChart3, FileText, Download, Share, ImageIcon, Upload, X, Loader2
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

// Props
const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  item: {
    type: Object,
    default: () => null
  },
  categories: {
    type: Array,
    default: () => []
  },
  units: {
    type: Array,
    default: () => []
  },
  isUploading: {
    type: Boolean,
    default: false
  },
  uploadError: {
    type: String,
    default: null
  }
})

// Emits
const emit = defineEmits(['update:open', 'edit', 'duplicate', 'adjust-stock', 'upload-image', 'remove-image'])

// State
const fileInput = ref(null)
const uploadSuccess = ref(false)

// Computed
const hasPhysicalProperties = computed(() => {
  return props.item && (
    props.item.weight || 
    props.item.length || 
    props.item.width || 
    props.item.height
  )
})

const totalValue = computed(() => {
  if (!props.item) return 0
  const cost = props.item.standardCost || props.item.averageCost || props.item.lastCost || 0
  const quantity = getTotalStock(props.item)
  return cost * quantity
})

// Methods
const formatNumber = (value) => {
  return new Intl.NumberFormat().format(value || 0)
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'KES'
  }).format(value || 0)
}

const getCategoryName = (categoryId) => {
  if (!categoryId) return 'Uncategorized'
  const category = props.categories.find(cat => cat.id === categoryId)
  return category?.name || 'Uncategorized'
}

const getUnitName = (unitId) => {
  if (!unitId) return 'N/A'
  const unit = props.units.find(u => u.id === unitId)
  return unit?.name || unit?.code || 'N/A'
}

// Stock calculation methods using inventoryStocks array
const getTotalStock = (item) => {
  if (!item?.inventoryStocks?.length) return 0
  return item.inventoryStocks.reduce((sum, stock) => sum + (stock.quantityAvailable || 0), 0)
}

const getTotalReserved = (item) => {
  if (!item?.inventoryStocks?.length) return 0
  return item.inventoryStocks.reduce((sum, stock) => sum + (stock.quantityReserved || 0), 0)
}

const getTotalAllocated = (item) => {
  if (!item?.inventoryStocks?.length) return 0
  return item.inventoryStocks.reduce((sum, stock) => sum + (stock.quantityAllocated || 0), 0)
}

const getLocationCount = (item) => {
  return item?.inventoryStocks?.length || 0
}

const isLowStock = (item) => {
  if (!item) return false
  const totalStock = getTotalStock(item)
  const reorderPoint = item.reorderPoint || 0
  return totalStock <= reorderPoint && totalStock > 0
}

const isOutOfStock = (item) => {
  if (!item) return false
  return getTotalStock(item) === 0
}

// Image upload methods
const handleImageSelect = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  uploadSuccess.value = false
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    emit('upload-image', { 
      itemId: props.item.id, 
      file: null, 
      error: 'Please select a valid image file' 
    })
    return
  }

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    emit('upload-image', { 
      itemId: props.item.id, 
      file: null, 
      error: 'Image size must be less than 5MB' 
    })
    return
  }

  // Emit upload event to parent
  emit('upload-image', { 
    itemId: props.item.id, 
    file: file 
  })
  
  // Reset file input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const removeImage = () => {
  uploadSuccess.value = false
  
  // Emit remove event to parent
  emit('remove-image', {
    itemId: props.item.id
  })
}

// Clear errors when component unmounts or item changes
watch(() => props.item?.id, () => {
  uploadSuccess.value = false
})

// Watch for successful uploads from parent
watch(() => props.item?.imageUrl, (newImageUrl, oldImageUrl) => {
  if (newImageUrl && newImageUrl !== oldImageUrl) {
    uploadSuccess.value = true
    // Clear success message after 3 seconds
    setTimeout(() => {
      uploadSuccess.value = false
    }, 3000)
  }
})
</script>
