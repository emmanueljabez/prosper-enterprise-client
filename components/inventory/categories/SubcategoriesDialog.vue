<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-4xl max-h-[80vh] flex flex-col">
      <DialogHeader>
        <DialogTitle class="flex items-center space-x-2">
          <FolderTreeIcon class="h-5 w-5" />
          <span>Subcategories of {{ parentCategory?.name }}</span>
        </DialogTitle>
        <DialogDescription>
          View and manage subcategories under {{ parentCategory?.name }}
        </DialogDescription>
      </DialogHeader>
      
      <div class="flex-1 min-h-0 space-y-4">
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-8">
          <div class="flex items-center space-x-2">
            <Loader2Icon class="h-4 w-4 animate-spin" />
            <span>Loading subcategories...</span>
          </div>
        </div>
        
        <!-- Error State -->
        <div v-else-if="error" class="flex items-center justify-center py-8 text-red-600">
          <div class="flex flex-col items-center space-y-2">
            <AlertCircleIcon class="h-8 w-8" />
            <span>{{ error }}</span>
            <Button variant="outline" size="sm" @click="handleRefresh">
              Try Again
            </Button>
          </div>
        </div>
        
        <!-- No Subcategories -->
        <div v-else-if="subcategories.length === 0" class="flex items-center justify-center py-8 text-muted-foreground">
          <div class="flex flex-col items-center space-y-2">
            <FolderIcon class="h-8 w-8 text-muted-foreground/50" />
            <span>No subcategories found</span>
            <span class="text-sm">This category doesn't have any subcategories yet</span>
            <Button variant="outline" size="sm" @click="$emit('create-subcategory', parentCategory)">
              <PlusIcon class="h-4 w-4 mr-2" />
              Create First Subcategory
            </Button>
          </div>
        </div>
        
        <!-- Subcategories Tree -->
        <div v-else class="space-y-2 overflow-auto">
          <!-- Search -->
          <div class="flex items-center space-x-2">
            <div class="relative flex-1 max-w-sm">
              <SearchIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                v-model="searchTerm"
                placeholder="Search subcategories..."
                class="pl-10"
              />
            </div>
            <Button variant="outline" size="sm" @click="expandAll">
              <ChevronDownIcon class="h-4 w-4 mr-2" />
              Expand All
            </Button>
            <Button variant="outline" size="sm" @click="collapseAll">
              <ChevronUpIcon class="h-4 w-4 mr-2" />
              Collapse All
            </Button>
          </div>
          
          <!-- Tree View -->
          <div class="border rounded-lg p-4 bg-muted/20 max-h-96 overflow-auto">
            <CategoryTreeNode
              v-for="subcategory in filteredSubcategories"
              :key="subcategory.id"
              :category="subcategory"
              :categories="allCategories"
              :expanded-nodes="expandedNodes"
              :search-term="searchTerm"
              :enable-lazy-loading="true"
              @toggle-expand="toggleExpand"
              @view-category="$emit('view-category', $event)"
              @edit-category="$emit('edit-category', $event)"
              @duplicate-category="$emit('duplicate-category', $event)"
              @delete-category="$emit('delete-category', $event)"
              @create-subcategory="$emit('create-subcategory', $event)"
              @load-subcategories="$emit('load-subcategories', $event)"
            />
          </div>
          
          <!-- Statistics -->
          <div class="grid grid-cols-3 gap-4 pt-4 border-t">
            <div class="text-center">
              <div class="text-2xl font-bold text-primary">{{ subcategories.length }}</div>
              <div class="text-sm text-muted-foreground">Direct Subcategories</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-primary">{{ totalDescendants }}</div>
              <div class="text-sm text-muted-foreground">Total Descendants</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-primary">{{ maxDepth }}</div>
              <div class="text-sm text-muted-foreground">Max Depth</div>
            </div>
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" @click="$emit('update:open', false)">
          Close
        </Button>
        <Button @click="$emit('create-subcategory', parentCategory)">
          <PlusIcon class="h-4 w-4 mr-2" />
          Add Subcategory
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  FolderTreeIcon, FolderIcon, SearchIcon, ChevronDownIcon, ChevronUpIcon,
  Loader2Icon, AlertCircleIcon, PlusIcon
} from 'lucide-vue-next'
import CategoryTreeNode from './CategoryTreeNode.vue'

// Props
const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  parentCategory: {
    type: Object,
    default: null
  },
  subcategories: {
    type: Array,
    default: () => []
  },
  allCategories: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  }
})

// Emits
const emit = defineEmits([
  'update:open',
  'view-category',
  'edit-category',
  'duplicate-category',
  'delete-category',
  'create-subcategory',
  'load-subcategories',
  'refresh'
])

// State
const searchTerm = ref('')
const expandedNodes = ref(new Set())

// Computed
const filteredSubcategories = computed(() => {
  if (!searchTerm.value) {
    return props.subcategories
  }

  const search = searchTerm.value.toLowerCase()
  
  // Find subcategories that match search or have children that match
  const matchingCategories = new Set()
  
  const searchInTree = (category) => {
    const matches = category.name.toLowerCase().includes(search) ||
                   category.code.toLowerCase().includes(search) ||
                   category.description?.toLowerCase().includes(search)
    
    if (matches) {
      matchingCategories.add(category.id)
      // Add all parents
      let parent = props.allCategories.find(c => c.id === category.parentCategoryId)
      while (parent) {
        matchingCategories.add(parent.id)
        parent = props.allCategories.find(c => c.id === parent.parentCategoryId)
      }
    }
    
    // Check children
    const children = props.allCategories.filter(c => c.parentCategoryId === category.id)
    children.forEach(child => {
      if (searchInTree(child)) {
        matchingCategories.add(category.id)
      }
    })
    
    return matches
  }
  
  // Search through all categories
  props.allCategories.forEach(searchInTree)
  
  return props.subcategories.filter(category => matchingCategories.has(category.id))
})

const totalDescendants = computed(() => {
  if (!props.parentCategory) return 0
  
  const countDescendants = (parentId) => {
    const children = props.allCategories.filter(c => c.parentCategoryId === parentId)
    let count = children.length
    children.forEach(child => {
      count += countDescendants(child.id)
    })
    return count
  }
  
  return countDescendants(props.parentCategory.id)
})

const maxDepth = computed(() => {
  if (!props.parentCategory) return 0
  
  let depth = 0
  
  const calculateDepth = (parentId, currentDepth = 0) => {
    depth = Math.max(depth, currentDepth)
    const children = props.allCategories.filter(c => c.parentCategoryId === parentId)
    children.forEach(child => calculateDepth(child.id, currentDepth + 1))
  }
  
  calculateDepth(props.parentCategory.id)
  
  return depth
})

// Methods
const toggleExpand = (categoryId) => {
  if (expandedNodes.value.has(categoryId)) {
    expandedNodes.value.delete(categoryId)
  } else {
    expandedNodes.value.add(categoryId)
  }
}

const expandAll = () => {
  const allIds = new Set(props.allCategories.map(c => c.id))
  expandedNodes.value = allIds
}

const collapseAll = () => {
  expandedNodes.value.clear()
}

const handleRefresh = () => {
  emit('refresh')
}

// Auto-expand when subcategories change
watch(() => props.subcategories, (newSubcategories) => {
  if (newSubcategories && newSubcategories.length > 0) {
    // Auto-expand the direct subcategories
    newSubcategories.forEach(sub => {
      if (sub.subCategories && sub.subCategories.length > 0) {
        expandedNodes.value.add(sub.id)
      }
    })
  }
}, { immediate: true, deep: true })
</script>
