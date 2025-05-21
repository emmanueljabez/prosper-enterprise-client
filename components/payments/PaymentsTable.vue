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
                  placeholder="Search payments..."
                  class="pl-8"
              />
            </div>

            <!-- Payment Method Filter -->
            <Select v-model="filters.paymentMethod">
              <SelectTrigger>
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="mobile_money">Mobile Money</SelectItem>
                <SelectItem value="credit_card">Credit Card</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
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

            <!-- Allocation Status -->
            <Select v-model="filters.allocationStatus">
              <SelectTrigger>
                <SelectValue placeholder="Allocation Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="allocated">Allocated</SelectItem>
                <SelectItem value="unallocated">Unallocated</SelectItem>
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

    <!-- Payments Table -->
    <div class="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Payment #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Invoice</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="isLoading">
            <TableCell colspan="7" class="h-24 text-center">
              <Loader2Icon class="h-6 w-6 animate-spin mx-auto" />
              <span class="text-sm text-muted-foreground mt-2">Loading payments...</span>
            </TableCell>
          </TableRow>
          <TableRow v-else-if="filteredPayments.length === 0">
            <TableCell colspan="7" class="h-24 text-center">
              <p class="text-muted-foreground">No payments found</p>
            </TableCell>
          </TableRow>
          <TableRow v-for="payment in filteredPayments" :key="payment.id">
            <TableCell>
              <Button variant="link" class="p-0 h-auto font-medium" @click="$emit('view-payment', payment)">
                {{ payment.number }}
              </Button>
            </TableCell>
            <TableCell>
              <div class="font-medium">{{ payment.customer.name }}</div>
              <div v-if="payment.customer.company" class="text-sm text-muted-foreground">
                {{ payment.customer.company }}
              </div>
            </TableCell>
            <TableCell>{{ formatDate(payment.date) }}</TableCell>
            <TableCell>KES {{ formatAmount(payment.amount) }}</TableCell>
            <TableCell>
              <div class="flex items-center">
                <span
                    class="w-2 h-2 rounded-full mr-2"
                    :class="{
                    'bg-blue-500': payment.method === 'bank_transfer',
                    'bg-green-500': payment.method === 'mobile_money',
                    'bg-purple-500': payment.method === 'credit_card',
                    'bg-yellow-500': payment.method === 'cash',
                    'bg-orange-500': payment.method === 'cheque'
                  }"
                />
                {{ formatPaymentMethod(payment.method) }}
              </div>
              <div class="text-xs text-muted-foreground mt-1">
                Ref: {{ payment.reference }}
              </div>
            </TableCell>
            <TableCell>
              <div v-if="payment.invoiceId">
                <div>{{ payment.invoiceNumber }}</div>
              </div>
              <Badge v-else variant="outline" class="bg-amber-50 text-amber-700 hover:bg-amber-50">
                Unallocated
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
                  <DropdownMenuItem @click="$emit('view-payment', payment)">
                    <EyeIcon class="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="$emit('view-receipt', payment)">
                    <FileTextIcon class="h-4 w-4 mr-2" />
                    View Receipt
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="$emit('edit-payment', payment)">
                    <EditIcon class="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="$emit('delete-payment', payment)" class="text-destructive">
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
import { format, parseISO, startOfMonth, endOfMonth, subDays } from 'date-fns'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  MoreHorizontalIcon, EyeIcon, FileTextIcon, EditIcon,
  TrashIcon, SearchIcon, RefreshCwIcon, Loader2Icon
} from 'lucide-vue-next'

const props = defineProps({
  payments: {
    type: Array,
    required: true
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

const emit = defineEmits(['view-payment', 'edit-payment', 'delete-payment', 'view-receipt', 'refresh'])

// Filter state
const filters = ref({
  search: '',
  paymentMethod: 'all',
  dateRange: 'all',
  allocationStatus: 'all',
  amountRange: 'all',
  sortBy: 'dateDesc',
  startDate: '',
  endDate: ''
})

function resetFilters() {
  filters.value = {
    search: '',
    paymentMethod: 'all',
    dateRange: 'all',
    allocationStatus: 'all',
    amountRange: 'all',
    sortBy: 'dateDesc',
    startDate: '',
    endDate: ''
  }
}

// Filtered payments based on current filters
const filteredPayments = computed(() => {
  if (props.isLoading || !props.payments) {
    return []
  }

  let result = [...props.payments]

  // Search filter
  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase()
    result = result.filter(payment =>
        payment.number.toLowerCase().includes(searchTerm) ||
        payment.customer.name.toLowerCase().includes(searchTerm) ||
        (payment.customer.company && payment.customer.company.toLowerCase().includes(searchTerm)) ||
        payment.reference.toLowerCase().includes(searchTerm) ||
        (payment.invoiceNumber && payment.invoiceNumber.toLowerCase().includes(searchTerm))
    )
  }

  // Payment method filter
  if (filters.value.paymentMethod !== 'all') {
    result = result.filter(payment => payment.method === filters.value.paymentMethod)
  }

  // Allocation status filter
  if (filters.value.allocationStatus !== 'all') {
    if (filters.value.allocationStatus === 'allocated') {
      result = result.filter(payment => payment.invoiceId)
    } else if (filters.value.allocationStatus === 'unallocated') {
      result = result.filter(payment => !payment.invoiceId)
    }
  }

  // Amount range filter
  if (filters.value.amountRange !== 'all') {
    switch (filters.value.amountRange) {
      case 'under1k':
        result = result.filter(payment => payment.amount < 1000)
        break
      case '1kTo5k':
        result = result.filter(payment => payment.amount >= 1000 && payment.amount <= 5000)
        break
      case '5kTo20k':
        result = result.filter(payment => payment.amount > 5000 && payment.amount <= 20000)
        break
      case 'over20k':
        result = result.filter(payment => payment.amount > 20000)
        break
    }
  }

  // Date range filter
  if (filters.value.dateRange !== 'all') {
    const today = new Date()

    if (filters.value.dateRange === 'thisMonth') {
      const start = startOfMonth(today)
      const end = endOfMonth(today)
      result = result.filter(payment => {
        const date = parseISO(payment.date)
        return date >= start && date <= end
      })
    }
    else if (filters.value.dateRange === 'last30') {
      const start = subDays(today, 30)
      result = result.filter(payment => {
        const date = parseISO(payment.date)
        return date >= start
      })
    }
    else if (filters.value.dateRange === 'last90') {
      const start = subDays(today, 90)
      result = result.filter(payment => {
        const date = parseISO(payment.date)
        return date >= start
      })
    }
    else if (filters.value.dateRange === 'custom' && filters.value.startDate && filters.value.endDate) {
      const start = parseISO(filters.value.startDate)
      const end = parseISO(filters.value.endDate)
      end.setHours(23, 59, 59) // Include the entire end date

      result = result.filter(payment => {
        const date = parseISO(payment.date)
        return date >= start && date <= end
      })
    }
  }

  // Sorting
  result.sort((a, b) => {
    switch (filters.value.sortBy) {
      case 'dateAsc':
        return parseISO(a.date) - parseISO(b.date)
      case 'dateDesc':
        return parseISO(b.date) - parseISO(a.date)
      case 'amountAsc':
        return a.amount - b.amount
      case 'amountDesc':
        return b.amount - a.amount
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

function formatPaymentMethod(method) {
  const methodMap = {
    'bank_transfer': 'Bank Transfer',
    'mobile_money': 'Mobile Money',
    'credit_card': 'Credit Card',
    'cash': 'Cash',
    'cheque': 'Cheque'
  }
  return methodMap[method] || method
}

// Emit an event whenever filters change to potentially update summary data
watch(filters, () => {
  emit('refresh')
}, { deep: true })
</script>