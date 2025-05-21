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

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Search -->
            <div class="relative">
              <SearchIcon class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                v-model="filters.search"
                placeholder="Search lead sources..."
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
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Lead Sources Table -->
    <Card>
      <CardContent class="p-0">
        <div class="relative w-full overflow-auto">
          <table class="w-full caption-bottom text-sm">
            <thead class="[&_tr]:border-b">
              <tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th class="h-12 px-4 text-left align-middle font-medium">
                  <div class="flex items-center space-x-2" @click="toggleSort('name')">
                    <span>Lead Source Name</span>
                    <ArrowUpDownIcon v-if="filters.sortBy !== 'nameAsc' && filters.sortBy !== 'nameDesc'" class="h-4 w-4" />
                    <ArrowDownIcon v-if="filters.sortBy === 'nameAsc'" class="h-4 w-4" />
                    <ArrowUpIcon v-if="filters.sortBy === 'nameDesc'" class="h-4 w-4" />
                  </div>
                </th>
                <th class="h-12 px-4 text-left align-middle font-medium">
                  <div class="flex items-center space-x-2">
                    <span>Description</span>
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
                  <div class="flex items-center space-x-2" @click="toggleSort('created')">
                    <span>Created Date</span>
                    <ArrowUpDownIcon v-if="filters.sortBy !== 'createdAsc' && filters.sortBy !== 'createdDesc'" class="h-4 w-4" />
                    <ArrowDownIcon v-if="filters.sortBy === 'createdAsc'" class="h-4 w-4" />
                    <ArrowUpIcon v-if="filters.sortBy === 'createdDesc'" class="h-4 w-4" />
                  </div>
                </th>
                <th class="h-12 px-4 text-right align-middle font-medium">
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody class="[&_tr:last-child]:border-0">
              <template v-if="loading">
                <tr v-for="i in 5" :key="`skeleton-${i}`" class="border-b transition-colors">
                  <td class="p-4" v-for="j in 5" :key="`cell-${i}-${j}`">
                    <Skeleton class="h-5 w-full" />
                  </td>
                </tr>
              </template>
              <template v-else-if="filteredLeadSources.length === 0">
                <tr>
                  <td colspan="5" class="p-4 text-center text-muted-foreground">
                    No lead sources found.
                  </td>
                </tr>
              </template>
              <template v-else>
                <tr
                  v-for="leadSource in filteredLeadSources"
                  :key="leadSource.id"
                  class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                >
                  <td class="p-4 font-medium">{{ leadSource.name }}</td>
                  <td class="p-4">{{ leadSource.description }}</td>
                  <td class="p-4">
                    <Badge :variant="getStatusVariant(leadSource.status)">
                      {{ formatStatus(leadSource.status) }}
                    </Badge>
                  </td>
                  <td class="p-4">{{ formatDate(leadSource.created) }}</td>
                  <td class="p-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontalIcon class="h-4 w-4" />
                          <span class="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem @click="viewLeadSource(leadSource)">
                          <EyeIcon class="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem @click="editLeadSource(leadSource)">
                          <EditIcon class="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          @click="deleteLeadSource(leadSource)"
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
import { format, parseISO } from 'date-fns'
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
  PlusIcon
} from 'lucide-vue-next'

const props = defineProps({
  leadSources: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'view-leadSource',
  'edit-leadSource',
  'delete-leadSource',
  'refresh',
  'add-leadSource'
])

// Filters state
const filters = ref({
  search: '',
  status: 'all',
  sortBy: 'nameAsc'
})

// Toggle sort order
function toggleSort(field) {
  const currentSort = filters.value.sortBy

  switch (field) {
    case 'name':
      filters.value.sortBy = currentSort === 'nameAsc' ? 'nameDesc' : 'nameAsc'
      break
    case 'status':
      filters.value.sortBy = currentSort === 'statusAsc' ? 'statusDesc' : 'statusAsc'
      break
    case 'created':
      filters.value.sortBy = currentSort === 'createdAsc' ? 'createdDesc' : 'createdAsc'
      break
  }
}

// Filtered and sorted leadSources
const filteredLeadSources = computed(() => {
  let result = [...props.leadSources]

  // Apply search filter
  if (filters.value.search) {
    const searchLower = filters.value.search.toLowerCase()
    result = result.filter(source => 
      source.name.toLowerCase().includes(searchLower) ||
      (source.description && source.description.toLowerCase().includes(searchLower))
    )
  }

  // Apply status filter
  if (filters.value.status !== 'all') {
    result = result.filter(source => source.status.toLowerCase() === filters.value.status.toLowerCase())
  }

  // Apply sorting
  result.sort((a, b) => {
    switch (filters.value.sortBy) {
      case 'nameAsc':
        return a.name.localeCompare(b.name)
      case 'nameDesc':
        return b.name.localeCompare(a.name)
      case 'statusAsc':
        return a.status.localeCompare(b.status)
      case 'statusDesc':
        return b.status.localeCompare(a.status)
      case 'createdAsc':
        return new Date(a.created) - new Date(b.created)
      case 'createdDesc':
        return new Date(b.created) - new Date(a.created)
      default:
        return a.name.localeCompare(b.name)
    }
  })

  return result
})


function formatDate(date) {
  if (!date) return ''
  return format(new Date(date), 'MMM dd, yyyy')
}

function formatStatus(status) {
    if (!status) return ''
    
    return status.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
  }
function getStatusVariant(status) {
    if (status === 'ACTIVE') return 'success'
    if (status === 'NOT_ACTIVE') return 'warning'
    if (status === 'PLANNED') return 'warning'    
    return 'default'
  }


function viewLeadSource(leadSource) {
  emit('view-leadSource', leadSource)
}

function editLeadSource(leadSource) {
  emit('edit-leadSource', leadSource)
}

function deleteLeadSource(leadSource) {
  emit('delete-leadSource', leadSource)
}

function resetFilters() {
  filters.value = {
    search: '',
    status: 'all',
    sortBy: 'nameAsc'
  }
}


watch(filters, () => {
  emit('refresh')
}, { deep: true })
</script>