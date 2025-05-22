<template>
  <DialogContent class="sm:max-w-[675px]">
    <DialogHeader>
      <DialogTitle>{{ editMode ? 'Edit Reorder Rule' : 'Create Reorder Rule' }}</DialogTitle>
      <DialogDescription>
        {{ editMode ? 'Modify the settings for this reorder rule.' : 'Set up a new automatic reorder rule for inventory items.' }}
      </DialogDescription>
    </DialogHeader>
    
    <div class="py-4">
      <Tabs defaultValue="basic" class="w-full">
        <TabsList class="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Settings</TabsTrigger>
          <TabsTrigger value="threshold">Threshold & Quantity</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
        </TabsList>
        
        <!-- Basic Settings -->
        <TabsContent value="basic" class="space-y-4">
          <div class="space-y-4">
            <div class="grid grid-cols-1 gap-4">
              <div class="space-y-2">
                <Label for="name">Rule Name</Label>
                <Input 
                  id="name" 
                  v-model="ruleData.name" 
                  placeholder="Enter a descriptive name for this rule"
                />
              </div>
              
              <div class="space-y-2">
                <Label for="description">Description (optional)</Label>
                <Textarea 
                  id="description" 
                  v-model="ruleData.description" 
                  placeholder="Add details about this reorder rule" 
                />
              </div>

              <div class="space-y-2">
                <Label>Rule Status</Label>
                <Switch 
                  id="active-status" 
                  v-model:checked="ruleData.isActive" 
                  class="mt-1"
                />
                <Label for="active-status" class="ml-2">
                  {{ ruleData.isActive ? 'Active' : 'Inactive' }}
                </Label>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <!-- Threshold & Quantity -->
        <TabsContent value="threshold" class="space-y-4">
          <div class="grid grid-cols-1 gap-4">
            <div class="space-y-2">
              <Label>Rule Scope</Label>
              <div class="flex flex-wrap gap-4 mt-1">
                <div class="min-w-[150px] flex items-center space-x-2">
                  <Switch 
                    id="all-items" 
                    v-model:checked="ruleData.applyToAllItems" 
                    @update:checked="toggleAllItems"
                  />
                  <Label for="all-items">All Items</Label>
                </div>
                <div class="min-w-[150px] flex items-center space-x-2">
                  <Switch 
                    id="all-categories" 
                    v-model:checked="ruleData.applyToAllCategories" 
                    @update:checked="toggleAllCategories"
                  />
                  <Label for="all-categories">All Categories</Label>
                </div>
                <div class="min-w-[150px] flex items-center space-x-2">
                  <Switch 
                    id="all-locations" 
                    v-model:checked="ruleData.applyToAllLocations" 
                    @update:checked="toggleAllLocations"
                  />
                  <Label for="all-locations">All Locations</Label>
                </div>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div v-if="!ruleData.applyToAllItems" class="space-y-2">
                <Label for="item-select">Specific Item</Label>
                <Select v-model="ruleData.itemId">
                  <SelectTrigger id="item-select">
                    <SelectValue placeholder="Select item" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select item</SelectItem>
                    <SelectItem 
                      v-for="item in items" 
                      :key="item.id" 
                      :value="item.id"
                    >
                      {{ item.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div v-if="!ruleData.applyToAllCategories" class="space-y-2">
                <Label for="category-select">Specific Category</Label>
                <Select v-model="ruleData.categoryId">
                  <SelectTrigger id="category-select">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Select category</SelectItem>
                    <SelectItem 
                      v-for="category in categories" 
                      :key="category.id" 
                      :value="category.id"
                    >
                      {{ category.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div v-if="!ruleData.applyToAllLocations" class="space-y-2">
                <Label for="location-select">Specific Location</Label>
                <Select v-model="ruleData.locationId">
                  <SelectTrigger id="location-select">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Select location</SelectItem>
                    <SelectItem 
                      v-for="location in locations" 
                      :key="location.id" 
                      :value="location.id"
                    >
                      {{ location.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Separator />
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="threshold-type">Threshold Type</Label>
                <Select 
                  v-model="ruleData.thresholdType"
                  @update:modelValue="handleThresholdTypeChange"
                >
                  <SelectTrigger id="threshold-type">
                    <SelectValue placeholder="Select threshold type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="absolute">Absolute Value</SelectItem>
                    <SelectItem value="percentage">Percentage of Max Stock</SelectItem>
                    <SelectItem value="dynamic">Dynamic (Based on Usage)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div class="space-y-2">
                <Label for="threshold-value">
                  {{ getThresholdValueLabel() }}
                </Label>
                <div class="relative">
                  <Input 
                    id="threshold-value"
                    v-model="ruleData.thresholdValue"
                    type="number"
                    :min="1"
                    :max="ruleData.thresholdType === 'percentage' ? 100 : undefined"
                    :step="ruleData.thresholdType === 'percentage' ? 1 : undefined"
                  />
                  <span 
                    v-if="ruleData.thresholdType === 'percentage'" 
                    class="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    %
                  </span>
                </div>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="reorder-type">Reorder Quantity</Label>
                <Select 
                  v-model="ruleData.reorderQuantityType"
                  @update:modelValue="handleReorderTypeChange"
                >
                  <SelectTrigger id="reorder-type">
                    <SelectValue placeholder="Select reorder method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Quantity</SelectItem>
                    <SelectItem value="days_of_supply">Days of Supply</SelectItem>
                    <SelectItem value="economic_order_quantity">Economic Order Quantity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div 
                v-if="ruleData.reorderQuantityType !== 'economic_order_quantity'" 
                class="space-y-2"
              >
                <Label for="reorder-value">
                  {{ getReorderValueLabel() }}
                </Label>
                <Input 
                  id="reorder-value"
                  v-model="ruleData.reorderQuantityValue"
                  type="number"
                  :min="1"
                  :step="1"
                />
              </div>
            </div>
          </div>
        </TabsContent>
        
        <!-- Advanced Options -->
        <TabsContent value="advanced" class="space-y-4">
          <div class="grid grid-cols-1 gap-4">
            <div class="space-y-2">
              <Label>Automation Options</Label>
              <div class="flex flex-col gap-3 mt-2">
                <div class="flex items-center space-x-2">
                  <Switch 
                    id="notify-users" 
                    v-model:checked="ruleData.notifyUsers" 
                  />
                  <Label for="notify-users">Notify users when reorder point is reached</Label>
                </div>
                <div class="flex items-center space-x-2">
                  <Switch 
                    id="auto-create" 
                    v-model:checked="ruleData.autoCreateOrder" 
                  />
                  <Label for="auto-create">Auto-generate purchase order</Label>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div class="space-y-2" v-if="ruleData.autoCreateOrder">
              <Label for="supplier-select">Preferred Supplier</Label>
              <Select v-model="ruleData.preferredSupplierId">
                <SelectTrigger id="supplier-select">
                  <SelectValue placeholder="Select preferred supplier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Select supplier</SelectItem>
                  <SelectItem 
                    v-for="supplier in suppliers" 
                    :key="supplier.id" 
                    :value="supplier.id"
                  >
                    {{ supplier.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
    
    <!-- Error message -->
    <div v-if="error" class="text-sm text-destructive">
      {{ error }}
    </div>
    
    <DialogFooter>
      <Button variant="outline" @click="close">Cancel</Button>
      <Button type="submit" @click="saveRule">Save</Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { 
  Dialog,
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const props = defineProps({
  editMode: { type: Boolean, default: false },
  rule: { type: Object, default: null },
  categories: { type: Array, default: () => [] },
  locations: { type: Array, default: () => [] },
  items: { type: Array, default: () => [] },
  suppliers: { type: Array, default: () => [] },
})

const emit = defineEmits(['save-rule', 'close'])

// Default rule data structure
const defaultRule = {
  id: null,
  name: '',
  description: '',
  thresholdType: 'absolute',
  thresholdValue: 10,
  isActive: true,
  applyToAllItems: false,
  applyToAllLocations: false,
  applyToAllCategories: false,
  itemId: '',
  locationId: '',
  categoryId: '',
  reorderQuantityType: 'fixed',
  reorderQuantityValue: 10,
  notifyUsers: true,
  autoCreateOrder: false,
  preferredSupplierId: ''
}

// Initialize rule data from props or default
const ruleData = reactive(props.editMode && props.rule 
  ? { ...defaultRule, ...props.rule } 
  : { ...defaultRule }
)

// State for validation and errors
const error = ref('')

// Watch for changes in props.rule
watch(() => props.rule, (newRule) => {
  if (newRule && props.editMode) {
    Object.assign(ruleData, { ...defaultRule, ...newRule })
  }
}, { deep: true })

// Helper methods for labels and form behaviors
const getThresholdValueLabel = () => {
  switch (ruleData.thresholdType) {
    case 'absolute': return 'Reorder When Stock Falls Below'
    case 'percentage': return 'Reorder at Percentage of Max Stock'
    case 'dynamic': return 'Safety Stock Factor'
    default: return 'Threshold Value'
  }
}

const getReorderValueLabel = () => {
  switch (ruleData.reorderQuantityType) {
    case 'fixed': return 'Fixed Quantity'
    case 'days_of_supply': return 'Days of Supply'
    default: return 'Value'
  }
}

const handleThresholdTypeChange = (value) => {
  switch (value) {
    case 'absolute':
      ruleData.thresholdValue = 10
      break
    case 'percentage':
      ruleData.thresholdValue = 20 // 20%
      break
    case 'dynamic':
      ruleData.thresholdValue = 1.5 // Safety factor
      break
  }
}

const handleReorderTypeChange = (value) => {
  switch (value) {
    case 'fixed':
      ruleData.reorderQuantityValue = 10
      break
    case 'days_of_supply':
      ruleData.reorderQuantityValue = 30 // 30 days
      break
    case 'economic_order_quantity':
      ruleData.reorderQuantityValue = null // Calculated automatically
      break
  }
}

// Toggle methods for scope switches
const toggleAllItems = (checked) => {
  if (checked) {
    ruleData.itemId = ''
  }
}

const toggleAllCategories = (checked) => {
  if (checked) {
    ruleData.categoryId = ''
  }
}

const toggleAllLocations = (checked) => {
  if (checked) {
    ruleData.locationId = ''
  }
}

// Form validation
const validateForm = () => {
  if (!ruleData.name || ruleData.name.trim() === '') {
    error.value = 'Rule name is required'
    return false
  }
  
  if (!ruleData.applyToAllItems && !ruleData.itemId && 
      !ruleData.applyToAllCategories && !ruleData.categoryId && 
      !ruleData.applyToAllLocations && !ruleData.locationId) {
    error.value = 'You must select at least one item, category, or location, or apply to all'
    return false
  }
  
  if (ruleData.thresholdType === 'percentage' && 
     (ruleData.thresholdValue <= 0 || ruleData.thresholdValue > 100)) {
    error.value = 'Percentage threshold must be between 1 and 100'
    return false
  }
  
  if (ruleData.thresholdValue <= 0) {
    error.value = 'Threshold value must be greater than 0'
    return false
  }
  
  if (ruleData.reorderQuantityType !== 'economic_order_quantity' && 
      (!ruleData.reorderQuantityValue || ruleData.reorderQuantityValue <= 0)) {
    error.value = 'Reorder quantity must be greater than 0'
    return false
  }
  
  if (ruleData.autoCreateOrder && !ruleData.preferredSupplierId) {
    error.value = 'Please select a preferred supplier for auto-generated orders'
    return false
  }
  
  return true
}

// Event handlers
const saveRule = () => {
  error.value = ''
  
  if (!validateForm()) {
    return
  }
  
  // If creating a new rule, reset the ID
  if (!props.editMode) {
    ruleData.id = null
  }
  
  emit('save-rule', { ...ruleData })
}

const close = () => {
  emit('close')
}
</script>