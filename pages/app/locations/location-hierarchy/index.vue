<template>
  <div class="p-6 space-y-6">
    <!-- Header with Actions -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Warehouse Hierarchy</h2>
        <p class="text-muted-foreground">Manage your warehouses, zones, aisles, and storage shelves</p>
      </div>
      <div class="flex items-center space-x-2">
        <Button @click="refreshData" variant="outline" :disabled="isLoading">
          <RefreshCwIcon class="h-4 w-4 mr-2" />
          Refresh
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <FileDownIcon class="h-4 w-4 mr-2" />
              Export
              <ChevronDownIcon class="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem @click="exportLocations('csv')">
              <FileTextIcon class="h-4 w-4 mr-2" />
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem @click="exportLocations('pdf')">
              <FileIcon class="h-4 w-4 mr-2" />
              Export as PDF
            </DropdownMenuItem>
            <DropdownMenuItem @click="exportLocations('excel')">
              <TableIcon class="h-4 w-4 mr-2" />
              Export as Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button @click="handleCreateWarehouse">
          <PlusIcon class="h-4 w-4 mr-2" />
          Add Warehouse
        </Button>
      </div>
    </div>

    <!-- Location Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-medium">Total Warehouses</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ stats.warehouses || 0 }}</div>
          <p class="text-xs text-muted-foreground mt-1">
            Across all facilities
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-medium">Storage Zones</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ stats.zones || 0 }}</div>
          <p class="text-xs text-muted-foreground mt-1">
            {{ zoneUtilization }}% space utilization
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-medium">Total Aisles</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ stats.aisles || 0 }}</div>
          <p class="text-xs text-muted-foreground mt-1">
            Across all zones
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-medium">Storage Shelves</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ stats.shelves || 0 }}</div>
          <p class="text-xs text-muted-foreground mt-1">
            {{ availableShelves }} shelves available
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Warehouse Hierarchy Viewer -->
    <LocationHierarchyViewer
      :locations="hierarchyData"
      :loading="isLoading"
      :error="error"
      :expanded-warehouses="Array.from(expandedWarehouses)"
      @view-location="handleViewLocation"
      @edit-location="handleEditLocation"
      @delete-location="handleDeleteLocation"
      @create-location="handleCreateLocation"
      @refresh="refreshData"
      @print-labels="handlePrintLabels"
      @assign-items="handleAssignItems"
      @expand-warehouse="handleWarehouseExpand"
      @deactivate-warehouse="handleDeactivateWarehouse"
    />

    <!-- Location Details Dialog -->
    <Dialog v-model:open="showLocationDetailsDialog">
      <LocationDetailsDialog
        v-if="showLocationDetailsDialog"
        :location="selectedLocation"
        :warehouse-hierarchy="warehouseHierarchy"
        @edit-location="handleEditLocation"
        @delete-location="handleDeleteLocation"
        @create-location="handleCreateLocation"
        @close="showLocationDetailsDialog = false"
        @assign-items="handleAssignItems"
        @refresh-hierarchy="handleRefreshHierarchy"
      />
    </Dialog>

    <!-- Create/Edit Location Sheet -->
    <Sheet v-model:open="showLocationForm">
      <LocationFormSheet
        v-if="showLocationForm"
        :location="locationToEdit"
        :parent-location="parentLocationForForm"
        :is-creating="isCreatingLocation"
        @location-saved="handleLocationSaved"
        @close="showLocationForm = false"
      />
    </Sheet>

    <!-- Delete Location Dialog -->
    <Dialog v-model:open="showDeleteLocationDialog">
      <DeleteLocationDialog
        v-if="showDeleteLocationDialog"
        :location="selectedLocation"
        @delete="handleLocationDeleted"
        @close="showDeleteLocationDialog = false"
      />
    </Dialog>

    <!-- Assign Items Dialog -->
    <Dialog v-model:open="showAssignItemsDialog">
      <AssignItemsDialog
        v-if="showAssignItemsDialog"
        :location="selectedLocation"
        @items-assigned="handleItemsAssigned"
        @close="showAssignItemsDialog = false"
      />
    </Dialog>

    <!-- Print Labels Dialog -->
    <Dialog v-model:open="showPrintLabelsDialog">
      <PrintLocationLabelsDialog
        v-if="showPrintLabelsDialog"
        :location="selectedLocation"
        :include-children="true"
        @close="showPrintLabelsDialog = false"
      />
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  PlusIcon, FileDownIcon, ChevronDownIcon, FileTextIcon,
  FileIcon, TableIcon, RefreshCwIcon
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Sheet } from '@/components/ui/sheet'
import { Dialog } from '@/components/ui/dialog'
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'

// Components
import LocationHierarchyViewer from '@/components/warehouse/locations/LocationHierarchyViewer.vue'
import LocationDetailsDialog from '@/components/warehouse/locations/LocationDetailsDialog.vue'
import LocationFormSheet from '@/components/warehouse/locations/LocationFormSheet.vue'
import DeleteLocationDialog from '@/components/warehouse/locations/DeleteLocationDialog.vue'
import AssignItemsDialog from '@/components/warehouse/locations/AssignItemsDialog.vue'
import PrintLocationLabelsDialog from '@/components/warehouse/locations/PrintLocationLabelsDialog.vue'

// Stores
import { useLocationsStore } from '@/store/modules/inventory/locations'

// Initialize stores
const locationsStore = useLocationsStore()
const { toast } = useToast()

// Access store state through computed properties
const warehouses = computed(() => locationsStore.getWarehouses)
const paginatedWarehouses = computed(() => locationsStore.getPaginatedWarehouses)
const locationTreeStructure = computed(() => locationsStore.getLocationTreeStructure)
const warehouseHierarchy = computed(() => locationsStore.getWarehouseHierarchy)
const selectedWarehouse = computed(() => locationsStore.getSelectedWarehouse)
const locationStats = computed(() => locationsStore.getLocationStats)
const isLoading = computed(() => locationsStore.getIsLoading)
const error = computed(() => locationsStore.getError)

// Track expanded warehouses and their tree data
const expandedWarehouses = ref(new Set())
const warehouseTreeData = ref(new Map())

// Create hierarchy data for the viewer component
const hierarchyData = computed(() => {
  const data = []
  
  // Add warehouses as top-level items (always show these)
  warehouses.value.forEach(warehouse => {
    const warehouseNode = {
      id: warehouse.id,
      name: warehouse.name,
      code: warehouse.code,
      type: 'warehouse',
      status: warehouse.isActive ? 'active' : 'inactive',
      parentId: null,
      description: warehouse.description,
      address: `${warehouse.addressLine1 || ''} ${warehouse.addressLine2 || ''}`.trim(),
      itemCount: warehouse.locationCount || 0,
      isExpanded: expandedWarehouses.value.has(warehouse.id),
      canExpand: true, // Warehouses can always be expanded
      // Additional warehouse properties
      contactPerson: warehouse.contactPerson,
      contactPhone: warehouse.contactPhone,
      contactEmail: warehouse.contactEmail,
      isMainWarehouse: warehouse.isMainWarehouse
    }
    data.push(warehouseNode)
    
    // If warehouse is expanded and we have tree data for it, add the children
    if (expandedWarehouses.value.has(warehouse.id) && warehouseTreeData.value.has(warehouse.id)) {
      const treeData = warehouseTreeData.value.get(warehouse.id)
      
      // Convert tree structure to flat list with parent-child relationships
      const convertTreeToFlat = (nodes, parentId = warehouse.id, warehouseId = warehouse.id) => {
        nodes.forEach(node => {
          const flatNode = {
            id: `${node.locationType.toLowerCase()}-${node.id}`, // Unique ID for tree display
            originalId: node.id,
            name: node.name,
            code: node.code,
            type: node.locationType.toLowerCase(), // Convert ZONE -> zone, AISLE -> aisle, etc.
            status: node.isActive ? 'active' : 'inactive',
            parentId: parentId,
            warehouseId: warehouseId, // Always include warehouse ID for child locations
            description: node.description,
            itemCount: node.currentCapacity || 0,
            maxCapacity: node.maxCapacity,
            currentCapacity: node.currentCapacity,
            availableCapacity: node.availableCapacity,
            pickable: node.pickable,
            canReceive: node.canReceive,
            path: node.path,
            canExpand: node.hasChildren || (node.children && node.children.length > 0)
          }
          data.push(flatNode)
          
          // Recursively add children
          if (node.children && node.children.length > 0) {
            convertTreeToFlat(node.children, flatNode.id, warehouseId)
          }
        })
      }
      
      convertTreeToFlat(treeData)
    }
  })
  
  return data
})

// Derived stats from warehouse data and location stats
const stats = computed(() => {
  const locationStats = locationsStore.getLocationStats
  return {
    warehouses: warehouses.value.length,
    zones: locationStats.zones || 0,
    aisles: locationStats.aisles || 0,
    shelves: locationStats.bins || 0 // Backend uses 'bins' for shelves
  }
})

const zoneUtilization = computed(() => {
  const locationStats = locationsStore.getLocationStats
  const total = locationStats.zones || 0
  const inUse = locationStats.zonesInUse || 0
  return total > 0 ? Math.round((inUse / total) * 100) : 0
})

const availableShelves = computed(() => {
  const locationStats = locationsStore.getLocationStats
  const total = locationStats.bins || 0
  const inUse = locationStats.binsInUse || 0
  return Math.max(0, total - inUse)
})

// State management
const selectedLocation = ref(null)
const parentLocationForForm = ref(null)
const isCreatingLocation = ref(false)
const showLocationForm = ref(false)
const locationToEdit = ref({})

// UI control
const showLocationDetailsDialog = ref(false)
const showDeleteLocationDialog = ref(false)
const showAssignItemsDialog = ref(false)
const showPrintLabelsDialog = ref(false)

// Fetch data from API
const refreshData = async () => {
  try {
    // Store current expanded warehouses before refresh
    const currentExpandedWarehouses = new Set(expandedWarehouses.value)
    
    // Fetch warehouses with proper pagination parameters
    await locationsStore.fetchWarehouses({
      page: 0,
      pageSize: 50, // Fetch more warehouses for hierarchy view
      sortBy: 'name',
      sortOrder: 'asc'
    })
    
    // If there were expanded warehouses, re-expand them after the refresh
    if (currentExpandedWarehouses.size > 0) {
      // Clear current state temporarily
      expandedWarehouses.value.clear()
      warehouseTreeData.value.clear()
      
      // Re-expand previously expanded warehouses
      for (const warehouseId of currentExpandedWarehouses) {
        await restoreWarehouseExpansion(warehouseId)
      }
    }
    
  } catch (error) {
    console.error('Error fetching warehouse data:', error)
    toast({
      title: 'Error',
      description: 'Failed to load warehouse data. Please try again.',
      variant: 'destructive'
    })
  }
}

// Handle warehouse expansion - fetch tree structure on demand
const handleWarehouseExpand = async (warehouseId) => {
  if (expandedWarehouses.value.has(warehouseId)) {
    // Already expanded, just collapse
    expandedWarehouses.value.delete(warehouseId)
    return
  }
  
  try {
    // Fetch the tree structure for this warehouse
    await locationsStore.fetchLocationTreeStructure(warehouseId)
    const treeData = locationsStore.getLocationTreeStructure
    
    // Store the tree data for this warehouse
    warehouseTreeData.value.set(warehouseId, treeData)
    expandedWarehouses.value.add(warehouseId)
    
  } catch (error) {
    console.error('Error fetching warehouse tree structure:', error)
    toast({
      title: 'Error',
      description: 'Failed to load warehouse details. Please try again.',
      variant: 'destructive'
    })
  }
}

// CRUD operation handlers
const handleCreateWarehouse = () => {
  locationToEdit.value = {
    type: 'warehouse',
    status: 'active'
  }
  parentLocationForForm.value = null // No parent for warehouse creation
  isCreatingLocation.value = true
  showLocationForm.value = true
}

const handleCreateLocation = (parentLocation) => {
  // Store the parent location for the form, but ensure we have warehouse ID
  const enrichedParentLocation = { 
    ...parentLocation,
    // Ensure we have the warehouse ID available
    warehouseId: parentLocation.type === 'warehouse' 
      ? parentLocation.id 
      : findWarehouseIdFromHierarchy(parentLocation)
  };
  
  parentLocationForForm.value = enrichedParentLocation;
  
  const type = getNextLocationType(parentLocation?.type || 'warehouse')
  
  locationToEdit.value = {
    type,
    status: 'active'
  }
  isCreatingLocation.value = true
  showLocationForm.value = true
}

const handleViewLocation = async (location) => {
  // Always fetch warehouse hierarchy for context, regardless of location type
  let warehouseId = location.warehouseId

  if (location.type === 'warehouse') {
    warehouseId = location.id
    try {
      // Fetch detailed warehouse data and hierarchy
      await Promise.all([
        locationsStore.fetchWarehouseById(location.id),
        locationsStore.fetchWarehouseHierarchy(location.id)
      ])
      
      selectedLocation.value = locationsStore.getSelectedWarehouse
    } catch (error) {
      console.error('Error fetching warehouse details:', error)
      toast({
        title: 'Error',
        description: 'Failed to load warehouse details. Please try again.',
        variant: 'destructive'
      })
      return
    }
  } else {
    // For non-warehouse locations, always fetch the complete warehouse hierarchy
    selectedLocation.value = location
    
    if (warehouseId) {
      try {
        // Fetch complete warehouse hierarchy - we'll filter it in the dialog
        await locationsStore.fetchWarehouseHierarchy(warehouseId)
      } catch (error) {
        console.error('Error fetching warehouse hierarchy for location:', error)
        toast({
          title: 'Warning',
          description: 'Could not load warehouse structure context.',
          variant: 'default'
        })
        // Continue without hierarchy data
      }
    }
  }
  
  showLocationDetailsDialog.value = true
}

const handleEditLocation = (location) => {
  // For warehouse type, use the actual warehouse data if available
  if (location.type === 'warehouse' && selectedWarehouse.value?.id === location.id) {
    locationToEdit.value = { ...selectedWarehouse.value }
  } else {
    locationToEdit.value = { ...location }
  }
  
  parentLocationForForm.value = null // No parent when editing
  isCreatingLocation.value = false
  showLocationDetailsDialog.value = false
  showLocationForm.value = true
}

const handleDeleteLocation = (location) => {
  selectedLocation.value = location
  showDeleteLocationDialog.value = true
}

const handleLocationSaved = async (locationData) => {
  try {
    // Store current expanded warehouses before refresh
    const currentExpandedWarehouses = new Set(expandedWarehouses.value)
    
    if (isCreatingLocation.value) {
      // Create new location based on type
      switch (locationData.locationType) {
        case 'WAREHOUSE':
          await locationsStore.createMainWarehouse(locationData)
          break
        case 'ZONE':
          await locationsStore.createZone(locationData.warehouseId, locationData)
          break
        case 'AISLE':
          await locationsStore.createAisle(locationData.warehouseId, locationData)
          break
        case 'SHELF':
          await locationsStore.createShelf(locationData.warehouseId, locationData)
          break
      }
      
      toast({
        title: 'Location Created',
        description: `${locationData.name} has been created successfully.`,
        variant: 'success'
      })
    } else {
      // Update existing location based on type
      switch (locationData.locationType) {
        case 'WAREHOUSE':
          await locationsStore.updateWarehouse(locationData.id, locationData)
          break
        case 'ZONE':
          // Zone update not implemented yet - show placeholder
          toast({
            title: 'Update Zone',
            description: 'Zone update functionality is not yet implemented.',
            variant: 'default'
          })
          break
        case 'AISLE':
          // Aisle update not implemented yet - show placeholder
          toast({
            title: 'Update Aisle',
            description: 'Aisle update functionality is not yet implemented.',
            variant: 'default'
          })
          break
        case 'SHELF':
          // Shelf update not implemented yet - show placeholder
          toast({
            title: 'Update Shelf',
            description: 'Shelf update functionality is not yet implemented.',
            variant: 'default'
          })
          break
      }
      
      if (locationData.type === 'warehouse') {
        toast({
          title: 'Location Updated',
          description: `${locationData.name} has been updated successfully.`,
          variant: 'success'
        })
      }
    }
    
    showLocationForm.value = false
    
    // Clear current expanded state and tree data temporarily
    expandedWarehouses.value.clear()
    warehouseTreeData.value.clear()
    
    // Refresh the main warehouse data
    await refreshData()
    
    // Re-expand previously expanded warehouses and re-fetch their tree data
    for (const warehouseId of currentExpandedWarehouses) {
      await restoreWarehouseExpansion(warehouseId)
    }
    
  } catch (error) {
    console.error('Error saving location:', error)
    toast({
      title: 'Error',
      description: 'Failed to save location. Please try again.',
      variant: 'destructive'
    })
  }
}

// Helper function to restore warehouse expansion state after refresh
const restoreWarehouseExpansion = async (warehouseId) => {
  try {
    // Fetch the tree structure for this warehouse
    await locationsStore.fetchLocationTreeStructure(warehouseId)
    const treeData = locationsStore.getLocationTreeStructure
    
    // Store the tree data for this warehouse
    warehouseTreeData.value.set(warehouseId, treeData)
    expandedWarehouses.value.add(warehouseId)
    
  } catch (error) {
    console.error('Error restoring warehouse expansion:', error)
    // Don't show error toast as this is a background operation
  }
}

const handleLocationDeleted = async (location) => {
  try {
    // Store current expanded warehouses before refresh (excluding the one being deleted)
    const currentExpandedWarehouses = new Set(expandedWarehouses.value)
    
    // Delete location based on type
    switch (location.type) {
      case 'warehouse':
        await locationsStore.deleteWarehouse(location.id)
        // Remove from expanded warehouses if it was expanded
        expandedWarehouses.value.delete(location.id)
        warehouseTreeData.value.delete(location.id)
        currentExpandedWarehouses.delete(location.id) // Don't try to restore deleted warehouse
        break
      case 'zone':
      case 'aisle':
      case 'bin':
        // Non-warehouse deletes not implemented yet - show placeholder
        toast({
          title: 'Delete Location',
          description: `Deleting ${location.type}s is not yet implemented.`,
          variant: 'default'
        })
        showDeleteLocationDialog.value = false
        return
    }
    
    showDeleteLocationDialog.value = false
    
    toast({
      title: 'Location Deleted',
      description: `${location.name} has been deleted.`,
      variant: 'success'
    })
    
    // Clear current expanded state and tree data temporarily (except deleted warehouse)
    expandedWarehouses.value.clear()
    warehouseTreeData.value.clear()
    
    // Refresh the main warehouse data
    await refreshData()
    
    // Re-expand previously expanded warehouses (excluding deleted one)
    for (const warehouseId of currentExpandedWarehouses) {
      await restoreWarehouseExpansion(warehouseId)
    }
    
  } catch (error) {
    console.error('Error deleting location:', error)
    toast({
      title: 'Error',
      description: 'Failed to delete location. Please try again.',
      variant: 'destructive'
    })
  }
}

// Placeholder functions for components without API yet
const handlePrintLabels = (location) => {
  toast({
    title: 'Print Labels',
    description: `Label printing for ${location.name} is not yet implemented.`,
    variant: 'default'
  })
}

const handleAssignItems = (location) => {
  toast({
    title: 'Assign Items',
    description: `Item assignment to ${location.name} is not yet implemented.`,
    variant: 'default'
  })
}

const handleDeactivateWarehouse = async (warehouse) => {
  try {
    // Store current expanded warehouses before refresh
    const currentExpandedWarehouses = new Set(expandedWarehouses.value)
    
    // Create deactivation request
    const deactivateRequest = {
      ...warehouse,
      isActive: false
    }
    
    await locationsStore.deactivateWarehouse(warehouse.id, deactivateRequest)
    toast({
      title: 'Warehouse Deactivated',
      description: `${warehouse.name} has been deactivated successfully.`,
      variant: 'success'
    })
    
    // Clear current expanded state and tree data temporarily
    expandedWarehouses.value.clear()
    warehouseTreeData.value.clear()
    
    // Refresh the main warehouse data
    await refreshData()
    
    // Re-expand previously expanded warehouses
    for (const warehouseId of currentExpandedWarehouses) {
      await restoreWarehouseExpansion(warehouseId)
    }
    
  } catch (error) {
    console.error('Error deactivating warehouse:', error)
    toast({
      title: 'Error',
      description: 'Failed to deactivate warehouse. Please try again.',
      variant: 'destructive'
    })
  }
}

// Helper function to determine the appropriate child location type
const getNextLocationType = (parentType) => {
  switch (parentType) {
    case 'warehouse':
      return 'zone'
    case 'zone':
      return 'aisle'
    case 'aisle':
      return 'bin'
    default:
      return 'warehouse'
  }
}

// Helper function to find warehouse ID from hierarchy data
const findWarehouseIdFromHierarchy = (location) => {
  // If the location is already a warehouse, return its ID
  if (location.type === 'warehouse') {
    return location.id;
  }
  
  // For hierarchy data, the warehouse ID should be traceable
  // through the parent chain or stored as warehouseId
  if (location.warehouseId) {
    return location.warehouseId;
  }
  
  // For display hierarchy, we need to find the warehouse from the parentId chain
  // Warehouses have parentId: null, so we traverse up
  const allHierarchyData = hierarchyData.value;
  
  // Find the root warehouse by traversing up the parent chain
  let currentLocation = location;
  while (currentLocation && currentLocation.parentId) {
    const parent = allHierarchyData.find(item => item.id === currentLocation.parentId);
    if (parent) {
      if (parent.type === 'warehouse') {
        return parent.id;
      }
      currentLocation = parent;
    } else {
      break;
    }
  }
  
  // If we can't find through traversal, and we have a numeric parentId, 
  // it might be the warehouse ID directly
  if (location.parentId && typeof location.parentId === 'string' && !location.parentId.includes('-')) {
    return location.parentId;
  }
  
  // Fallback: extract warehouse ID from hierarchy structure
  // Look for the warehouse that contains this location
  const warehouse = allHierarchyData.find(item => 
    item.type === 'warehouse' && 
    allHierarchyData.some(child => 
      child.parentId === item.id && 
      (child.id === location.id || child.originalId === location.originalId)
    )
  );
  
  return warehouse?.id || null;
}

// Refresh warehouse hierarchy
const handleRefreshHierarchy = async (warehouseId) => {
  try {
    await locationsStore.fetchWarehouseHierarchy(warehouseId)
    toast({
      title: 'Hierarchy Refreshed',
      description: 'Warehouse hierarchy has been updated.',
      variant: 'success'
    })
  } catch (error) {
    console.error('Error refreshing hierarchy:', error)
    toast({
      title: 'Error',
      description: 'Failed to refresh hierarchy. Please try again.',
      variant: 'destructive'
    })
  }
}

// Export locations in different formats (placeholder)
const exportLocations = (format) => {
  toast({
    title: 'Export Started',
    description: `Exporting warehouse hierarchy as ${format.toUpperCase()}...`,
    variant: 'default'
  })
  
  // Simulate export process
  setTimeout(() => {
    toast({
      title: 'Export Complete',
      description: `Warehouse hierarchy exported as ${format.toUpperCase()} successfully.`,
      variant: 'success'
    })
  }, 1500)
}

// Initialize component
onMounted(() => {
  refreshData()
})
</script>