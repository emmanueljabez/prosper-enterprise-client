<template>
  <div class="space-y-6">
    <!-- Table Filters -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="space-y-2">
        <Label for="search">Search</Label>
        <Input v-model="filters.search" id="search" placeholder="Name, email, phone..." />
      </div>

      <div class="space-y-2">
        <Label for="status">Status</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
                variant="outline"
                role="combobox"
                class="w-full justify-between"
                :class="filters.status ? 'text-foreground' : 'text-muted-foreground'"
            >
              {{ getStatusLabel(filters.status) }}
              <ChevronDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-full p-0">
            <Command>
              <CommandInput placeholder="Search status..." />
              <CommandEmpty>No status found.</CommandEmpty>
              <CommandGroup>
                <CommandItem @select="() => filters.status = 'all'" :value="'all'">
                  <Check
                      class="mr-2 h-4 w-4"
                      :class="filters.status === 'all' || !filters.status ? 'opacity-100' : 'opacity-0'"
                  />
                  All Statuses
                </CommandItem>
                <CommandItem v-for="status in statuses" :key="status.value" @select="() => filters.status = status.value" :value="status.value">
                  <Check
                      class="mr-2 h-4 w-4"
                      :class="filters.status === status.value ? 'opacity-100' : 'opacity-0'"
                  />
                  {{ status.label }}
                </CommandItem>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div class="space-y-2">
        <Label for="source">Source</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
                variant="outline"
                role="combobox"
                class="w-full justify-between"
                :class="filters.source ? 'text-foreground' : 'text-muted-foreground'"
            >
              {{ getSourceLabel(filters.source) }}
              <ChevronDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-full p-0">
            <Command>
              <CommandInput placeholder="Search source..." />
              <CommandEmpty>No source found.</CommandEmpty>
              <CommandGroup>
                <CommandItem @select="() => filters.source = 'all'" :value="'all'">
                  <Check
                      class="mr-2 h-4 w-4"
                      :class="filters.source === 'all' || !filters.source ? 'opacity-100' : 'opacity-0'"
                  />
                  All Sources
                </CommandItem>
                <CommandItem v-for="source in leadSources" :key="source.id" @select="() => filters.source = source.id" :value="source.id">
                  <Check
                      class="mr-2 h-4 w-4"
                      :class="filters.source === source.id ? 'opacity-100' : 'opacity-0'"
                  />
                  {{ source.name }}
                </CommandItem>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div class="space-y-2">
        <Label for="assignee">Assigned To</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
                variant="outline"
                role="combobox"
                class="w-full justify-between"
                :class="filters.assignee ? 'text-foreground' : 'text-muted-foreground'"
            >
              {{ getAssigneeLabel(filters.assignee) }}
              <ChevronDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-full p-0">
            <Command>
              <CommandInput placeholder="Search assignee..." />
              <CommandEmpty>No assignee found.</CommandEmpty>
              <CommandGroup>
                <CommandItem @select="() => filters.assignee = 'all'" :value="'all'">
                  <Check
                      class="mr-2 h-4 w-4"
                      :class="filters.assignee === 'all' || !filters.assignee ? 'opacity-100' : 'opacity-0'"
                  />
                  All Reps
                </CommandItem>
                <CommandItem @select="() => filters.assignee = 'unassigned'" :value="'unassigned'">
                  <Check
                      class="mr-2 h-4 w-4"
                      :class="filters.assignee === 'unassigned' ? 'opacity-100' : 'opacity-0'"
                  />
                  Unassigned
                </CommandItem>
                <CommandItem v-for="user in users" :key="user.id" @select="() => filters.assignee = user.id" :value="user.id">
                  <Check
                      class="mr-2 h-4 w-4"
                      :class="filters.assignee === user.id ? 'opacity-100' : 'opacity-0'"
                  />
                  {{ user.name }}
                </CommandItem>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>

    <div class="flex items-center justify-between">
      <div class="flex gap-2">
        <Button variant="outline" size="sm" @click="resetFilters">
          <XIcon class="h-4 w-4 mr-1" />
          Clear Filters
        </Button>

        <Button variant="secondary" size="sm" @click="refreshData">
          <RefreshCwIcon class="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>

      <div class="flex items-center gap-2">                
        <div v-if="selectedLeads.length > 0" class="flex items-center gap-2 ml-4">
          <span class="text-sm text-muted-foreground">{{ selectedLeads.length }} selected</span>
          <Button variant="outline" size="sm">
            <Users2Icon class="h-4 w-4 mr-1" />
            Bulk Assign
          </Button>
          <Button variant="outline" size="sm">
            <ClipboardEditIcon class="h-4 w-4 mr-1" />
            Bulk Update
          </Button>
        </div>
      </div>
    </div>

    <!-- Leads Table -->
    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-[40px]">
              <Checkbox
                  :checked="isAllSelected"
                  :indeterminate="isSomeSelected"
                  @update:checked="toggleSelectAll"
              />
            </TableHead>
            <!-- <TableHead>ID</TableHead> -->
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Lead Type</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Source</TableHead>
            <TableHead class="cursor-pointer" @click="sortBy('created')">
              <div class="flex items-center">
                Created
                <ArrowUpIcon
                    v-if="sortConfig.key === 'created' && sortConfig.direction === 'asc'"
                    class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                    v-if="sortConfig.key === 'created' && sortConfig.direction === 'desc'"
                    class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="loading" class="h-24">
            <TableCell colSpan="9" class="text-center">
              <Loader2Icon class="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
              <div class="mt-2 text-sm text-muted-foreground">Loading leads...</div>
            </TableCell>
          </TableRow>
          <TableRow v-else-if="paginatedLeads.length === 0" class="h-24">
            <TableCell colSpan="9" class="text-center">
              <div class="flex flex-col items-center justify-center">
                <InboxIcon class="h-10 w-10 text-muted-foreground" />
                <div class="mt-2">No leads found</div>
                <div class="mt-1 text-sm text-muted-foreground">
                  Try adjusting your filters or add a new lead
                </div>
              </div>
            </TableCell>
          </TableRow>
          <TableRow v-for="lead in paginatedLeads" :key="lead.id">
            <TableCell>
              <Checkbox
                  :checked="selectedLeads.includes(lead.id)"
                  @update:checked="() => toggleLeadSelection(lead.id)"
              />
            </TableCell>
            <!-- <TableCell>{{ lead.id }}</TableCell> -->
            <TableCell>{{ getLeadName(lead) }}</TableCell>
            <TableCell>
              <Badge :variant="getStatusVariant(lead.status)">
                {{ formatStatus(lead.status) }}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge :variant="getLeadTypeVariant(lead.leadType)">
                {{ formatLeadType(lead.leadType) }}
              </Badge>
            </TableCell>
            <TableCell>{{ lead.phone }}</TableCell>
            <TableCell>{{ lead.email }}</TableCell>
            <TableCell>{{ getLeadSourceName(lead) }}</TableCell>
            <TableCell>{{ formatDate(lead.created) }}</TableCell>
            <TableCell class="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontalIcon class="h-4 w-4" />
                    <span class="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="viewLeadDetails(lead)">
                    <EyeIcon class="mr-2 h-4 w-4" />
                    <span>View Details</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="editLead(lead)">
                    <PencilIcon class="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="addNote(lead)">
                    <MessageSquareIcon class="mr-2 h-4 w-4" />
                    <span>Add Note</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="assignLead(lead)">
                    <UserIcon class="mr-2 h-4 w-4" />
                    <span>Assign Lead</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="updateStatus(lead)">
                    <TagIcon class="mr-2 h-4 w-4" />
                    <span>Update Status</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="convertToCustomer(lead)" :disabled="lead.status === 'WON'">
                    <CheckCircleIcon class="mr-2 h-4 w-4" />
                    <span>Convert to Customer</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="markAsLost(lead)" :disabled="lead.status === 'LOST'">
                    <XCircleIcon class="mr-2 h-4 w-4" />
                    <span>Mark as Lost</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="deleteLead(lead)" class="text-destructive focus:text-destructive">
                    <Trash2Icon class="mr-2 h-4 w-4" />
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
        Showing {{ pagination.pageSize * (pagination.page - 1) + 1 }}-{{ Math.min(pagination.pageSize * pagination.page, filteredLeads.length) }} of {{ filteredLeads.length }}
      </div>
      <div class="flex gap-2">
        <Button
            variant="outline"
            size="sm"
            @click="pagination.page--"
            :disabled="pagination.page === 1"
        >
          Previous
        </Button>
        <Button
            variant="outline"
            size="sm"
            @click="pagination.page++"
            :disabled="pagination.page >= totalPages"
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  PlusIcon, XIcon, RefreshCwIcon, Users2Icon, ClipboardEditIcon,
  Loader2Icon, InboxIcon, EyeIcon, PencilIcon, MessageSquareIcon,
  UserIcon, TagIcon, CheckCircleIcon, XCircleIcon, MoreHorizontalIcon,
  ArrowUpIcon, ArrowDownIcon, ChevronDown, Check, Trash2Icon
} from 'lucide-vue-next'
import { useLeadsManagementStore } from '@/store/modules/administration/configuration/sales-settings/leads-management'



const props = defineProps({
  leads: {
    type: Array,
    required: true,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  leadSources: {
    type: Array,
    default: () => []
  },
  users: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'add-lead',
  'view-lead',
  'edit-lead',
  'delete-lead',
  'add-note',
  'refresh',
  'assign-lead',
  'update-status',
  'convert-lead',
  'mark-lost'
])

// Filters
const filters = ref({
  search: '',
  status: 'all',
  source: 'all',
  assignee: 'all'
})

// Pagination
const pagination = ref({
  page: 1,
  pageSize: 10
})

// Sorting
const sortConfig = ref({
  key: 'created',
  direction: 'desc'
})

// Selected leads
const selectedLeads = ref([])

// Status options
const statuses = [
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'QUALIFIED', label: 'Qualified' },
  { value: 'UNQUALIFIED', label: 'Unqualified' },
  { value: 'PROPOSAL', label: 'Proposal' },
  { value: 'NEGOTIATION', label: 'Negotiation' },
  { value: 'WON', label: 'Won' },
  { value: 'LOST', label: 'Lost' }
]

// Helper functions for dropdown labels
function getStatusLabel(value) {
  if (!value || value === 'all') return 'All Statuses'
  const status = statuses.find(s => s.value === value)
  return status ? status.label : 'All Statuses'
}

function getSourceLabel(value) {
  if (!value || value === 'all') return 'All Sources'
  const source = props.leadSources.find(s => s.id === value)
  return source ? source.name : 'All Sources'
}

function getAssigneeLabel(value) {
  if (!value || value === 'all') return 'All Reps'
  if (value === 'unassigned') return 'Unassigned'
  const user = props.users.find(u => u.id === value)
  return user ? user.name : 'All Reps'
}

// Filtered leads
const filteredLeads = computed(() => {
  let result = [...props.leads]

  // Search filter
  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase()
    result = result.filter(lead =>
        (lead.firstName + ' ' + lead.lastName).toLowerCase().includes(searchTerm) ||
        (lead.email || '').toLowerCase().includes(searchTerm) ||
        (lead.phone || '').toLowerCase().includes(searchTerm) ||
        (lead.id?.toString() || '').toLowerCase().includes(searchTerm)
    )
  }

  // Status filter
  if (filters.value.source && filters.value.source !== 'all') {
    result = result.filter(lead => {
      if (lead.leadSource && lead.leadSource.id) {
        return lead.leadSource.id === filters.value.source;
      } else if (lead.sourceId) {
        return lead.sourceId === filters.value.source;
      }
      return false;
    });
  }

  // Assignee filter
  if (filters.value.assignee && filters.value.assignee !== 'all') {
    if (filters.value.assignee === 'unassigned') {
      result = result.filter(lead => !lead.assigneeId)
    } else {
      result = result.filter(lead => lead.assigneeId === filters.value.assignee)
    }
  }

  // Sorting
  result.sort((a, b) => {
    const aValue = sortConfig.value.key === 'created'
        ? new Date(a.created || 0).getTime()
        : a[sortConfig.value.key]
    const bValue = sortConfig.value.key === 'created'
        ? new Date(b.created || 0).getTime()
        : b[sortConfig.value.key]

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.value.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
    }

    return sortConfig.value.direction === 'asc'
        ? aValue - bValue
        : bValue - aValue
  })

  return result
})

// Helper computed properties
const paginatedLeads = computed(() => {
  const startIndex = (pagination.value.page - 1) * pagination.value.pageSize
  const endIndex = startIndex + pagination.value.pageSize
  return filteredLeads.value.slice(startIndex, endIndex)
})

const totalPages = computed(() =>
    Math.max(1, Math.ceil(filteredLeads.value.length / pagination.value.pageSize))
)

const isAllSelected = computed(() =>
    filteredLeads.value.length > 0 && selectedLeads.value.length === filteredLeads.value.length
)

const isSomeSelected = computed(() =>
    selectedLeads.value.length > 0 && selectedLeads.value.length < filteredLeads.value.length
)

// Utility functions
function formatDate(dateString) {
  if (!dateString) return ''
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    return format(date, 'dd MMM yyyy')
  } catch (error) {
    console.error('Date formatting error:', error)
    return dateString
  }
}

function formatStatus(status) {
  if (!status) return 'New'
  
  // Map statuses to readable formats
  const statusMap = {
    'NEW': 'New', 
    'CONTACTED': 'Contacted',
    'QUALIFIED': 'Qualified',
    'UNQUALIFIED': 'Unqualified',
    'PROPOSAL': 'Proposal',
    'NEGOTIATION': 'Negotiation',
    'WON': 'Won',
    'LOST': 'Lost'
  }
  
  return statusMap[status] || status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function formatLeadType(type) {
  if (!type) return 'Unknown'
  const types = {
    'INDIVIDUAL': 'Individual',
    'BUSINESS': 'Business'
  }
  return types[type] || type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function getLeadName(lead) {
  let name = '';
  if (lead.firstName) name += lead.firstName;
  if (lead.lastName) name += (name ? ' ' : '') + lead.lastName;
  if (lead.companyName && lead.leadType === 'BUSINESS') {
    name += ` (${lead.companyName})`;
  }
  return name || 'Unnamed Lead';
}

function getLeadSourceName(lead) {
  if (lead.leadSource) {
    return lead.leadSource.name;
  } else if (lead.sourceId) {
    const source = props.leadSources.find(s => s.id === lead.sourceId);
    return source ? source.name : 'Unknown Source';
  }
  return 'Unknown Source';
}

function getStatusVariant(status) {
  const variants = {
    'NEW': 'default',
    'CONTACTED': 'secondary',
    'QUALIFIED': 'primary',
    'UNQUALIFIED': 'destructive',
    'PROPOSAL': 'warning',
    'NEGOTIATION': 'warning',
    'WON': 'success',
    'LOST': 'outline'
  }
  return variants[status] || 'default'
}

function getLeadTypeVariant(type) {
  const variants = {
    'INDIVIDUAL': 'pink',
    'BUSINESS': 'teal'
  }
  return variants[type] || 'default'
}

// Action functions
function resetFilters() {
  filters.value = {
    search: '',
    status: 'all',
    source: 'all',
    assignee: 'all'
  }
}

function refreshData() {
  emit('refresh')
}

function toggleSelectAll(checked) {
  if (checked) {
    selectedLeads.value = filteredLeads.value.map(lead => lead.id)
  } else {
    selectedLeads.value = []
  }
}

function toggleLeadSelection(id) {
  const index = selectedLeads.value.indexOf(id)
  if (index === -1) {
    selectedLeads.value.push(id)
  } else {
    selectedLeads.value.splice(index, 1)
  }
}

function sortBy(key) {
  if (sortConfig.value.key === key) {
    sortConfig.value.direction = sortConfig.value.direction === 'asc' ? 'desc' : 'asc'
  } else {
    sortConfig.value.key = key
    sortConfig.value.direction = 'asc'
  }
}

function viewLeadDetails(lead) {
  emit('view-lead', lead)
}

function editLead(lead) {
  emit('edit-lead', lead)
}

function deleteLead(lead) {
  emit('delete-lead', lead)
}

function addNote(lead) {
  emit('add-note', lead)
}

function assignLead(lead) {
  emit('assign-lead', lead)
}

function updateStatus(lead) {
  emit('update-status', lead)
}

function convertToCustomer(lead) {
  emit('convert-lead', lead)
}

function markAsLost(lead) {
  emit('mark-lost', lead)
}

// Watch for filter changes to reset pagination
watch([filters], () => {
  pagination.value.page = 1
}, { deep: true })
</script>