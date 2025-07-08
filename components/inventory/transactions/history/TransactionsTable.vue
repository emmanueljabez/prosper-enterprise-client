<template>
  <div class="space-y-4">
    <!-- Table -->
    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <div class="flex items-center cursor-pointer" @click="sortBy('referenceNumber')">
                Reference
                <ArrowUpIcon v-if="sortConfig.key === 'referenceNumber' && sortConfig.direction === 'asc'" class="ml-1 h-4 w-4" />
                <ArrowDownIcon v-if="sortConfig.key === 'referenceNumber' && sortConfig.direction === 'desc'" class="ml-1 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead>
              <div class="flex items-center cursor-pointer" @click="sortBy('type')">
                Type
                <ArrowUpIcon v-if="sortConfig.key === 'type' && sortConfig.direction === 'asc'" class="ml-1 h-4 w-4" />
                <ArrowDownIcon v-if="sortConfig.key === 'type' && sortConfig.direction === 'desc'" class="ml-1 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead>
              <div class="flex items-center cursor-pointer" @click="sortBy('createdAt')">
                Date
                <ArrowUpIcon v-if="sortConfig.key === 'createdAt' && sortConfig.direction === 'asc'" class="ml-1 h-4 w-4" />
                <ArrowDownIcon v-if="sortConfig.key === 'createdAt' && sortConfig.direction === 'desc'" class="ml-1 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead>
              <div class="flex items-center cursor-pointer" @click="sortBy('locationId')">
                Location
                <ArrowUpIcon v-if="sortConfig.key === 'locationId' && sortConfig.direction === 'asc'" class="ml-1 h-4 w-4" />
                <ArrowDownIcon v-if="sortConfig.key === 'locationId' && sortConfig.direction === 'desc'" class="ml-1 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead>
              <div class="flex items-center cursor-pointer" @click="sortBy('totalValue')">
                Total Value
                <ArrowUpIcon v-if="sortConfig.key === 'totalValue' && sortConfig.direction === 'asc'" class="ml-1 h-4 w-4" />
                <ArrowDownIcon v-if="sortConfig.key === 'totalValue' && sortConfig.direction === 'desc'" class="ml-1 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="transactions.length === 0">
            <TableCell colspan="6" class="text-center">
              <div class="flex flex-col items-center justify-center py-8">
                <PackageXIcon class="h-10 w-10 text-muted-foreground" />
                <div class="mt-2">No transactions found</div>
                <div class="mt-1 text-sm text-muted-foreground">
                  Try adjusting your filters or date range.
                </div>
              </div>
            </TableCell>
          </TableRow>
          <TableRow v-for="transaction in sortedTransactions" :key="transaction.id">
            <TableCell>
              <div class="font-medium">{{ transaction.referenceNumber || transaction.id }}</div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{{ formatType(transaction.type) }}</Badge>
            </TableCell>
            <TableCell>
              {{ formatDate(transaction.createdAt) }}
            </TableCell>
            <TableCell>
              <span v-if="locationsMap[transaction.locationId]">
                {{ locationsMap[transaction.locationId].name }}
              </span>
              <span v-else class="text-muted-foreground">—</span>
            </TableCell>
            <TableCell>
              <span v-if="transaction.totalValue != null">
                {{ formatCurrency(transaction.totalValue) }}
              </span>
              <span v-else class="text-muted-foreground">—</span>
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
                  <DropdownMenuItem @click="$emit('view-transaction', transaction)">
                    <EyeIcon class="mr-2 h-4 w-4" />
                    <span>View Details</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="$emit('view-documents', transaction)">
                    <FileTextIcon class="mr-2 h-4 w-4" />
                    <span>Documents</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="$emit('view-audit', transaction)">
                    <HistoryIcon class="mr-2 h-4 w-4" />
                    <span>Audit Log</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="$emit('print-transaction', transaction)">
                    <PrinterIcon class="mr-2 h-4 w-4" />
                    <span>Print</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="$emit('void-transaction', transaction)" class="text-destructive focus:text-destructive">
                    <BanIcon class="mr-2 h-4 w-4" />
                    <span>Void</span>
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
        Showing {{ pageStart }} to {{ pageEnd }} of {{ totalCount }} entries
      </div>
      <div class="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage <= 1"
          @click="$emit('prev-page')"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="!hasNextPage"
          @click="$emit('next-page')"
        >
          Next
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { format } from 'date-fns'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BanIcon,
  EyeIcon,
  FileTextIcon,
  HistoryIcon,
  MoreHorizontalIcon,
  PackageXIcon,
  PrinterIcon
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
  transactions: { type: Array, required: true },
  locations: { type: Array, default: () => [] },
  totalCount: { type: Number, default: 0 },
  currentPage: { type: Number, default: 1 },
  hasNextPage: { type: Boolean, default: false }
})

const emit = defineEmits([
  'view-transaction',
  'view-documents',
  'view-audit',
  'print-transaction',
  'void-transaction',
  'prev-page',
  'next-page'
])

const sortConfig = ref({
  key: 'createdAt',
  direction: 'desc'
})

function sortBy(key) {
  if (sortConfig.value.key === key) {
    sortConfig.value.direction = sortConfig.value.direction === 'asc' ? 'desc' : 'asc'
  } else {
    sortConfig.value.key = key
    sortConfig.value.direction = 'asc'
  }
}

const sortedTransactions = computed(() => {
  const arr = [...props.transactions]
  const { key, direction } = sortConfig.value
  arr.sort((a, b) => {
    let aVal = a[key]
    let bVal = b[key]
    if (aVal == null) return 1
    if (bVal == null) return -1
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return direction === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal)
    }
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return direction === 'asc' ? aVal - bVal : bVal - aVal
    }
    // fallback to string compare
    return direction === 'asc'
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal))
  })
  return arr
})

const locationsMap = computed(() => {
  const map = {}
  for (const loc of props.locations) {
    map[loc.id] = loc
  }
  return map
})

function formatDate(date) {
  if (!date) return '—'
  return format(new Date(date), 'yyyy-MM-dd HH:mm')
}

function formatType(type) {
  switch (type) {
    case 'receive': return 'Receive'
    case 'issue': return 'Issue'
    case 'transfer': return 'Transfer'
    case 'adjustment': return 'Adjustment'
    case 'count': return 'Count'
    case 'voided': return 'Voided'
    default: return type
  }
}

function formatCurrency(value) {
  if (typeof value !== 'number') return '—'
  return value.toLocaleString(undefined, { style: 'currency', currency: 'KES' })
}

const pageSize = 20
const pageStart = computed(() => (props.currentPage - 1) * pageSize + 1)
const pageEnd = computed(() => Math.min(props.currentPage * pageSize, props.totalCount))
</script>