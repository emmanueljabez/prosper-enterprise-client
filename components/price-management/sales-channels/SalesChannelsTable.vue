<template>
  <div class="space-y-4">
    <!-- Filters -->
    <div class="flex flex-col space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex-1 space-y-1">
          <h3 class="text-xl font-semibold tracking-tight">Sales Channels</h3>
          <p class="text-sm text-muted-foreground">
            {{ filteredChannels.length }} channels found
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

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="space-y-2">
          <Label for="search">Search</Label>
          <Input
            id="search"
            v-model="filters.search"
            placeholder="Search by name or description..."
          />
        </div>
        <div class="space-y-2">
          <Label for="statusFilter">Status</Label>
          <Select v-model="filters.status">
            <SelectTrigger id="statusFilter">
              <SelectValue :placeholder="getStatusLabel(filters.status)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-2">
          <Label for="typeFilter">Channel Type</Label>
          <Select v-model="filters.type">
            <SelectTrigger id="typeFilter">
              <SelectValue :placeholder="getTypeLabel(filters.type)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="online_store">Online Store</SelectItem>
              <SelectItem value="marketplace">Marketplace</SelectItem>
              <SelectItem value="retail_store">Retail Store</SelectItem>
              <SelectItem value="wholesale">Wholesale</SelectItem>
              <SelectItem value="dropshipping">Dropshipping</SelectItem>
              <SelectItem value="direct_sales">Direct Sales</SelectItem>
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
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('name')"
              >
                Channel Name 
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
            <TableHead>Type</TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('pricingStrategy')"
              >
                Pricing Strategy 
                <ArrowUpIcon
                  v-if="sortConfig.key === 'pricingStrategy' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'pricingStrategy' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('markupPercentage')"
              >
                Markup 
                <ArrowUpIcon
                  v-if="sortConfig.key === 'markupPercentage' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'markupPercentage' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Currency</TableHead>
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
              <div class="mt-2 text-sm text-muted-foreground">Loading sales channels...</div>
            </TableCell>
          </TableRow>
          <TableRow v-else-if="paginatedChannels.length === 0" class="h-24">
            <TableCell colSpan="8" class="text-center">
              <div class="flex flex-col items-center justify-center">
                <ShoppingBagIcon class="h-10 w-10 text-muted-foreground" />
                <div class="mt-2">No sales channels found</div>
                <div class="mt-1 text-sm text-muted-foreground">
                  Try adjusting your filters or add a new sales channel
                </div>
              </div>
            </TableCell>
          </TableRow>
          <TableRow v-for="channel in paginatedChannels" :key="channel.id">
            <TableCell class="min-w-[200px]">
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-full bg-primary/10">
                  <ShoppingBagIcon class="h-5 w-5 text-primary" v-if="channel.type === 'online_store'" />
                  <StoreIcon class="h-5 w-5 text-primary" v-else-if="channel.type === 'retail_store'" />
                  <ShoppingCartIcon class="h-5 w-5 text-primary" v-else-if="channel.type === 'marketplace'" />
                  <PackageIcon class="h-5 w-5 text-primary" v-else-if="channel.type === 'dropshipping'" />
                  <Users2Icon class="h-5 w-5 text-primary" v-else-if="channel.type === 'wholesale'" />
                  <PhoneIcon class="h-5 w-5 text-primary" v-else-if="channel.type === 'direct_sales'" />
                  <GlobeIcon class="h-5 w-5 text-primary" v-else />
                </div>
                <div>
                  <div class="font-medium">{{ channel.name }}</div>
                  <div v-if="channel.description" class="text-xs text-muted-foreground line-clamp-1">
                    {{ channel.description }}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">
                {{ formatChannelType(channel.type) }}
              </Badge>
            </TableCell>
            <TableCell>
              {{ formatPricingStrategy(channel.pricingStrategy) }}
            </TableCell>
            <TableCell>
              {{ channel.markupPercentage || 0 }}%
            </TableCell>
            <TableCell>
              <Badge :variant="channel.isActive ? 'success' : 'secondary'">
                {{ channel.isActive ? 'Active' : 'Inactive' }}
              </Badge>
            </TableCell>
            <TableCell>
              {{ channel.currency || 'USD' }}
            </TableCell>
            <TableCell>{{ formatDate(channel.updatedAt) }}</TableCell>
            <TableCell class="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontalIcon class="h-4 w-4" />
                    <span class="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="viewChannelDetails(channel)">
                    <EyeIcon class="mr-2 h-4 w-4" />
                    <span>View Details</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="editChannel(channel)">
                    <PencilIcon class="mr-2 h-4 w-4" />
                    <span>Edit Channel</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="editPricing(channel)">
                    <SettingsIcon class="mr-2 h-4 w-4" />
                    <span>Edit Pricing</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="toggleStatus(channel)">
                    <TagIcon class="mr-2 h-4 w-4" />
                    <span>{{ channel.isActive ? 'Deactivate' : 'Activate' }}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="deleteChannel(channel)" class="text-destructive focus:text-destructive">
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
        {{ Math.min(pagination.pageSize * pagination.page, filteredChannels.length) }}
        of {{ filteredChannels.length }} entries
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
import { format } from 'date-fns'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  EyeIcon,
  GlobeIcon,
  Loader2Icon,
  MoreHorizontalIcon,
  PackageIcon,
  PencilIcon,
  PhoneIcon,
  RefreshCwIcon,
  SettingsIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  StoreIcon,
  TagIcon,
  Trash2Icon,
  Users2Icon,
  XIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
  salesChannels: {
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
  'view-channel',
  'edit-channel',
  'delete-channel',
  'edit-pricing',
  'refresh'
])

// Filters
const filters = ref({
  search: '',
  status: 'all',
  type: 'all'
})

// Pagination
const pagination = ref({
  page: 1,
  pageSize: 10
})

// Sorting
const sortConfig = ref({
  key: 'updatedAt',
  direction: 'desc'
})

// Computed properties
const filteredChannels = computed(() => {
  let result = [...props.salesChannels]

  // Search filter
  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase()
    result = result.filter(channel =>
      channel.name.toLowerCase().includes(searchTerm) ||
      (channel.description && channel.description.toLowerCase().includes(searchTerm))
    )
  }

  // Status filter
  if (filters.value.status && filters.value.status !== 'all') {
    const isActive = filters.value.status === 'active'
    result = result.filter(channel => channel.isActive === isActive)
  }

  // Type filter
  if (filters.value.type && filters.value.type !== 'all') {
    result = result.filter(channel => channel.type === filters.value.type)
  }

  // Sorting
  result.sort((a, b) => {
    let aValue = a[sortConfig.value.key]
    let bValue = b[sortConfig.value.key]

    // Handle dates
    if (sortConfig.value.key === 'updatedAt' || sortConfig.value.key === 'createdAt') {
      aValue = new Date(aValue || 0).getTime()
      bValue = new Date(bValue || 0).getTime()
    }

    // Handle numbers
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.value.direction === 'asc'
        ? aValue - bValue
        : bValue - aValue
    }

    // Handle strings
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.value.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }

    // Fallback
    return sortConfig.value.direction === 'asc' ? -1 : 1
  })

  return result
})

const paginatedChannels = computed(() => {
  const startIndex = (pagination.value.page - 1) * pagination.value.pageSize
  const endIndex = startIndex + pagination.value.pageSize
  return filteredChannels.value.slice(startIndex, endIndex)
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredChannels.value.length / pagination.value.pageSize))
)

// Utility functions
function formatDate(dateString) {
  if (!dateString) return ''
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    return format(date, 'dd MMM yyyy')
  } catch (error) {
    console.error('Date formatting error:', error)
    return dateString
  }
}

function formatChannelType(type) {
  if (!type) return 'Unknown'
  
  const typeMap = {
    'online_store': 'Online Store',
    'marketplace': 'Marketplace',
    'retail_store': 'Retail Store',
    'wholesale': 'Wholesale',
    'dropshipping': 'Dropshipping',
    'direct_sales': 'Direct Sales'
  }
  
  return typeMap[type] || type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function formatPricingStrategy(strategy) {
  if (!strategy) return 'Standard'
  
  const strategyMap = {
    'standard': 'Standard',
    'marketplace': 'Marketplace',
    'b2b': 'B2B',
    'wholesale': 'Wholesale',
    'custom': 'Custom'
  }
  
  return strategyMap[strategy] || strategy.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function getStatusLabel(value) {
  if (!value || value === 'all') return 'All Statuses'
  return value === 'active' ? 'Active' : 'Inactive'
}

function getTypeLabel(value) {
  if (!value || value === 'all') return 'All Types'
  return formatChannelType(value)
}

// Action functions
function resetFilters() {
  filters.value = {
    search: '',
    status: 'all',
    type: 'all'
  }
}

function refreshData() {
  emit('refresh')
}

function sortBy(key) {
  if (sortConfig.value.key === key) {
    sortConfig.value.direction = sortConfig.value.direction === 'asc' ? 'desc' : 'asc'
  } else {
    sortConfig.value.key = key
    sortConfig.value.direction = 'asc'
  }
}

function viewChannelDetails(channel) {
  emit('view-channel', channel)
}

function editChannel(channel) {
  emit('edit-channel', channel)
}

function editPricing(channel) {
  emit('edit-pricing', channel)
}

function toggleStatus(channel) {
  // This would typically update the channel's status
  // For now, we'll just emit the edit event
  const updatedChannel = { ...channel, isActive: !channel.isActive }
  emit('edit-channel', updatedChannel)
}

function deleteChannel(channel) {
  emit('delete-channel', channel)
}

// Watch for filter changes to reset pagination
watch([filters], () => {
  pagination.value.page = 1
}, { deep: true })
</script>