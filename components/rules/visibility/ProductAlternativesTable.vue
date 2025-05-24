<template>
  <div class="space-y-4">
    <!-- Filters -->
    <div class="flex flex-col space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex-1 space-y-1">
          <h3 class="text-lg font-semibold tracking-tight">Product Alternatives</h3>
          <p class="text-sm text-muted-foreground">
            {{ filteredAlternatives.length }} alternatives found
          </p>
        </div>
        <div class="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            @click="refreshData" 
            :disabled="loading"
          >
            <RefreshCwIcon v-if="!loading" class="h-4 w-4 mr-2" />
            <Loader2Icon v-else class="h-4 w-4 mr-2 animate-spin" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" @click="resetFilters">
            <XIcon class="h-4 w-4 mr-2" />
            Reset Filters
          </Button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="space-y-2">
          <Label for="search">Search</Label>
          <Input
            id="search"
            v-model="filters.search"
            placeholder="Search by name or description..."
          />
        </div>
        <div class="space-y-2">
          <Label for="relationshipFilter">Relationship Type</Label>
          <Select v-model="filters.relationship">
            <SelectTrigger id="relationshipFilter">
              <SelectValue placeholder="Filter by relationship" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Relationships</SelectItem>
              <SelectItem value="substitute">Substitute</SelectItem>
              <SelectItem value="accessory">Accessory</SelectItem>
              <SelectItem value="complementary">Complementary</SelectItem>
              <SelectItem value="upgraded_version">Upgraded Version</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-2">
          <Label for="statusFilter">Status</Label>
          <Select v-model="filters.status">
            <SelectTrigger id="statusFilter">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>

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
                Name 
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
            <TableHead>Primary Product</TableHead>
            <TableHead>Alternative Product</TableHead>
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('relationship')"
              >
                Relationship 
                <ArrowUpIcon
                  v-if="sortConfig.key === 'relationship' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'relationship' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>Display Options</TableHead>
            <TableHead>Status</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="loading" class="h-24">
            <TableCell colSpan="7" class="text-center">
              <Loader2Icon class="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
              <div class="mt-2 text-sm text-muted-foreground">Loading product alternatives...</div>
            </TableCell>
          </TableRow>
          <TableRow v-else-if="paginatedAlternatives.length === 0" class="h-24">
            <TableCell colSpan="7" class="text-center">
              <div class="flex flex-col items-center justify-center">
                <LinkIcon class="h-10 w-10 text-muted-foreground" />
                <div class="mt-2">No product alternatives found</div>
                <div class="mt-1 text-sm text-muted-foreground">
                  Try adjusting your filters or add a new product alternative
                </div>
              </div>
            </TableCell>
          </TableRow>
          <TableRow v-for="alternative in paginatedAlternatives" :key="alternative.id">
            <TableCell>
              <div class="font-medium">{{ alternative.name }}</div>
              <div class="text-xs text-muted-foreground truncate max-w-md">
                {{ alternative.description || 'No description' }}
              </div>
            </TableCell>
            <TableCell>
              <div class="font-medium">{{ getPrimaryProductName(alternative) }}</div>
              <div class="text-xs text-muted-foreground">
                ID: {{ alternative.primaryProductId }}
              </div>
            </TableCell>
            <TableCell>
              <div class="font-medium">{{ getAlternativeProductName(alternative) }}</div>
              <div class="text-xs text-muted-foreground">
                ID: {{ alternative.alternativeProductId }}
              </div>
            </TableCell>
            <TableCell>
              <Badge :variant="getRelationshipVariant(alternative.relationship)">
                {{ formatRelationship(alternative.relationship) }}
              </Badge>
              <div v-if="alternative.conversionRate" class="text-xs text-muted-foreground mt-1">
                Conversion: {{ alternative.conversionRate }}
              </div>
            </TableCell>
            <TableCell>
              <div class="flex flex-col gap-1">
                <Badge v-if="alternative.displayOnProductPage" variant="outline" class="text-xs">
                  Product Page
                </Badge>
                <Badge v-if="alternative.displayInCart" variant="outline" class="text-xs">
                  Shopping Cart
                </Badge>
                <Badge v-if="alternative.displayWhenOutOfStock" variant="outline" class="text-xs">
                  When Out of Stock
                </Badge>
                <Badge v-if="alternative.automaticSubstitution" variant="secondary" class="text-xs">
                  Auto Substitute
                </Badge>
              </div>
            </TableCell>
            <TableCell>
              <Switch
                :checked="alternative.active"
                @update:checked="toggleAlternative(alternative)"
                class="data-[state=checked]:bg-green-500"
              />
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
                  <DropdownMenuItem @click="editAlternative(alternative)">
                    <PencilIcon class="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="viewProducts(alternative)">
                    <SearchIcon class="mr-2 h-4 w-4" />
                    <span>View Products</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="deleteAlternative(alternative)" class="text-destructive focus:text-destructive">
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
        Showing {{ pagination.pageSize * (pagination.page - 1) + 1 }} to
        {{ Math.min(pagination.pageSize * pagination.page, filteredAlternatives.length) }}
        of {{ filteredAlternatives.length }} alternatives
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
import { format } from 'date-fns'
import { 
  ArrowUpIcon, ArrowDownIcon, MoreHorizontalIcon, 
  RefreshCwIcon, XIcon, PencilIcon, Trash2Icon, 
  Loader2Icon, LinkIcon, SearchIcon 
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

const props = defineProps({
  alternatives: {
    type: Array,
    required: true,
    default: () => []
  },
  products: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'edit-alternative', 
  'delete-alternative', 
  'toggle-alternative', 
  'view-products',
  'refresh'
])

// State for filters, sorting, and pagination
const filters = ref({
  search: '',
  relationship: 'all',
  status: 'all'
})

const sortConfig = ref({
  key: 'displayOrder',
  direction: 'asc'
})

const pagination = ref({
  page: 1,
  pageSize: 10
})

// Computed properties
const filteredAlternatives = computed(() => {
  return props.alternatives.filter(alternative => {
    // Search filter
    const searchMatch = 
      filters.value.search === '' || 
      alternative.name.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      (alternative.description && alternative.description.toLowerCase().includes(filters.value.search.toLowerCase())) ||
      getPrimaryProductName(alternative).toLowerCase().includes(filters.value.search.toLowerCase()) ||
      getAlternativeProductName(alternative).toLowerCase().includes(filters.value.search.toLowerCase());

    // Relationship filter
    const relationshipMatch = 
      filters.value.relationship === 'all' || 
      alternative.relationship === filters.value.relationship;

    // Status filter
    const statusMatch = 
      filters.value.status === 'all' || 
      alternative.active === (filters.value.status === 'true');

    return searchMatch && relationshipMatch && statusMatch;
  }).sort((a, b) => {
    const direction = sortConfig.value.direction === 'asc' ? 1 : -1;
    
    // Handle nested properties with dot notation
    if (sortConfig.value.key.includes('.')) {
      const keys = sortConfig.value.key.split('.');
      let aVal = a;
      let bVal = b;
      
      for (const key of keys) {
        aVal = aVal?.[key];
        bVal = bVal?.[key];
      }
      
      if (aVal === undefined) return direction;
      if (bVal === undefined) return -direction;
      
      return aVal > bVal ? direction : aVal < bVal ? -direction : 0;
    }
    
    // Simple properties
    if (a[sortConfig.value.key] === undefined) return direction;
    if (b[sortConfig.value.key] === undefined) return -direction;
    
    return a[sortConfig.value.key] > b[sortConfig.value.key] 
      ? direction 
      : a[sortConfig.value.key] < b[sortConfig.value.key] 
        ? -direction 
        : 0;
  });
})

const paginatedAlternatives = computed(() => {
  const startIndex = (pagination.value.page - 1) * pagination.value.pageSize;
  const endIndex = startIndex + pagination.value.pageSize;
  return filteredAlternatives.value.slice(startIndex, endIndex);
})

const totalPages = computed(() => {
  return Math.ceil(filteredAlternatives.value.length / pagination.value.pageSize);
})

// Helper functions
function formatDate(dateString) {
  try {
    return format(new Date(dateString), 'MMM d, yyyy');
  } catch (e) {
    return dateString;
  }
}

function formatRelationship(relationship) {
  const relationships = {
    substitute: 'Substitute',
    accessory: 'Accessory',
    complementary: 'Complementary',
    upgraded_version: 'Upgraded Version'
  };
  return relationships[relationship] || relationship;
}

function getRelationshipVariant(relationship) {
  const variants = {
    substitute: 'default',
    accessory: 'secondary',
    complementary: 'info',
    upgraded_version: 'warning'
  };
  return variants[relationship] || 'outline';
}

function getPrimaryProductName(alternative) {
  if (!props.products || !Array.isArray(props.products)) {
    return alternative.primaryProductId;
  }
  
  const product = props.products.find(p => p.id === alternative.primaryProductId);
  return product ? product.name : alternative.primaryProductId;
}

function getAlternativeProductName(alternative) {
  if (!props.products || !Array.isArray(props.products)) {
    return alternative.alternativeProductId;
  }
  
  const product = props.products.find(p => p.id === alternative.alternativeProductId);
  return product ? product.name : alternative.alternativeProductId;
}

// Action functions
function resetFilters() {
  filters.value = {
    search: '',
    relationship: 'all',
    status: 'all'
  };
}

function refreshData() {
  emit('refresh');
}

function sortBy(key) {
  if (sortConfig.value.key === key) {
    sortConfig.value.direction = sortConfig.value.direction === 'asc' ? 'desc' : 'asc';
  } else {
    sortConfig.value.key = key;
    sortConfig.value.direction = 'asc';
  }
}

function editAlternative(alternative) {
  emit('edit-alternative', alternative);
}

function deleteAlternative(alternative) {
  emit('delete-alternative', alternative);
}

function toggleAlternative(alternative) {
  emit('toggle-alternative', alternative);
}

function viewProducts(alternative) {
  emit('view-products', alternative);
}

// Watch for filter changes to reset pagination
watch([filters], () => {
  pagination.value.page = 1;
}, { deep: true });
</script>