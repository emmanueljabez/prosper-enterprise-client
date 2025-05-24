<template>
  <Card>
    <CardHeader>
      <div class="flex items-center justify-between">
        <div>
          <CardTitle>Sync Rules</CardTitle>
          <CardDescription>Manage how inventory changes are synchronized with the product catalog</CardDescription>
        </div>
        <div class="flex space-x-2">
          <Button variant="outline" size="sm" @click="$emit('refresh')">
            <RefreshCcw class="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Input 
            placeholder="Filter rules..." 
            class="w-60"
            v-model="filterText"
            @input="filterRules"
          />
        </div>
      </div>
      <div class="flex justify-between items-center w-full mt-4">
        <div class="text-sm text-muted-foreground">
          {{ selectedRules.length > 0 ? `${selectedRules.length} rule(s) selected` : `${filteredRules.length} rules` }}
        </div>
        <div class="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            :disabled="selectedRules.length === 0"
            @click="bulkEdit"
          >
            <PencilIcon class="h-4 w-4 mr-2" />
            Bulk Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            :disabled="selectedRules.length === 0"
            @click="bulkDelete"
          >
            <TrashIcon class="h-4 w-4 mr-2" />
            Delete Selected
          </Button>
        </div>
      </div>
    </CardHeader>

    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-[50px]">
              <Checkbox 
                :checked="isAllSelected" 
                @change="toggleSelectAll"
              />
            </TableHead>
            <TableHead @click="sortBy('name')" class="cursor-pointer">
              Name
              <ArrowUpDown v-if="sortColumn === 'name'" class="h-4 w-4 inline ml-1" :class="{ 'rotate-180': sortDirection === 'desc' }" />
            </TableHead>
            <TableHead>Scope</TableHead>
            <TableHead @click="sortBy('triggerType')" class="cursor-pointer">
              Trigger Type
              <ArrowUpDown v-if="sortColumn === 'triggerType'" class="h-4 w-4 inline ml-1" :class="{ 'rotate-180': sortDirection === 'desc' }" />
            </TableHead>
            <TableHead @click="sortBy('priority')" class="cursor-pointer">
              Priority
              <ArrowUpDown v-if="sortColumn === 'priority'" class="h-4 w-4 inline ml-1" :class="{ 'rotate-180': sortDirection === 'desc' }" />
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead @click="sortBy('updatedAt')" class="cursor-pointer">
              Last Updated
              <ArrowUpDown v-if="sortColumn === 'updatedAt'" class="h-4 w-4 inline ml-1" :class="{ 'rotate-180': sortDirection === 'desc' }" />
            </TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody v-if="!loading">
          <TableRow 
            v-for="rule in paginatedRules" 
            :key="rule.id"
            :class="{ 'bg-muted/50': selectedRules.includes(rule.id) }"
          >
            <TableCell>
              <Checkbox 
                :checked="selectedRules.includes(rule.id)" 
                @change="toggleSelectRule(rule.id)"
              />
            </TableCell>
            <TableCell class="font-medium">{{ rule.name }}</TableCell>
            <TableCell>{{ formatScope(rule.scope, rule) }}</TableCell>
            <TableCell>
              <Badge :variant="getTriggerBadgeVariant(rule.triggerType)">
                {{ formatTriggerType(rule.triggerType) }}
              </Badge>
            </TableCell>
            <TableCell>{{ rule.priority }}</TableCell>
            <TableCell>
              <Badge :variant="rule.active ? 'success' : 'secondary'">
                {{ rule.active ? 'Active' : 'Inactive' }}
              </Badge>
            </TableCell>
            <TableCell>{{ formatDate(rule.updatedAt) }}</TableCell>
            <TableCell class="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal class="h-4 w-4" />
                    <span class="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="$emit('view-rule', rule)">
                    <EyeIcon class="mr-2 h-4 w-4" />
                    <span>View Details</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="$emit('edit-rule', rule)">
                    <PencilIcon class="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="$emit('update-status', rule)">
                    <TagIcon class="mr-2 h-4 w-4" />
                    <span>Update Status</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="$emit('duplicate-rule', rule)">
                    <CopyIcon class="mr-2 h-4 w-4" />
                    <span>Duplicate</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="$emit('delete-rule', rule)" class="text-destructive focus:text-destructive">
                    <TrashIcon class="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
          <TableRow v-if="filteredRules.length === 0">
            <TableCell colspan="8" class="text-center py-6 text-muted-foreground">
              No rules found. Create your first rule to get started.
            </TableCell>
          </TableRow>
        </TableBody>
        <TableBody v-else>
          <TableRow v-for="i in 5" :key="i">
            <TableCell v-for="j in 8" :key="j">
              <Skeleton class="h-4 w-full" />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <!-- Pagination -->
      <div class="flex items-center justify-between mt-4">
        <div class="text-sm text-muted-foreground">
          Showing {{ paginationStart }} to {{ paginationEnd }} of {{ filteredRules.length }} rules
        </div>
        <div class="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            :disabled="currentPage >= totalPages"
            @click="currentPage++"
          >
            Next
          </Button>
        </div>
      </div>
    </CardContent>
    
  </Card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { format } from 'date-fns'
import { 
  RefreshCcw, MoreHorizontal, ArrowUpDown,
  EyeIcon, PencilIcon, TrashIcon, TagIcon, CopyIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table'
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'

const props = defineProps({
  rules: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'view-rule', 
  'edit-rule', 
  'duplicate-rule', 
  'delete-rule', 
  'update-status', 
  'refresh', 
  'bulk-edit',
  'bulk-delete'
])

// Local state
const selectedRules = ref([])
const filterText = ref('')
const filteredRules = ref([])
const sortColumn = ref('priority')
const sortDirection = ref('desc')
const currentPage = ref(1)
const pageSize = ref(10)

// Watch for changes in props.rules
watch(() => props.rules, () => {
  filterRules()
  sortRules()
}, { immediate: true })

// Watch for changes in filters and sort
watch([filterText, sortColumn, sortDirection], () => {
  filterRules()
  sortRules()
  currentPage.value = 1 // Reset to first page on filter/sort change
})

// Computed properties
const isAllSelected = computed(() => {
  return filteredRules.value.length > 0 && selectedRules.value.length === filteredRules.value.length
})

const totalPages = computed(() => {
  return Math.ceil(filteredRules.value.length / pageSize.value)
})

const paginatedRules = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredRules.value.slice(start, end)
})

const paginationStart = computed(() => {
  return filteredRules.value.length === 0 
    ? 0 
    : (currentPage.value - 1) * pageSize.value + 1
})

const paginationEnd = computed(() => {
  return Math.min(currentPage.value * pageSize.value, filteredRules.value.length)
})

// Methods
function filterRules() {
  if (!filterText.value.trim()) {
    filteredRules.value = [...props.rules]
    return
  }
  
  const searchText = filterText.value.toLowerCase()
  filteredRules.value = props.rules.filter(rule => {
    return (
      rule.name.toLowerCase().includes(searchText) ||
      rule.description?.toLowerCase().includes(searchText) ||
      formatTriggerType(rule.triggerType).toLowerCase().includes(searchText) ||
      formatScope(rule.scope, rule).toLowerCase().includes(searchText)
    )
  })
}

function sortRules() {
  filteredRules.value.sort((a, b) => {
    let valueA, valueB
    
    // Extract the values to compare based on the sort column
    switch (sortColumn.value) {
      case 'name':
        valueA = a.name.toLowerCase()
        valueB = b.name.toLowerCase()
        break
      case 'priority':
        valueA = a.priority
        valueB = b.priority
        break
      case 'triggerType':
        valueA = a.triggerType
        valueB = b.triggerType
        break
      case 'updatedAt':
        valueA = new Date(a.updatedAt).getTime()
        valueB = new Date(b.updatedAt).getTime()
        break
      default:
        valueA = a[sortColumn.value]
        valueB = b[sortColumn.value]
    }
    
    // Compare the values
    if (valueA < valueB) {
      return sortDirection.value === 'asc' ? -1 : 1
    }
    if (valueA > valueB) {
      return sortDirection.value === 'asc' ? 1 : -1
    }
    return 0
  })
}

function sortBy(column) {
  if (sortColumn.value === column) {
    // Toggle direction if clicking the same column
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    // Set new column and default to ascending
    sortColumn.value = column
    sortDirection.value = 'asc'
  }
}

function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedRules.value = []
  } else {
    selectedRules.value = filteredRules.value.map(rule => rule.id)
  }
}

function toggleSelectRule(ruleId) {
  const index = selectedRules.value.indexOf(ruleId)
  if (index === -1) {
    selectedRules.value.push(ruleId)
  } else {
    selectedRules.value.splice(index, 1)
  }
}

function formatDate(dateString) {
  try {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a')
  } catch (e) {
    return dateString
  }
}

function formatScope(scope, rule) {
  switch (scope) {
    case 'global':
      return 'Global'
    case 'category':
      return `Category (${rule.categoryIds?.length || 0})`
    case 'product':
      return `Product (${rule.productIds?.length || 0})`
    case 'item':
      return `Item (${rule.itemIds?.length || 0})`
    default:
      return scope
  }
}

function formatTriggerType(triggerType) {
  switch (triggerType) {
    case 'stock_change':
      return 'Stock Change'
    case 'threshold':
      return 'Threshold'
    case 'scheduled':
      return 'Scheduled'
    case 'manual':
      return 'Manual'
    default:
      return triggerType
  }
}

function getTriggerBadgeVariant(triggerType) {
  switch (triggerType) {
    case 'stock_change':
      return 'default'
    case 'threshold':
      return 'warning'
    case 'scheduled':
      return 'info'
    case 'manual':
      return 'secondary'
    default:
      return 'outline'
  }
}

function bulkEdit() {
  const selectedRulesList = props.rules.filter(rule => selectedRules.value.includes(rule.id))
  emit('bulk-edit', selectedRulesList)
}

function bulkDelete() {
  const selectedRulesList = props.rules.filter(rule => selectedRules.value.includes(rule.id))
  emit('bulk-delete', selectedRulesList)
}
</script>