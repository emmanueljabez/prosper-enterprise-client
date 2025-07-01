<template>
  <DialogContent class="sm:max-w-4xl">
    <DialogHeader>
      <DialogTitle class="text-xl">{{ location.name }}</DialogTitle>
      <DialogDescription>
        {{ formatLocationType(location.type) }} | Code: {{ location.code || 'N/A' }}
        <Badge class="ml-2" :variant="location.status === 'active' ? 'success' : 'secondary'">
          {{ formatStatus(location.status) }}
        </Badge>
      </DialogDescription>
    </DialogHeader>

    <div class="overflow-y-auto max-h-[70vh]">
      <Tabs defaultValue="details" class="w-full">
        <TabsList :class="location.type === 'warehouse' ? 'grid w-full grid-cols-5' : 'grid w-full grid-cols-4'">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger v-if="location.type === 'warehouse'" value="hierarchy">Hierarchy</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="sublocations">Sub-locations</TabsTrigger>
        </TabsList>
        
        <!-- Details Tab -->
        <TabsContent value="details" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-4">
              <div>
                <h4 class="text-sm font-medium mb-1 text-muted-foreground">Location Type</h4>
                <p>{{ formatLocationType(location.type) }}</p>
              </div>
              <div>
                <h4 class="text-sm font-medium mb-1 text-muted-foreground">Description</h4>
                <p>{{ location.description || 'No description provided' }}</p>
              </div>
              <div v-if="location.parentId">
                <h4 class="text-sm font-medium mb-1 text-muted-foreground">Parent Location</h4>
                <div class="flex items-center space-x-2">
                  <p>{{ getParentName(location.parentId) }}</p>
                  <Button variant="ghost" size="icon" @click="viewParent(location.parentId)">
                    <ExternalLinkIcon class="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <div>
                <h4 class="text-sm font-medium mb-1 text-muted-foreground">Status</h4>
                <Badge :variant="location.status === 'active' ? 'success' : 'secondary'">
                  {{ formatStatus(location.status) }}
                </Badge>
              </div>
              <div>
                <h4 class="text-sm font-medium mb-1 text-muted-foreground">Last Updated</h4>
                <p>{{ formatDate(location.updatedAt) }}</p>
              </div>
              <div>
                <h4 class="text-sm font-medium mb-1 text-muted-foreground">Created</h4>
                <p>{{ formatDate(location.createdAt) }}</p>
              </div>
            </div>
          </div>

          <div class="border rounded-md p-4 bg-muted/30">
            <h4 class="font-medium mb-2">Capacity & Utilization</h4>
            <div class="space-y-3">
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p class="text-muted-foreground">Capacity:</p>
                  <p class="font-medium">{{ location.capacity || 'Unlimited' }}</p>
                </div>
                <div>
                  <p class="text-muted-foreground">Items Stored:</p>
                  <p class="font-medium">{{ location.itemCount || 0 }}</p>
                </div>
                <div>
                  <p class="text-muted-foreground">Utilization:</p>
                  <p class="font-medium">{{ getUtilizationPercentage() }}%</p>
                </div>
                <div>
                  <p class="text-muted-foreground">Space Available:</p>
                  <p class="font-medium">{{ getAvailableSpace() }}</p>
                </div>
              </div>
              
              <div>
                <div class="text-xs mb-1 flex justify-between">
                  <span>0%</span>
                  <span>100%</span>
                </div>
                <div class="w-full bg-muted rounded-full h-2.5">
                  <div 
                    class="bg-primary h-2.5 rounded-full" 
                    :style="{ width: `${getUtilizationPercentage()}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="location.dimensions" class="border rounded-md p-4 bg-muted/30">
            <h4 class="font-medium mb-2">Dimensions</h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p class="text-muted-foreground">Length:</p>
                <p>{{ location.dimensions.length }} {{ location.dimensions.unit }}</p>
              </div>
              <div>
                <p class="text-muted-foreground">Width:</p>
                <p>{{ location.dimensions.width }} {{ location.dimensions.unit }}</p>
              </div>
              <div>
                <p class="text-muted-foreground">Height:</p>
                <p>{{ location.dimensions.height }} {{ location.dimensions.unit }}</p>
              </div>
              <div>
                <p class="text-muted-foreground">Area:</p>
                <p>{{ calculateArea() }} {{ location.dimensions.unit }}²</p>
              </div>
            </div>
          </div>
          
          <div v-if="location.attributes" class="border rounded-md p-4 bg-muted/30">
            <h4 class="font-medium mb-2">Attributes</h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div v-for="(value, key) in location.attributes" :key="key">
                <p class="text-muted-foreground">{{ formatAttributeName(key) }}:</p>
                <p>{{ value }}</p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <!-- Warehouse Hierarchy Tab (only for warehouses) -->
        <TabsContent v-if="location.type === 'warehouse'" value="hierarchy" class="space-y-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium">Warehouse Structure</h3>
            <div class="flex items-center space-x-2">
              <Button size="sm" variant="outline" @click="refreshHierarchy">
                <RefreshCwIcon class="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button size="sm" @click="$emit('create-location', location)">
                <PlusIcon class="h-4 w-4 mr-2" />
                Add Zone
              </Button>
            </div>
          </div>
          
          <!-- Hierarchy Tree View -->
          <div v-if="warehouseHierarchy && warehouseHierarchy.locationHierarchy && warehouseHierarchy.locationHierarchy.length > 0" class="border rounded-lg p-4 bg-muted/10">
            <div class="space-y-2">
              <div v-for="zone in warehouseHierarchy.locationHierarchy" :key="zone.id" class="border-l-2 border-blue-200 pl-4">
                <div class="flex items-center justify-between py-2">
                  <div class="flex items-center space-x-3">
                    <LayoutGridIcon class="h-5 w-5 text-purple-500" />
                    <div>
                      <h4 class="font-medium">{{ zone.name }}</h4>
                      <p class="text-sm text-muted-foreground">{{ zone.code }} | {{ zone.locationType }}</p>
                      <p class="text-xs text-muted-foreground">
                        Capacity: {{ zone.currentCapacity || 0 }}/{{ zone.maxCapacity || 'Unlimited' }}
                        <span v-if="zone.maxCapacity"> ({{ Math.round((zone.currentCapacity || 0) / zone.maxCapacity * 100) }}% used)</span>
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <Badge :variant="zone.isActive ? 'default' : 'secondary'">
                      {{ zone.isActive ? 'Active' : 'Inactive' }}
                    </Badge>
                    <div class="flex items-center space-x-1">
                      <Button size="icon" variant="ghost" @click="$emit('view-location', zone)">
                        <EyeIcon class="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" @click="$emit('edit-location', zone)">
                        <PencilIcon class="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <!-- Show children if any (aisles) -->
                <div v-if="zone.children && zone.children.length > 0" class="ml-4 mt-2 space-y-2">
                  <div v-for="aisle in zone.children" :key="aisle.id" class="border-l-2 border-amber-200 pl-4">
                    <div class="flex items-center justify-between py-1">
                      <div class="flex items-center space-x-2">
                        <AlignEndHorizontalIcon class="h-4 w-4 text-amber-500" />
                        <div>
                          <p class="font-medium text-sm">{{ aisle.name }}</p>
                          <p class="text-xs text-muted-foreground">{{ aisle.code }} | {{ aisle.locationType }}</p>
                          <p class="text-xs text-muted-foreground">
                            Capacity: {{ aisle.currentCapacity || 0 }}/{{ aisle.maxCapacity || 'Unlimited' }}
                          </p>
                        </div>
                      </div>
                      <div class="flex items-center space-x-2">
                        <Badge size="sm" :variant="aisle.isActive ? 'default' : 'secondary'">
                          {{ aisle.isActive ? 'Active' : 'Inactive' }}
                        </Badge>
                        <div class="flex items-center space-x-1">
                          <Button size="icon" variant="ghost" @click="$emit('view-location', aisle)">
                            <EyeIcon class="h-3 w-3" />
                          </Button>
                          <Button size="icon" variant="ghost" @click="$emit('edit-location', aisle)">
                            <PencilIcon class="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Show shelves/bins if any -->
                    <div v-if="aisle.children && aisle.children.length > 0" class="ml-4 mt-1">
                      <div v-for="shelf in aisle.children" :key="shelf.id" class="flex items-center justify-between py-1">
                        <div class="flex items-center space-x-2">
                          <PackageIcon class="h-3 w-3 text-green-500" />
                          <div>
                            <p class="font-medium text-xs">{{ shelf.name }}</p>
                            <p class="text-xs text-muted-foreground">{{ shelf.code }} | {{ shelf.locationType }}</p>
                            <p class="text-xs text-muted-foreground">
                              {{ shelf.pickable ? 'Pickable' : 'Storage Only' }}
                            </p>
                          </div>
                        </div>
                        <div class="flex items-center space-x-2">
                          <Badge size="sm" :variant="shelf.isActive ? 'default' : 'secondary'">
                            {{ shelf.isActive ? 'Active' : 'Inactive' }}
                          </Badge>
                          <div class="flex items-center space-x-1">
                            <Button size="icon" variant="ghost" @click="$emit('view-location', shelf)">
                              <EyeIcon class="h-3 w-3" />
                            </Button>
                            <Button size="icon" variant="ghost" @click="$emit('edit-location', shelf)">
                              <PencilIcon class="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Empty Hierarchy State -->
          <div v-else class="text-center py-8">
            <LayoutGridIcon class="h-12 w-12 mx-auto text-muted-foreground/30 mb-2" />
            <p class="text-muted-foreground mb-4">No zones configured for this warehouse</p>
            <Button size="sm" @click="$emit('create-location', location)">
              <PlusIcon class="h-4 w-4 mr-2" />
              Add First Zone
            </Button>
          </div>
          
          <!-- Hierarchy Stats -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="border rounded-md p-4 bg-muted/30">
              <h4 class="font-medium mb-2">Total Locations</h4>
              <p class="text-2xl font-bold">{{ warehouseHierarchy?.totalLocations || 0 }}</p>
            </div>
            <div class="border rounded-md p-4 bg-muted/30">
              <h4 class="font-medium mb-2">Active Locations</h4>
              <p class="text-2xl font-bold">{{ warehouseHierarchy?.activeLocations || 0 }}</p>
            </div>
            <div class="border rounded-md p-4 bg-muted/30">
              <h4 class="font-medium mb-2">Max Depth</h4>
              <p class="text-2xl font-bold">{{ warehouseHierarchy?.maxDepth || 0 }}</p>
            </div>
            <div class="border rounded-md p-4 bg-muted/30">
              <h4 class="font-medium mb-2">Capacity Utilization</h4>
              <p class="text-2xl font-bold">{{ warehouseHierarchy?.capacityUtilization || 0 }}%</p>
            </div>
          </div>
        </TabsContent>
        
        <!-- Items Tab -->
        <TabsContent value="items" class="space-y-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium">Items in this location</h3>
            <Button size="sm" @click="$emit('assign-items', location)">
              <PlusIcon class="h-4 w-4 mr-2" />
              Assign Items
            </Button>
          </div>
          
          <div v-if="location.items && location.items.length > 0">
            <div class="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead class="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="item in location.items" :key="item.id">
                    <TableCell class="font-medium">{{ item.name }}</TableCell>
                    <TableCell>{{ item.sku }}</TableCell>
                    <TableCell>{{ item.quantity }}</TableCell>
                    <TableCell>
                      <Badge :variant="item.status === 'available' ? 'success' : 'secondary'">
                        {{ formatStatus(item.status) }}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon">
                        <ExternalLinkIcon class="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
          <div v-else class="text-center py-8">
            <PackageIcon class="h-12 w-12 mx-auto text-muted-foreground/30 mb-2" />
            <p class="text-muted-foreground mb-4">No items stored in this location</p>
            <Button size="sm" @click="$emit('assign-items', location)">
              Assign Items
            </Button>
          </div>
        </TabsContent>
        
        <!-- History Tab -->
        <TabsContent value="history" class="space-y-4">
          <div v-if="location.history && location.history.length > 0">
            <div class="space-y-4">
              <div v-for="(event, index) in location.history" :key="index" class="flex">
                <div class="mr-4 flex flex-col items-center">
                  <div class="rounded-full h-9 w-9 flex items-center justify-center flex-shrink-0 bg-muted">
                    <HistoryIcon v-if="event.type === 'status_change'" class="h-5 w-5" />
                    <PackageIcon v-else-if="event.type === 'item_added'" class="h-5 w-5" />
                    <PackageXIcon v-else-if="event.type === 'item_removed'" class="h-5 w-5" />
                    <EditIcon v-else-if="event.type === 'edit'" class="h-5 w-5" />
                    <CircleDotIcon v-else class="h-5 w-5" />
                  </div>
                  
                  <div v-if="index !== location.history.length - 1" class="h-full w-px bg-muted mt-1"></div>
                </div>
                
                <div class="pb-6">
                  <div class="text-sm font-medium">{{ event.description }}</div>
                  <div class="text-muted-foreground text-xs mb-1.5">
                    {{ formatDate(event.timestamp) }} at {{ formatTime(event.timestamp) }}
                  </div>
                  <div class="text-sm">{{ event.details }}</div>
                  <div class="text-xs text-muted-foreground mt-1">
                    By {{ event.user || 'System' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8">
            <HistoryIcon class="h-12 w-12 mx-auto text-muted-foreground/30 mb-2" />
            <p class="text-muted-foreground">No history events available</p>
          </div>
        </TabsContent>
        
        <!-- Sub-locations Tab -->
        <TabsContent value="sublocations" class="space-y-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium">Sub-locations</h3>
            <Button 
              size="sm" 
              @click="$emit('create-location', location)"
              v-if="canHaveChildren"
            >
              <PlusIcon class="h-4 w-4 mr-2" />
              Add Sub-location
            </Button>
          </div>
          
          <div v-if="childLocations.length > 0">
            <div class="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead class="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="child in childLocations" :key="child.id">
                    <TableCell class="font-medium">{{ child.name }}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{{ formatLocationType(child.type) }}</Badge>
                    </TableCell>
                    <TableCell>{{ child.code || '-' }}</TableCell>
                    <TableCell>
                      <Badge :variant="child.status === 'active' ? 'success' : 'secondary'">
                        {{ formatStatus(child.status) }}
                      </Badge>
                    </TableCell>
                    <TableCell>{{ child.itemCount || 0 }}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontalIcon class="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem @click="$emit('view-location', child)">
                            <EyeIcon class="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem @click="$emit('edit-location', child)">
                            <PencilIcon class="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem @click="$emit('delete-location', child)" class="text-destructive">
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
          <div v-else class="text-center py-8">
            <LayoutGridIcon class="h-12 w-12 mx-auto text-muted-foreground/30 mb-2" />
            <p class="text-muted-foreground mb-4">
              {{ canHaveChildren ? 'No sub-locations found' : 'This location type cannot have sub-locations' }}
            </p>
            <Button 
              size="sm" 
              @click="$emit('create-location', location)"
              v-if="canHaveChildren"
            >
              Add Sub-location
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>

    <DialogFooter class="flex justify-between">
      <div>
        <Button variant="outline" @click="$emit('delete-location', location)" class="text-destructive hover:text-destructive">
          <TrashIcon class="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
      <div class="space-x-2">
        <Button variant="outline" @click="$emit('close')">
          Close
        </Button>
        <Button @click="$emit('edit-location', location)">
          <PencilIcon class="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { computed } from 'vue';
import { format } from 'date-fns';
import {
  ExternalLinkIcon,
  HistoryIcon,
  PackageIcon,
  PackageXIcon,
  PencilIcon,
  TrashIcon,
  EditIcon,
  CircleDotIcon,
  PlusIcon,
  MoreHorizontalIcon,
  EyeIcon,
  LayoutGridIcon,
  RefreshCwIcon,
  AlignEndHorizontalIcon
} from 'lucide-vue-next';
import {
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
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
    required: true,
    default: () => ({})
  },
  warehouseHierarchy: {
    type: Object,
    default: null
  }
});

// Emits
const emit = defineEmits([
  'close', 
  'edit-location', 
  'delete-location', 
  'view-location',
  'create-location',
  'assign-items',
  'refresh-hierarchy'
]);

// Computed
const warehouseHierarchy = computed(() => props.warehouseHierarchy);

const childLocations = computed(() => {
  const children = props.location.children || [];
  return Array.isArray(children) ? children : [];
});

const canHaveChildren = computed(() => {
  return props.location.type !== 'bin'; // Bins can't have sub-locations
});

// Warehouse hierarchy stats
const hierarchyStats = computed(() => {
  if (!props.warehouseHierarchy || props.location.type !== 'warehouse') {
    return { zones: 0, aisles: 0, shelves: 0 };
  }
  
  let zones = 0;
  let aisles = 0;
  let shelves = 0;
  
  const countInHierarchy = (nodes) => {
    nodes.forEach(node => {
      if (node.locationType === 'ZONE') zones++;
      else if (node.locationType === 'AISLE') aisles++;
      else if (node.locationType === 'SHELF') shelves++;
      
      if (node.children && node.children.length > 0) {
        countInHierarchy(node.children);
      }
    });
  };
  
  if (props.warehouseHierarchy?.locationHierarchy) {
    countInHierarchy(props.warehouseHierarchy.locationHierarchy);
  }
  
  return { zones, aisles, shelves };
});

// Helper functions
const formatLocationType = (type) => {
  if (!type) return 'Unknown';
  return type.charAt(0).toUpperCase() + type.slice(1);
};

const formatStatus = (status) => {
  if (!status) return 'Unknown';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return format(new Date(date), 'MMM d, yyyy');
};

const formatTime = (date) => {
  if (!date) return '';
  return format(new Date(date), 'h:mm a');
};

const formatAttributeName = (name) => {
  if (!name) return '';
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
};

const getParentName = (parentId) => {
  return 'Parent Location'; // In real implementation, you'd look up the parent name
};

const viewParent = (parentId) => {
  // In real implementation, you'd emit an event to view the parent location
  console.log('View parent:', parentId);
};

const getUtilizationPercentage = () => {
  if (!props.location.capacity || props.location.capacity <= 0) return 0;
  const itemCount = props.location.itemCount || 0;
  return Math.min(Math.round((itemCount / props.location.capacity) * 100), 100);
};

const getAvailableSpace = () => {
  if (!props.location.capacity) return 'Unlimited';
  const itemCount = props.location.itemCount || 0;
  return Math.max(0, props.location.capacity - itemCount);
};

const calculateArea = () => {
  if (!props.location.dimensions) return 'N/A';
  return (props.location.dimensions.length * props.location.dimensions.width).toFixed(2);
};

const refreshHierarchy = async () => {
  // Emit event to parent to handle the warehouse data fetching
  emit('refresh-hierarchy', props.location.id);
};

// Remove the onMounted hook since parent will handle data fetching
</script>