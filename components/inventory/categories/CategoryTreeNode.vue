<template>
  <div class="category-tree-node">
    <div 
      class="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 group cursor-pointer"
      :class="{
        'bg-muted/30': isHighlighted,
        'border-l-2 border-primary': isSearchMatch
      }"
      @click="handleClick"
    >
      <!-- Expand/Collapse Button -->
      <Button
        v-if="hasChildren"
        variant="ghost"
        size="sm"
        class="h-6 w-6 p-0"
        @click.stop="toggleExpand"
      >
        <ChevronRightIcon 
          class="h-4 w-4 transition-transform"
          :class="{ 'rotate-90': isExpanded }"
        />
      </Button>
      <div v-else class="w-6" />

      <!-- Category Icon -->
      <div class="flex items-center space-x-2 flex-1 min-w-0">
        <FolderIcon 
          class="h-4 w-4 flex-shrink-0"
          :class="category.isActive ? 'text-primary' : 'text-muted-foreground'"
        />
        
        <!-- Category Info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center space-x-2">
            <span class="font-medium truncate">{{ category.name }}</span>
            <Badge v-if="!category.isActive" variant="secondary" class="text-xs">
              Inactive
            </Badge>
            <Badge variant="outline" class="text-xs">
              {{ category.code }}
            </Badge>
          </div>
          <div v-if="category.description" class="text-sm text-muted-foreground truncate">
            {{ category.description }}
          </div>
        </div>

        <!-- Item Count -->
        <div class="flex items-center space-x-1 text-sm text-muted-foreground">
          <PackageIcon class="h-3 w-3" />
          <span>{{ category.itemsCount || 0 }}</span>
        </div>

        <!-- Actions -->
        <div class="opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" class="h-6 w-6 p-0" @click.stop>
                <MoreHorizontalIcon class="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem @click.stop="$emit('view-category', category)">
                <EyeIcon class="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem @click.stop="$emit('edit-category', category)">
                <EditIcon class="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem @click.stop="$emit('create-subcategory', category)">
                <PlusIcon class="h-4 w-4 mr-2" />
                Add Subcategory
              </DropdownMenuItem>
              <DropdownMenuItem @click.stop="$emit('duplicate-category', category)">
                <CopyIcon class="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                @click.stop="$emit('delete-category', category)"
                class="text-red-600 focus:text-red-600"
              >
                <TrashIcon class="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>

    <!-- Children -->
    <div 
      v-if="hasChildren && isExpanded"
      class="ml-6 mt-1 space-y-1 border-l border-muted-foreground/20 pl-2"
    >
      <CategoryTreeNode
        v-for="child in children"
        :key="child.id"
        :category="child"
        :categories="categories"
        :expanded-nodes="expandedNodes"
        :search-term="searchTerm"
        :enable-lazy-loading="enableLazyLoading"
        @toggle-expand="$emit('toggle-expand', $event)"
        @view-category="$emit('view-category', $event)"
        @edit-category="$emit('edit-category', $event)"
        @duplicate-category="$emit('duplicate-category', $event)"
        @delete-category="$emit('delete-category', $event)"
        @create-subcategory="$emit('create-subcategory', $event)"
        @load-subcategories="$emit('load-subcategories', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  ChevronRightIcon, FolderIcon, PackageIcon, MoreHorizontalIcon,
  EyeIcon, EditIcon, PlusIcon, CopyIcon, TrashIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

// Props
const props = defineProps({
  category: {
    type: Object,
    required: true
  },
  categories: {
    type: Array,
    default: () => []
  },
  expandedNodes: {
    type: Set,
    default: () => new Set()
  },
  searchTerm: {
    type: String,
    default: ''
  },
  enableLazyLoading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits([
  'toggle-expand',
  'view-category',
  'edit-category',
  'duplicate-category',
  'delete-category',
  'create-subcategory',
  'load-subcategories'
])

// Computed
const children = computed(() => {
  // First check if category has subCategories (from hierarchy API)
  if (props.category.subCategories && Array.isArray(props.category.subCategories) && props.category.subCategories.length > 0) {
    return props.category.subCategories
  }
  // Fallback to filtering from flat categories array
  const flatChildren = props.categories.filter(cat => cat.parentCategoryId === props.category.id)
  return flatChildren
})

const hasChildren = computed(() => {
  // Check subCategories first (from hierarchy data)
  if (props.category.subCategories && Array.isArray(props.category.subCategories) && props.category.subCategories.length > 0) {
    return true
  }
  // Check hasChildren flag if available (this should be set by the backend)
  if (props.category.hasChildren !== undefined) {
    return props.category.hasChildren
  }
  // Check computed children from flat array
  const flatChildren = props.categories.filter(cat => cat.parentCategoryId === props.category.id)
  if (flatChildren.length > 0) {
    return true
  }
  // For lazy loading, if we're in the top level and this is a category without parentCategoryId,
  // assume it might have children that need to be loaded
  if (props.enableLazyLoading && !props.category.parentCategoryId) {
    return true // Allow expansion to trigger lazy loading
  }
  return false
})

const isExpanded = computed(() => props.expandedNodes.has(props.category.id))

const isSearchMatch = computed(() => {
  if (!props.searchTerm) return false
  const search = props.searchTerm.toLowerCase()
  return props.category.name.toLowerCase().includes(search) ||
         props.category.code.toLowerCase().includes(search) ||
         props.category.description?.toLowerCase().includes(search)
})

const isHighlighted = computed(() => {
  // Could be used for selection or other highlighting
  return false
})

// Methods
const toggleExpand = async () => {
  const currentlyExpanded = isExpanded.value
  const currentChildren = children.value
  
  // Always emit toggle-expand first
  emit('toggle-expand', props.category.id)
  
  // If we're expanding (not collapsing) and lazy loading is enabled
  if (!currentlyExpanded && props.enableLazyLoading) {
    // Check if we need to load subcategories
    const hasSubCategoriesLoaded = props.category.subCategories && props.category.subCategories.length > 0
    const hasFlatChildrenLoaded = currentChildren.length > 0
    
    // If no children are loaded yet, trigger lazy loading
    if (!hasSubCategoriesLoaded && !hasFlatChildrenLoaded) {
      console.log(`Triggering lazy load for category: ${props.category.name} (ID: ${props.category.id})`)
      emit('load-subcategories', props.category.id)
    }
  }
}

const handleClick = () => {
  if (hasChildren.value) {
    toggleExpand()
  } else {
    emit('view-category', props.category)
  }
}
</script>


