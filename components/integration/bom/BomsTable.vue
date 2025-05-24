<template>
  <div class="space-y-4">
    <!-- Actions and Filters -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <!-- Search and Filter -->
      <div class="flex flex-1 items-center space-x-2">
        <div class="relative flex-1">
          <SearchIcon class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            v-model="filters.search"
            class="pl-8"
            placeholder="Search BOMs..."
            type="search"
          />
        </div>

        <Select v-model="filters.status">
          <SelectTrigger class="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- Bulk Actions -->
      <div class="flex items-center space-x-2">
        <Button
          v-if="selectedBoms.length > 0"
          variant="outline"
          size="sm"
          @click="$emit('bulk-delete', selectedBoms)"
        >
          Delete Selected
        </Button>
        <Button
          variant="outline"
          size="icon"
          @click="$emit('refresh')"
        >
          <RefreshCwIcon class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <!-- Table -->
    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-[50px]">
              <Checkbox 
                :checked="isAllSelected" 
                :indeterminate="isSomeSelected && !isAllSelected"
                @update:checked="toggleSelectAll"
              />
            </TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('name')"
              >
                BOM Name 
                <ArrowUpIcon
                  v-if="sortConfig.key === 'name' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'name' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Version</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('componentsCount')"
              >
                Components 
                <ArrowUpIcon
                  v-if="sortConfig.key === 'componentsCount' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'componentsCount' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('updatedAt')"
              >
                Updated 
                <ArrowUpIcon
                  v-if="sortConfig.key === 'updatedAt' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'updatedAt' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="loading" class="h-24">
            <TableCell colSpan="8" class="text-center">
              <Loader2Icon class="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
              <div class="mt-2 text-sm text-muted-foreground">Loading BOMs...</div>
            </TableCell>
          </TableRow>
          <TableRow v-else-if="paginatedBoms.length === 0" class="h-24">
            <TableCell colSpan="8" class="text-center">
              <div class="flex flex-col items-center justify-center">
                <LayersIcon class="h-10 w-10 text-muted-foreground" />
                <div class="mt-2">No BOMs found</div>
                <div class="mt-1 text-sm text-muted-foreground">
                  Try adjusting your filters or add a new BOM
                </div>
              </div>
            </TableCell>
          </TableRow>
          <TableRow v-for="bom in paginatedBoms" :key="bom.id">
            <TableCell>
              <Checkbox
                :checked="selectedBoms.includes(bom.id)"
                @update:checked="() => toggleBomSelection(bom.id)"
              />
            </TableCell>
            <TableCell class="font-medium">{{ bom.name }}</TableCell>
            <TableCell>
              <div class="flex items-center gap-2">
                <div class="h-8 w-8 rounded-md border bg-muted flex items-center justify-center overflow-hidden">
                  <PackageIcon class="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <div>{{ bom.productName }}</div>
                  <div class="text-xs text-muted-foreground">{{ bom.productSku }}</div>
                </div>
              </div>
            </TableCell>
            <TableCell>{{ bom.version }}</TableCell>
            <TableCell>
              <Badge :variant="getStatusVariant(bom.status)">
                {{ formatStatus(bom.status) }}
              </Badge>
            </TableCell>
            <TableCell>{{ bom.componentsCount || bom.components?.length || 0 }}</TableCell>
            <TableCell>{{ formatDate(bom.updatedAt) }}</TableCell>
            <TableCell class="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontalIcon class="h-4 w-4" />
                    <span class="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="$emit('view-bom', bom)">
                    <EyeIcon class="mr-2 h-4 w-4" />
                    <span>View Details</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="$emit('edit-bom', bom)">
                    <PencilIcon class="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="$emit('create-work-order', bom)">
                    <ClipboardPlusIcon class="mr-2 h-4 w-4" />
                    <span>Create Work Order</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="$emit('duplicate-bom', bom)">
                    <CopyIcon class="mr-2 h-4 w-4" />
                    <span>Duplicate</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="$emit('delete-bom', bom)" class="text-destructive focus:text-destructive">
                    <Trash2Icon class="mr-2 h-4 w-4" />
                    <span>Delete</span>
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
        Showing {{ pagination.pageSize * (pagination.page - 1) + 1 }} to
        {{ Math.min(pagination.pageSize * pagination.page, filteredBoms.length) }}
        of {{ filteredBoms.length }} entries
      </div>
      <div class="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="pagination.page <= 1"
          @click="pagination.page--"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="pagination.page >= totalPages"
          @click="pagination.page++"
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
  SearchIcon, 
  Loader2Icon, 
  LayersIcon, 
  RefreshCwIcon, 
  ArrowUpIcon, 
  ArrowDownIcon, 
  MoreHorizontalIcon,
  EyeIcon,
  PencilIcon,
  ClipboardPlusIcon,
  CopyIcon,
  Trash2Icon,
  PackageIcon
} from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

const props = defineProps({
  boms: {
    type: Array,
    required: true,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'refresh', 
  'view-bom', 
  'edit-bom', 
  'delete-bom', 
  'create-work-order', 
  'duplicate-bom', 
  'bulk-delete'
])

// State
const selectedBoms = ref([])
const filters = ref({
  search: '',
  status: 'all'
})
const pagination = ref({
  page: 1,
  pageSize: 10
})
const sortConfig = ref({
  key: 'updatedAt',
  direction: 'desc'
})

// Filter and sort boms
const filteredBoms = computed(() => {
  let result = [...(props.boms || [])]
  
  // Apply search filter
  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase()
    result = result.filter(bom => 
      bom.name?.toLowerCase().includes(searchTerm) ||
      bom.productName?.toLowerCase().includes(searchTerm) ||
      bom.productSku?.toLowerCase().includes(searchTerm) ||
      bom.description?.toLowerCase().includes(searchTerm)
    )
  }
  
  // Apply status filter
  if (filters.value.status !== 'all') {
    result = result.filter(bom => bom.status === filters.value.status)
  }
  
  // Apply sorting
  result.sort((a, b) => {
    let aValue = a[sortConfig.value.key]
    let bValue = b[sortConfig.value.key]
    
    // Handle nested properties like stock.available
    if (sortConfig.value.key.includes('.')) {
      const keys = sortConfig.value.key.split('.')
      aValue = keys.reduce((obj, key) => obj?.[key], a)
      bValue = keys.reduce((obj, key) => obj?.[key], b)
    }
    
    // Handle undefined or null values
    if (aValue === undefined || aValue === null) aValue = ''
    if (bValue === undefined || bValue === null) bValue = ''
    
    // String comparison
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }
    
    // Date comparison
    if (sortConfig.value.key === 'updatedAt' || sortConfig.value.key === 'createdAt') {
      return sortConfig.value.direction === 'asc' 
        ? new Date(aValue) - new Date(bValue) 
        : new Date(bValue) - new Date(aValue)
    }
    
    // Regular comparison
    if (sortConfig.value.direction === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })
  
  return result
})

// Paginate boms
const totalPages = computed(() => Math.ceil(filteredBoms.value.length / pagination.value.pageSize))
const paginatedBoms = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return filteredBoms.value.slice(start, end)
})

// Selection logic
const isAllSelected = computed(() => {
  return filteredBoms.value.length > 0 && selectedBoms.value.length === filteredBoms.value.length
})
const isSomeSelected = computed(() => {
  return selectedBoms.value.length > 0 && selectedBoms.value.length < filteredBoms.value.length
})

// Methods
const toggleBomSelection = (bomId) => {
  const index = selectedBoms.value.indexOf(bomId)
  if (index === -1) {
    selectedBoms.value.push(bomId)
  } else {
    selectedBoms.value.splice(index, 1)
  }
}

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedBoms.value = []
  } else {
    selectedBoms.value = filteredBoms.value.map(bom => bom.id)
  }
}

const sortBy = (key) => {
  if (sortConfig.value.key === key) {
    sortConfig.value.direction = sortConfig.value.direction === 'asc' ? 'desc' : 'asc'
  } else {
    sortConfig.value.key = key
    sortConfig.value.direction = 'asc'
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }).format(date)
}

const getStatusVariant = (status) => {
  switch (status) {
    case 'active': return 'success'
    case 'draft': return 'secondary'
    case 'archived': return 'outline'
    default: return 'default'
  }
}

const formatStatus = (status) => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

// Reset pagination when filters change
watch(filters, () => {
  pagination.value.page = 1
}, { deep: true })

// Reset selection when boms change
watch(() => props.boms, () => {
  selectedBoms.value = []
})
</script>