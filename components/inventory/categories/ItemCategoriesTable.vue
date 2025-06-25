<template>
  <div class="space-y-4">
    <!-- Filters and Search -->
    <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div class="flex flex-col sm:flex-row gap-2 flex-1">
        <div class="relative flex-1 max-w-sm">
          <SearchIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            v-model="searchTerm"
            placeholder="Search categories..."
            class="pl-10"
          />
        </div>
        <Select v-model="parentFilter">
          <SelectTrigger class="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="root">Root Categories</SelectItem>
            <SelectItem value="sub">Subcategories</SelectItem>
            <SelectItem v-for="parent in rootCategories" :key="parent.id" :value="parent.id.toString()">
              {{ parent.name }}
            </SelectItem>
          </SelectContent>
        </Select>
        <Select v-model="statusFilter">
          <SelectTrigger class="w-[140px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="flex items-center gap-2">
        <Button 
          v-if="selectedCategories.length > 0"
          variant="outline" 
          size="sm" 
          @click="handleBulkEdit"
        >
          <EditIcon class="h-4 w-4 mr-2" />
          Bulk Edit ({{ selectedCategories.length }})
        </Button>
        <Button variant="outline" size="sm" @click="clearFilters">
          <XIcon class="h-4 w-4 mr-2" />
          Clear
        </Button>
        <Button variant="outline" size="sm" @click="emit('refresh')" :disabled="loading">
          <RefreshCwIcon class="h-4 w-4 mr-2" :class="{ 'animate-spin': loading }" />
          Refresh
        </Button>
      </div>
    </div>

    <!-- Table -->
    <div class="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-12">
              <div v-if="filteredCategories.length > 0">
                <Checkbox
                  :checked="isAllSelected"
                  @update:checked="toggleSelectAll"
                />
              </div>
            </TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Parent Category</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Items Count</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="loading">
            <TableCell colspan="9" class="text-center py-8">
              <div class="flex items-center justify-center space-x-2">
                <Loader2Icon class="h-4 w-4 animate-spin" />
                <span>Loading categories...</span>
              </div>
            </TableCell>
          </TableRow>
          <TableRow v-else-if="filteredCategories.length === 0">
            <TableCell colspan="9" class="text-center py-8 text-muted-foreground">
              <div class="flex flex-col items-center space-y-2">
                <FolderTreeIcon class="h-8 w-8 text-muted-foreground/50" />
                <span>No categories found</span>
                <span class="text-sm">Try adjusting your search criteria</span>
              </div>
            </TableCell>
          </TableRow>
          <TableRow 
            v-else
            v-for="category in filteredCategories" 
            :key="`${category.id}-${category.updatedAt || category.createdAt}`"
            class="hover:bg-muted/50 cursor-pointer"
            @click="handleRowClick(category)"
          >
            <TableCell @click.stop>
              <div v-if="category && category.id">
                <Checkbox
                  :checked="selectedCategories.includes(category.id)"
                  @update:checked="(checked) => toggleCategorySelection(category.id)"
                />
              </div>
            </TableCell>
            <TableCell class="font-mono text-sm">
              {{ category.code }}
            </TableCell>
            <TableCell>
              <div class="flex items-center space-x-2">
                <div :style="{ paddingLeft: `${(category.level || 0) * 20}px` }" class="flex items-center space-x-2">
                  <FolderIcon class="h-4 w-4 text-muted-foreground" />
                  <span class="font-medium">{{ category.name }}</span>
                </div>
              </div>
              <div v-if="category.description" class="text-sm text-muted-foreground mt-1">
                {{ category.description }}
              </div>
            </TableCell>
            <TableCell>
              <div v-if="category.parentCategory" class="flex items-center space-x-2">
                <FolderIcon class="h-3 w-3 text-muted-foreground" />
                <span class="text-sm">{{ category.parentCategory.name }}</span>
              </div>
              <span v-else class="text-sm text-muted-foreground">Root Category</span>
            </TableCell>
            <TableCell>
              <Badge variant="secondary" class="text-xs">
                Level {{ category.level || 0 }}
              </Badge>
            </TableCell>
            <TableCell>
              <div class="flex items-center space-x-1">
                <PackageIcon class="h-3 w-3 text-muted-foreground" />
                <span class="text-sm">{{ category.itemsCount || 0 }}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge :variant="category.isActive ? 'default' : 'secondary'">
                {{ category.isActive ? 'Active' : 'Inactive' }}
              </Badge>
            </TableCell>
            <TableCell class="text-sm text-muted-foreground">
              {{ formatDate(category.createdAt) }}
            </TableCell>
            <TableCell class="text-right" @click.stop>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontalIcon class="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="emit('view-category', category)">
                    <EyeIcon class="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="emit('edit-category', category)">
                    <EditIcon class="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="emit('duplicate-category', category)">
                    <CopyIcon class="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    v-if="!category.parentCategoryId"
                    @click="emit('view-subcategories', category)"
                  >
                    <FolderTreeIcon class="h-4 w-4 mr-2" />
                    View Subcategories
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    v-if="!category.parentCategoryId"
                    @click="emit('add-subcategory', category)"
                  >
                    <PlusIcon class="h-4 w-4 mr-2" />
                    Add Subcategory
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="emit('view-hierarchy', category)">
                    <NetworkIcon class="h-4 w-4 mr-2" />
                    View Hierarchy
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    v-if="category.isActive"
                    @click="emit('deactivate-category', category)"
                  >
                    <PauseIcon class="h-4 w-4 mr-2" />
                    Deactivate
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    v-else
                    @click="emit('activate-category', category)"
                  >
                    <PlayIcon class="h-4 w-4 mr-2" />
                    Activate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    @click="emit('delete-category', category)"
                    class="text-red-600 focus:text-red-600"
                  >
                    <TrashIcon class="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Pagination -->
    <div v-if="categories.length > 0 || pagination.totalElements > 0" class="flex items-center justify-between">
      <div class="text-sm text-muted-foreground">
        Showing {{ (pagination.page * pagination.size) + 1 }} to {{ Math.min((pagination.page + 1) * pagination.size, pagination.totalElements) }} of {{ pagination.totalElements }} categories
      </div>
      <div class="flex items-center space-x-6 lg:space-x-8">
        <div class="flex items-center space-x-2">
          <p class="text-sm font-medium">Rows per page</p>
          <Select
            :model-value="pagination.size.toString()"
            @update:model-value="(value) => emit('size-change', parseInt(value))"
          >
            <SelectTrigger class="h-8 w-[70px]">
              <SelectValue :placeholder="pagination.size.toString()" />
            </SelectTrigger>
            <SelectContent side="top">
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {{ pagination.page + 1 }} of {{ pagination.totalPages }}
        </div>
        <div class="flex items-center space-x-2">
          <Button
            variant="outline"
            class="hidden h-8 w-8 p-0 lg:flex"
            :disabled="pagination.page === 0"
            @click="emit('page-change', 0)"
          >
            <span class="sr-only">Go to first page</span>
            <ChevronsLeftIcon class="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            class="h-8 w-8 p-0"
            :disabled="pagination.page === 0"
            @click="emit('page-change', pagination.page - 1)"
          >
            <span class="sr-only">Go to previous page</span>
            <ChevronLeftIcon class="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            class="h-8 w-8 p-0"
            :disabled="pagination.page >= pagination.totalPages - 1"
            @click="emit('page-change', pagination.page + 1)"
          >
            <span class="sr-only">Go to next page</span>
            <ChevronRightIcon class="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            class="hidden h-8 w-8 p-0 lg:flex"
            :disabled="pagination.page >= pagination.totalPages - 1"
            @click="emit('page-change', pagination.totalPages - 1)"
          >
            <span class="sr-only">Go to last page</span>
            <ChevronsRightIcon class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import {
  SearchIcon, EditIcon, XIcon, RefreshCwIcon, Loader2Icon, FolderTreeIcon,
  FolderIcon, PackageIcon, MoreHorizontalIcon, EyeIcon, CopyIcon, NetworkIcon,
  PauseIcon, PlayIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon,
  ChevronsLeftIcon, ChevronsRightIcon, PlusIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

// Props
const props = defineProps({
  categories: {
    type: Array,
    default: () => []
  },
  rootCategories: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  pagination: {
    type: Object,
    default: () => ({
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0
    })
  }
})

// Emits
const emit = defineEmits([
  'view-category',
  'edit-category',
  'duplicate-category',
  'delete-category',
  'activate-category',
  'deactivate-category',
  'view-hierarchy',
  'view-subcategories',
  'add-subcategory',
  'refresh',
  'bulk-edit',
  'page-change',
  'size-change'
])

// State
const searchTerm = ref('')
const parentFilter = ref('all')
const statusFilter = ref('all')
const selectedCategories = ref([])

// Computed
const filteredCategories = computed(() => {
  return props.categories.filter(category => category && category.id)
})

const isAllSelected = computed(() => {
  if (filteredCategories.value.length === 0) return false
  return filteredCategories.value.every(category => 
    category.id && selectedCategories.value.includes(category.id)
  )
})

// Methods
const toggleSelectAll = (checked) => {
  try {
    if (checked) {
      selectedCategories.value = filteredCategories.value
        .filter(category => category.id)
        .map(category => category.id)
    } else {
      selectedCategories.value = []
    }
  } catch (error) {
    console.warn('Error toggling select all:', error)
    selectedCategories.value = []
  }
}

const toggleCategorySelection = (categoryId) => {
  if (!categoryId) return 
  
  try {
    const index = selectedCategories.value.indexOf(categoryId)
    if (index > -1) {
      selectedCategories.value.splice(index, 1)
    } else {
      selectedCategories.value.push(categoryId)
    }
  } catch (error) {
    console.warn('Error toggling category selection:', error)
    // Reset selection on error
    selectedCategories.value = []
  }
}

const handleRowClick = (category) => {
  // Default action - view details
  // Could be customized to edit instead
}

const handleBulkEdit = () => {
  const selectedCategoriesData = props.categories.filter(category => 
    category.id && selectedCategories.value.includes(category.id)
  )
  if (selectedCategoriesData.length > 0) {
    emit('bulk-edit', selectedCategoriesData)
  }
}

const clearFilters = () => {
  searchTerm.value = ''
  parentFilter.value = 'all'
  statusFilter.value = 'all'
  selectedCategories.value = []
  emit('refresh')
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString()
}


const handleFilterChange = () => {
  selectedCategories.value = []
  clearTimeout(filterTimeout.value)
  filterTimeout.value = setTimeout(() => {
    emit('refresh')
  }, 300)
}

// Debounce timeout
const filterTimeout = ref(null)


watch([searchTerm, parentFilter, statusFilter], () => {
  handleFilterChange()
})

watch(() => props.categories, (newCategories, oldCategories) => {

  if (oldCategories && oldCategories.length > 0) {
    selectedCategories.value = []
  }
}, { flush: 'sync' })

// Cleanup on unmount
onBeforeUnmount(() => {
  if (filterTimeout.value) {
    clearTimeout(filterTimeout.value)
  }
  selectedCategories.value = []
})
</script>
