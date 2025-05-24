<template>
  <div class="space-y-4">
    <!-- Filters -->
    <div class="flex flex-col space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex-1 space-y-1">
          <h3 class="text-lg font-semibold tracking-tight">Out-of-Stock Visibility Rules</h3>
          <p class="text-sm text-muted-foreground">
            {{ filteredRules.length }} rules found
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
          <Label for="scopeFilter">Scope</Label>
          <Select v-model="filters.scope">
            <SelectTrigger id="scopeFilter">
              <SelectValue placeholder="Filter by scope" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Scopes</SelectItem>
              <SelectItem value="global">Global</SelectItem>
              <SelectItem value="category">Category</SelectItem>
              <SelectItem value="product">Product</SelectItem>
              <SelectItem value="item">Item</SelectItem>
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
                Rule Name 
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
                @click="sortBy('action')"
              >
                Action 
                <ArrowUpIcon
                  v-if="sortConfig.key === 'action' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'action' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>Status</TableHead>
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
            <TableHead>
              <div 
                class="flex items-center cursor-pointer"
                @click="sortBy('updatedAt')"
              >
                Updated 
                <ArrowUpIcon
                  v-if="sortConfig.key === 'updatedAt' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'updatedAt' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="loading" class="h-24">
            <TableCell colSpan="7" class="text-center">
              <Loader2Icon class="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
              <div class="mt-2 text-sm text-muted-foreground">Loading visibility rules...</div>
            </TableCell>
          </TableRow>
          <TableRow v-else-if="paginatedRules.length === 0" class="h-24">
            <TableCell colSpan="7" class="text-center">
              <div class="flex flex-col items-center justify-center">
                <EyeOffIcon class="h-10 w-10 text-muted-foreground" />
                <div class="mt-2">No visibility rules found</div>
                <div class="mt-1 text-sm text-muted-foreground">
                  Try adjusting your filters or add a new rule
                </div>
              </div>
            </TableCell>
          </TableRow>
          <TableRow v-for="rule in paginatedRules" :key="rule.id">
            <TableCell>
              <div class="font-medium">{{ rule.name }}</div>
              <div class="text-xs text-muted-foreground truncate max-w-md">
                {{ rule.description || 'No description' }}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">
                {{ formatScope(rule.scope) }}
              </Badge>
              <div v-if="rule.scope === 'category' && rule.categoryIds?.length" class="text-xs text-muted-foreground mt-1">
                {{ getCategoryNames(rule) }}
              </div>
              <div v-if="rule.scope === 'product' && rule.productIds?.length" class="text-xs text-muted-foreground mt-1">
                {{ getProductCount(rule) }} products
              </div>
            </TableCell>
            <TableCell>
              <Badge :variant="getActionVariant(rule.action)">
                {{ formatAction(rule.action) }}
              </Badge>
            </TableCell>
            <TableCell>
              <Switch
                :checked="rule.active"
                @update:checked="toggleRule(rule)"
                class="data-[state=checked]:bg-green-500"
              />
            </TableCell>
            <TableCell>{{ rule.priority }}</TableCell>
            <TableCell>{{ formatDate(rule.updatedAt) }}</TableCell>
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
                    <PencilIcon class="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="testRule(rule)">
                    <BeakerIcon class="mr-2 h-4 w-4" />
                    <span>Test Rule</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="deleteRule(rule)" class="text-destructive focus:text-destructive">
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
import { format } from 'date-fns'
import { 
  ArrowUpIcon, ArrowDownIcon, MoreHorizontalIcon, 
  RefreshCwIcon, XIcon, PencilIcon, Trash2Icon, 
  Loader2Icon, EyeOffIcon, BeakerIcon 
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
  rules: {
    type: Array,
    required: true,
    default: () => []
  },
  categories: {
    type: Array,
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
  'edit-rule', 
  'delete-rule', 
  'toggle-rule', 
  'refresh',
  'test-rule'
])

// State for filters, sorting, and pagination
const filters = ref({
  search: '',
  scope: 'all',
  status: 'all'
})

const sortConfig = ref({
  key: 'priority',
  direction: 'desc'
})

const pagination = ref({
  page: 1,
  pageSize: 10
})

// Computed properties
const filteredRules = computed(() => {
  return props.rules.filter(rule => {
    // Search filter
    const searchMatch = 
      filters.value.search === '' || 
      rule.name.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      (rule.description && rule.description.toLowerCase().includes(filters.value.search.toLowerCase()));

    // Scope filter
    const scopeMatch = 
      filters.value.scope === 'all' || 
      rule.scope === filters.value.scope;

    // Status filter
    const statusMatch = 
      filters.value.status === 'all' || 
      rule.active === (filters.value.status === 'true');

    return searchMatch && scopeMatch && statusMatch;
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

const paginatedRules = computed(() => {
  const startIndex = (pagination.value.page - 1) * pagination.value.pageSize;
  const endIndex = startIndex + pagination.value.pageSize;
  return filteredRules.value.slice(startIndex, endIndex);
})

const totalPages = computed(() => {
  return Math.ceil(filteredRules.value.length / pagination.value.pageSize);
})

// Helper functions
function formatDate(dateString) {
  try {
    return format(new Date(dateString), 'MMM d, yyyy');
  } catch (e) {
    return dateString;
  }
}

function formatScope(scope) {
  const scopes = {
    global: 'Global',
    category: 'Category',
    product: 'Product',
    item: 'Item'
  };
  return scopes[scope] || scope;
}

function formatAction(action) {
  const actions = {
    hide: 'Hide',
    show: 'Show',
    show_with_label: 'Show with Label',
    show_with_message: 'Show with Message',
    redirect: 'Redirect'
  };
  return actions[action] || action;
}

function getActionVariant(action) {
  const variants = {
    hide: 'destructive',
    show: 'default',
    show_with_label: 'warning',
    show_with_message: 'secondary',
    redirect: 'outline'
  };
  return variants[action] || 'outline';
}

function getCategoryNames(rule) {
  if (!rule.categoryIds || !Array.isArray(rule.categoryIds) || rule.categoryIds.length === 0) {
    return 'All categories';
  }
  
  if (rule.categoryIds.length > 2) {
    return `${rule.categoryIds.length} categories`;
  }
  
  const categoryNames = rule.categoryIds.map(categoryId => {
    const category = props.categories.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
  });
  
  return categoryNames.join(', ');
}

function getProductCount(rule) {
  if (!rule.productIds || !Array.isArray(rule.productIds)) {
    return 0;
  }
  
  return rule.productIds.length;
}

// Action functions
function resetFilters() {
  filters.value = {
    search: '',
    scope: 'all',
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

function editRule(rule) {
  emit('edit-rule', rule);
}

function deleteRule(rule) {
  emit('delete-rule', rule);
}

function toggleRule(rule) {
  emit('toggle-rule', rule);
}

function testRule(rule) {
  emit('test-rule', rule);
}

// Watch for filter changes to reset pagination
watch([filters], () => {
  pagination.value.page = 1;
}, { deep: true });
</script>