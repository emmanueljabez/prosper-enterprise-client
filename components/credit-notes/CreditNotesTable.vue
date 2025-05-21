<template>
  <div class="space-y-6">
    <!-- Filters and Search -->
    <Card>
      <CardContent class="p-6">
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-medium">Filters</h3>
            <Button variant="ghost" size="sm" @click="resetFilters">
              <RefreshCwIcon class="h-4 w-4 mr-2" />
              Reset Filters
            </Button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Search -->
            <div class="relative">
              <SearchIcon class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                  v-model="filters.search"
                  placeholder="Search credit notes..."
                  class="pl-8"
              />
            </div>

            <!-- Refund Status Filter -->
            <Select v-model="filters.refundStatus">
              <SelectTrigger>
                <SelectValue placeholder="Refund Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="not_applicable">Not Applicable</SelectItem>
              </SelectContent>
            </Select>

            <!-- Reason Filter -->
            <Select v-model="filters.reason">
              <SelectTrigger>
                <SelectValue placeholder="Reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reasons</SelectItem>
                <SelectItem value="Returned Goods">Returned Goods</SelectItem>
                <SelectItem value="Pricing Error">Pricing Error</SelectItem>
                <SelectItem value="Damaged Product">Damaged Product</SelectItem>
                <SelectItem value="Duplicate Charge">Duplicate Charge</SelectItem>
                <SelectItem value="Service Not Rendered">Service Not Rendered</SelectItem>
                <SelectItem value="Cancelled Service">Cancelled Service</SelectItem>
                <SelectItem value="Quality Issue">Quality Issue</SelectItem>
                <SelectItem value="Goodwill Adjustment">Goodwill Adjustment</SelectItem>
              </SelectContent>
            </Select>

            <!-- Date Range Filter -->
            <Select v-model="filters.dateRange">
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="thisMonth">This Month</SelectItem>
                <SelectItem value="last30">Last 30 Days</SelectItem>
                <SelectItem value="last90">Last 90 Days</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Custom Date Range (shows only when custom is selected) -->
          <div v-if="filters.dateRange === 'custom'" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="startDate">Start Date</Label>
              <Input id="startDate" type="date" v-model="filters.startDate" />
            </div>
            <div class="space-y-2">
              <Label for="endDate">End Date</Label>
              <Input id="endDate" type="date" v-model="filters.endDate" />
            </div>
          </div>

          <!-- Additional Filters -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Amount Range Filter -->
            <Select v-model="filters.amountRange">
              <SelectTrigger>
                <SelectValue placeholder="Amount Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Amounts</SelectItem>
                <SelectItem value="under1k">Under KES 1,000</SelectItem>
                <SelectItem value="1kTo5k">KES 1,000 - 5,000</SelectItem>
                <SelectItem value="5kTo20k">KES 5,000 - 20,000</SelectItem>
                <SelectItem value="over20k">Over KES 20,000</SelectItem>
              </SelectContent>
            </Select>

            <!-- Sort Order -->
            <Select v-model="filters.sortBy">
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dateDesc">Date (Newest First)</SelectItem>
                <SelectItem value="dateAsc">Date (Oldest First)</SelectItem>
                <SelectItem value="amountDesc">Amount (High to Low)</SelectItem>
                <SelectItem value="amountAsc">Amount (Low to High)</SelectItem>
                <SelectItem value="customer">Customer Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Credit Notes Table -->
    <Card>
      <CardContent class="p-0">
        <div class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Credit Note</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Related Invoice</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Refund Status</TableHead>
                <TableHead class="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody v-if="!isLoading">
              <TableRow v-for="creditNote in filteredCreditNotes" :key="creditNote.id" class="hover:bg-muted/50">
                <TableCell class="font-medium">{{ creditNote.number }}</TableCell>
                <TableCell>
                  <div class="max-w-[200px] truncate">
                    {{ creditNote.customer.name }}
                    <span v-if="creditNote.customer.company" class="text-muted-foreground">
                      ({{ creditNote.customer.company }})
                    </span>
                  </div>
                </TableCell>
                <TableCell>{{ formatDate(creditNote.date) }}</TableCell>
                <TableCell>
                  <span v-if="creditNote.invoice">{{ creditNote.invoice.number }}</span>
                  <span v-else class="text-muted-foreground">N/A</span>
                </TableCell>
                <TableCell>{{ creditNote.reason }}</TableCell>
                <TableCell>KES {{ formatAmount(creditNote.total) }}</TableCell>
                <TableCell>
                  <Badge :variant="getRefundStatusBadgeVariant(creditNote.refundStatus)">
                    {{ formatRefundStatus(creditNote.refundStatus) }}
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
                      <DropdownMenuItem @click="$emit('view-credit-note', creditNote)">
                        <EyeIcon class="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem @click="$emit('edit-credit-note', creditNote)">
                        <EditIcon class="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem @click="$emit('view-pdf', creditNote)">
                        <FileTextIcon class="h-4 w-4 mr-2" />
                        View PDF
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                          class="text-destructive focus:text-destructive"
                          @click="$emit('delete-credit-note', creditNote)"
                      >
                        <TrashIcon class="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>

              <!-- Empty state if no results -->
              <TableRow v-if="filteredCreditNotes.length === 0">
                <TableCell colspan="8" class="h-24 text-center">
                  <div class="flex flex-col items-center justify-center text-center p-4">
                    <SearchXIcon class="h-8 w-8 text-muted-foreground mb-2" />
                    <p class="text-lg font-medium">No credit notes found</p>
                    <p class="text-sm text-muted-foreground mt-1">
                      Try adjusting your search or filter criteria
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>

            <!-- Loading skeleton -->
            <TableBody v-else>
              <TableRow v-for="i in 5" :key="i" class="hover:bg-muted/50">
                <TableCell v-for="j in 8" :key="j">
                  <Skeleton class="h-5 w-full" />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { format, parseISO, startOfMonth, endOfMonth, subDays, isWithinInterval } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
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
import { Skeleton } from '@/components/ui/skeleton'
import {
  SearchIcon,
  RefreshCwIcon,
  MoreHorizontalIcon,
  EyeIcon,
  EditIcon,
  FileTextIcon,
  TrashIcon,
  SearchXIcon
} from 'lucide-vue-next'

const props = defineProps({
  creditNotes: {
    type: Array,
    required: true
  },
  customers: {
    type: Array,
    default: () => []
  },
  invoices: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'view-credit-note',
  'edit-credit-note',
  'delete-credit-note',
  'view-pdf',
  'refresh'
])

// Filters state
const filters = ref({
  search: '',
  refundStatus: 'all',
  reason: 'all',
  dateRange: 'all',
  startDate: '',
  endDate: '',
  amountRange: 'all',
  sortBy: 'dateDesc'
})

// Filtered credit notes
const filteredCreditNotes = computed(() => {
  if (!props.creditNotes.length) return []

  let result = [...props.creditNotes]

  // Search filter
  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase()
    result = result.filter(creditNote =>
        creditNote.number.toLowerCase().includes(searchTerm) ||
        creditNote.customer.name.toLowerCase().includes(searchTerm) ||
        (creditNote.customer.company && creditNote.customer.company.toLowerCase().includes(searchTerm)) ||
        (creditNote.invoice && creditNote.invoice.number.toLowerCase().includes(searchTerm))
    )
  }

  // Amount range filter
  if (filters.value.amountRange !== 'all') {
    switch (filters.value.amountRange) {
      case 'under1k':
        result = result.filter(creditNote => creditNote.total < 1000)
        break
      case '1kTo5k':
        result = result.filter(creditNote => creditNote.total >= 1000 && creditNote.total <= 5000)
        break
      case '5kTo20k':
        result = result.filter(creditNote => creditNote.total > 5000 && creditNote.total <= 20000)
        break
      case 'over20k':
        result = result.filter(creditNote => creditNote.total > 20000)
        break
    }
  }

  // Date range filter
  if (filters.value.dateRange !== 'all') {
    const today = new Date()

    if (filters.value.dateRange === 'thisMonth') {
      const start = startOfMonth(today)
      const end = endOfMonth(today)
      result = result.filter(creditNote => {
        const date = parseISO(creditNote.date)
        return date >= start && date <= end
      })
    }
    else if (filters.value.dateRange === 'last30') {
      const start = subDays(today, 30)
      result = result.filter(creditNote => {
        const date = parseISO(creditNote.date)
        return date >= start
      })
    }
    else if (filters.value.dateRange === 'last90') {
      const start = subDays(today, 90)
      result = result.filter(creditNote => {
        const date = parseISO(creditNote.date)
        return date >= start
      })
    }
    else if (filters.value.dateRange === 'custom' && filters.value.startDate && filters.value.endDate) {
      const start = parseISO(filters.value.startDate)
      const end = parseISO(filters.value.endDate)
      end.setHours(23, 59, 59) // Include the entire end date

      result = result.filter(creditNote => {
        const date = parseISO(creditNote.date)
        return date >= start && date <= end
      })
    }
  }

  // Filter by reason
  if (filters.value.reason !== 'all') {
    result = result.filter(creditNote => creditNote.reason === filters.value.reason)
  }

  // Filter by refund status
  if (filters.value.refundStatus !== 'all') {
    result = result.filter(creditNote => creditNote.refundStatus === filters.value.refundStatus)
  }

  // Sorting
  result.sort((a, b) => {
    switch (filters.value.sortBy) {
      case 'dateAsc':
        return parseISO(a.date) - parseISO(b.date)
      case 'dateDesc':
        return parseISO(b.date) - parseISO(a.date)
      case 'amountAsc':
        return a.total - b.total
      case 'amountDesc':
        return b.total - a.total
      case 'customer':
        return a.customer.name.localeCompare(b.customer.name)
      default:
        return parseISO(b.date) - parseISO(a.date)
    }
  })

  return result
})

// Helper functions
function formatDate(dateString) {
  if (!dateString) return ''
  return format(parseISO(dateString), 'MMM dd, yyyy')
}

function formatAmount(amount) {
  return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function getRefundStatusBadgeVariant(status) {
  const variantMap = {
    'pending': 'outline',
    'processing': 'secondary',
    'completed': 'success',
    'not_applicable': 'secondary'
  }
  return variantMap[status] || 'outline'
}

function formatRefundStatus(status) {
  const statusMap = {
    'pending': 'Pending',
    'processing': 'Processing',
    'completed': 'Completed',
    'not_applicable': 'N/A'
  }
  return statusMap[status] || status
}

// Reset filters to default values
function resetFilters() {
  filters.value = {
    search: '',
    refundStatus: 'all',
    reason: 'all',
    dateRange: 'all',
    amountRange: 'all',
    startDate: '',
    endDate: '',
    sortBy: 'dateDesc'
  }
}

// Emit an event whenever filters change to potentially update summary data
watch(filters, () => {
  emit('refresh')
}, { deep: true })
</script>