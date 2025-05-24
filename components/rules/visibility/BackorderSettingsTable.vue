<template>
  <div class="space-y-4">
    <!-- Filters -->
    <div class="flex flex-col space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex-1 space-y-1">
          <h3 class="text-lg font-semibold tracking-tight">Backorder Settings</h3>
          <p class="text-sm text-muted-foreground">
            {{ filteredSettings.length }} settings found
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
          <Label for="allowanceFilter">Backorder Allowance</Label>
          <Select v-model="filters.allowBackorders">
            <SelectTrigger id="allowanceFilter">
              <SelectValue placeholder="Filter by allowance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="all">All</SelectItem>
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
                Setting Name 
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
                @click="sortBy('allowBackorders')"
              >
                Allowance 
                <ArrowUpIcon
                  v-if="sortConfig.key === 'allowBackorders' && sortConfig.direction === 'asc'"
                  class="ml-1 h-4 w-4"
                />
                <ArrowDownIcon
                  v-if="sortConfig.key === 'allowBackorders' && sortConfig.direction === 'desc'"
                  class="ml-1 h-4 w-4"
                />
              </div>
            </TableHead>
            <TableHead>Limits</TableHead>
            <TableHead>Status</TableHead>
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
              <div class="mt-2 text-sm text-muted-foreground">Loading backorder settings...</div>
            </TableCell>
          </TableRow>
          <TableRow v-else-if="paginatedSettings.length === 0" class="h-24">
            <TableCell colSpan="7" class="text-center">
              <div class="flex flex-col items-center justify-center">
                <ShoppingCartIcon class="h-10 w-10 text-muted-foreground" />
                <div class="mt-2">No backorder settings found</div>
                <div class="mt-1 text-sm text-muted-foreground">
                  Try adjusting your filters or add a new setting
                </div>
              </div>
            </TableCell>
          </TableRow>
          <TableRow v-for="setting in paginatedSettings" :key="setting.id">
            <TableCell>
              <div class="font-medium">{{ setting.name }}</div>
              <div class="text-xs text-muted-foreground truncate max-w-md">
                {{ setting.description || 'No description' }}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">
                {{ formatScope(setting.scope) }}
              </Badge>
              <div v-if="setting.scope === 'category' && setting.categoryIds?.length" class="text-xs text-muted-foreground mt-1">
                {{ getCategoryNames(setting) }}
              </div>
              <div v-if="setting.scope === 'product' && setting.productIds?.length" class="text-xs text-muted-foreground mt-1">
                {{ getProductCount(setting) }} products
              </div>
            </TableCell>
            <TableCell>
              <Badge :variant="getAllowanceVariant(setting.allowBackorders)">
                {{ formatAllowance(setting.allowBackorders) }}
              </Badge>
            </TableCell>
            <TableCell>
              <div v-if="setting.maxBackorderQuantity" class="text-xs">
                Max Qty: <span class="font-medium">{{ setting.maxBackorderQuantity }}</span>
              </div>
              <div v-if="setting.maxBackorderDays" class="text-xs">
                Max Days: <span class="font-medium">{{ setting.maxBackorderDays }}</span>
              </div>
              <div v-if="!setting.maxBackorderQuantity && !setting.maxBackorderDays" class="text-xs text-muted-foreground">
                No limits set
              </div>
            </TableCell>
            <TableCell>
              <Switch
                :checked="setting.active"
                @update:checked="toggleSetting(setting)"
                class="data-[state=checked]:bg-green-500"
              />
            </TableCell>
            <TableCell>{{ formatDate(setting.updatedAt) }}</TableCell>
            <TableCell class="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontalIcon class="h-4 w-4" />
                    <span class="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="editSetting(setting)">
                    <PencilIcon class="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="duplicateSetting(setting)">
                    <CopyIcon class="mr-2 h-4 w-4" />
                    <span>Duplicate</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="deleteSetting(setting)" class="text-destructive focus:text-destructive">
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
        {{ Math.min(pagination.pageSize * pagination.page, filteredSettings.length) }}
        of {{ filteredSettings.length }} settings
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
  Loader2Icon, ShoppingCartIcon, CopyIcon 
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
  settings: {
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
  'edit-setting', 
  'delete-setting', 
  'toggle-setting', 
  'duplicate-setting',
  'refresh'
])

// State for filters, sorting, and pagination
const filters = ref({
  search: '',
  scope: 'all',
  allowBackorders: 'all'
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
const filteredSettings = computed(() => {
  return props.settings.filter(setting => {
    // Search filter
    const searchMatch = 
      filters.value.search === '' || 
      setting.name.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      (setting.description && setting.description.toLowerCase().includes(filters.value.search.toLowerCase()));

    // Scope filter
    const scopeMatch = 
      filters.value.scope === 'all' || 
      setting.scope === filters.value.scope;

    // Allowance filter
    const allowanceMatch = 
      filters.value.allowBackorders === 'all' || 
      setting.allowBackorders === filters.value.allowBackorders;

    return searchMatch && scopeMatch && allowanceMatch;
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

const paginatedSettings = computed(() => {
  const startIndex = (pagination.value.page - 1) * pagination.value.pageSize;
  const endIndex = startIndex + pagination.value.pageSize;
  return filteredSettings.value.slice(startIndex, endIndex);
})

const totalPages = computed(() => {
  return Math.ceil(filteredSettings.value.length / pagination.value.pageSize);
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

function formatAllowance(allowance) {
  const allowances = {
    none: 'Not Allowed',
    partial: 'Partial',
    all: 'Full'
  };
  return allowances[allowance] || allowance;
}

function getAllowanceVariant(allowance) {
  const variants = {
    none: 'destructive',
    partial: 'warning',
    all: 'success'
  };
  return variants[allowance] || 'outline';
}

function getCategoryNames(setting) {
  if (!setting.categoryIds || !Array.isArray(setting.categoryIds) || setting.categoryIds.length === 0) {
    return 'All categories';
  }
  
  if (setting.categoryIds.length > 2) {
    return `${setting.categoryIds.length} categories`;
  }
  
  const categoryNames = setting.categoryIds.map(categoryId => {
    const category = props.categories.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
  });
  
  return categoryNames.join(', ');
}

function getProductCount(setting) {
  if (!setting.productIds || !Array.isArray(setting.productIds)) {
    return 0;
  }
  
  return setting.productIds.length;
}

// Action functions
function resetFilters() {
  filters.value = {
    search: '',
    scope: 'all',
    allowBackorders: 'all'
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

function editSetting(setting) {
  emit('edit-setting', setting);
}

function deleteSetting(setting) {
  emit('delete-setting', setting);
}

function toggleSetting(setting) {
  emit('toggle-setting', setting);
}

function duplicateSetting(setting) {
  emit('duplicate-setting', setting);
}

// Watch for filter changes to reset pagination
watch([filters], () => {
  pagination.value.page = 1;
}, { deep: true });
</script>