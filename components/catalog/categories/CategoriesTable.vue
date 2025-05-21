<template>
  <div class="space-y-4">
    <!-- Filters -->
    <div class="flex flex-col space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex-1 space-y-1">
          <h3 class="text-xl font-semibold tracking-tight">Categories</h3>
          <p class="text-sm text-muted-foreground">
            {{ filteredCategories.length }} categories found
          </p>
        </div>
        <div class="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            @click="$emit('refresh')" 
            :disabled="loading"
          >
            <RefreshCw v-if="!loading" class="h-4 w-4 mr-2" />
            <Loader2 v-else class="h-4 w-4 mr-2 animate-spin" />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            @click="resetFilters"
          >
            <X class="h-4 w-4 mr-2" />
            Reset Filters
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            @click="$emit('bulk-edit', selectedCategories)" 
            :disabled="selectedCategories.length === 0"
          >
            <Pencil class="h-4 w-4 mr-2" />
            Bulk Edit
          </Button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="space-y-2">
          <Label for="search">Search</Label>
          <Input
            id="search"
            v-model="filter"
            placeholder="Search by name or description..."
          />
        </div>
        <div class="space-y-2">
          <Label for="statusFilter">Status</Label>
          <Select v-model="statusFilter">
            <SelectTrigger id="statusFilter">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="archived">Archived Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-2">
          <Label for="sortBy">Sort By</Label>
          <Select v-model="sortBy">
            <SelectTrigger id="sortBy">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="createdAt">Date Created</SelectItem>
              <SelectItem value="updatedAt">Last Updated</SelectItem>
              <SelectItem value="productCount">Product Count</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>

    <!-- Categories Table -->
    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-[50px]">
              <Checkbox 
                :checked="isAllSelected" 
                :indeterminate="selectedCategories.length > 0 && !isAllSelected"
                @update:checked="toggleAll" 
              />
            </TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="updateSort('name')"
              >
                Name 
                <ArrowUp
                  v-if="sortBy === 'name' && sortDirection === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDown
                  v-if="sortBy === 'name' && sortDirection === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Parent</TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="updateSort('productCount')"
              >
                Products 
                <ArrowUp
                  v-if="sortBy === 'productCount' && sortDirection === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDown
                  v-if="sortBy === 'productCount' && sortDirection === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody v-if="loading">
          <TableRow v-for="i in 5" :key="i" class="h-16">
            <TableCell v-for="j in 7" :key="j">
              <Skeleton class="h-4 w-full" />
            </TableCell>
          </TableRow>
        </TableBody>
        <TableBody v-else-if="filteredCategories.length === 0">
          <TableRow class="h-24">
            <TableCell colSpan="7" class="text-center">
              <div class="flex flex-col items-center justify-center">
                <FolderOpenIcon class="h-10 w-10 text-muted-foreground mb-2" />
                <div class="text-lg font-medium">No categories found</div>
                <div class="text-sm text-muted-foreground mt-1">
                  {{ filter ? 'Try adjusting your search or filters' : 'Get started by creating a new category' }}
                </div>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
        <TableBody v-else>
          <TableRow 
            v-for="category in paginatedCategories" 
            :key="category.id"
            :class="{ 'opacity-60': category.status === 'archived' }"
          >
            <TableCell>
              <Checkbox 
                :checked="isSelected(category)" 
                @update:checked="(checked) => toggleSelectCategory(category, checked)" 
              />
            </TableCell>
            <TableCell class="font-medium min-w-[200px]">
              <div class="flex items-center gap-2">
                <FolderIcon v-if="!category.parentId" class="h-4 w-4 text-primary" />
                <FolderTreeIcon v-else class="h-4 w-4 text-muted-foreground" />
                <span>{{ category.name }}</span>
              </div>
            </TableCell>
            <TableCell>
              <span class="line-clamp-1">{{ category.description || '—' }}</span>
            </TableCell>
            <TableCell>
              <Badge v-if="category.parentId" variant="outline">
                {{ getCategoryName(category.parentId) }}
              </Badge>
              <span v-else>—</span>
            </TableCell>
            <TableCell>
              <Badge>{{ category.productCount || 0 }}</Badge>
            </TableCell>
            <TableCell>
              <Badge 
                :variant="getStatusVariant(category.status)" 
                class="capitalize"
              >
                {{ category.status || 'active' }}
              </Badge>
            </TableCell>
            <TableCell class="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal class="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="$emit('view-category', category)">
                    <Eye class="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="$emit('edit-category', category)">
                    <Pencil class="h-4 w-4 mr-2" />
                    Edit Category
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    @click="$emit('delete-category', category)"
                    class="text-destructive focus:text-destructive"
                  >
                    <Trash class="h-4 w-4 mr-2" />
                    Delete Category
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
    
    <!-- Pagination -->
    <div class="flex items-center justify-between">
      <div class="text-sm text-muted-foreground">
        Showing {{ itemsPerPage * (currentPage - 1) + 1 }} to
        {{ Math.min(itemsPerPage * currentPage, filteredCategories.length) }}
        of {{ filteredCategories.length }} categories
      </div>
      <div class="flex items-center space-x-2">
        <div class="flex items-center space-x-2">
          <p class="text-sm font-medium">Rows per page</p>
          <Select
            v-model="itemsPerPage"
            @update:modelValue="currentPage = 1"
          >
            <SelectTrigger class="h-8 w-[70px]">
              <SelectValue :placeholder="itemsPerPage" />
            </SelectTrigger>
            <SelectContent side="top">
              <SelectItem :value="10">10</SelectItem>
              <SelectItem :value="20">20</SelectItem>
              <SelectItem :value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          <ChevronLeft class="h-4 w-4 mr-1" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage >= totalPages"
          @click="currentPage++"
        >
          Next
          <ChevronRight class="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { 
  RefreshCw, 
  Pencil, 
  Eye, 
  Trash, 
  Filter, 
  ChevronDown, 
  FolderIcon,
  FolderTreeIcon,
  FolderOpenIcon,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  ArrowUp,
  ArrowDown
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const props = defineProps({
  categories: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  }
})

defineEmits(['view-category', 'edit-category', 'delete-category', 'refresh', 'bulk-edit'])

// Filter and sort state
const filter = ref('')
const statusFilter = ref('all')
const sortBy = ref('name')
const sortDirection = ref('asc')

// Selection state
const selectedCategories = ref([])

// Pagination state
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Reset pagination when filter changes
watch([filter, statusFilter], () => {
  currentPage.value = 1
})

// Reset selection when categories change
watch(() => props.categories, () => {
  selectedCategories.value = []
})

// Computed properties
const filteredCategories = computed(() => {
  let result = [...props.categories]
  
  // Apply filter
  if (filter.value) {
    const searchTerm = filter.value.toLowerCase()
    result = result.filter(category => 
      category.name.toLowerCase().includes(searchTerm) || 
      (category.description && category.description.toLowerCase().includes(searchTerm))
    )
  }
  
  // Show/hide archived
  if (statusFilter.value === 'active') {
    result = result.filter(category => category.status !== 'archived')
  } else if (statusFilter.value === 'archived') {
    result = result.filter(category => category.status === 'archived')
  }
  
  // Sort
  result.sort((a, b) => {
    let comparison = 0
    
    switch (sortBy.value) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'createdAt':
        comparison = new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        break
      case 'updatedAt':
        comparison = new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
        break
      case 'productCount':
        comparison = (b.productCount || 0) - (a.productCount || 0)
        break
      default:
        comparison = 0
    }
    
    return sortDirection.value === 'asc' ? -comparison : comparison
  })
  
  return result
})

const paginatedCategories = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredCategories.value.slice(start, end)
})

const totalPages = computed(() => 
  Math.ceil(filteredCategories.value.length / itemsPerPage.value)
)

const isAllSelected = computed(() => 
  filteredCategories.value.length > 0 && 
  selectedCategories.value.length === filteredCategories.value.length
)

// Utility functions
const getCategoryName = (id) => {
  const category = props.categories.find(c => c.id === id)
  return category ? category.name : 'Unknown'
}

const getStatusVariant = (status) => {
  switch (status) {
    case 'active': return 'success'
    case 'archived': return 'secondary'
    case 'draft': return 'outline'
    default: return 'default'
  }
}

const isSelected = (category) => 
  selectedCategories.value.some(c => c.id === category.id)

// Event handlers
const toggleSelectCategory = (category, checked) => {
  if (checked) {
    selectedCategories.value.push(category)
  } else {
    selectedCategories.value = selectedCategories.value.filter(c => c.id !== category.id)
  }
}

const toggleAll = (checked) => {
  selectedCategories.value = checked ? [...filteredCategories.value] : []
}

const updateSort = (column) => {
  if (sortBy.value === column) {
    // Toggle direction if same column
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    // Set new column and default to ascending
    sortBy.value = column
    sortDirection.value = 'asc'
  }
}

const resetFilters = () => {
  filter.value = ''
  statusFilter.value = 'all'
  sortBy.value = 'name'
  sortDirection.value = 'asc'
}
</script>