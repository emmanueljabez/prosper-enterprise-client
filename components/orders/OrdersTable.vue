<template>
  <div class="space-y-6 p-6">

    <!-- Header with Title and Button -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold">Orders</h2>
        <p class="text-muted-foreground">Manage customer orders and installations</p>
      </div>
      <Button @click="$emit('add-order')" size="default">
        <PlusIcon class="h-4 w-4 mr-2" />
        New Order
      </Button>
    </div>

    <!-- Filter Controls -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <Input placeholder="Search orders..." v-model="filters.search" />
      </div>
      <div>
        <Select v-model="filters.status">
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent @click.stop>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="on_hold">On Hold</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Select v-model="filters.paymentStatus">
          <SelectTrigger>
            <SelectValue placeholder="Filter by payment" />
          </SelectTrigger>
          <SelectContent @click.stop>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <div class="flex items-center space-x-2">
          <Button
              variant="outline"
              class="flex-1 justify-start"
              @click="resetFilters"
              :disabled="!hasFilters"
          >
            <RotateCcwIcon class="h-4 w-4 mr-2" />
            Reset Filters
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
    </div>

    <!-- Order Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div class="bg-card rounded-lg border p-4">
        <div class="text-sm font-medium text-muted-foreground">Total Orders</div>
        <div class="text-2xl font-bold mt-1">{{ filteredOrders.length }}</div>
      </div>

      <div class="bg-card rounded-lg border p-4">
        <div class="text-sm font-medium text-muted-foreground">Pending</div>
        <div class="text-2xl font-bold mt-1">
          {{ filteredOrders.filter(o => o.status === 'pending').length }}
        </div>
      </div>

      <div class="bg-card rounded-lg border p-4">
        <div class="text-sm font-medium text-muted-foreground">Pending Installation</div>
        <div class="text-2xl font-bold mt-1">
          {{ filteredOrders.filter(o =>
            o.installation &&
            o.installation.status === 'scheduled' &&
            o.status !== 'cancelled'
        ).length }}
        </div>
      </div>

      <div class="bg-card rounded-lg border p-4">
        <div class="text-sm font-medium text-muted-foreground">Total Value</div>
        <div class="text-2xl font-bold mt-1">
          {{ formatCurrency(
            filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0),
            'KES'
        ) }}
        </div>
      </div>

      <div class="bg-card rounded-lg border p-4">
        <div class="text-sm font-medium text-muted-foreground">Outstanding Balance</div>
        <div class="text-2xl font-bold mt-1">
          {{ formatCurrency(
            filteredOrders.reduce((sum, order) => sum + order.balance, 0),
            'KES'
        ) }}
        </div>
      </div>
    </div>

    <!-- Table Component -->
    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order #</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead class="text-right">Amount</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="isLoading" class="h-24">
            <TableCell colSpan="7" class="text-center">
              <div class="flex justify-center items-center">
                <Loader2Icon class="h-6 w-6 text-primary animate-spin mr-2" />
                <span>Loading orders...</span>
              </div>
            </TableCell>
          </TableRow>

          <TableRow v-else-if="filteredOrders.length === 0" class="h-24">
            <TableCell colSpan="7" class="text-center text-muted-foreground">
              <div class="flex flex-col items-center justify-center">
                <PackageIcon class="h-8 w-8 mb-2" />
                <span v-if="hasFilters">No orders match your filters. <Button variant="link" class="p-0 h-auto" @click="resetFilters">Clear filters</Button></span>
                <span v-else>No orders found. Create your first order to get started.</span>
              </div>
            </TableCell>
          </TableRow>

          <TableRow
              v-for="order in filteredOrders"
              :key="order.id"
              @click="$emit('view-order', order)"
              class="cursor-pointer hover:bg-muted/50"
          >
            <TableCell class="font-medium">{{ order.orderNumber }}</TableCell>
            <TableCell>{{ formatDate(order.orderDate) }}</TableCell>
            <TableCell>{{ order.customer.name }}</TableCell>
            <TableCell>
              <Badge :variant="getStatusVariant(order.status)">
                {{ formatStatus(order.status) }}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge :variant="getPaymentStatusVariant(order.paymentStatus)">
                {{ formatPaymentStatus(order.paymentStatus) }}
              </Badge>
            </TableCell>
            <TableCell class="text-right font-medium">{{ formatCurrency(order.totalAmount, order.currency) }}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild @click.stop>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontalIcon class="h-4 w-4" />
                    <span class="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" @click.stop>
                  <DropdownMenuItem @click.stop="$emit('view-order', order)">
                    <EyeIcon class="mr-2 h-4 w-4" />
                    <span>View Details</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click.stop="$emit('edit-order', order)">
                    <PencilIcon class="mr-2 h-4 w-4" />
                    <span>Edit Order</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />

                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <RotateCwIcon class="mr-2 h-4 w-4" />
                      <span>Update Status</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem
                          @click.stop="changeStatus(order, 'pending')"
                          :disabled="order.status === 'pending' || order.status === 'cancelled' || order.status === 'completed'"
                      >
                        <ClockIcon class="mr-2 h-4 w-4" />
                        <span>Pending</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                          @click.stop="changeStatus(order, 'processing')"
                          :disabled="order.status === 'processing' || order.status === 'cancelled' || order.status === 'completed'"
                      >
                        <Loader2Icon class="mr-2 h-4 w-4" />
                        <span>Processing</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                          @click.stop="changeStatus(order, 'completed')"
                          :disabled="order.status === 'completed' || order.status === 'cancelled'"
                      >
                        <CheckIcon class="mr-2 h-4 w-4" />
                        <span>Completed</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                          @click.stop="changeStatus(order, 'cancelled')"
                          :disabled="order.status === 'cancelled' || order.status === 'completed'"
                      >
                        <XIcon class="mr-2 h-4 w-4" />
                        <span>Cancelled</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                          @click.stop="changeStatus(order, 'on_hold')"
                          :disabled="order.status === 'on_hold' || order.status === 'cancelled' || order.status === 'completed'"
                      >
                        <PauseIcon class="mr-2 h-4 w-4" />
                        <span>On Hold</span>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                  <DropdownMenuItem
                      @click.stop="$emit('schedule-installation', order)"
                      :disabled="order.status === 'cancelled' || order.status === 'completed'"
                  >
                    <CalendarIcon class="mr-2 h-4 w-4" />
                    <span>Schedule Installation</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                      @click.stop="$emit('generate-invoice', order)"
                      :disabled="order.status === 'cancelled'"
                  >
                    <ReceiptIcon class="mr-2 h-4 w-4" />
                    <span>Generate Invoice</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                      @click.stop="$emit('delete-order', order)"
                      class="text-destructive focus:text-destructive"
                  >
                    <TrashIcon class="mr-2 h-4 w-4" />
                    <span>Delete Order</span>
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
import { format, parseISO } from 'date-fns'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu'
import {
  PlusIcon,
  RotateCcwIcon,
  RefreshCwIcon,
  PackageIcon,
  MoreHorizontalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  Loader2Icon,
  CheckIcon,
  XIcon,
  PauseIcon,
  CalendarIcon,
  ReceiptIcon,
  RotateCwIcon
} from 'lucide-vue-next'

const props = defineProps({
  orders: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'add-order',
  'view-order',
  'edit-order',
  'delete-order',
  'update-status',
  'schedule-installation',
  'generate-invoice',
  'refresh'
])

// Filters
const filters = ref({
  search: '',
  status: 'all',
  paymentStatus: 'all',
})

// Computed properties
const hasFilters = computed(() => {
  return filters.value.search ||
      filters.value.status !== 'all' ||
      filters.value.paymentStatus !== 'all'
})

const filteredOrders = computed(() => {
  if (!props.orders) return []

  return props.orders.filter(order => {
    // Filter by search term
    const searchMatch = !filters.value.search ||
        order.orderNumber.toLowerCase().includes(filters.value.search.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(filters.value.search.toLowerCase()) ||
        (order.customer.email && order.customer.email.toLowerCase().includes(filters.value.search.toLowerCase()))

    // Filter by status
    const statusMatch = filters.value.status === 'all' || order.status === filters.value.status

    // Filter by payment status
    const paymentMatch = filters.value.paymentStatus === 'all' || order.paymentStatus === filters.value.paymentStatus

    return searchMatch && statusMatch && paymentMatch
  })
})

// Methods
function resetFilters() {
  filters.value = {
    search: '',
    status: 'all',
    paymentStatus: 'all',
  }
}

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  return format(parseISO(dateString), 'dd MMM yyyy')
}

function formatCurrency(amount, currency = 'KES') {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(amount)
}

function formatStatus(status) {
  const statusMap = {
    'pending': 'Pending',
    'processing': 'Processing',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'on_hold': 'On Hold'
  }

  return statusMap[status] || status
}

function getStatusVariant(status) {
  const variantMap = {
    'pending': 'secondary',
    'processing': 'primary',
    'completed': 'success',
    'cancelled': 'destructive',
    'on_hold': 'warning'
  }

  return variantMap[status] || 'default'
}

function formatPaymentStatus(status) {
  const statusMap = {
    'paid': 'Paid',
    'unpaid': 'Unpaid',
    'partial': 'Partial'
  }

  return statusMap[status] || status
}

function getPaymentStatusVariant(status) {
  const variantMap = {
    'paid': 'success',
    'unpaid': 'destructive',
    'partial': 'warning'
  }

  return variantMap[status] || 'default'
}

function formatPaymentMethod(method) {
  const methodMap = {
    'cash': 'Cash',
    'bank_transfer': 'Bank Transfer',
    'mobile_money': 'Mobile Money',
    'card': 'Card Payment',
    'check': 'Check'
  }

  return methodMap[method] || method
}

function formatInstallationStatus(status) {
  const statusMap = {
    'pending': 'Pending',
    'scheduled': 'Scheduled',
    'in_progress': 'In Progress',
    'completed': 'Completed',
    'cancelled': 'Cancelled'
  }

  return statusMap[status] || status
}

function changeStatus(order, status) {
  emit('update-status', { order, status })
}
</script>