<template>
  <DialogContent class="max-w-4xl max-h-[90vh] overflow-hidden">
    <DialogHeader>
      <DialogTitle class="flex items-center space-x-2">
        <History class="h-5 w-5" />
        <span>Stock Movement History</span>
      </DialogTitle>
      <DialogDescription>
        View all stock movements for {{ item?.name || 'selected item' }}
      </DialogDescription>
    </DialogHeader>

    <div v-if="item" class="space-y-4">
      <!-- Item Summary -->
      <div class="bg-muted/50 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-semibold">{{ item.name }}</h3>
            <p class="text-sm text-muted-foreground">{{ item.itemCode }}</p>
          </div>
          <div class="text-right">
            <div class="text-lg font-semibold">{{ formatNumber(item.stockOnHand || 0) }}</div>
            <div class="text-sm text-muted-foreground">Current Stock</div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-4">
        <div class="flex-1 min-w-[200px]">
          <Select v-model="filters.movementType">
            <SelectTrigger>
              <SelectValue placeholder="All Movement Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">All Movement Types</SelectItem>
              <SelectItem value="STOCK_IN">Stock In</SelectItem>
              <SelectItem value="STOCK_OUT">Stock Out</SelectItem>
              <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
              <SelectItem value="TRANSFER">Transfer</SelectItem>
              <SelectItem value="COUNT">Cycle Count</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="flex-1 min-w-[200px]">
          <Input
            v-model="filters.dateFrom"
            type="date"
            placeholder="From Date"
          />
        </div>
        <div class="flex-1 min-w-[200px]">
          <Input
            v-model="filters.dateTo"
            type="date"
            placeholder="To Date"
          />
        </div>
        <Button variant="outline" size="sm" @click="clearFilters">
          <X class="h-4 w-4 mr-2" />
          Clear
        </Button>
      </div>

      <!-- Stock Movements Table -->
      <div class="border rounded-lg max-h-[50vh] overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-[120px]">Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead class="text-right">Quantity</TableHead>
              <TableHead class="text-right">Balance</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead class="text-right">Unit Cost</TableHead>
              <TableHead>User</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="loading">
              <TableCell colspan="8" class="h-24 text-center">
                <div class="flex items-center justify-center">
                  <Loader2 class="h-4 w-4 animate-spin mr-2" />
                  Loading stock history...
                </div>
              </TableCell>
            </TableRow>
            <TableRow v-else-if="filteredMovements.length === 0">
              <TableCell colspan="8" class="h-24 text-center text-muted-foreground">
                No stock movements found for the selected criteria.
              </TableCell>
            </TableRow>
            <TableRow 
              v-else
              v-for="movement in filteredMovements" 
              :key="movement.id"
              class="hover:bg-muted/50"
            >
              <TableCell class="text-sm">
                {{ formatDate(movement.createdAt) }}
              </TableCell>
              <TableCell>
                <div class="flex items-center space-x-2">
                  <div 
                    class="w-2 h-2 rounded-full"
                    :class="getMovementTypeColor(movement.type)"
                  ></div>
                  <Badge :variant="getMovementTypeBadgeVariant(movement.type)">
                    {{ getMovementTypeLabel(movement.type) }}
                  </Badge>
                </div>
              </TableCell>
              <TableCell class="text-right font-medium">
                <span :class="movement.quantity > 0 ? 'text-green-600' : 'text-red-600'">
                  {{ movement.quantity > 0 ? '+' : '' }}{{ formatNumber(movement.quantity) }}
                </span>
              </TableCell>
              <TableCell class="text-right font-medium">
                {{ formatNumber(movement.balanceAfter) }}
              </TableCell>
              <TableCell>
                <span class="text-sm">{{ getReasonLabel(movement.reason) }}</span>
              </TableCell>
              <TableCell>
                <span v-if="movement.reference" class="text-sm text-blue-600">
                  {{ movement.reference }}
                </span>
                <span v-else class="text-sm text-muted-foreground">-</span>
              </TableCell>
              <TableCell class="text-right">
                <span v-if="movement.unitCost" class="text-sm">
                  {{ formatCurrency(movement.unitCost) }}
                </span>
                <span v-else class="text-sm text-muted-foreground">-</span>
              </TableCell>
              <TableCell>
                <span class="text-sm">{{ movement.createdBy || 'System' }}</span>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <!-- Summary Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
        <div class="text-center">
          <div class="text-lg font-semibold text-green-600">+{{ formatNumber(totalStockIn) }}</div>
          <div class="text-sm text-muted-foreground">Total Stock In</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-semibold text-red-600">{{ formatNumber(totalStockOut) }}</div>
          <div class="text-sm text-muted-foreground">Total Stock Out</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-semibold">{{ formatNumber(netMovement) }}</div>
          <div class="text-sm text-muted-foreground">Net Movement</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-semibold">{{ filteredMovements.length }}</div>
          <div class="text-sm text-muted-foreground">Total Movements</div>
        </div>
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" @click="exportHistory">
        <Download class="mr-2 h-4 w-4" />
        Export
      </Button>
      <Button variant="outline" @click="$emit('close')">
        Close
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { History, X, Loader2, Download } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

// Props
const props = defineProps({
  item: {
    type: Object,
    default: () => null
  }
})

// Emits
const emit = defineEmits(['close'])

// State
const loading = ref(false)
const stockMovements = ref([])

const filters = reactive({
  movementType: '',
  dateFrom: '',
  dateTo: ''
})

// Mock data for stock movements
const mockMovements = [
  {
    id: 1,
    type: 'STOCK_IN',
    quantity: 100,
    balanceAfter: 150,
    reason: 'RECEIVED',
    reference: 'PO-001',
    unitCost: 25.50,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
    createdBy: 'John Doe'
  },
  {
    id: 2,
    type: 'STOCK_OUT',
    quantity: -25,
    balanceAfter: 125,
    reason: 'SOLD',
    reference: 'INV-123',
    unitCost: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    createdBy: 'Jane Smith'
  },
  {
    id: 3,
    type: 'ADJUSTMENT',
    quantity: -5,
    balanceAfter: 120,
    reason: 'DAMAGED',
    reference: null,
    unitCost: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    createdBy: 'System'
  },
  {
    id: 4,
    type: 'COUNT',
    quantity: 5,
    balanceAfter: 125,
    reason: 'COUNT_VARIANCE',
    reference: 'CC-001',
    unitCost: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
    createdBy: 'John Doe'
  }
]

// Computed
const filteredMovements = computed(() => {
  let movements = [...stockMovements.value]

  // Filter by movement type
  if (filters.movementType && filters.movementType !== '_all') {
    movements = movements.filter(m => m.type === filters.movementType)
  }

  // Filter by date range
  if (filters.dateFrom) {
    const fromDate = new Date(filters.dateFrom)
    movements = movements.filter(m => new Date(m.createdAt) >= fromDate)
  }

  if (filters.dateTo) {
    const toDate = new Date(filters.dateTo)
    toDate.setHours(23, 59, 59, 999) // End of day
    movements = movements.filter(m => new Date(m.createdAt) <= toDate)
  }

  // Sort by date descending
  return movements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

const totalStockIn = computed(() => {
  return filteredMovements.value
    .filter(m => m.quantity > 0)
    .reduce((total, m) => total + m.quantity, 0)
})

const totalStockOut = computed(() => {
  return filteredMovements.value
    .filter(m => m.quantity < 0)
    .reduce((total, m) => total + Math.abs(m.quantity), 0)
})

const netMovement = computed(() => {
  return filteredMovements.value.reduce((total, m) => total + m.quantity, 0)
})

// Methods
const fetchStockHistory = async () => {
  loading.value = true
  try {
    // In a real app, this would fetch from the API
    // await stockMovementsApi.getMovementsByItem(props.item.id)
    
    // For now, use mock data
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
    stockMovements.value = mockMovements
  } catch (error) {
    console.error('Error fetching stock history:', error)
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  filters.movementType = ''
  filters.dateFrom = ''
  filters.dateTo = ''
}

const getMovementTypeColor = (type) => {
  switch (type) {
    case 'STOCK_IN':
      return 'bg-green-500'
    case 'STOCK_OUT':
      return 'bg-red-500'
    case 'ADJUSTMENT':
      return 'bg-blue-500'
    case 'TRANSFER':
      return 'bg-purple-500'
    case 'COUNT':
      return 'bg-orange-500'
    default:
      return 'bg-gray-500'
  }
}

const getMovementTypeBadgeVariant = (type) => {
  switch (type) {
    case 'STOCK_IN':
      return 'default'
    case 'STOCK_OUT':
      return 'destructive'
    case 'ADJUSTMENT':
      return 'secondary'
    default:
      return 'outline'
  }
}

const getMovementTypeLabel = (type) => {
  switch (type) {
    case 'STOCK_IN':
      return 'Stock In'
    case 'STOCK_OUT':
      return 'Stock Out'
    case 'ADJUSTMENT':
      return 'Adjustment'
    case 'TRANSFER':
      return 'Transfer'
    case 'COUNT':
      return 'Count'
    default:
      return type
  }
}

const getReasonLabel = (reason) => {
  const reasonLabels = {
    'RECEIVED': 'Stock Received',
    'SOLD': 'Stock Sold',
    'DAMAGED': 'Damaged/Spoiled',
    'THEFT': 'Theft/Loss',
    'COUNT_VARIANCE': 'Count Variance',
    'RETURN': 'Customer Return',
    'TRANSFER': 'Warehouse Transfer',
    'CORRECTION': 'Data Correction',
    'OTHER': 'Other'
  }
  return reasonLabels[reason] || reason
}

const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

const formatNumber = (value) => {
  return new Intl.NumberFormat().format(value || 0)
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value || 0)
}

const exportHistory = () => {
  // Implement export functionality
  console.log('Exporting stock history...')
}

// Initialize
onMounted(() => {
  if (props.item) {
    fetchStockHistory()
  }
})
</script>
