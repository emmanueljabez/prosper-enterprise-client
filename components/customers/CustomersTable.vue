<template>
  <div class="space-y-6">
    <!-- Filters and Search -->
    <div class="flex flex-col sm:flex-row gap-4">
      <div class="relative flex-1">
        <SearchIcon class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
            v-model="filters.search"
            placeholder="Search customers..."
            class="pl-8"
        />
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:w-auto w-full">
        <Select v-model="filters.status">
          <SelectTrigger class="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select v-model="filters.serviceType">
          <SelectTrigger class="w-[140px]">
            <SelectValue placeholder="Service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Services</SelectItem>
            <SelectItem value="fiber">Fiber</SelectItem>
            <SelectItem value="lte">LTE</SelectItem>
            <SelectItem value="wimax">WiMAX</SelectItem>
            <SelectItem value="dsl">DSL</SelectItem>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="satellite">Satellite</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" @click="$emit('refresh')">
          <RefreshCwIcon class="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    </div>

    <!-- Customers Table -->
    <div class="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-[220px]">Customer</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Services</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Added</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="isLoading">
            <TableCell colspan="7" class="h-24 text-center">
              <Loader2Icon class="h-6 w-6 animate-spin mx-auto" />
              <span class="text-sm text-muted-foreground mt-2">Loading customers...</span>
            </TableCell>
          </TableRow>
          <TableRow v-else-if="filteredCustomers.length === 0">
            <TableCell colspan="7" class="h-24 text-center">
              <p class="text-muted-foreground">No customers found</p>
            </TableCell>
          </TableRow>
          <TableRow v-for="customer in filteredCustomers" :key="customer.id">
            <TableCell>
              <div class="font-medium">{{ customer.name }}</div>
              <div v-if="customer.company && customer.company !== customer.name" class="text-xs text-muted-foreground">
                {{ customer.company }}
              </div>
            </TableCell>
            <TableCell>
              <div class="text-sm">{{ customer.email }}</div>
              <div class="text-xs text-muted-foreground">{{ customer.phone }}</div>
            </TableCell>
            <TableCell>
              <div class="text-sm">{{ customer.address?.city }}</div>
              <div class="text-xs text-muted-foreground">{{ customer.address?.state }}</div>
            </TableCell>
            <TableCell>
              <div v-if="customer.services && customer.services.length > 0" class="flex flex-col space-y-1">
                <div v-for="(service, i) in customer.services.slice(0, 2)" :key="i" class="flex items-center">
                  <Badge variant="outline" class="mr-1">
                    {{ formatServiceType(service.type) }}
                  </Badge>
                </div>
                <div v-if="customer.services.length > 2" class="text-xs text-muted-foreground">
                  +{{ customer.services.length - 2 }} more
                </div>
              </div>
              <div v-else class="text-xs text-muted-foreground">No services</div>
            </TableCell>
            <TableCell>
              <Badge :variant="customer.status === 'active' ? 'success' : 'secondary'">
                {{ customer.status === 'active' ? 'Active' : 'Inactive' }}
              </Badge>
            </TableCell>
            <TableCell>
              {{ formatDate(customer.createdAt) }}
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
                  <DropdownMenuItem @click="$emit('view-customer', customer)">
                    <EyeIcon class="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="$emit('edit-customer', customer)">
                    <EditIcon class="h-4 w-4 mr-2" />
                    Edit Customer
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="$emit('add-service', customer)">
                    <PlusIcon class="h-4 w-4 mr-2" />
                    Add Service
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                      @click="$emit('toggle-status', customer)"
                      :class="{'text-amber-600': customer.status === 'active', 'text-emerald-600': customer.status === 'inactive'}"
                  >
                    <component :is="customer.status === 'active' ? BanIcon : CheckIcon" class="h-4 w-4 mr-2" />
                    {{ customer.status === 'active' ? 'Deactivate' : 'Activate' }}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                      @click="$emit('delete-customer', customer)"
                      class="text-destructive"
                  >
                    <TrashIcon class="h-4 w-4 mr-2" />
                    Delete Customer
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
import {ref, computed} from 'vue'
import {format, parseISO} from 'date-fns'
import {Table, TableHeader, TableBody, TableHead, TableRow, TableCell} from '@/components/ui/table'
import {Input} from '@/components/ui/input'
import {Button} from '@/components/ui/button'
import {Badge} from '@/components/ui/badge'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import {
  SearchIcon, MoreHorizontalIcon, EyeIcon, EditIcon, TrashIcon,
  PlusIcon, CheckIcon, BanIcon, RefreshCwIcon, Loader2Icon
} from 'lucide-vue-next'

const props = defineProps({
  customers: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'view-customer',
  'edit-customer',
  'delete-customer',
  'toggle-status',
  'add-service',
  'refresh'
])

// Filter state
const filters = ref({
  search: '',
  status: 'all',
  serviceType: 'all'
})

// Computed properties
const filteredCustomers = computed(() => {
  let result = [...props.customers]

  // Filter by search
  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase()
    result = result.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm) ||
        (customer.company && customer.company.toLowerCase().includes(searchTerm)) ||
        customer.email.toLowerCase().includes(searchTerm) ||
        customer.phone.includes(searchTerm) ||
        (customer.address?.city && customer.address.city.toLowerCase().includes(searchTerm))
    )
  }

  // Filter by status
  if (filters.value.status !== 'all') {
    result = result.filter(customer => customer.status === filters.value.status)
  }

  // Filter by service type
  if (filters.value.serviceType !== 'all') {
    result = result.filter(customer =>
        customer.services &&
        customer.services.some(service => service.type === filters.value.serviceType)
    )
  }

  return result
})

// Helper functions
function formatDate(dateString) {
  if (!dateString) return ''
  return format(parseISO(dateString), 'MMM dd, yyyy')
}

function formatServiceType(type) {
  const types = {
    'fiber': 'Fiber',
    'lte': 'LTE',
    'wimax': 'WiMAX',
    'dsl': 'DSL',
    'business': 'Business',
    'satellite': 'Satellite'
  }
  return types[type] || type
}
</script>