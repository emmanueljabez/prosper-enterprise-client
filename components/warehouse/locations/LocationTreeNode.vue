<template>
  <div class="location-tree-node">
    <!-- Node content -->
    <div 
      class="flex items-center py-2 px-3 rounded-md hover:bg-muted/50 transition-colors group"
      :class="{ 'bg-muted/30': isExpanded }"
    >
      <!-- Expand/collapse button -->
      <Button 
        v-if="hasChildren || canExpand" 
        variant="ghost" 
        size="icon" 
        class="h-6 w-6 mr-1 -ml-1.5" 
        @click.stop="toggleExpand"
      >
        <ChevronRightIcon 
          class="h-4 w-4 transition-transform" 
          :class="{ 'rotate-90': isExpanded }"
        />
      </Button>
      <div v-else class="w-6 mr-1 -ml-1.5"></div>
      
      <!-- Location type icon -->
      <div 
        class="flex items-center justify-center h-7 w-7 rounded-md mr-2" 
        :class="getTypeIconClass(location.type)"
      >
        <WarehouseIcon v-if="location.type === 'warehouse'" class="h-4 w-4" />
        <LayoutGridIcon v-else-if="location.type === 'zone'" class="h-4 w-4" />
        <AlignEndHorizontalIcon v-else-if="location.type === 'aisle'" class="h-4 w-4" />
        <PackageIcon v-else-if="location.type === 'bin' || location.type === 'shelf'" class="h-4 w-4" />
        <FolderIcon v-else class="h-4 w-4" />
      </div>
      
      <!-- Location details -->
      <div class="flex-grow min-w-0">
        <div class="flex items-center">
          <div class="font-medium truncate">{{ location.name }}</div>
          <Badge 
            v-if="location.code" 
            variant="outline" 
            class="ml-2 text-xs"
          >
            {{ location.code }}
          </Badge>
        </div>
        <div class="text-xs text-muted-foreground flex items-center">
          <span>{{ formatLocationType(location.type) }}</span>
          <span class="mx-1.5">•</span>
          <Badge 
            :variant="location.status === 'active' ? 'success' : 'secondary'"
            class="text-[10px] px-1 py-0 h-4"
          >
            {{ formatStatus(location.status) }}
          </Badge>
          <span v-if="location.itemCount !== undefined" class="mx-1.5">•</span>
          <span v-if="location.itemCount !== undefined" class="flex items-center">
            <PackageIcon class="h-3 w-3 mr-1" />
            {{ location.itemCount }} items
          </span>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button 
          variant="ghost" 
          size="icon"
          class="h-7 w-7"
          @click.stop="handleViewLocation(location)"
        >
          <EyeIcon class="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon"
          class="h-7 w-7"
          @click.stop="handleEditLocation(location)"
        >
          <PencilIcon class="h-4 w-4" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild @click.stop>
            <Button 
              variant="ghost" 
              size="icon"
              class="h-7 w-7"
            >
              <MoreVerticalIcon class="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem @click="handleViewLocation(location)">
              <EyeIcon class="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem @click="handleEditLocation(location)">
              <PencilIcon class="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <!-- Warehouse-specific actions -->
            <template v-if="location.type === 'warehouse'">
              <DropdownMenuItem 
                @click="handleDeactivateWarehouse(location)"
                :disabled="location.status === 'inactive'"
              >
                <PowerOffIcon class="h-4 w-4 mr-2" />
                Deactivate
              </DropdownMenuItem>
            </template>
            <DropdownMenuItem 
              v-if="canHaveChildren" 
              @click="handleCreateLocation(location)"
            >
              <PlusIcon class="h-4 w-4 mr-2" />
              Add Sub-location
            </DropdownMenuItem>
            <DropdownMenuItem @click="handlePrintLabels(location)">
              <PrinterIcon class="h-4 w-4 mr-2" />
              Print Labels
            </DropdownMenuItem>
            <DropdownMenuItem 
              v-if="['bin', 'shelf'].includes(location.type)" 
              @click="handleAssignItems(location)"
            >
              <PackagePlusIcon class="h-4 w-4 mr-2" />
              Assign Items
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              @click="handleDeleteLocation(location)"
              class="text-destructive focus:text-destructive"
            >
              <TrashIcon class="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
    
    <!-- Children nodes -->
    <div 
      v-if="hasChildren && isExpanded" 
      class="pl-6 ml-1 mt-1 border-l border-dashed"
    >
      <LocationTreeNode
        v-for="child in childLocations"
        :key="child.id"
        :location="child"
        :locations="locations"
        :expanded-nodes="expandedNodes"
        @toggle-node="handleToggleNode"
        @view-location="handleViewLocation"
        @edit-location="handleEditLocation"
        @delete-location="handleDeleteLocation"
        @create-location="handleCreateLocation"
        @print-labels="handlePrintLabels"
        @assign-items="handleAssignItems"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { 
  ChevronRightIcon, WarehouseIcon, LayoutGridIcon, 
  AlignEndHorizontalIcon, PackageIcon, FolderIcon,
  EyeIcon, PencilIcon, MoreVerticalIcon, TrashIcon,
  PlusIcon, PrinterIcon, PackagePlusIcon, RefreshCwIcon, PowerOffIcon
} from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

// Props
const props = defineProps({
  location: {
    type: Object,
    required: true
  },
  locations: {
    type: Array,
    required: true
  },
  expandedNodes: {
    type: Array,
    default: () => []
  }
});

// Emits
const emit = defineEmits([
  'toggle-node',
  'view-location',
  'edit-location',
  'delete-location',
  'create-location',
  'print-labels',
  'assign-items'
]);

// Computed properties
const childLocations = computed(() => {
  return props.locations.filter(loc => loc.parentId === props.location.id);
});

const hasChildren = computed(() => {
  return childLocations.value.length > 0;
});

const canExpand = computed(() => {
  return props.location.canExpand || false;
});

const isExpanded = computed(() => {
  return props.expandedNodes.includes(props.location.id);
});

const canHaveChildren = computed(() => {
  return !['bin', 'shelf'].includes(props.location.type); // Shelves/bins can't have sub-locations
});

// Methods
const toggleExpand = () => {
  // Allow expansion if there are children OR if canExpand is true (for warehouses)
  if (hasChildren.value || canExpand.value) {
    emit('toggle-node', props.location.id);
  }
};

const handleViewLocation = (location) => {
  emit('view-location', location);
};

const handleEditLocation = (location) => {
  emit('edit-location', location);
};

const handleDeleteLocation = (location) => {
  emit('delete-location', location);
};

const handleCreateLocation = (location) => {
  emit('create-location', location);
};

const handlePrintLabels = (location) => {
  emit('print-labels', location);
};

const handleAssignItems = (location) => {
  emit('assign-items', location);
};

const handleToggleNode = (nodeId) => {
  emit('toggle-node', nodeId);
};

const formatLocationType = (type) => {
  if (!type) return 'Unknown';
  return type.charAt(0).toUpperCase() + type.slice(1);
};

const formatStatus = (status) => {
  if (!status) return 'Unknown';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const getTypeIconClass = (type) => {
  switch (type) {
    case 'warehouse':
      return 'bg-blue-50 text-blue-500';
    case 'zone':
      return 'bg-purple-50 text-purple-500';
    case 'aisle':
      return 'bg-amber-50 text-amber-500';
    case 'bin':
    case 'shelf':
      return 'bg-green-50 text-green-500';
    default:
      return 'bg-gray-50 text-gray-500';
  }
};
</script>