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
              <Button variant="outline" size="sm" class="w-full">
                <ImageIcon class="mr-2 h-4 w-4" />
                Update Image
              </Button>
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
                <div class="text-3xl font-bold mb-1">{{ formatNumber(item.stockOnHand || 0) }}</div>
                <div class="text-sm text-muted-foreground">Units on Hand</div>
                <div v-if="isLowStock" class="text-sm text-orange-600 font-medium mt-1">
                  Low Stock Alert
                </div>
                <div v-else-if="isOutOfStock" class="text-sm text-red-600 font-medium mt-1">
                  Out of Stock
                </div>
              </div>

              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-sm text-muted-foreground">Available:</span>
                  <span class="font-medium">{{ formatNumber(item.availableStock || item.stockOnHand || 0) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-muted-foreground">Reserved:</span>
                  <span class="font-medium">{{ formatNumber(item.reservedStock || 0) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-muted-foreground">On Order:</span>
                  <span class="font-medium">{{ formatNumber(item.onOrderStock || 0) }}</span>
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
import { computed } from 'vue'
import { 
  PackageIcon, Package, Pencil, Copy, MoreHorizontal, ChevronDown, 
  History, BarChart3, FileText, Download, Share, ImageIcon
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
  }
})

// Emits
const emit = defineEmits(['update:open', 'edit', 'duplicate', 'adjust-stock'])

// Computed
const hasPhysicalProperties = computed(() => {
  return props.item && (
    props.item.weight || 
    props.item.length || 
    props.item.width || 
    props.item.height
  )
})

const isLowStock = computed(() => {
  if (!props.item) return false
  const stock = props.item.stockOnHand || 0
  const reorderPoint = props.item.reorderPoint || 0
  return stock <= reorderPoint && stock > 0
})

const isOutOfStock = computed(() => {
  if (!props.item) return false
  return (props.item.stockOnHand || 0) === 0
})

const totalValue = computed(() => {
  if (!props.item) return 0
  const cost = props.item.standardCost || props.item.averageCost || props.item.lastCost || 0
  const quantity = props.item.stockOnHand || 0
  return cost * quantity
})

// Methods
const formatNumber = (value) => {
  return new Intl.NumberFormat().format(value || 0)
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
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
</script>
