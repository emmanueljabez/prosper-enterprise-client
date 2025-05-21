<template>
  <div class="space-y-6 p-6">

    <!-- Header with Title and Button -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold">Quotes</h2>
        <p class="text-muted-foreground">Create and manage quotes for your customers</p>
      </div>
      <Button @click="$emit('add-quote')" size="default">
        <PlusIcon class="h-4 w-4 mr-2" />
        New Quote
      </Button>
    </div>

    <!-- Filter Controls -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <Input placeholder="Search quotes..." v-model="filters.search" />
      </div>
      <div>
        <Select v-model="filters.status">
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent @click.stop>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <div class="flex space-x-2">
          <Button variant="outline" @click="resetFilters" class="shrink-0" size="icon">
            <RotateCcwIcon class="h-4 w-4" />
          </Button>
          <Button variant="outline" @click="$emit('refresh')" class="shrink-0" size="icon">
            <RefreshCwIcon class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>

    <!-- DataTable -->
    <div class="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-[50px]">
              <Checkbox
                  :checked="selectAll"
                  @update:checked="toggleSelectAll"
                  :indeterminate="indeterminate"
              />
            </TableHead>
            <TableHead class="w-[130px]">Quote Number</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Valid Until</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="isLoading" class="h-24">
            <TableCell colspan="8" class="text-center">
              <Loader2Icon class="w-6 h-6 mx-auto animate-spin text-primary" />
              <p class="mt-2 text-sm text-muted-foreground">Loading quotes...</p>
            </TableCell>
          </TableRow>

          <TableRow v-else-if="filteredQuotes.length === 0" class="h-24">
            <TableCell colspan="8" class="text-center">
              <div class="flex flex-col items-center justify-center">
                <FileQuestionIcon class="h-8 w-8 text-muted-foreground mb-2" />
                <p>No quotes found</p>
                <p class="text-sm text-muted-foreground mt-1">
                  {{ hasFilters ? 'Try changing your filters' : 'Create your first quote by clicking "New Quote"' }}
                </p>
              </div>
            </TableCell>
          </TableRow>

          <TableRow v-for="quote in filteredQuotes" :key="quote.id" :class="{ 'bg-muted/50': selectedQuotes.includes(quote.id) }">
            <TableCell>
              <Checkbox
                  :checked="selectedQuotes.includes(quote.id)"
                  @update:checked="toggleSelect(quote.id)"
              />
            </TableCell>
            <TableCell class="font-medium">{{ quote.quoteNumber }}</TableCell>
            <TableCell>{{ quote.customer.name }}</TableCell>
            <TableCell>
              <Badge :variant="getStatusVariant(quote.status)">
                {{ formatStatus(quote.status) }}
              </Badge>
            </TableCell>
            <TableCell>{{ formatCurrency(quote.totalAmount, quote.currency) }}</TableCell>
            <TableCell>{{ formatDate(quote.createdAt) }}</TableCell>
            <TableCell>{{ formatDate(quote.validUntil) }}</TableCell>
            <TableCell class="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger as="div">
                  <Button variant="ghost" size="icon">
                    <MoreHorizontalIcon class="h-4 w-4" />
                    <span class="sr-only">More</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" @click.stop>
                  <DropdownMenuItem @click="$emit('view-quote', quote)">
                    <EyeIcon class="mr-2 h-4 w-4" />
                    <span>View Details</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                      @click="$emit('edit-quote', quote)"
                      :disabled="quote.status === 'converted'"
                  >
                    <EditIcon class="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                      @click="$emit('send-quote', quote)"
                      :disabled="quote.status !== 'draft'"
                  >
                    <SendIcon class="mr-2 h-4 w-4" />
                    <span>Send to Customer</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                      @click="$emit('convert-quote', quote)"
                      :disabled="quote.status !== 'accepted'"
                  >
                    <CheckCircleIcon class="mr-2 h-4 w-4" />
                    <span>Convert to Order</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                      @click="$emit('delete-quote', quote)"
                      :disabled="quote.status === 'converted'"
                      class="text-destructive focus:text-destructive"
                  >
                    <TrashIcon class="mr-2 h-4 w-4" />
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
        Showing {{ paginatedQuotes.length ? 1 : 0 }}-{{ paginatedQuotes.length }} of {{ filteredQuotes.length }} quotes
      </div>
      <div class="flex items-center space-x-2">
        <Button
            variant="outline"
            size="sm"
            :disabled="pagination.page === 1"
            @click="pagination.page--"
        >
          Previous
        </Button>
        <Button
            variant="outline"
            size="sm"
            :disabled="pagination.page >= maxPage"
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
import { format, parseISO } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
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
  PlusIcon,
  MoreHorizontalIcon,
  EyeIcon,
  EditIcon,
  TrashIcon,
  SendIcon,
  CheckCircleIcon,
  RotateCcwIcon,
  RefreshCwIcon,
  FileQuestionIcon,
  Loader2Icon
} from 'lucide-vue-next'

const props = defineProps({
  quotes: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'add-quote',
  'view-quote',
  'edit-quote',
  'delete-quote',
  'send-quote',
  'convert-quote',
  'refresh'
])

// Filter and pagination state
const filters = ref({
  search: '',
  status: 'all'
})

const pagination = ref({
  page: 1,
  perPage: 10
})

// Selection state
const selectedQuotes = ref([])

// Computed properties
const hasFilters = computed(() => {
  return filters.value.search.trim() !== '' || filters.value.status !== 'all'
})

const filteredQuotes = computed(() => {
  let result = [...props.quotes]

  // Apply search filter
  const searchTerm = filters.value.search.toLowerCase().trim()
  if (searchTerm) {
    result = result.filter(quote =>
        quote.quoteNumber.toLowerCase().includes(searchTerm) ||
        quote.customer.name.toLowerCase().includes(searchTerm) ||
        quote.customer.email.toLowerCase().includes(searchTerm)
    )
  }

  // Apply status filter
  if (filters.value.status !== 'all') {
    result = result.filter(quote => quote.status === filters.value.status)
  }

  return result
})

const maxPage = computed(() => {
  return Math.max(1, Math.ceil(filteredQuotes.value.length / pagination.value.perPage))
})

const paginatedQuotes = computed(() => {
  const startIndex = (pagination.value.page - 1) * pagination.value.perPage
  const endIndex = startIndex + pagination.value.perPage
  return filteredQuotes.value.slice(startIndex, endIndex)
})

const selectAll = computed({
  get: () => {
    return paginatedQuotes.value.length > 0 &&
        selectedQuotes.value.length === paginatedQuotes.value.length
  },
  set: (value) => {
    if (value) {
      selectedQuotes.value = paginatedQuotes.value.map(quote => quote.id)
    } else {
      selectedQuotes.value = []
    }
  }
})

const indeterminate = computed(() => {
  return selectedQuotes.value.length > 0 &&
      selectedQuotes.value.length < paginatedQuotes.value.length
})

// Helper functions
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
    'draft': 'Draft',
    'sent': 'Sent',
    'accepted': 'Accepted',
    'declined': 'Declined',
    'expired': 'Expired',
    'converted': 'Converted'
  }

  return statusMap[status] || status
}

function getStatusVariant(status) {
  const variantMap = {
    'draft': 'secondary',
    'sent': 'default',
    'accepted': 'success',
    'declined': 'destructive',
    'expired': 'outline',
    'converted': 'primary'
  }

  return variantMap[status] || 'default'
}

// Actions
function resetFilters() {
  filters.value = {
    search: '',
    status: 'all'
  }
  pagination.value.page = 1
}

function toggleSelect(id) {
  const index = selectedQuotes.value.indexOf(id)
  if (index === -1) {
    selectedQuotes.value.push(id)
  } else {
    selectedQuotes.value.splice(index, 1)
  }
}

function toggleSelectAll(checked) {
  if (checked) {
    selectedQuotes.value = paginatedQuotes.value.map(quote => quote.id)
  } else {
    selectedQuotes.value = []
  }
}

// Watch for filter changes to reset pagination
watch([filters], () => {
  pagination.value.page = 1
}, { deep: true })
</script>