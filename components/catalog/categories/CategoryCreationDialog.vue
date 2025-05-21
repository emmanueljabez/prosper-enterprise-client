<template>
  <DialogContent class="sm:max-w-[550px]">
    <DialogHeader>
      <DialogTitle>Create New Category</DialogTitle>
      <DialogDescription>
        Add a new product category to organize your inventory
      </DialogDescription>
    </DialogHeader>

    <div class="space-y-6 py-4 max-h-[60vh] overflow-y-auto pr-2">
      <div class="space-y-4">
        <!-- Basic Information -->
        <div>
          <h3 class="text-sm font-medium mb-2">Basic Information</h3>
          <div class="space-y-4">
            <div class="grid grid-cols-1 gap-4">
              <div class="space-y-2">
                <Label for="category-name">Name <span class="text-destructive">*</span></Label>
                <Input 
                  id="category-name"
                  v-model="form.name"
                  placeholder="e.g. Electronics, Clothing, etc."
                  :disabled="isSubmitting"
                />
                <p v-if="errors.name" class="text-sm text-destructive">{{ errors.name }}</p>
              </div>
              
              <div class="space-y-2">
                <Label for="category-description">Description</Label>
                <Textarea 
                  id="category-description"
                  v-model="form.description"
                  placeholder="Describe the category..."
                  :disabled="isSubmitting"
                />
              </div>

              <div class="space-y-2">
                <Label for="category-slug">Slug</Label>
                <div class="flex">
                  <Input 
                    id="category-slug"
                    v-model="form.slug"
                    placeholder="URL-friendly name"
                    :disabled="isSubmitting || form.autoGenerateSlug"
                    class="rounded-r-none"
                  />
                  <Button 
                    variant="secondary" 
                    class="rounded-l-none"
                    @click="generateSlug"
                  >
                    Generate
                  </Button>
                </div>
                <div class="flex items-center space-x-2 mt-1">
                  <Checkbox 
                    id="auto-slug" 
                    v-model:checked="form.autoGenerateSlug"
                    :disabled="isSubmitting"
                  />
                  <Label for="auto-slug" class="text-sm">Auto-generate from name</Label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Organization -->
        <div>
          <h3 class="text-sm font-medium mb-2">Organization</h3>
          <div class="space-y-4">
            <div class="grid grid-cols-1 gap-4">
              <div class="space-y-2">
                <Label for="parent-category">Parent Category</Label>
                <Select
                  id="parent-category"
                  v-model="form.parentId"
                  :disabled="isSubmitting"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a parent category (optional)" />
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
                <p class="text-sm text-muted-foreground">
                  Organize categories hierarchically. Leave empty for a top-level category.
                </p>
              </div>

              <div class="space-y-2">
                <Label for="category-status">Status</Label>
                <Select
                  id="category-status"
                  v-model="form.status"
                  :disabled="isSubmitting"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <!-- Display Options -->
        <div>
          <h3 class="text-sm font-medium mb-2">Display Options</h3>
          <div class="space-y-4">
            <div class="grid grid-cols-1 gap-4">
              <div class="space-y-2">
                <Label for="display-order">Display Order</Label>
                <Input 
                  id="display-order"
                  v-model="form.displayOrder"
                  type="number"
                  min="0"
                  :disabled="isSubmitting"
                />
                <p class="text-sm text-muted-foreground">
                  Controls the order in which categories are displayed. Lower numbers appear first.
                </p>
              </div>

              <div class="flex items-center space-x-2">
                <Checkbox 
                  id="featured" 
                  v-model:checked="form.featured"
                  :disabled="isSubmitting"
                />
                <div>
                  <Label for="featured">Featured Category</Label>
                  <p class="text-sm text-muted-foreground">
                    Featured categories may be highlighted in the UI
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" @click="$emit('close')" :disabled="isSubmitting">
        Cancel
      </Button>
      <Button @click="submitForm" :disabled="isSubmitting || !isValid">
        <Loader2 v-if="isSubmitting" class="h-4 w-4 mr-2 animate-spin" />
        Create Category
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const props = defineProps({
  categories: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['category-created', 'close'])

// Form state
const form = ref({
  name: '',
  description: '',
  slug: '',
  autoGenerateSlug: true,
  parentId: null,
  status: 'active',
  featured: false,
  displayOrder: 0
})

// Validation and submission state
const errors = ref({})
const isSubmitting = ref(false)

// Auto-generate slug when name changes and auto-generate is enabled
watch(() => form.value.name, (newName) => {
  if (form.value.autoGenerateSlug && newName) {
    form.value.slug = slugify(newName)
  }
})

// Computed properties
const isValid = computed(() => {
  return !!form.value.name.trim()
})

const availableParentCategories = computed(() => {
  // Filter out categories that would create circular references
  return props.categories.filter(category => {
    // Check if this category or any of its ancestors matches the current form
    const wouldCreateCircularRef = isDescendantOf(category, form.value.id)
    return !wouldCreateCircularRef
  })
})

// Utility functions
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '')          // Trim - from end of text
}

const generateSlug = () => {
  if (form.value.name) {
    form.value.slug = slugify(form.value.name)
  }
}

const isDescendantOf = (category, categoryId) => {
  if (!categoryId) return false
  if (category.id === categoryId) return true
  
  // Check if any parent category is the one we're looking for
  if (category.parentId) {
    const parent = props.categories.find(c => c.id === category.parentId)
    if (parent) {
      return isDescendantOf(parent, categoryId)
    }
  }
  
  return false
}

const validateForm = () => {
  const newErrors = {}
  
  if (!form.value.name.trim()) {
    newErrors.name = 'Category name is required'
  }
  
  if (form.value.slug && props.categories.some(c => c.slug === form.value.slug)) {
    newErrors.slug = 'A category with this slug already exists'
  }
  
  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

// Submit handler
const submitForm = async () => {
  if (!validateForm()) return
  
  isSubmitting.value = true
  
  try {
    // Create the category data object
    const categoryData = {
      name: form.value.name.trim(),
      description: form.value.description.trim(),
      slug: form.value.slug || slugify(form.value.name),
      parentId: form.value.parentId,
      status: form.value.status,
      featured: form.value.featured,
      displayOrder: parseInt(form.value.displayOrder) || 0,
      createdAt: new Date().toISOString()
    }
    
    // Emit the event with the new category data
    emit('category-created', categoryData)
  } catch (error) {
    console.error('Error creating category:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>