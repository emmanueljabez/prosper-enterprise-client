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
                @click="sortBy('name')"
              >
                Name & Description
                <ArrowUpIcon
                  v-if="sortConfig.key === 'name' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'name' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>Scope</TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('thresholdValue')"
              >
                Threshold 
                <ArrowUpIcon
                  v-if="sortConfig.key === 'thresholdValue' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'thresholdValue' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>Reorder Quantity</TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('isActive')"
              >
                Status 
                <ArrowUpIcon
                  v-if="sortConfig.key === 'isActive' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'isActive' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>Auto-order</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="loading" class="h-24">
            <TableCell colSpan="7" class="text-center">
              <Loader2Icon class="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
              <div class="mt-2 text-sm text-muted-foreground">Loading reorder rules...</div>
            </TableCell>
          </TableRow>
          <TableRow v-else-if="paginatedRules.length === 0" class="h-24">
            <TableCell colSpan="7" class="text-center">
              <div class="flex flex-col items-center justify-center">
                <ListTodoIcon class="h-10 w-10 text-muted-foreground" />
                <div class="mt-2">No reorder rules found</div>
                <div class="mt-1 text-sm text-muted-foreground">
                  Create a new reorder rule to automate your inventory management
                </div>
              </div>
            </TableCell>
          </TableRow>
          <TableRow 
            v-for="rule in paginatedRules" 
            :key="rule.id"
            :class="{ 'bg-muted/40': !rule.isActive }"
          >
            <TableCell>
              <div class="font-medium">{{ rule.name }}</div>
              <div class="text-xs text-muted-foreground">{{ rule.description }}</div>
            </TableCell>
            <TableCell>
              <div class="text-sm">
                <span v-if="rule.applyToAllItems && rule.applyToAllLocations && rule.applyToAllCategories">Global Rule</span>
                <span v-else>
                  <div v-if="!rule.applyToAllItems && rule.itemId">Item: {{ getItemName(rule.itemId) }}</div>
                  <div v-if="!rule.applyToAllCategories && rule.categoryId">Category: {{ getCategoryName(rule.categoryId) }}</div>
                  <div v-if="!rule.applyToAllLocations && rule.locationId">Location: {{ getLocationName(rule.locationId) }}</div>
                  <div v-if="rule.applyToAllItems">All Items</div>
                  <div v-if="rule.applyToAllCategories">All Categories</div>
                  <div v-if="rule.applyToAllLocations">All Locations</div>
                </span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">
                {{ formatThresholdType(rule.thresholdType) }}: {{ formatThresholdValue(rule) }}
              </Badge>
            </TableCell>
            <TableCell>
              {{ formatReorderQuantity(rule) }}
            </TableCell>
            <TableCell>
              <Badge :variant="rule.isActive ? 'success' : 'secondary'">
                {{ rule.isActive ? 'Active' : 'Inactive' }}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge :variant="rule.autoCreateOrder ? 'default' : 'outline'">
                {{ rule.autoCreateOrder ? 'Yes' : 'No' }}
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
                  <DropdownMenuItem @click="editRule(rule)">
                    <EditIcon class="mr-2 h-4 w-4" />
                    <span>Edit Rule</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="toggleStatus(rule)">
                    <PowerIcon class="mr-2 h-4 w-4" />
                    <span>{{ rule.isActive ? 'Deactivate' : 'Activate' }}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    @click="deleteRule(rule)"
                    class="text-destructive focus:text-destructive"
                  >
                    <Trash2Icon class="mr-2 h-4 w-4" />
                    <span>Delete Rule</span>
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
        {{ Math.min(pagination.pageSize * pagination.page, filteredRules.length) }}
        of {{ filteredRules.length }} rules
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
import {
  ArrowDownIcon,
  ArrowUpIcon,
  EditIcon,
  ListTodoIcon,
  Loader2Icon,
  MoreHorizontalIcon,
  PowerIcon,
  Trash2Icon
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
  rules: { type: Array, required: true },
  categories: { type: Array, default: () => [] },
  locations: { type: Array, default: () => [] },
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits([
  'edit-rule', 
  'delete-rule', 
  'toggle-status', 
  'refresh'
])

// Local state
const sortConfig = ref({
  key: 'name',
  direction: 'asc'
})

const pagination = ref({
  page: 1,
  pageSize: 10
})

// Search and filtering
const searchQuery = ref('')

// Computed properties
// Helper mappings
const categoriesMap = computed(() => {
  const map = {}
  props.categories.forEach(cat => {
    map[cat.id] = cat
  })
  return map
})

const locationsMap = computed(() => {
  const map = {}
  props.locations.forEach(loc => {
    map[loc.id] = loc
  })
  return map
})

const itemsMap = computed(() => {
  const map = {}
  props.items.forEach(item => {
    map[item.id] = item
  })
  return map
})

// Sort and filter rules
const filteredRules = computed(() => {
  let result = [...props.rules]
  
  // Apply search filter if needed
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(rule => 
      rule.name.toLowerCase().includes(query) || 
      (rule.description && rule.description.toLowerCase().includes(query))
    )
  }
  
  // Apply sorting
  result.sort((a, b) => {
    let valueA = a[sortConfig.value.key]
    let valueB = b[sortConfig.value.key]
    
    // Handle special cases for sorting
    if (typeof valueA === 'string') {
      valueA = valueA.toLowerCase()
      valueB = valueB.toLowerCase()
    }
    
    // For descending order, swap the comparison
    const comparison = valueA > valueB ? 1 : -1
    return sortConfig.value.direction === 'desc' ? comparison * -1 : comparison
  })
  
  return result
})

const paginatedRules = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return filteredRules.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredRules.value.length / pagination.value.pageSize)
})

// Reset pagination when filters change
watch([searchQuery, props.rules], () => {
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

const formatThresholdType = (type) => {
  switch (type) {
    case 'absolute': return 'Absolute'
    case 'percentage': return 'Percentage'
    case 'dynamic': return 'Dynamic'
    default: return type
  }
}

const formatThresholdValue = (rule) => {
  if (rule.thresholdType === 'percentage') {
    return `${rule.thresholdValue}%`
  }
  return rule.thresholdValue
}

const formatReorderQuantity = (rule) => {
  switch (rule.reorderQuantityType) {
    case 'fixed':
      return `${rule.reorderQuantityValue} units`
    case 'economic_order_quantity':
      return 'Economic Order Quantity'
    case 'days_of_supply':
      return `${rule.reorderQuantityValue} days supply`
    default:
      return rule.reorderQuantityValue || 'Default'
  }
}

const getLocationName = (locationId) => {
  return locationsMap.value[locationId]?.name || locationId || '—'
}

const getCategoryName = (categoryId) => {
  return categoriesMap.value[categoryId]?.name || categoryId || '—'
}

const getItemName = (itemId) => {
  return itemsMap.value[itemId]?.name || itemId || '—'
}

// Event handlers
const editRule = (rule) => {
  emit('edit-rule', rule)
}

const deleteRule = (rule) => {
  emit('delete-rule', rule)
}

const toggleStatus = (rule) => {
  emit('toggle-status', rule)
}
</script>