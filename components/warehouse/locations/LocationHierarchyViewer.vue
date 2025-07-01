<template>
  <div class="border rounded-lg">
    <!-- Skeleton Loading State -->
    <div v-if="loading" class="p-4">
      <!-- View Controls Skeleton -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex gap-2">
          <Skeleton class="h-9 w-24" />
          <Skeleton class="h-9 w-24" />
          <Skeleton class="h-9 w-24" />
        </div>
        <div class="flex items-center space-x-2">
          <Skeleton class="h-9 w-[250px]" />
          <Skeleton class="h-9 w-20" />
        </div>
      </div>

      <!-- Tree View Skeleton -->
      <div v-if="viewMode === 'tree'" class="border rounded-lg p-4 bg-muted/10">
        <!-- Warehouse Level Skeletons -->
        <div v-for="i in 2" :key="`warehouse-${i}`" class="mb-4 last:mb-0">
          <div class="flex items-center space-x-2 p-2 rounded-md">
            <Skeleton class="h-4 w-4" /> <!-- Expand icon -->
            <Skeleton class="h-5 w-5" /> <!-- Location icon -->
            <Skeleton class="h-5 w-32" /> <!-- Name -->
            <Skeleton class="h-5 w-20" /> <!-- Badge -->
            <div class="ml-auto flex space-x-1">
              <Skeleton class="h-8 w-8 rounded" /> <!-- Action buttons -->
              <Skeleton class="h-8 w-8 rounded" />
              <Skeleton class="h-8 w-8 rounded" />
            </div>
          </div>
          
          <!-- Child Levels Skeletons (Zones/Aisles/Bins) -->
          <div class="ml-6 mt-2 space-y-2">
            <div v-for="j in 3" :key="`zone-${i}-${j}`" class="flex items-center space-x-2 p-2 rounded-md">
              <Skeleton class="h-4 w-4" />
              <Skeleton class="h-4 w-4" />
              <Skeleton class="h-4 w-24" />
              <Skeleton class="h-4 w-16" />
              <div class="ml-auto flex space-x-1">
                <Skeleton class="h-6 w-6 rounded" />
                <Skeleton class="h-6 w-6 rounded" />
              </div>
            </div>
            
            <!-- Sub-child levels -->
            <div class="ml-6 space-y-1">
              <div v-for="k in 2" :key="`aisle-${i}-${j}-${k}`" class="flex items-center space-x-2 p-1 rounded-md">
                <Skeleton class="h-3 w-3" />
                <Skeleton class="h-3 w-3" />
                <Skeleton class="h-3 w-20" />
                <Skeleton class="h-3 w-12" />
                <div class="ml-auto">
                  <Skeleton class="h-5 w-5 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Map View Skeleton -->
      <div v-else-if="viewMode === 'map'" class="border rounded-lg p-4 bg-muted/10 h-[500px]">
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <Skeleton class="h-6 w-40" />
            <Skeleton class="h-8 w-24" />
          </div>
          <Skeleton class="h-[400px] w-full rounded-md" />
        </div>
      </div>

      <!-- List View Skeleton -->
      <div v-else-if="viewMode === 'list'" class="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Items</TableHead>
              <TableHead class="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="i in 8" :key="`skeleton-row-${i}`">
              <TableCell><Skeleton class="h-4 w-32" /></TableCell>
              <TableCell><Skeleton class="h-6 w-16 rounded-full" /></TableCell>
              <TableCell><Skeleton class="h-4 w-20" /></TableCell>
              <TableCell><Skeleton class="h-6 w-20 rounded-full" /></TableCell>
              <TableCell><Skeleton class="h-4 w-16" /></TableCell>
              <TableCell><Skeleton class="h-4 w-12" /></TableCell>
              <TableCell><Skeleton class="h-8 w-8 rounded" /></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex justify-center items-center h-64 p-8">
      <div class="flex flex-col items-center text-center max-w-md">
        <AlertCircleIcon class="h-10 w-10 text-destructive mb-4" />
        <h3 class="text-lg font-semibold mb-2">Unable to load locations</h3>
        <p class="text-muted-foreground mb-4">{{ error }}</p>
        <Button @click="$emit('refresh')">Try Again</Button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!locations.length" class="flex justify-center items-center h-64 p-8">
      <div class="flex flex-col items-center text-center max-w-md">
        <WarehouseIcon class="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h3 class="text-lg font-semibold mb-2">No locations found</h3>
        <p class="text-muted-foreground mb-4">
          Get started by adding your first warehouse location
        </p>
        <Button @click="$emit('create-location')">Add Location</Button>
      </div>
    </div>

    <!-- Locations Tree View -->
    <div v-else class="p-4">
      <!-- View Controls -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            @click="viewMode = 'tree'" 
            :class="{ 'bg-primary text-primary-foreground': viewMode === 'tree' }"
          >
            <NetworkIcon class="h-4 w-4 mr-2" />
            Tree View
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            @click="viewMode = 'map'" 
            :class="{ 'bg-primary text-primary-foreground': viewMode === 'map' }"
          >
            <GridIcon class="h-4 w-4 mr-2" />
            Map View
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            @click="viewMode = 'list'" 
            :class="{ 'bg-primary text-primary-foreground': viewMode === 'list' }"
          >
            <ListIcon class="h-4 w-4 mr-2" />
            List View
          </Button>
          
          <!-- Refresh Button -->
          <Button 
            variant="outline" 
            size="sm" 
            @click="$emit('refresh')"
            title="Refresh locations"
          >
            <RefreshCwIcon class="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        <div class="flex items-center space-x-2 w-full sm:w-auto">
          <Input 
            placeholder="Search locations..." 
            class="h-9 w-full sm:w-[250px]" 
            v-model="searchQuery"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <FilterIcon class="h-4 w-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-[200px]">
              <DropdownMenuLabel>Filter By Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem v-model:checked="filters.warehouses">
                Warehouses
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem v-model:checked="filters.zones">
                Zones
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem v-model:checked="filters.aisles">
                Aisles
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem v-model:checked="filters.shelves">
                Shelves
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <!-- Tree View -->
      <div v-if="viewMode === 'tree'">
        <div class="border rounded-lg p-4 bg-muted/10">
          <div v-for="location in topLevelLocations" :key="location.id" class="mb-2 last:mb-0">
            <LocationTreeNode 
              :location="location" 
              :locations="locations"
              :expanded-nodes="expandedNodes"
              @toggle-node="toggleNode"
              @view-location="$emit('view-location', $event)"
              @edit-location="$emit('edit-location', $event)"
              @delete-location="$emit('delete-location', $event)"
              @create-location="$emit('create-location', $event)"
              @print-labels="$emit('print-labels', $event)"
              @assign-items="$emit('assign-items', $event)"
            />
          </div>
        </div>
      </div>
      
      <!-- Map View -->
      <div v-else-if="viewMode === 'map'" class="border rounded-lg p-4 bg-muted/10 h-[500px]">
        <div class="flex items-center justify-center h-full">
          <div class="text-center">
            <MapIcon class="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 class="text-lg font-semibold mb-2">Warehouse Map View</h3>
            <p class="text-muted-foreground mb-4">
              Interactive warehouse layout will be displayed here
            </p>
          </div>
        </div>
      </div>
      
      <!-- List View -->
      <div v-else-if="viewMode === 'list'">
        <div class="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Items</TableHead>
                <TableHead class="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="location in filteredLocations" :key="location.id">
                <TableCell class="font-medium">{{ location.name }}</TableCell>
                <TableCell>
                  <Badge variant="outline">{{ formatLocationType(location.type) }}</Badge>
                </TableCell>
                <TableCell>{{ location.code || '-' }}</TableCell>
                <TableCell>
                  <Badge :variant="location.status === 'active' ? 'success' : 'secondary'">
                    {{ formatStatus(location.status) }}
                  </Badge>
                </TableCell>
                <TableCell>{{ location.capacity || '-' }}</TableCell>
                <TableCell>{{ location.itemCount || 0 }}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontalIcon class="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem @click="$emit('view-location', location)">
                        <EyeIcon class="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem @click="$emit('edit-location', location)">
                        <PencilIcon class="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <!-- Warehouse-specific actions -->
                      <template v-if="location.type === 'warehouse'">
                        <DropdownMenuItem v-if="location.status === 'active'" 
                          @click="$emit('deactivate-warehouse', location)"
                          class="text-destructive"
                          :disabled="location.status === 'inactive'"
                        >
                          <PowerOffIcon class="h-4 w-4 mr-2" />
                          Deactivate
                        </DropdownMenuItem>                        
                      </template>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem @click="$emit('delete-location', location)" class="text-destructive">
                        <TrashIcon class="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { 
  Loader2Icon, AlertCircleIcon, WarehouseIcon, NetworkIcon,
  GridIcon, ListIcon, FilterIcon, MoreHorizontalIcon,
  EyeIcon, PencilIcon, TrashIcon, MapIcon, RefreshCwIcon, PowerOffIcon
} from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

// Components
import LocationTreeNode from './LocationTreeNode.vue';

// Props
const props = defineProps({
  locations: {
    type: Array,
    required: true,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: [String, null],
    default: null
  },
  expandedWarehouses: {
    type: Array,
    default: () => []
  }
});

// Emits
const emit = defineEmits([
  'view-location', 
  'edit-location', 
  'delete-location', 
  'create-location',
  'refresh',
  'print-labels',
  'assign-items',
  'expand-warehouse',
  'deactivate-warehouse'
]);

// UI state
const viewMode = ref('tree');
const searchQuery = ref('');
const filters = ref({
  warehouses: true,
  zones: true,
  aisles: true,
  shelves: true
});
const expandedNodes = ref([]);

// Watch for changes in expandedWarehouses prop and sync with local state
watch(() => props.expandedWarehouses, (newExpanded) => {
  expandedNodes.value = [...newExpanded];
}, { immediate: true });

// Watch for changes in locations and clean up invalid expanded nodes
watch(() => props.locations, (newLocations) => {
  // Remove expanded nodes that no longer exist in the locations data
  const existingIds = new Set(newLocations.map(loc => loc.id));
  expandedNodes.value = expandedNodes.value.filter(nodeId => existingIds.has(nodeId));
}, { immediate: false });

// Computed properties
const filteredLocations = computed(() => {
  let result = [...props.locations];
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(loc => 
      loc.name.toLowerCase().includes(query) || 
      loc.code?.toLowerCase().includes(query)
    );
  }
  
  // Apply type filters
  result = result.filter(loc => {
    if (loc.type === 'warehouse') return filters.value.warehouses;
    if (loc.type === 'zone') return filters.value.zones;
    if (loc.type === 'aisle') return filters.value.aisles;
    if (['bin', 'shelf'].includes(loc.type)) return filters.value.shelves; // 'bin' and 'shelf' map to shelves
    return true;
  });
  
  return result;
});

const topLevelLocations = computed(() => {
  return filteredLocations.value.filter(loc => !loc.parentId);
});

// Methods
const toggleNode = (nodeId) => {
  const index = expandedNodes.value.indexOf(nodeId);
  if (index === -1) {
    expandedNodes.value.push(nodeId);
    
    // If this is a warehouse, emit expand event
    const location = props.locations.find(loc => loc.id === nodeId);
    if (location && location.type === 'warehouse') {
      emit('expand-warehouse', nodeId);
    }
  } else {
    expandedNodes.value.splice(index, 1);
  }
};

const formatLocationType = (type) => {
  if (!type) return 'Unknown';
  return type.charAt(0).toUpperCase() + type.slice(1);
};

const formatStatus = (status) => {
  if (!status) return 'Unknown';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

// Initialize: don't auto-expand warehouses, let user manually expand them
watch(() => props.locations, (newLocations) => {
  // Don't auto-expand warehouses - let users expand them manually
  // This ensures they see the expand icons and can control the loading
}, { immediate: true });
</script>