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
                @click="sortBy('itemName')"
              >
                Item 
                <ArrowUpIcon
                  v-if="sortConfig.key === 'itemName' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'itemName' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>Location</TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('currentStock')"
              >
                Current Stock
                <ArrowUpIcon
                  v-if="sortConfig.key === 'currentStock' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'currentStock' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>Suggested Qty</TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('priority')"
              >
                Priority
                <ArrowUpIcon
                  v-if="sortConfig.key === 'priority' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'priority' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>Est. Cost</TableHead>
            <TableHead>Rule</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="loading" class="h-24">
            <TableCell colSpan="8" class="text-center">
              <Loader2Icon class="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
              <div class="mt-2 text-sm text-muted-foreground">Loading suggested reorders...</div>
            </TableCell>
          </TableRow>
          <TableRow v-else-if="paginatedReorders.length === 0" class="h-24">
            <TableCell colSpan="8" class="text-center">
              <div class="flex flex-col items-center justify-center">
                <CheckCircleIcon class="h-10 w-10 text-muted-foreground" />
                <div class="mt-2">No reorders needed at this time</div>
                <div class="mt-1 text-sm text-muted-foreground">
                  All inventory levels are above the reorder thresholds
                </div>
              </div>
            </TableCell>
          </TableRow>
          <TableRow 
            v-for="reorder in paginatedReorders" 
            :key="reorder.id"
            :class="{ 'bg-muted/40': reorder.isIgnored }"
          >
            <TableCell>
              <div class="font-medium">{{ reorder.itemName }}</div>
              <div class="text-xs text-muted-foreground">SKU: {{ reorder.sku }}</div>
            </TableCell>
            <TableCell>{{ reorder.locationName }}</TableCell>
            <TableCell>
              <div class="flex items-center space-x-2">
                <span>{{ reorder.currentStock }}</span>
                <Badge variant="outline">
                  Reorder pt: {{ reorder.reorderPoint }}
                </Badge>
              </div>
            </TableCell>
            <TableCell>
              {{ reorder.suggestedQuantity }}
            </TableCell>
            <TableCell>
              <Badge :variant="getPriorityVariant(reorder.priority)">
                {{ formatPriority(reorder.priority) }}
              </Badge>
            </TableCell>
            <TableCell>{{ formatCurrency(reorder.estimatedCost) }}</TableCell>
            <TableCell>
              <div class="text-xs">
                {{ reorder.ruleName || 'Auto-generated' }}
              </div>
            </TableCell>
            <TableCell class="text-right">
              <div class="flex justify-end space-x-1">
                <Tooltip v-if="!reorder.isIgnored">
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" @click="createOrder(reorder)">
                      <ShoppingCartIcon class="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Create Order</TooltipContent>
                </Tooltip>
                
                <Tooltip v-if="!reorder.isIgnored">
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" @click="openIgnoreDialog(reorder)">
                      <XIcon class="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Ignore Suggestion</TooltipContent>
                </Tooltip>
                
                <Tooltip v-if="reorder.isIgnored">
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" @click="unignoreSuggestion(reorder)">
                      <RefreshCwIcon class="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Restore Suggestion</TooltipContent>
                </Tooltip>
                
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontalIcon class="h-4 w-4" />
                      <span class="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @click="viewItemDetails(reorder)">
                      <SearchIcon class="mr-2 h-4 w-4" />
                      <span>View Item Details</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="viewLocationStock(reorder)">
                      <MapPinIcon class="mr-2 h-4 w-4" />
                      <span>View Location Stock</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator v-if="reorder.ruleName"/>
                    <DropdownMenuItem 
                      v-if="reorder.ruleName"
                      @click="viewRule(reorder)"
                    >
                      <ListTodoIcon class="mr-2 h-4 w-4" />
                      <span>View Trigger Rule</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between">
      <div class="text-sm text-muted-foreground">
        Showing {{ pagination.pageSize * (pagination.page - 1) + 1 }} to
        {{ Math.min(pagination.pageSize * pagination.page, filteredReorders.length) }}
        of {{ filteredReorders.length }} reorder suggestions
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

    <!-- Ignore Dialog -->
    <Dialog :open="ignoreDialogOpen" @update:open="ignoreDialogOpen = $event">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ignore Reorder Suggestion</DialogTitle>
          <DialogDescription>
            This suggestion will be hidden from the list. You can restore it later if needed.
          </DialogDescription>
        </DialogHeader>
        
        <div class="py-4 space-y-4">
          <div class="flex flex-col space-y-1.5">
            <Label for="ignoreReason">Reason for ignoring (optional)</Label>
            <Textarea
              id="ignoreReason"
              v-model="ignoreReason"
              placeholder="Enter reason for ignoring this suggestion"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" @click="ignoreDialogOpen = false">Cancel</Button>
          <Button @click="ignoreSuggestion">Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckCircleIcon,
  Loader2Icon,
  MapPinIcon,
  MoreHorizontalIcon,
  RefreshCwIcon,
  SearchIcon,
  ShoppingCartIcon,
  XIcon,
  ListTodoIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'

const props = defineProps({
  suggestedReorders: { type: Array, required: true },
  categories: { type: Array, default: () => [] },
  locations: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  includeIgnored: { type: Boolean, default: false }
})

const emit = defineEmits([
  'create-order',
  'ignore-suggestion',
  'unignore-suggestion',
  'view-item',
  'view-location',
  'view-rule',
  'refresh'
])

// Local state
const sortConfig = ref({
  key: 'priority',
  direction: 'asc'  // Start with highest priority first
})

const pagination = ref({
  page: 1,
  pageSize: 10
})

// Search and filtering
const searchQuery = ref('')
const showIgnored = ref(props.includeIgnored)

// Ignore dialog
const ignoreDialogOpen = ref(false)
const ignoreReason = ref('')
const selectedReorder = ref(null)

// Sort and filter reorders
const filteredReorders = computed(() => {
  let result = [...props.suggestedReorders]
  
  // Filter out ignored suggestions if not showing them
  if (!showIgnored.value) {
    result = result.filter(reorder => !reorder.isIgnored)
  }
  
  // Apply search filter if needed
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(reorder => 
      reorder.itemName.toLowerCase().includes(query) || 
      reorder.sku.toLowerCase().includes(query) ||
      (reorder.locationName && reorder.locationName.toLowerCase().includes(query))
    )
  }
  
  // Apply sorting
  result.sort((a, b) => {
    let valueA = a[sortConfig.value.key]
    let valueB = b[sortConfig.value.key]
    
    // Special handling for priority
    if (sortConfig.value.key === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      valueA = priorityOrder[a.priority] || 999
      valueB = priorityOrder[b.priority] || 999
    }
    
    // Handle special cases for sorting strings
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      valueA = valueA.toLowerCase()
      valueB = valueB.toLowerCase()
    }
    
    // For descending order, swap the comparison
    const comparison = valueA > valueB ? 1 : -1
    return sortConfig.value.direction === 'desc' ? comparison * -1 : comparison
  })
  
  return result
})

const paginatedReorders = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return filteredReorders.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredReorders.value.length / pagination.value.pageSize)
})

// Reset pagination when filters change
watch([searchQuery, showIgnored, props.suggestedReorders], () => {
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

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD' 
  }).format(value)
}

const formatPriority = (priority) => {
  return priority.charAt(0).toUpperCase() + priority.slice(1)
}

const getPriorityVariant = (priority) => {
  switch (priority) {
    case 'high': return 'destructive'
    case 'medium': return 'warning'
    case 'low': return 'default'
    default: return 'outline'
  }
}

// Action handlers
const createOrder = (reorder) => {
  emit('create-order', reorder)
}

const openIgnoreDialog = (reorder) => {
  selectedReorder.value = reorder
  ignoreReason.value = ''
  ignoreDialogOpen.value = true
}

const ignoreSuggestion = () => {
  if (selectedReorder.value) {
    emit('ignore-suggestion', selectedReorder.value, ignoreReason.value)
    ignoreDialogOpen.value = false
  }
}

const unignoreSuggestion = (reorder) => {
  emit('unignore-suggestion', reorder)
}

const viewItemDetails = (reorder) => {
  emit('view-item', reorder.itemId)
}

const viewLocationStock = (reorder) => {
  emit('view-location', reorder.locationId)
}

const viewRule = (reorder) => {
  if (reorder.triggeredByRuleId) {
    emit('view-rule', reorder.triggeredByRuleId)
  }
}
</script>