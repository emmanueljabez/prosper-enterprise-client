<template>
  <div class="flex flex-col h-full">
    <!-- Wizard Steps -->
    <div class="px-6 py-4 border-b">
      <div class="flex items-center space-x-4">
        <div 
          v-for="(step, index) in steps" 
          :key="step.id"
          class="flex items-center"
        >
          <div 
            class="flex items-center justify-center w-8 h-8 rounded-full border-2"
            :class="{
              'bg-primary text-primary-foreground border-primary': currentStep > index,
              'border-primary text-primary': currentStep === index,
              'border-muted-foreground text-muted-foreground': currentStep < index
            }"
          >
            <CheckIcon v-if="currentStep > index" class="h-4 w-4" />
            <span v-else class="text-sm font-medium">{{ index + 1 }}</span>
          </div>
          <span 
            class="ml-2 text-sm font-medium"
            :class="{
              'text-primary': currentStep >= index,
              'text-muted-foreground': currentStep < index
            }"
          >
            {{ step.title }}
          </span>
          <ChevronRightIcon 
            v-if="index < steps.length - 1" 
            class="h-4 w-4 mx-4 text-muted-foreground" 
          />
        </div>
      </div>
    </div>

    <!-- Step Content -->
    <div class="flex-1 p-6 overflow-y-auto">
      <!-- Step 1: Category Type -->
      <div v-if="currentStep === 0" class="space-y-6">
        <div>
          <h3 class="text-lg font-semibold mb-4">Category Type</h3>
          <div class="grid grid-cols-1 gap-4">
            <div>
              <Label>What type of category do you want to create?</Label>
              <div class="mt-3 space-y-3">
                <div class="flex items-center space-x-3 p-3 border rounded-lg"
                     :class="{ 
                       'border-primary bg-primary/5': categoryType === 'root',
                       'cursor-pointer hover:bg-muted/50': !isRootOptionDisabled,
                       'opacity-50 cursor-not-allowed': isRootOptionDisabled
                     }"
                     @click="!isRootOptionDisabled && (categoryType = 'root')">
                  <input 
                    type="radio" 
                    v-model="categoryType" 
                    value="root" 
                    class="w-4 h-4 text-primary" 
                    :disabled="isRootOptionDisabled"
                  />
                  <div>
                    <div class="font-medium">Root Category</div>
                    <div class="text-sm text-muted-foreground">Create a top-level category with no parent</div>
                  </div>
                </div>
                <div class="flex items-center space-x-3 p-3 border rounded-lg"
                     :class="{ 
                       'border-primary bg-primary/5': categoryType === 'subcategory',
                       'cursor-pointer hover:bg-muted/50': !isSubcategoryOptionDisabled,
                       'opacity-50 cursor-not-allowed': isSubcategoryOptionDisabled
                     }"
                     @click="!isSubcategoryOptionDisabled && (categoryType = 'subcategory')">
                  <input 
                    type="radio" 
                    v-model="categoryType" 
                    value="subcategory" 
                    class="w-4 h-4 text-primary"
                    :disabled="isSubcategoryOptionDisabled"
                  />
                  <div>
                    <div class="font-medium">Subcategory</div>
                    <div class="text-sm text-muted-foreground">Create a category under an existing parent category</div>
                  </div>
                </div>
                <div v-if="props.parentCategory" class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div class="flex items-center space-x-2">
                    <InfoIcon class="h-4 w-4 text-blue-600" />
                    <span class="text-sm font-medium text-blue-900">Creating subcategory under:</span>
                  </div>
                  <div class="mt-1 text-sm text-blue-800">
                    {{ props.parentCategory.name }} ({{ props.parentCategory.code }})
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2: Basic Information -->
      <div v-if="currentStep === 1" class="space-y-6">
        <div>
          <h3 class="text-lg font-semibold mb-4">Basic Information</h3>
          <div class="grid grid-cols-1 gap-4">
            <div>
              <Label for="code">Category Code *</Label>
              <Input
                id="code"
                v-model="formData.code"
                placeholder="e.g., ELEC, FURN, TOOL"
                :class="{ 'border-red-500': errors.code }"
              />
              <p v-if="errors.code" class="text-sm text-red-500 mt-1">{{ errors.code }}</p>
            </div>
            <div>
              <Label for="name">Category Name *</Label>
              <Input
                id="name"
                v-model="formData.name"
                placeholder="e.g., Electronics, Furniture, Tools"
                :class="{ 'border-red-500': errors.name }"
              />
              <p v-if="errors.name" class="text-sm text-red-500 mt-1">{{ errors.name }}</p>
            </div>
            <div>
              <Label for="description">Description</Label>
              <Textarea
                id="description"
                v-model="formData.description"
                placeholder="Brief description of this category..."
                rows="3"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Step 3: Parent Selection (Only for Subcategories) -->
      <div v-if="currentStep === 2 && categoryType === 'subcategory'" class="space-y-6">
        <div>
          <h3 class="text-lg font-semibold mb-4">Parent Category</h3>
          <div class="space-y-4">
            <div>
              <Label>Select Parent Category *</Label>
              <Select v-model="formData.parentCategoryId" :disabled="!!props.parentCategory">
                <SelectTrigger :class="{ 'border-red-500': errors.parentCategoryId }">
                  <SelectValue placeholder="Choose a parent category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem 
                    v-for="category in availableRootCategories" 
                    :key="category.id" 
                    :value="category.id.toString()"
                  >
                    {{ category.name }} ({{ category.code }})
                  </SelectItem>
                </SelectContent>
              </Select>
              <p v-if="errors.parentCategoryId" class="text-sm text-red-500 mt-1">{{ errors.parentCategoryId }}</p>
              <p v-if="props.parentCategory" class="text-sm text-blue-600 mt-1">
                Parent category has been pre-selected: {{ props.parentCategory.name }}
              </p>
              <p v-else class="text-sm text-muted-foreground mt-1">
                Select the root category under which this subcategory will be created
              </p>
            </div>
            <div>
              <Label for="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                v-model.number="formData.sortOrder"
                type="number"
                placeholder="0"
                min="0"
              />
              <p class="text-sm text-muted-foreground mt-1">
                Lower numbers appear first in lists
              </p>
            </div>
          </div>
        </div>

        <!-- Hierarchy Preview -->
        <div v-if="hierarchyPreview || props.parentCategory" class="border rounded-lg p-4 bg-muted/50">
          <h4 class="font-medium mb-2">Hierarchy Preview</h4>
          <div class="text-sm space-y-1">
            <div class="flex items-center space-x-2">
              <FolderIcon class="h-4 w-4 inline mr-1 text-blue-600" />
              <span class="text-blue-800 font-medium">
                {{ hierarchyPreview || props.parentCategory?.name }}
                <span v-if="props.parentCategory" class="text-xs text-blue-600 ml-1">({{ props.parentCategory.code }})</span>
              </span>
            </div>
            <div style="padding-left: 16px" class="flex items-center space-x-2 font-medium text-primary">
              <FolderIcon class="h-4 w-4 inline mr-1" />
              {{ formData.name || 'New Subcategory' }}
            </div>
            <div v-if="props.parentCategory" class="mt-2 p-2 bg-blue-100 rounded text-xs text-blue-700">
              <strong>Note:</strong> This subcategory will be created under the pre-selected parent category.
            </div>
          </div>
        </div>
      </div>

      <!-- Step 3/4: Settings -->
      <div v-if="(currentStep === 2 && categoryType === 'root') || (currentStep === 3 && categoryType === 'subcategory')" class="space-y-6">
        <div>
          <h3 class="text-lg font-semibold mb-4">Category Settings</h3>
          <div class="space-y-4">
            <!-- Sort Order for Root Categories -->
            <div v-if="categoryType === 'root'">
              <Label for="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                v-model.number="formData.sortOrder"
                type="number"
                placeholder="0"
                min="0"
              />
              <p class="text-sm text-muted-foreground mt-1">
                Lower numbers appear first in lists
              </p>
            </div>
            
            <div class="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                v-model="formData.isActive"
              />
              <Label for="isActive">Active Category</Label>
              <span class="text-sm text-muted-foreground">
                (Inactive categories won't appear in product creation)
              </span>
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div class="border rounded-lg p-4 bg-muted/50">
          <h4 class="font-medium mb-3">Category Summary</h4>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-muted-foreground">Type:</span>
              <span class="ml-2 font-medium">{{ categoryType === 'root' ? 'Root Category' : 'Subcategory' }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">Code:</span>
              <span class="ml-2 font-medium">{{ formData.code || 'Not set' }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">Name:</span>
              <span class="ml-2 font-medium">{{ formData.name || 'Not set' }}</span>
            </div>
            <div v-if="categoryType === 'subcategory'">
              <span class="text-muted-foreground">Parent:</span>
              <span class="ml-2 font-medium">{{ parentCategoryName || 'Not selected' }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">Status:</span>
              <Badge :variant="formData.isActive ? 'default' : 'secondary'" class="ml-2">
                {{ formData.isActive ? 'Active' : 'Inactive' }}
              </Badge>
            </div>
          </div>
          <div v-if="formData.description" class="mt-3">
            <span class="text-muted-foreground">Description:</span>
            <p class="mt-1 text-sm">{{ formData.description }}</p>
          </div>
        </div>
      </div>
    </div>
    <!-- Footer Actions -->
    <div class="px-6 py-4 border-t flex items-center justify-between">
      <Button 
        variant="outline" 
        @click="handleCancel"
      >
        Cancel
      </Button>
      <div class="flex items-center space-x-2">
        <Button 
          v-if="currentStep > 0"
          variant="outline" 
          @click="previousStep"
        >
          <ChevronLeftIcon class="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button 
          v-if="currentStep < maxSteps - 1"
          @click="nextStep"
          :disabled="!canProceed"
        >
          Next
          <ChevronRightIcon class="h-4 w-4 ml-2" />
        </Button>
        <Button 
          v-else
          @click="createCategory"
          :disabled="!canCreate || isCreating"
        >
          <Loader2Icon v-if="isCreating" class="h-4 w-4 mr-2 animate-spin" />
          <CheckIcon v-else class="h-4 w-4 mr-2" />
          Create Category
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import {
  CheckIcon, ChevronRightIcon, ChevronLeftIcon, FolderIcon, Loader2Icon, InfoIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useItemCategoriesStore } from '@/store/modules/inventory/item-categories'

// Props
const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  mode: {
    type: String,
    default: 'auto', // 'auto', 'root', 'subcategory'
    validator: (value) => ['auto', 'root', 'subcategory'].includes(value)
  },
  parentCategory: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['update:open', 'created'])

// Store
const itemCategoriesStore = useItemCategoriesStore()

// State
const currentStep = ref(0)
const isCreating = ref(false)
const errors = ref({})
const categoryType = ref('root') // 'root' or 'subcategory'

const steps = [
  { id: 'type', title: 'Type' },
  { id: 'basic', title: 'Basic Info' },
  { id: 'parent', title: 'Parent' },
  { id: 'settings', title: 'Settings' }
]

const formData = ref({
  code: '',
  name: '',
  description: '',
  parentCategoryId: '',
  sortOrder: 0,
  isActive: true
})

// Computed
const maxSteps = computed(() => {
  return categoryType.value === 'root' ? 3 : 4 // Skip parent step for root categories
})

const availableRootCategories = computed(() => {
  return itemCategoriesStore.getTopLevelCategories
    .filter(cat => cat.isActive)
    .sort((a, b) => a.name.localeCompare(b.name))
})

const parentCategoryName = computed(() => {
  if (!formData.value.parentCategoryId || categoryType.value === 'root') return null
  const parent = availableRootCategories.value.find(cat => cat.id.toString() === formData.value.parentCategoryId)
  return parent?.name
})

const hierarchyPreview = computed(() => {
  if (categoryType.value === 'root' || !formData.value.parentCategoryId) return null
  
  const parent = availableRootCategories.value.find(cat => cat.id.toString() === formData.value.parentCategoryId)
  return parent?.name
})

// Computed properties for controlling UI state
const isTypeSelectionDisabled = computed(() => {
  return props.mode === 'root' || props.mode === 'subcategory' || !!props.parentCategory
})

const isRootOptionDisabled = computed(() => {
  return props.mode === 'subcategory' || !!props.parentCategory
})

const isSubcategoryOptionDisabled = computed(() => {
  return props.mode === 'root'
})

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 0: // Type selection
      return categoryType.value !== ''
    case 1: // Basic info
      return formData.value.code.trim() && formData.value.name.trim()
    case 2: // Parent selection (for subcategories) or Settings (for root)
      if (categoryType.value === 'subcategory') {
        return formData.value.parentCategoryId !== ''
      }
      return true // Settings step for root categories
    case 3: // Settings (for subcategories only)
      return true
    default:
      return false
  }
})

const canCreate = computed(() => {
  const hasBasicInfo = formData.value.code.trim() && formData.value.name.trim()
  const hasParentIfNeeded = categoryType.value === 'root' || formData.value.parentCategoryId !== ''
  return hasBasicInfo && hasParentIfNeeded
})

// Methods
const validateStep = (step) => {
  errors.value = {}
  
  if (step === 1) { // Basic info validation
    if (!formData.value.code.trim()) {
      errors.value.code = 'Category code is required'
    }
    if (!formData.value.name.trim()) {
      errors.value.name = 'Category name is required'
    }
    
    // Check for duplicate code
    const existingCategory = itemCategoriesStore.getCategories.find(cat => 
      cat.code.toLowerCase() === formData.value.code.toLowerCase()
    )
    if (existingCategory) {
      errors.value.code = 'A category with this code already exists'
    }
  }
  
  if (step === 2 && categoryType.value === 'subcategory') { // Parent validation
    if (!formData.value.parentCategoryId) {
      errors.value.parentCategoryId = 'Parent category is required for subcategories'
    }
  }
  
  return Object.keys(errors.value).length === 0
}

const nextStep = () => {
  if (validateStep(currentStep.value) && canProceed.value) {
    currentStep.value++
    
    // Skip parent step for root categories
    if (categoryType.value === 'root' && currentStep.value === 2) {
      currentStep.value = 2 // Go directly to settings
    }
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
    
    // Skip parent step for root categories when going back
    if (categoryType.value === 'root' && currentStep.value === 2) {
      currentStep.value = 1 // Go back to basic info
    }
  }
}

const createCategory = async () => {
  if (!validateStep(currentStep.value) || !canCreate.value) return
  
  isCreating.value = true
  
  try {
    // Prepare the payload based on category type
    const categoryData = {
      code: formData.value.code.trim(),
      name: formData.value.name.trim(),
      description: formData.value.description.trim() || undefined,
      sortOrder: formData.value.sortOrder,
      isActive: formData.value.isActive
    }
    
    // Only include parentCategoryId for subcategories
    if (categoryType.value === 'subcategory' && formData.value.parentCategoryId) {
      categoryData.parentCategoryId = parseInt(formData.value.parentCategoryId)
    }
    
    // Create the category through the store
    await itemCategoriesStore.createCategory(categoryData)
    
    emit('created', categoryData)
    emit('update:open', false)
    resetForm()
  } catch (error) {
    console.error('Error creating category:', error)
    // Handle error display here if needed
  } finally {
    isCreating.value = false
  }
}

const handleCancel = () => {
  emit('update:open', false)
  resetForm()
}

const resetForm = () => {
  currentStep.value = 0
  errors.value = {}
  
  // Initialize category type based on props
  if (props.mode === 'root') {
    categoryType.value = 'root'
  } else if (props.mode === 'subcategory') {
    categoryType.value = 'subcategory'
  } else if (props.parentCategory) {
    categoryType.value = 'subcategory'
  } else {
    categoryType.value = 'root'
  }
  
  formData.value = {
    code: '',
    name: '',
    description: '',
    parentCategoryId: props.parentCategory?.id?.toString() || '',
    sortOrder: 0,
    isActive: true
  }
  
  // Skip the type selection step if mode is forced
  if (props.mode === 'root' || props.mode === 'subcategory' || props.parentCategory) {
    currentStep.value = 1 // Start with basic info step
  }
}

// Auto-generate code from name
watch(() => formData.value.name, (newName) => {
  if (!formData.value.code && newName) {
    formData.value.code = newName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 10)
  }
})

// Reset form when dialog opens
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    resetForm()
  }
})

// Watch for changes to parentCategory prop
watch(() => props.parentCategory, (newParent) => {
  if (newParent) {
    categoryType.value = 'subcategory'
    formData.value.parentCategoryId = newParent.id.toString()
    // Skip to basic info step since type is predetermined
    if (currentStep.value === 0) {
      currentStep.value = 1
    }
  }
}, { immediate: true })

// Clear parent selection when category type changes (only if not forced by props)
watch(() => categoryType.value, (newType) => {
  if (newType === 'root' && !props.parentCategory) {
    formData.value.parentCategoryId = ''
  }
})

// Load root categories when component mounts or dialog opens
onMounted(async () => {
  if (availableRootCategories.value.length === 0) {
    try {
      await itemCategoriesStore.fetchTopLevelCategories()
    } catch (error) {
      console.error('Error loading root categories:', error)
    }
  }
})

watch(() => props.open, async (isOpen) => {
  if (isOpen && availableRootCategories.value.length === 0) {
    try {
      await itemCategoriesStore.fetchTopLevelCategories()
    } catch (error) {
      console.error('Error loading root categories:', error)
    }
  }
})
</script>
