<template>
  <div class="space-y-4">
    <!-- Filters and Search -->
    <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div class="flex flex-col sm:flex-row gap-2 flex-1">
        <div class="relative flex-1 max-w-sm">
          <SearchIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            v-model="searchTerm"
            placeholder="Search units..."
            class="pl-10"
          />
        </div>
        <Select v-model="selectedCategory">
          <SelectTrigger class="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </SelectItem>
          </SelectContent>
        </Select>
        <Select v-model="statusFilter">
          <SelectTrigger class="w-[140px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select v-model="typeFilter">
          <SelectTrigger class="w-[140px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="base">Base Units</SelectItem>
            <SelectItem value="conversion">Conversion Units</SelectItem>
          </SelectContent>
        </Select>
      </div>      <div class="flex items-center gap-2">
        <Button 
          v-if="selectedUnits.length > 0"
          variant="outline" 
          size="sm" 
          @click="handleBulkEdit"
        >
          <EditIcon class="h-4 w-4 mr-2" />
          Bulk Edit ({{ selectedUnits.length }})
        </Button>
        <Button variant="outline" size="sm" @click="clearFilters">
          <XIcon class="h-4 w-4 mr-2" />
          Clear
        </Button>
        <Button variant="outline" size="sm" @click="$emit('refresh')" :disabled="loading">
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
              <Checkbox
                :checked="isAllSelected"
                @update:checked="toggleSelectAll"
              />
            </TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Base Unit</TableHead>
            <TableHead>Conversion Factor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="loading">
            <TableCell colspan="10" class="h-24">
              <div class="space-y-3">
                <div class="flex items-center space-x-4">
                  <Skeleton class="h-4 w-4" />
                  <Skeleton class="h-4 w-[80px]" />
                  <Skeleton class="h-4 w-[150px]" />
                  <Skeleton class="h-4 w-[100px]" />
                  <Skeleton class="h-4 w-[80px]" />
                  <Skeleton class="h-4 w-[100px]" />
                  <Skeleton class="h-4 w-[120px]" />
                  <Skeleton class="h-4 w-[80px]" />
                  <Skeleton class="h-4 w-[100px]" />
                  <Skeleton class="h-4 w-[80px]" />
                </div>
                <div class="flex items-center space-x-4">
                  <Skeleton class="h-4 w-4" />
                  <Skeleton class="h-4 w-[80px]" />
                  <Skeleton class="h-4 w-[150px]" />
                  <Skeleton class="h-4 w-[100px]" />
                  <Skeleton class="h-4 w-[80px]" />
                  <Skeleton class="h-4 w-[100px]" />
                  <Skeleton class="h-4 w-[120px]" />
                  <Skeleton class="h-4 w-[80px]" />
                  <Skeleton class="h-4 w-[100px]" />
                  <Skeleton class="h-4 w-[80px]" />
                </div>
                <div class="flex items-center space-x-4">
                  <Skeleton class="h-4 w-4" />
                  <Skeleton class="h-4 w-[80px]" />
                  <Skeleton class="h-4 w-[150px]" />
                  <Skeleton class="h-4 w-[100px]" />
                  <Skeleton class="h-4 w-[80px]" />
                  <Skeleton class="h-4 w-[100px]" />
                  <Skeleton class="h-4 w-[120px]" />
                  <Skeleton class="h-4 w-[80px]" />
                  <Skeleton class="h-4 w-[100px]" />
                  <Skeleton class="h-4 w-[80px]" />
                </div>
              </div>
            </TableCell>
          </TableRow>
          <TableRow v-else-if="filteredUnits.length === 0">
            <TableCell colspan="10" class="text-center py-8 text-muted-foreground">
              <div class="flex flex-col items-center space-y-2">
                <RulerIcon class="h-8 w-8 text-muted-foreground/50" />
                <span>No units found</span>
                <span class="text-sm">Try adjusting your search criteria</span>
              </div>
            </TableCell>
          </TableRow>
          <TableRow 
            v-else
            v-for="unit in paginatedUnits" 
            :key="unit.id"
            class="hover:bg-muted/50 cursor-pointer"
            @click="$emit('view-unit', unit)"
          >
            <TableCell @click.stop>
              <Checkbox
                :checked="selectedUnits.includes(unit.id)"
                @update:checked="toggleUnitSelection(unit.id)"
              />
            </TableCell>
            <TableCell class="font-mono font-medium">
              {{ unit.code }}
            </TableCell>
            <TableCell class="font-medium">
              {{ unit.name }}
            </TableCell>
            <TableCell>
              <Badge variant="outline">{{ unit.category }}</Badge>
            </TableCell>
            <TableCell>
              <Badge :variant="unit.baseUnit ? 'default' : 'secondary'">
                {{ unit.baseUnit ? 'Base' : 'Conversion' }}
              </Badge>
            </TableCell>
            <TableCell>
              <span v-if="unit.baseUnit" class="text-muted-foreground">-</span>
              <span v-else-if="unit.baseUnitOfMeasure" class="font-mono text-sm">
                {{ unit.baseUnitOfMeasure.code }}
              </span>
            </TableCell>
            <TableCell>
              <span v-if="unit.baseUnit" class="text-muted-foreground">1.0</span>
              <span v-else class="font-mono text-sm">{{ unit.conversionFactor }}</span>
            </TableCell>
            <TableCell>
              <Badge :variant="unit.isActive ? 'success' : 'secondary'">
                {{ unit.isActive ? 'Active' : 'Inactive' }}
              </Badge>
            </TableCell>
            <TableCell class="text-sm text-muted-foreground">
              {{ formatDate(unit.created) }}
            </TableCell>
            <TableCell class="text-right" @click.stop>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontalIcon class="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="$emit('view-unit', unit)">
                    <EyeIcon class="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="$emit('edit-unit', unit)">
                    <EditIcon class="h-4 w-4 mr-2" />
                    Edit Unit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    v-if="unit.baseUnit" 
                    @click="$emit('view-family', unit)"
                  >
                    <TreePineIcon class="h-4 w-4 mr-2" />
                    View Family
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="$emit('convert-units', unit)">
                    <ArrowRightLeftIcon class="h-4 w-4 mr-2" />
                    Convert Units
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="$emit('duplicate-unit', unit)">
                    <CopyIcon class="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    v-if="unit.isActive"
                    @click="$emit('deactivate-unit', unit)"
                  >
                    <PauseIcon class="h-4 w-4 mr-2" />
                    Deactivate
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    v-else
                    @click="$emit('activate-unit', unit)"
                  >
                    <PlayIcon class="h-4 w-4 mr-2" />
                    Activate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    @click="$emit('delete-unit', unit)"
                    class="text-destructive"
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
    </div>    <!-- Pagination -->
    <div class="flex items-center justify-between">      <div class="text-sm text-muted-foreground">
        {{ selectedUnits.length }} of {{ totalCount }} selected
      </div>
      
      <div class="flex items-center space-x-2">
        <span class="text-sm text-muted-foreground">
          Showing {{ Math.min((currentPage - 1) * pageSize + 1, totalCount) }} to 
          {{ Math.min(currentPage * pageSize, totalCount) }} of 
          {{ totalCount }} results
        </span>
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage <= 1"
          @click="handlePageChange(currentPage - 1)"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage >= totalPages"
          @click="handlePageChange(currentPage + 1)"
        >
          Next
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { 
  SearchIcon, RefreshCwIcon, XIcon, MoreHorizontalIcon, EyeIcon,
  EditIcon, TreePineIcon, ArrowRightLeftIcon, CopyIcon, PauseIcon,
  PlayIcon, TrashIcon, Loader2Icon, RulerIcon
} from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const props = defineProps({
  units: {
    type: Array,
    default: () => []
  },
  baseUnits: {
    type: Array,
    default: () => []
  },
  categories: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  // Backend pagination props
  totalCount: {
    type: Number,
    default: 0
  },
  page: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 10
  },
  useBackendPagination: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'view-unit',
  'edit-unit',
  'duplicate-unit',
  'delete-unit',
  'activate-unit',
  'deactivate-unit',
  'view-family',
  'convert-units',
  'refresh',
  'bulk-edit',
  'page-change',
  'page-size-change'
])

// State
const searchTerm = ref('')
const selectedCategory = ref('all')
const statusFilter = ref('all')
const typeFilter = ref('all')
const selectedUnits = ref([])
const currentPage = ref(props.page)
const pageSize = ref(props.pageSize)

// Computed
const filteredUnits = computed(() => {
  // If using backend pagination, return units as-is since filtering is done on server
  if (props.useBackendPagination) {
    return props.units
  }
  
  // Client-side filtering for backward compatibility
  let filtered = [...props.units]

  // Search filter
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter(unit => 
      unit.name.toLowerCase().includes(term) ||
      unit.code.toLowerCase().includes(term) ||
      (unit.description && unit.description.toLowerCase().includes(term))
    )
  }
  // Category filter
  if (selectedCategory.value && selectedCategory.value !== 'all') {
    filtered = filtered.filter(unit => unit.category === selectedCategory.value)
  }

  // Status filter
  if (statusFilter.value && statusFilter.value !== 'all') {
    const isActive = statusFilter.value === 'active'
    filtered = filtered.filter(unit => unit.isActive === isActive)
  }

  // Type filter
  if (typeFilter.value && typeFilter.value !== 'all') {
    const isBase = typeFilter.value === 'base'
    filtered = filtered.filter(unit => unit.baseUnit === isBase)
  }

  return filtered
})

const totalPages = computed(() => {
  if (props.useBackendPagination) {
    return Math.ceil(props.totalCount / pageSize.value)
  }
  return Math.ceil(filteredUnits.value.length / pageSize.value)
})

const paginatedUnits = computed(() => {
  // If using backend pagination, units are already paginated
  if (props.useBackendPagination) {
    return filteredUnits.value
  }
  
  // Client-side pagination
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredUnits.value.slice(start, end)
})

const totalCount = computed(() => {
  return props.useBackendPagination ? props.totalCount : filteredUnits.value.length
})

const isAllSelected = computed(() => {
  const visibleUnitIds = paginatedUnits.value.map(unit => unit.id)
  return visibleUnitIds.length > 0 && visibleUnitIds.every(id => selectedUnits.value.includes(id))
})

// Methods
const toggleSelectAll = (checked) => {
  const visibleUnitIds = paginatedUnits.value.map(unit => unit.id)
  
  if (checked) {
    // Add all visible unit IDs that aren't already selected
    visibleUnitIds.forEach(id => {
      if (!selectedUnits.value.includes(id)) {
        selectedUnits.value.push(id)
      }
    })
  } else {
    // Remove all visible unit IDs from selection
    selectedUnits.value = selectedUnits.value.filter(id => !visibleUnitIds.includes(id))
  }
}

const toggleUnitSelection = (unitId) => {
  const index = selectedUnits.value.indexOf(unitId)
  if (index > -1) {
    selectedUnits.value.splice(index, 1)
  } else {
    selectedUnits.value.push(unitId)
  }
}

const clearFilters = () => {
  searchTerm.value = ''
  selectedCategory.value = 'all'
  statusFilter.value = 'all'
  typeFilter.value = 'all'
  currentPage.value = 1
  
  if (props.useBackendPagination) {
    emit('page-change', 1)
  }
}

const handleBulkEdit = () => {
  const selectedUnitObjects = props.units.filter(unit => selectedUnits.value.includes(unit.id))
  emit('bulk-edit', selectedUnitObjects)
}

const handlePageChange = (newPage) => {
  currentPage.value = newPage
  if (props.useBackendPagination) {
    emit('page-change', newPage)
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString()
}

// Watch for filter changes to reset pagination
watch([searchTerm, selectedCategory, statusFilter, typeFilter], () => {
  currentPage.value = 1
  if (props.useBackendPagination) {
    emit('page-change', 1)
  }
})

// Watch for prop changes to update local state
watch(() => props.page, (newPage) => {
  currentPage.value = newPage
})

watch(() => props.pageSize, (newPageSize) => {
  pageSize.value = newPageSize
})
</script>
