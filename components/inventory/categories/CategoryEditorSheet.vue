<template>
  <div class="flex flex-col h-full">
    <!-- Form Content -->
    <div class="flex-1 p-6 overflow-y-auto space-y-6">
      <!-- Basic Information -->
      <div>
        <h3 class="text-lg font-semibold mb-4">Basic Information</h3>
        <div class="grid grid-cols-1 gap-4">
          <div>
            <Label for="edit-code">Category Code *</Label>
            <Input
              id="edit-code"
              v-model="formData.code"
              placeholder="e.g., ELEC, FURN, TOOL"
              :class="{ 'border-red-500': errors.code }"
            />
            <p v-if="errors.code" class="text-sm text-red-500 mt-1">{{ errors.code }}</p>
          </div>
          <div>
            <Label for="edit-name">Category Name *</Label>
            <Input
              id="edit-name"
              v-model="formData.name"
              placeholder="e.g., Electronics, Furniture, Tools"
              :class="{ 'border-red-500': errors.name }"
            />
            <p v-if="errors.name" class="text-sm text-red-500 mt-1">{{ errors.name }}</p>
          </div>
          <div>
            <Label for="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              v-model="formData.description"
              placeholder="Brief description of this category..."
              rows="3"
            />
          </div>
        </div>
      </div>

      <!-- Hierarchy Settings -->
      <div>
        <h3 class="text-lg font-semibold mb-4">Hierarchy</h3>
        <div class="space-y-4">
          <div>
            <Label>Parent Category</Label>
            <Select v-model="formData.parentCategoryId">
              <SelectTrigger>
                <SelectValue placeholder="Select parent category (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Parent (Root Category)</SelectItem>
                <SelectItem 
                  v-for="parentOption in availableParents" 
                  :key="parentOption.id" 
                  :value="parentOption.id.toString()"
                >
                  {{ '  '.repeat(parentOption.level || 0) }}{{ parentOption.name }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p class="text-sm text-muted-foreground mt-1">
              Changing parent will move this category and all its subcategories
            </p>
            <div v-if="hasSubcategories" class="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <div class="flex items-center space-x-2 text-yellow-800">
                <AlertTriangleIcon class="h-4 w-4" />
                <span class="text-sm font-medium">Warning</span>
              </div>
              <p class="text-sm text-yellow-700 mt-1">
                This category has {{ subcategoriesCount }} subcategories. Moving it will affect the entire hierarchy.
              </p>
            </div>
          </div>
          <div>
            <Label for="edit-sortOrder">Sort Order</Label>
            <Input
              id="edit-sortOrder"
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

      <!-- Status and Settings -->
      <div>
        <h3 class="text-lg font-semibold mb-4">Status & Settings</h3>
        <div class="space-y-4">
          <div class="flex items-center space-x-2">
            <Checkbox
              id="edit-isActive"
              v-model="formData.isActive"
            />
            <Label for="edit-isActive">Active Category</Label>
          </div>
          <div v-if="!formData.isActive && hasItems" class="p-3 bg-red-50 border border-red-200 rounded">
            <div class="flex items-center space-x-2 text-red-800">
              <AlertTriangleIcon class="h-4 w-4" />
              <span class="text-sm font-medium">Impact Warning</span>
            </div>
            <p class="text-sm text-red-700 mt-1">
              This category has {{ itemsCount }} items. Deactivating it will hide the category from product creation forms.
            </p>
          </div>
        </div>
      </div>

      <!-- Current Status -->
      <div v-if="category">
        <h3 class="text-lg font-semibold mb-4">Current Status</h3>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div class="p-3 bg-muted/50 rounded">
            <div class="flex items-center space-x-2 mb-2">
              <PackageIcon class="h-4 w-4 text-primary" />
              <span class="font-medium">Items</span>
            </div>
            <div class="text-2xl font-bold">{{ itemsCount }}</div>
            <div class="text-muted-foreground">items in this category</div>
          </div>
          <div class="p-3 bg-muted/50 rounded">
            <div class="flex items-center space-x-2 mb-2">
              <FolderTreeIcon class="h-4 w-4 text-primary" />
              <span class="font-medium">Subcategories</span>
            </div>
            <div class="text-2xl font-bold">{{ subcategoriesCount }}</div>
            <div class="text-muted-foreground">direct subcategories</div>
          </div>
        </div>
      </div>

      <!-- Hierarchy Preview -->
      <div v-if="hierarchyPreview.length > 0">
        <h3 class="text-lg font-semibold mb-4">New Hierarchy Preview</h3>
        <div class="border rounded-lg p-4 bg-muted/50">
          <div class="text-sm space-y-1">
            <div v-for="(level, index) in hierarchyPreview" :key="index" class="flex items-center space-x-2">
              <span :style="{ paddingLeft: `${index * 16}px` }">
                <FolderIcon class="h-4 w-4 inline mr-1" />
                {{ level }}
              </span>
            </div>
            <div :style="{ paddingLeft: `${hierarchyPreview.length * 16}px` }" class="flex items-center space-x-2 font-medium text-primary">
              <FolderIcon class="h-4 w-4 inline mr-1" />
              {{ formData.name || category?.name }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Actions -->
    <div class="px-6 py-4 border-t flex items-center justify-between">
      <div class="text-sm text-muted-foreground">
        {{ hasChanges ? 'You have unsaved changes' : 'No changes made' }}
      </div>
      <div class="flex items-center space-x-2">
        <Button variant="outline" @click="handleCancel">
          Cancel
        </Button>
        <Button @click="resetForm" variant="outline" :disabled="!hasChanges">
          Reset
        </Button>
        <Button @click="saveChanges" :disabled="!hasChanges || !canSave || isSaving">
          <Loader2Icon v-if="isSaving" class="h-4 w-4 mr-2 animate-spin" />
          <SaveIcon v-else class="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import {
  AlertTriangleIcon, PackageIcon, FolderTreeIcon, FolderIcon,
  Loader2Icon, SaveIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Props
const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  category: {
    type: Object,
    default: null
  },
  parentCategories: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['update:open', 'updated'])

// State
const isSaving = ref(false)
const errors = ref({})
const originalData = ref({})

const formData = ref({
  code: '',
  name: '',
  description: '',
  parentCategoryId: 'none',
  sortOrder: 0,
  isActive: true
})

// Computed
const availableParents = computed(() => {
  if (!props.category) return []

  const excludeIds = new Set([props.category.id])
  
  const findDescendants = (categoryId) => {
    props.parentCategories
      .filter(cat => cat.parentCategoryId === categoryId)
      .forEach(child => {
        excludeIds.add(child.id)
        findDescendants(child.id)
      })
  }
  
  findDescendants(props.category.id)
  
  return props.parentCategories
    .filter(cat => !excludeIds.has(cat.id) && cat.isActive)
    .sort((a, b) => (a.level || 0) - (b.level || 0) || a.name.localeCompare(b.name))
})

const hierarchyPreview = computed(() => {
  if (!formData.value.parentCategoryId || formData.value.parentCategoryId === 'none') return []
  
  const buildPath = (categoryId) => {
    const category = props.parentCategories.find(cat => cat.id.toString() === categoryId)
    if (!category) return []
    
    const path = []
    if (category.parentCategoryId) {
      path.push(...buildPath(category.parentCategoryId.toString()))
    }
    path.push(category.name)
    return path
  }
  
  return buildPath(formData.value.parentCategoryId)
})

const hasChanges = computed(() => {
  if (!originalData.value || !props.category) return false
  
  return Object.keys(formData.value).some(key => {
    const current = formData.value[key]
    const original = originalData.value[key]
    
    // Special handling for parentCategoryId
    if (key === 'parentCategoryId') {
      const currentValue = current === 'none' ? null : current
      const originalValue = original === 'none' ? null : original
      return currentValue !== originalValue
    }
    
    // Handle empty string vs null/undefined
    if ((current === '' || current === null || current === undefined) && 
        (original === '' || original === null || original === undefined)) {
      return false
    }
    
    return current !== original
  })
})

const canSave = computed(() => {
  return formData.value.code.trim() && formData.value.name.trim() && Object.keys(errors.value).length === 0
})

const subcategoriesCount = computed(() => {
  if (!props.category) return 0
  return props.parentCategories.filter(cat => cat.parentCategoryId === props.category.id).length
})

const hasSubcategories = computed(() => subcategoriesCount.value > 0)

const itemsCount = computed(() => props.category?.itemsCount || 0)

const hasItems = computed(() => itemsCount.value > 0)

// Methods
const validateForm = () => {
  errors.value = {}
  
  if (!formData.value.code.trim()) {
    errors.value.code = 'Category code is required'
  }
  
  if (!formData.value.name.trim()) {
    errors.value.name = 'Category name is required'
  }
  
  // Check for duplicate code (excluding current category)
  const existingCategory = props.parentCategories.find(cat => 
    cat.id !== props.category?.id &&
    cat.code.toLowerCase() === formData.value.code.toLowerCase()
  )
  if (existingCategory) {
    errors.value.code = 'A category with this code already exists'
  }
  
  return Object.keys(errors.value).length === 0
}

const saveChanges = async () => {
  if (!validateForm() || !canSave.value) return
  
  isSaving.value = true
  
  try {
    const updateData = {
      code: formData.value.code.trim(),
      name: formData.value.name.trim(),
      description: formData.value.description.trim() || undefined,
      parentCategoryId: formData.value.parentCategoryId === 'none' ? undefined : parseInt(formData.value.parentCategoryId),
      sortOrder: formData.value.sortOrder,
      isActive: formData.value.isActive
    }
    
    emit('updated', updateData)
  } catch (error) {
    console.error('Error updating category:', error)
  } finally {
    isSaving.value = false
  }
}

const resetForm = () => {
  if (props.category) {
    formData.value = {
      code: props.category.code || '',
      name: props.category.name || '',
      description: props.category.description || '',
      parentCategoryId: props.category.parentCategoryId?.toString() || 'none',
      sortOrder: props.category.sortOrder || 0,
      isActive: props.category.isActive ?? true
    }
    
    originalData.value = { ...formData.value }
  }
  errors.value = {}
}

const handleCancel = () => {
  emit('update:open', false)
}

// Initialize form when category changes
watch(() => props.category, (newCategory) => {
  if (newCategory) {
    resetForm()
  }
}, { immediate: true })

// Reset form when dialog opens
watch(() => props.open, (isOpen) => {
  if (isOpen && props.category) {
    resetForm()
  }
})

onMounted(() => {
  if (props.category) {
    resetForm()
  }
})
</script>
