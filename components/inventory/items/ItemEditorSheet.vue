<template>
  <div class="flex flex-col h-full">
    <div class="flex-1 overflow-y-auto px-6 pt-4 pb-4 space-y-6 min-h-0">
      <div class="max-w-2xl mx-auto space-y-6">
        <form @submit.prevent="updateItem">
          <!-- Basic Information -->
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="itemCode">Item Code *</Label>
                  <Input
                    id="itemCode"
                    v-model="formData.itemCode"
                    :class="{ 'border-red-500': errors.itemCode }"
                  />
                  <p v-if="errors.itemCode" class="text-sm text-red-500">{{ errors.itemCode }}</p>
                </div>
                <div class="space-y-2">
                  <Label for="barcode">Barcode</Label>
                  <Input
                    id="barcode"
                    v-model="formData.barcode"
                  />
                </div>
              </div>

              <div class="space-y-2">
                <Label for="name">Item Name *</Label>
                <Input
                  id="name"
                  v-model="formData.name"
                  :class="{ 'border-red-500': errors.name }"
                />
                <p v-if="errors.name" class="text-sm text-red-500">{{ errors.name }}</p>
              </div>

              <div class="space-y-2">
                <Label for="description">Description</Label>
                <Textarea
                  id="description"
                  v-model="formData.description"
                  rows="3"
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="category">Category *</Label>
                  <Select v-model="formData.categoryId">
                    <SelectTrigger :class="{ 'border-red-500': errors.categoryId }">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem 
                        v-for="category in categoryOptions" 
                        :key="category.id" 
                        :value="category.id?.toString()"
                        :class="{ 
                          'pl-6': category.level > 0, 
                          'font-semibold text-foreground': category.level === 0, 
                          'text-muted-foreground font-normal': category.level > 0,
                          'border-l-2 border-muted ml-2': category.level > 0
                        }"
                      >
                        {{ category.name }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p v-if="errors.categoryId" class="text-sm text-red-500">{{ errors.categoryId }}</p>
                </div>
                <div class="space-y-2">
                  <Label for="unitOfMeasure">Unit of Measure *</Label>
                  <Select v-model="formData.unitOfMeasureId">
                    <SelectTrigger :class="{ 'border-red-500': errors.unitOfMeasureId }">
                      <SelectValue placeholder="Select UOM" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem 
                        v-for="uom in uomOptions" 
                        :key="uom.id" 
                        :value="uom.id?.toString()"
                        :class="{ 
                          'pl-6': uom.level > 0, 
                          'font-semibold text-foreground': uom.level === 0, 
                          'text-muted-foreground font-normal': uom.level > 0,
                          'border-l-2 border-muted ml-2': uom.level > 0
                        }"
                      >
                        {{ uom.name }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p v-if="errors.unitOfMeasureId" class="text-sm text-red-500">{{ errors.unitOfMeasureId }}</p>
                </div>
              </div>

              <div class="flex items-center space-x-2">
                <Checkbox id="isActive" v-model:checked="formData.isActive" />
                <Label for="isActive">Item is active</Label>
              </div>

              <!-- Image Upload Section -->
              <div class="space-y-2">
                <Label for="itemImage">Item Image</Label>
                <div class="space-y-3">
                  <!-- Current Image Display -->
                  <div v-if="imageUrl" class="relative inline-block">
                    <img 
                      :src="imageUrl" 
                      alt="Item image" 
                      class="w-32 h-32 object-cover rounded-lg border border-border"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      class="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                      @click="onRemoveImage"
                    >
                      <X class="h-3 w-3" />
                    </Button>
                    <!-- Change Image Button -->
                    <div class="mt-2 flex items-center space-x-2">
                      <input
                        ref="fileInput"
                        type="file"
                        accept="image/*"
                        class="hidden"
                        @change="onImageSelect"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        :disabled="isUploading"
                        @click="$refs.fileInput?.click()"
                      >
                        <Upload class="h-4 w-4 mr-2" />
                        Change Image
                      </Button>
                      <Loader2 v-if="isUploading" class="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                  <!-- Upload Button and File Input (only if no image) -->
                  <div v-else class="flex items-center space-x-2">
                    <input
                      ref="fileInput"
                      type="file"
                      accept="image/*"
                      class="hidden"
                      @change="onImageSelect"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      :disabled="isUploading"
                      @click="$refs.fileInput?.click()"
                    >
                      <Upload class="h-4 w-4 mr-2" />
                      Upload Image
                    </Button>
                    <Loader2 v-if="isUploading" class="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                  <!-- Upload Error -->
                  <p v-if="uploadError" class="text-sm text-red-500">
                    {{ uploadError }}
                  </p>
                  <!-- Help Text -->
                  <p class="text-xs text-muted-foreground">
                    Supported formats: JPG, PNG, GIF. Max size: 5MB.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Pricing Information -->
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Costs</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="standardCost">Standard Cost</Label>
                  <Input
                    id="standardCost"
                    v-model="formData.standardCost"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="listPrice">List Price</Label>
                  <Input
                    id="listPrice"
                    v-model="formData.listPrice"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="wholesalePrice">Wholesale Price</Label>
                  <Input
                    id="wholesalePrice"
                    v-model="formData.wholesalePrice"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="retailPrice">Retail Price</Label>
                  <Input
                    id="retailPrice"
                    v-model="formData.retailPrice"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div class="space-y-2">
                <div class="flex items-center space-x-4">
                  <div class="flex items-center space-x-2">
                    <Checkbox id="taxable" v-model:checked="formData.isTaxable" />
                    <Label for="taxable">Taxable item</Label>
                  </div>
                  <div class="flex items-center space-x-2">
                    <Checkbox id="priceIncludesTax" v-model:checked="formData.priceIncludesTax" />
                    <Label for="priceIncludesTax">Price includes tax</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Inventory Settings -->
          <Card>
            <CardHeader>
              <CardTitle>Inventory Settings</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="reorderPoint">Reorder Point</Label>
                  <Input
                    id="reorderPoint"
                    v-model="formData.reorderPoint"
                    type="number"
                    placeholder="0"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="reorderQuantity">Reorder Quantity</Label>
                  <Input
                    id="reorderQuantity"
                    v-model="formData.reorderQuantity"
                    type="number"
                    placeholder="0"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="minStock">Minimum Stock</Label>
                  <Input
                    id="minStock"
                    v-model="formData.minStock"
                    type="number"
                    placeholder="0"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="maxStock">Maximum Stock</Label>
                  <Input
                    id="maxStock"
                    v-model="formData.maxStock"
                    type="number"
                    placeholder="0"
                  />
                </div>
              </div>

              <div class="space-y-2">
                <Label>Stock Management Options</Label>
                <div class="space-y-2">
                  <div class="flex items-center space-x-2">
                    <Checkbox id="trackStock" v-model:checked="formData.trackStock" />
                    <Label for="trackStock">Track stock levels</Label>
                  </div>
                  <div class="flex items-center space-x-2">
                    <Checkbox id="allowNegativeStock" v-model:checked="formData.allowNegativeStock" />
                    <Label for="allowNegativeStock">Allow negative stock</Label>
                  </div>
                  <div class="flex items-center space-x-2">
                    <Checkbox id="serialTracked" v-model:checked="formData.isSerialTracked" />
                    <Label for="serialTracked">Serial number tracking</Label>
                  </div>
                  <div class="flex items-center space-x-2">
                    <Checkbox id="lotTracked" v-model:checked="formData.isLotTracked" />
                    <Label for="lotTracked">Lot/Batch tracking</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Physical Properties -->
          <Card>
            <CardHeader>
              <CardTitle>Physical Properties</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="weight">Weight</Label>
                  <Input
                    id="weight"
                    v-model="formData.weight"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="weightUnit">Weight Unit</Label>
                  <Select v-model="formData.weightUnit">
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilograms (kg)</SelectItem>
                      <SelectItem value="lb">Pounds (lb)</SelectItem>
                      <SelectItem value="g">Grams (g)</SelectItem>
                      <SelectItem value="oz">Ounces (oz)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div class="grid grid-cols-3 gap-4">
                <div class="space-y-2">
                  <Label for="length">Length</Label>
                  <Input
                    id="length"
                    v-model="formData.length"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="width">Width</Label>
                  <Input
                    id="width"
                    v-model="formData.width"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="height">Height</Label>
                  <Input
                    id="height"
                    v-model="formData.height"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Additional Information -->
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="space-y-2">
                <Label for="notes">Notes</Label>
                <Textarea
                  id="notes"
                  v-model="formData.notes"
                  placeholder="Additional notes about this item"
                  rows="3"
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="createdAt">Created</Label>
                  <Input
                    id="createdAt"
                    :value="formatDate(item?.createdAt)"
                    disabled
                  />
                </div>
                <div class="space-y-2">
                  <Label for="updatedAt">Last Updated</Label>
                  <Input
                    id="updatedAt"
                    :value="formatDate(item?.updatedAt)"
                    disabled
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>

    <!-- Footer Actions -->
    <div class="border-t px-6 py-4 flex justify-between flex-shrink-0 bg-background/95 backdrop-blur-sm sticky bottom-0 z-10">
      <Button variant="outline" @click="$emit('close')">
        Cancel
      </Button>
      <div class="space-x-2">
        <Button variant="outline" @click="resetForm">
          Reset
        </Button>
        <Button 
          @click="updateItem"
          :disabled="!isFormValid || updating"
        >
          <Loader2 v-if="updating" class="mr-2 h-4 w-4 animate-spin" />
          Update Item
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch, onMounted } from 'vue'
import { Loader2, X, Upload } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

// Props
const props = defineProps({
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
  categoryHierarchy: {
    type: Array,
    default: () => []
  },
  unitHierarchy: {
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
  },
  imageUrl: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['item-updated', 'close', 'upload-image', 'remove-image'])

// State
const updating = ref(false)
const errors = reactive({})
const fileInput = ref(null)

const formData = reactive({
  itemCode: '',
  name: '',
  description: '',
  barcode: '',
  categoryId: '',
  unitOfMeasureId: '',
  standardCost: null,
  listPrice: null,
  wholesalePrice: null,
  retailPrice: null,
  isTaxable: true,
  priceIncludesTax: false,
  reorderPoint: 0,
  reorderQuantity: 0,
  minStock: null,
  maxStock: null,
  trackStock: true,
  allowNegativeStock: false,
  isSerialTracked: false,
  isLotTracked: false,
  weight: null,
  weightUnit: '',
  length: null,
  width: null,
  height: null,
  notes: '',
  isActive: true,
  imageUrl: ''
})

// Computed
const isFormValid = computed(() => {
  return formData.itemCode && formData.name && formData.categoryId && formData.unitOfMeasureId
})

// Hierarchical option rendering functions
const renderCategoryOptions = (categories, level = 0) => {
  const options = []
  if (!categories || !Array.isArray(categories)) return options
  
  for (const category of categories) {
    if (!category || !category.id) continue
    
    const prefix = level === 0 ? '' : '  '.repeat(level)
    options.push({
      id: category.id,
      name: `${prefix}${category.name || 'Unnamed Category'}`,
      level,
      isParent: level === 0
    })
    
    // Check for both children and subCategories properties
    const childCategories = category.children || category.subCategories || []
    if (childCategories && childCategories.length > 0) {
      options.push(...renderCategoryOptions(childCategories, level + 1))
    }
  }
  return options
}

const renderUOMOptions = (units, level = 0) => {
  const options = []
  if (!units || !Array.isArray(units)) return options
  
  for (const unit of units) {
    if (!unit || !unit.id) continue
    
    const prefix = level === 0 ? '' : '  '.repeat(level)
    const displayName = unit.name || 'Unnamed Unit'
    const codeDisplay = unit.code ? ` (${unit.code})` : ''
    
    options.push({
      id: unit.id,
      name: `${prefix}${displayName}${codeDisplay}`,
      code: unit.code,
      level,
      isParent: level === 0
    })
    
    if (unit.children && unit.children.length > 0) {
      options.push(...renderUOMOptions(unit.children, level + 1))
    }
  }
  return options
}

const categoryOptions = computed(() => {
  return renderCategoryOptions(props.categoryHierarchy || [])
})

const uomOptions = computed(() => {
  return renderUOMOptions(props.unitHierarchy || [])
})

// Image upload methods
const onImageSelect = (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  emit('upload-image', { file, itemId: props.item?.id })
}

const onRemoveImage = () => {
  emit('remove-image', { itemId: props.item?.id })
}

// Methods
const loadItemData = () => {
  if (props.item) {
    
    // Map API fields to form fields
    formData.itemCode = props.item.itemCode || ''
    formData.name = props.item.itemName || props.item.name || '' // Handle both itemName and name
    formData.description = props.item.description || ''
    formData.barcode = props.item.barcode || ''
    formData.standardCost = props.item.standardCost || null
    formData.listPrice = props.item.sellingPrice || props.item.listPrice || null // Map sellingPrice to listPrice
    formData.wholesalePrice = props.item.wholesalePrice || null
    formData.retailPrice = props.item.retailPrice || null
    formData.isTaxable = props.item.isTaxable !== undefined ? props.item.isTaxable : true
    formData.priceIncludesTax = props.item.priceIncludesTax || false
    formData.reorderPoint = props.item.reorderPoint || 0
    formData.reorderQuantity = props.item.reorderQuantity || 0
    formData.minStock = props.item.minStockLevel || props.item.minStock || null // Map minStockLevel to minStock
    formData.maxStock = props.item.maxStockLevel || props.item.maxStock || null // Map maxStockLevel to maxStock
    formData.trackStock = props.item.trackStock !== undefined ? props.item.trackStock : true
    formData.allowNegativeStock = props.item.allowNegativeStock || false
    formData.isSerialTracked = props.item.trackSerialNumber || props.item.isSerialTracked || false // Map trackSerialNumber to isSerialTracked
    formData.isLotTracked = props.item.trackLotNumber || props.item.isLotTracked || false // Map trackLotNumber to isLotTracked
    formData.weight = props.item.weight || null
    formData.weightUnit = props.item.weightUnit || ''
    formData.length = props.item.length || null
    formData.width = props.item.width || null
    formData.height = props.item.height || null
    formData.notes = props.item.notes || ''
    formData.isActive = props.item.isActive !== undefined ? props.item.isActive : true
    formData.imageUrl = props.item.imageUrl || '' 
    
    // Convert IDs to strings for selects
    if (props.item.categoryId) {
      formData.categoryId = props.item.categoryId.toString()
      console.log('Set categoryId to:', formData.categoryId)
      
      // Check if category exists in the hierarchical options
      const categoryExists = categoryOptions.value.find(cat => cat.id.toString() === formData.categoryId)
      if (!categoryExists) {
        console.warn('Category with ID', props.item.categoryId, 'not found in hierarchical category options')
        console.log('Available category option IDs:', categoryOptions.value.map(cat => ({ id: cat.id, name: cat.name, level: cat.level })))
      } else {
        console.log('Found category in hierarchy:', categoryExists.name, 'at level', categoryExists.level)
      }
    }
    if (props.item.baseUnitOfMeasureId || props.item.unitOfMeasureId) {
      const unitId = props.item.baseUnitOfMeasureId || props.item.unitOfMeasureId
      formData.unitOfMeasureId = unitId.toString()
      console.log('Set unitOfMeasureId to:', formData.unitOfMeasureId)
      
      // Check if unit exists in the hierarchical options
      const unitExists = uomOptions.value.find(unit => unit.id.toString() === formData.unitOfMeasureId)
      if (!unitExists) {
        console.warn('Unit with ID', unitId, 'not found in hierarchical UOM options')
        console.log('Available UOM option IDs:', uomOptions.value.map(unit => ({ id: unit.id, name: unit.name, level: unit.level })))
      } else {
        console.log('Found unit in hierarchy:', unitExists.name, 'at level', unitExists.level)
      }
    }
  }
}

const resetForm = () => {
  loadItemData()
}

const validateForm = () => {
  // Clear previous errors
  Object.keys(errors).forEach(key => delete errors[key])

  if (!formData.itemCode) {
    errors.itemCode = 'Item code is required'
  }
  if (!formData.name) {
    errors.name = 'Item name is required'
  }
  if (!formData.categoryId) {
    errors.categoryId = 'Category is required'
  }
  if (!formData.unitOfMeasureId) {
    errors.unitOfMeasureId = 'Unit of measure is required'
  }

  // Additional validations
  if (formData.standardCost && parseFloat(formData.standardCost) < 0) {
    errors.standardCost = 'Standard cost cannot be negative'
  }
  if (formData.listPrice && parseFloat(formData.listPrice) < 0) {
    errors.listPrice = 'List price cannot be negative'
  }
  if (formData.reorderPoint && parseInt(formData.reorderPoint) < 0) {
    errors.reorderPoint = 'Reorder point cannot be negative'
  }
  if (formData.reorderQuantity && parseInt(formData.reorderQuantity) < 0) {
    errors.reorderQuantity = 'Reorder quantity cannot be negative'
  }

  return Object.keys(errors).length === 0
}

const updateItem = async () => {
  if (!validateForm()) return

  updating.value = true
  try {
    const updateData = {
      id: props.item.id,
      itemCode: formData.itemCode,
      itemName: formData.name,
      description: formData.description || undefined,
      categoryId: parseInt(formData.categoryId),
      baseUnitOfMeasureId: parseInt(formData.unitOfMeasureId), 
      barcode: formData.barcode || undefined,
      standardCost: parseFloat(formData.standardCost) || undefined,
      sellingPrice: parseFloat(formData.listPrice) || undefined,
      minStockLevel: parseInt(formData.minStock) || undefined,
      maxStockLevel: parseInt(formData.maxStock) || undefined,
      reorderPoint: parseInt(formData.reorderPoint) || undefined,
      reorderQuantity: parseInt(formData.reorderQuantity) || undefined,
      trackSerialNumber: formData.isSerialTracked,
      trackLotNumber: formData.isLotTracked, 
      weight: parseFloat(formData.weight) || undefined,
      length: parseFloat(formData.length) || undefined,
      width: parseFloat(formData.width) || undefined,
      height: parseFloat(formData.height) || undefined,
      notes: formData.notes || undefined,
      isActive: formData.isActive,
      imageUrl: formData.imageUrl || undefined
    }

    emit('item-updated', updateData)
  } catch (error) {
    console.error('Error updating item:', error)
  } finally {
    updating.value = false
  }
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

// Watchers
watch(() => props.item, loadItemData, { immediate: true })
watch(() => props.imageUrl, (newImageUrl) => {
  if (newImageUrl) {
    formData.imageUrl = newImageUrl
  }
})

// Initialize
onMounted(() => {
  loadItemData()
})
</script>
