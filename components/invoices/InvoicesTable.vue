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
                  placeholder="Search invoices..."
                  class="pl-8"
              />
            </div>

            <!-- Status Filter -->
            <Select v-model="filters.status">
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
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

            <!-- Customer Type Filter -->
            <Select v-model="filters.customerType">
              <SelectTrigger>
                <SelectValue placeholder="Customer Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="business">Business</SelectItem>
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
                <SelectItem value="under5k">Under KES 5,000</SelectItem>
                <SelectItem value="5kTo20k">KES 5,000 - 20,000</SelectItem>
                <SelectItem value="20kTo50k">KES 20,000 - 50,000</SelectItem>
                <SelectItem value="over50k">Over KES 50,000</SelectItem>
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
                <SelectItem value="dueDate">Due Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Invoices Table -->
    <div class="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="isLoading">
            <TableCell colspan="7" class="h-24 text-center">
              <Loader2Icon class="h-6 w-6 animate-spin mx-auto" />
              <span class="text-sm text-muted-foreground mt-2">Loading invoices...</span>
            </TableCell>
          </TableRow>
          <TableRow v-else-if="filteredInvoices.length === 0">
            <TableCell colspan="7" class="h-24 text-center">
              <p class="text-muted-foreground">No invoices found</p>
              <Button
                  v-if="hasActiveFilters"
                  variant="link"
                  @click="resetFilters"
                  class="mt-2"
              >
                Clear filters
              </Button>
            </TableCell>
          </TableRow>
          <TableRow v-for="invoice in filteredInvoices" :key="invoice.id">
            <TableCell>
              <Button variant="link" class="p-0 h-auto font-medium" @click="$emit('view-invoice', invoice)">
                {{ invoice.number }}
              </Button>
            </TableCell>
            <TableCell>
              <div class="font-medium">{{ invoice.customer.name }}</div>
              <div v-if="invoice.customer.company" class="text-sm text-muted-foreground">
                {{ invoice.customer.company }}
              </div>
            </TableCell>
            <TableCell>{{ formatDate(invoice.invoiceDate) }}</TableCell>
            <TableCell>
              <div>{{ formatDate(invoice.dueDate) }}</div>
              <div v-if="isOverdue(invoice)" class="text-sm text-destructive">
                Overdue by {{ getDaysOverdue(invoice) }} days
              </div>
            </TableCell>
            <TableCell>KES {{ formatAmount(invoice.total) }}</TableCell>
            <TableCell>
              <Badge
                  :variant="invoice.status === 'paid' ? 'success' :
                         invoice.status === 'overdue' ? 'destructive' : 'secondary'"
              >
                {{ formatStatus(invoice.status) }}
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
                  <DropdownMenuItem @click="$emit('view-invoice', invoice)">
                    <EyeIcon class="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="$emit('view-pdf', invoice)">
                    <FileTextIcon class="h-4 w-4 mr-2" />
                    View PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="$emit('edit-invoice', invoice)">
                    <EditIcon class="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="$emit('send-invoice', invoice)">
                    <SendIcon class="h-4 w-4 mr-2" />
                    Send
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="$emit('mark-paid', invoice)">
                    <component
                        :is="invoice.status === 'paid' ? BanIcon : CheckSquareIcon"
                        class="h-4 w-4 mr-2"
                    />
                    {{ invoice.status === 'paid' ? 'Mark as Unpaid' : 'Mark as Paid' }}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="$emit('delete-invoice', invoice)" class="text-destructive">
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
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { format, parseISO, isPast, differenceInDays, startOfMonth, endOfMonth, subDays } from 'date-fns'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  MoreHorizontalIcon, EyeIcon, FileTextIcon, EditIcon, SendIcon,
  CheckSquareIcon, BanIcon, TrashIcon, Loader2Icon, SearchIcon, RefreshCwIcon
} from 'lucide-vue-next'

const props = defineProps({
  invoices: {
    type: Array,
    required: true
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'view-invoice',
  'edit-invoice',
  'delete-invoice',
  'mark-paid',
  'send-invoice',
  'view-pdf',
  'refresh'
])

// Filter state
const filters = ref({
  search: '',
  status: 'all',
  dateRange: 'all',
  customerType: 'all',
  amountRange: 'all',
  sortBy: 'dateDesc',
  startDate: '',
  endDate: ''
})

// Computed property to check if any filters are active
const hasActiveFilters = computed(() => {
  return filters.value.search !== '' ||
      filters.value.status !== 'all' ||
      filters.value.dateRange !== 'all' ||
      filters.value.customerType !== 'all' ||
      filters.value.amountRange !== 'all' ||
      filters.value.sortBy !== 'dateDesc'
})

// Reset filters
function resetFilters() {
  filters.value = {
    search: '',
    status: 'all',
    dateRange: 'all',
    customerType: 'all',
    amountRange: 'all',
    sortBy: 'dateDesc',
    startDate: '',
    endDate: ''
  }
}

// Computed property for filtered invoices
const filteredInvoices = computed(() => {
  if (!props.invoices || props.invoices.length === 0) {
    return []
  }

  let result = [...props.invoices]

  // Search filter
  if (filters.value.search) {
    const searchLower = filters.value.search.toLowerCase()
    result = result.filter(invoice =>
        invoice.number.toLowerCase().includes(searchLower) ||
        invoice.customer.name.toLowerCase().includes(searchLower) ||
        (invoice.customer.company && invoice.customer.company.toLowerCase().includes(searchLower))
    )
  }

  // Status filter
  if (filters.value.status !== 'all') {
    result = result.filter(invoice => invoice.status === filters.value.status)
  }

  // Customer type filter
  if (filters.value.customerType !== 'all') {
    if (filters.value.customerType === 'business') {
      result = result.filter(invoice => invoice.customer.company)
    } else if (filters.value.customerType === 'individual') {
      result = result.filter(invoice => !invoice.customer.company)
    }
  }

  // Amount range filter
  if (filters.value.amountRange !== 'all') {
    switch (filters.value.amountRange) {
      case 'under5k':
        result = result.filter(invoice => invoice.total < 5000)
        break
      case '5kTo20k':
        result = result.filter(invoice => invoice.total >= 5000 && invoice.total <= 20000)
        break
      case '20kTo50k':
        result = result.filter(invoice => invoice.total > 20000 && invoice.total <= 50000)
        break
      case 'over50k':
        result = result.filter(invoice => invoice.total > 50000)
        break
    }
  }

  // Date range filter
  if (filters.value.dateRange !== 'all') {
    const today = new Date()

    if (filters.value.dateRange === 'thisMonth') {
      const start = startOfMonth(today)
      const end = endOfMonth(today)
      result = result.filter(invoice => {
        const date = parseISO(invoice.invoiceDate)
        return date >= start && date <= end
      })
    }
    else if (filters.value.dateRange === 'last30') {
      const start = subDays(today, 30)
      result = result.filter(invoice => {
        const date = parseISO(invoice.invoiceDate)
        return date >= start
      })
    }
    else if (filters.value.dateRange === 'last90') {
      const start = subDays(today, 90)
      result = result.filter(invoice => {
        const date = parseISO(invoice.invoiceDate)
        return date >= start
      })
    }
    else if (filters.value.dateRange === 'custom' && filters.value.startDate && filters.value.endDate) {
      const start = parseISO(filters.value.startDate)
      const end = parseISO(filters.value.endDate)
      end.setHours(23, 59, 59) // Include the entire end date

      result = result.filter(invoice => {
        const date = parseISO(invoice.invoiceDate)
        return date >= start && date <= end
      })
    }
  }

  // Sorting
  result.sort((a, b) => {
    switch (filters.value.sortBy) {
      case 'dateAsc':
        return parseISO(a.invoiceDate) - parseISO(b.invoiceDate)
      case 'dateDesc':
        return parseISO(b.invoiceDate) - parseISO(a.invoiceDate)
      case 'amountAsc':
        return a.total - b.total
      case 'amountDesc':
        return b.total - a.total
      case 'customer':
        return a.customer.name.localeCompare(b.customer.name)
      case 'dueDate':
        return parseISO(a.dueDate) - parseISO(b.dueDate)
      default:
        return parseISO(b.invoiceDate) - parseISO(a.invoiceDate)
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

function formatStatus(status) {
  const statusMap = {
    'paid': 'Paid',
    'pending': 'Pending',
    'overdue': 'Overdue'
  }
  return statusMap[status] || status
}

function isOverdue(invoice) {
  return invoice.status !== 'paid' && isPast(parseISO(invoice.dueDate))
}

function getDaysOverdue(invoice) {
  if (!isOverdue(invoice)) return 0
  return differenceInDays(new Date(), parseISO(invoice.dueDate))
}

// Emit an event whenever filters change to potentially update summary data
watch(filters, () => {
  emit('refresh')
}, { deep: true })
</script>