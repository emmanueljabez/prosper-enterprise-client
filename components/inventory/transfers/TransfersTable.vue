<template>
  <div class="space-y-4">
    <!-- Table -->
    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('referenceNumber')"
              >
                Reference 
                <ArrowUpIcon
                  v-if="sortConfig.key === 'referenceNumber' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'referenceNumber' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('type')"
              >
                Type 
                <ArrowUpIcon
                  v-if="sortConfig.key === 'type' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'type' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('createdAt')"
              >
                Created Date 
                <ArrowUpIcon
                  v-if="sortConfig.key === 'createdAt' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'createdAt' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>Locations</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('totalValue')"
              >
                Value 
                <ArrowUpIcon
                  v-if="sortConfig.key === 'totalValue' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'totalValue' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('status')"
              >
                Status 
                <ArrowUpIcon
                  v-if="sortConfig.key === 'status' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'status' && sortConfig.direction === 'desc'"
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
              <div class="mt-2 text-sm text-muted-foreground">Loading transfers...</div>
            </TableCell>
          </TableRow>
          <TableRow v-else-if="paginatedTransfers.length === 0" class="h-24">
            <TableCell colSpan="8" class="text-center">
              <div class="flex flex-col items-center justify-center">
                <FileTextIcon class="h-10 w-10 text-muted-foreground" />
                <div class="mt-2">No transfers found</div>
                <div class="mt-1 text-sm text-muted-foreground">
                  Try adjusting your filters or create a new transfer
                </div>
              </div>
            </TableCell>
          </TableRow>
          <TableRow 
            v-for="transfer in paginatedTransfers" 
            :key="transfer.id"
            :class="{ 'bg-muted/40': transfer.status === 'cancelled' }"
          >
            <TableCell>
              <div class="font-medium">{{ transfer.referenceNumber }}</div>
              <div class="text-xs text-muted-foreground" v-if="transfer.externalReference">
                Ref: {{ transfer.externalReference }}
              </div>
            </TableCell>
            <TableCell>
              <Badge :variant="getTypeVariant(transfer.type)">
                {{ formatTransferType(transfer.type) }}
              </Badge>
            </TableCell>
            <TableCell>
              <div>{{ formatDateShort(transfer.createdAt) }}</div>
              <div class="text-xs text-muted-foreground">
                {{ formatTime(transfer.createdAt) }}
              </div>
            </TableCell>
            <TableCell>
              <div class="flex items-center gap-2">
                <ArrowRightIcon class="h-4 w-4 text-muted-foreground" />
                <div>
                  <div class="text-sm">From: {{ getLocationName(transfer.fromLocationId) }}</div>
                  <div class="text-sm">To: {{ getLocationName(transfer.toLocationId) }}</div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{{ transfer.items.length }} {{ transfer.items.length === 1 ? 'item' : 'items' }}</Badge>
            </TableCell>
            <TableCell>{{ formatCurrency(transfer.totalValue) }}</TableCell>
            <TableCell>
              <Badge :variant="getStatusVariant(transfer.status)">
                {{ formatStatus(transfer.status) }}
              </Badge>
            </TableCell>
            <TableCell class="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontalIcon class="h-4 w-4" />
                    <span class="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="viewTransferDetails(transfer)">
                    <EyeIcon class="mr-2 h-4 w-4" />
                    <span>View Details</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="printTransferDoc(transfer)">
                    <PrinterIcon class="mr-2 h-4 w-4" />
                    <span>Print Document</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator v-if="canApprove(transfer) || canReceive(transfer) || canCancel(transfer)" />
                  
                  <DropdownMenuItem 
                    v-if="canApprove(transfer)"
                    @click="approveTransfer(transfer)"
                  >
                    <CheckIcon class="mr-2 h-4 w-4" />
                    <span>Approve Transfer</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    v-if="canReceive(transfer)"
                    @click="receiveTransfer(transfer)"
                  >
                    <CheckSquareIcon class="mr-2 h-4 w-4" />
                    <span>Receive Transfer</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    v-if="canCancel(transfer)"
                    @click="cancelTransfer(transfer)"
                    class="text-destructive focus:text-destructive"
                  >
                    <XIcon class="mr-2 h-4 w-4" />
                    <span>Cancel Transfer</span>
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
        {{ Math.min(pagination.pageSize * pagination.page, filteredTransfers.length) }}
        of {{ filteredTransfers.length }} entries
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
  ArrowRightIcon,
  ArrowUpIcon,
  CheckIcon,
  CheckSquareIcon,
  EyeIcon,
  FileTextIcon,
  Loader2Icon,
  MoreHorizontalIcon,
  PrinterIcon,
  XIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

const props = defineProps({
  transfers: { type: Array, required: true },
  locations: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits([
  'view-transfer', 
  'approve-transfer', 
  'receive-transfer', 
  'cancel-transfer', 
  'print-transfer',
  'refresh'
])

// Local state
const sortConfig = ref({
  key: 'createdAt',
  direction: 'desc'
})

const pagination = ref({
  page: 1,
  pageSize: 10
})

// Search and filtering
const searchQuery = ref('')
const statusFilter = ref('all')

// Computed properties
// Location display mapping
const locationsMap = computed(() => {
  const map = {}
  props.locations.forEach(loc => {
    map[loc.id] = loc
  })
  return map
})

// Sort and filter transfers
const filteredTransfers = computed(() => {
  let result = [...props.transfers]
  
  // Apply search filter if needed
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(transfer => 
      transfer.referenceNumber?.toLowerCase().includes(query) ||
      transfer.notes?.toLowerCase().includes(query) ||
      transfer.externalReference?.toLowerCase().includes(query)
    )
  }
  
  // Apply status filter if needed
  if (statusFilter.value !== 'all') {
    result = result.filter(transfer => transfer.status === statusFilter.value)
  }

  // Apply sorting
  result.sort((a, b) => {
    let valueA = a[sortConfig.value.key]
    let valueB = b[sortConfig.value.key]
    
    // Handle special cases for sorting
    if (sortConfig.value.key === 'createdAt' || sortConfig.value.key === 'updatedAt') {
      valueA = new Date(valueA)
      valueB = new Date(valueB)
    } else if (typeof valueA === 'string') {
      valueA = valueA.toLowerCase()
      valueB = valueB?.toLowerCase()
    }
    
    if (valueA === valueB) return 0
    
    // For descending order, swap the comparison
    const comparison = valueA > valueB ? 1 : -1
    return sortConfig.value.direction === 'desc' ? comparison * -1 : comparison
  })
  
  return result
})

const paginatedTransfers = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return filteredTransfers.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredTransfers.value.length / pagination.value.pageSize)
})

// Reset pagination when filters change
watch([searchQuery, statusFilter, props.transfers], () => {
  pagination.value.page = 1
})

// Helper functions
const sortBy = (key) => {
  if (sortConfig.value.key === key) {
    // Toggle direction if already sorting by this key
    sortConfig.value.direction = sortConfig.value.direction === 'asc' ? 'desc' : 'asc'
  } else {
    // Default to ascending for new sort key
    sortConfig.value.key = key
    sortConfig.value.direction = 'asc'
  }
}

const formatDateShort = (date) => {
  if (!date) return '—'
  return format(new Date(date), 'yyyy-MM-dd')
}

const formatTime = (date) => {
  if (!date) return ''
  return format(new Date(date), 'HH:mm')
}

const formatTransferType = (type) => {
  switch (type) {
    case 'standard': return 'Standard'
    case 'return': return 'Return'
    case 'adjustment': return 'Adjustment'
    case 'bulk': return 'Bulk'
    default: return type
  }
}

const formatStatus = (status) => {
  switch (status) {
    case 'pending': return 'Pending Approval'
    case 'approved': return 'Approved'
    case 'in_transit': return 'In Transit'
    case 'awaiting_receipt': return 'Awaiting Receipt'
    case 'completed': return 'Completed'
    case 'cancelled': return 'Cancelled'
    default: return status
  }
}

const getTypeVariant = (type) => {
  switch (type) {
    case 'standard': return 'default'
    case 'return': return 'secondary'
    case 'adjustment': return 'outline'
    case 'bulk': return 'primary'
    default: return 'default'
  }
}

const getStatusVariant = (status) => {
  switch (status) {
    case 'pending': return 'warning'
    case 'approved': return 'secondary'
    case 'in_transit': return 'info'
    case 'awaiting_receipt': return 'secondary'
    case 'completed': return 'success'
    case 'cancelled': return 'destructive'
    default: return 'default'
  }
}

const formatCurrency = (value) => {
  if (value === undefined || value === null) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

const getLocationName = (locationId) => {
  return locationsMap.value[locationId]?.name || locationId || '—'
}

// Permission helper functions
const canApprove = (transfer) => {
  return transfer.status === 'pending' && transfer.requiresApproval
}

const canReceive = (transfer) => {
  return transfer.status === 'in_transit' || transfer.status === 'awaiting_receipt'
}

const canCancel = (transfer) => {
  return ['pending', 'approved', 'in_transit', 'awaiting_receipt'].includes(transfer.status)
}

// Action handlers
const viewTransferDetails = (transfer) => {
  emit('view-transfer', transfer)
}

const approveTransfer = (transfer) => {
  emit('approve-transfer', transfer)
}

const receiveTransfer = (transfer) => {
  emit('receive-transfer', transfer)
}

const cancelTransfer = (transfer) => {
  emit('cancel-transfer', transfer)
}

const printTransferDoc = (transfer) => {
  emit('print-transfer', transfer)
}

// Refresh data
const refreshData = () => {
  emit('refresh')
}
</script>