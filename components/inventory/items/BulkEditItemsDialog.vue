<template>
  <DialogContent class="max-w-2xl">
    <DialogHeader>
      <DialogTitle class="flex items-center space-x-2">
        <Edit class="h-5 w-5" />
        <span>Bulk Edit Items</span>
      </DialogTitle>
      <DialogDescription>
        Update multiple items at once. Only modified fields will be updated.
      </DialogDescription>
    </DialogHeader>

    <div class="space-y-6">
      <!-- Selected Items Summary -->
      <div class="bg-muted/50 rounded-lg p-4">
        <div class="flex items-center justify-between mb-2">
          <span class="font-medium">Selected Items</span>
          <Badge variant="secondary">{{ items.length }} items</Badge>
        </div>
        <div class="text-sm text-muted-foreground">
          {{ items.map(item => item.name).slice(0, 3).join(', ') }}
          <span v-if="items.length > 3">and {{ items.length - 3 }} more...</span>
        </div>
      </div>

      <form @submit.prevent="updateItems">
        <div class="space-y-6">
          <!-- Category Update -->
          <Card>
            <CardHeader class="pb-3">
              <div class="flex items-center space-x-2">
                <Checkbox 
                  id="updateCategory" 
                  v-model:checked="updateFields.category"
                />
                <Label for="updateCategory" class="font-medium">Update Category</Label>
              </div>
            </CardHeader>
            <CardContent v-if="updateFields.category" class="pt-0">
              <Select v-model="formData.categoryId">
                <SelectTrigger>
                  <SelectValue placeholder="Select new category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="category in props.categories" :key="category.id" :value="category.id.toString()">
                    {{ category.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <!-- Pricing Update -->
          <Card>
            <CardHeader class="pb-3">
              <div class="flex items-center space-x-2">
                <Checkbox 
                  id="updatePricing" 
                  v-model:checked="updateFields.pricing"
                />
                <Label for="updatePricing" class="font-medium">Update Pricing</Label>
              </div>
            </CardHeader>
            <CardContent v-if="updateFields.pricing" class="pt-0 space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="standardCost">Standard Cost</Label>
                  <Input
                    id="standardCost"
                    v-model="formData.standardCost"
                    type="number"
                    step="0.01"
                    placeholder="Leave empty to keep existing"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="listPrice">List Price</Label>
                  <Input
                    id="listPrice"
                    v-model="formData.listPrice"
                    type="number"
                    step="0.01"
                    placeholder="Leave empty to keep existing"
                  />
                </div>
              </div>

              <!-- Price Adjustment Options -->
              <div class="space-y-3 pt-3 border-t">
                <Label class="text-sm font-medium">Price Adjustment Options</Label>
                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <Label for="priceAdjustment">Percentage Adjustment</Label>
                    <div class="flex space-x-2">
                      <Input
                        id="priceAdjustment"
                        v-model="priceAdjustment.percentage"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                      />
                      <Select v-model="priceAdjustment.type">
                        <SelectTrigger class="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="increase">+%</SelectItem>
                          <SelectItem value="decrease">-%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div class="space-y-2">
                    <Label for="applyTo">Apply To</Label>
                    <Select v-model="priceAdjustment.applyTo">
                      <SelectTrigger>
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standardCost">Standard Cost</SelectItem>
                        <SelectItem value="listPrice">List Price</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Stock Settings Update -->
          <Card>
            <CardHeader class="pb-3">
              <div class="flex items-center space-x-2">
                <Checkbox 
                  id="updateStock" 
                  v-model:checked="updateFields.stock"
                />
                <Label for="updateStock" class="font-medium">Update Stock Settings</Label>
              </div>
            </CardHeader>
            <CardContent v-if="updateFields.stock" class="pt-0 space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="reorderPoint">Reorder Point</Label>
                  <Input
                    id="reorderPoint"
                    v-model="formData.reorderPoint"
                    type="number"
                    placeholder="Leave empty to keep existing"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="reorderQuantity">Reorder Quantity</Label>
                  <Input
                    id="reorderQuantity"
                    v-model="formData.reorderQuantity"
                    type="number"
                    placeholder="Leave empty to keep existing"
                  />
                </div>
              </div>

              <div class="space-y-2">
                <Label>Stock Tracking Options</Label>
                <div class="space-y-2">
                  <div class="flex items-center space-x-2">
                    <Checkbox id="trackStock" v-model:checked="formData.trackStock" />
                    <Label for="trackStock">Enable stock tracking</Label>
                  </div>
                  <div class="flex items-center space-x-2">
                    <Checkbox id="allowNegativeStock" v-model:checked="formData.allowNegativeStock" />
                    <Label for="allowNegativeStock">Allow negative stock</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Status Update -->
          <Card>
            <CardHeader class="pb-3">
              <div class="flex items-center space-x-2">
                <Checkbox 
                  id="updateStatus" 
                  v-model:checked="updateFields.status"
                />
                <Label for="updateStatus" class="font-medium">Update Status</Label>
              </div>
            </CardHeader>
            <CardContent v-if="updateFields.status" class="pt-0">
              <div class="space-y-2">
                <Label>Item Status</Label>
                <div class="flex space-x-4">
                  <div class="flex items-center space-x-2">
                    <input 
                      id="active" 
                      v-model="formData.isActive" 
                      type="radio" 
                      :value="true" 
                      name="status" 
                    />
                    <Label for="active">Active</Label>
                  </div>
                  <div class="flex items-center space-x-2">
                    <input 
                      id="inactive" 
                      v-model="formData.isActive" 
                      type="radio" 
                      :value="false" 
                      name="status" 
                    />
                    <Label for="inactive">Inactive</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Additional Fields -->
          <Card>
            <CardHeader class="pb-3">
              <div class="flex items-center space-x-2">
                <Checkbox 
                  id="updateAdditional" 
                  v-model:checked="updateFields.additional"
                />
                <Label for="updateAdditional" class="font-medium">Update Additional Fields</Label>
              </div>
            </CardHeader>
            <CardContent v-if="updateFields.additional" class="pt-0 space-y-4">
              <div class="space-y-2">
                <Label for="notes">Notes (will append to existing)</Label>
                <Textarea
                  id="notes"
                  v-model="formData.notes"
                  placeholder="Additional notes to append"
                  rows="2"
                />
              </div>

              <div class="space-y-2">
                <Label>Tax Settings</Label>
                <div class="flex items-center space-x-2">
                  <Checkbox id="isTaxable" v-model:checked="formData.isTaxable" />
                  <Label for="isTaxable">Items are taxable</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>

      <!-- Summary of Changes -->
      <div v-if="hasChanges" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 class="font-medium text-blue-900 mb-2">Summary of Changes</h4>
        <ul class="text-sm text-blue-800 space-y-1">
          <li v-if="updateFields.category && formData.categoryId">
            • Update category to: {{ getCategoryName(formData.categoryId) }}
          </li>
          <li v-if="updateFields.pricing && (formData.standardCost || formData.listPrice)">
            • Update pricing: 
            <span v-if="formData.standardCost">Standard Cost: ${{ formData.standardCost }}</span>
            <span v-if="formData.standardCost && formData.listPrice"> | </span>
            <span v-if="formData.listPrice">List Price: ${{ formData.listPrice }}</span>
          </li>
          <li v-if="updateFields.pricing && priceAdjustment.percentage">
            • Apply {{ priceAdjustment.percentage }}% {{ priceAdjustment.type }} to {{ priceAdjustment.applyTo }}
          </li>
          <li v-if="updateFields.stock && (formData.reorderPoint || formData.reorderQuantity)">
            • Update stock settings
          </li>
          <li v-if="updateFields.status">
            • Set all items to {{ formData.isActive ? 'Active' : 'Inactive' }}
          </li>
          <li v-if="updateFields.additional && formData.notes">
            • Append notes to all items
          </li>
        </ul>
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" @click="$emit('close')">
        Cancel
      </Button>
      <Button 
        @click="updateItems"
        :disabled="!hasChanges || updating"
      >
        <Loader2 v-if="updating" class="mr-2 h-4 w-4 animate-spin" />
        Update {{ items.length }} Items
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { Edit, Loader2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

// Props
const props = defineProps({
  items: {
    type: Array,
    default: () => []
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
const emit = defineEmits(['items-updated', 'close'])

// State
const updating = ref(false)

const updateFields = reactive({
  category: false,
  pricing: false,
  stock: false,
  status: false,
  additional: false
})

const formData = reactive({
  categoryId: '',
  standardCost: null,
  listPrice: null,
  reorderPoint: null,
  reorderQuantity: null,
  trackStock: null,
  allowNegativeStock: null,
  isActive: null,
  isTaxable: null,
  notes: ''
})

const priceAdjustment = reactive({
  percentage: null,
  type: 'increase',
  applyTo: 'both'
})

// Computed
const hasChanges = computed(() => {
  return Object.values(updateFields).some(field => field)
})

// Methods
const getCategoryName = (categoryId) => {
  const category = props.categories.find(c => c.id.toString() === categoryId)
  return category?.name || 'Unknown'
}

const updateItems = async () => {
  if (!hasChanges.value) return

  updating.value = true
  try {
    const updates = {}

    // Build update object based on selected fields
    if (updateFields.category && formData.categoryId) {
      updates.categoryId = parseInt(formData.categoryId)
    }

    if (updateFields.pricing) {
      if (formData.standardCost) {
        updates.standardCost = parseFloat(formData.standardCost)
      }
      if (formData.listPrice) {
        updates.listPrice = parseFloat(formData.listPrice)
      }
      
      // Handle percentage adjustments
      if (priceAdjustment.percentage && priceAdjustment.applyTo) {
        updates.priceAdjustment = {
          percentage: parseFloat(priceAdjustment.percentage),
          type: priceAdjustment.type,
          applyTo: priceAdjustment.applyTo
        }
      }
    }

    if (updateFields.stock) {
      if (formData.reorderPoint !== null) {
        updates.reorderPoint = parseInt(formData.reorderPoint) || 0
      }
      if (formData.reorderQuantity !== null) {
        updates.reorderQuantity = parseInt(formData.reorderQuantity) || 0
      }
      if (formData.trackStock !== null) {
        updates.trackStock = formData.trackStock
      }
      if (formData.allowNegativeStock !== null) {
        updates.allowNegativeStock = formData.allowNegativeStock
      }
    }

    if (updateFields.status && formData.isActive !== null) {
      updates.isActive = formData.isActive
    }

    if (updateFields.additional) {
      if (formData.notes) {
        updates.appendNotes = formData.notes
      }
      if (formData.isTaxable !== null) {
        updates.isTaxable = formData.isTaxable
      }
    }

    emit('items-updated', props.items, updates)
  } catch (error) {
    console.error('Error updating items:', error)
  } finally {
    updating.value = false
  }
}
</script>
