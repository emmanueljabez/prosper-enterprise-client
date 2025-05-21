<template>
  <DialogContent class="sm:max-w-[550px]">
    <DialogHeader>
      <DialogTitle>Category Details</DialogTitle>
      <DialogDescription>
        View information about this product category
      </DialogDescription>
    </DialogHeader>

    <div class="space-y-6 py-4 max-h-[60vh] overflow-y-auto pr-2">
      <!-- Basic Information -->
      <div>
        <h3 class="text-sm font-medium mb-2">Basic Information</h3>
        <div class="rounded-md border p-4 space-y-3">
          <div>
            <span class="text-sm font-medium text-muted-foreground">Name:</span>
            <p class="text-lg font-medium mt-1">{{ category.name }}</p>
          </div>
          
          <div>
            <span class="text-sm font-medium text-muted-foreground">Description:</span>
            <p class="mt-1">{{ category.description || 'No description provided' }}</p>
          </div>
          
          <div>
            <span class="text-sm font-medium text-muted-foreground">Slug:</span>
            <p class="mt-1 font-mono text-sm">{{ category.slug }}</p>
          </div>
          
          <div>
            <span class="text-sm font-medium text-muted-foreground">ID:</span>
            <p class="mt-1 font-mono text-sm">{{ category.id }}</p>
          </div>
        </div>
      </div>

      <!-- Organization -->
      <div>
        <h3 class="text-sm font-medium mb-2">Organization</h3>
        <div class="rounded-md border p-4 space-y-3">
          <div>
            <span class="text-sm font-medium text-muted-foreground">Parent Category:</span>
            <p class="mt-1">
              <Badge v-if="parentCategory" variant="outline">
                {{ parentCategory.name }}
              </Badge>
              <span v-else>None (Top-level Category)</span>
            </p>
          </div>
          
          <div>
            <span class="text-sm font-medium text-muted-foreground">Status:</span>
            <p class="mt-1">
              <Badge 
                :variant="getStatusVariant(category.status)" 
                class="capitalize"
              >
                {{ category.status || 'active' }}
              </Badge>
            </p>
          </div>
          
          <div>
            <span class="text-sm font-medium text-muted-foreground">Child Categories:</span>
            <div class="mt-1 flex flex-wrap gap-2">
              <Badge v-for="child in childCategories" :key="child.id" variant="secondary">
                {{ child.name }}
              </Badge>
              <span v-if="childCategories.length === 0">No child categories</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Display Options -->
      <div>
        <h3 class="text-sm font-medium mb-2">Display Options</h3>
        <div class="rounded-md border p-4 space-y-3">
          <div>
            <span class="text-sm font-medium text-muted-foreground">Display Order:</span>
            <p class="mt-1">{{ category.displayOrder || 0 }}</p>
          </div>
          
          <div>
            <span class="text-sm font-medium text-muted-foreground">Featured:</span>
            <p class="mt-1">
              <Badge 
                :variant="category.featured ? 'default' : 'outline'" 
                class="capitalize"
              >
                {{ category.featured ? 'Yes' : 'No' }}
              </Badge>
            </p>
          </div>
        </div>
      </div>

      <!-- Date Information -->
      <div>
        <h3 class="text-sm font-medium mb-2">Timestamps</h3>
        <div class="rounded-md border p-4 space-y-3">
          <div>
            <span class="text-sm font-medium text-muted-foreground">Created:</span>
            <p class="mt-1">{{ formatDate(category.createdAt) }}</p>
          </div>
          
          <div v-if="category.updatedAt">
            <span class="text-sm font-medium text-muted-foreground">Last Updated:</span>
            <p class="mt-1">{{ formatDate(category.updatedAt) }}</p>
          </div>
        </div>
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" @click="$emit('close')">
        Close
      </Button>
      <Button variant="default" @click="$emit('edit-category', category)">
        <Pencil class="h-4 w-4 mr-2" />
        Edit Category
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { computed } from 'vue'
import { Pencil } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const props = defineProps({
  category: {
    type: Object,
    required: true
  },
  categories: {
    type: Array,
    default: () => []
  }
})

defineEmits(['edit-category', 'close'])

// Computed properties
const parentCategory = computed(() => {
  if (!props.category.parentId) return null
  return props.categories.find(c => c.id === props.category.parentId) || null
})

const childCategories = computed(() => {
  return props.categories.filter(c => c.parentId === props.category.id)
})

// Utility functions
const getStatusVariant = (status) => {
  switch (status) {
    case 'active': return 'default'
    case 'archived': return 'secondary'
    case 'draft': return 'outline'
    default: return 'outline'
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
}
</script>