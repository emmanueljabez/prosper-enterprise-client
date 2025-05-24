<template>
  <DialogContent class="sm:max-w-[700px] max-h-[90vh] flex flex-col">
    <DialogHeader class="px-6 pt-6">
      <DialogTitle>Edit Product Alternative</DialogTitle>
      <DialogDescription>
        Update product alternative relationship settings
      </DialogDescription>
    </DialogHeader>
    
    <div class="flex-1 overflow-y-auto px-6">
      <form @submit.prevent="submitForm" id="alternative-form" class="py-4">
        <div class="grid gap-6">
          <!-- Basic Information -->
          <div class="space-y-4">
            <div class="space-y-2">
              <Label for="name">Name</Label>
              <Input 
                id="name" 
                v-model="formData.name" 
                placeholder="Enter alternative name"
                :class="{ 'border-red-500': errors.name }"
              />
              <p v-if="errors.name" class="text-xs text-red-500">{{ errors.name }}</p>
            </div>
            
            <div class="space-y-2">
              <Label for="description">Description</Label>
              <Textarea 
                id="description" 
                v-model="formData.description" 
                placeholder="Enter alternative description"
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
          
          <!-- Product Selection -->
          <div class="space-y-4">
            <h3 class="text-sm font-medium">Product Relationship</h3>
            
            <div class="space-y-2">
              <Label for="primaryProductId">Primary Product</Label>
              <Select 
                v-model="formData.primaryProductId"
                :class="{ 'border-red-500': errors.primaryProductId }"
              >
                <SelectTrigger id="primaryProductId">
                  <SelectValue placeholder="Select primary product" />
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
              <p v-if="errors.primaryProductId" class="text-xs text-red-500">{{ errors.primaryProductId }}</p>
            </div>
            
            <div class="space-y-2">
              <Label for="alternativeProductId">Alternative Product</Label>
              <Select 
                v-model="formData.alternativeProductId"
                :class="{ 'border-red-500': errors.alternativeProductId }"
              >
                <SelectTrigger id="alternativeProductId">
                  <SelectValue placeholder="Select alternative product" />
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
              <p v-if="errors.alternativeProductId" class="text-xs text-red-500">{{ errors.alternativeProductId }}</p>
            </div>
            
            <div class="space-y-2">
              <Label for="relationship">Relationship Type</Label>
              <Select 
                v-model="formData.relationship"
                :class="{ 'border-red-500': errors.relationship }"
              >
                <SelectTrigger id="relationship">
                  <SelectValue placeholder="Select relationship type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="substitute">Substitute</SelectItem>
                  <SelectItem value="accessory">Accessory</SelectItem>
                  <SelectItem value="complementary">Complementary</SelectItem>
                  <SelectItem value="upgraded_version">Upgraded Version</SelectItem>
                </SelectContent>
              </Select>
              <p v-if="errors.relationship" class="text-xs text-red-500">{{ errors.relationship }}</p>
            </div>
            
            <div class="space-y-2">
              <Label for="conversionRate">Conversion Rate</Label>
              <Input 
                id="conversionRate" 
                type="number" 
                step="0.01"
                v-model.number="formData.conversionRate" 
                placeholder="Leave empty if not applicable"
              />
              <p class="text-xs text-muted-foreground">
                For items sold in different units (e.g., 1 pack = 5 individual items)
              </p>
            </div>
            
            <div class="space-y-2">
              <Label for="displayOrder">Display Order</Label>
              <Input 
                id="displayOrder" 
                type="number" 
                v-model.number="formData.displayOrder" 
                placeholder="1"
                :class="{ 'border-red-500': errors.displayOrder }"
              />
              <p v-if="errors.displayOrder" class="text-xs text-red-500">{{ errors.displayOrder }}</p>
              <p class="text-xs text-muted-foreground">
                Order in which alternatives are displayed (lower numbers first)
              </p>
            </div>
          </div>
          
          <Separator />
          
          <!-- Display Options -->
          <div class="space-y-4">
            <h3 class="text-sm font-medium">Display Options</h3>
            
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <Label for="automaticSubstitution" class="cursor-pointer">Automatic Substitution</Label>
                <Switch id="automaticSubstitution" v-model="formData.automaticSubstitution" />
              </div>
              <p class="text-xs text-muted-foreground">
                Automatically substitute this product when primary is out of stock
              </p>
            </div>
            
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <Label for="displayOnProductPage" class="cursor-pointer">Show on Product Page</Label>
                <Switch id="displayOnProductPage" v-model="formData.displayOnProductPage" />
              </div>
              <p class="text-xs text-muted-foreground">
                Display this alternative on the primary product's page
              </p>
            </div>
            
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <Label for="displayInCart" class="cursor-pointer">Show in Cart</Label>
                <Switch id="displayInCart" v-model="formData.displayInCart" />
              </div>
              <p class="text-xs text-muted-foreground">
                Suggest this alternative in the shopping cart
              </p>
            </div>
            
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <Label for="displayWhenOutOfStock" class="cursor-pointer">Show When Out of Stock</Label>
                <Switch id="displayWhenOutOfStock" v-model="formData.displayWhenOutOfStock" />
              </div>
              <p class="text-xs text-muted-foreground">
                Display this alternative when the primary product is out of stock
              </p>
            </div>
            
            <!-- Tags -->
            <div class="space-y-2">
              <Label for="tags">Tags</Label>
              <TagsInput 
                v-model="formData.tags" 
                placeholder="Add tags (press Enter to add)"
              />
              <p class="text-xs text-muted-foreground">
                Optional tags for categorizing alternatives
              </p>
            </div>
          </div>
          
          <!-- Updated metadata -->
          <div class="text-xs text-muted-foreground">
            <p>Last Updated: {{ formatDate(props.alternative.updatedAt) }}</p>
            <p v-if="props.alternative.updatedBy">Updated By: {{ props.alternative.updatedBy }}</p>
          </div>
        </div>
      </form>
    </div>
    
    <DialogFooter class="px-6 py-4 border-t">
      <Button type="button" variant="outline" @click="$emit('close')">
        Cancel
      </Button>
      <Button type="submit" form="alternative-form" :disabled="isSubmitting">
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

const props = defineProps({
  alternative: {
    type: Object,
    required: true
  },
  products: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['alternative-updated', 'close'])

// Form data initialized with empty values
const formData = ref({
  id: '',
  name: '',
  description: '',
  active: true,
  priority: 100,
  primaryProductId: '',
  alternativeProductId: '',
  relationship: 'substitute',
  conversionRate: null,
  displayOrder: 1,
  automaticSubstitution: false,
  displayOnProductPage: true,
  displayInCart: true,
  displayWhenOutOfStock: true,
  tags: []
})

// Form state
const errors = ref({})
const isSubmitting = ref(false)

// Helper functions
function formatDate(dateString) {
  try {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a')
  } catch (e) {
    return dateString
  }
}

function validateForm() {
  errors.value = {}
  
  if (!formData.value.name.trim()) {
    errors.value.name = 'Name is required'
  }
  
  if (formData.value.priority === null || formData.value.priority === undefined) {
    errors.value.priority = 'Priority is required'
  }
  
  if (!formData.value.primaryProductId) {
    errors.value.primaryProductId = 'Primary product is required'
  }
  
  if (!formData.value.alternativeProductId) {
    errors.value.alternativeProductId = 'Alternative product is required'
  }
  
  if (formData.value.primaryProductId === formData.value.alternativeProductId) {
    errors.value.alternativeProductId = 'Alternative product must be different from primary product'
  }
  
  if (!formData.value.relationship) {
    errors.value.relationship = 'Relationship type is required'
  }
  
  if (formData.value.displayOrder === null || formData.value.displayOrder === undefined) {
    errors.value.displayOrder = 'Display order is required'
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
    const updatedAlternative = {
      ...formData.value,
      updatedAt: new Date().toISOString()
    }
    
    emit('alternative-updated', updatedAlternative)
  } catch (error) {
    console.error('Error updating product alternative:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Initialize form data from props
onMounted(() => {
  // Clone the alternative to avoid modifying props directly
  const alternative = { ...props.alternative }
  
  // Initialize the form with the alternative data
  formData.value = {
    id: alternative.id,
    name: alternative.name || '',
    description: alternative.description || '',
    active: alternative.active !== undefined ? alternative.active : true,
    priority: alternative.priority || 100,
    primaryProductId: alternative.primaryProductId || '',
    alternativeProductId: alternative.alternativeProductId || '',
    relationship: alternative.relationship || 'substitute',
    conversionRate: alternative.conversionRate || null,
    displayOrder: alternative.displayOrder || 1,
    automaticSubstitution: alternative.automaticSubstitution !== undefined ? alternative.automaticSubstitution : false,
    displayOnProductPage: alternative.displayOnProductPage !== undefined ? alternative.displayOnProductPage : true,
    displayInCart: alternative.displayInCart !== undefined ? alternative.displayInCart : true,
    displayWhenOutOfStock: alternative.displayWhenOutOfStock !== undefined ? alternative.displayWhenOutOfStock : true,
    tags: alternative.tags || []
  }
})
</script>