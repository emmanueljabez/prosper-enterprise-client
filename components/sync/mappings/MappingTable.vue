<template>
  <div class="space-y-4">
    <!-- Filters -->
    <div class="flex flex-col space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex-1 space-y-1">
          <h3 class="text-xl font-semibold tracking-tight">Mappings</h3>
          <p class="text-sm text-muted-foreground">
            {{ filteredMappings.length }} mappings found
          </p>
        </div>
        <div class="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            @click="refreshData" 
            :disabled="loading"
          >
            <RefreshCwIcon v-if="!loading" class="h-4 w-4 mr-2" />
            <Loader2Icon v-else class="h-4 w-4 mr-2 animate-spin" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" @click="resetFilters">
            <XIcon class="h-4 w-4 mr-2" />
            Reset Filters
          </Button>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <Input
            v-model="filters.search"
            placeholder="Search by name, SKU..."
          />
        </div>
        <div>
          <Select v-model="filters.syncStatus">
            <SelectTrigger>
              <SelectValue placeholder="Sync Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="synced">Synced</SelectItem>
              <SelectItem value="out_of_sync">Out of Sync</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select v-model="filters.mappingType">
            <SelectTrigger>
              <SelectValue placeholder="Mapping Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="automatic">Automatic</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select v-model="filters.syncOption">
            <SelectTrigger>
              <SelectValue placeholder="Sync Options" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Options</SelectItem>
              <SelectItem value="inventory">Syncs Inventory</SelectItem>
              <SelectItem value="pricing">Syncs Pricing</SelectItem>
              <SelectItem value="metadata">Syncs Metadata</SelectItem>
              <SelectItem value="bidirectional">Bidirectional</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
                @click="sortBy('itemName')"
              >
                Item 
                <ArrowUpIcon
                  v-if="sortConfig.key === 'itemName' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'itemName' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>Item SKU</TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('productName')"
              >
                Product 
                <ArrowUpIcon
                  v-if="sortConfig.key === 'productName' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'productName' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>Product SKU</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('syncStatus')"
              >
                Sync Status 
                <ArrowUpIcon
                  v-if="sortConfig.key === 'syncStatus' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'syncStatus' && sortConfig.direction === 'desc'"
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
            <TableCell colSpan="9" class="text-center">
              <Loader2Icon class="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
              <div class="mt-2 text-sm text-muted-foreground">Loading mappings...</div>
            </TableCell>
          </TableRow>
          <TableRow v-else-if="paginatedMappings.length === 0" class="h-24">
            <TableCell colSpan="9" class="text-center">
              <div class="flex flex-col items-center justify-center">
                <SearchXIcon class="h-10 w-10 text-muted-foreground" />
                <div class="mt-2">No mappings found</div>
                <div class="mt-1 text-sm text-muted-foreground">
                  Try adjusting your filters or create a new mapping
                </div>
              </div>
            </TableCell>
          </TableRow>
          <TableRow v-for="mapping in paginatedMappings" :key="mapping.id">
            <TableCell>
              <Checkbox
                :checked="selectedMappings.includes(mapping.id)"
                @update:checked="toggleMappingSelection(mapping.id)"
              />
            </TableCell>
            <TableCell>
              <div class="font-medium">{{ mapping.itemName }}</div>
              <div class="text-xs text-muted-foreground truncate max-w-[200px]">
                {{ mapping.itemDescription }}
              </div>
            </TableCell>
            <TableCell>{{ mapping.itemSku }}</TableCell>
            <TableCell>
              <div class="font-medium">{{ mapping.productName }}</div>
              <div class="text-xs text-muted-foreground truncate max-w-[200px]">
                {{ mapping.productDescription }}
              </div>
            </TableCell>
            <TableCell>{{ mapping.productSku }}</TableCell>
            <TableCell>
              <Badge :variant="mapping.mappingType === 'manual' ? 'outline' : 'secondary'">
                {{ formatMappingType(mapping.mappingType) }}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge :variant="getSyncStatusVariant(mapping.syncStatus)">
                {{ formatSyncStatus(mapping.syncStatus) }}
              </Badge>
            </TableCell>
            <TableCell>{{ formatDate(mapping.updatedAt) }}</TableCell>
            <TableCell class="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontalIcon class="h-4 w-4" />
                    <span class="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="viewMappingDetails(mapping)">
                    <EyeIcon class="mr-2 h-4 w-4" />
                    <span>View Details</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="editMapping(mapping)">
                    <PencilIcon class="mr-2 h-4 w-4" />
                    <span>Edit Mapping</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="syncMapping(mapping)">
                    <RefreshCwIcon class="mr-2 h-4 w-4" />
                    <span>Sync Now</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="deleteMapping(mapping)" class="text-destructive focus:text-destructive">
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
        {{ Math.min(pagination.pageSize * pagination.page, filteredMappings.length) }}
        of {{ filteredMappings.length }} entries
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

    <!-- Bulk Actions -->
    <div v-if="selectedMappings.length > 0" class="pt-2">
      <div class="flex items-center space-x-2">
        <Button size="sm" variant="outline" @click="bulkSync">
          <RefreshCwIcon class="h-4 w-4 mr-2" />
          Sync Selected ({{ selectedMappings.length }})
        </Button>
        <Button size="sm" variant="outline" @click="bulkEdit">
          <EditIcon class="h-4 w-4 mr-2" />
          Edit Selected ({{ selectedMappings.length }})
        </Button>
        <Button size="sm" variant="outline" class="text-destructive hover:bg-destructive/10" @click="bulkDelete">
          <Trash2Icon class="h-4 w-4 mr-2" />
          Delete Selected ({{ selectedMappings.length }})
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { format } from 'date-fns'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  EditIcon,
  EyeIcon,
  LinkIcon,
  SearchXIcon,
  Loader2Icon,
  MoreHorizontalIcon,
  PencilIcon,
  RefreshCwIcon,
  Trash2Icon,
  XIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

const props = defineProps({
  mappings: {
    type: Array,
    required: true
  },
  items: {
    type: Array,
    default: () => []
  },
  products: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'view-mapping',
  'edit-mapping',
  'delete-mapping',
  'sync-mapping',
  'bulk-edit',
  'refresh'
])

// State
const selectedMappings = ref([])
const sortConfig = ref({
  key: 'updatedAt',
  direction: 'desc'
})
const filters = ref({
  search: '',
  syncStatus: 'all',
  mappingType: 'all',
  syncOption: 'all'
})
const pagination = ref({
  page: 1,
  pageSize: 10
})

// Computed properties
const filteredMappings = computed(() => {
  let filtered = [...props.mappings]
  
  // Apply search filter
  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase()
    filtered = filtered.filter(mapping => 
      mapping.itemName?.toLowerCase().includes(searchTerm) ||
      mapping.itemSku?.toLowerCase().includes(searchTerm) ||
      mapping.productName?.toLowerCase().includes(searchTerm) ||
      mapping.productSku?.toLowerCase().includes(searchTerm)
    )
  }
  
  // Apply sync status filter
  if (filters.value.syncStatus !== 'all') {
    filtered = filtered.filter(mapping => 
      mapping.syncStatus === filters.value.syncStatus
    )
  }
  
  // Apply mapping type filter
  if (filters.value.mappingType !== 'all') {
    filtered = filtered.filter(mapping => 
      mapping.mappingType === filters.value.mappingType
    )
  }
  
  // Apply sync option filter
  if (filters.value.syncOption !== 'all') {
    filtered = filtered.filter(mapping => {
      if (filters.value.syncOption === 'inventory') return mapping.syncOptions.inventory
      if (filters.value.syncOption === 'pricing') return mapping.syncOptions.pricing
      if (filters.value.syncOption === 'metadata') return mapping.syncOptions.metadata
      if (filters.value.syncOption === 'bidirectional') return mapping.syncOptions.bidirectional
      return true
    })
  }
  
  // Apply sorting
  return filtered.sort((a, b) => {
    let valueA = a[sortConfig.value.key]
    let valueB = b[sortConfig.value.key]
    
    // Handle dates
    if (sortConfig.value.key === 'updatedAt' || sortConfig.value.key === 'createdAt') {
      valueA = new Date(valueA).getTime()
      valueB = new Date(valueB).getTime()
    }
    
    if (sortConfig.value.direction === 'asc') {
      return valueA > valueB ? 1 : -1
    } else {
      return valueA < valueB ? 1 : -1
    }
  })
})

const paginatedMappings = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return filteredMappings.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredMappings.value.length / pagination.value.pageSize)
})

const isAllSelected = computed(() => {
  return (
    paginatedMappings.value.length > 0 &&
    paginatedMappings.value.every(mapping => selectedMappings.value.includes(mapping.id))
  )
})

const isSomeSelected = computed(() => {
  return (
    selectedMappings.value.length > 0 &&
    !isAllSelected.value
  )
})

// Methods
function refreshData() {
  emit('refresh')
}

function resetFilters() {
  filters.value = {
    search: '',
    syncStatus: 'all',
    mappingType: 'all',
    syncOption: 'all'
  }
  pagination.value.page = 1
}

function toggleSelectAll(checked) {
  if (checked) {
    selectedMappings.value = paginatedMappings.value.map(mapping => mapping.id)
  } else {
    selectedMappings.value = []
  }
}

function toggleMappingSelection(id) {
  const index = selectedMappings.value.indexOf(id)
  if (index === -1) {
    selectedMappings.value.push(id)
  } else {
    selectedMappings.value.splice(index, 1)
  }
}

function sortBy(key) {
  if (sortConfig.value.key === key) {
    sortConfig.value.direction = sortConfig.value.direction === 'asc' ? 'desc' : 'asc'
  } else {
    sortConfig.value.key = key
    sortConfig.value.direction = 'asc'
  }
}

function viewMappingDetails(mapping) {
  emit('view-mapping', mapping)
}

function editMapping(mapping) {
  emit('edit-mapping', mapping)
}

function deleteMapping(mapping) {
  emit('delete-mapping', mapping)
}

function syncMapping(mapping) {
  emit('sync-mapping', mapping)
}

function bulkSync() {
  const selectedMappingObjects = props.mappings.filter(mapping => 
    selectedMappings.value.includes(mapping.id)
  )
  
  // Create a promise chain to sync all selected mappings
  selectedMappingObjects.forEach(mapping => {
    emit('sync-mapping', mapping)
  })
}

function bulkEdit() {
  const selectedMappingObjects = props.mappings.filter(mapping => 
    selectedMappings.value.includes(mapping.id)
  )
  emit('bulk-edit', selectedMappingObjects)
}

function bulkDelete() {
  const selectedMappingObjects = props.mappings.filter(mapping => 
    selectedMappings.value.includes(mapping.id)
  )
  
  // Loop through and delete each mapping
  selectedMappingObjects.forEach(mapping => {
    emit('delete-mapping', mapping)
  })
}

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  try {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a')
  } catch (e) {
    return dateString
  }
}

function formatMappingType(type) {
  if (type === 'manual') return 'Manual'
  if (type === 'automatic') return 'Auto'
  return type
}

function formatSyncStatus(status) {
  const statusMap = {
    'synced': 'Synced',
    'out_of_sync': 'Out of Sync',
    'pending': 'Pending',
    'error': 'Error'
  }
  return statusMap[status] || status
}

function getSyncStatusVariant(status) {
  const variantMap = {
    'synced': 'success',
    'out_of_sync': 'warning',
    'pending': 'secondary',
    'error': 'destructive'
  }
  return variantMap[status] || 'outline'
}

// Watch for filter changes to reset pagination
watch([filters], () => {
  pagination.value.page = 1
}, { deep: true })
</script>