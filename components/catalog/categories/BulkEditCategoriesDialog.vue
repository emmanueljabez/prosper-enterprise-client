<template>
  <DialogContent class="sm:max-w-[650px]">
    <DialogHeader>
      <DialogTitle>Bulk Edit Categories</DialogTitle>
      <DialogDescription>
        Apply changes to {{ selectedCategories.length }} selected categories
      </DialogDescription>
    </DialogHeader>

    <div class="py-4 space-y-6">
      <!-- Selected Categories List -->
      <div>
        <h3 class="text-sm font-medium mb-2">Selected Categories</h3>
        <div class="border rounded-md p-2 max-h-[120px] overflow-y-auto">
          <div class="flex flex-wrap gap-2">
            <Badge 
              v-for="category in selectedCategories" 
              :key="category.id"
              variant="secondary"
              class="py-1"
            >
              {{ category.name }}
            </Badge>
          </div>
        </div>
      </div>

      <!-- Bulk Edit Form -->
      <div class="space-y-6">
        <div class="grid grid-cols-1 gap-6">
          <!-- Status -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <Label>Status</Label>
              <div class="flex items-center space-x-2">
                <Checkbox id="apply-status" v-model:checked="applyStatus" />
                <Label for="apply-status" class="text-xs">Apply changes</Label>
              </div>
            </div>
            <Select 
              v-model="form.status"
              :disabled="!applyStatus"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Parent Category -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <Label>Parent Category</Label>
              <div class="flex items-center space-x-2">
                <Checkbox id="apply-parent" v-model:checked="applyParent" />
                <Label for="apply-parent" class="text-xs">Apply changes</Label>
              </div>
            </div>
            <Select 
              v-model="form.parentId"
              :disabled="!applyParent"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a parent category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="null">None (Top-level Category)</SelectItem>
                <SelectItem 
                  v-for="category in availableParentCategories" 
                  :key="category.id" 
                  :value="category.id"
                >
                  {{ category.name }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="parentWarningVisible" class="text-sm text-amber-500">
              <AlertTriangle class="h-4 w-4 inline-block mr-1" />
              Cannot change parent for some categories that have child categories
            </p>
          </div>

          <!-- Featured Status -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <Label>Featured</Label>
              <div class="flex items-center space-x-2">
                <Checkbox id="apply-featured" v-model:checked="applyFeatured" />
                <Label for="apply-featured" class="text-xs">Apply changes</Label>
              </div>
            </div>
            <Select 
              v-model="form.featured"
              :disabled="!applyFeatured"
            >
              <SelectTrigger>
                <SelectValue placeholder="Set featured status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="true">Featured</SelectItem>
                <SelectItem :value="false">Not Featured</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Display Order Modifier -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <Label>Display Order</Label>
              <div class="flex items-center space-x-2">
                <Checkbox id="apply-display-order" v-model:checked="applyDisplayOrder" />
                <Label for="apply-display-order" class="text-xs">Apply changes</Label>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <Select 
                v-model="orderModifierType"
                :disabled="!applyDisplayOrder"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Modification type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="set">Set to value</SelectItem>
                  <SelectItem value="increment">Increment by</SelectItem>
                  <SelectItem value="decrement">Decrement by</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                v-model="form.displayOrder"
                :disabled="!applyDisplayOrder"
                min="0"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Warning if no changes are selected -->
      <Alert v-if="!hasChanges" variant="warning">
        <AlertCircle class="h-4 w-4" />
        <AlertTitle>No changes selected</AlertTitle>
        <AlertDescription>
          Enable at least one field to apply changes
        </AlertDescription>
      </Alert>
    </div>

    <DialogFooter>
      <Button variant="outline" @click="$emit('close')" :disabled="isSubmitting">
        Cancel
      </Button>
      <Button 
        @click="applyChanges" 
        :disabled="isSubmitting || !hasChanges"
      >
        <Loader2 v-if="isSubmitting" class="h-4 w-4 mr-2 animate-spin" />
        Apply to {{ selectedCategories.length }} Categories
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Loader2, AlertTriangle, AlertCircle } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const props = defineProps({
  selectedCategories: {
    type: Array,
    required: true
  },
  categories: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['categories-updated', 'close'])

// Form state
const form = ref({
  status: 'active',
  parentId: null,
  featured: false,
  displayOrder: 0
})

// Which fields to apply
const applyStatus = ref(false)
const applyParent = ref(false)
const applyFeatured = ref(false)
const applyDisplayOrder = ref(false)

// Display order modifier
const orderModifierType = ref('set')

// Submission state
const isSubmitting = ref(false)

// Computed properties
const hasChanges = computed(() => {
  return applyStatus.value || applyParent.value || applyFeatured.value || applyDisplayOrder.value
})

const availableParentCategories = computed(() => {
  // Filter out categories in the selection and any category that would create a circular reference
  return props.categories.filter(category => {
    // Skip any categories in the current selection
    if (props.selectedCategories.some(c => c.id === category.id)) {
      return false
    }
    
    // Skip categories that are descendants of selected categories
    // (to avoid circular references)
    for (const selectedCategory of props.selectedCategories) {
      if (isDescendantOf(category, selectedCategory.id)) {
        return false
      }
    }
    
    return true
  })
})

const parentWarningVisible = computed(() => {
  if (!applyParent.value) return false
  
  // Check if any selected category has children
  return props.selectedCategories.some(category => {
    return props.categories.some(c => c.parentId === category.id)
  })
})

// Utility functions
const isDescendantOf = (category, ancestorId) => {
  if (!ancestorId) return false
  if (category.id === ancestorId) return true
  
  // Check parent chain recursively
  if (category.parentId) {
    const parent = props.categories.find(c => c.id === category.parentId)
    if (parent) {
      return isDescendantOf(parent, ancestorId)
    }
  }
  
  return false
}

// Apply changes
const applyChanges = async () => {
  if (!hasChanges.value) return
  
  isSubmitting.value = true
  
  try {
    // Build the updates object with only the fields to apply
    const updates = {}
    
    if (applyStatus.value) {
      updates.status = form.value.status
    }
    
    if (applyParent.value) {
      updates.parentId = form.value.parentId
    }
    
    if (applyFeatured.value) {
      updates.featured = form.value.featured
    }
    
    if (applyDisplayOrder.value) {
      updates.displayOrder = {
        type: orderModifierType.value,
        value: parseInt(form.value.displayOrder) || 0
      }
    }
    
    // Emit the update event
    emit('categories-updated', props.selectedCategories, updates)
  } catch (error) {
    console.error('Error applying bulk changes:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>