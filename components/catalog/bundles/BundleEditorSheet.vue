<template>
  <SheetContent class="flex flex-col h-full w-full sm:max-w-lg">
    <!-- Header remains the same -->
    <div class="flex items-center justify-between border-b px-6 py-4">
      <div>
        <h2 class="text-lg font-semibold">Edit Bundle</h2>
        <p class="text-sm text-muted-foreground">
          {{ bundle.name }}
        </p>
      </div>
      <Button variant="ghost" size="icon" @click="$emit('close')">
        <XIcon class="h-4 w-4" />
      </Button>
    </div>

    <div class="flex-1 overflow-y-auto p-6 space-y-8">
      <!-- Basic Information -->
      <div>
        <h3 class="text-base font-medium mb-4">Basic Information</h3>
        <div class="space-y-4">
          <!-- Name field remains the same -->
          <div class="space-y-2">
            <Label for="bundle-name">Bundle Name <span class="text-destructive">*</span></Label>
            <Input 
              id="bundle-name" 
              v-model="formData.name" 
              placeholder="Enter bundle name"
              :class="{ 'border-destructive': validationErrors.name }"
            />
            <p v-if="validationErrors.name" class="text-sm text-destructive">
              {{ validationErrors.name }}
            </p>
          </div>

          <!-- SKU field remains the same -->
          <div class="space-y-2">
            <Label for="bundle-sku">SKU <span class="text-destructive">*</span></Label>
            <Input 
              id="bundle-sku" 
              v-model="formData.sku" 
              placeholder="Enter SKU"
              :class="{ 'border-destructive': validationErrors.sku }"
            />
            <p v-if="validationErrors.sku" class="text-sm text-destructive">
              {{ validationErrors.sku }}
            </p>
          </div>

          <!-- Description field remains the same -->
          <div class="space-y-2">
            <Label for="bundle-description">Description</Label>
            <Textarea 
              id="bundle-description" 
              v-model="formData.description" 
              placeholder="Enter bundle description"
              rows="4"
            />
          </div>

          <!-- Status field remains the same -->
          <div class="space-y-2">
            <Label for="bundle-status">Status</Label>
            <Select v-model="formData.status">
              <SelectTrigger id="bundle-status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Categories field with vue-multiselect -->
          <div class="space-y-2">
            <Label>Categories</Label>
            <Multiselect
              v-model="formData.categories"
              :options="categoriesOptions"
              :multiple="true"
              :close-on-select="false"
              :clear-on-select="false"
              :preserve-search="true"
              placeholder="Select categories"
              label="label"
              track-by="value"
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
      </div>

      <Separator />

      <!-- Rest of the form remains the same -->
      <!-- Pricing section -->
      <div>
        <h3 class="text-base font-medium mb-4">Pricing</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="bundle-price">Price <span class="text-destructive">*</span></Label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
              <Input 
                id="bundle-price" 
                v-model="formData.price" 
                type="number" 
                step="0.01"
                class="pl-7"
                :class="{ 'border-destructive': validationErrors.price }"
              />
            </div>
            <p v-if="validationErrors.price" class="text-sm text-destructive">
              {{ validationErrors.price }}
            </p>
          </div>

          <!-- Other pricing fields remain the same -->
          <!-- ... -->
        </div>
      </div>

      <!-- Rest of component remains unchanged -->
      <!-- ... -->
    </div>

    <div class="flex items-center justify-end gap-2 border-t px-6 py-4">
      <Button variant="outline" @click="$emit('close')">Cancel</Button>
      <Button @click="saveBundle" :disabled="isSubmitting">
        <Loader2Icon v-if="isSubmitting" class="h-4 w-4 mr-2 animate-spin" />
        <span v-else>Save Changes</span>
      </Button>
    </div>
  </SheetContent>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { 
  XIcon, 
  PackageIcon,
  Loader2Icon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { SheetContent } from '@/components/ui/sheet' // Add this import
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.css'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const props = defineProps({
  bundle: {
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
  }
})

const emit = defineEmits(['bundle-updated', 'close', 'manage-bundle-items'])

// Form state initialized with bundle data
const formData = reactive({
  id: '',
  name: '',
  sku: '',
  description: '',
  price: null,
  compareAtPrice: null,
  cost: null,
  status: 'active',
  categories: [],
  seo: {
    title: '',
    metaDescription: '',
    slug: ''
  },
  visibility: {
    webstore: true,
    b2bPortal: true,
    marketplace: false
  },
  inventory: {
    dynamicStock: true,
    minComponentQuantity: 1,
    lowStockThreshold: 5
  }
})

// Validation
const validationErrors = reactive({
  name: '',
  sku: '',
  price: ''
})

const isSubmitting = ref(false)

// Computed
const categoriesOptions = computed(() => {
  return props.categories.map(category => ({
    value: category.id,
    label: category.name
  }))
})

// Initialize form data from bundle
onMounted(() => {
  initializeFormData()
})

function initializeFormData() {
  // Basic info
  formData.id = props.bundle.id
  formData.name = props.bundle.name || ''
  formData.sku = props.bundle.sku || ''
  formData.description = props.bundle.description || ''
  formData.status = props.bundle.status || 'draft'
  
  // Convert category IDs to option objects for vue-multiselect
  if (props.bundle.categories && props.bundle.categories.length) {
    // We need to convert simple ID values to option objects that vue-multiselect expects
    formData.categories = props.bundle.categories.map(catId => {
      const category = props.categories.find(c => c.id === catId)
      return category ? { value: catId, label: category.name } : null
    }).filter(Boolean)
  } else {
    formData.categories = []
  }
  
  // Pricing
  formData.price = props.bundle.price || null
  formData.compareAtPrice = props.bundle.compareAtPrice || null
  formData.cost = props.bundle.cost || null
  
  // SEO
  formData.seo = {
    title: props.bundle.seo?.title || '',
    metaDescription: props.bundle.seo?.metaDescription || '',
    slug: props.bundle.seo?.slug || ''
  }
  
  // Visibility
  formData.visibility = {
    webstore: props.bundle.visibility?.webstore ?? true,
    b2bPortal: props.bundle.visibility?.b2bPortal ?? true,
    marketplace: props.bundle.visibility?.marketplace ?? false
  }
  
  // Inventory
  formData.inventory = {
    dynamicStock: props.bundle.inventory?.dynamicStock ?? true,
    minComponentQuantity: props.bundle.inventory?.minComponentQuantity || 1,
    lowStockThreshold: props.bundle.inventory?.lowStockThreshold || 5
  }
}

// Utility functions
function getProductName(productId) {
  const product = props.products.find(p => p.id === productId)
  return product ? product.name : 'Unknown Product'
}

function getProductImage(productId) {
  const product = props.products.find(p => p.id === productId)
  if (!product || !product.images || !product.images.length) return null
  
  const defaultImage = product.images.find(img => img.isDefault)
  return defaultImage ? defaultImage.url : product.images[0].url
}

function getVariantName(productId, variantId) {
  const product = props.products.find(p => p.id === productId)
  if (!product || !product.variants) return 'Unknown Variant'
  
  const variant = product.variants.find(v => v.id === variantId)
  return variant ? (variant.name || variant.sku) : 'Unknown Variant'
}

function validateForm() {
  let isValid = true
  
  // Reset errors
  validationErrors.name = ''
  validationErrors.sku = ''
  validationErrors.price = ''
  
  // Validate name
  if (!formData.name.trim()) {
    validationErrors.name = 'Bundle name is required'
    isValid = false
  }
  
  // Validate SKU
  if (!formData.sku.trim()) {
    validationErrors.sku = 'SKU is required'
    isValid = false
  }
  
  // Validate price
  if (formData.price === null || formData.price === '') {
    validationErrors.price = 'Price is required'
    isValid = false
  } else if (parseFloat(formData.price) < 0) {
    validationErrors.price = 'Price cannot be negative'
    isValid = false
  }
  
  return isValid
}

function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
}

// Save changes
function saveBundle() {
  if (!validateForm()) {
    return
  }
  
  isSubmitting.value = true
  
  // Prepare updated bundle data
  const updatedBundle = {
    ...props.bundle,
    ...formData,
    // Extract category IDs from the category objects provided by vue-multiselect
    categories: formData.categories.map(cat => cat.value),
    price: parseFloat(formData.price),
    compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
    cost: formData.cost ? parseFloat(formData.cost) : null
  }
  
  // If SEO slug not provided, generate one from name
  if (!updatedBundle.seo.slug) {
    updatedBundle.seo.slug = generateSlug(updatedBundle.name)
  }
  
  // If SEO title not provided, use bundle name
  if (!updatedBundle.seo.title) {
    updatedBundle.seo.title = updatedBundle.name
  }
  
  // Convert categories to numbers if they are strings
  updatedBundle.categories = updatedBundle.categories.map(cat => 
    typeof cat === 'string' ? parseInt(cat) : cat
  )
  
  // Simulate API delay
  setTimeout(() => {
    emit('bundle-updated', updatedBundle)
    isSubmitting.value = false
  }, 500)
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