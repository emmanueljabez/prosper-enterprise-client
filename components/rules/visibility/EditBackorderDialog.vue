<template>
  <DialogContent class="sm:max-w-[700px] max-h-[90vh] flex flex-col">
    <DialogHeader class="px-6 pt-6">
      <DialogTitle>Edit Backorder Setting</DialogTitle>
      <DialogDescription>
        Update backorder settings for inventory items
      </DialogDescription>
    </DialogHeader>
    
    <div class="flex-1 overflow-y-auto px-6">
      <form @submit.prevent="submitForm" id="backorder-form" class="py-4">
        <div class="grid gap-6">
          <!-- Basic Information -->
          <div class="space-y-4">
            <div class="space-y-2">
              <Label for="name">Setting Name</Label>
              <Input 
                id="name" 
                v-model="formData.name" 
                placeholder="Enter setting name"
                :class="{ 'border-red-500': errors.name }"
              />
              <p v-if="errors.name" class="text-xs text-red-500">{{ errors.name }}</p>
            </div>
            
            <div class="space-y-2">
              <Label for="description">Description</Label>
              <Textarea 
                id="description" 
                v-model="formData.description" 
                placeholder="Enter setting description"
                rows="2"
              />
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="priority">Priority</Label>
                <Input 
                  id="priority" 
                  type="number" 
                  v-model.number="formData.priority" 
                  placeholder="100"
                  :class="{ 'border-red-500': errors.priority }"
                />
                <p v-if="errors.priority" class="text-xs text-red-500">{{ errors.priority }}</p>
                <p class="text-xs text-muted-foreground">
                  Higher priority settings take precedence
                </p>
              </div>
              
              <div class="space-y-2">
                <Label for="active">Status</Label>
                <div class="flex items-center space-x-2 pt-2">
                  <Switch id="active" v-model="formData.active" />
                  <Label for="active">{{ formData.active ? 'Active' : 'Inactive' }}</Label>
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <!-- Backorder Configuration -->
          <div class="space-y-4">
            <h3 class="text-sm font-medium">Backorder Configuration</h3>
            
            <div class="space-y-2">
              <Label for="scope">Setting Scope</Label>
              <Select 
                v-model="formData.scope" 
                @update:modelValue="handleScopeChange"
                :class="{ 'border-red-500': errors.scope }"
              >
                <SelectTrigger id="scope">
                  <SelectValue placeholder="Select setting scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Global (All Products)</SelectItem>
                  <SelectItem value="category">Category Based</SelectItem>
                  <SelectItem value="product">Product Based</SelectItem>
                  <SelectItem value="item">Item Based</SelectItem>
                </SelectContent>
              </Select>
              <p v-if="errors.scope" class="text-xs text-red-500">{{ errors.scope }}</p>
            </div>
            
            <!-- Category Selection (when scope is category) -->
            <div v-if="formData.scope === 'category'" class="space-y-2">
              <Label for="categories">Categories</Label>
              <Multiselect
                v-model="formData.categoryIds"
                :options="categoriesOptions"
                :multiple="true"
                :close-on-select="false"
                :clear-on-select="false"
                :preserve-search="true"
                placeholder="Select categories"
                label="label"
                track-by="value"
                :preselect-first="false"
                :class="{ 'multiselect-error': errors.categoryIds }"
              >
                <template #selection="{ values, search, isOpen }">
                  <span class="multiselect__single" v-if="values.length && !isOpen">
                    {{ values.length }} categories selected
                  </span>
                </template>
              </Multiselect>
              <p v-if="errors.categoryIds" class="text-xs text-red-500">{{ errors.categoryIds }}</p>
            </div>
            
            <!-- Product Selection (when scope is product) -->
            <div v-if="formData.scope === 'product'" class="space-y-2">
              <Label for="products">Products</Label>
              <Multiselect
                v-model="formData.productIds"
                :options="productsOptions"
                :multiple="true"
                :close-on-select="false"
                :clear-on-select="false"
                :preserve-search="true"
                placeholder="Select products"
                label="label"
                track-by="value"
                :preselect-first="false"
                :class="{ 'multiselect-error': errors.productIds }"
              >
                <template #selection="{ values, search, isOpen }">
                  <span class="multiselect__single" v-if="values.length && !isOpen">
                    {{ values.length }} products selected
                  </span>
                </template>
              </Multiselect>
              <p v-if="errors.productIds" class="text-xs text-red-500">{{ errors.productIds }}</p>
            </div>
            
            <!-- Item Selection (when scope is item) -->
            <div v-if="formData.scope === 'item'" class="space-y-2">
              <Label for="items">Items</Label>
              <Multiselect
                v-model="formData.itemIds"
                :options="itemsOptions"
                :multiple="true"
                :close-on-select="false"
                :clear-on-select="false"
                :preserve-search="true"
                placeholder="Select items"
                label="label"
                track-by="value"
                :preselect-first="false"
                :class="{ 'multiselect-error': errors.itemIds }"
              >
                <template #selection="{ values, search, isOpen }">
                  <span class="multiselect__single" v-if="values.length && !isOpen">
                    {{ values.length }} items selected
                  </span>
                </template>
              </Multiselect>
              <p v-if="errors.itemIds" class="text-xs text-red-500">{{ errors.itemIds }}</p>
            </div>
            
            <!-- Backorder Allowance -->
            <div class="space-y-2">
              <Label for="allowBackorders">Backorder Allowance</Label>
              <Select 
                v-model="formData.allowBackorders"
                :class="{ 'border-red-500': errors.allowBackorders }"
              >
                <SelectTrigger id="allowBackorders">
                  <SelectValue placeholder="Select allowance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not Allowed</SelectItem>
                  <SelectItem value="partial">Partial Backorders</SelectItem>
                  <SelectItem value="all">Full Backorders</SelectItem>
                </SelectContent>
              </Select>
              <p v-if="errors.allowBackorders" class="text-xs text-red-500">{{ errors.allowBackorders }}</p>
            </div>
            
            <!-- Backorder Limits (when backorders are allowed) -->
            <div v-if="formData.allowBackorders !== 'none'" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="maxBackorderQuantity">Maximum Quantity</Label>
                  <Input 
                    id="maxBackorderQuantity" 
                    type="number" 
                    v-model.number="formData.maxBackorderQuantity" 
                    placeholder="No limit"
                  />
                  <p class="text-xs text-muted-foreground">
                    Leave empty for no limit
                  </p>
                </div>
                
                <div class="space-y-2">
                  <Label for="maxBackorderDays">Maximum Days</Label>
                  <Input 
                    id="maxBackorderDays" 
                    type="number" 
                    v-model.number="formData.maxBackorderDays" 
                    placeholder="No limit"
                  />
                  <p class="text-xs text-muted-foreground">
                    Maximum wait time in days
                  </p>
                </div>
              </div>
              
              <div class="space-y-2">
                <Label for="expectedRestockDate">Expected Restock Date</Label>
                <Input 
                  id="expectedRestockDate" 
                  type="date" 
                  v-model="formData.expectedRestockDate" 
                />
                <p class="text-xs text-muted-foreground">
                  Optional estimated restock date
                </p>
              </div>
              
              <div class="space-y-2">
                <Label for="message">Customer Message</Label>
                <Textarea 
                  id="message" 
                  v-model="formData.message" 
                  placeholder="e.g., 'This item can be backordered and will ship when available'"
                  rows="2"
                />
              </div>
            </div>
            
            <!-- Display Options -->
            <div class="space-y-4">
              <h4 class="text-sm font-medium">Display Options</h4>
              
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <Label for="displayInSearch" class="cursor-pointer">Display in Search Results</Label>
                  <Switch id="displayInSearch" v-model="formData.displayInSearch" />
                </div>
                <p class="text-xs text-muted-foreground">
                  Show backordered items in search results
                </p>
              </div>
              
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <Label for="allowDiscounts" class="cursor-pointer">Allow Discounts</Label>
                  <Switch id="allowDiscounts" v-model="formData.allowDiscounts" />
                </div>
                <p class="text-xs text-muted-foreground">
                  Apply discounts to backordered items
                </p>
              </div>
              
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <Label for="requireApproval" class="cursor-pointer">Require Approval</Label>
                  <Switch id="requireApproval" v-model="formData.requireApproval" />
                </div>
                <p class="text-xs text-muted-foreground">
                  Require manager approval for backorders
                </p>
              </div>
            </div>
          </div>
          
          <!-- Updated metadata -->
          <div class="text-xs text-muted-foreground">
            <p>Last Updated: {{ formatDate(props.setting.updatedAt) }}</p>
            <p v-if="props.setting.updatedBy">Updated By: {{ props.setting.updatedBy }}</p>
          </div>
        </div>
      </form>
    </div>
    
    <DialogFooter class="px-6 py-4 border-t">
      <Button type="button" variant="outline" @click="$emit('close')">
        Cancel
      </Button>
      <Button type="submit" form="backorder-form" :disabled="isSubmitting">
        <Loader2Icon v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
        Save Changes
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { format } from 'date-fns'
import { Loader2Icon } from 'lucide-vue-next'
import Multiselect from 'vue-multiselect'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Import the vue-multiselect styles
import 'vue-multiselect/dist/vue-multiselect.css'

const props = defineProps({
  setting: {
    type: Object,
    required: true
  },
  categories: {
    type: Array,
    default: () => []
  },
  products: {
    type: Array,
    default: () => []
  },
  items: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['setting-updated', 'close'])

// Form data initialized with empty values
const formData = ref({
  id: '',
  name: '',
  description: '',
  active: true,
  priority: 100,
  scope: 'global',
  categoryIds: [],
  productIds: [],
  itemIds: [],
  allowBackorders: 'none',
  maxBackorderQuantity: null,
  maxBackorderDays: null,
  expectedRestockDate: '',
  message: '',
  displayInSearch: true,
  allowDiscounts: false,
  requireApproval: false,
  conditions: []
})

// Form state
const errors = ref({})
const isSubmitting = ref(false)

// Computed options for selects
const categoriesOptions = computed(() => {
  return props.categories.map(category => ({
    label: category.name,
    value: category.id
  }))
})

const productsOptions = computed(() => {
  return props.products.map(product => ({
    label: product.name,
    value: product.id
  }))
})

const itemsOptions = computed(() => {
  return props.items.map(item => ({
    label: item.name || `${item.sku}`,
    value: item.id
  }))
})

// Methods
function formatDate(dateString) {
  try {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a')
  } catch (e) {
    return dateString
  }
}

function handleScopeChange() {
  // Reset the relevant arrays when scope changes
  if (formData.value.scope !== 'category') {
    formData.value.categoryIds = []
  }
  if (formData.value.scope !== 'product') {
    formData.value.productIds = []
  }
  if (formData.value.scope !== 'item') {
    formData.value.itemIds = []
  }
}

function validateForm() {
  errors.value = {}
  
  if (!formData.value.name.trim()) {
    errors.value.name = 'Setting name is required'
  }
  
  if (formData.value.priority === null || formData.value.priority === undefined) {
    errors.value.priority = 'Priority is required'
  }
  
  if (!formData.value.scope) {
    errors.value.scope = 'Scope is required'
  }
  
  if (formData.value.scope === 'category' && (!formData.value.categoryIds || formData.value.categoryIds.length === 0)) {
    errors.value.categoryIds = 'At least one category must be selected'
  }
  
  if (formData.value.scope === 'product' && (!formData.value.productIds || formData.value.productIds.length === 0)) {
    errors.value.productIds = 'At least one product must be selected'
  }
  
  if (formData.value.scope === 'item' && (!formData.value.itemIds || formData.value.itemIds.length === 0)) {
    errors.value.itemIds = 'At least one item must be selected'
  }
  
  if (!formData.value.allowBackorders) {
    errors.value.allowBackorders = 'Backorder allowance is required'
  }
  
  return Object.keys(errors.value).length === 0
}

async function submitForm() {
  if (!validateForm()) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    // Format date if present
    let formattedData = { ...formData.value }
    
    if (formattedData.expectedRestockDate) {
      // Ensure the date is in ISO format for consistency
      const date = new Date(formattedData.expectedRestockDate)
      formattedData.expectedRestockDate = date.toISOString()
    }
    
    // Add updated timestamp
    formattedData.updatedAt = new Date().toISOString()
    
    emit('setting-updated', formattedData)
  } catch (error) {
    console.error('Error updating backorder setting:', error)
    // Could add error handling here
  } finally {
    isSubmitting.value = false
  }
}

// Initialize form data from props
onMounted(() => {
  // Clone the setting to avoid modifying props directly
  const setting = { ...props.setting }
  
  // Format the expected restock date for the date input if it exists
  let formattedRestockDate = ''
  if (setting.expectedRestockDate) {
    try {
      const date = new Date(setting.expectedRestockDate)
      formattedRestockDate = format(date, 'yyyy-MM-dd')
    } catch (e) {
      console.error('Error formatting restock date:', e)
      formattedRestockDate = ''
    }
  }
  
  // Initialize the form with the setting data
  formData.value = {
    id: setting.id,
    name: setting.name || '',
    description: setting.description || '',
    active: setting.active !== undefined ? setting.active : true,
    priority: setting.priority || 100,
    scope: setting.scope || 'global',
    categoryIds: setting.categoryIds || [],
    productIds: setting.productIds || [],
    itemIds: setting.itemIds || [],
    allowBackorders: setting.allowBackorders || 'none',
    maxBackorderQuantity: setting.maxBackorderQuantity || null,
    maxBackorderDays: setting.maxBackorderDays || null,
    expectedRestockDate: formattedRestockDate,
    message: setting.message || '',
    displayInSearch: setting.displayInSearch !== undefined ? setting.displayInSearch : true,
    allowDiscounts: setting.allowDiscounts !== undefined ? setting.allowDiscounts : false,
    requireApproval: setting.requireApproval !== undefined ? setting.requireApproval : false,
    conditions: setting.conditions || []
  }
})
</script>

<style>
/* Additional styling for vue-multiselect */
.multiselect-error {
  --ms-border-color-active: rgb(239, 68, 68);
  --ms-border-color: rgb(239, 68, 68);
}

.multiselect {
  min-height: 40px;
}

.multiselect__tags {
  min-height: 40px;
  padding: 6px 40px 0 8px;
  border-radius: 4px;
  border: 1px solid hsl(var(--input));
  background: hsl(var(--background));
}

.multiselect--active {
  z-index: 50;
}
</style>