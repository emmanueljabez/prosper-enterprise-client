<template>
  <DialogContent class="sm:max-w-md">
    <DialogHeader>
      <DialogTitle class="flex items-center space-x-2">
        <AlertTriangleIcon class="h-5 w-5 text-red-600" />
        <span>Delete Category</span>
      </DialogTitle>
      <DialogDescription>
        This action cannot be undone. Please confirm the deletion.
      </DialogDescription>
    </DialogHeader>

    <div v-if="category" class="space-y-4">
      <!-- Category Info -->
      <div class="p-4 bg-muted/50 rounded-lg">
        <div class="flex items-center space-x-3">
          <FolderIcon class="h-8 w-8 text-red-600" />
          <div>
            <div class="font-semibold">{{ category.name }}</div>
            <div class="text-sm text-muted-foreground">{{ category.code }}</div>
            <div v-if="category.description" class="text-sm text-muted-foreground mt-1">
              {{ category.description }}
            </div>
          </div>
        </div>
      </div>

      <!-- Impact Assessment -->
      <div class="space-y-3">
        <h4 class="font-medium text-sm">Deletion Impact:</h4>
        
        <div v-if="subcategoriesCount > 0" class="flex items-center space-x-2 text-red-600">
          <AlertCircleIcon class="h-4 w-4" />
          <span class="text-sm">{{ subcategoriesCount }} subcategories will be deleted</span>
        </div>
        
        <div v-if="itemsCount > 0" class="flex items-center space-x-2 text-red-600">
          <AlertCircleIcon class="h-4 w-4" />
          <span class="text-sm">{{ itemsCount }} items will lose their category assignment</span>
        </div>
        
        <div v-if="totalDescendantsCount > 0" class="flex items-center space-x-2 text-red-600">
          <AlertCircleIcon class="h-4 w-4" />
          <span class="text-sm">{{ totalDescendantsCount }} total categories in this hierarchy will be affected</span>
        </div>

        <div v-if="!hasImpact" class="flex items-center space-x-2 text-green-600">
          <CheckIcon class="h-4 w-4" />
          <span class="text-sm">This category is empty and safe to delete</span>
        </div>
      </div>

      <!-- Confirmation Input -->
      <div v-if="hasHighImpact" class="space-y-2">
        <Label for="confirmation">
          Type <code class="bg-muted px-1 rounded">{{ category.code }}</code> to confirm deletion:
        </Label>
        <Input
          id="confirmation"
          v-model="confirmationText"
          placeholder="Enter category code"
          :class="{ 'border-red-500': showValidation && !isConfirmed }"
        />
        <p v-if="showValidation && !isConfirmed" class="text-sm text-red-500">
          Please type the category code exactly as shown above
        </p>
      </div>

      <!-- Options for items -->
      <div v-if="itemsCount > 0" class="space-y-3">
        <Label>What should happen to the {{ itemsCount }} items in this category?</Label>
        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <input
              id="unassign"
              v-model="itemHandling"
              type="radio"
              value="unassign"
              class="rounded"
            />
            <Label for="unassign" class="text-sm">
              Remove category assignment (items become uncategorized)
            </Label>
          </div>
          <div v-if="category.parentCategoryId" class="flex items-center space-x-2">
            <input
              id="moveToParent"
              v-model="itemHandling"
              type="radio"
              value="moveToParent"
              class="rounded"
            />
            <Label for="moveToParent" class="text-sm">
              Move items to parent category: {{ parentCategoryName }}
            </Label>
          </div>
          <div class="flex items-center space-x-2">
            <input
              id="moveToOther"
              v-model="itemHandling"
              type="radio"
              value="moveToOther"
              class="rounded"
            />
            <Label for="moveToOther" class="text-sm">Move items to another category</Label>
          </div>
        </div>

        <!-- Category selector for moving items -->
        <div v-if="itemHandling === 'moveToOther'" class="mt-2">
          <Select v-model="targetCategoryId">
            <SelectTrigger>
              <SelectValue placeholder="Select target category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem 
                v-for="cat in availableCategories" 
                :key="cat.id" 
                :value="cat.id.toString()"
              >
                {{ '  '.repeat(cat.level || 0) }}{{ cat.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" @click="$emit('close')">
        Cancel
      </Button>
      <Button 
        variant="destructive" 
        @click="confirmDelete"
        :disabled="hasHighImpact && !isConfirmed || (itemsCount > 0 && !itemHandling) || isDeleting"
      >
        <Loader2Icon v-if="isDeleting" class="h-4 w-4 mr-2 animate-spin" />
        <TrashIcon v-else class="h-4 w-4 mr-2" />
        Delete Category
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  AlertTriangleIcon, FolderIcon, AlertCircleIcon, CheckIcon,
  Loader2Icon, TrashIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
const emit = defineEmits(['delete', 'close'])

// State
const confirmationText = ref('')
const showValidation = ref(false)
const isDeleting = ref(false)
const itemHandling = ref('unassign')
const targetCategoryId = ref('')

// Computed
const subcategoriesCount = computed(() => {
  if (!props.category) return 0
  return props.parentCategories.filter(cat => cat.parentCategoryId === props.category.id).length
})

const itemsCount = computed(() => props.category?.itemsCount || 0)

const totalDescendantsCount = computed(() => {
  if (!props.category) return 0
  
  const countDescendants = (categoryId) => {
    const children = props.parentCategories.filter(cat => cat.parentCategoryId === categoryId)
    let count = children.length
    children.forEach(child => {
      count += countDescendants(child.id)
    })
    return count
  }
  
  return countDescendants(props.category.id)
})

const hasImpact = computed(() => {
  return subcategoriesCount.value > 0 || itemsCount.value > 0
})

const hasHighImpact = computed(() => {
  return subcategoriesCount.value > 0 || itemsCount.value > 10 || totalDescendantsCount.value > 5
})

const isConfirmed = computed(() => {
  if (!hasHighImpact.value) return true
  return confirmationText.value === props.category?.code
})

const parentCategoryName = computed(() => {
  if (!props.category?.parentCategoryId) return null
  const parent = props.parentCategories.find(cat => cat.id === props.category.parentCategoryId)
  return parent?.name
})

const availableCategories = computed(() => {
  if (!props.category) return []
  
  // Exclude current category and its descendants
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

// Methods
const confirmDelete = async () => {
  if (hasHighImpact.value && !isConfirmed.value) {
    showValidation.value = true
    return
  }
  
  if (itemsCount.value > 0 && !itemHandling.value) {
    return
  }
  
  if (itemHandling.value === 'moveToOther' && !targetCategoryId.value) {
    return
  }
  
  isDeleting.value = true
  
  try {
    const deleteOptions = {
      itemHandling: itemHandling.value,
      targetCategoryId: targetCategoryId.value ? parseInt(targetCategoryId.value) : null
    }
    
    emit('delete', props.category, deleteOptions)
  } catch (error) {
    console.error('Error deleting category:', error)
  } finally {
    isDeleting.value = false
  }
}

const resetForm = () => {
  confirmationText.value = ''
  showValidation.value = false
  itemHandling.value = 'unassign'
  targetCategoryId.value = ''
  isDeleting.value = false
}

// Reset form when category changes
watch(() => props.category, () => {
  resetForm()
})
</script>
