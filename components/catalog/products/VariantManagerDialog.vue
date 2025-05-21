<template>
  <DialogContent class="sm:max-w-5xl">
    <DialogHeader>
      <DialogTitle>Manage Product Variants</DialogTitle>
      <DialogDescription>
        Create and manage variants for "{{ product.name }}" ({{ product.sku }})
      </DialogDescription>
    </DialogHeader>

    <div class="py-4 overflow-y-auto max-h-[75vh]">
      <div class="space-y-6">
        <!-- Variant Configuration Section -->
        <div class="border rounded-md p-4 bg-muted/20 space-y-4">
          <h3 class="text-base font-medium">Variant Configuration</h3>
          <p class="text-sm text-muted-foreground">Select which attributes to use for creating variants.</p>
          
          <div class="space-y-4">
            <div v-for="attribute in variantAttributes" :key="attribute.code" class="flex items-center space-x-3">
              <Checkbox 
                :id="`use-attr-${attribute.code}`"
                :checked="usedVariantAttributes.includes(attribute.code)"
                @update:checked="toggleVariantAttribute(attribute.code)"
              />
              <div>
                <Label :for="`use-attr-${attribute.code}`" class="font-medium">{{ attribute.name }}</Label>
                <p v-if="attribute.options" class="text-xs text-muted-foreground">
                  {{ attribute.options.length }} options available
                </p>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end space-x-2 pt-2">
            <Button 
              variant="outline" 
              size="sm"
              @click="generateVariants"
              :disabled="usedVariantAttributes.length === 0"
            >
              <LayersIcon class="h-4 w-4 mr-2" />
              Generate Variants
            </Button>
          </div>
        </div>

        <!-- Variants Table -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-medium">Product Variants ({{ variants.length }})</h3>
            <Button variant="outline" size="sm" @click="addVariant">
              <PlusIcon class="h-4 w-4 mr-2" />
              Add Variant Manually
            </Button>
          </div>

          <div v-if="variants.length === 0" class="border rounded-md p-6 text-center">
            <LayersIcon class="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <h3 class="text-sm font-medium">No Variants Yet</h3>
            <p class="text-sm text-muted-foreground mt-1">
              Select attributes and generate variants, or add them manually.
            </p>
          </div>

          <div v-else class="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Variant</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Attributes</TableHead>
                  <TableHead class="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="(variant, index) in variants" :key="index">
                  <TableCell>
                    <Input 
                      v-model="variant.name" 
                      class="w-full" 
                      :class="{ 'border-destructive': getVariantError(index, 'name') }"
                    />
                    <p v-if="getVariantError(index, 'name')" class="text-xs text-destructive mt-1">
                      {{ getVariantError(index, 'name') }}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Input 
                      v-model="variant.sku" 
                      class="w-full"
                      :class="{ 'border-destructive': getVariantError(index, 'sku') }"
                    />
                    <p v-if="getVariantError(index, 'sku')" class="text-xs text-destructive mt-1">
                      {{ getVariantError(index, 'sku') }}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div class="flex space-x-1 items-center">
                      <span class="text-sm">$</span>
                      <Input 
                        v-model="variant.price" 
                        type="number" 
                        step="0.01" 
                        class="w-full"
                        :class="{ 'border-destructive': getVariantError(index, 'price') }"
                      />
                    </div>
                    <p v-if="getVariantError(index, 'price')" class="text-xs text-destructive mt-1">
                      {{ getVariantError(index, 'price') }}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div class="flex flex-col space-y-2">
                      <div class="flex space-x-1 items-center">
                        <Input 
                          v-model="variant.stock.quantity" 
                          type="number" 
                          class="w-full"
                          :class="{ 'border-destructive': getVariantError(index, 'stock.quantity') }"
                        />
                      </div>
                      <p v-if="getVariantError(index, 'stock.quantity')" class="text-xs text-destructive">
                        {{ getVariantError(index, 'stock.quantity') }}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div class="flex flex-wrap gap-1">
                      <Badge 
                        v-for="(value, key) in variant.attributes" 
                        :key="key" 
                        variant="outline"
                        class="text-xs"
                      >
                        {{ formatAttributeName(key) }}: {{ formatAttributeValue(key, value) }}
                      </Badge>
                      <Button 
                        v-if="Object.keys(variant.attributes).length === 0"
                        variant="ghost" 
                        size="sm"
                        @click="editVariantAttributes(index)"
                      >
                        <PlusIcon class="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div class="flex items-center space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        @click="editVariantAttributes(index)"
                      >
                        <PencilIcon class="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        @click="removeVariant(index)"
                      >
                        <TrashIcon class="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" @click="onCancel">Cancel</Button>
      <Button 
        @click="saveVariants" 
        :disabled="isSaving || hasErrors"
      >
        <Loader2Icon v-if="isSaving" class="mr-2 h-4 w-4 animate-spin" />
        Save Variants
      </Button>
    </DialogFooter>

    <!-- Edit Variant Attributes Dialog -->
    <Dialog :open="!!editingVariantIndex" @update:open="editingVariantIndex = null">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Variant Attributes</DialogTitle>
          <DialogDescription>
            Set attribute values for this variant.
          </DialogDescription>
        </DialogHeader>
        <div class="py-4">
          <div class="space-y-4">
            <div v-for="attribute in variantAttributes" :key="attribute.code" class="space-y-2">
              <Label :for="`edit-attr-${attribute.code}`">{{ attribute.name }}</Label>
              
              <Select 
                v-if="attribute.type === 'select' && attribute.options?.length" 
                v-model="currentEditingVariant.attributes[attribute.code]"
              >
                <SelectTrigger :id="`edit-attr-${attribute.code}`">
                  <SelectValue :placeholder="`Select ${attribute.name.toLowerCase()}`" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem 
                    v-for="option in attribute.options" 
                    :key="option.id" 
                    :value="option.value"
                  >
                    {{ option.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
              
              <Switch 
                v-else-if="attribute.type === 'boolean'"
                :id="`edit-attr-${attribute.code}`"
                v-model="currentEditingVariant.attributes[attribute.code]"
              />

              <Input 
                v-else
                :id="`edit-attr-${attribute.code}`"
                v-model="currentEditingVariant.attributes[attribute.code]"
                :placeholder="`Enter ${attribute.name.toLowerCase()}`"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="editingVariantIndex = null">Cancel</Button>
          <Button @click="saveVariantAttributes">Save Attributes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </DialogContent>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  LayersIcon,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  TrashIcon
} from 'lucide-vue-next'

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  attributes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['save', 'cancel'])

// State
const variants = ref(props.product.variants ? JSON.parse(JSON.stringify(props.product.variants)) : [])
const usedVariantAttributes = ref([])
const isSaving = ref(false)
const variantErrors = ref({})
const editingVariantIndex = ref(null)
const currentEditingVariant = reactive({
  attributes: {}
})

// Get attributes suitable for variants (usually select/dropdown attributes)
const variantAttributes = computed(() => {
  return props.attributes.filter(attr => 
    attr.type === 'select' || 
    attr.type === 'boolean' || 
    attr.type === 'color'
  )
})

// Check if there are validation errors
const hasErrors = computed(() => {
  return Object.keys(variantErrors.value).length > 0
})

// Helper Functions
function toggleVariantAttribute(code) {
  const index = usedVariantAttributes.value.indexOf(code)
  if (index === -1) {
    usedVariantAttributes.value.push(code)
  } else {
    usedVariantAttributes.value.splice(index, 1)
  }
}

function formatAttributeName(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/_/g, ' ')
}

function formatAttributeValue(key, value) {
  // Find the attribute
  const attribute = props.attributes.find(attr => attr.code === key)
  
  // Format boolean values
  if (attribute?.type === 'boolean') {
    return value ? 'Yes' : 'No'
  }
  
  // Format select values (find the label)
  if (attribute?.type === 'select' && attribute.options) {
    const option = attribute.options.find(opt => opt.value === value)
    return option ? option.label : value
  }
  
  return value
}

function getVariantError(index, field) {
  const indexKey = `${index}`
  if (variantErrors.value[indexKey] && variantErrors.value[indexKey][field]) {
    return variantErrors.value[indexKey][field]
  }
  return null
}

function validateVariants() {
  const errors = {}
  let isValid = true
  
  variants.value.forEach((variant, index) => {
    const variantErrors = {}
    
    if (!variant.name || !variant.name.trim()) {
      variantErrors.name = 'Name is required'
      isValid = false
    }
    
    if (!variant.sku || !variant.sku.trim()) {
      variantErrors.sku = 'SKU is required'
      isValid = false
    }
    
    if (!variant.price || isNaN(parseFloat(variant.price))) {
      variantErrors.price = 'Valid price is required'
      isValid = false
    } else if (parseFloat(variant.price) < 0) {
      variantErrors.price = 'Price must be positive'
      isValid = false
    }
    
    if (!variant.stock || variant.stock.quantity === undefined || variant.stock.quantity === null) {
      if (!variant.stock) variant.stock = {}
      variantErrors['stock.quantity'] = 'Quantity is required'
      isValid = false
    } else if (isNaN(parseInt(variant.stock.quantity))) {
      variantErrors['stock.quantity'] = 'Quantity must be a number'
      isValid = false
    } else if (parseInt(variant.stock.quantity) < 0) {
      variantErrors['stock.quantity'] = 'Quantity cannot be negative'
      isValid = false
    }
    
    // Add more validations as needed
    
    if (Object.keys(variantErrors).length > 0) {
      errors[index] = variantErrors
    }
  })
  
  variantErrors.value = errors
  return isValid
}

// Variant generation and management
function generateVariants() {
  if (usedVariantAttributes.value.length === 0) return
  
  // If we already have variants, confirm before replacing them
  if (variants.value.length > 0) {
    if (!confirm('This will replace your existing variants. Continue?')) {
      return
    }
  }
  
  const newVariants = []
  
  // Get all selected attributes
  const selectedAttributes = usedVariantAttributes.value.map(code => {
    return props.attributes.find(attr => attr.code === code)
  }).filter(Boolean)
  
  // Generate all possible combinations
  function generateCombinations(attributes, current = {}, index = 0) {
    if (index === attributes.length) {
      // Create a new variant from this combination
      const sku = `${props.product.sku}-${Object.values(current).join('-')}`
      const name = `${props.product.name} - ${Object.entries(current)
        .map(([key, value]) => formatAttributeValue(key, value))
        .join(', ')}`
      
      newVariants.push({
        id: Date.now() + newVariants.length, // Temp ID
        sku,
        name,
        price: props.product.price,
        cost: props.product.cost,
        attributes: { ...current },
        stock: {
          quantity: 0,
          reserved: 0,
          available: 0
        }
      })
      return
    }
    
    const attr = attributes[index]
    
    // For boolean attributes
    if (attr.type === 'boolean') {
      [true, false].forEach(value => {
        generateCombinations(
          attributes, 
          { ...current, [attr.code]: value },
          index + 1
        )
      })
      return
    }
    
    // For select attributes with options
    if (attr.options && attr.options.length) {
      attr.options.forEach(option => {
        generateCombinations(
          attributes,
          { ...current, [attr.code]: option.value },
          index + 1
        )
      })
    }
  }
  
  generateCombinations(selectedAttributes)
  variants.value = newVariants
}

function addVariant() {
  variants.value.push({
    id: Date.now(),
    sku: `${props.product.sku}-${variants.value.length + 1}`,
    name: `${props.product.name} - Variant ${variants.value.length + 1}`,
    price: props.product.price,
    cost: props.product.cost,
    attributes: {},
    stock: {
      quantity: 0,
      reserved: 0,
      available: 0
    }
  })
}

function removeVariant(index) {
  variants.value.splice(index, 1)
}

function editVariantAttributes(index) {
  // Clone the current variant's attributes to the editing object
  const variant = variants.value[index]
  currentEditingVariant.attributes = { ...variant.attributes }
  editingVariantIndex.value = index
}

function saveVariantAttributes() {
  if (editingVariantIndex.value !== null) {
    // Update the variant with edited attributes
    variants.value[editingVariantIndex.value].attributes = { ...currentEditingVariant.attributes }
    
    // Update variant name based on attributes if it's a generated name
    const variant = variants.value[editingVariantIndex.value]
    if (variant.name.startsWith(props.product.name)) {
      variant.name = `${props.product.name} - ${Object.entries(variant.attributes)
        .map(([key, value]) => formatAttributeValue(key, value))
        .join(', ')}`
    }
    
    editingVariantIndex.value = null
  }
}

async function saveVariants() {
  if (!validateVariants()) {
    return
  }
  
  isSaving.value = true
  
  try {
    // Calculate available stock for each variant
    variants.value.forEach(variant => {
      variant.stock.available = parseInt(variant.stock.quantity) - (parseInt(variant.stock.reserved) || 0)
    })
    
    emit('save', variants.value)
  } catch (error) {
    console.error('Error saving variants:', error)
  } finally {
    isSaving.value = false
  }
}

function onCancel() {
  emit('cancel')
}

// Initialize with existing attributes if product already has variants
watch(() => props.product, (newProduct) => {
  if (newProduct.variants && newProduct.variants.length > 0) {
    variants.value = JSON.parse(JSON.stringify(newProduct.variants))
    
    // Determine which attributes are being used for variants
    const attributeCodes = new Set()
    newProduct.variants.forEach(variant => {
      Object.keys(variant.attributes || {}).forEach(key => {
        attributeCodes.add(key)
      })
    })
    
    usedVariantAttributes.value = Array.from(attributeCodes)
  }
}, { immediate: true })
</script>