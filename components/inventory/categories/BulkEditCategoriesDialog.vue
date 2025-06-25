<template>
  <DialogContent class="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle class="flex items-center space-x-2">
        <EditIcon class="h-5 w-5" />
        <span>Bulk Edit Categories</span>
      </DialogTitle>
      <DialogDescription>
        Edit multiple categories at once. Changes will be applied to all {{ selectedCategories.length }} selected categories.
      </DialogDescription>
    </DialogHeader>

    <div class="space-y-6">
      <!-- Selected Categories Overview -->
      <div>
        <h3 class="font-semibold mb-3">Selected Categories ({{ selectedCategories.length }})</h3>
        <div class="border rounded-lg max-h-32 overflow-y-auto">
          <div class="p-2 space-y-1">
            <div 
              v-for="category in selectedCategories.slice(0, 5)" 
              :key="category.id"
              class="flex items-center space-x-2 text-sm"
            >
              <FolderIcon class="h-3 w-3 text-muted-foreground" />
              <span class="font-medium">{{ category.name }}</span>
              <Badge variant="outline" class="text-xs">{{ category.code }}</Badge>
            </div>
            <div v-if="selectedCategories.length > 5" class="text-sm text-muted-foreground pl-5">
              ... and {{ selectedCategories.length - 5 }} more
            </div>
          </div>
        </div>
      </div>

      <!-- Bulk Edit Options -->
      <div class="space-y-4">
        <h3 class="font-semibold">Edit Fields</h3>
        
        <!-- Parent Category -->
        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <Checkbox
              id="bulk-parent"
              v-model="editFields.changeParent"
            />
            <Label for="bulk-parent" class="font-medium">Change Parent Category</Label>
          </div>
          <div v-if="editFields.changeParent" class="ml-6">
            <Select v-model="bulkChanges.parentCategoryId">
              <SelectTrigger>
                <SelectValue placeholder="Select new parent category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No Parent (Root Category)</SelectItem>
                <SelectItem 
                  v-for="category in availableParents" 
                  :key="category.id" 
                  :value="category.id.toString()"
                >
                  {{ '  '.repeat(category.level || 0) }}{{ category.name }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p class="text-sm text-muted-foreground mt-1">
              All selected categories will be moved under this parent
            </p>
            <div v-if="hasCircularReference" class="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              <AlertTriangleIcon class="h-4 w-4 inline mr-1" />
              Warning: This would create circular references. Some categories will be skipped.
            </div>
          </div>
        </div>

        <!-- Status -->
        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <Checkbox
              id="bulk-status"
              v-model="editFields.changeStatus"
            />
            <Label for="bulk-status" class="font-medium">Change Status</Label>
          </div>
          <div v-if="editFields.changeStatus" class="ml-6">
            <div class="space-y-2">
              <div class="flex items-center space-x-2">
                <input
                  id="activate"
                  v-model="bulkChanges.isActive"
                  type="radio"
                  :value="true"
                  class="rounded"
                />
                <Label for="activate" class="text-sm">Activate all selected categories</Label>
              </div>
              <div class="flex items-center space-x-2">
                <input
                  id="deactivate"
                  v-model="bulkChanges.isActive"
                  type="radio"
                  :value="false"
                  class="rounded"
                />
                <Label for="deactivate" class="text-sm">Deactivate all selected categories</Label>
              </div>
            </div>
            <div v-if="bulkChanges.isActive === false && categoriesWithItems.length > 0" class="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
              <AlertTriangleIcon class="h-4 w-4 inline mr-1" />
              {{ categoriesWithItems.length }} categories have items and will be hidden from product creation
            </div>
          </div>
        </div>

        <!-- Sort Order -->
        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <Checkbox
              id="bulk-sort"
              v-model="editFields.changeSortOrder"
            />
            <Label for="bulk-sort" class="font-medium">Update Sort Order</Label>
          </div>
          <div v-if="editFields.changeSortOrder" class="ml-6 space-y-2">
            <div class="space-y-2">
              <div class="flex items-center space-x-2">
                <input
                  id="reset-sort"
                  v-model="sortOrderAction"
                  type="radio"
                  value="reset"
                  class="rounded"
                />
                <Label for="reset-sort" class="text-sm">Reset to default (alphabetical)</Label>
              </div>
              <div class="flex items-center space-x-2">
                <input
                  id="increment-sort"
                  v-model="sortOrderAction"
                  type="radio"
                  value="increment"
                  class="rounded"
                />
                <Label for="increment-sort" class="text-sm">Set sequential order starting from:</Label>
              </div>
              <div v-if="sortOrderAction === 'increment'" class="ml-6">
                <Input
                  v-model.number="bulkChanges.sortOrderStart"
                  type="number"
                  placeholder="0"
                  min="0"
                  class="w-24"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Preview Changes -->
      <div v-if="hasChanges" class="border-t pt-4">
        <h3 class="font-semibold mb-3">Preview Changes</h3>
        <div class="space-y-2 text-sm">
          <div v-if="editFields.changeParent" class="flex items-center space-x-2">
            <ArrowRightIcon class="h-3 w-3 text-muted-foreground" />
            <span>Move {{ selectedCategories.length }} categories to: 
              <span class="font-medium">{{ getParentCategoryName(bulkChanges.parentCategoryId) || 'Root Level' }}</span>
            </span>
          </div>
          <div v-if="editFields.changeStatus" class="flex items-center space-x-2">
            <ArrowRightIcon class="h-3 w-3 text-muted-foreground" />
            <span>Set status to: 
              <Badge :variant="bulkChanges.isActive ? 'default' : 'secondary'" class="text-xs">
                {{ bulkChanges.isActive ? 'Active' : 'Inactive' }}
              </Badge>
            </span>
          </div>
          <div v-if="editFields.changeSortOrder" class="flex items-center space-x-2">
            <ArrowRightIcon class="h-3 w-3 text-muted-foreground" />
            <span>Update sort order: {{ sortOrderAction === 'reset' ? 'Reset to alphabetical' : `Sequential from ${bulkChanges.sortOrderStart}` }}</span>
          </div>
        </div>
      </div>

      <!-- Impact Summary -->
      <div v-if="hasChanges" class="bg-muted/50 rounded-lg p-4">
        <h4 class="font-medium mb-2">Impact Summary</h4>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-muted-foreground">Categories affected:</span>
            <span class="ml-2 font-medium">{{ selectedCategories.length }}</span>
          </div>
          <div>
            <span class="text-muted-foreground">Total items:</span>
            <span class="ml-2 font-medium">{{ totalItemsCount }}</span>
          </div>
          <div>
            <span class="text-muted-foreground">Subcategories:</span>
            <span class="ml-2 font-medium">{{ totalSubcategoriesCount }}</span>
          </div>
          <div v-if="editFields.changeParent && hasCircularReference">
            <span class="text-red-600">Categories skipped:</span>
            <span class="ml-2 font-medium text-red-600">{{ circularReferenceCount }}</span>
          </div>
        </div>
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" @click="$emit('update:open', false)">
        Cancel
      </Button>
      <Button @click="applyChanges" :disabled="!hasChanges || isApplying">
        <Loader2Icon v-if="isApplying" class="h-4 w-4 mr-2 animate-spin" />
        <CheckIcon v-else class="h-4 w-4 mr-2" />
        Apply Changes
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  EditIcon, FolderIcon, AlertTriangleIcon, ArrowRightIcon,
  Loader2Icon, CheckIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

// Props
const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  selectedCategories: {
    type: Array,
    default: () => []
  },
  parentCategories: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['update:open', 'categories-updated'])

// State
const isApplying = ref(false)
const sortOrderAction = ref('reset')

const editFields = ref({
  changeParent: false,
  changeStatus: false,
  changeSortOrder: false
})

const bulkChanges = ref({
  parentCategoryId: '',
  isActive: true,
  sortOrderStart: 0
})

// Computed
const availableParents = computed(() => {
  // Exclude selected categories and their descendants to prevent circular references
  const excludeIds = new Set(props.selectedCategories.map(cat => cat.id))
  
  props.selectedCategories.forEach(category => {
    const findDescendants = (categoryId) => {
      props.parentCategories
        .filter(cat => cat.parentCategoryId === categoryId)
        .forEach(child => {
          excludeIds.add(child.id)
          findDescendants(child.id)
        })
    }
    findDescendants(category.id)
  })
  
  return props.parentCategories
    .filter(cat => !excludeIds.has(cat.id) && cat.isActive)
    .sort((a, b) => (a.level || 0) - (b.level || 0) || a.name.localeCompare(b.name))
})

const hasCircularReference = computed(() => {
  if (!editFields.value.changeParent || !bulkChanges.value.parentCategoryId) return false
  
  const targetParentId = parseInt(bulkChanges.value.parentCategoryId)
  return props.selectedCategories.some(category => {
    // Check if target parent is a descendant of this category
    const isDescendant = (categoryId, ancestorId) => {
      const cat = props.parentCategories.find(c => c.id === categoryId)
      if (!cat || !cat.parentCategoryId) return false
      if (cat.parentCategoryId === ancestorId) return true
      return isDescendant(cat.parentCategoryId, ancestorId)
    }
    
    return isDescendant(targetParentId, category.id)
  })
})

const circularReferenceCount = computed(() => {
  if (!hasCircularReference.value) return 0
  
  const targetParentId = parseInt(bulkChanges.value.parentCategoryId)
  return props.selectedCategories.filter(category => {
    const isDescendant = (categoryId, ancestorId) => {
      const cat = props.parentCategories.find(c => c.id === categoryId)
      if (!cat || !cat.parentCategoryId) return false
      if (cat.parentCategoryId === ancestorId) return true
      return isDescendant(cat.parentCategoryId, ancestorId)
    }
    
    return isDescendant(targetParentId, category.id)
  }).length
})

const categoriesWithItems = computed(() => {
  return props.selectedCategories.filter(cat => (cat.itemsCount || 0) > 0)
})

const totalItemsCount = computed(() => {
  return props.selectedCategories.reduce((total, cat) => total + (cat.itemsCount || 0), 0)
})

const totalSubcategoriesCount = computed(() => {
  return props.selectedCategories.reduce((total, category) => {
    const subcategories = props.parentCategories.filter(cat => cat.parentCategoryId === category.id)
    return total + subcategories.length
  }, 0)
})

const hasChanges = computed(() => {
  return editFields.value.changeParent || editFields.value.changeStatus || editFields.value.changeSortOrder
})

// Methods
const getParentCategoryName = (parentId) => {
  if (!parentId) return null
  const parent = props.parentCategories.find(cat => cat.id.toString() === parentId)
  return parent?.name
}

const applyChanges = async () => {
  if (!hasChanges.value) return
  
  isApplying.value = true
  
  try {
    const changes = {}
    
    if (editFields.value.changeParent) {
      changes.parentCategoryId = bulkChanges.value.parentCategoryId ? 
        parseInt(bulkChanges.value.parentCategoryId) : null
    }
    
    if (editFields.value.changeStatus) {
      changes.isActive = bulkChanges.value.isActive
    }
    
    if (editFields.value.changeSortOrder) {
      changes.sortOrderAction = sortOrderAction.value
      if (sortOrderAction.value === 'increment') {
        changes.sortOrderStart = bulkChanges.value.sortOrderStart
      }
    }
    
    emit('categories-updated', props.selectedCategories, changes)
  } catch (error) {
    console.error('Error applying bulk changes:', error)
  } finally {
    isApplying.value = false
  }
}
</script>
