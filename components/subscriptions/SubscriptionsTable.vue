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
                  placeholder="Search subscriptions..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="past_due">Past Due</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>

            <!-- Plan Filter -->
            <Select v-model="filters.plan">
              <SelectTrigger>
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="Basic Plan">Basic Plan</SelectItem>
                <SelectItem value="Standard Plan">Standard Plan</SelectItem>
                <SelectItem value="Premium Plan">Premium Plan</SelectItem>
                <SelectItem value="Enterprise Plan">Enterprise Plan</SelectItem>
              </SelectContent>
            </Select>

            <!-- Renewal Date Filter -->
            <Select v-model="filters.renewalDate">
              <SelectTrigger>
                <SelectValue placeholder="Renewal Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="next7">Next 7 Days</SelectItem>
                <SelectItem value="next30">Next 30 Days</SelectItem>
                <SelectItem value="next90">Next 90 Days</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Subscriptions Table -->
    <Card>
      <CardContent class="p-0">
        <div class="relative w-full overflow-auto">
          <table class="w-full caption-bottom text-sm">
            <thead class="[&_tr]:border-b">
            <tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <th class="h-12 px-4 text-left align-middle font-medium">
                <div class="flex items-center space-x-2" @click="toggleSort('customer')">
                  <span>Customer</span>
                  <ArrowUpDownIcon v-if="filters.sortBy !== 'customerAsc' && filters.sortBy !== 'customerDesc'" class="h-4 w-4" />
                  <ArrowDownIcon v-if="filters.sortBy === 'customerAsc'" class="h-4 w-4" />
                  <ArrowUpIcon v-if="filters.sortBy === 'customerDesc'" class="h-4 w-4" />
                </div>
              </th>
              <th class="h-12 px-4 text-left align-middle font-medium">
                <div class="flex items-center space-x-2" @click="toggleSort('plan')">
                  <span>Plan</span>
                  <ArrowUpDownIcon v-if="filters.sortBy !== 'planAsc' && filters.sortBy !== 'planDesc'" class="h-4 w-4" />
                  <ArrowDownIcon v-if="filters.sortBy === 'planAsc'" class="h-4 w-4" />
                  <ArrowUpIcon v-if="filters.sortBy === 'planDesc'" class="h-4 w-4" />
                </div>
              </th>
              <th class="h-12 px-4 text-left align-middle font-medium">
                <div class="flex items-center space-x-2" @click="toggleSort('status')">
                  <span>Status</span>
                  <ArrowUpDownIcon v-if="filters.sortBy !== 'statusAsc' && filters.sortBy !== 'statusDesc'" class="h-4 w-4" />
                  <ArrowDownIcon v-if="filters.sortBy === 'statusAsc'" class="h-4 w-4" />
                  <ArrowUpIcon v-if="filters.sortBy === 'statusDesc'" class="h-4 w-4" />
                </div>
              </th>
              <th class="h-12 px-4 text-left align-middle font-medium">
                <div class="flex items-center space-x-2" @click="toggleSort('amount')">
                  <span>Amount</span>
                  <ArrowUpDownIcon v-if="filters.sortBy !== 'amountAsc' && filters.sortBy !== 'amountDesc'" class="h-4 w-4" />
                  <ArrowDownIcon v-if="filters.sortBy === 'amountAsc'" class="h-4 w-4" />
                  <ArrowUpIcon v-if="filters.sortBy === 'amountDesc'" class="h-4 w-4" />
                </div>
              </th>
              <th class="h-12 px-4 text-left align-middle font-medium">
                <div class="flex items-center space-x-2" @click="toggleSort('billingCycle')">
                  <span>Billing Cycle</span>
                  <ArrowUpDownIcon v-if="filters.sortBy !== 'billingCycleAsc' && filters.sortBy !== 'billingCycleDesc'" class="h-4 w-4" />
                  <ArrowDownIcon v-if="filters.sortBy === 'billingCycleAsc'" class="h-4 w-4" />
                  <ArrowUpIcon v-if="filters.sortBy === 'billingCycleDesc'" class="h-4 w-4" />
                </div>
              </th>
              <th class="h-12 px-4 text-left align-middle font-medium">
                <div class="flex items-center space-x-2" @click="toggleSort('nextRenewal')">
                  <span>Next Renewal</span>
                  <ArrowUpDownIcon v-if="filters.sortBy !== 'nextRenewalAsc' && filters.sortBy !== 'nextRenewalDesc'" class="h-4 w-4" />
                  <ArrowDownIcon v-if="filters.sortBy === 'nextRenewalAsc'" class="h-4 w-4" />
                  <ArrowUpIcon v-if="filters.sortBy === 'nextRenewalDesc'" class="h-4 w-4" />
                </div>
              </th>
              <th class="h-12 px-4 text-left align-middle font-medium">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
            </thead>
            <tbody class="[&_tr:last-child]:border-0">
            <template v-if="loading">
              <tr v-for="i in 5" :key="`skeleton-${i}`" class="border-b transition-colors">
                <td class="p-4" v-for="j in 7" :key="`cell-${i}-${j}`">
                  <Skeleton class="h-5 w-full" />
                </td>
              </tr>
            </template>
            <template v-else-if="filteredSubscriptions.length === 0">
              <tr>
                <td colspan="7" class="p-4 text-center text-muted-foreground">
                  No subscriptions found matching the current filters.
                </td>
              </tr>
            </template>
            <template v-else>
              <tr
                  v-for="subscription in filteredSubscriptions"
                  :key="subscription.id"
                  class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
              >
                <td class="p-4">
                  <div class="font-medium">{{ subscription.customer.name }}</div>
                  <div class="text-sm text-muted-foreground">{{ subscription.customer.email }}</div>
                </td>
                <td class="p-4">{{ subscription.planName }}</td>
                <td class="p-4">
                  <Badge :variant="getStatusVariant(subscription.status)">
                    {{ formatStatus(subscription.status) }}
                  </Badge>
                </td>
                <td class="p-4">
                  <div>KES {{ formatAmount(subscription.amount) }}</div>
                  <div class="text-xs text-muted-foreground">
                    Per {{ formatBillingCycle(subscription.billingCycle) }}
                  </div>
                </td>
                <td class="p-4">{{ formatBillingCycle(subscription.billingCycle) }}</td>
                <td class="p-4">
                  <div :class="isOverdue(subscription.nextRenewalDate) ? 'text-destructive' : ''">
                    {{ formatDate(subscription.nextRenewalDate) }}
                  </div>
                  <div class="text-xs text-muted-foreground">
                    {{ getRenewalStatus(subscription.nextRenewalDate) }}
                  </div>
                </td>
                <td class="p-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontalIcon class="h-4 w-4" />
                        <span class="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem @click="$emit('view-subscription', subscription)">
                        <EyeIcon class="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem @click="$emit('edit-subscription', subscription)">
                        <EditIcon class="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                          v-if="subscription.status === 'active' || subscription.status === 'trial'"
                          @click="$emit('renew-subscription', subscription)"
                      >
                        <RepeatIcon class="h-4 w-4 mr-2" />
                        Renew
                      </DropdownMenuItem>
                      <DropdownMenuItem
                          v-if="subscription.status === 'active' || subscription.status === 'trial'"
                          @click="$emit('cancel-subscription', subscription)"
                      >
                        <XIcon class="h-4 w-4 mr-2" />
                        Cancel
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                          @click="$emit('delete-subscription', subscription)"
                          class="text-destructive focus:text-destructive"
                      >
                        <TrashIcon class="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            </template>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { format, parseISO, differenceInDays, isPast, addDays } from 'date-fns'
import {
  Card,
  CardContent
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
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
  SearchIcon,
  RefreshCwIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MoreHorizontalIcon,
  EyeIcon,
  EditIcon,
  TrashIcon,
  RepeatIcon,
  XIcon
} from 'lucide-vue-next'

const props = defineProps({
  subscriptions: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'view-subscription',
  'edit-subscription',
  'delete-subscription',
  'renew-subscription',
  'cancel-subscription',
  'refresh'
])

// Filters state
const filters = ref({
  search: '',
  status: 'all',
  plan: 'all',
  renewalDate: 'all',
  sortBy: 'nextRenewalAsc'
})

// Toggle sort order
function toggleSort(field) {
  const currentSort = filters.value.sortBy

  switch (field) {
    case 'customer':
      filters.value.sortBy = currentSort === 'customerAsc' ? 'customerDesc' : 'customerAsc'
      break
    case 'plan':
      filters.value.sortBy = currentSort === 'planAsc' ? 'planDesc' : 'planAsc'
      break
    case 'status':
      filters.value.sortBy = currentSort === 'statusAsc' ? 'statusDesc' : 'statusAsc'
      break
    case 'amount':
      filters.value.sortBy = currentSort === 'amountAsc' ? 'amountDesc' : 'amountAsc'
      break
    case 'billingCycle':
      filters.value.sortBy = currentSort === 'billingCycleAsc' ? 'billingCycleDesc' : 'billingCycleAsc'
      break
    case 'nextRenewal':
      filters.value.sortBy = currentSort === 'nextRenewalAsc' ? 'nextRenewalDesc' : 'nextRenewalAsc'
      break
  }
}

// Filtered and sorted subscriptions
const filteredSubscriptions = computed(() => {
  let result = [...props.subscriptions]
  const today = new Date()

  // Apply search filter
  if (filters.value.search) {
    const searchLower = filters.value.search.toLowerCase()
    result = result.filter(subscription =>
        subscription.customer.name.toLowerCase().includes(searchLower) ||
        subscription.customer.email.toLowerCase().includes(searchLower) ||
        subscription.planName.toLowerCase().includes(searchLower)
    )
  }

  // Apply status filter
  if (filters.value.status !== 'all') {
    result = result.filter(subscription => subscription.status === filters.value.status)
  }

  // Apply plan filter
  if (filters.value.plan !== 'all') {
    result = result.filter(subscription => subscription.planName === filters.value.plan)
  }

  // Apply renewal date filter
  if (filters.value.renewalDate !== 'all') {
    if (filters.value.renewalDate === 'next7') {
      result = result.filter(subscription => {
        const renewalDate = parseISO(subscription.nextRenewalDate)
        return differenceInDays(renewalDate, today) <= 7 && !isPast(renewalDate)
      })
    } else if (filters.value.renewalDate === 'next30') {
      result = result.filter(subscription => {
        const renewalDate = parseISO(subscription.nextRenewalDate)
        return differenceInDays(renewalDate, today) <= 30 && !isPast(renewalDate)
      })
    } else if (filters.value.renewalDate === 'next90') {
      result = result.filter(subscription => {
        const renewalDate = parseISO(subscription.nextRenewalDate)
        return differenceInDays(renewalDate, today) <= 90 && !isPast(renewalDate)
      })
    } else if (filters.value.renewalDate === 'overdue') {
      result = result.filter(subscription => {
        return isPast(parseISO(subscription.nextRenewalDate))
      })
    }
  }

  // Apply sorting
  result.sort((a, b) => {
    switch (filters.value.sortBy) {
      case 'customerAsc':
        return a.customer.name.localeCompare(b.customer.name)
      case 'customerDesc':
        return b.customer.name.localeCompare(a.customer.name)
      case 'planAsc':
        return a.planName.localeCompare(b.planName)
      case 'planDesc':
        return b.planName.localeCompare(a.planName)
      case 'statusAsc':
        return a.status.localeCompare(b.status)
      case 'statusDesc':
        return b.status.localeCompare(a.status)
      case 'amountAsc':
        return a.amount - b.amount
      case 'amountDesc':
        return b.amount - a.amount
      case 'billingCycleAsc':
        return a.billingCycle.localeCompare(b.billingCycle)
      case 'billingCycleDesc':
        return b.billingCycle.localeCompare(a.billingCycle)
      case 'nextRenewalAsc':
        return parseISO(a.nextRenewalDate) - parseISO(b.nextRenewalDate)
      case 'nextRenewalDesc':
        return parseISO(b.nextRenewalDate) - parseISO(a.nextRenewalDate)
      default:
        return parseISO(a.nextRenewalDate) - parseISO(b.nextRenewalDate)
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

function getStatusVariant(status) {
  const variantMap = {
    'active': 'success',
    'trial': 'secondary',
    'past_due': 'warning',
    'cancelled': 'destructive',
    'expired': 'outline'
  }
  return variantMap[status] || 'default'
}

function formatStatus(status) {
  const statusMap = {
    'active': 'Active',
    'trial': 'Trial',
    'past_due': 'Past Due',
    'cancelled': 'Cancelled',
    'expired': 'Expired'
  }
  return statusMap[status] || status
}

function formatBillingCycle(cycle) {
  const cycleMap = {
    'monthly': 'Month',
    'quarterly': 'Quarter',
    'semi-annually': '6 Months',
    'annually': 'Year'
  }
  return cycleMap[cycle] || cycle
}

function isOverdue(dateString) {
  if (!dateString) return false
  return isPast(parseISO(dateString))
}

function getRenewalStatus(dateString) {
  if (!dateString) return ''

  const renewalDate = parseISO(dateString)
  const today = new Date()

  if (isPast(renewalDate)) {
    return 'Overdue'
  }

  const daysUntil = differenceInDays(renewalDate, today)

  if (daysUntil === 0) {
    return 'Today'
  } else if (daysUntil === 1) {
    return 'Tomorrow'
  } else if (daysUntil <= 7) {
    return `In ${daysUntil} days`
  } else if (daysUntil <= 30) {
    return `In ${Math.ceil(daysUntil / 7)} weeks`
  } else {
    return format(renewalDate, 'MMM yyyy')
  }
}

// Reset filters to default values
function resetFilters() {
  filters.value = {
    search: '',
    status: 'all',
    plan: 'all',
    renewalDate: 'all',
    sortBy: 'nextRenewalAsc'
  }
}

// Emit an event whenever filters change to potentially update summary data
watch(filters, () => {
  emit('refresh')
}, { deep: true })
</script>