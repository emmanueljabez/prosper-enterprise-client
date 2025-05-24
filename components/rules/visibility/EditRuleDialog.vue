<template>
  <DialogContent class="sm:max-w-[700px] max-h-[90vh] flex flex-col">
    <DialogHeader class="px-6 pt-6">
      <DialogTitle>Edit Visibility Rule</DialogTitle>
      <DialogDescription>
        Update visibility rule for out-of-stock items
      </DialogDescription>
    </DialogHeader>
    
    <div class="flex-1 overflow-y-auto px-6">
      <form @submit.prevent="submitForm" id="rule-form" class="py-4">
        <div class="grid gap-6">
          <!-- Basic Information -->
          <div class="space-y-4">
            <div class="space-y-2">
              <Label for="name">Rule Name</Label>
              <Input 
                id="name" 
                v-model="formData.name" 
                placeholder="Enter rule name"
                :class="{ 'border-red-500': errors.name }"
              />
              <p v-if="errors.name" class="text-xs text-red-500">{{ errors.name }}</p>
            </div>
            
            <div class="space-y-2">
              <Label for="description">Description</Label>
              <Textarea 
                id="description" 
                v-model="formData.description" 
                placeholder="Enter rule description"
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
                  Higher priority rules take precedence
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
          
          <!-- Rule Configuration -->
          <div class="space-y-4">
            <h3 class="text-sm font-medium">Rule Configuration</h3>
            
            <div class="space-y-2">
              <Label for="scope">Rule Scope</Label>
              <Select 
                v-model="formData.scope" 
                @update:modelValue="handleScopeChange"
                :class="{ 'border-red-500': errors.scope }"
              >
                <SelectTrigger id="scope">
                  <SelectValue placeholder="Select rule scope" />
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
            
            <!-- Stock Threshold -->
            <div class="space-y-2">
              <Label>Stock Threshold</Label>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <Select v-model="formData.stockThreshold.type">
                    <SelectTrigger>
                      <SelectValue placeholder="Threshold type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="absolute">Absolute Value</SelectItem>
                      <SelectItem value="percentage">Percentage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Input 
                    type="number" 
                    v-model.number="formData.stockThreshold.value" 
                    placeholder="Threshold value"
                    :class="{ 'border-red-500': errors.stockThreshold }"
                  />
                  <p v-if="errors.stockThreshold" class="text-xs text-red-500">{{ errors.stockThreshold }}</p>
                </div>
              </div>
              <p class="text-xs text-muted-foreground">
                Rule applies when stock is at or below this threshold
              </p>
            </div>
            
            <!-- Action Settings -->
            <div class="space-y-2">
              <Label for="action">Visibility Action</Label>
              <Select 
                v-model="formData.action"
                :class="{ 'border-red-500': errors.action }"
              >
                <SelectTrigger id="action">
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hide">Hide Product</SelectItem>
                  <SelectItem value="show">Show as Normal</SelectItem>
                  <SelectItem value="show_with_label">Show with Label</SelectItem>
                  <SelectItem value="show_with_message">Show with Message</SelectItem>
                  <SelectItem value="redirect">Redirect to Alternative</SelectItem>
                </SelectContent>
              </Select>
              <p v-if="errors.action" class="text-xs text-red-500">{{ errors.action }}</p>
            </div>
            
            <!-- Message (when action requires it) -->
            <div v-if="['show_with_label', 'show_with_message'].includes(formData.action)" class="space-y-2">
              <Label for="message">Display Message</Label>
              <Input 
                id="message" 
                v-model="formData.message" 
                placeholder="e.g., 'Out of stock' or 'Low stock - order soon'"
                :class="{ 'border-red-500': errors.message }"
              />
              <p v-if="errors.message" class="text-xs text-red-500">{{ errors.message }}</p>
            </div>
            
            <!-- Redirect Product (when action is redirect) -->
            <div v-if="formData.action === 'redirect'" class="space-y-2">
              <Label for="redirectProduct">Redirect to Product</Label>
              <Select 
                v-model="formData.redirectProductId"
                :class="{ 'border-red-500': errors.redirectProductId }"
              >
                <SelectTrigger id="redirectProduct">
                  <SelectValue placeholder="Select redirect product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem 
                    v-for="product in props.products" 
                    :key="product.id" 
                    :value="product.id"
                  >
                    {{ product.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p v-if="errors.redirectProductId" class="text-xs text-red-500">{{ errors.redirectProductId }}</p>
            </div>
            
            <!-- Tags -->
            <div class="space-y-2">
              <Label for="tags">Tags</Label>
              <TagInput 
                v-model="formData.tags" 
                placeholder="Add tags (press Enter to add)"
              />
              <p class="text-xs text-muted-foreground">
                Optional tags for categorizing and filtering rules
              </p>
            </div>
          </div>
          
          <!-- Updated metadata -->
          <div class="text-xs text-muted-foreground">
            <p>Last Updated: {{ formatDate(props.rule.updatedAt) }}</p>
            <p v-if="props.rule.updatedBy">Updated By: {{ props.rule.updatedBy }}</p>
          </div>
        </div>
      </form>
    </div>
    
    <DialogFooter class="px-6 py-4 border-t">
      <Button type="button" variant="outline" @click="$emit('close')">
        Cancel
      </Button>
      <Button type="submit" form="rule-form" :disabled="isSubmitting">
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
import {TagsInput} from '@/components/ui/tags-input'

// Import the vue-multiselect styles
import 'vue-multiselect/dist/vue-multiselect.css'

const props = defineProps({
  rule: {
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

const emit = defineEmits(['rule-updated', 'close'])

// Form data initialized with the existing rule data
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
  stockThreshold: {
    type: 'absolute',
    value: 0
  },
  action: 'hide',
  message: '',
  redirectProductId: '',
  displayOrder: 1,
  tags: []
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
    errors.value.name = 'Rule name is required'
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
  
  if (!formData.value.action) {
    errors.value.action = 'Action is required'
  }
  
  if (['show_with_label', 'show_with_message'].includes(formData.value.action) && !formData.value.message) {
    errors.value.message = 'Message is required for this action'
  }
  
  if (formData.value.action === 'redirect' && !formData.value.redirectProductId) {
    errors.value.redirectProductId = 'Redirect product is required for this action'
  }
  
  if (formData.value.stockThreshold && 
      (formData.value.stockThreshold.value === null || formData.value.stockThreshold.value === undefined)) {
    errors.value.stockThreshold = 'Threshold value is required'
  }
  
  return Object.keys(errors.value).length === 0
}

async function submitForm() {
  if (!validateForm()) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    // Create a copy of the form data to send to the parent
    const updatedRule = {
      ...formData.value,
      // Add any necessary transformations
      updatedAt: new Date().toISOString()
    }
    
    emit('rule-updated', updatedRule)
  } catch (error) {
    console.error('Error updating rule:', error)
    // Could add error handling here
  } finally {
    isSubmitting.value = false
  }
}

// Initialize form data from props
onMounted(() => {
  // Clone the rule to avoid modifying props directly
  const rule = { ...props.rule }
  
  // Initialize the form with the rule data
  formData.value = {
    id: rule.id,
    name: rule.name || '',
    description: rule.description || '',
    active: rule.active !== undefined ? rule.active : true,
    priority: rule.priority || 100,
    scope: rule.scope || 'global',
    categoryIds: rule.categoryIds || [],
    productIds: rule.productIds || [],
    itemIds: rule.itemIds || [],
    stockThreshold: {
      type: rule.stockThreshold?.type || 'absolute',
      value: rule.stockThreshold?.value || 0
    },
    action: rule.action || 'hide',
    message: rule.message || '',
    redirectProductId: rule.redirectProductId || '',
    displayOrder: rule.displayOrder || 1,
    tags: rule.tags || []
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