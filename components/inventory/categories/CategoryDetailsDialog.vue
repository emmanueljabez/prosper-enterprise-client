<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="flex items-center space-x-2">
          <FolderIcon class="h-5 w-5" />
          <span>{{ category?.name || 'Category Details' }}</span>
        </DialogTitle>
        <DialogDescription>
          Detailed information about this category and its structure
        </DialogDescription>
      </DialogHeader>

      <div v-if="category" class="space-y-6">
        <!-- Basic Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card class="p-4">
            <h3 class="font-semibold mb-3 flex items-center space-x-2">
              <InfoIcon class="h-4 w-4" />
              <span>Basic Information</span>
            </h3>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Code:</span>
                <Badge variant="outline">{{ category.code }}</Badge>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Name:</span>
                <span class="font-medium">{{ category.name }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Status:</span>
                <Badge :variant="category.isActive ? 'default' : 'secondary'">
                  {{ category.isActive ? 'Active' : 'Inactive' }}
                </Badge>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Sort Order:</span>
                <span>{{ category.sortOrder }}</span>
              </div>
            </div>
            <div v-if="category.description" class="mt-4">
              <span class="text-muted-foreground">Description:</span>
              <p class="mt-1 text-sm">{{ category.description }}</p>
            </div>
          </Card>

          <Card class="p-4">
            <h3 class="font-semibold mb-3 flex items-center space-x-2">
              <NetworkIcon class="h-4 w-4" />
              <span>Hierarchy</span>
            </h3>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Level:</span>
                <Badge variant="secondary">Level {{ category.level || 0 }}</Badge>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Parent:</span>
                <span v-if="category.parentCategory" class="font-medium">
                  {{ category.parentCategory.name }}
                </span>
                <span v-else class="text-muted-foreground">Root Category</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Subcategories:</span>
                <span>{{ subcategoriesCount }}</span>
              </div>
            </div>

            <!-- Breadcrumb Path -->
            <div v-if="breadcrumbPath.length > 0" class="mt-4">
              <span class="text-muted-foreground text-sm">Path:</span>
              <div class="flex items-center space-x-1 mt-1 text-sm">
                <FolderIcon class="h-3 w-3" />
                <span v-for="(item, index) in breadcrumbPath" :key="index" class="flex items-center space-x-1">
                  <span>{{ item }}</span>
                  <ChevronRightIcon v-if="index < breadcrumbPath.length - 1" class="h-3 w-3 text-muted-foreground" />
                </span>
                <ChevronRightIcon class="h-3 w-3 text-muted-foreground" />
                <span class="font-medium text-primary">{{ category.name }}</span>
              </div>
            </div>
          </Card>
        </div>

        <!-- Statistics -->
        <Card class="p-4">
          <h3 class="font-semibold mb-3 flex items-center space-x-2">
            <BarChart3Icon class="h-4 w-4" />
            <span>Statistics</span>
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center p-3 bg-muted/50 rounded-lg">
              <PackageIcon class="h-6 w-6 mx-auto mb-2 text-primary" />
              <div class="text-2xl font-bold">{{ category.itemsCount || 0 }}</div>
              <div class="text-sm text-muted-foreground">Items</div>
            </div>
            <div class="text-center p-3 bg-muted/50 rounded-lg">
              <FolderTreeIcon class="h-6 w-6 mx-auto mb-2 text-primary" />
              <div class="text-2xl font-bold">{{ subcategoriesCount }}</div>
              <div class="text-sm text-muted-foreground">Subcategories</div>
            </div>
            <div class="text-center p-3 bg-muted/50 rounded-lg">
              <TrendingUpIcon class="h-6 w-6 mx-auto mb-2 text-primary" />
              <div class="text-2xl font-bold">{{ totalDescendants }}</div>
              <div class="text-sm text-muted-foreground">Total Descendants</div>
            </div>
            <div class="text-center p-3 bg-muted/50 rounded-lg">
              <CalendarIcon class="h-6 w-6 mx-auto mb-2 text-primary" />
              <div class="text-sm font-bold">{{ formatDate(category.createdAt) }}</div>
              <div class="text-sm text-muted-foreground">Created</div>
            </div>
          </div>
        </Card>

        <!-- Category Tree -->
        <Card v-if="categoryTree && (categoryTree.subCategories?.length > 0 || category.parentCategory)" class="p-4">
          <h3 class="font-semibold mb-3 flex items-center space-x-2">
            <NetworkIcon class="h-4 w-4" />
            <span>Category Tree</span>
          </h3>
          <div class="bg-muted/30 rounded-lg p-4 max-h-64 overflow-y-auto">
            <CategoryTreeViewer
              v-if="categoryTree"
              :category="categoryTree"
              :current-category-id="category.id"
              @category-click="handleCategoryClick"
            />
          </div>
        </Card>

        <!-- Recent Items -->
        <Card v-if="recentItems?.length > 0" class="p-4">
          <h3 class="font-semibold mb-3 flex items-center space-x-2">
            <PackageIcon class="h-4 w-4" />
            <span>Recent Items</span>
          </h3>
          <div class="space-y-2">
            <div 
              v-for="item in recentItems.slice(0, 5)" 
              :key="item.id"
              class="flex items-center justify-between p-2 rounded border hover:bg-muted/50"
            >
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                  <PackageIcon class="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div class="font-medium">{{ item.name }}</div>
                  <div class="text-sm text-muted-foreground">{{ item.code }}</div>
                </div>
              </div>
              <Badge variant="outline">{{ item.status }}</Badge>
            </div>
          </div>
          <Button variant="outline" size="sm" class="w-full mt-3">
            View All Items
          </Button>
        </Card>

        <!-- Audit Information -->
        <Card class="p-4">
          <h3 class="font-semibold mb-3 flex items-center space-x-2">
            <ClockIcon class="h-4 w-4" />
            <span>Audit Information</span>
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-muted-foreground">Created:</span>
              <div class="font-medium">{{ formatDateTime(category.createdAt) }}</div>
              <div v-if="category.createdBy" class="text-muted-foreground">by {{ category.createdBy }}</div>
            </div>
            <div>
              <span class="text-muted-foreground">Last Updated:</span>
              <div class="font-medium">{{ formatDateTime(category.updatedAt) }}</div>
              <div v-if="category.updatedBy" class="text-muted-foreground">by {{ category.updatedBy }}</div>
            </div>
          </div>
        </Card>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="$emit('update:open', false)">
          Close
        </Button>
        <Button @click="$emit('edit', category)">
          <EditIcon class="h-4 w-4 mr-2" />
          Edit Category
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { computed } from 'vue'
import {
  FolderIcon, InfoIcon, NetworkIcon, BarChart3Icon, PackageIcon,
  FolderTreeIcon, TrendingUpIcon, CalendarIcon, ChevronRightIcon,
  ClockIcon, EditIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import CategoryTreeViewer from './CategoryTreeViewer.vue'

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
  categoryTree: {
    type: Object,
    default: null
  }
})

// Emits
defineEmits(['update:open', 'edit'])

// Computed
const subcategoriesCount = computed(() => {
  return props.categoryTree?.subCategories?.length || 0
})

const totalDescendants = computed(() => {
  const countDescendants = (cat) => {
    if (!cat.subCategories) return 0
    let count = cat.subCategories.length
    cat.subCategories.forEach(sub => {
      count += countDescendants(sub)
    })
    return count
  }
  
  return props.categoryTree ? countDescendants(props.categoryTree) : 0
})

const breadcrumbPath = computed(() => {
  if (!props.category?.parentCategory) return []
  
  const buildPath = (cat) => {
    const path = []
    if (cat.parentCategory) {
      path.push(...buildPath(cat.parentCategory))
    }
    path.push(cat.name)
    return path
  }
  
  return buildPath(props.category.parentCategory)
})

const recentItems = computed(() => {
  // This would come from the API in a real implementation
  return props.category?.recentItems || []
})

// Methods
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString()
}

const handleCategoryClick = (category) => {
  // Could emit an event to navigate to that category
  console.log('Category clicked:', category)
}
</script>
