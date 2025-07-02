<template>
  <DialogContent class="sm:max-w-6xl max-h-[90vh]">
    <DialogHeader class="border-b pb-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <component :is="getLocationIcon(location.type)" class="h-6 w-6" :class="getLocationIconColor(location.type)" />
            <div>
              <DialogTitle class="text-2xl font-semibold">{{ location.name }}</DialogTitle>
              <DialogDescription class="flex items-center space-x-3 mt-1">
                <span class="text-sm">{{ location.code }}</span>
                <span class="text-xs text-muted-foreground">•</span>
                <Badge :variant="getStatusVariant(location.status || location.isActive)">
                  {{ formatStatus(location.status || location.isActive) }}
                </Badge>
                <span class="text-xs text-muted-foreground">•</span>
                <span class="text-xs text-muted-foreground">{{ formatLocationType(location.type) }}</span>
              </DialogDescription>
            </div>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <Button size="sm" variant="outline" @click="refreshHierarchy" :disabled="isRefreshing">
            <RefreshCwIcon class="h-4 w-4" :class="{ 'animate-spin': isRefreshing }" />
          </Button>
          <Button size="sm" @click="$emit('edit-location', location)">
            <PencilIcon class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </DialogHeader>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 py-6 overflow-y-auto max-h-[calc(90vh-200px)]">
      <!-- Left Column - Basic Info & Stats -->
      <div class="space-y-6">
        <!-- Basic Information -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold">Information</h3>
          
          <div class="space-y-3">
            <div>
              <span class="text-xs font-medium text-muted-foreground">Description</span>
              <p class="text-sm mt-1">{{ location.description || 'No description provided' }}</p>
            </div>
            
            <div v-if="isWarehouse" class="space-y-2">
              <div v-if="location.addressLine1">
                <span class="text-xs font-medium text-muted-foreground">Address</span>
                <div class="text-sm mt-1 space-y-1">
                  <p>{{ location.addressLine1 }}</p>
                  <p v-if="location.addressLine2">{{ location.addressLine2 }}</p>
                  <p>{{ [location.city, location.state, location.postalCode].filter(Boolean).join(', ') }}</p>
                  <p v-if="location.country">{{ location.country }}</p>
                </div>
              </div>
              
              <div v-if="location.contactPerson">
                <span class="text-xs font-medium text-muted-foreground">Contact</span>
                <div class="text-sm mt-1 space-y-1">
                  <p>{{ location.contactPerson }}</p>
                  <p v-if="location.contactPhone" class="text-muted-foreground">{{ location.contactPhone }}</p>
                  <p v-if="location.contactEmail" class="text-muted-foreground">{{ location.contactEmail }}</p>
                </div>
              </div>
            </div>
            
            <div v-if="!isWarehouse && location.path">
              <span class="text-xs font-medium text-muted-foreground">Location Path</span>
              <p class="text-sm mt-1 font-mono bg-muted/30 px-2 py-1 rounded">{{ location.path }}</p>
            </div>
            
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-xs font-medium text-muted-foreground">Created</span>
                <p class="mt-1">{{ formatDate(location.created) }}</p>
              </div>
              <div>
                <span class="text-xs font-medium text-muted-foreground">Updated</span>
                <p class="mt-1">{{ formatDate(location.updated) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Capacity Stats -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold">Capacity</h3>
          
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="text-center p-3 bg-muted/30 rounded-lg">
                <p class="text-2xl font-bold">{{ formatNumber(getCapacityData().total) }}</p>
                <p class="text-xs text-muted-foreground">Total Capacity</p>
              </div>
              <div class="text-center p-3 bg-muted/30 rounded-lg">
                <p class="text-2xl font-bold">{{ formatNumber(getCapacityData().used) }}</p>
                <p class="text-xs text-muted-foreground">Used</p>
              </div>
            </div>
            
            <div>
              <div class="flex justify-between text-sm mb-2">
                <span>Utilization</span>
                <span>{{ getCapacityData().utilization }}%</span>
              </div>
              <div class="w-full bg-muted rounded-full h-2">
                <div 
                  class="h-2 rounded-full transition-all duration-300"
                  :class="getUtilizationColor(getCapacityData().utilization)"
                  :style="{ width: `${getCapacityData().utilization}%` }"
                ></div>
              </div>
            </div>
            
            <div class="text-center p-2 border rounded-lg">
              <p class="text-lg font-semibold">{{ formatNumber(getCapacityData().available) }}</p>
              <p class="text-xs text-muted-foreground">Available Space</p>
            </div>
          </div>
        </div>

        <!-- Location Properties -->
        <div v-if="!isWarehouse" class="space-y-4">
          <h3 class="text-lg font-semibold">Properties</h3>
          
          <div class="space-y-3">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div class="flex items-center space-x-2">
                <component :is="location.canReceive ? CheckCircleIcon : XCircleIcon" 
                  class="h-4 w-4" 
                  :class="location.canReceive ? 'text-green-500' : 'text-muted-foreground'" 
                />
                <span>Can Receive</span>
              </div>
              <div class="flex items-center space-x-2">
                <component :is="location.pickable ? CheckCircleIcon : XCircleIcon" 
                  class="h-4 w-4" 
                  :class="location.pickable ? 'text-green-500' : 'text-muted-foreground'" 
                />
                <span>Pickable</span>
              </div>
            </div>
            
            <div v-if="location.barcode" class="border rounded-lg p-3 bg-muted/10">
              <span class="text-xs font-medium text-muted-foreground">Barcode</span>
              <p class="font-mono text-sm mt-1">{{ location.barcode }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column - Hierarchy Tree -->
      <div class="lg:col-span-2 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">
            {{ isWarehouse ? 'Warehouse Structure' : 'Location Tree' }}
          </h3>
          <div class="flex items-center space-x-2">
            <Button size="sm" variant="outline" @click="$emit('create-location', location)" v-if="canAddChildren">
              <PlusIcon class="h-4 w-4 mr-2" />
              Add {{ getChildType() }}
            </Button>
          </div>
        </div>

        <!-- Hierarchy Tree -->
        <div class="border rounded-lg bg-muted/10 min-h-[400px]">
          <div v-if="isWarehouse && warehouseHierarchy" class="p-6">
            <!-- Warehouse Tree Root -->
            <div class="space-y-4">
              <!-- Warehouse Stats Header -->
              <div class="grid grid-cols-4 gap-4 mb-6">
                <div class="text-center p-3 bg-background rounded-lg border">
                  <p class="text-lg font-bold">{{ warehouseHierarchy.totalLocations || 0 }}</p>
                  <p class="text-xs text-muted-foreground">Total Locations</p>
                </div>
                <div class="text-center p-3 bg-background rounded-lg border">
                  <p class="text-lg font-bold">{{ warehouseHierarchy.activeLocations || 0 }}</p>
                  <p class="text-xs text-muted-foreground">Active</p>
                </div>
                <div class="text-center p-3 bg-background rounded-lg border">
                  <p class="text-lg font-bold">{{ warehouseHierarchy.pickableLocations || 0 }}</p>
                  <p class="text-xs text-muted-foreground">Pickable</p>
                </div>
                <div class="text-center p-3 bg-background rounded-lg border">
                  <p class="text-lg font-bold">{{ warehouseHierarchy.maxDepth || 0 }}</p>
                  <p class="text-xs text-muted-foreground">Max Depth</p>
                </div>
              </div>

              <!-- Tree Structure -->
              <div class="space-y-3">
                <div v-if="hasHierarchyData">
                  <!-- Use HierarchyTreeNode for recursive tree display -->
                  <HierarchyTreeNode
                    v-for="zone in warehouseHierarchy.locationHierarchy"
                    :key="zone.id"
                    :node="zone"
                    :level="0"
                    :is-highlighted="idsMatch(zone.id, location.id)"
                    :highlighted-location-id="location.id"
                    @view-location="$emit('view-location', $event)"
                    @edit-location="$emit('edit-location', $event)"
                    @create-location="$emit('create-location', $event)"
                  />
                </div>
                <div v-else class="text-center py-12">
                  <LayoutGridIcon class="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p class="text-muted-foreground mb-4">No zones configured yet</p>
                  <Button size="sm" @click="$emit('create-location', location)">
                    <PlusIcon class="h-4 w-4 mr-2" />
                    Add First Zone
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- For non-warehouse locations with hierarchy data, show tree context -->
          <div v-else-if="!isWarehouse && warehouseHierarchy && hasHierarchyData" class="p-6">
            <div class="space-y-4">
              <!-- Current Location Highlight -->
              <div class="mb-6 p-4 bg-accent/10 border rounded-lg">
                <div class="flex items-center space-x-3">
                  <component :is="getLocationIcon(location.type)" 
                    class="h-6 w-6" 
                    :class="getLocationIconColor(location.type)" 
                  />
                  <div>
                    <h4 class="text-lg font-semibold">{{ location.name }}</h4>
                    <p class="text-sm text-muted-foreground">{{ location.code }} | {{ formatLocationType(location.type) }}</p>
                    <p class="text-xs text-muted-foreground mt-1">{{ location.path }}</p>
                  </div>
                </div>
              </div>
              
              <!-- Show relevant tree structure based on location type -->
              <div class="space-y-3">
                <h4 class="text-md font-medium">{{ getTreeStructureTitle() }}</h4>
                
                <HierarchyTreeNode
                  v-for="node in getRelevantTreeNodes()"
                  :key="node.id"
                  :node="node"
                  :level="0"
                  :is-highlighted="idsMatch(node.id, location.id)"
                  :highlighted-location-id="location.id"
                  @view-location="$emit('view-location', $event)"
                  @edit-location="$emit('edit-location', $event)"
                  @create-location="$emit('create-location', $event)"
                />
              </div>
            </div>
          </div>
          
          <!-- Simple non-warehouse location view (no hierarchy data) -->
          <div v-else-if="!isWarehouse" class="p-6">
            <div class="space-y-4">
              <div class="text-center py-8">
                <component :is="getLocationIcon(location.type)" 
                  class="h-16 w-16 mx-auto mb-4" 
                  :class="getLocationIconColor(location.type)" 
                />
                <h4 class="text-lg font-semibold mb-2">{{ location.name }}</h4>
                <p class="text-sm text-muted-foreground mb-4">{{ location.path }}</p>
                
                <div class="flex justify-center space-x-2">
                  <Button size="sm" variant="outline" @click="$emit('edit-location', location)">
                    <PencilIcon class="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" @click="$emit('create-location', location)" v-if="canAddChildren">
                    <PlusIcon class="h-4 w-4 mr-2" />
                    Add {{ getChildType() }}
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Loading State -->
          <div v-else-if="isRefreshing" class="flex items-center justify-center py-12">
            <RefreshCwIcon class="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>

    <DialogFooter class="border-t pt-4">
      <div class="flex justify-between w-full">
        <Button variant="outline" @click="$emit('delete-location', location)" class="text-destructive hover:text-destructive">
          <TrashIcon class="h-4 w-4 mr-2" />
          Delete
        </Button>
        <div class="space-x-2">
          <Button variant="outline" @click="$emit('close')">
            Close
          </Button>
          <Button @click="$emit('assign-items', location)">
            <PackageIcon class="h-4 w-4 mr-2" />
            Assign Items
          </Button>
        </div>
      </div>
    </DialogFooter>
  </DialogContent>
</template>

<script setup>
import { computed, ref } from 'vue'
import { format } from 'date-fns'
import {
  BuildingIcon,
  LayoutGridIcon,
  AlignJustifyIcon,
  PackageIcon,
  RefreshCwIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon
} from 'lucide-vue-next'
import {
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import HierarchyTreeNode from './HierarchyTreeNode.vue'

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
})

// Emits
const emit = defineEmits([
  'close', 
  'edit-location', 
  'delete-location', 
  'view-location',
  'create-location',
  'assign-items',
  'refresh-hierarchy'
])

// State
const isRefreshing = ref(false)

// Computed properties
const isWarehouse = computed(() => props.location.type === 'warehouse')

const canAddChildren = computed(() => {
  return props.location.type !== 'shelf' // All types except shelf can have children
})

// Helper functions
const getLocationIcon = (type) => {
  switch (type) {
    case 'warehouse': return BuildingIcon
    case 'zone': return LayoutGridIcon
    case 'aisle': return AlignJustifyIcon
    case 'shelf': return PackageIcon
    default: return PackageIcon
  }
}

const getLocationIconColor = (type) => {
  switch (type) {
    case 'warehouse': return 'text-blue-600'
    case 'zone': return 'text-purple-600'
    case 'aisle': return 'text-amber-600'
    case 'shelf': return 'text-green-600'
    default: return 'text-muted-foreground'
  }
}

const getStatusVariant = (status) => {
  if (typeof status === 'boolean') {
    return status ? 'default' : 'secondary'
  }
  return status === 'active' ? 'default' : 'secondary'
}

const formatStatus = (status) => {
  if (typeof status === 'boolean') {
    return status ? 'Active' : 'Inactive'
  }
  return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'
}

const formatLocationType = (type) => {
  if (!type) return 'Unknown'
  return type.charAt(0).toUpperCase() + type.slice(1)
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return format(new Date(date), 'MMM d, yyyy h:mm a')
}

const formatNumber = (num) => {
  if (num === null || num === undefined) return '0'
  return num.toLocaleString()
}

const getChildType = () => {
  switch (props.location.type) {
    case 'warehouse': return 'Zone'
    case 'zone': return 'Aisle'
    case 'aisle': return 'Shelf'
    default: return 'Location'
  }
}

const getCapacityData = () => {
  if (isWarehouse.value && props.warehouseHierarchy) {
    return {
      total: props.warehouseHierarchy.totalCapacity || 0,
      used: props.warehouseHierarchy.usedCapacity || 0,
      available: props.warehouseHierarchy.availableCapacity || 0,
      utilization: Math.round((props.warehouseHierarchy.capacityUtilization || 0) * 100)
    }
  } else {
    const total = props.location.maxCapacity || 0
    const used = props.location.currentCapacity || 0
    const available = total - used
    const utilization = total > 0 ? Math.round((used / total) * 100) : 0
    
    return { total, used, available, utilization }
  }
}

// Helper to check if hierarchy data is available and has locations
const hasHierarchyData = computed(() => {
  return props.warehouseHierarchy && 
         props.warehouseHierarchy.locationHierarchy && 
         props.warehouseHierarchy.locationHierarchy.length > 0
})

const getUtilizationColor = (utilization) => {
  if (utilization >= 90) return 'bg-red-500'
  if (utilization >= 75) return 'bg-amber-500'
  if (utilization >= 50) return 'bg-blue-500'
  return 'bg-green-500'
}

const refreshHierarchy = async () => {
  // Determine the warehouse ID to refresh
  let warehouseId = null
  
  if (isWarehouse.value) {
    warehouseId = props.location.id
  } else if (props.location.warehouseId) {
    warehouseId = props.location.warehouseId
  }
  
  if (warehouseId) {
    isRefreshing.value = true
    try {
      await emit('refresh-hierarchy', warehouseId)
    } finally {
      isRefreshing.value = false
    }
  }
}

// Transform node data to match location format expected by parent components
const transformNodeToLocation = (node) => {
  return {
    id: node.id,
    name: node.name,
    code: node.code,
    description: node.description,
    type: node.locationType.toLowerCase(), // Convert ZONE -> zone, etc.
    status: node.isActive ? 'active' : 'inactive',
    isActive: node.isActive,
    path: node.path,
    maxCapacity: node.maxCapacity,
    currentCapacity: node.currentCapacity,
    availableCapacity: node.availableCapacity,
    capacityUtilization: node.capacityUtilization,
    canReceive: node.canReceive,
    pickable: node.pickable || node.canPick,
    barcode: node.barcode,
    parentLocationId: node.parentLocationId,
    parentLocationName: node.parentLocationName,
    warehouseId: node.warehouseId,
    warehouseName: node.warehouseName,
    created: node.created,
    updated: node.updated,
    children: node.children || []
  }
}

// Get tree structure title based on current location type
const getTreeStructureTitle = () => {
  switch (props.location.type) {
    case 'zone': return `Zone: ${props.location.name} - Aisles & Shelves`
    case 'aisle': return `Aisle: ${props.location.name} - Location Context`
    case 'shelf': return `Shelf: ${props.location.name} - Location Context`
    default: return 'Location Structure'
  }
}

// Helper function to extract numeric ID from string IDs like "zone-1"
const extractNumericId = (id) => {
  if (typeof id === 'number') return id
  if (typeof id === 'string') {
    // Extract number from strings like "zone-1", "aisle-2", "shelf-3"
    const match = id.match(/(\d+)$/)
    return match ? parseInt(match[1], 10) : null
  }
  return null
}

// Helper function to check if two IDs match (handles string/number comparison)
const idsMatch = (id1, id2) => {
  const numId1 = extractNumericId(id1)
  const numId2 = extractNumericId(id2)
  return numId1 !== null && numId2 !== null && numId1 === numId2
}

// Get relevant tree nodes based on current location type
const getRelevantTreeNodes = () => {
  if (!props.warehouseHierarchy || !props.warehouseHierarchy.locationHierarchy) {
    return []
  }

  const findNodeInTree = (nodes, targetId) => {
    for (const node of nodes) {
      // Use the improved ID matching function
      if (idsMatch(node.id, targetId)) {
        return node
      }
      if (node.children && node.children.length > 0) {
        const found = findNodeInTree(node.children, targetId)
        if (found) return found
      }
    }
    return null
  }

  const currentLocationId = props.location.id
  
  switch (props.location.type) {
    case 'zone': {
      // For zone, find and return only this specific zone with ALL its children (aisles and shelves)
      const zoneNode = findNodeInTree(props.warehouseHierarchy.locationHierarchy, currentLocationId)
      if (zoneNode) {
        return [zoneNode]
      }
      return []
    }
    case 'aisle': {
      // For aisle, find the zone that contains this aisle and return just that zone
      for (const zone of props.warehouseHierarchy.locationHierarchy) {
        if (zone.children && zone.children.length > 0) {
          const aisleFound = zone.children.find(aisle => idsMatch(aisle.id, currentLocationId))
          if (aisleFound) {
            return [zone]
          }
        }
      }
      return []
    }
    case 'shelf': {
      // For shelf, find the zone that contains this shelf and return just that zone
      for (const zone of props.warehouseHierarchy.locationHierarchy) {
        if (zone.children && zone.children.length > 0) {
          for (const aisle of zone.children) {
            if (aisle.children && aisle.children.length > 0) {
              const shelfFound = aisle.children.find(shelf => idsMatch(shelf.id, currentLocationId))
              if (shelfFound) {
                return [zone]
              }
            }
          }
        }
      }
      return []
    }
    default:
      // For warehouse or unknown types, return all zones
      return props.warehouseHierarchy.locationHierarchy || []
  }
}
</script>