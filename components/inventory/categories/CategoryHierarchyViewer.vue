<template>
  <div class="space-y-4">
    <!-- Hierarchy Controls -->
    <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div class="flex flex-col sm:flex-row gap-2 flex-1">
        <div class="relative flex-1 max-w-sm">
          <SearchIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            v-model="searchTerm"
            placeholder="Search in hierarchy..."
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
      <div class="flex items-center gap-2">
        <Button variant="outline" size="sm" @click="$emit('refresh')" :disabled="loading">
          <RefreshCwIcon class="h-4 w-4 mr-2" :class="{ 'animate-spin': loading }" />
          Refresh
        </Button>
        <Button size="sm" @click="$emit('create-category')">
          <PlusIcon class="h-4 w-4 mr-2" />
          New Category
        </Button>
      </div>
    </div>

    <!-- Hierarchy Statistics -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card class="p-4">
        <div class="flex items-center space-x-2">
          <FolderIcon class="h-5 w-5 text-primary" />
          <div>
            <div class="text-2xl font-bold">{{ rootCategoriesCount }}</div>
            <div class="text-sm text-muted-foreground">Root Categories</div>
          </div>
        </div>
      </Card>
      <Card class="p-4">
        <div class="flex items-center space-x-2">
          <FolderTreeIcon class="h-5 w-5 text-primary" />
          <div>
            <div class="text-2xl font-bold">{{ totalCategoriesCount }}</div>
            <div class="text-sm text-muted-foreground">Total Categories</div>
          </div>
        </div>
      </Card>
      <Card class="p-4">
        <div class="flex items-center space-x-2">
          <NetworkIcon class="h-5 w-5 text-primary" />
          <div>
            <div class="text-2xl font-bold">{{ maxDepth }}</div>
            <div class="text-sm text-muted-foreground">Max Depth</div>
          </div>
        </div>
      </Card>
      <Card class="p-4">
        <div class="flex items-center space-x-2">
          <PackageIcon class="h-5 w-5 text-primary" />
          <div>
            <div class="text-2xl font-bold">{{ totalItemsCount }}</div>
            <div class="text-sm text-muted-foreground">Total Items</div>
          </div>
        </div>
      </Card>
    </div>

    <!-- Hierarchy Tree -->
    <div class="rounded-lg border bg-card p-4">
      <div v-if="loading" class="text-center py-8">
        <div class="flex items-center justify-center space-x-2">
          <Loader2Icon class="h-4 w-4 animate-spin" />
          <span>Loading hierarchy...</span>
        </div>
      </div>
      <div v-else-if="error" class="text-center py-8 text-red-600">
        <div class="flex flex-col items-center space-y-2">
          <AlertCircleIcon class="h-8 w-8" />
          <span>{{ error }}</span>
          <Button variant="outline" size="sm" @click="$emit('refresh')">
            Try Again
          </Button>
        </div>
      </div>
      <div v-else-if="filteredRootCategories.length === 0" class="text-center py-8 text-muted-foreground">
        <div class="flex flex-col items-center space-y-2">
          <FolderTreeIcon class="h-8 w-8 text-muted-foreground/50" />
          <span>No categories found</span>
          <Button variant="outline" size="sm" @click="$emit('create-category')">
            Create First Category
          </Button>
        </div>
      </div>
      <div v-else class="space-y-2">
        <CategoryTreeNode
          v-for="rootCategory in filteredRootCategories"
          :key="rootCategory.id"
          :category="rootCategory"
          :categories="allCategories"
          :expanded-nodes="expandedNodes"
          :search-term="searchTerm"
          :enable-lazy-loading="true"
          @toggle-expand="toggleExpand"
          @view-category="$emit('view-category', $event)"
          @edit-category="$emit('edit-category', $event)"
          @duplicate-category="$emit('duplicate-category', $event)"
          @delete-category="$emit('delete-category', $event)"
          @create-subcategory="handleCreateSubcategory"
          @load-subcategories="handleLoadSubcategories"
        />
      </div>
    </div>

    
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  SearchIcon, ChevronDownIcon, ChevronUpIcon, RefreshCwIcon, PlusIcon,
  Loader2Icon, AlertCircleIcon, FolderTreeIcon, FolderIcon, NetworkIcon, PackageIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import CategoryTreeNode from './CategoryTreeNode.vue'

// Props
const props = defineProps({
  categories: {
    type: Array,
    default: () => []
  },
  hierarchy: {
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
  'view-category',
  'edit-category',
  'duplicate-category',
  'delete-category',
  'create-category',
  'refresh',
  'load-subcategories'
])

// State
const searchTerm = ref('')
const expandedNodes = ref(new Set())

// Computed
const rootCategories = computed(() => {
  // If hierarchy data is available, use it (it's already structured with hierarchy info)
  if (props.hierarchy && props.hierarchy.length > 0) {
    // Filter hierarchy data to get only root categories (those without parentCategoryId)
    const roots = props.hierarchy.filter(category => !category.parentCategoryId)
    return roots
  }
  // Fallback to building from flat categories array
  const roots = props.categories.filter(category => !category.parentCategoryId)
  return roots
})

const allCategories = computed(() => {
  // Always provide the complete flat array for fallback lookups
  // This combines hierarchy data (flattened) with regular categories
  const flatCategories = []
  
  if (props.hierarchy && props.hierarchy.length > 0) {
    // Extract all categories from hierarchy (including nested ones)
    const flatten = (categories) => {
      for (const category of categories) {
        flatCategories.push(category)
        if (category.subCategories && category.subCategories.length > 0) {
          flatten(category.subCategories)
        }
      }
    }
    flatten(props.hierarchy)
  }
  
  // Also include flat categories array, merging them without duplicates
  props.categories.forEach(cat => {
    const exists = flatCategories.find(existing => existing.id === cat.id)
    if (!exists) {
      flatCategories.push(cat)
    }
  })
  
  return flatCategories
})

const filteredRootCategories = computed(() => {
  if (!searchTerm.value) {
    return rootCategories.value
  }

  const search = searchTerm.value.toLowerCase()
  
  // Find categories that match search or have children that match
  const matchingCategories = new Set()
  
  const searchInTree = (category) => {
    const matches = category.name.toLowerCase().includes(search) ||
                   category.code.toLowerCase().includes(search) ||
                   category.description?.toLowerCase().includes(search)
    
    if (matches) {
      matchingCategories.add(category.id)
      // Add all parents
      let parent = allCategories.value.find(c => c.id === category.parentCategoryId)
      while (parent) {
        matchingCategories.add(parent.id)
        parent = allCategories.value.find(c => c.id === parent.parentCategoryId)
      }
    }
    
    // Check children
    const children = allCategories.value.filter(c => c.parentCategoryId === category.id)
    children.forEach(child => {
      if (searchInTree(child)) {
        matchingCategories.add(category.id)
      }
    })
    
    return matches
  }
  
  // Search through all categories
  allCategories.value.forEach(searchInTree)
  
  return rootCategories.value.filter(category => matchingCategories.has(category.id))
})

const rootCategoriesCount = computed(() => rootCategories.value.length)

const totalCategoriesCount = computed(() => allCategories.value.length)

const maxDepth = computed(() => {
  let depth = 0
  
  const calculateDepth = (categoryId, currentDepth = 0) => {
    depth = Math.max(depth, currentDepth)
    const children = allCategories.value.filter(c => c.parentCategoryId === categoryId)
    children.forEach(child => calculateDepth(child.id, currentDepth + 1))
  }
  
  rootCategories.value.forEach(category => calculateDepth(category.id, 1))
  
  return depth
})

const totalItemsCount = computed(() => {
  return allCategories.value.reduce((total, category) => total + (category.itemsCount || 0), 0)
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
  const allIds = new Set(allCategories.value.map(c => c.id))
  expandedNodes.value = allIds
}

const collapseAll = () => {
  expandedNodes.value.clear()
}

const handleCreateSubcategory = (parentCategory) => {
  // Emit create-category with parent context
  emit('create-category', { parentCategory })
}

const handleLoadSubcategories = (parentId) => {
  console.log(`CategoryHierarchyViewer: Handling load subcategories for parent ${parentId}`)
  // Emit load-subcategories to let parent component handle the loading
  emit('load-subcategories', parentId)
}

// Auto-expand nodes that have subcategories when hierarchy data changes
watch(() => props.hierarchy, (newHierarchy) => {
  if (newHierarchy && newHierarchy.length > 0) {
    // Auto-expand categories that have subCategories loaded
    const autoExpandIds = new Set()
    
    const addExpandedIds = (categories) => {
      categories.forEach(category => {
        if (category.subCategories && category.subCategories.length > 0) {
          autoExpandIds.add(category.id)
          addExpandedIds(category.subCategories)
        }
      })
    }
    
    addExpandedIds(newHierarchy)
    
    // Merge with existing expanded nodes
    autoExpandIds.forEach(id => expandedNodes.value.add(id))
  }
}, { immediate: true, deep: true })

// Also watch the categories array for newly loaded subcategories
watch(() => props.categories, (newCategories) => {
  if (newCategories && newCategories.length > 0) {
    // Find parent categories that have children and auto-expand them
    const parentIds = new Set()
    newCategories.forEach(category => {
      if (category.parentCategoryId) {
        parentIds.add(category.parentCategoryId)
      }
    })
    
    // Auto-expand parent categories
    parentIds.forEach(id => expandedNodes.value.add(id))
  }
}, { deep: true })
</script>
